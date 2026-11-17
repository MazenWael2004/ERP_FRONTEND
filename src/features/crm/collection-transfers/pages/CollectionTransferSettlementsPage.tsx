import { useEffect, useMemo, useState } from 'react';
import { api } from 'src/shared/api/axios';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Textarea } from 'src/components/ui/textarea';
import { CheckCircle2, Eye, RefreshCw, Search, X, XCircle } from 'lucide-react';
import { Checkbox } from 'src/components/ui/checkbox';
import { Input } from 'src/components/ui/input';
const money = (v: any) =>
  `${Number(v || 0).toLocaleString('ar-EG', { maximumFractionDigits: 2 })} ج.م`;
const moneyEnglish = (v: any) =>
  `${Number(v || 0).toLocaleString('en-GB', { maximumFractionDigits: 2 })} ج.م`;
const date = (v: string) =>
  v
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Cairo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(v))
    : '—';
const text = (value: unknown) =>
  value === null || value === undefined || value === '' ? '—' : String(value);
const person = (row: any, prefix: string) =>
  text(row[`${prefix}_name_ar`] || row[`${prefix}_name_en`] || row[`${prefix}_username`]);
export default function CollectionTransferSettlementsPage() {
  const [rows, setRows] = useState<any[]>([]),
    [receiptRows, setReceiptRows] = useState<any[]>([]),
    [selected, setSelected] = useState<any>(null),
    [detail, setDetail] = useState<any>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [reason, setReason] = useState(''),
    [action, setAction] = useState<'SETTLE' | 'REJECT' | null>(null),
    [selectedReceiptIds, setSelectedReceiptIds] = useState<Set<number>>(new Set()),
    [settlingReceipts, setSettlingReceipts] = useState(false),
    [confirmReceiptSettlement, setConfirmReceiptSettlement] = useState(false),
    [filters, setFilters] = useState({
      search: '',
      receiptNumber: '',
      transferNumber: '',
      customerName: '',
      collectorName: '',
      transferMethod: '',
      fromDate: '',
      toDate: '',
    }),
    [error, setError] = useState('');
  const load = async (requestedFilters = filters) => {
    setLoading(true);
    try {
      const [transferResponse, receiptResponse] = await Promise.all([
        api.get('/collection-transfers/pending'),
        api.get('/collection-transfers/pending-receipts', {
          params: { ...requestedFilters, page: 1, pageSize: 250 },
        }),
      ]);
      setRows(transferResponse.data?.data || []);
      const nextReceiptRows = receiptResponse.data?.data?.rows || [];
      setReceiptRows(nextReceiptRows);
      setSelectedReceiptIds(
        (current) =>
          new Set(
            [...current].filter((id) =>
              nextReceiptRows.some((row: any) => Number(row.collection_id) === id),
            ),
          ),
      );
    } catch (e: any) {
      setError(e?.response?.data?.message || 'تعذر تحميل التوريدات المعلقة.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const summary = useMemo(
    () => ({
      count: rows.length,
      total: rows.reduce((s, r) => s + Number(r.total_amount || 0), 0),
    }),
    [rows],
  );
  const selectedReceipts = useMemo(
    () => receiptRows.filter((row) => selectedReceiptIds.has(Number(row.collection_id))),
    [receiptRows, selectedReceiptIds],
  );
  const selectedReceiptsTotal = useMemo(
    () => selectedReceipts.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    [selectedReceipts],
  );
  const allVisibleReceiptsSelected =
    receiptRows.length > 0 &&
    receiptRows.every((row) => selectedReceiptIds.has(Number(row.collection_id)));
  const toggleReceipt = (collectionId: number, checked: boolean) =>
    setSelectedReceiptIds((current) => {
      const next = new Set(current);
      if (checked) next.add(collectionId);
      else next.delete(collectionId);
      return next;
    });
  const toggleAllReceipts = (checked: boolean) =>
    setSelectedReceiptIds((current) => {
      const next = new Set(current);
      receiptRows.forEach((row) =>
        checked ? next.add(Number(row.collection_id)) : next.delete(Number(row.collection_id)),
      );
      return next;
    });
  const settleSelectedReceipts = async () => {
    if (!selectedReceiptIds.size) return;
    setSettlingReceipts(true);
    try {
      await api.post('/collection-transfers/settle-receipts', {
        collectionIds: [...selectedReceiptIds],
      });
      setSelectedReceiptIds(new Set());
      setConfirmReceiptSettlement(false);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'تعذر تسوية الإيصالات المختارة.');
    } finally {
      setSettlingReceipts(false);
    }
  };
  const open = async (row: any) => {
    try {
      const r = await api.get(`/collection-transfers/${row.id}`);
      setSelected(row);
      setDetail(r.data?.data);
    } catch {
      setError('تعذر تحميل تفاصيل التوريدة.');
    }
  };
  const execute = async () => {
    if (!selected || !action) return;
    if (action === 'REJECT' && !reason.trim()) {
      setError('سبب الرفض مطلوب.');
      return;
    }
    setBusy(true);
    try {
      await api.post(
        `/collection-transfers/${selected.id}/${action === 'SETTLE' ? 'settle' : 'reject'}`,
        action === 'REJECT' ? { reason } : {},
      );
      setAction(null);
      setDetail(null);
      setSelected(null);
      setReason('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'تعذر تنفيذ الإجراء.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div dir="rtl" className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">مراجعة وتسوية الايصالات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            راجع الإيصالات ثم سوِّ التوريدة كاملة أو ارفضها مع توثيق السبب.
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()}>
          <RefreshCw className="ml-2 h-4 w-4" />
          تحديث
        </Button>
      </div>
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['توريدات بانتظار التسوية', summary.count],
          ['إجمالي المبالغ الموردة', money(summary.total)],
        ].map(([l, v]) => (
          <Card key={String(l)}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{l}</p>
              <p className="mt-2 text-xl font-bold">{v}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>بحث وتصفية الإيصالات</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1 text-sm xl:col-span-2">
            <span>بحث عام</span>
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pr-9"
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                placeholder="الإيصال، التوريدة، العميل، العقد أو المحصل"
              />
            </div>
          </label>
          <label className="grid gap-1 text-sm">
            <span>رقم الإيصال</span>
            <Input
              value={filters.receiptNumber}
              onChange={(event) => setFilters({ ...filters, receiptNumber: event.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>رقم التوريدة</span>
            <Input
              value={filters.transferNumber}
              onChange={(event) => setFilters({ ...filters, transferNumber: event.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>اسم العميل</span>
            <Input
              value={filters.customerName}
              onChange={(event) => setFilters({ ...filters, customerName: event.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>المحصّل</span>
            <Input
              value={filters.collectorName}
              onChange={(event) => setFilters({ ...filters, collectorName: event.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>طريقة التوريد</span>
            <select
              className="h-10 rounded-md border border-input bg-background px-3"
              value={filters.transferMethod}
              onChange={(event) => setFilters({ ...filters, transferMethod: event.target.value })}
            >
              <option value="">كل الطرق</option>
              <option value="CASH">نقدي</option>
              <option value="BANK_TRANSFER">تحويل بنكي</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span>من تاريخ التحصيل</span>
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(event) => setFilters({ ...filters, fromDate: event.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>إلى تاريخ التحصيل</span>
            <Input
              type="date"
              value={filters.toDate}
              onChange={(event) => setFilters({ ...filters, toDate: event.target.value })}
            />
          </label>
          <div className="flex items-end gap-2 xl:col-span-4">
            <Button onClick={() => void load()} disabled={loading}>
              <Search className="ml-2 h-4 w-4" />
              تطبيق الفلاتر
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const reset = {
                  search: '',
                  receiptNumber: '',
                  transferNumber: '',
                  customerName: '',
                  collectorName: '',
                  transferMethod: '',
                  fromDate: '',
                  toDate: '',
                };
                setFilters(reset);
                void load(reset);
              }}
            >
              <X className="ml-2 h-4 w-4" />
              إعادة تعيين
            </Button>
            <Button
              className="mr-auto"
              disabled={!selectedReceiptIds.size || settlingReceipts}
              onClick={() => setConfirmReceiptSettlement(true)}
            >
              <CheckCircle2 className="ml-2 h-4 w-4" />
              تسوية المختار ({selectedReceipts.length})
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>الإيصالات الموردة الجاهزة للتسوية ({receiptRows.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[2700px] text-right text-sm">
            <thead className="border-y bg-muted text-muted-foreground">
              <tr>
                <th className="p-3">
                  <Checkbox
                    checked={allVisibleReceiptsSelected}
                    onCheckedChange={(checked) => toggleAllReceipts(checked === true)}
                  />
                </th>
                {[
                  'رقم الايصال',
                  'تاريخ التحصيل',
                  'اسم العميل',
                  'كود العميل',
                  'الفرع',
                  'المبلغ',
                  'طريقة الدفع',
                  'بنك التحصيل',
                  'رقم المرجع للتحصيل',
                  'تاريخ الحوالة',
                  'رقم الشيك',
                  'استحقاق الشيك',
                  'تاريخ المعاملة',
                  'سبب التحصيل',
                  'ملاحظات التحصيل',
                  'المحصّل',
                  'المشرف',
                  'المدير',
                  'رقم التوريد',
                  'طريقة التوريد',
                  'رقم الإذن',
                  'تاريخ التوريد',
                  'بنك التوريد',
                  'رقم الحوالة/المرجع للتوريد',
                ].map((header) => (
                  <th key={header} className="whitespace-nowrap px-3 py-3">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {receiptRows.map((row) => (
                <tr key={row.collection_id} className="border-b align-top hover:bg-muted/30">
                  <td className="p-3">
                    <Checkbox
                      checked={selectedReceiptIds.has(Number(row.collection_id))}
                      onCheckedChange={(checked) =>
                        toggleReceipt(Number(row.collection_id), checked === true)
                      }
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{text(row.receipt_number)}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {date(row.cash_in_at || row.collected_at)}
                  </td>
                  <td className="px-3 py-3">
                    {text(row.customer_name_ar || row.customer_name_en)}
                  </td>
                  <td className="px-3 py-3">{text(row.contract_id)}</td>
                  <td className="px-3 py-3">{text(row.zone_name_ar || row.zone_name_en)}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-semibold">{moneyEnglish(row.amount)}</td>
                  <td className="px-3 py-3">
                    {text(
                      row.payment_method_name_ar ||
                        row.payment_method_name_en ||
                        row.payment_method_code,
                    )}
                  </td>
                  <td className="px-3 py-3">{text(row.cash_in_bank_name)}</td>
                  <td className="px-3 py-3">{text(row.cash_in_reference_number)}</td>
                  <td className="whitespace-nowrap px-3 py-3">{date(row.cash_in_transfer_date)}</td>
                  <td className="px-3 py-3">{text(row.cheque_number)}</td>
                  <td className="whitespace-nowrap px-3 py-3">{date(row.cheque_due_date)}</td>
                  <td className="whitespace-nowrap px-3 py-3">{date(row.transaction_date)}</td>
                  <td className="px-3 py-3">{text(row.collection_reason)}</td>
                  <td className="max-w-[220px] whitespace-normal px-3 py-3">
                    {text(row.collection_notes)}
                  </td>
                  <td className="px-3 py-3">{person(row, 'collector')}</td>
                  <td className="px-3 py-3">{person(row, 'supervisor')}</td>
                  <td className="px-3 py-3">{person(row, 'manager')}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-medium">
                    {text(row.transfer_number)}
                  </td>
                  <td className="px-3 py-3">
                    {row.transfer_method === 'BANK_TRANSFER' ? 'تحويل بنكي' : 'نقدي'}
                  </td>
                  <td className="px-3 py-3">{text(row.cash_voucher_number)}</td>
                  <td className="whitespace-nowrap px-3 py-3">{date(row.submitted_at)}</td>
                  <td className="px-3 py-3">{text(row.transfer_bank_name)}</td>
                  <td className="px-3 py-3">{text(row.transfer_reference_number)}</td>
                </tr>
              ))}
              {!loading && !receiptRows.length && (
                <tr>
                  <td colSpan={26} className="p-10 text-center text-muted-foreground">
                    لا توجد إيصالات موردة جاهزة للتسوية.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {/* <Card>
        <CardHeader>
          <CardTitle>التوريدات المرسلة للمالية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-right text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="p-3">رقم التوريد</th>
                  <th>المسئول عن التوريد</th>
                  <th>طريقة التوريد</th>
                  <th>تاريخ التوريد</th>
                  <th>عدد التحصيلات</th>
                  <th>الإجمالي</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="p-3 font-medium">{row.transfer_number}</td>
                    <td>{row.representative_name}</td>
                    <td>{row.transfer_method === 'BANK_TRANSFER' ? 'تحويل بنكي' : 'نقدي'}</td>
                    <td>{date(row.submitted_at)}</td>
                    <td>{row.collection_count}</td>
                    <td className="font-semibold">{money(row.total_amount)}</td>
                    <td>تم التوريد</td>
                    <td>
                      <Button size="sm" variant="outline" onClick={() => void open(row)}>
                        <Eye className="ml-1 h-4 w-4" />
                        مراجعة
                      </Button>
                    </td>
                  </tr>
                ))}
                {!loading && !rows.length && (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-muted-foreground">
                      لا توجد توريدات بانتظار التسوية.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card> */}
      <Dialog open={Boolean(detail)} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>تفاصيل التوريدة {detail?.transfer?.transfer_number}</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg bg-muted p-3 text-sm">
            المندوب: {detail?.transfer?.representative_name} — طريقة التوريد:{' '}
            {detail?.transfer?.transfer_method === 'BANK_TRANSFER' ? 'تحويل بنكي' : 'نقدي'} —
            إجمالي: <strong>{money(detail?.transfer?.total_amount)}</strong>
            {detail?.transfer?.transfer_method === 'BANK_TRANSFER' && (
              <div className="mt-2 space-y-1 border-t pt-2">
                <div>تاريخ الحوالة: {date(detail?.transfer?.transfer_date)}</div>
                <div>البنك: {detail?.transfer?.bank_name || '—'}</div>
                <div>الرقم المرجعي: {detail?.transfer?.reference_number || '—'}</div>
              </div>
            )}
          </div>
          <table className="w-full text-right text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="p-2">الإيصال</th>
                <th>العميل</th>
                <th>العقد</th>
                <th>الدفع</th>
                <th>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {detail?.lines
                ?.filter((line: any) => line.is_active)
                .map((line: any) => (
                  <tr className="border-b" key={line.line_id}>
                    <td className="p-2">{line.receipt_number}</td>
                    <td>{line.customer_name}</td>
                    <td>#{line.contract_id}</td>
                    <td>{line.payment_method_name}</td>
                    <td>{money(line.amount_snapshot)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <DialogFooter>
            <Button variant="destructive" onClick={() => setAction('REJECT')}>
              <XCircle className="ml-2 h-4 w-4" />
              رفض التوريدة
            </Button>
            <Button onClick={() => setAction('SETTLE')}>
              <CheckCircle2 className="ml-2 h-4 w-4" />
              تسوية التوريدة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(action)} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {action === 'SETTLE' ? 'تأكيد تسوية التوريدة' : 'رفض التوريدة'}
            </DialogTitle>
          </DialogHeader>
          {action === 'REJECT' ? (
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="سبب الرفض (مطلوب)"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              سيتم تسوية التوريدة كاملة. لا يمكن التراجع عن التسوية.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              إلغاء
            </Button>
            <Button
              disabled={busy}
              variant={action === 'REJECT' ? 'destructive' : 'default'}
              onClick={() => void execute()}
            >
              {action === 'REJECT' ? 'تأكيد الرفض' : 'تأكيد التسوية'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmReceiptSettlement} onOpenChange={setConfirmReceiptSettlement}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد تسوية الإيصالات المختارة</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            سيتم تسوية {selectedReceipts.length} إيصال بإجمالي{' '}
            <strong>{money(selectedReceiptsTotal)}</strong>. الإيصالات غير المختارة ستبقى جاهزة
            للتسوية لاحقاً.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmReceiptSettlement(false)}
              disabled={settlingReceipts}
            >
              إلغاء
            </Button>
            <Button onClick={() => void settleSelectedReceipts()} disabled={settlingReceipts}>
              {settlingReceipts ? 'جارٍ التسوية...' : 'تأكيد التسوية'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

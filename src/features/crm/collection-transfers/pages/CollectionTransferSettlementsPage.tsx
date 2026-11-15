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
import { CheckCircle2, Eye, RefreshCw, XCircle } from 'lucide-react';
const money = (v: any) =>
  `${Number(v || 0).toLocaleString('ar-EG', { maximumFractionDigits: 2 })} ج.م`;
const date = (v: string) =>
  v ? new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(new Date(v)) : '—';
export default function CollectionTransferSettlementsPage() {
  const [rows, setRows] = useState<any[]>([]),
    [selected, setSelected] = useState<any>(null),
    [detail, setDetail] = useState<any>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [reason, setReason] = useState(''),
    [action, setAction] = useState<'SETTLE' | 'REJECT' | null>(null),
    [error, setError] = useState('');
  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/collection-transfers/pending');
      setRows(r.data?.data || []);
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
          <h1 className="text-2xl font-bold">مراجعة وتسوية التوريدات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            راجع الإيصالات ثم سوِّ التوريدة كاملة أو ارفضها مع توثيق السبب.
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
      </Card>
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
    </div>
  );
}

import { useEffect, useState } from 'react';
import { api } from 'src/shared/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Input } from 'src/components/ui/input';
const money = (value: unknown) =>
  `${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`;
const date = (value: unknown) =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Africa/Cairo',
      }).format(new Date(String(value)))
    : '—';
const labels: Record<string, string> = {
  CREATED: 'إنشاء تحصيل',
  AMOUNT_EDITED: 'تعديل مبلغ',
  PAYMENT_METHOD_CHANGED: 'تعديل طريقة دفع',
  ALLOCATION_CHANGED: 'تعديل توزيع',
  CANCELLED: 'إلغاء',
  RESTORED: 'استعادة',
  REMITTED: 'توريد قديم',
  SUBMIT: 'تسليم للمالية',
  SETTLE: 'تسوية مالية',
  REJECT: 'رفض من المالية',
};
const statuses: Record<string, string> = {
  COLLECTED: 'تم التحصيل',
  TRANSFERRED: 'تم التوريد',
  SETTLED: 'تمت التسوية',
  REJECTED: 'مرفوض',
};
const methodLabel = (method?: string | null) =>
  method === 'BANK_TRANSFER' ? 'تحويل بنكي' : method === 'CASH' ? 'نقدي' : method || '—';

export default function FinancialHistoryPage() {
  const [summary, setSummary] = useState<any>({});
  const [rows, setRows] = useState<any[]>([]);
  const [contractId, setContractId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        ...(contractId ? { contractId } : {}),
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
      };
      const [s, h] = await Promise.all([
        api.get('/financial-history/summary'),
        api.get('/financial-history', { params: filters }),
      ]);
      setSummary(s.data?.data || {});
      setRows(h.data?.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'تعذر تحميل سجل المراجعة المالي.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const headers = [
    'التاريخ',
    'الإجراء',
    'الحالة',
    'رقم التوريدة',
    'رقم الإيصال',
    'اسم العميل',
    'كود العميل',
    'المبلغ',
    'عدد الإيصالات',
    'طريقة التحويل',
    'البنك',
    'المرجع البنكي',
    'تاريخ التحويل',
    'أُجري بواسطة',
    'سبب/ملاحظات',
  ];
  return (
    <div dir="rtl" className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">سجل المراجعة المالية</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          سجل غير قابل للتعديل يوضح كل تحصيل وتحويل ومراجعة وتسوية مالية.
        </p>
      </div>
      {/* <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['إجمالي المستحقات', summary.total_due],
          ['إجمالي التحصيلات', summary.total_collected],
          ['إجمالي المسوّى', summary.total_remitted],
          ['إجمالي المديونية المتبقية', summary.total_outstanding],
          ['عهدة المندوبين', summary.representative_custody],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p dir="ltr" className="mt-2 text-xl font-bold">
                {money(value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div> */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle>تفاصيل المراجعة</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input
              value={contractId}
              onChange={(event) => setContractId(event.target.value.replace(/\D/g, ''))}
              placeholder="كود العميل"
              className="w-32"
              dir="ltr"
            />
            <label className="flex items-center gap-2 text-sm whitespace-nowrap">
              <span>من تاريخ</span>
              <Input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-40"
                dir="ltr"
              />
            </label>
            <label className="flex items-center gap-2 text-sm whitespace-nowrap">
              <span>إلى تاريخ</span>
              <Input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-40"
                dir="ltr"
              />
            </label>
            <button
              onClick={() => void load()}
              className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
            >
              بحث
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[2050px] text-right text-sm">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="whitespace-nowrap p-3 font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.audit_source}-${row.id}-${row.receipt_number || ''}`} className="border-b align-top">
                    <td className="whitespace-nowrap p-3" dir="ltr">
                      {date(row.event_at)}
                    </td>
                    <td className="whitespace-nowrap p-3">
                      {labels[row.transaction_type] || row.transaction_type}
                    </td>
                    <td className="whitespace-nowrap p-3">
                      {row.old_status ? `${statuses[row.old_status] || row.old_status} ← ` : ''}
                      {statuses[row.new_status] || row.new_status || '—'}
                    </td>
                    <td className="whitespace-nowrap p-3" dir="ltr">
                      {row.transfer_number || '—'}
                    </td>
                    <td className="whitespace-nowrap p-3" dir="ltr">
                      {row.receipt_number || '—'}
                    </td>
                    <td className="p-3">{row.customer_name || '—'}</td>
                    <td className="whitespace-nowrap p-3" dir="ltr">
                      {row.contract_id ? `${row.contract_id}` : '—'}
                    </td>
                    <td className="whitespace-nowrap p-3 font-semibold" dir="ltr">
                      {row.amount == null ? '—' : money(row.amount)}
                    </td>
                    <td className="whitespace-nowrap p-3" dir="ltr">
                      {row.collection_count ?? '—'}
                    </td>
                    <td className="whitespace-nowrap p-3">{methodLabel(row.transfer_method)}</td>
                    <td className="p-3">{row.bank_name || '—'}</td>
                    <td className="whitespace-nowrap p-3" dir="ltr">
                      {row.reference_number || '—'}
                    </td>
                    <td className="whitespace-nowrap p-3" dir="ltr">
                      {date(row.transfer_date)}
                    </td>
                    {/* <td className="p-3">{row.representative_name || '—'}</td> */}
                    <td className="p-3">{row.performed_by_name || '—'}</td>
                    <td className="max-w-72 whitespace-pre-wrap p-3">{row.reason || '—'}</td>
                  </tr>
                ))}
                {!loading && !rows.length && (
                  <tr>
                    <td colSpan={16} className="p-10 text-center text-muted-foreground">
                      لا توجد حركات مالية مطابقة.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

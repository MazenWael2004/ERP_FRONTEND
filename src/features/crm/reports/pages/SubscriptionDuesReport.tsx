import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, CalendarClock, Download, FileText, RefreshCw, WalletCards } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Input } from 'src/components/ui/input';
import { fetchSubscriptionDuesReport } from '../api/reportsService';
import { excelDate } from '../excelDate';

const money = (value: unknown) => `${Number(value || 0).toLocaleString('en-GB', { maximumFractionDigits: 2 })} ج.م`;
const date = (value: unknown) => value ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo' }).format(new Date(String(value))) : '—';
const text = (value: unknown) => value === null || value === undefined || value === '' ? '—' : String(value);

const columns = [
  { header: 'شهر الاستحقاق', value: (row: any) => date(row.billing_month) },
  { header: 'رقم العقد', value: (row: any) => text(row.contract_id) },
  { header: 'كود العميل', value: (row: any) => text(row.customer_code) },
  { header: 'اسم العميل', value: (row: any) => text(row.customer_name_ar || row.customer_name) },
  { header: 'الفرع', value: (row: any) => text(row.zone_name_ar || row.zone_name) },
  { header: 'مسؤول التحصيل', value: (row: any) => text(row.representative_name_ar || row.representative_name) },
  { header: 'المستحق', value: (row: any) => money(row.due_amount) },
  { header: 'المحصل', value: (row: any) => money(row.paid_amount) },
  { header: 'المتبقي', value: (row: any) => money(row.outstanding_amount) },
  { header: 'أيام التأخير', value: (row: any) => Number(row.overdue_days || 0).toLocaleString('en-US') },
];

export default function SubscriptionDuesReport() {
  const today = new Date().toISOString().slice(0, 10);
  const [filters, setFilters] = useState({ startDate: '', endDate: today });
  const [data, setData] = useState<any>({ rows: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (requestedFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      setData(await fetchSubscriptionDuesReport(requestedFilters.startDate || undefined, requestedFilters.endDate || undefined));
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'تعذر تحميل تقرير الاشتراكات المستحقة.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const rows = data?.rows || [];
  const summary = data?.summary || {};
  const reset = () => {
    const next = { startDate: '', endDate: today };
    setFilters(next);
    void load(next);
  };
  const exportToExcel = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['تقرير الاشتراكات المستحقة'],
      ['من شهر الاستحقاق', filters.startDate ? excelDate(filters.startDate) : 'كل الشهور السابقة'],
      ['إلى شهر الاستحقاق', filters.endDate ? excelDate(filters.endDate) : 'كل الشهور'],
      [],
      columns.map((column) => column.header),
      ...rows.map((row: any) => columns.map((column, index) => index === 0 ? excelDate(row.billing_month) : column.value(row))),
    ]);
    worksheet['!cols'] = columns.map((column) => ({ wch: Math.max(column.header.length + 5, 16) }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'اشتراكات مستحقة');
    XLSX.writeFile(workbook, `subscription-dues-${today}.xlsx`);
  };

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div>
        <h1 className="text-2xl font-bold">تقرير الاشتراكات المستحقة</h1>
        <p className="mt-1 text-sm text-muted-foreground">كل شهر اشتراك غير محصل أو محصل جزئيًا، اعتمادًا على الفواتير والتحصيلات الفعلية.</p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <label className="grid gap-1 text-sm"><span>من شهر الاستحقاق</span><Input dir="ltr" type="date" value={filters.startDate} onChange={(event) => setFilters({ ...filters, startDate: event.target.value })} /></label>
          <label className="grid gap-1 text-sm"><span>إلى شهر الاستحقاق</span><Input dir="ltr" type="date" value={filters.endDate} onChange={(event) => setFilters({ ...filters, endDate: event.target.value })} /></label>
          <Button onClick={() => void load()} disabled={loading}><RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />تطبيق الفلاتر</Button>
          <Button variant="outline" onClick={reset} disabled={loading}>إعادة تعيين</Button>
          <Button className="mr-auto" variant="outline" onClick={exportToExcel} disabled={loading || !rows.length}><Download className="ml-2 h-4 w-4" />تصدير Excel</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="العقود المستحقة" value={summary.contract_count} icon={<FileText />} />
        <Metric label="شهور الاشتراك المستحقة" value={summary.period_count} icon={<CalendarClock />} />
        <Metric label="إجمالي المتبقي" value={money(summary.total_outstanding)} icon={<WalletCards />} />
        <Metric label="قيمة المتأخرات" value={money(summary.overdue_amount)} helper={`${Number(summary.overdue_period_count || 0).toLocaleString('en-US')} شهر متأخر`} icon={<AlertTriangle />} />
      </div>

      <Card className="overflow-hidden">
        <CardHeader><CardTitle>تفاصيل الاشتراكات المستحقة ({rows.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {error ? <p className="p-6 text-destructive">{error}</p> : loading ? <p className="p-6 text-muted-foreground">جارٍ تحميل التقرير...</p> : <table className="w-full min-w-[1600px] text-sm"><thead className="bg-muted"><tr>{columns.map((column) => <th key={column.header} className="whitespace-nowrap px-4 py-3 text-right font-semibold">{column.header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row: any) => <tr key={row.subscription_period_id} className="border-t align-top">{columns.map((column) => <td key={column.header} className="whitespace-nowrap px-4 py-3">{column.value(row)}</td>)}</tr>) : <tr><td colSpan={columns.length} className="p-8 text-center text-muted-foreground">لا توجد اشتراكات مستحقة ضمن الفترة المحددة.</td></tr>}</tbody></table>}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, helper, icon }: { label: string; value: string | number | undefined; helper?: string; icon: ReactNode }) {
  return <Card><CardContent className="flex items-start justify-between gap-3 p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{value ?? 0}</p>{helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}</div><div className="rounded-xl bg-muted p-2 text-primary">{icon}</div></CardContent></Card>;
}

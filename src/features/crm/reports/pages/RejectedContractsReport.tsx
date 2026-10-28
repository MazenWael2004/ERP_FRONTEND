import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Ban, Download, RefreshCw, Search, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Input } from 'src/components/ui/input';
import { fetchRejectedContractsReport } from '../api/reportsService';

const date = (value?: string | null) =>
  value ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo' }).format(new Date(value)) : '—';
const dateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Cairo',
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(value))
    : '—';
const display = (value: unknown) =>
  value === null || value === undefined || value === '' ? '—' : String(value);
const bilingual = (ar?: string | null, en?: string | null) => display(ar || en);
const money = (value: unknown) => Number(value || 0).toLocaleString('en-GB', { maximumFractionDigits: 2 });

function formatDateInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}

function parseDateInput(value: string) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return '';
  const [, day, month, year] = match;
  const candidate = new Date(Number(year), Number(month) - 1, Number(day));
  if (candidate.getFullYear() !== Number(year) || candidate.getMonth() !== Number(month) - 1 || candidate.getDate() !== Number(day)) return '';
  return `${year}-${month}-${day}`;
}

function DateFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [text, setText] = useState(() => formatDateInput(value));
  useEffect(() => setText(formatDateInput(value)), [value]);
  return (
    <Input
      type="text"
      dir="ltr"
      lang="en-GB"
      inputMode="numeric"
      autoComplete="off"
      placeholder="DD/MM/YYYY"
      value={text}
      onChange={(event) => {
        const next = event.target.value.replace(/[^0-9/]/g, '').slice(0, 10);
        setText(next);
        if (!next) onChange('');
        const iso = parseDateInput(next);
        if (iso) onChange(iso);
      }}
      onBlur={() => {
        const iso = parseDateInput(text);
        if (iso) setText(formatDateInput(iso));
      }}
    />
  );
}

const columns = [
  { header: 'رقم العقد', value: (row: any) => display(row.contract_id) },
  { header: 'تاريخ العقد', value: (row: any) => date(row.contract_date) },
  { header: 'تاريخ الرفض', value: (row: any) => dateTime(row.rejected_at) },
  { header: 'رقم العميل', value: (row: any) => display(row.customer_id) },
  { header: 'كود العميل', value: (row: any) => display(row.customer_code) },
  { header: 'اسم العميل', value: (row: any) => bilingual(row.customer_name_ar, row.customer_name_en) },
  { header: 'العميل / الصيدلية الرئيسية', value: (row: any) => bilingual(row.parent_customer_name_ar, row.parent_customer_name_en) },
  { header: 'هاتف العميل', value: (row: any) => display(row.customer_phone) },
  { header: 'البرنامج', value: (row: any) => bilingual(row.program_name_ar, row.program_name_en) },
  { header: 'الخطة', value: (row: any) => bilingual(row.plan_name_ar, row.plan_name_en) },
  { header: 'المنطقة', value: (row: any) => bilingual(row.zone_name_ar, row.zone_name_en) },
  { header: 'كود المنطقة', value: (row: any) => display(row.zone_code) },
  { header: 'مدير الرفض', value: (row: any) => display(row.manager_name_ar || row.manager_name_en || row.manager_username) },
  { header: 'سبب الرفض', value: (row: any) => display(row.rejection_reason) },
  { header: 'ملاحظات مرحلة الانتظار', value: (row: any) => display(row.pending_notes) },
  { header: 'ملاحظات العقد', value: (row: any) => display(row.contract_notes) },
  { header: 'قيمة العقد', value: (row: any) => money(row.total_after_discount) },
];

export default function RejectedContractsReport() {
  const [filters, setFilters] = useState({ search: '', zoneId: '', managerId: '', startDate: '', endDate: '' });
  const [data, setData] = useState<any>({ rows: [], summary: {} });
  const [filterRows, setFilterRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (requestedFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchRejectedContractsReport(requestedFilters);
      setData(result || { rows: [], summary: {} });
      setFilterRows((current) => (current.length ? current : result?.rows || []));
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'تعذر تحميل تقرير العقود المرفوضة.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const rows = data?.rows || [];
  const summary = data?.summary || {};
  const zones = useMemo(
    () => Array.from(new Map(filterRows.filter((row) => row.zone_id).map((row) => [row.zone_id, row])).values()),
    [filterRows],
  );
  const managers = useMemo(
    () => Array.from(new Map(filterRows.filter((row) => row.manager_id).map((row) => [row.manager_id, row])).values()),
    [filterRows],
  );
  const reset = () => {
    const empty = { search: '', zoneId: '', managerId: '', startDate: '', endDate: '' };
    setFilters(empty);
    void load(empty);
  };
  const exportToExcel = () => {
    const sheet = XLSX.utils.aoa_to_sheet([
      ['تقرير العقود المرفوضة'],
      [],
      columns.map((column) => column.header),
      ...rows.map((row: any) => columns.map((column) => column.value(row))),
    ]);
    sheet['!cols'] = columns.map((column) => ({ wch: Math.max(column.header.length + 5, 16) }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'العقود المرفوضة');
    XLSX.writeFile(workbook, `rejected-contracts-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div>
        <h1 className="text-2xl font-bold">تقرير العقود المرفوضة</h1>
        <p className="mt-1 text-sm text-muted-foreground">متابعة أسباب الرفض ومدير الدعم والمنطقة والعميل لكل عقد مرفوض.</p>
      </div>
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-6">
          <label className="grid gap-1 text-sm xl:col-span-2"><span>بحث</span><div className="relative"><Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} className="pr-9" placeholder="رقم العقد، العميل، الكود أو سبب الرفض" /></div></label>
          <label className="grid gap-1 text-sm"><span>المنطقة</span><select className="h-10 rounded-md border bg-background px-3" value={filters.zoneId} onChange={(event) => setFilters({ ...filters, zoneId: event.target.value })}><option value="">كل المناطق</option>{zones.map((row: any) => <option key={row.zone_id} value={row.zone_id}>{bilingual(row.zone_name_ar, row.zone_name_en)}</option>)}</select></label>
          <label className="grid gap-1 text-sm"><span>مدير الرفض</span><select className="h-10 rounded-md border bg-background px-3" value={filters.managerId} onChange={(event) => setFilters({ ...filters, managerId: event.target.value })}><option value="">كل المدراء</option>{managers.map((row: any) => <option key={row.manager_id} value={row.manager_id}>{row.manager_name_ar || row.manager_name_en || row.manager_username}</option>)}</select></label>
          <label className="grid gap-1 text-sm"><span>من تاريخ الرفض</span><DateFilter value={filters.startDate} onChange={(startDate) => setFilters({ ...filters, startDate })} /></label>
          <label className="grid gap-1 text-sm"><span>إلى تاريخ الرفض</span><DateFilter value={filters.endDate} onChange={(endDate) => setFilters({ ...filters, endDate })} /></label>
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-6"><Button onClick={() => void load()} disabled={loading}><RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />تطبيق الفلاتر</Button><Button variant="outline" onClick={reset} disabled={loading}>إعادة تعيين</Button><Button className="mr-auto" variant="outline" onClick={exportToExcel} disabled={!rows.length || loading}><Download className="ml-2 h-4 w-4" />تصدير Excel</Button></div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="العقود المرفوضة" value={summary.rejected_contract_count} icon={<Ban />} />
        <Metric label="العملاء المتأثرون" value={summary.customer_count} icon={<Users />} />
        <Metric label="قيمة العقود" value={`${money(summary.total_contract_value)} جنيه`} icon={<Ban />} />
      </div>
      <Card className="overflow-hidden"><CardHeader><CardTitle>تفاصيل العقود المرفوضة ({rows.length})</CardTitle></CardHeader><CardContent className="overflow-x-auto p-0">{error ? <p className="p-6 text-destructive">{error}</p> : loading ? <p className="p-6 text-muted-foreground">جارٍ تحميل التقرير...</p> : <table className="w-full min-w-[2600px] text-sm"><thead className="bg-muted"><tr>{columns.map((column) => <th key={column.header} className="whitespace-nowrap px-4 py-3 text-right font-semibold">{column.header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row: any) => <tr key={row.contract_id} className="border-t align-top">{columns.map((column) => <td key={column.header} className="max-w-xs whitespace-nowrap px-4 py-3">{column.value(row)}</td>)}</tr>) : <tr><td colSpan={columns.length} className="p-8 text-center text-muted-foreground">لا توجد عقود مرفوضة مطابقة للفلاتر.</td></tr>}</tbody></table>}</CardContent></Card>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string | number | undefined; icon: ReactNode }) {
  return <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{value ?? 0}</p></div><div className="text-primary">{icon}</div></CardContent></Card>;
}

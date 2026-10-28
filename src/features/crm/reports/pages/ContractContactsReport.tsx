import { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, Search, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Input } from 'src/components/ui/input';
import { fetchContractContactsReport } from '../api/reportsService';

const workflowLabels: Record<string, string> = {
  UNDER_CHECKING: 'تحت المراجعة', PENDING: 'بانتظار قرار الدعم الفني',
  UNDER_INSTALLATION: 'تحت التركيب', INSTALLED: 'تم التركيب - بانتظار التأكيد',
  ACTIVATED: 'مفعل', REJECTED: 'مرفوض',
};
const contactTypeLabels: Record<string, string> = {
  OWNER: 'مالك', TENANT: 'مستأجر', MANAGER: 'مدير', ACCOUNTANT: 'محاسب', OTHER: 'أخرى',
};
const display = (input: unknown) => input === null || input === undefined || input === '' ? '—' : String(input);
const bilingual = (ar?: string | null, en?: string | null) => display(ar || en);
const date = (input?: string | null) => input
  ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo' }).format(new Date(input))
  : '—';

export default function ContractContactsReport() {
  const pageSize = 50;
  const [filters, setFilters] = useState({ search: '', zoneId: '', contactType: '', workflowStatus: '' });
  const [data, setData] = useState<any>({ rows: [], filters: {}, pagination: {} });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (requestedFilters = filters, requestedPage = page) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchContractContactsReport({ ...requestedFilters, page: requestedPage, pageSize });
      setData(result || { rows: [], filters: {}, pagination: {} });
      setPage(result?.pagination?.page || requestedPage);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'تعذر تحميل تقرير جهات الاتصال.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(filters, 1); }, []);

  const rows = data?.rows || [];
  const filterOptions = data?.filters || {};
  const rawPagination = data?.pagination || {};
  const pagination = {
    page: Number(rawPagination.page) || page,
    pageSize: Number(rawPagination.pageSize) || pageSize,
    totalCount: Number(rawPagination.totalCount) || 0,
    totalPages: Number(rawPagination.totalPages) || 0,
  };
  const firstVisibleRow = pagination.totalCount ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  const lastVisibleRow = Math.min(pagination.page * pagination.pageSize, pagination.totalCount);
  const uniqueCustomers = useMemo(() => new Set(rows.map((row: any) => row.customer_id)).size, [rows]);

  const exportToExcel = () => {
    const headers = ['كود العميل', 'كود العقد', 'العميل', 'العميل / الصيدلية الرئيسية', 'جهة الاتصال', 'الصفة', 'رقم الهاتف', 'الهاتف الأرضي', 'واتساب', 'البريد الإلكتروني', 'الرقم القومي', 'الفرع', 'حالة العقد', 'تاريخ العقد'];
    const exportRows = rows.map((row: any) => [
      row.customer_code || '', row.contract_id || '', row.customer_name_ar || row.customer_name_en || '', row.parent_customer_name_ar || row.parent_customer_name_en || '',
      row.contact_name_ar || row.contact_name_en || '', contactTypeLabels[row.contact_type] || row.contact_type || '',
      row.mobile_phone || '', row.landline_phone || '', row.whatsapp_phone || '',
      row.contact_email || '', row.contact_national_id || '',
      row.zone_name_ar || row.zone_name_en || '', workflowLabels[row.workflow_status] || row.workflow_status || '',
      row.contract_date ? String(row.contract_date).slice(0, 10) : '',
    ]);
    const sheet = XLSX.utils.aoa_to_sheet([['تقرير جهات اتصال العقود'], [], headers, ...exportRows]);
    sheet['!cols'] = headers.map((header) => ({ wch: Math.max(header.length + 5, 16) }));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'جهات الاتصال');
    XLSX.writeFile(book, `contract-contacts-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const reset = () => {
    const empty = { search: '', zoneId: '', contactType: '', workflowStatus: '' };
    setFilters(empty);
    void load(empty, 1);
  };

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div>
        <h1 className="text-2xl font-bold">تقرير جهات اتصال العقود</h1>
        <p className="mt-1 text-sm text-muted-foreground">قائمة منظمة بجهات الاتصال المرتبطة بكل عقد، مع بيانات العميل والمنطقة وحالة العقد.</p>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="grid gap-1 text-sm xl:col-span-2">
            <span>بحث</span>
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} onKeyDown={(event) => event.key === 'Enter' && void load(filters, 1)} className="pr-9" placeholder="العقد، كود العميل، جهة الاتصال، الهاتف أو البريد" />
            </div>
          </label>
          <FilterSelect label="المنطقة" value={filters.zoneId} onChange={(value) => setFilters({ ...filters, zoneId: value })} emptyLabel="كل المناطق" options={(filterOptions.zones || []).map((zone: any) => [zone.id, bilingual(zone.name_ar, zone.name_en)])} />
          <FilterSelect label="الصفة" value={filters.contactType} onChange={(value) => setFilters({ ...filters, contactType: value })} emptyLabel="كل الصفات" options={(filterOptions.contactTypes || []).map((type: string) => [type, contactTypeLabels[type] || type])} />
          <FilterSelect label="حالة العقد" value={filters.workflowStatus} onChange={(value) => setFilters({ ...filters, workflowStatus: value })} emptyLabel="كل الحالات" options={(filterOptions.workflowStatuses || []).map((status: string) => [status, workflowLabels[status] || status])} />
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-5">
            <Button onClick={() => void load(filters, 1)} disabled={loading}><RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> تطبيق</Button>
            <Button variant="outline" onClick={reset} disabled={loading}>إعادة تعيين</Button>
            <Button className="mr-auto" variant="outline" onClick={exportToExcel} disabled={loading || !rows.length}><Download className="ml-2 h-4 w-4" /> تصدير الصفحة الحالية</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard label="جهات الاتصال المطابقة" value={pagination.totalCount.toLocaleString('ar-EG')} />
        <SummaryCard label="عملاء الصفحة الحالية" value={uniqueCustomers.toLocaleString('ar-EG')} />
      </div>

      <Card className="overflow-hidden">

        <CardContent className="overflow-x-auto p-0">
          {error ? <p className="p-6 text-destructive">{error}</p> : loading ? <p className="p-6 text-muted-foreground">جارٍ تحميل جهات الاتصال...</p> : (
            <table className="w-full min-w-[1500px] text-sm">
              <thead className="bg-muted"><tr>{['كود العميل', 'تاريخ العقد', 'العميل', 'العميل / الصيدلية الرئيسية', 'جهة الاتصال', 'الصفة', 'رقم الهاتف', 'الهاتف الأرضي', 'واتساب', 'البريد الإلكتروني', 'الرقم القومي', 'الفرع', 'حالة العقد'].map((header) => <th key={header} className="whitespace-nowrap px-4 py-3 text-right font-semibold">{header}</th>)}</tr></thead>
              <tbody>{rows.length ? rows.map((row: any) => (
                <tr key={`${row.contract_id}-${row.contact_id}`} className="border-t align-top">
                  <td className="whitespace-nowrap px-4 py-3">{display(row.contract_id)}</td>
                  <td className="whitespace-nowrap px-4 py-3" dir="ltr">{date(row.contract_date)}</td>
                  <td className="max-w-xs whitespace-nowrap px-4 py-3">{bilingual(row.customer_name_ar, row.customer_name_en)}</td>
                  <td className="max-w-xs whitespace-nowrap px-4 py-3">{bilingual(row.parent_customer_name_ar, row.parent_customer_name_en)}</td>
                  <td className="max-w-xs whitespace-nowrap px-4 py-3">{bilingual(row.contact_name_ar, row.contact_name_en)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{contactTypeLabels[row.contact_type] || display(row.contact_type)}</td>
                  <td className="whitespace-nowrap px-4 py-3" dir="ltr">{display(row.mobile_phone)}</td>
                  <td className="whitespace-nowrap px-4 py-3" dir="ltr">{display(row.landline_phone)}</td>
                  <td className="whitespace-nowrap px-4 py-3" dir="ltr">{display(row.whatsapp_phone)}</td>
                  <td className="whitespace-nowrap px-4 py-3" dir="ltr">{display(row.contact_email)}</td>
                  <td className="whitespace-nowrap px-4 py-3" dir="ltr">{display(row.contact_national_id)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{bilingual(row.zone_name_ar, row.zone_name_en)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{workflowLabels[row.workflow_status] || display(row.workflow_status)}</td>
                  
                </tr>
              )) : <tr><td colSpan={13} className="p-8 text-center text-muted-foreground">لا توجد جهات اتصال مطابقة للفلاتر.</td></tr>}</tbody>
            </table>
          )}
          {!loading && !error && pagination.totalCount > 0 && (
            <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground">عرض {firstVisibleRow.toLocaleString('ar-EG')}–{lastVisibleRow.toLocaleString('ar-EG')} من {pagination.totalCount.toLocaleString('ar-EG')} جهة اتصال</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => void load(filters, pagination.page - 1)} disabled={pagination.page <= 1}>السابق</Button>
                <span className="min-w-24 text-center text-xs text-muted-foreground">صفحة {pagination.page.toLocaleString('ar-EG')} من {pagination.totalPages.toLocaleString('ar-EG')}</span>
                <Button size="sm" variant="outline" onClick={() => void load(filters, pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>التالي</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FilterSelect({ label, value, onChange, emptyLabel, options }: { label: string; value: string; onChange: (value: string) => void; emptyLabel: string; options: Array<[string | number, string]> }) {
  return <label className="grid gap-1 text-sm"><span>{label}</span><select className="h-10 rounded-md border bg-background px-3" value={value} onChange={(event) => onChange(event.target.value)}><option value="">{emptyLabel}</option>{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{label}</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{value}</div></CardContent></Card>;
}

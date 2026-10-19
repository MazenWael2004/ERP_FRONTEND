import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Download, FileText, MapPinned, RefreshCw, Search, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Input } from 'src/components/ui/input';
import { fetchMasterfileReport } from '../api/reportsService';

const workflowLabels: Record<string, string> = {
  PENDING_APPROVAL: 'بانتظار الاعتماد',
  AWAITING_ACTIVATION: 'بانتظار التفعيل',
  AWAITING_IMPLEMENTATION: 'بانتظار التنفيذ',
  IMPLEMENTED: 'تم التنفيذ',
  REJECTED: 'مرفوض',
};
const date = (value?: string | null) =>
  value ? new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(new Date(value)) : '—';
const value = (input: unknown) =>
  input === null || input === undefined || input === '' ? '—' : String(input);
const bilingual = (ar?: string | null, en?: string | null) => value(ar || en);

type MasterfileColumn = { key: string; header: string; value: (row: any) => string };
const columns: MasterfileColumn[] = [
  { key: 'contractId', header: 'رقم العقد', value: (row) => value(row.contract_id) },
  { key: 'contractDate', header: 'تاريخ العقد', value: (row) => date(row.contract_date) },
  {
    key: 'workflow',
    header: 'حالة سير العمل',
    value: (row) => workflowLabels[row.workflow_status] || value(row.workflow_status),
  },
  {
    key: 'status',
    header: 'حالة العقد',
    value: (row) => bilingual(row.status_name_ar, row.status_name_en),
  },
  {
    key: 'program',
    header: 'البرنامج',
    value: (row) => bilingual(row.program_name_ar, row.program_name_en),
  },
  { key: 'plan', header: 'الخطة', value: (row) => bilingual(row.plan_name_ar, row.plan_name_en) },
  {
    key: 'representative',
    header: 'مساعد المندوب',
    value: (row) =>
      value(
        row.representative_name_ar || row.representative_name_en || row.representative_username,
      ),
  },
  {
    key: 'createdBy',
    header: 'أنشأه',
    value: (row) =>
      value(row.created_by_name_ar || row.created_by_name_en || row.created_by_username),
  },
  { key: 'customerId', header: 'رقم العميل', value: (row) => value(row.customer_id) },
  { key: 'customerCode', header: 'كود العميل', value: (row) => value(row.customer_code) },
  { key: 'customerAr', header: 'اسم العميل بالعربية', value: (row) => value(row.customer_name_ar) },
  {
    key: 'customerEn',
    header: 'اسم العميل بالإنجليزية',
    value: (row) => value(row.customer_name_en),
  },
  {
    key: 'customerType',
    header: 'نوع العميل',
    value: (row) => bilingual(row.customer_type_name_ar, row.customer_type_name_en),
  },
  { key: 'structure', header: 'الهيكل', value: (row) => value(row.customer_structure) },
  { key: 'phone', header: 'هاتف العميل', value: (row) => value(row.customer_phone) },
  { key: 'tax', header: 'الرقم الضريبي', value: (row) => value(row.tax_number) },
  { key: 'registration', header: 'السجل التجاري', value: (row) => value(row.registration_number) },
  { key: 'license', header: 'رقم الترخيص', value: (row) => value(row.license_number) },
  {
    key: 'governorate',
    header: 'المحافظة',
    value: (row) => bilingual(row.governorate_name_ar, row.governorate_name_en),
  },
  {
    key: 'district',
    header: 'القسم / المركز',
    value: (row) => bilingual(row.district_name_ar, row.district_name_en),
  },
  {
    key: 'shiyakha',
    header: 'الشياخة',
    value: (row) => bilingual(row.shiyakha_name_ar, row.shiyakha_name_en),
  },
  { key: 'zone', header: 'المنطقة', value: (row) => bilingual(row.zone_name_ar, row.zone_name_en) },
  { key: 'zoneCode', header: 'كود المنطقة', value: (row) => value(row.zone_code) },
  { key: 'street', header: 'الشارع', value: (row) => value(row.street) },
  { key: 'building', header: 'رقم المبنى', value: (row) => value(row.building_number) },
  { key: 'gln', header: 'رمز GLN', value: (row) => value(row.gln_code) },
  { key: 'maps', header: 'رابط الخريطة', value: (row) => value(row.google_maps_url) },
  { key: 'latitude', header: 'خط العرض', value: (row) => value(row.latitude) },
  { key: 'longitude', header: 'خط الطول', value: (row) => value(row.longitude) },
  {
    key: 'installation',
    header: 'تاريخ التنفيذ / التركيب',
    value: (row) => date(row.installation_date),
  },
  {
    key: 'nextDue',
    header: 'الاستحقاق القادم',
    value: (row) => date(row.next_subscription_due_date),
  },
  { key: 'notes', header: 'ملاحظات العقد', value: (row) => value(row.notes) },
  { key: 'managerNotes', header: 'ملاحظات المدير', value: (row) => value(row.manager_notes) },
];

export default function MasterfileReport() {
  const [filters, setFilters] = useState({
    search: '',
    zoneId: '',
    programId: '',
    workflowStatus: '',
    startDate: '',
    endDate: '',
  });
  const [data, setData] = useState<any>({ rows: [], summary: {} });
  const [filterRows, setFilterRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (requestedFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchMasterfileReport(requestedFilters);
      setData(result || { rows: [], summary: {} });
      setFilterRows((current) => (current.length ? current : result?.rows || []));
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'تعذر تحميل تقرير الملف الرئيسي.');
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
    () =>
      Array.from(
        new Map(
          filterRows.filter((row) => row.zone_id).map((row) => [String(row.zone_id), row]),
        ).values(),
      ),
    [filterRows],
  );
  const programs = useMemo(
    () =>
      Array.from(
        new Map(
          filterRows.filter((row) => row.program_id).map((row) => [String(row.program_id), row]),
        ).values(),
      ),
    [filterRows],
  );

  const exportToExcel = () => {
    const headers = columns.map((column) => column.header);
    const exportRows = rows.map((row: any) => columns.map((column) => column.value(row)));
    const sheet = XLSX.utils.aoa_to_sheet([
      ['Masterfile - العقود والعملاء'],
      [],
      headers,
      ...exportRows,
    ]);
    sheet['!cols'] = headers.map((header) => ({ wch: Math.max(header.length + 5, 16) }));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'الملف الرئيسي');
    XLSX.writeFile(book, `masterfile-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  const reset = () => {
    const empty = {
      search: '',
      zoneId: '',
      programId: '',
      workflowStatus: '',
      startDate: '',
      endDate: '',
    };
    setFilters(empty);
    void load(empty);
  };

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div>
        <h1 className="text-2xl font-bold">الملف الرئيسي للعقود والعملاء</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          بيانات مرجعية تفصيلية لكل عقد وعميل وموقع، بدون أي أعمدة تحصيل أو مبالغ.
        </p>
      </div>
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-7">
          <label className="grid gap-1 text-sm xl:col-span-2">
            <span>بحث</span>
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                className="pr-9"
                placeholder="العقد، العميل، الكود، الهاتف، الضريبي أو السجل"
              />
            </div>
          </label>
          <label className="grid gap-1 text-sm">
            <span>المنطقة</span>
            <select
              className="h-10 rounded-md border bg-background px-3"
              value={filters.zoneId}
              onChange={(event) => setFilters({ ...filters, zoneId: event.target.value })}
            >
              <option value="">كل المناطق</option>
              {zones.map((row: any) => (
                <option key={row.zone_id} value={row.zone_id}>
                  {bilingual(row.zone_name_ar, row.zone_name_en)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span>البرنامج</span>
            <select
              className="h-10 rounded-md border bg-background px-3"
              value={filters.programId}
              onChange={(event) => setFilters({ ...filters, programId: event.target.value })}
            >
              <option value="">كل البرامج</option>
              {programs.map((row: any) => (
                <option key={row.program_id} value={row.program_id}>
                  {bilingual(row.program_name_ar, row.program_name_en)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span>حالة سير العمل</span>
            <select
              className="h-10 rounded-md border bg-background px-3"
              value={filters.workflowStatus}
              onChange={(event) => setFilters({ ...filters, workflowStatus: event.target.value })}
            >
              <option value="">كل الحالات</option>
              {Object.entries(workflowLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span>من تاريخ</span>
            <Input
              dir="ltr"
              type="date"
              value={filters.startDate}
              onChange={(event) => setFilters({ ...filters, startDate: event.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>إلى تاريخ</span>
            <Input
              dir="ltr"
              type="date"
              value={filters.endDate}
              onChange={(event) => setFilters({ ...filters, endDate: event.target.value })}
            />
          </label>
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-7">
            <Button onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              تطبيق الفلاتر
            </Button>
            <Button variant="outline" onClick={reset} disabled={loading}>
              إعادة تعيين
            </Button>
            <Button
              className="mr-auto"
              variant="outline"
              onClick={exportToExcel}
              disabled={!rows.length || loading}
            >
              <Download className="ml-2 h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="العملاء" value={summary.customerCount} icon={<Users />} />
      </div>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>تفاصيل الملف الرئيسي ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {error ? (
            <p className="p-6 text-destructive">{error}</p>
          ) : loading ? (
            <p className="p-6 text-muted-foreground">جارٍ تحميل التقرير...</p>
          ) : (
            <table className="w-full min-w-[5600px] text-sm">
              <thead className="bg-muted">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="whitespace-nowrap px-4 py-3 text-right font-semibold"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((row: any) => (
                    <tr key={row.contract_id} className="border-t align-top">
                      {columns.map((column) => (
                        <td key={column.key} className="max-w-xs whitespace-nowrap px-4 py-3">
                          {column.value(row)}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
                      لا توجد بيانات مطابقة للفلاتر.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
function Metric({
  label,
  value: metricValue,
  icon,
}: {
  label: string;
  value: string | number | undefined;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold">{metricValue ?? 0}</p>
        </div>
        <div className="text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}

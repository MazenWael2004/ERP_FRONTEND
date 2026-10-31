import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronsUpDown, Download, FileText, MapPinned, RefreshCw, Search, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Input } from 'src/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'src/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { cn } from 'src/lib/utils';
import { fetchMasterfileReport } from '../api/reportsService';

const workflowLabels: Record<string, string> = {
  UNDER_CHECKING: 'تحت المراجعة',
  PENDING: 'بانتظار قرار الدعم الفني',
  UNDER_INSTALLATION: 'تحت التركيب',
  INSTALLED: 'تم التركيب - بانتظار التأكيد',
  ACTIVATED: 'مفعل',
  REJECTED: 'مرفوض',
};

function SearchableSelect({ value, onValueChange, options, placeholder }: any) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option: any) => String(option.value) === String(value));
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button type="button" variant="outline" role="combobox" className={cn('relative h-10 w-full justify-start bg-background py-0 pl-9 pr-3 text-right font-normal', !selected && 'text-muted-foreground')}><span className="truncate">{selected?.label || placeholder}</span><ChevronsUpDown className="absolute left-3 h-4 w-4 text-muted-foreground" /></Button></PopoverTrigger><PopoverContent dir="rtl" align="start" className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="اكتب للبحث..." /><CommandList><CommandEmpty>لا توجد نتائج مطابقة</CommandEmpty><CommandGroup>{options.map((option: any) => <CommandItem key={String(option.value)} value={`${option.label} ${option.value}`} onSelect={() => { onValueChange(String(option.value)); setOpen(false); }}><Check className={cn('ml-2 h-4 w-4', String(value) === String(option.value) ? 'opacity-100' : 'opacity-0')} /><span className="truncate">{option.label}</span></CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>;
}
const date = (value?: string | null) =>
  value ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo' }).format(new Date(value)) : '—';
const value = (input: unknown) =>
  input === null || input === undefined || input === '' ? '—' : String(input);
const bilingual = (ar?: string | null, en?: string | null) => value(ar || en);
const contactType = (input: unknown) => {
  const type = String(input || '').toUpperCase();
  if (type === 'OWNER') return 'مالك';
  if (type === 'TENANT') return 'مستأجر';
  return value(input);
};
const person = (row: any, prefix: string) =>
  value(row[`${prefix}_name_ar`] || row[`${prefix}_name_en`] || row[`${prefix}_username`]);
const number = (input: unknown) =>
  Number(input || 0).toLocaleString('ar-EG', { maximumFractionDigits: 2 });
const currency = (input: unknown) => `${number(input)} جنيه`;

type MasterfileColumn = { key: string; header: string; value: (row: any) => string };
const columns: MasterfileColumn[] = [
  { key: 'contractId', header: 'كود العميل', value: (row) => value(row.contract_id) },
  { key: 'contractDate', header: 'تاريخ العقد', value: (row) => date(row.contract_date) },
   {
    key: 'createdBy',
    header: 'مسئول البيع',
    value: (row) =>
      value(row.created_by_name_ar || row.created_by_name_en || row.created_by_username),
  },

  {
    key: 'representative',
    header: 'مشارك',
    value: (row) =>
      value(
        row.representative_name_ar || row.representative_name_en || row.representative_username,
      ),
  },
  { key: 'customerAr', header: 'اسم العميل ', value: (row) => value(row.customer_name_ar) },
  {
    key: 'parentCustomer',
    header: 'العميل / الصيدلية الرئيسية',
    value: (row) => bilingual(row.parent_customer_name_ar, row.parent_customer_name_en),
  },
  {
    key: 'customerType',
    header: 'نوع العميل',
    value: (row) => bilingual(row.customer_type_name_ar, row.customer_type_name_en),
  },
  { key: 'structure', header: 'الهيكل', value: (row) => value(row.customer_structure) },
  { key: 'phone', header: 'هاتف العميل', value: (row) => value(row.customer_phone) },
  { key: 'contactAr', header: 'اسم جهة الاتصال بالعربية', value: (row) => value(row.contact_name_ar) },
  { key: 'contactType', header: 'صفة جهة الاتصال', value: (row) => contactType(row.contact_type) },
  { key: 'contactNationalId', header: 'الرقم القومي لجهة الاتصال', value: (row) => value(row.contact_national_id) },
  { key: 'contactEmail', header: 'بريد جهة الاتصال', value: (row) => value(row.contact_email) },
  {
    key: 'taxRegistrationType',
    header: 'نوع التسجيل الضريبي',
    value: (row) => row.tax_registration_type === 'NATIONAL_ID' ? 'رقم قومي مع إعفاء' : 'رقم ضريبي',
  },
  { key: 'tax', header: 'الرقم الضريبي', value: (row) => value(row.tax_number) },
  { key: 'taxExemptionNationalId', header: 'الرقم القومي للإعفاء', value: (row) => value(row.tax_exemption_national_id) },
  { key: 'taxExemptionComment', header: 'سبب الإعفاء الضريبي', value: (row) => value(row.tax_exemption_comment) },
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
  { key: 'zone', header: 'الفرع', value: (row) => bilingual(row.zone_name_ar, row.zone_name_en) },
  { key: 'street', header: 'الشارع', value: (row) => value(row.street) },
  { key: 'building', header: 'رقم المبنى', value: (row) => value(row.building_number) },
  { key: 'gln', header: 'رمز GLN', value: (row) => value(row.gln_code) },
  { key: 'maps', header: 'رابط الخريطة', value: (row) => value(row.google_maps_url) },
  { key: 'latitude', header: 'خط العرض', value: (row) => value(row.latitude) },
  { key: 'longitude', header: 'خط الطول', value: (row) => value(row.longitude) },
  {
    key: 'installation',
    header: 'تاريخ التركيب',
    value: (row) => date(row.installation_date),
  },
  {
    key: 'nextDue',
    header: 'الاستحقاق القادم',
    value: (row) => date(row.next_subscription_due_date),
  },
  {
    key: 'program',
    header: 'البرنامج',
    value: (row) => bilingual(row.program_name_ar, row.program_name_en),
  },
  { key: 'plan', header: 'الخطة', value: (row) => bilingual(row.plan_name_ar, row.plan_name_en) },
  {
    key: 'additionalServicesQuantity',
    header: 'كمية الخدمات الإضافية المباعة',
    value: (row) => number(row.additional_services_quantity),
  },
  {
    key: 'additionalServicesTotal',
    header: 'إجمالي قيمة الخدمات الإضافية',
    value: (row) => currency(row.additional_services_total),
  },
  {
    key: 'additionalUnitsQuantity',
    header: 'كمية الوحدات الإضافية',
    value: (row) => number(row.additional_units_quantity),
  },
  {
    key: 'additionalUnitsTotal',
    header: 'قيمة الوحدات الإضافية',
    value: (row) => currency(row.additional_units_total),
  },
  {
    key: 'replicationServiceQuantity',
    header: 'كمية خدمات الreplication',
    value: (row) => number(row.replication_service_quantity),
  },
  {
    key: 'replicationServiceTotal',
    header: 'قيمة خدمات الreplication',
    value: (row) => currency(row.replication_service_total),
  },
  { key: 'implementedAt', header: 'تاريخ التركيب الفعلي', value: (row) => date(row.implemented_at) },
  { key: 'implementedBy', header: 'تم التركيب بواسطة', value: (row) => person(row, 'implemented_by') },
  { key: 'activationCode', header: 'كود التفعيل', value: (row) => value(row.activation_code) },
   {
    key: 'workflow',
    header: 'حالة العقد',
    value: (row) => workflowLabels[row.workflow_status] || value(row.workflow_status),
  },
];

export const masterfileColumns = columns;

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function MasterfileReport() {
  const pageSize = 50;
  const today = new Date();
  const defaultDateRange = {
    startDate: toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)),
    endDate: toDateInputValue(today),
  };
  const [filters, setFilters] = useState({
    search: '',
    zoneId: '',
    programId: '',
    workflowStatus: '',
    ...defaultDateRange,
  });
  const [data, setData] = useState<any>({ rows: [], summary: {} });
  const [filterRows, setFilterRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (requestedFilters = filters, requestedPage = page) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchMasterfileReport({
        ...requestedFilters,
        page: requestedPage,
        pageSize,
      });
      setData(result || { rows: [], summary: {} });
      setPage(result?.pagination?.page || requestedPage);
      setFilterRows((current) => (current.length ? current : result?.rows || []));
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'تعذر تحميل تقرير الملف الرئيسي.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load(filters, 1);
  }, []);

  const rows = data?.rows || [];
  const summary = data?.summary || {};
  const pagination = data?.pagination || { page, pageSize, totalCount: 0, totalPages: 0 };
  const firstVisibleRow = pagination.totalCount ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  const lastVisibleRow = Math.min(pagination.page * pagination.pageSize, pagination.totalCount);
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
      ...defaultDateRange,
    };
    setFilters(empty);
    void load(empty, 1);
  };

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">الملف الرئيسي للعقود والعملاء</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            بيانات مرجعية تفصيلية لكل عقد وعميل وموقع، بدون أي أعمدة تحصيل أو مبالغ.
          </p>
        </div>
        {/* <Button asChild variant="outline" className="w-fit">
          <Link to="/contract-contacts-report">
            <Users className="ml-2 h-4 w-4" /> تقرير جهات الاتصال
          </Link>
        </Button> */}
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
                inputMode="numeric"
                placeholder="كود العميل (رقم العقد)"
              />
            </div>
          </label>
          <label className="grid gap-1 text-sm">
            <span>الفرع</span>
            <SearchableSelect
              value={filters.zoneId}
              onValueChange={(zoneId: string) => setFilters({ ...filters, zoneId })}
              placeholder="كل المناطق"
              options={[{ value: '', label: 'كل الفروع' }, ...zones.map((row: any) => ({ value: row.zone_id, label: bilingual(row.zone_name_ar, row.zone_name_en) }))]}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>البرنامج</span>
            <SearchableSelect
              value={filters.programId}
              onValueChange={(programId: string) => setFilters({ ...filters, programId })}
              placeholder="كل البرامج"
              options={[{ value: '', label: 'كل البرامج' }, ...programs.map((row: any) => ({ value: row.program_id, label: bilingual(row.program_name_ar, row.program_name_en) }))]}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>حالة سير العمل</span>
            <SearchableSelect
              value={filters.workflowStatus}
              onValueChange={(workflowStatus: string) => setFilters({ ...filters, workflowStatus })}
              placeholder="كل الحالات"
              options={[{ value: '', label: 'كل الحالات' }, ...Object.entries(workflowLabels).map(([value, label]) => ({ value, label }))]}
            />
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
            <Button onClick={() => void load(filters, 1)} disabled={loading}>
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
              تصدير الصفحة الحالية
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {/* <Metric label="عملاء الصفحة" value={summary.customerCount} icon={<Users />} />
        <Metric
          label="كمية الخدمات الإضافية المباعة"
          value={number(summary.additionalServicesQuantity)}
          icon={<FileText />}
        />
        <Metric
          label="إجمالي قيمة الخدمات الإضافية"
          value={currency(summary.additionalServicesTotal)}
          icon={<FileText />}
        /> */}
      </div>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>تفاصيل الملف الرئيسي ({pagination.totalCount})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {error ? (
            <p className="p-6 text-destructive">{error}</p>
          ) : loading ? (
            <p className="p-6 text-muted-foreground">جارٍ تحميل التقرير...</p>
          ) : (
            <table className="w-full min-w-[8200px] text-sm">
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
          {!loading && !error && pagination.totalCount > 0 && (
            <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground">
                عرض {firstVisibleRow.toLocaleString('ar-EG')}–{lastVisibleRow.toLocaleString('ar-EG')}
                {' '}من {pagination.totalCount.toLocaleString('ar-EG')} عقد
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void load(filters, pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  السابق
                </Button>
                <span className="min-w-24 text-center text-xs text-muted-foreground">
                  صفحة {pagination.page.toLocaleString('ar-EG')} من {pagination.totalPages.toLocaleString('ar-EG')}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void load(filters, pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  التالي
                </Button>
              </div>
            </div>
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

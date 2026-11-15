import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BarChart3,
  Boxes,
  Download,
  ReceiptText,
  RefreshCw,
  Repeat2,
  ShoppingCart,
} from 'lucide-react';

import * as XLSX from 'xlsx';

import { Button } from 'src/components/ui/button';

import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';

import { Input } from 'src/components/ui/input';

import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs';

import {
  fetchAdditionalUnitsReport,
  fetchCollectionsReport,
  fetchReplicationServicesReport,
  fetchSalesReport,
} from '../api/reportsService';

const money = (value: unknown) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value || 0)) + ' ج.م';

const date = (value: unknown) =>
  value ? new Intl.DateTimeFormat('en-GB').format(new Date(String(value))) : '—';

const time12 = (value: unknown) => {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '—';
  const hour = Number(match[1]);
  if (hour > 23) return '—';
  return `${String(hour % 12 || 12).padStart(2, '0')}:${match[2]} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const toNumber = (value: unknown) => Number(value || 0);

const arabicMonth = (value: unknown) => {
  const months = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  return months[Number(value)] || '—';
};

const workflowStatusLabels: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  UNDER_CHECKING: 'قيد المراجعة',
  UNDER_INSTALLATION: 'قيد التركيب',
  INSTALLED: 'تم التركيب',
  ACTIVATED: 'مفعل',
  REJECTED: 'مرفوض',
};

const workflowStatusLabel = (value: unknown) =>
  workflowStatusLabels[String(value)] || String(value || '—');

const collectionStatusLabels: Record<string, string> = {
  COLLECTED: 'تم التحصيل',
  TRANSFERRED: 'تم التوريد',
  SETTLED: 'تمت التسوية',
  REJECTED: 'مرفوض',
};

const collectionStatusLabel = (value: unknown) =>
  collectionStatusLabels[String(value)] || 'تم التحصيل';

type ActiveReport = 'collections' | 'units' | 'replication' | 'sales';

type ReportTableData = {
  title: string;

  sheetName: string;

  headers: string[];

  rows: Array<Array<string | number>>;

  exportRows: Array<Array<string | number>>;
};

type MetricData = {
  label: string;
  value: string;
  icon: ReactNode;
  featured?: boolean;
  helper?: string;
  breakdown?: Array<{ label: string; value: string }>;
};

export default function OperationalReports() {
  const today = new Date().toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(today.slice(0, 8) + '01');

  const [endDate, setEndDate] = useState(today);

  const [salesWorkflowStatus, setSalesWorkflowStatus] = useState('');

  const [active, setActive] = useState<ActiveReport>('collections');

  const [data, setData] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);

    setError('');

    try {
      const loader =
        active === 'collections'
          ? fetchCollectionsReport
          : active === 'units'
            ? fetchAdditionalUnitsReport
            : active === 'replication'
              ? fetchReplicationServicesReport
              : (start: string, end: string) => fetchSalesReport(start, end, salesWorkflowStatus || undefined);

      setData(await loader(startDate, endDate));
    } catch {
      setError('تعذر تحميل التقرير. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [active]);

  const summary = data?.summary || {};

  const table = useMemo<ReportTableData>(() => {
    if (active === 'collections') {
      const rows = (data?.receipts || []).map((receipt: any) =>
        [
          `${receipt.contract_id}`,
          receipt.customer_name_ar || receipt.customer_name || '—',
          date(receipt.collected_at),
          time12(receipt.created_time),
          receipt.collector_name_ar || receipt.collector_name || '—',
          receipt.collector_supervisor_name_ar || receipt.collector_supervisor_name || '—',
          receipt.collector_manager_name_ar || receipt.collector_manager_name || '—',
          receipt.receipt_number || '—',

          money(receipt.amount),
          receipt.payment_method_name_ar ||
            receipt.payment_method_name ||
            receipt.payment_method_code ||
            'غير محددة',
          receipt.bank_name || '—',
          receipt.reference_number || '—',
          receipt.cheque_number || '—',
          receipt.service_name || '—',
          arabicMonth(receipt.subscription_month),
          receipt.subscription_year || '—',
          collectionStatusLabel(receipt.collection_workflow_status),
          date(receipt.settled_at),
        ].reverse(),
      );

      const exportRows = (data?.receipts || []).map((receipt: any) =>
        [
          receipt.contract_id || '',
          receipt.customer_name_ar || receipt.customer_name || '',
          receipt.collected_at ? String(receipt.collected_at).slice(0, 10) : '',
          time12(receipt.created_time),
          receipt.collector_name_ar || receipt.collector_name || '',
          receipt.collector_supervisor_name_ar || receipt.collector_supervisor_name || '',
          receipt.collector_manager_name_ar || receipt.collector_manager_name || '',
          receipt.receipt_number || '',
          toNumber(receipt.amount),
          receipt.payment_method_name_ar ||
            receipt.payment_method_name ||
            receipt.payment_method_code ||
            '',
          receipt.bank_name || '',
          receipt.reference_number || '',
          receipt.cheque_number || '',
          receipt.service_name || '',
          receipt.subscription_month ? arabicMonth(receipt.subscription_month) : '',
          receipt.subscription_year || '',
          collectionStatusLabel(receipt.collection_workflow_status),
          receipt.settled_at ? String(receipt.settled_at).slice(0, 10) : '',
        ].reverse(),
      );

      return {
        title: 'تقرير التحصيلات',
        sheetName: 'التحصيلات',
        headers: [
          'كود العميل',
          'اسم العميل',
          'تاريخ التحصيل',
          'وقت إنشاء التحصيل',
          'اسم المحصل',
          'المشرف',
          'المدير',
          'رقم الإيصال',
          'المبلغ',
          'طريقة الدفع',
          'اسم البنك',
          'الرقم المرجعي',
          'رقم الشيك',
          'الخدمة',
          'شهر الاشتراك',
          'سنة الاشتراك',
          'حالة التحصيل',
          'تاريخ التسوية',
        ].reverse(),
        rows,
        exportRows,
      };
    }

    if (active === 'units' || active === 'replication') {
      const isReplicationReport = active === 'replication';
      const rows = (data?.rows || []).map((unit: any) =>
        [
          date(unit.invoice_date),

          unit.customer_name_ar || unit.customer_name || '—',
          unit.parent_customer_name_ar || unit.parent_customer_name_en || '—',

          `#${unit.contract_id}`,

          unit.service_name_ar || unit.service_name || '—',

          toNumber(unit.quantity).toLocaleString('en-US'),

          money(unit.unit_price),

          money(unit.line_total),
        ].reverse(),
      );

      const exportRows = (data?.rows || []).map((unit: any) =>
        [
          unit.invoice_date ? String(unit.invoice_date).slice(0, 10) : '',

          unit.customer_name_ar || unit.customer_name || '',
          unit.parent_customer_name_ar || unit.parent_customer_name_en || '',

          unit.contract_id || '',

          unit.service_name_ar || unit.service_name || '',

          toNumber(unit.quantity),

          toNumber(unit.unit_price),

          toNumber(unit.line_total),
        ].reverse(),
      );

      return {
        title: isReplicationReport ? 'تقرير خدمة النسخ' : 'تقرير الوحدات الإضافية',

        sheetName: isReplicationReport ? 'خدمة النسخ' : 'الوحدات الإضافية',

        headers: [
          'التاريخ',
          'اسم العميل',
          'تابع لعميل/صيدلية',
          'كود العميل',
          'الخدمة',
          'الكمية',
          'سعر الوحدة',
          'إجمالي البند',
        ].reverse(),

        rows,

        exportRows,
      };
    }

    const rows = (data?.rows || []).map((sale: any) =>
      [
        date(sale.contract_date),
        sale.contract_id || '—',
        sale.sales_responsible_name_ar || sale.sales_responsible_name_en || '—',
        sale.sales_supervisor_name_ar || sale.sales_supervisor_name_en || '—',
        sale.sales_manager_name_ar || sale.sales_manager_name_en || '—',

        sale.customer_name_ar || sale.customer_name || '—',
        sale.program_name_ar || sale.program_name || '—',
        sale.contract_type_name_ar || sale.contract_type_name_en || sale.contract_type_code || '—',

        sale.subscription_type_name_ar || sale.subscription_type_name_en || '—',
        `${toNumber(sale.subscription_discount_percentage).toLocaleString('en-US')}`,
        money(sale.monthly_subscription_after_discount),
        money(sale.joining_fee_after_discount),
        money(sale.subscription_fee_after_discount),
        money(sale.total_contract_value),
        money(sale.remaining_contract_balance),
        money(sale.additional_units_total),
        money(sale.replication_service_total),
        money(sale.additional_services_total),
        workflowStatusLabel(sale.workflow_status),
      ].reverse(),
    );

    const exportRows = (data?.rows || []).map((sale: any) =>
      [
        sale.contract_date ? String(sale.contract_date).slice(0, 10) : '',
        sale.contract_id || '',
        sale.sales_responsible_name_ar || sale.sales_responsible_name_en || '',
        sale.sales_supervisor_name_ar || sale.sales_supervisor_name_en || '',
        sale.sales_manager_name_ar || sale.sales_manager_name_en || '',

        sale.customer_name_ar || sale.customer_name || '',
        sale.program_name_ar || sale.program_name || '',
        sale.contract_type_name_ar || sale.contract_type_name_en || sale.contract_type_code || '',

        sale.subscription_type_name_ar || sale.subscription_type_name_en || '',
        toNumber(sale.subscription_discount_percentage) / 100,
        toNumber(sale.monthly_subscription_after_discount),
        toNumber(sale.joining_fee_after_discount),
        toNumber(sale.subscription_fee_after_discount),
        toNumber(sale.total_contract_value),
        toNumber(sale.remaining_contract_balance),
        toNumber(sale.additional_units_total),
        toNumber(sale.replication_service_total),
        toNumber(sale.additional_services_total),
        workflowStatusLabel(sale.workflow_status),
      ].reverse(),
    );

    return {
      title: 'تقرير المبيعات',

      sheetName: 'المبيعات',

      headers: [
        'تاريخ العقد',
        'كود العميل',
        'مسؤول البيع',
        'المشرف',
        'المدير',

        'اسم العميل',
        'البرنامج',
        'نوع التعاقد',

        'نوع الاشتراك',
        'نسبة خصم الاشتراك',
        'سعر الاشتراك بعد الخصم',
        'إجمالي رسم الانضمام',
        'إجمالي الاشتراكات',
        'إجمالي قيمة العقد شاملة الخدمات الإضافية',
        'المتبقي',
        'إجمالي وحدات إضافية',
        'إجمالي خدمة النسخ',
        'إجمالي الخدمات الإضافية',
        'حالة العقد',
      ].reverse(),

      rows,

      exportRows,
    };
  }, [active, data]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      [table.title],

      ['من تاريخ', startDate],

      ['إلى تاريخ', endDate],

      [],

      table.headers,

      ...table.exportRows,
    ]);

    worksheet['!cols'] = table.headers.map((header) => ({ wch: Math.max(header.length + 4, 16) }));

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, table.sheetName);

    XLSX.writeFile(workbook, `${table.sheetName}-${startDate}-${endDate}.xlsx`);
  };

  const primaryMetric =
    active === 'collections'
      ? {
          label: 'الإيصالات المحصلة',

          value: toNumber(summary.receipt_count).toLocaleString('en-US'),

          icon: <ReceiptText />,
        }
      : active === 'units'
        ? {
            label: 'عدد الوحدات الإضافية المباعة',

            value: toNumber(summary.units_count).toLocaleString('en-US'),

            icon: <Boxes />,
          }
        : active === 'replication'
          ? {
              label: 'عدد خدمات النسخ',

              value: toNumber(summary.units_count).toLocaleString('en-US'),

              icon: <Repeat2 />,
            }
          : {
              label: 'العقود المباعة',

              value: toNumber(summary.contract_count).toLocaleString('en-US'),

              icon: <ShoppingCart />,
            };

  const amountMetric =
    active === 'collections'
      ? { label: 'إجمالي المبالغ المحصلة', value: money(summary.total_received) }
      : active === 'units'
        ? { label: 'إجمالي قيمة الوحدات الإضافية', value: money(summary.total_amount) }
        : active === 'replication'
          ? { label: 'إجمالي قيمة خدمات النسخ', value: money(summary.total_amount) }
          : { label: 'قيمة المبيعات', value: money(summary.total_sales) };

  const collectionSettlementTotals = (data?.receipts || []).reduce(
    (totals: { settled: number; unsettled: number }, receipt: any) => {
      const key = receipt.is_settled ? 'settled' : 'unsettled';
      totals[key] += toNumber(receipt.amount);
      return totals;
    },
    { settled: 0, unsettled: 0 },
  );

  const programMetric =
    active === 'sales'
      ? {
          label: 'عدد البرامج',
          value: toNumber(summary.program_count).toLocaleString('en-US'),
          icon: <Boxes />,
        }
      : null;

  const metrics =
    active === 'sales'
      ? [
          { label: 'إجمالي قيمة العقود', value: money(summary.total_sales), icon: <BarChart3 />, featured: true, helper: 'شامل الخدمات الإضافية' },
          primaryMetric,
          { label: 'متوسط قيمة العقد', value: money(summary.average_sale), icon: <ShoppingCart /> },
          { label: 'إجمالي الاشتراكات بعد الخصم', value: money(summary.subscriptions_after_discount), icon: <Repeat2 />, helper: 'للفترات المحددة في العقود' },
          { label: 'إجمالي رسوم الانضمام', value: money(summary.joining_fees_after_discount), icon: <ReceiptText /> },
          { label: 'إجمالي الخدمات الإضافية', value: money(summary.additional_services_total), icon: <Boxes /> },
          // { label: 'إجمالي الدفعات المقدمة', value: money(summary.total_advance_payments), icon: <ReceiptText /> },
          { label: 'إجمالي المتبقي', value: money(summary.total_remaining_contract_balance), icon: <BarChart3 />, helper: 'للرسم الأساسي للعقود' },
          // programMetric,
        ].filter(Boolean) as MetricData[]
      : active === 'collections'
        ? [
            primaryMetric,
            {
              label: 'إجمالي المبالغ المحصلة',
              value: money(summary.total_received),
              icon: <BarChart3 />,
              breakdown: [
                { label: 'المسوّى', value: money(collectionSettlementTotals.settled) },
                { label: 'غير المسوّى', value: money(collectionSettlementTotals.unsettled) },
              ],
            },
          ]
        : [
          primaryMetric,
          { label: amountMetric.label, value: amountMetric.value, icon: <BarChart3 /> },
        ] as MetricData[];

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">تقارير التعاقدات الجديدة</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            التحصيلات والوحدات الإضافية و خدمات الreplication والمبيعات حسب الفترة.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <label className="grid gap-1 text-sm">
            <span>من تاريخ</span>

            <Input
              dir="ltr"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span>إلى تاريخ</span>

            <Input
              dir="ltr"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>

          {active === 'sales' && (
            <label className="grid gap-1 text-sm">
              <span>حالة العقد</span>
              <select
                value={salesWorkflowStatus}
                onChange={(event) => setSalesWorkflowStatus(event.target.value)}
                className="h-9 min-w-44 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">كل الحالات</option>
                <option value="PENDING">قيد الانتظار</option>
                <option value="UNDER_CHECKING">قيد المراجعة</option>
                <option value="UNDER_INSTALLATION">قيد التركيب</option>
                <option value="INSTALLED">تم التركيب</option>
                <option value="ACTIVATED">مفعل</option>
                <option value="REJECTED">مرفوض</option>
              </select>
            </label>
          )}

          <Button onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>

          <Button
            variant="outline"
            onClick={exportToExcel}
            disabled={loading || table.exportRows.length === 0}
          >
            <Download className="ml-2 h-4 w-4" />
            تصدير Excel
          </Button>
        </CardContent>
      </Card>

      <Tabs value={active} onValueChange={(value) => setActive(value as ActiveReport)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="collections">
            <ReceiptText className="ml-2 h-4 w-4" />
            التحصيلات
          </TabsTrigger>

          <TabsTrigger value="units">
            <Boxes className="ml-2 h-4 w-4" />
            الوحدات الإضافية
          </TabsTrigger>

          <TabsTrigger value="replication">
            <Repeat2 className="ml-2 h-4 w-4" />
           replication خدمة ال
          </TabsTrigger>

          <TabsTrigger value="sales">
            <ShoppingCart className="ml-2 h-4 w-4" />
            مبيعات العقود
          </TabsTrigger>
        </TabsList>

        <TabsContent value={active} className="space-y-4">
          {error ? (
            <p className="text-destructive">{error}</p>
          ) : loading ? (
            <p>جارٍ تحميل التقرير…</p>
          ) : (
            <>
              <div
                className={`grid grid-cols-1 gap-4 ${active === 'sales' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2'}`}
              >
                {metrics.map((metric) => <Metric key={metric.label} {...metric} />)}
              </div>

              <ReportTable {...table} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Metric({ label, value, icon, featured = false, helper, breakdown }: MetricData) {
  return (
    <Card className={featured ? 'border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card shadow-sm sm:col-span-2' : 'transition-shadow hover:shadow-sm'}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="min-w-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
        </div>
        <div className={featured ? 'rounded-xl bg-primary p-2 text-primary-foreground' : 'rounded-xl bg-muted p-2 text-muted-foreground'}>
          {icon}
        </div>
      </CardHeader>

      <CardContent>
        <div className={featured ? 'text-3xl font-bold tracking-tight' : 'text-2xl font-bold tracking-tight'}>{value || '0'}</div>
        {breakdown && (
          <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-sm">
            {breakdown.map((item) => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReportTable({ headers, rows }: ReportTableData) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[3250px] text-right text-sm">
          <thead className="bg-muted">
            <tr>
              {headers.map((header) => (
                <th key={header} className="whitespace-nowrap px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={index} className="border-t">
                  {row.map((value, cellIndex) => (
                    <td key={cellIndex} className="whitespace-nowrap px-4 py-3">
                      {value || '—'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="p-6 text-center text-muted-foreground">
                  لا توجد بيانات في الفترة المحددة.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

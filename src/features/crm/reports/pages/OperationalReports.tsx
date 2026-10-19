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

const toNumber = (value: unknown) => Number(value || 0);

type ActiveReport = 'collections' | 'units' | 'replication' | 'sales';

type ReportTableData = {
  title: string;

  sheetName: string;

  headers: string[];

  rows: Array<Array<string | number>>;

  exportRows: Array<Array<string | number>>;
};

export default function OperationalReports() {
  const today = new Date().toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(today.slice(0, 8) + '01');

  const [endDate, setEndDate] = useState(today);

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
              : fetchSalesReport;

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
          date(receipt.collected_at),
          receipt.receipt_number || '—',
          receipt.customer_name_ar || receipt.customer_name || '—',
          `#${receipt.contract_id}`,
          money(receipt.amount),
          receipt.payment_method_name_ar ||
            receipt.payment_method_name ||
            receipt.payment_method_code ||
            'غير محددة',
          receipt.bank_name || '—',
          receipt.reference_number || '—',
          receipt.cheque_number || '—',
        ].reverse(),
      );

      const exportRows = (data?.receipts || []).map((receipt: any) =>
        [
          receipt.collected_at ? String(receipt.collected_at).slice(0, 10) : '',
          receipt.receipt_number || '',
          receipt.customer_name_ar || receipt.customer_name || '',
          receipt.contract_id || '',
          toNumber(receipt.amount),
          receipt.payment_method_name_ar ||
            receipt.payment_method_name ||
            receipt.payment_method_code ||
            '',
          receipt.bank_name || '',
          receipt.reference_number || '',
          receipt.cheque_number || '',
        ].reverse(),
      );

      return {
        title: 'تقرير التحصيلات',
        sheetName: 'التحصيلات',
        headers: [
          'تاريخ التحصيل',
          'رقم الإيصال',
          'العميل',
          'العقد',
          'المبلغ',
          'طريقة الدفع',
          'اسم البنك',
          'الرقم المرجعي',
          'رقم الشيك',
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
          'العميل',
          'العقد',
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

        sale.customer_name_ar || sale.customer_name || '—',

        sale.program_name_ar || sale.program_name || '—',

        `#${sale.contract_id}`,

        money(sale.subscription_price),

        money(sale.total_after_discount),
      ].reverse(),
    );

    const exportRows = (data?.rows || []).map((sale: any) =>
      [
        sale.contract_date ? String(sale.contract_date).slice(0, 10) : '',

        sale.customer_name_ar || sale.customer_name || '',

        sale.program_name_ar || sale.program_name || '',

        sale.contract_id || '',

        toNumber(sale.subscription_price),

        toNumber(sale.total_after_discount),
      ].reverse(),
    );

    return {
      title: 'تقرير المبيعات',

      sheetName: 'المبيعات',

      headers: [
        'تاريخ العقد',
        'العميل',
        'البرنامج',
        'العقد',
        'الاشتراك الشهري',
        'قيمة العقد',
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
      ? { label: 'إجمالي المبالغ المستلمة', value: money(summary.total_received) }
      : active === 'units'
        ? { label: 'إجمالي قيمة الوحدات الإضافية', value: money(summary.total_amount) }
        : active === 'replication'
          ? { label: 'إجمالي قيمة خدمات النسخ', value: money(summary.total_amount) }
          : { label: 'قيمة المبيعات', value: money(summary.total_sales) };

  const programMetric =
    active === 'sales'
      ? {
          label: 'عدد البرامج',
          value: toNumber(summary.program_count).toLocaleString('en-US'),
          icon: <Boxes />,
        }
      : null;

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div>
        <h1 className="text-2xl font-bold">تقارير التعاقدات الجديدة</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          التحصيلات والوحدات الإضافية وخدمات النسخ والمبيعات حسب الفترة.
        </p>
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
            خدمة النسخ
          </TabsTrigger>

          <TabsTrigger value="sales">
            <ShoppingCart className="ml-2 h-4 w-4" />
            المبيعات
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
                className={`grid grid-cols-1 gap-4 ${active === 'sales' ? 'md:grid-cols-3' : 'sm:grid-cols-2'}`}
              >
                <Metric {...primaryMetric} />

                <Metric
                  label={amountMetric.label}
                  value={amountMetric.value}
                  icon={<BarChart3 />}
                />

                {programMetric && <Metric {...programMetric} />}
              </div>

              <ReportTable {...table} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>

        {icon}
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{value || '0'}</div>
      </CardContent>
    </Card>
  );
}

function ReportTable({ headers, rows }: ReportTableData) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-right text-sm">
          <thead className="bg-muted">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-semibold">
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

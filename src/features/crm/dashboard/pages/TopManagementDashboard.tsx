import { useCallback, useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import {
  BadgeDollarSign,
  Building2,
  CircleDollarSign,
  Loader2,
  Percent,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card';
import { fetchDashboardSummary, type DashboardSummary } from '../api/dashboardService';

const money = (value: number) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const number = (value: number) => new Intl.NumberFormat('ar-EG').format(Number(value || 0));

const message = (error: any) =>
  error?.response?.data?.message || 'تعذر تحميل مؤشرات الإدارة العليا.';
const monthLabel = (value: string) => {
  const monthKey = /^\d{4}-\d{2}/.exec(String(value || ''))?.[0];
  if (!monthKey) return '—';
  const date = new Date(`${monthKey}-01T00:00:00`);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('ar-EG', { month: 'short', year: 'numeric' }).format(date);
};

const collectionStatusLabel: Record<string, string> = {
  COLLECTED: 'تم التحصيل',
  TRANSFERRED: 'تم التوريد',
  SETTLED: 'تمت التسوية',
  REFUND_PENDING: 'بانتظار رد المبلغ',
  REFUNDED: 'تم رد المبلغ',
};
const donutColors = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626', '#0891b2'];

function CollectionsDonut({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: Array<{ label: string; amount: number; collection_count: number }>;
}) {
  const safeRows = rows.filter((row) => Number(row.amount) > 0);
  const total = safeRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const options: ApexOptions = {
    chart: { type: 'donut', fontFamily: 'inherit', toolbar: { show: false } },
    labels: safeRows.map((row) => row.label),
    colors: donutColors,
    legend: { position: 'bottom', horizontalAlign: 'center', fontFamily: 'inherit' },
    dataLabels: { enabled: false },
    stroke: { width: 3, colors: ['transparent'] },
    tooltip: {
      y: {
        formatter: (value: number, context) =>
          `${money(value)} — ${number(safeRows[context.seriesIndex]?.collection_count || 0)} إيصال`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            name: { show: true, offsetY: -8 },
            value: { show: true, offsetY: 8, formatter: (value) => money(Number(value)) },
            total: { show: true, label: 'إجمالي التحصيلات', formatter: () => money(total) },
          },
        },
      },
    },
  };
  return (
    <Card className="gap-4 p-5">
      <CardHeader className="p-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {safeRows.length ? (
          <Chart options={options} series={safeRows.map((row) => Number(row.amount))} type="donut" height={310} />
        ) : (
          <div className="flex h-[310px] items-center justify-center text-sm text-muted-foreground">
            لا توجد تحصيلات لعرضها.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TopManagementDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSummary(await fetchDashboardSummary());
      setUpdatedAt(new Date());
    } catch (error) {
      toast.error(message(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cards = summary
    ? [
        {
          title: 'العقود المفعّلة',
          value: number(summary.activated_contracts),
          detail: 'إجمالي العقود التي وصلت إلى حالة التفعيل.',
          icon: Building2,
          accent: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
        },
        {
          title: 'محصلات الشهر الحالي',
          value: money(summary.total_collected_this_month),
          detail: 'كل التحصيلات المسجلة من بداية الشهر حتى الآن.',
          icon: BadgeDollarSign,
          accent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
        },
        {
          title: 'نسبة التحصيل',
          value: `${Number(summary.collection_rate || 0).toLocaleString('ar-EG', { maximumFractionDigits: 2 })}%`,
          detail: 'إجمالي المحصل ÷ إجمالي الفواتير المالية الصادرة.',
          icon: Percent,
          accent: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
        },
        {
          title: 'إجمالي المديونية',
          value: money(summary.total_debt),
          detail: 'إجمالي الفواتير المالية − إجمالي التحصيلات.',
          icon: CircleDollarSign,
          accent: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        },
      ]
    : [];
  const monthlyPerformance = summary?.monthly_billed_vs_collected || [];
  const paymentMethodCollections = summary?.collections_by_payment_method || [];
  const statusCollections = (summary?.collections_by_status || []).map((row) => ({
    ...row,
    label: collectionStatusLabel[row.status] || row.status,
  }));
  const monthlyMaximum = Math.max(
    1,
    ...monthlyPerformance.flatMap((row) => [
      Number(row.invoiced_amount || 0),
      Number(row.collected_amount || 0),
    ]),
  );
  const chart = { width: 760, height: 260, left: 54, right: 18, top: 18, bottom: 48 };
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;
  const pointX = (index: number) =>
    chart.left +
    (monthlyPerformance.length < 2
      ? plotWidth / 2
      : (index * plotWidth) / (monthlyPerformance.length - 1));
  const pointY = (value: number) =>
    chart.top + plotHeight - (Math.max(0, value) / monthlyMaximum) * plotHeight;
  const invoicedLine = monthlyPerformance
    .map((row, index) => `${pointX(index)},${pointY(Number(row.invoiced_amount || 0))}`)
    .join(' ');
  const collectedLine = monthlyPerformance
    .map((row, index) => `${pointX(index)},${pointY(Number(row.collected_amount || 0))}`)
    .join(' ');
  const compactMoney = (value: number) =>
    new Intl.NumberFormat('ar-EG', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Top Management</p>
          <h1 className="mt-1 text-2xl font-bold">لوحة الإدارة العليا</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ملخص تنفيذي موحّد للأداء المالي والتشغيلي حتى الآن.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {loading && !summary ? (
        <Card>
          <CardContent className="flex min-h-56 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className="gap-4 p-5 shadow-sm">
                  <CardHeader className="flex-row items-start justify-between space-y-0 p-0">
                    <div>
                      <CardTitle className="text-base">{card.title}</CardTitle>
                      <CardDescription className="mt-2 min-h-10 leading-5">
                        {card.detail}
                      </CardDescription>
                    </div>
                    <span className={`rounded-xl p-2.5 ${card.accent}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                  </CardHeader>
                  <CardContent className="p-0 text-2xl font-bold tracking-tight">
                    {card.value}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <CollectionsDonut
              title="التحصيلات حسب طريقة الدفع"
              description="توزيع القيمة المحصلة بين وسائل الدفع المسجلة."
              rows={paymentMethodCollections}
            />
            <CollectionsDonut
              title="التحصيلات حسب الحالة"
              description="توزيع القيمة المحصلة حسب مرحلة التحصيل والتوريد والتسوية."
              rows={statusCollections}
            />
          </div>

          {/* <Card className="gap-3 p-5">
            <CardHeader className="p-0">
              <CardTitle>أساس الحساب</CardTitle>
              <CardDescription>
                تُحتسب الفواتير المالية بحالات: صادرة، جزئية، مدفوعة، ومتأخرة. تُستبعد المسودات
                والملغاة، وتُحتسب التحصيلات غير المحذوفة فقط.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-0 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/60 p-4">
                <p className="text-sm text-muted-foreground">إجمالي الفواتير المالية</p>
                <p className="mt-1 text-lg font-semibold">{money(summary.total_invoiced)}</p>
              </div>
              <div className="rounded-lg bg-muted/60 p-4">
                <p className="text-sm text-muted-foreground">إجمالي التحصيلات حتى الآن</p>
                <p className="mt-1 text-lg font-semibold">{money(summary.total_collected)}</p>
              </div>
            </CardContent>
          </Card> */}
          <Card className="gap-4 p-5">
            <CardHeader className="p-0">
              <CardTitle>الفواتير مقابل التحصيلات شهريًا</CardTitle>
              <CardDescription>
                آخر 12 شهرًا — تُنسب الفواتير لتاريخ إصدارها والتحصيلات لتاريخ تسجيلها.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-600" />
                  الفواتير
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-600" />
                  التحصيلات
                </span>
              </div>
              <div className="overflow-x-auto">
                <svg
                  className="min-w-[640px] w-full"
                  viewBox={`0 0 ${chart.width} ${chart.height}`}
                  role="img"
                  aria-label="رسم بياني للفواتير مقابل التحصيلات شهريًا"
                >
                  <title>الفواتير مقابل التحصيلات شهريًا</title>
                  {[0, 0.5, 1].map((ratio) => {
                    const y = chart.top + plotHeight - ratio * plotHeight;
                    return (
                      <g key={ratio}>
                        <line
                          x1={chart.left}
                          x2={chart.width - chart.right}
                          y1={y}
                          y2={y}
                          stroke="currentColor"
                          strokeOpacity="0.12"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={chart.left - 8}
                          y={y + 4}
                          textAnchor="end"
                          className="fill-muted-foreground text-[10px]"
                        >
                          {compactMoney(monthlyMaximum * ratio)}
                        </text>
                      </g>
                    );
                  })}
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={invoicedLine}
                  />
                  <polyline
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={collectedLine}
                  />
                  {monthlyPerformance.map((row, index) => {
                    const invoiced = Number(row.invoiced_amount || 0);
                    const collected = Number(row.collected_amount || 0);
                    const label = monthLabel(row.month_key || row.month_start);
                    return (
                      <g key={row.month_key}>
                        <circle cx={pointX(index)} cy={pointY(invoiced)} r="4" fill="#2563eb">
                          <title>{`${label}: فواتير ${money(invoiced)}`}</title>
                        </circle>
                        <circle cx={pointX(index)} cy={pointY(collected)} r="4" fill="#059669">
                          <title>{`${label}: تحصيلات ${money(collected)}`}</title>
                        </circle>
                        <text
                          x={pointX(index)}
                          y={chart.height - 18}
                          textAnchor="middle"
                          className="fill-muted-foreground text-[10px]"
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </CardContent>
          </Card>
          {updatedAt && (
            <p className="text-xs text-muted-foreground">
              آخر تحديث:{' '}
              {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(
                updatedAt,
              )}
            </p>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            لا تتوفر بيانات لعرضها الآن.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

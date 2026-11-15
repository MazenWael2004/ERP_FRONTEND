import { useRef, useState } from 'react';
import { Download, FileDown, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from 'src/shared/api/axios';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Input } from 'src/components/ui/input';
const money = (v: any) =>
  `${Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} ج.م`;
const paymentStatusLabel: Record<string, string> = {
  UNPAID: 'غير مسدد',
  PARTIALLY_PAID: 'مسدد جزئيًا',
  PAID: 'مسدد',
};
const reportGeneratedAt = () =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

export default function SubscriptionStatement() {
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [statementYear, setStatementYear] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportingPdf, setExportingPdf] = useState(false);
  const pdfDocumentRef = useRef<HTMLDivElement>(null);
  const load = async () => {
    if (!search) {
      setError('اكتب كود العميل');
      return;
    }
    setLoading(true);
    setError('');
    try {
      setData((await api.get('/subscription-statements', {
        params: { search, paymentStatus, year: statementYear || undefined },
      })).data.data);
    } catch (e: any) {
      setData(null);
      setError(e?.response?.data?.message || 'تعذر تحميل كشف الحساب.');
    } finally {
      setLoading(false);
    }
  };
  const exportX = () => {
    if (!data) return;
    const rows = data.rows.map((r: any) => [
      r.month,
      r.year,
      r.due_amount,
      r.paid_amount,
      r.outstanding_amount,
      paymentStatusLabel[r.payment_status_code] || r.payment_status,
    ]);
    const ws = XLSX.utils.aoa_to_sheet([
      ['كشف حساب الاشتراكات'],
      ['العميل', data.contract.customer_name_ar || data.contract.customer_name_en],
      ['كود العميل', data.contract.customer_code],
      ['رقم العقد', data.contract.contract_id],
      ['السنة', statementYear || 'كل السنوات'],
      [],
      ['الشهر', 'السنة', 'المستحق', 'المحصل', 'المتبقي', 'الحالة'],
      ...rows,
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'كشف الاشتراكات');
    XLSX.writeFile(wb, `subscription-statement-${data.contract.contract_id}.xlsx`);
  };
  const downloadPdf = () => {
    if (!data || !pdfDocumentRef.current) return;

    const pdfWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!pdfWindow) {
      setError('تعذر فتح نافذة PDF. اسمح بالنوافذ المنبثقة ثم أعد المحاولة.');
      return;
    }

    setExportingPdf(true);
    const copiedStyles = Array.from(document.querySelectorAll('style'))
      .map((style) => style.outerHTML)
      .join('\n');
    const linkedStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((link) => link.outerHTML)
      .join('\n');
    pdfWindow.document.title = `B-Connect Subscription Statement ${data.contract.contract_id}`;
    pdfWindow.document.write(`<!doctype html><html dir="rtl"><head><meta charset="utf-8" /><title>${pdfWindow.document.title}</title>${linkedStyles}${copiedStyles}<style>
      @page { size: A4 portrait; margin: 12mm; }
      body { margin: 0; background: #fff; font-family: Tahoma, Arial, sans-serif; color: #1e293b; }
      .subscription-statement-pdf { width: 100%; }
      .subscription-statement-pdf table { width: 100%; border-collapse: collapse; }
      .subscription-statement-pdf thead { display: table-header-group; }
      .subscription-statement-pdf tr { break-inside: avoid; page-break-inside: avoid; }
      .subscription-statement-pdf footer { break-inside: avoid; page-break-inside: avoid; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style></head><body><main class="subscription-statement-pdf">${pdfDocumentRef.current.innerHTML}</main></body></html>`);
    pdfWindow.document.close();
    window.setTimeout(() => {
      pdfWindow.focus();
      pdfWindow.print();
      setExportingPdf(false);
    }, 500);
  };
  return (
    <div dir="rtl" className="space-y-6 text-right print:p-0">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold">كشف حساب الاشتراكات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          متابعة الاستحقاقات الشهرية والسداد الجزئي.
        </p>
      </div>
      <Card className="print:hidden">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <label className="grid gap-1 text-sm">
            <span>كود العميل </span>
            <Input
              inputMode="numeric"
              value={search}
              onChange={(e) => setSearch(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && void load()}
              placeholder="مثال: 6"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>حالة السداد</span>
            <select
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              className="h-10 min-w-40 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">كل الحالات</option>
              <option value="UNPAID">غير مسدد</option>
              <option value="PARTIALLY_PAID">مسدد جزئيًا</option>
              <option value="PAID">مسدد</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span>السنة</span>
            <Input
              type="number"
              inputMode="numeric"
              min="2000"
              max="2100"
              value={statementYear}
              onChange={(event) => setStatementYear(event.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(event) => event.key === 'Enter' && void load()}
              placeholder="كل السنوات"
              className="min-w-32"
            />
          </label>
          <Button onClick={() => void load()} disabled={loading}>
            <Search className="ml-2 h-4 w-4" />
            بحث
          </Button>
          {data && (
            <>
              <Button variant="outline" onClick={downloadPdf} disabled={exportingPdf}>
                <FileDown className="ml-2 h-4 w-4" />
                {exportingPdf ? 'جارٍ تجهيز PDF...' : 'تحميل PDF'}
              </Button>
              <Button variant="outline" onClick={exportX}>
                <Download className="ml-2 h-4 w-4" />
                Excel
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      {error && <p className="text-destructive">{error}</p>}
      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {data.contract.customer_name_ar || data.contract.customer_name_en} — عقد #
                {data.contract.contract_id}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <div>
                إجمالي المستحق
                <strong className="block text-xl">{money(data.summary.total_due)}</strong>
              </div>
              <div>
                إجمالي المحصل
                <strong className="block text-xl text-emerald-700">
                  {money(data.summary.total_paid)}
                </strong>
              </div>
              <div>
                إجمالي المتبقي
                <strong className="block text-xl text-destructive">
                  {money(data.summary.total_outstanding)}
                </strong>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-muted">
                  <tr>
                    {['الشهر', 'السنة', 'المستحق', 'المحصل', 'المتبقي', 'الحالة'].map((h) => (
                      <th key={h} className="p-3 text-right">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r: any) => (
                    <tr key={r.billing_month} className="border-t">
                      <td className="p-3" dir="ltr">{r.month}</td>
                      <td dir="ltr">{r.year}</td>
                      <td>{money(r.due_amount)}</td>
                      <td>{money(r.paid_amount)}</td>
                      <td className={r.outstanding_amount ? 'text-destructive font-semibold' : ''}>
                        {money(r.outstanding_amount)}
                      </td>
                      <td>{paymentStatusLabel[r.payment_status_code] || r.payment_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
      {data && (
        <div className="pointer-events-none fixed left-[-10000px] top-0 w-[794px] bg-white p-8 text-right text-slate-800" aria-hidden="true">
          <div ref={pdfDocumentRef} dir="rtl" className="bg-white">
            <header className="border-b-4 border-[#263a90] pb-5">
              <div className="flex items-start justify-between gap-6">
                <img src="/b-connect-logo.png" alt="B-Connect" className="h-16 w-auto object-contain" />
                <div className="pt-1 text-left" dir="ltr">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#263a90]">B-Connect</p>
                  <h1 className="mt-1 text-2xl font-bold text-slate-900">Subscription Statement</h1>
                  <p className="mt-1 text-sm text-slate-500">كشف حساب الاشتراكات</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm">
                <div>
                  <p className="text-slate-500">العميل</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {data.contract.customer_name_ar || data.contract.customer_name_en || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">بيانات العقد</p>
                  <p className="mt-1 font-bold text-slate-900">
                    كود العميل: {data.contract.customer_code || '—'} · عقد رقم: {data.contract.contract_id}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">الفلاتر المعروضة</p>
                  <p className="mt-1 font-medium">
                    {paymentStatus ? paymentStatusLabel[paymentStatus] : 'كل حالات السداد'} · {statementYear || 'كل السنوات'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">تاريخ الإصدار</p>
                  <p className="mt-1 font-medium" dir="ltr">{reportGeneratedAt()}</p>
                </div>
              </div>
            </header>

            <section className="my-6 grid grid-cols-3 gap-3">
              {[
                ['إجمالي المستحق', data.summary.total_due, 'text-[#263a90]'],
                ['إجمالي المحصل', data.summary.total_paid, 'text-emerald-700'],
                ['إجمالي المتبقي', data.summary.total_outstanding, Number(data.summary.total_outstanding) ? 'text-rose-700' : 'text-emerald-700'],
              ].map(([label, value, color]) => (
                <div key={String(label)} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className={`mt-2 text-lg font-bold ${color}`}>{money(value)}</p>
                </div>
              ))}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">تفاصيل الاستحقاقات الشهرية</h2>
                <span className="rounded-full bg-[#eef1ff] px-3 py-1 text-xs font-semibold text-[#263a90]">
                  {data.rows.length.toLocaleString('en-US')} شهر
                </span>
              </div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#263a90] text-white">
                    {['الشهر', 'السنة', 'المستحق', 'المحصل', 'المتبقي', 'الحالة'].map((header) => (
                      <th key={header} className="border border-[#263a90] px-3 py-2.5 text-right font-semibold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.length ? data.rows.map((row: any, index: number) => (
                    <tr key={row.billing_month} className={index % 2 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="border border-slate-200 px-3 py-2" dir="ltr">{row.month}</td>
                      <td className="border border-slate-200 px-3 py-2" dir="ltr">{row.year}</td>
                      <td className="border border-slate-200 px-3 py-2" dir="ltr">{money(row.due_amount)}</td>
                      <td className="border border-slate-200 px-3 py-2 text-emerald-700" dir="ltr">{money(row.paid_amount)}</td>
                      <td className={`border border-slate-200 px-3 py-2 font-semibold ${row.outstanding_amount ? 'text-rose-700' : 'text-emerald-700'}`} dir="ltr">
                        {money(row.outstanding_amount)}
                      </td>
                      <td className="border border-slate-200 px-3 py-2">{paymentStatusLabel[row.payment_status_code] || row.payment_status}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="border border-slate-200 px-3 py-6 text-center text-slate-500">لا توجد استحقاقات مطابقة للفلاتر.</td></tr>
                  )}
                </tbody>
              </table>
            </section>

            <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-xs leading-6 text-slate-500">
              <p>هذا المستند صادر إلكترونيًا من نظام B-Connect وهو مخصص لمتابعة الاشتراكات الشهرية.</p>
              <p dir="ltr">B-Connect Solutions For All · Generated on {reportGeneratedAt()}</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

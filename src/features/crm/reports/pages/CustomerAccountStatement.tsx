import { useRef, useState, type FormEvent } from 'react';
import { Download, FileDown, Loader2, Printer, RefreshCw, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Input } from 'src/components/ui/input';
import {
  fetchCustomerStatement,
  searchStatementCustomers,
  type CustomerStatement,
  type CustomerStatementCustomer,
} from '../api/customerStatementService';

const pageSize = 25;

const currency = (amount: number | string | null | undefined) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const date = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo' }).format(new Date(value))
    : '—';

const transactionDate = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Africa/Cairo',
    }).format(new Date(value))
    : '—';

const transactionTime = (value: string | null | undefined) => {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '—';
  const hour = Number(match[1]);
  if (hour > 23) return '—';
  return `${String(hour % 12 || 12).padStart(2, '0')}:${match[2]} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const customerName = (customer: CustomerStatementCustomer) =>
  customer.customer_name_ar || customer.customer_name_en || 'بدون اسم';

const transactionTypeLabel = (type: string) => (type === 'INVOICE' ? 'فاتورة' : 'تحصيل');

const responseMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || fallback;

type Filters = {
  startDate: string;
  endDate: string;
  transactionType: '' | 'INVOICE' | 'COLLECTION';
};

const emptyFilters: Filters = { startDate: '', endDate: '', transactionType: '' };
const reportGeneratedAt = () =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Africa/Cairo',
  }).format(new Date());

export default function CustomerAccountStatement() {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<CustomerStatementCustomer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerStatementCustomer | null>(null);
  const [statement, setStatement] = useState<CustomerStatement | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [statementError, setStatementError] = useState('');
  const [pdfStatement, setPdfStatement] = useState<CustomerStatement | null>(null);
  const [pdfExporting, setPdfExporting] = useState(false);
  const pdfDocumentRef = useRef<HTMLDivElement>(null);

  const loadStatement = async (
    contractId: number,
    requestedFilters: Filters = filters,
    requestedPage = 1,
  ) => {
    setLoading(true);
    setStatementError('');
    try {
      const result = await fetchCustomerStatement({
        contractId,
        ...requestedFilters,
        page: requestedPage,
        pageSize,
      });
      setStatement(result);
      setSelectedCustomer(result.customer);
    } catch (error) {
      setStatementError(responseMessage(error, 'تعذر تحميل كشف الحساب.'));
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (event: FormEvent) => {
    event.preventDefault();
    setSearchLoading(true);
    setSearchError('');
    setSearchResults([]);
    setHasSearched(true);
    try {
      const result = await searchStatementCustomers({
        search: searchValue,
        page: 1,
        pageSize: 15,
      });
      setSearchResults(result.rows || []);
    } catch (error) {
      setSearchError(responseMessage(error, 'تعذر البحث عن العميل.'));
    } finally {
      setSearchLoading(false);
    }
  };

  const selectCustomer = (customer: CustomerStatementCustomer) => {
    setSelectedCustomer(customer);
    setStatement(null);
    setSearchResults([]);
    setHasSearched(false);
    void loadStatement(customer.contract_id, filters, 1);
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    if (selectedCustomer) {
      void loadStatement(selectedCustomer.contract_id, emptyFilters, 1);
    }
  };

  const exportExcel = () => {
    if (!statement) return;

    const title = `كشف حساب العميل - ${customerName(statement.customer)}`;
    const sheet = XLSX.utils.aoa_to_sheet([
      [title],
      ['كود العميل', statement.customer.customer_code],
      ['رقم العقد', statement.customer.contract_id],
      [],
      [
        'تاريخ العمليّة',
        'وقت العمليّة',
        'رقم الطلب',
        'رقم الإيصال',
        'طريقة الدفع',
        'الرقم المرجعي',
        'تاريخ الحوالة',
        'البيان',
        'مدين',
        'دائن',
        'الرصيد',
      ],
      ...statement.transactions.map((transaction) => [
        transactionDate(transaction.transaction_date),
        transactionTime(transaction.transaction_time),
        transaction.request_id || '',
        transaction.transaction_type === 'COLLECTION' ? transaction.receipt_number || '' : '',
        transaction.transaction_type === 'COLLECTION' ? transaction.payment_method || '' : '',
        transaction.transaction_type === 'COLLECTION' ? transaction.reference_number || '' : '',
        transaction.transaction_type === 'COLLECTION' ? date(transaction.transfer_date) : '',
        transaction.description,
        transaction.debit,
        transaction.credit,
        transaction.running_balance,
      ]),
    ]);
    sheet['!cols'] = [
      { wch: 14 },
      { wch: 13 },
      { wch: 13 },
      { wch: 22 },
      { wch: 20 },
      { wch: 22 },
      { wch: 15 },
      { wch: 42 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'كشف الحساب');
    XLSX.writeFile(workbook, `customer-statement-${statement.customer.contract_id}.xlsx`);
  };

  const downloadPdf = async () => {
    if (!statement || !selectedCustomer || pdfExporting) return;

    const pdfWindow = window.open('', '_blank', 'width=1100,height=900');
    if (!pdfWindow) {
      setStatementError('تعذر فتح نافذة PDF. يرجى السماح بالنوافذ المنبثقة ثم حاول مرة أخرى.');
      return;
    }
    setPdfExporting(true);
    try {
      const firstPage = await fetchCustomerStatement({
        contractId: selectedCustomer.contract_id,
        ...filters,
        page: 1,
        pageSize: 100,
      });
      const allTransactions = [...firstPage.transactions];
      for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
        const nextPage = await fetchCustomerStatement({
          contractId: selectedCustomer.contract_id,
          ...filters,
          page,
          pageSize: 100,
        });
        allTransactions.push(...nextPage.transactions);
      }

      setPdfStatement({
        ...firstPage,
        transactions: allTransactions,
        pagination: {
          ...firstPage.pagination,
          page: 1,
          pageSize: allTransactions.length,
          totalPages: 1,
        },
      });
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => window.setTimeout(resolve, 100)),
      );

      if (!pdfDocumentRef.current) throw new Error('تعذر تجهيز ملف PDF.');
      const copiedStyles = Array.from(document.querySelectorAll('style'))
        .map((style) => style.outerHTML)
        .join('\n');
      const linkedStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map((link) => link.outerHTML)
        .join('\n');
      pdfWindow.document.title = `B-Connect Customer Statement ${statement.customer.contract_id}`;
      pdfWindow.document
        .write(`<!doctype html><html dir="rtl"><head><meta charset="utf-8" /><title>${pdfWindow.document.title}</title>${linkedStyles}${copiedStyles}<style>
        @page { size: A4 landscape; margin: 9mm; }
        body { margin: 0; background: #fff; font-family: Tahoma, Arial, sans-serif; color: #1e293b; }
        .statement-pdf { width: 100%; }
        .statement-pdf table { width: 100%; border-collapse: collapse; }
        .statement-pdf thead { display: table-header-group; }
        .statement-pdf tr { break-inside: avoid; page-break-inside: avoid; }
        .statement-pdf footer { break-inside: avoid; page-break-inside: avoid; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body><main class="statement-pdf">${pdfDocumentRef.current.innerHTML}</main></body></html>`);
      pdfWindow.document.close();
      window.setTimeout(() => {
        pdfWindow.focus();
        pdfWindow.print();
      }, 350);
    } catch (error) {
      setStatementError(responseMessage(error, 'تعذر إنشاء ملف PDF.'));
    } finally {
      setPdfStatement(null);
      setPdfExporting(false);
    }
  };

  const pagination = statement?.pagination;
  const transactions = statement?.transactions || [];
  const firstVisibleRow = pagination?.totalCount
    ? (pagination.page - 1) * pagination.pageSize + 1
    : 0;
  const lastVisibleRow = pagination?.totalCount
    ? Math.min(pagination.page * pagination.pageSize, pagination.totalCount)
    : 0;

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">كشف حساب العميل</h1>
          <p className="mt-1 text-sm text-muted-foreground">كشف مالي موحّد لكل عميل.</p>
        </div>
        {statement && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportExcel} disabled={loading}>
              <Download className="ml-2 h-4 w-4" /> تصدير Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => void downloadPdf()}
              disabled={loading || pdfExporting}
            >
              {pdfExporting ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="ml-2 h-4 w-4" />
              )}
              تحميل PDF
            </Button>
            {/* <Button variant="outline" onClick={() => window.print()} disabled={loading}>
              <Printer className="ml-2 h-4 w-4" /> طباعة / حفظ PDF
            </Button> */}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اختيار الصيدلية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={searchCustomers}>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="pr-9"
                placeholder="كود العميل أو اسم الصيدلية أو رقم العقد"
                aria-label="البحث عن عميل أو عقد"
              />
            </div>
            <Button type="submit" disabled={searchLoading}>
              <Search className="ml-2 h-4 w-4" />
              {searchLoading ? 'جارٍ البحث...' : 'بحث'}
            </Button>
          </form>
          {searchError && <p className="text-sm text-destructive">{searchError}</p>}
          {searchResults.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {searchResults.map((customer) => (
                <button
                  type="button"
                  key={customer.contract_id}
                  onClick={() => selectCustomer(customer)}
                  className="rounded-md border p-3 text-right transition-colors hover:border-primary hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <span className="block font-semibold">{customerName(customer)}</span>
                  <span className="mt-1 block text-xs text-muted-foreground" dir="ltr">
                    Customer: {customer.customer_code} · Contract: {customer.contract_id}
                  </span>
                </button>
              ))}
            </div>
          )}
          {!searchLoading && !searchError && hasSearched && searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground">لا توجد صيدليات مطابقة لبيانات البحث.</p>
          )}
        </CardContent>
      </Card>

      {selectedCustomer && (
        <>
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-md bg-muted/50 p-3 xl:col-span-2">
                <p className="text-xs text-muted-foreground">العميل / الصيدلية</p>
                <p className="mt-1 font-semibold">{customerName(selectedCustomer)}</p>
                <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                  Code: {selectedCustomer.customer_code} · Contract: {selectedCustomer.contract_id}
                </p>
              </div>
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
              <label className="grid gap-1 text-sm">
                <span>نوع الحركة</span>
                <select
                  value={filters.transactionType}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      transactionType: event.target.value as Filters['transactionType'],
                    })
                  }
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">كل الحركات</option>
                  <option value="INVOICE">فواتير (مدين)</option>
                  <option value="COLLECTION">تحصيلات (دائن)</option>
                </select>
              </label>
              <div className="flex items-end gap-2 md:col-span-2 xl:col-span-5">
                <Button
                  onClick={() => void loadStatement(selectedCustomer.contract_id, filters, 1)}
                  disabled={loading}
                >
                  <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  تطبيق الفلاتر
                </Button>
                <Button variant="outline" onClick={resetFilters} disabled={loading}>
                  إعادة تعيين
                </Button>
              </div>
            </CardContent>
          </Card>

          {statement && !loading && (
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-l from-primary/10 via-background to-emerald-500/10 shadow-sm">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">إجمالي الرصيد</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    صافي الرصيد بعد الفواتير والتحصيلات المعروضة
                  </p>
                </div>
                <div className="flex items-center gap-4 sm:text-left" dir="ltr">
                  <p
                    className={`text-2xl font-bold tracking-tight ${
                      statement.summary.closingBalance > 0
                        ? 'text-rose-700 dark:text-rose-400'
                        : statement.summary.closingBalance < 0
                          ? 'text-primary'
                          : 'text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {currency(statement.summary.closingBalance)}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statement.summary.closingBalance > 0
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        : statement.summary.closingBalance < 0
                          ? 'bg-primary/10 text-primary'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    {statement.summary.closingBalance > 0
                      ? 'رصيد مستحق'
                      : statement.summary.closingBalance < 0
                        ? 'رصيد دائن'
                        : 'لا يوجد رصيد'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>
                الحركات المالية{' '}
                {pagination ? `(${pagination.totalCount.toLocaleString('en-US')})` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              {statementError ? (
                <p className="p-6 text-destructive">{statementError}</p>
              ) : loading ? (
                <p className="p-6 text-muted-foreground">جارٍ تحميل كشف الحساب...</p>
              ) : statement ? (
                <table className="w-full min-w-[1480px] text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {[
                        'تاريخ العمليّة',
                        'وقت العمليّة',
                        'رقم الطلب',
                        'رقم الإيصال',
                        'طريقة الدفع',
                        'الرقم المرجعي',
                        'تاريخ الحوالة',
                        'البيان',
                        'مدين',
                        'دائن',
                        'الرصيد',
                      ].map((label) => (
                        <th
                          key={label}
                          className="whitespace-nowrap px-4 py-3 text-right font-semibold"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length ? (
                      transactions.map((transaction) => (
                        <tr
                          key={`${transaction.transaction_type}-${transaction.transaction_id}`}
                          className="border-t"
                        >
                          <td className="whitespace-nowrap px-4 py-3" dir="ltr">
                            {transactionDate(transaction.transaction_date)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3" dir="ltr">
                            {transactionTime(transaction.transaction_time)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3" dir="ltr">
                            {transaction.request_id || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3" dir="ltr">
                            {transaction.transaction_type === 'COLLECTION'
                              ? transaction.receipt_number || '—'
                              : ''}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {transaction.transaction_type === 'COLLECTION'
                              ? transaction.payment_method || '—'
                              : ''}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3" dir="ltr">
                            {transaction.transaction_type === 'COLLECTION'
                              ? transaction.reference_number || '—'
                              : ''}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3" dir="ltr">
                            {transaction.transaction_type === 'COLLECTION'
                              ? date(transaction.transfer_date)
                              : ''}
                          </td>
                          <td className="px-4 py-3">
                            <span>{transaction.description}</span>
                            <span className="mr-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {transactionTypeLabel(transaction.transaction_type)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3" dir="ltr">
                            {transaction.debit ? currency(transaction.debit) : '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3" dir="ltr">
                            {transaction.credit ? currency(transaction.credit) : '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-semibold" dir="ltr">
                            {currency(transaction.running_balance)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-muted-foreground">
                          لا توجد حركات مطابقة للفلاتر.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <p className="p-6 text-muted-foreground">اختر صيدلية لعرض حركاتها المالية.</p>
              )}
              {pagination && pagination.totalCount > 0 && !loading && !statementError && (
                <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-muted-foreground">
                    عرض {firstVisibleRow.toLocaleString('en-US')}–
                    {lastVisibleRow.toLocaleString('en-US')} من{' '}
                    {pagination.totalCount.toLocaleString('en-US')} حركة
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void loadStatement(
                          selectedCustomer.contract_id,
                          filters,
                          pagination.page - 1,
                        )
                      }
                      disabled={pagination.page <= 1}
                    >
                      السابق
                    </Button>
                    <span className="min-w-24 text-center text-xs text-muted-foreground">
                      صفحة {pagination.page.toLocaleString('en-US')} من{' '}
                      {pagination.totalPages.toLocaleString('en-US')}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void loadStatement(
                          selectedCustomer.contract_id,
                          filters,
                          pagination.page + 1,
                        )
                      }
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
      {pdfStatement && (
        <div
          className="pointer-events-none fixed left-[-10000px] top-0 w-[1123px] bg-white p-8 text-right text-slate-800"
          aria-hidden="true"
        >
          <div ref={pdfDocumentRef} dir="rtl" className="bg-white">
            <header className="border-b-4 border-[#263a90] pb-5">
              <div className="flex items-start justify-between gap-6">
                <img
                  src="/b-connect-logo.png"
                  alt="B-Connect"
                  className="h-20 w-auto object-contain"
                />
                <div className="pt-1 text-left" dir="ltr">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#263a90]">
                    B-Connect
                  </p>
                  <h1 className="mt-1 text-2xl font-bold text-slate-900">
                    Customer Account Statement
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">كشف حساب العميل والعقد</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm">
                <div>
                  <p className="text-slate-500">العميل / الصيدلية</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {customerName(pdfStatement.customer)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">بيانات العقد</p>
                  <p className="mt-1 font-bold text-slate-900">
                    كود العميل: {pdfStatement.customer.customer_code} · عقد رقم:{' '}
                    {pdfStatement.customer.contract_id}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">الفترة</p>
                  <p className="mt-1 font-medium">
                    {filters.startDate ? date(filters.startDate) : 'من بداية الحساب'} —{' '}
                    {filters.endDate ? date(filters.endDate) : 'حتى تاريخ الإصدار'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">تاريخ الإصدار</p>
                  <p className="mt-1 font-medium">{reportGeneratedAt()}</p>
                </div>
              </div>
            </header>

            <section className="my-6 grid grid-cols-4 gap-3">
              {[
                ['الرصيد الافتتاحي', pdfStatement.summary.openingBalance, 'text-slate-800'],
                ['إجمالي الفواتير', pdfStatement.summary.totalDebit, 'text-[#263a90]'],
                ['إجمالي التحصيلات', pdfStatement.summary.totalCredit, 'text-emerald-700'],
                [
                  'الرصيد الختامي',
                  pdfStatement.summary.closingBalance,
                  pdfStatement.summary.closingBalance > 0 ? 'text-rose-700' : 'text-emerald-700',
                ],
              ].map(([label, value, className]) => (
                <div key={String(label)} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className={`mt-2 text-lg font-bold ${className}`}>
                    {currency(value as number)}
                  </p>
                </div>
              ))}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">تفاصيل الحركات المالية</h2>
                <span className="rounded-full bg-[#eef1ff] px-3 py-1 text-xs font-semibold text-[#263a90]">
                  {pdfStatement.transactions.length.toLocaleString('en-US')} حركة
                </span>
              </div>
              <table className="w-full border-collapse text-[9px]">
                <thead>
                  <tr className="bg-[#263a90] text-white">
                    {[
                      'التاريخ',
                      'الوقت',
                      'رقم الطلب',
                      'البيان',
                      'طريقة الدفع',
                      'رقم الإيصال',
                      'الرقم المرجعي',
                      'تاريخ الحوالة',
                      'مدين',
                      'دائن',
                      'الرصيد',
                    ].map((label) => (
                      <th
                        key={label}
                        className="border border-[#263a90] px-1.5 py-2 text-right font-semibold"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pdfStatement.transactions.length ? (
                    pdfStatement.transactions.map((transaction, index) => (
                      <tr
                        key={`${transaction.transaction_type}-${transaction.transaction_id}`}
                        className={index % 2 ? 'bg-slate-50' : 'bg-white'}
                      >
                        <td
                          className="whitespace-nowrap border border-slate-200 px-1.5 py-2"
                          dir="ltr"
                        >
                          {transactionDate(transaction.transaction_date)}
                        </td>
                        <td
                          className="whitespace-nowrap border border-slate-200 px-1.5 py-2"
                          dir="ltr"
                        >
                          {transactionTime(transaction.transaction_time)}
                        </td>
                        <td className="border border-slate-200 px-1.5 py-2" dir="ltr">
                          {transaction.request_id || '—'}
                        </td>
                        <td className="border border-slate-200 px-1.5 py-2">
                          {transaction.description}
                          <span className="mr-1 text-[9px] text-slate-400">
                            ({transactionTypeLabel(transaction.transaction_type)})
                          </span>
                        </td>
                        <td className="border border-slate-200 px-1.5 py-2">
                          {transaction.transaction_type === 'COLLECTION'
                            ? transaction.payment_method || '—'
                            : '—'}
                        </td>
                        <td className="border border-slate-200 px-1.5 py-2" dir="ltr">
                          {transaction.transaction_type === 'COLLECTION'
                            ? transaction.receipt_number || '—'
                            : '—'}
                        </td>
                        <td className="border border-slate-200 px-1.5 py-2" dir="ltr">
                          {transaction.transaction_type === 'COLLECTION'
                            ? transaction.reference_number || '—'
                            : '—'}
                        </td>
                        <td
                          className="whitespace-nowrap border border-slate-200 px-1.5 py-2"
                          dir="ltr"
                        >
                          {transaction.transaction_type === 'COLLECTION'
                            ? date(transaction.transfer_date)
                            : '—'}
                        </td>
                        <td
                          className="whitespace-nowrap border border-slate-200 px-1.5 py-2"
                          dir="ltr"
                        >
                          {transaction.debit ? currency(transaction.debit) : '—'}
                        </td>
                        <td
                          className="whitespace-nowrap border border-slate-200 px-1.5 py-2"
                          dir="ltr"
                        >
                          {transaction.credit ? currency(transaction.credit) : '—'}
                        </td>
                        <td
                          className="whitespace-nowrap border border-slate-200 px-1.5 py-2 font-semibold"
                          dir="ltr"
                        >
                          {currency(transaction.running_balance)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={11}
                        className="border border-slate-200 px-3 py-6 text-center text-slate-500"
                      >
                        لا توجد حركات مطابقة للفلاتر.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-xs leading-6 text-slate-500">
              <p>
                هذا المستند صادر إلكترونيًا من نظام B-Connect وهو مخصص للمتابعة المالية للعميل
                والعقد.
              </p>
              <p dir="ltr">B-Connect Solutions For All · Generated on {reportGeneratedAt()}</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

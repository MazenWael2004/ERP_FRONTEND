import * as React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

import {
  Search,
  RefreshCw,
  WalletCards,
  ReceiptText,
  CalendarDays,
  Building2,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Hash,
  CircleDollarSign,
} from 'lucide-react';

import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';

import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';

import { Textarea } from 'src/components/ui/textarea';
import { Checkbox } from 'src/components/ui/checkbox';
import { masterfileColumns } from '../../reports/pages/MasterfileReport';
import { createCollectionSchema, mapZodErrors } from '../validation';
import {
  fetchPaidMonths,
  getScopedContracts,
  paySelectedMonths,
  type ScopedContract,
} from '../api/targetService';

// These sales aggregates belong to the masterfile report. Target rows are
// scoped contract records and do not include invoice-line aggregates.
const targetMasterfileColumns = masterfileColumns.filter(
  (column) => ![
    'additionalServicesQuantity',
    'additionalServicesTotal',
    'additionalUnitsQuantity',
    'additionalUnitsTotal',
    'replicationServiceQuantity',
    'replicationServiceTotal',
    'hardDiskReplacementQuantity',
    'hardDiskReplacementTotal',
    'inventoryCountServiceQuantity',
    'inventoryCountServiceTotal',
  ].includes(column.key),
);

type TargetContractRow = ScopedContract & {
  id: number;
  customerName: string;
  zoneName: string;
  customerCode: string;
  contractNumber: string;
  representativeName: string;
  subscriptionPrice: number;
  monthlyAmount: number;
  nextDueDate: string;
  lastPaidMonth: string;
  paidMonths: string[];
};

function formatContractDate(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Africa/Cairo',
  }).format(date);
}
function mapScopedContractToTargetRow(contract: ScopedContract): TargetContractRow {
  const subscriptionPrice = Number(contract.subscription_price || 0);
  const discountPercentage = Number(contract.discount_percentage || 0);
  const monthlyAmount = Number(
    (subscriptionPrice * (1 - discountPercentage / 100)).toFixed(2),
  );

  return {
    ...contract,
    id: contract.id,
    customerName: contract.customer_name_ar || 'عميل بدون اسم',
    zoneName: contract.zone_name_ar || '—',
    customerCode: contract.customer_code || '—',
    contractNumber: contract.contract_number || String(contract.id),
    representativeName: contract.representative_name_ar || '—',
    subscriptionPrice,
    monthlyAmount,
    nextDueDate: formatContractDate(contract.next_subscription_due_date),
    lastPaidMonth: formatContractDate(contract.last_paid_month),
    paidMonths: [],
  };
}
const paymentMethods = [
  {
    id: '1',
    label: 'نقدي',
    value: 'CASH',
  },
  {
    id: '2',
    label: 'تحويل بنكي',
    value: 'BANK_TRANSFER',
  },
  {
    id: '3',
    label: 'بطاقة ائتمان',
    value: 'CREDIT_CARD',
  },
  {
    id: '4',
    label: 'شيك',
    value: 'CHEQUE',
  },
  {
    id: '5',
    label: 'إنستاباي',
    value: 'INSTAPAY',
  },
  {
    id: '6',
    label: 'باي سكاي',
    value: 'PAYSKY',
  },
];

function money(value: any) {
  return `${Number(value || 0).toLocaleString('ar-EG')} ج.م`;
}

function generateMonthOptions() {
  const months = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const monthName = date.toLocaleDateString('ar-EG', {
      month: 'long',
    });

    months.push({
      id: `${year}-${String(month).padStart(2, '0')}`,
      value: `${year}-${String(month).padStart(2, '0')}`,
      year,
      month,
      label: `${monthName} ${year}`,
    });
  }

  return months;
}

export default function SubscriptionCollectionPage() {
  const [customers, setCustomers] = React.useState<TargetContractRow[]>([]);
  const [isContractsLoading, setIsContractsLoading] = React.useState(true);
  const [contractsLoadError, setContractsLoadError] = React.useState('');

  const [search, setSearch] = React.useState('');

  const [collectionOpen, setCollectionOpen] = React.useState(false);

  const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null);

  const [selectedMonths, setSelectedMonths] = React.useState<string[]>([]);

  const [monthAmounts, setMonthAmounts] = React.useState<any>({});

  const [collectionDate, setCollectionDate] = React.useState(
    new Date().toISOString().split('T')[0],
  );

  const [receiptNumber, setReceiptNumber] = React.useState('');

  const [paymentMethodId, setPaymentMethodId] = React.useState('1');

  const [notes, setNotes] = React.useState('');

  const [paymentDetails, setPaymentDetails] = React.useState({
    bankName: '',
    chequeNumber: '',
    chequeDueDate: '',
    referenceNumber: '',
    transactionDate: '',
  });

  const [validationErrors, setValidationErrors] = React.useState<any>({ monthAmounts: {} });

  const [isPaidMonthsLoading, setIsPaidMonthsLoading] = React.useState(false);
  const [isCollectionSubmitting, setIsCollectionSubmitting] = React.useState(false);
  const [paidMonthsLoadError, setPaidMonthsLoadError] = React.useState('');

  const monthOptions = React.useMemo(() => generateMonthOptions(), []);

  const paymentMethodCode = paymentMethods.find((method) => method.id === paymentMethodId)?.value || '';

  const loadScopedContracts = React.useCallback(async () => {
    setIsContractsLoading(true);
    setContractsLoadError('');

    try {
      const contracts = await getScopedContracts();
      setCustomers((contracts || []).map(mapScopedContractToTargetRow));
    } catch (error) {
      console.error('Failed to load scoped contracts:', error);
      setContractsLoadError('تعذر تحميل العقود. حاول مرة أخرى.');
    } finally {
      setIsContractsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadScopedContracts();
  }, [loadScopedContracts]);

  const clearValidationError = (field: string) => {
    setValidationErrors((current: any) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const clearMonthAmountError = (monthValue: string) => {
    setValidationErrors((current: any) => ({
      ...current,
      monthAmounts: {
        ...(current.monthAmounts || {}),
        [monthValue]: undefined,
      },
    }));
  };

  const filteredCustomers = React.useMemo(() => {
    return customers.filter((customer: any) => {
      const text = search.trim().toLowerCase();

      if (!text) {
        return true;
      }

      return (
        customer.customerName.toLowerCase().includes(text) ||
        customer.zoneName.toLowerCase().includes(text) ||
        customer.customerCode.toLowerCase().includes(text) ||
        customer.contractNumber.toLowerCase().includes(text) ||
        customer.representativeName.toLowerCase().includes(text)
      );
    });
  }, [customers, search]);

  const totalMonthlySubscriptions = React.useMemo(() => {
    return customers.reduce(
      (total: number, customer: any) => total + Number(customer.monthlyAmount || 0),
      0,
    );
  }, [customers]);

  const selectedTotal = React.useMemo(() => {
    return selectedMonths.reduce((total: number, monthValue: string) => {
      return total + Number(monthAmounts[monthValue] || 0);
    }, 0);
  }, [selectedMonths, monthAmounts]);

  const openCollection = async (customer: any) => {
    setSelectedCustomer({ ...customer, paidMonths: [] });
    setSelectedMonths([]);
    setPaidMonthsLoadError('');

    const defaultAmounts: any = {};

    for (const month of monthOptions) {
      defaultAmounts[month.value] = Number(customer.monthlyAmount || 0);
    }

    setMonthAmounts(defaultAmounts);
    setCollectionDate(new Date().toISOString().split('T')[0]);
    setReceiptNumber(`RCPT-${Date.now().toString().slice(-7)}`);
    setPaymentMethodId('1');
    setPaymentDetails({ bankName: '', chequeNumber: '', chequeDueDate: '', referenceNumber: '', transactionDate: '' });
    setNotes('');
    setValidationErrors({ monthAmounts: {} });
    setCollectionOpen(true);
    setIsPaidMonthsLoading(true);

    try {
      const paidMonths = await fetchPaidMonths(customer.id);

      setSelectedCustomer((current: any) =>
        current?.id === customer.id ? { ...current, paidMonths } : current,
      );
    } catch (error) {
      console.error('Failed to load paid months:', error);
      setPaidMonthsLoadError('تعذر تحميل الشهور المسددة. يمكنك إعادة فتح العقد للمحاولة مرة أخرى.');
    } finally {
      setIsPaidMonthsLoading(false);
    }
  };

  const isMonthPaid = (monthValue: string) => {
    if (!selectedCustomer) {
      return false;
    }

    return (selectedCustomer.paidMonths || []).includes(monthValue);
  };

  const toggleMonth = (monthValue: string) => {
    if (isPaidMonthsLoading || isMonthPaid(monthValue)) {
      return;
    }

    clearValidationError('selectedMonths');
    clearMonthAmountError(monthValue);

    setSelectedMonths((current: string[]) => {
      if (current.includes(monthValue)) {
        return current.filter((value: string) => value !== monthValue);
      }

      return [...current, monthValue];
    });
  };

  const updateMonthAmount = (monthValue: string, value: string) => {
    clearMonthAmountError(monthValue);
    clearValidationError('amount');

    const amount = value === '' ? '' : Number(value);

    setMonthAmounts((current: any) => ({
      ...current,
      [monthValue]: amount,
    }));
  };

  const handleSubmitCollection = async () => {
    if (!selectedCustomer || isPaidMonthsLoading || isCollectionSubmitting) {
      return;
    }

    const paymentDetailsError =
      paymentMethodCode === 'CHEQUE' && (!paymentDetails.bankName.trim() || !paymentDetails.chequeNumber.trim() || !paymentDetails.chequeDueDate)
        ? 'أدخل البنك ورقم الشيك وتاريخ استحقاقه.'
        : (paymentMethodCode === 'INSTAPAY' || paymentMethodCode === 'PAYSKY') && (!paymentDetails.referenceNumber.trim() || !paymentDetails.transactionDate)
          ? 'أدخل الرقم المرجعي وتاريخ العملية.'
          : '';

    if (paymentDetailsError) {
      setValidationErrors((current: any) => ({ ...current, paymentDetails: paymentDetailsError }));
      return;
    }

    const payload = {
      contractId: selectedCustomer.id,
      collectionDate,
      receiptNumber,
      paymentMethodId: Number(paymentMethodId),
      amount: selectedTotal,
      notes,
      ...(paymentMethodCode === 'CHEQUE' || paymentMethodCode === 'INSTAPAY' || paymentMethodCode === 'PAYSKY'
        ? { paymentDetails }
        : {}),
      selectedMonths,
      monthPayments: selectedMonths.map((monthValue: string) => ({
        month: monthValue,
        amount: Number(monthAmounts[monthValue]),
      })),
    };

    const schema = createCollectionSchema({
      monthlyAmount: Number(selectedCustomer.monthlyAmount),
      paidMonths: selectedCustomer.paidMonths || [],
      allowedMonths: monthOptions.map((month: any) => month.value),
    });

    const result = schema.safeParse(payload);

    if (!result.success) {
      setValidationErrors(mapZodErrors(result.error, payload));
      return;
    }

    setValidationErrors({ monthAmounts: {} });

    // Radix Dialog disables pointer events outside its content. Close it before
    // mounting SweetAlert, which renders in document.body.
    setCollectionOpen(false);
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
    });

    const confirmation = await Swal.fire({
      icon: 'question',
      title: 'تأكيد عملية التحصيل',
      text: `سيتم تسجيل تحصيل بقيمة ${money(result.data.amount)}. هل تريد المتابعة؟`,
      showCancelButton: true,
      confirmButtonText: 'تأكيد التحصيل',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) {
      setCollectionOpen(true);
      return;
    }

    setIsCollectionSubmitting(true);
    void Swal.fire({
      title: 'جارٍ تسجيل التحصيل...',
      text: 'يرجى الانتظار حتى يتم حفظ العملية.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await paySelectedMonths(result.data);

      Swal.close();
      await Swal.fire({
        icon: 'success',
        title: 'تم تسجيل التحصيل بنجاح',
        text: response?.message || 'تم حفظ عملية تحصيل الاشتراكات الشهرية.',
        confirmButtonText: 'حسناً',
      });

      setCollectionOpen(false);
      void loadScopedContracts();
    } catch (error) {
      Swal.close();

      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error?.message
        : undefined;

      await Swal.fire({
        icon: 'error',
        title: 'تعذر تسجيل التحصيل',
        text: message || 'حدث خطأ أثناء حفظ عملية التحصيل. حاول مرة أخرى.',
        confirmButtonText: 'حسناً',
      });

      setCollectionOpen(true);
    } finally {
      setIsCollectionSubmitting(false);
    }
  };
  return (
    <div dir="rtl" className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">أهدافي</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              تعرض كل العقود اللي تم تفعيلها اللتي في مناطق المندوب
            </p>
          </div>

          <Button
            variant="outline"
            className="gap-2 self-start"
            onClick={loadScopedContracts}
            disabled={isContractsLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isContractsLoading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
        </div>

        {/* Statistics */}
        {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">العملاء المتاح تحصيلهم</p>

                <p className="mt-2 text-2xl font-bold">{customers.length}</p>

                <p className="mt-1 text-xs text-muted-foreground">عقود متاحة للتحصيل</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الاشتراكات الشهرية</p>

                <p className="mt-2 text-2xl font-bold">{money(totalMonthlySubscriptions)}</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  إجمالي قيمة الاشتراك الشهري للعقود
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-600">
                <WalletCards className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">فترة التحصيل المتاحة</p>

                <p className="mt-2 text-2xl font-bold">12 شهر</p>

                <p className="mt-1 text-xs text-muted-foreground">بدايةً من الشهر الحالي</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600">
                <CalendarDays className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Customers Table */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <CardTitle className="text-lg">العقود</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  اختر عقداً لتسجيل عملية تحصيل جديدة
                </p>
              </div>

              <div className="relative w-full lg:w-[360px]">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث باسم العميل، العقد أو المندوب..."
                  className="h-10 pr-10"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[8400px] text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    {targetMasterfileColumns.map((column) => (
                      <th
                        key={column.key}
                        className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-muted-foreground"
                      >
                        {column.header}
                      </th>
                    ))}
                    <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold text-muted-foreground">الإجراء</th>
                  </tr>
                </thead>

                <tbody>
                  {isContractsLoading && (
                    <tr>
                      <td colSpan={targetMasterfileColumns.length + 1} className="px-5 py-14 text-center">
                        <RefreshCw className="mx-auto mb-3 h-9 w-9 animate-spin text-primary" />
                        <p className="font-medium">جارٍ تحميل العقود...</p>
                      </td>
                    </tr>
                  )}

                  {contractsLoadError && (
                    <tr>
                      <td colSpan={targetMasterfileColumns.length + 1} className="px-5 py-14 text-center">
                        <AlertCircle className="mx-auto mb-3 h-9 w-9 text-destructive" />
                        <p className="font-medium">{contractsLoadError}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={loadScopedContracts}
                        >
                          إعادة المحاولة
                        </Button>
                      </td>
                    </tr>
                  )}
                  {!isContractsLoading &&
                    !contractsLoadError &&
                    filteredCustomers.map((customer: any) => (
                      <tr
                        key={customer.id}
                        className="border-b transition-colors last:border-0 hover:bg-muted/30"
                      >
                        {targetMasterfileColumns.map((column) => (
                          <td key={column.key} className="max-w-xs whitespace-nowrap px-4 py-3 text-right">
                            {column.value(customer)}
                          </td>
                        ))}
                        <td className="whitespace-nowrap px-4 py-3 text-center">
                          <Button size="sm" onClick={() => openCollection(customer)}>
                            <Banknote className="ml-2 h-4 w-4" />
                            تسجيل تحصيل
                          </Button>
                        </td>
                      </tr>
                    ))}

                  {!isContractsLoading && !contractsLoadError && filteredCustomers.length === 0 && (
                    <tr>
                    <td colSpan={targetMasterfileColumns.length + 1} className="px-5 py-14 text-center">
                        <Search className="mx-auto mb-3 h-9 w-9 text-muted-foreground/50" />

                        <p className="font-medium">لا توجد نتائج</p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          لا يوجد عميل مطابق لعملية البحث
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Dialog */}
      <Dialog open={collectionOpen} onOpenChange={setCollectionOpen}>
        <DialogContent dir="rtl" className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ReceiptText className="h-5 w-5 text-primary" />
              تسجيل تحصيل اشتراك
            </DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6 py-2">
              {/* Customer Information */}
              <div className="grid grid-cols-1 gap-3 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoItem label="العميل" value={selectedCustomer.customerName} />

                <InfoItem label="الفرع" value={selectedCustomer.zoneName} />

                <InfoItem label="رقم العقد" value={selectedCustomer.contractNumber} />

                <InfoItem
                  label="قيمة الاشتراك الشهري"
                  value={money(selectedCustomer.monthlyAmount)}
                />
              </div>

              {isPaidMonthsLoading && (
                <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  جاري تحميل الشهور المسددة لهذا العقد...
                </div>
              )}

              {paidMonthsLoadError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {paidMonthsLoadError}
                </div>
              )}

              {/* Collection Information */}
              <div>
                <SectionTitle icon={<ReceiptText className="h-4 w-4" />} title="بيانات التحصيل" />

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Collection Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">تاريخ التحصيل</label>

                    <Input
                      type="date"
                      value={collectionDate}
                      onChange={(e) => {
                        setCollectionDate(e.target.value);
                        clearValidationError('collectionDate');
                      }}
                      className={`h-11 ${
                        validationErrors.collectionDate ? 'border-destructive' : ''
                      }`}
                    />

                    <FieldError message={validationErrors.collectionDate} />
                  </div>

                  {/* Receipt Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      رقم الإيصال
                      <span className="mr-1 text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Hash className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        value={receiptNumber}
                        onChange={(e) => {
                          setReceiptNumber(e.target.value);
                          clearValidationError('receiptNumber');
                        }}
                        className={`h-11 pr-10 ${
                          validationErrors.receiptNumber ? 'border-destructive' : ''
                        }`}
                        placeholder="أدخل رقم الإيصال"
                      />
                    </div>

                    <FieldError message={validationErrors.receiptNumber} />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      طريقة الدفع
                      <span className="mr-1 text-red-500">*</span>
                    </label>

                    <Select
                      value={paymentMethodId}
                      onValueChange={(value) => {
                        setPaymentMethodId(value);
                        clearValidationError('paymentMethodId');
                      }}
                    >
                      <SelectTrigger
                        className={`h-11 ${
                          validationErrors.paymentMethodId ? 'border-destructive' : ''
                        }`}
                      >
                        <SelectValue placeholder="اختر طريقة الدفع" />
                      </SelectTrigger>

                      <SelectContent>
                        {paymentMethods.map((method: any) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldError message={validationErrors.paymentMethodId} />
                  </div>

                  {paymentMethodCode === 'CHEQUE' && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">بيانات الشيك</label>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Input
                          value={paymentDetails.bankName}
                          onChange={(event) => {
                            setPaymentDetails((current) => ({ ...current, bankName: event.target.value }));
                            clearValidationError('paymentDetails');
                          }}
                          placeholder="اسم البنك"
                          className="h-11"
                        />
                        <Input
                          value={paymentDetails.chequeNumber}
                          onChange={(event) => {
                            setPaymentDetails((current) => ({
                              ...current,
                              chequeNumber: event.target.value.replace(/\D/g, ''),
                            }));
                            clearValidationError('paymentDetails');
                          }}
                          placeholder="رقم الشيك"
                          className="h-11"
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                        <Input
                          type="date"
                          value={paymentDetails.chequeDueDate}
                          onChange={(event) => {
                            setPaymentDetails((current) => ({ ...current, chequeDueDate: event.target.value }));
                            clearValidationError('paymentDetails');
                          }}
                          className="h-11"
                        />
                      </div>
                      <FieldError message={validationErrors.paymentDetails} />
                    </div>
                  )}

                  {(paymentMethodCode === 'INSTAPAY' || paymentMethodCode === 'PAYSKY') && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">بيانات العملية الإلكترونية</label>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input
                          value={paymentDetails.referenceNumber}
                          onChange={(event) => {
                            setPaymentDetails((current) => ({ ...current, referenceNumber: event.target.value }));
                            clearValidationError('paymentDetails');
                          }}
                          placeholder="الرقم المرجعي"
                          className="h-11"
                        />
                        <Input
                          type="date"
                          value={paymentDetails.transactionDate}
                          onChange={(event) => {
                            setPaymentDetails((current) => ({ ...current, transactionDate: event.target.value }));
                            clearValidationError('paymentDetails');
                          }}
                          className="h-11"
                        />
                      </div>
                      <FieldError message={validationErrors.paymentDetails} />
                    </div>
                  )}

                  {/* Read-only Collection Amount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">المبلغ المحصل</label>

                    <div className="relative">
                      <CircleDollarSign className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        type="number"
                        value={selectedTotal}
                        readOnly
                        className="h-11 bg-muted/50 pr-10 font-semibold"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      يتم حساب المبلغ تلقائياً من قيم الشهور المختارة
                    </p>

                    <FieldError message={validationErrors.amount} />
                  </div>
                </div>
              </div>

              {/* Months */}
              <div>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <SectionTitle icon={<CalendarDays className="h-4 w-4" />} title="شهور التحصيل" />

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      اختر الشهور وحدد قيمة التحصيل لكل شهر
                    </span>

                    {selectedMonths.length > 0 && (
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {selectedMonths.length} شهر
                      </span>
                    )}
                  </div>
                </div>

                <FieldError message={validationErrors.selectedMonths} className="mt-3" />

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {monthOptions.map((month: any) => {
                    const selected = selectedMonths.includes(month.value);

                    const paid = isMonthPaid(month.value);
                    const disabled = paid || isPaidMonthsLoading;

                    const monthAmount = monthAmounts[month.value] ?? '';

                    return (
                      <div
                        key={month.value}
                        onClick={() => {
                          if (!disabled) {
                            toggleMonth(month.value);
                          }
                        }}
                        className={`rounded-2xl border p-4 transition-all ${
                          paid
                            ? 'cursor-not-allowed border-green-500/30 bg-green-500/5'
                            : selected
                              ? 'cursor-pointer border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                              : 'cursor-pointer hover:border-primary/40 hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <Checkbox
                              checked={paid || selected}
                              disabled={disabled}
                              onCheckedChange={() => toggleMonth(month.value)}
                              onClick={(e) => e.stopPropagation()}
                            />

                            <div className="min-w-0">
                              <p className="font-semibold">{month.label}</p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                الاشتراك الكامل: {money(selectedCustomer.monthlyAmount)}
                              </p>
                            </div>
                          </div>

                          {paid && (
                            <span className="shrink-0 rounded-full bg-green-500/10 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                              مدفوع
                            </span>
                          )}
                        </div>

                        <div className="mt-4 border-t pt-3">
                          <label className="mb-2 block text-xs font-medium text-muted-foreground">
                            قيمة التحصيل لهذا الشهر
                          </label>

                          <div className="relative">
                            <CircleDollarSign className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                              type="number"
                              min={0}
                              max={selectedCustomer.monthlyAmount}
                              step="0.01"
                              value={monthAmount}
                              disabled={disabled || !selected}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => updateMonthAmount(month.value, e.target.value)}
                              className={`h-10 pr-10 ${disabled || !selected ? 'bg-muted' : ''} ${
                                validationErrors.monthAmounts?.[month.value]
                                  ? 'border-destructive'
                                  : ''
                              }`}
                            />
                          </div>

                          <FieldError
                            message={validationErrors.monthAmounts?.[month.value]}
                            className="mt-2"
                          />

                          {paid ? (
                            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-green-700">
                              <CheckCircle2 className="h-4 w-4" />
                              تم تحصيل هذا الشهر بالكامل
                            </div>
                          ) : selected ? (
                            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-primary">
                              <CheckCircle2 className="h-4 w-4" />
                              الشهر ضمن عملية التحصيل الحالية
                            </div>
                          ) : (
                            <p className="mt-3 text-xs text-muted-foreground">
                              اختر الشهر لإضافته إلى عملية التحصيل
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Collection Summary */}
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <SummaryItem label="عدد الشهور المختارة" value={selectedMonths.length} />

                  <SummaryItem
                    label="قيمة الاشتراك الشهري"
                    value={money(selectedCustomer.monthlyAmount)}
                  />

                  <SummaryItem
                    label="إجمالي المبلغ المحصل"
                    value={money(selectedTotal)}
                    highlight
                  />
                </div>

                {selectedMonths.some(
                  (monthValue: string) =>
                    Number(monthAmounts[monthValue]) < Number(selectedCustomer.monthlyAmount),
                ) && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>
                      يوجد شهر واحد على الأقل سيتم تحصيله جزئياً لأن القيمة المدخلة أقل من قيمة
                      الاشتراك الشهري.
                    </span>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">ملاحظات</label>

                <Textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    clearValidationError('notes');
                  }}
                  placeholder="أدخل أي ملاحظات خاصة بعملية التحصيل..."
                  className={`min-h-24 resize-none ${
                    validationErrors.notes ? 'border-destructive' : ''
                  }`}
                />

                <FieldError message={validationErrors.notes} />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 border-t pt-4 sm:justify-start">
            <Button
              onClick={handleSubmitCollection}
              disabled={isPaidMonthsLoading || isCollectionSubmitting}
              className="min-w-36"
            >
              <CheckCircle2 className="ml-2 h-4 w-4" />
              {isCollectionSubmitting ? 'جارٍ التسجيل...' : 'تسجيل التحصيل'}
            </Button>

            <Button variant="outline" onClick={() => setCollectionOpen(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FieldError({ message, className = '' }: any) {
  if (!message) {
    return null;
  }

  return <p className={`text-xs font-medium text-destructive ${className}`}>{message}</p>;
}

function InfoItem({ label, value }: any) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function SectionTitle({ icon, title }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}

function SummaryItem({ label, value, highlight = false }: any) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className={`mt-1 text-lg font-bold ${highlight ? 'text-green-600' : ''}`}>{value}</p>
    </div>
  );
}

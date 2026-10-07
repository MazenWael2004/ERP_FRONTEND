import * as React from 'react';

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
import { z } from 'zod';

function getRelativeMonthValue(offset = 0) {
  const now = new Date();

  const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return `${year}-${String(month).padStart(2, '0')}`;
}

const mockCustomers = [
  {
    id: 1,
    customerName: 'صيدلية سيف',
    branchName: 'فرع المهندسين',
    customerCode: 'CUS-001',
    contractNumber: 'CON-2026-001',
    representativeName: 'أحمد محمد',
    monthlyAmount: 500,

    // Months that have already been fully paid
    paidMonths: [getRelativeMonthValue(0)],
  },
  {
    id: 2,
    customerName: 'صيدلية العزبي',
    branchName: 'فرع الدقي',
    customerCode: 'CUS-002',
    contractNumber: 'CON-2026-002',
    representativeName: 'محمد السيد',
    monthlyAmount: 600,

    paidMonths: [getRelativeMonthValue(0), getRelativeMonthValue(1)],
  },
  {
    id: 3,
    customerName: 'صيدلية 19011',
    branchName: 'فرع فيصل',
    customerCode: 'CUS-003',
    contractNumber: 'CON-2026-003',
    representativeName: 'علي حسن',
    monthlyAmount: 500,

    paidMonths: [],
  },
  {
    id: 4,
    customerName: 'صيدلية نور',
    branchName: 'فرع الهرم',
    customerCode: 'CUS-004',
    contractNumber: 'CON-2026-004',
    representativeName: 'كريم أحمد',
    monthlyAmount: 500,

    paidMonths: [getRelativeMonthValue(0)],
  },
  {
    id: 5,
    customerName: 'صيدلية الأمل',
    branchName: 'فرع أكتوبر',
    customerCode: 'CUS-005',
    contractNumber: 'CON-2026-005',
    representativeName: 'محمود حسن',
    monthlyAmount: 600,

    paidMonths: [getRelativeMonthValue(0), getRelativeMonthValue(1), getRelativeMonthValue(2)],
  },
];

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
    label: 'دفع إلكتروني',
    value: 'ONLINE_PAYMENT',
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

const monthValueSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'صيغة الشهر غير صحيحة');

function createCollectionSchema({ monthlyAmount, paidMonths, allowedMonths }: any) {
  return z
    .object({
      contractId: z.number().int('رقم العقد غير صالح').positive('رقم العقد غير صالح'),

      collectionDate: z
        .string()
        .min(1, 'تاريخ التحصيل مطلوب')
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'صيغة تاريخ التحصيل غير صحيحة'),

      receiptNumber: z
        .string()
        .trim()
        .min(1, 'رقم الإيصال مطلوب')
        .max(50, 'رقم الإيصال لا يمكن أن يتجاوز 50 حرفاً'),

      paymentMethodId: z.number().int('طريقة الدفع غير صالحة').positive('طريقة الدفع مطلوبة'),

      amount: z.number().positive('إجمالي المبلغ المحصل يجب أن يكون أكبر من صفر'),

      notes: z.string().trim().max(1000, 'الملاحظات لا يمكن أن تتجاوز 1000 حرف').optional(),

      selectedMonths: z.array(monthValueSchema).min(1, 'يجب اختيار شهر واحد على الأقل للتحصيل'),

      monthPayments: z
        .array(
          z.object({
            month: monthValueSchema,

            amount: z
              .number()
              .positive('قيمة التحصيل لهذا الشهر يجب أن تكون أكبر من صفر')
              .max(monthlyAmount, `لا يمكن أن تتجاوز قيمة تحصيل الشهر ${monthlyAmount} جنيه`),
          }),
        )
        .min(1, 'يجب تحديد قيمة التحصيل للشهور المختارة'),
    })
    .superRefine((data, ctx) => {
      const selectedSet = new Set(data.selectedMonths);

      if (selectedSet.size !== data.selectedMonths.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['selectedMonths'],
          message: 'لا يمكن اختيار نفس الشهر أكثر من مرة',
        });
      }

      for (const month of data.selectedMonths) {
        if (!allowedMonths.includes(month)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['selectedMonths'],
            message: 'أحد الشهور المختارة خارج فترة التحصيل المتاحة',
          });
        }

        if (paidMonths.includes(month)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['selectedMonths'],
            message: 'لا يمكن تحصيل شهر تم سداده بالكامل',
          });
        }
      }

      const paymentMonthSet = new Set<string>();

      data.monthPayments.forEach((payment, index) => {
        if (paymentMonthSet.has(payment.month)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['monthPayments', index, 'month'],
            message: 'يوجد شهر مكرر في قيم التحصيل',
          });
        }

        paymentMonthSet.add(payment.month);

        if (!selectedSet.has(payment.month)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['monthPayments', index, 'month'],
            message: 'قيمة التحصيل مرتبطة بشهر غير مختار',
          });
        }
      });

      for (const month of data.selectedMonths) {
        if (!paymentMonthSet.has(month)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['selectedMonths'],
            message: 'يجب تحديد قيمة التحصيل لكل شهر مختار',
          });
        }
      }

      const calculatedTotal = data.monthPayments.reduce(
        (total, payment) => total + payment.amount,
        0,
      );

      if (Math.abs(calculatedTotal - data.amount) > 0.001) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['amount'],
          message: 'إجمالي المبلغ المحصل لا يطابق مجموع قيم الشهور',
        });
      }
    });
}

function mapZodErrors(error: z.ZodError, payload: any) {
  const errors: any = {
    monthAmounts: {},
  };

  for (const issue of error.issues) {
    const [field, index] = issue.path;

    if (field === 'monthPayments' && typeof index === 'number') {
      const monthValue = payload.monthPayments?.[index]?.month;

      if (monthValue) {
        errors.monthAmounts[monthValue] = issue.message;
      } else if (!errors.selectedMonths) {
        errors.selectedMonths = issue.message;
      }

      continue;
    }

    const key = String(field || 'form');

    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors;
}

export default function SubscriptionCollectionPage() {
  const [customers] = React.useState<any[]>(mockCustomers);

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

  const [validationErrors, setValidationErrors] = React.useState<any>({ monthAmounts: {} });

  const monthOptions = React.useMemo(() => generateMonthOptions(), []);

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
        customer.branchName.toLowerCase().includes(text) ||
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

  const openCollection = (customer: any) => {
    setSelectedCustomer(customer);
    setSelectedMonths([]);

    const defaultAmounts: any = {};

    for (const month of monthOptions) {
      defaultAmounts[month.value] = Number(customer.monthlyAmount || 0);
    }

    setMonthAmounts(defaultAmounts);

    setCollectionDate(new Date().toISOString().split('T')[0]);

    setReceiptNumber(`RCPT-${Date.now().toString().slice(-7)}`);

    setPaymentMethodId('1');
    setNotes('');
    setValidationErrors({ monthAmounts: {} });

    setCollectionOpen(true);
  };

  const isMonthPaid = (monthValue: string) => {
    if (!selectedCustomer) {
      return false;
    }

    return (selectedCustomer.paidMonths || []).includes(monthValue);
  };

  const toggleMonth = (monthValue: string) => {
    if (isMonthPaid(monthValue)) {
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

  const handleSubmitCollection = () => {
    if (!selectedCustomer) {
      return;
    }

    const payload = {
      contractId: selectedCustomer.id,

      collectionDate,

      receiptNumber,

      paymentMethodId: Number(paymentMethodId),

      // Read-only total calculated from the selected month inputs
      amount: selectedTotal,

      notes,

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

    setValidationErrors({
      monthAmounts: {},
    });

    console.log('COLLECTION PAYLOAD:', result.data);

    setCollectionOpen(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">تحصيل الاشتراكات</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              تسجيل تحصيل الاشتراكات الشهرية للعملاء وتحديد قيمة التحصيل لكل شهر
            </p>
          </div>

          <Button variant="outline" className="gap-2 self-start">
            <RefreshCw className="h-4 w-4" />
            تحديث البيانات
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <CardTitle className="text-lg">العملاء</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  اختر العميل لتسجيل عملية تحصيل جديدة
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
              <table className="w-full min-w-[900px]">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-5 py-4 text-right text-xs font-semibold text-muted-foreground">
                      العميل
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold text-muted-foreground">
                      رقم العقد
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold text-muted-foreground">
                      المندوب
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-semibold text-muted-foreground">
                      قيمة الاشتراك الشهري
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-semibold text-muted-foreground">
                      الإجراء
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer: any) => (
                    <tr
                      key={customer.id}
                      className="border-b transition-colors last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Building2 className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="font-semibold">{customer.customerName}</p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {customer.branchName} • {customer.customerCode}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium">{customer.contractNumber}</span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm">{customer.representativeName}</span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="font-semibold">{money(customer.monthlyAmount)}</span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <Button size="sm" onClick={() => openCollection(customer)}>
                          <Banknote className="ml-2 h-4 w-4" />
                          تسجيل تحصيل
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-14 text-center">
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

                <InfoItem label="الفرع" value={selectedCustomer.branchName} />

                <InfoItem label="رقم العقد" value={selectedCustomer.contractNumber} />

                <InfoItem
                  label="قيمة الاشتراك الشهري"
                  value={money(selectedCustomer.monthlyAmount)}
                />
              </div>

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

                    const monthAmount = monthAmounts[month.value] ?? '';

                    return (
                      <div
                        key={month.value}
                        onClick={() => {
                          if (!paid) {
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
                              disabled={paid}
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
                              disabled={paid || !selected}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => updateMonthAmount(month.value, e.target.value)}
                              className={`h-10 pr-10 ${paid || !selected ? 'bg-muted' : ''} ${
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
            <Button onClick={handleSubmitCollection} className="min-w-36">
              <CheckCircle2 className="ml-2 h-4 w-4" />
              تسجيل التحصيل
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

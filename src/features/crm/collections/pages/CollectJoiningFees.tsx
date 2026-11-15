import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Check,
  CheckCircle2,
  ChevronsUpDown,
  Loader2,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';
import { fetchBanks, fetchPaymentMethods } from 'src/features/crm/contracts/api/contractService';
import { api } from 'src/shared/api/axios';
import { cn } from 'src/lib/utils';

type JoiningFeeContract = {
  contract_id: number;
  customer_code: string;
  customer_name_ar?: string;
  customer_name_en?: string;
  representative_id: number;
  joining_fee_total: number;
  paid_amount: number;
  outstanding_amount: number;
};
type Method = { id: number; code: string; name_ar?: string; name_en?: string; nameAr?: string; nameEn?: string };
type Payment = {
  key: number;
  paymentMethodId: string;
  amount: string;
  paymentDetails: Record<string, string>;
};
const today = () => new Date().toISOString().slice(0, 10);
const money = (value: number) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
const value = (amount: string) => Number(amount || 0);
const errorMessage = (error: any) =>
  error?.response?.data?.error?.message || error?.response?.data?.message || 'تعذر إتمام العملية.';
const paymentMethodArabicName: Record<string, string> = {
  CASH: 'نقدي',
  INSTAPAY: 'إنستاباي',
  PAYSKY: 'باي سكاي',
  BANK_TRANSFER: 'تحويل بنكي',
  BANKTRANSFER: 'تحويل بنكي',
  CHEQUE: 'شيك',
  CREDIT_CARD: 'بطاقة ائتمانية',
  ONLINE_PAYMENT: 'دفع إلكتروني',
};
const paymentMethodLabel = (method: Method) =>
  method.nameAr?.trim() || method.name_ar?.trim() ||
  paymentMethodArabicName[String(method.code || '').toUpperCase()] ||
  method.nameEn?.trim() || method.name_en?.trim() || method.code;
let paymentSequence = 0;
const newPayment = (amount = ''): Payment => ({
  key: ++paymentSequence,
  paymentMethodId: '',
  amount,
  paymentDetails: {},
});

function PaymentMethodPicker({
  methods,
  selectedId,
  onChange,
}: {
  methods: Method[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = methods.find((method) => String(method.id) === selectedId);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="h-10 w-full justify-between font-normal"
        >
          <span className="truncate">{selected ? paymentMethodLabel(selected) : 'اختر طريقة الدفع'}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="ابحث باسم أو كود الطريقة..." />
          <CommandList>
            <CommandEmpty>لا توجد طريقة مطابقة.</CommandEmpty>
            <CommandGroup>
              {methods.map((method) => (
                <CommandItem
                  key={method.id}
                  value={`${paymentMethodLabel(method)} ${method.code}`}
                  onSelect={() => {
                    onChange(String(method.id));
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'ml-2 h-4 w-4',
                      selectedId === String(method.id) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {paymentMethodLabel(method)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function PaymentDetails({
  method,
  banks,
  details,
  onChange,
}: {
  method?: Method;
  banks: any[];
  details: Record<string, string>;
  onChange: (name: string, next: string) => void;
}) {
  if (!method) return null;
  const code = String(method.code || '')
    .toUpperCase()
    .replace(/_/g, '');
  const field = (label: string, name: string, type = 'text', disabled = false) => (
    <div>
      <Label>{label}</Label>
      <Input
        className="mt-1"
        type={type}
        disabled={disabled}
        value={details[name] || ''}
        inputMode={name === 'receiptNumber' ? 'numeric' : undefined}
        onChange={(event) => onChange(name, name === 'receiptNumber' ? event.target.value.replace(/\D/g, '') : event.target.value)}
      />
    </div>
  );
  const bank = (
    <div>
      <Label>اسم البنك</Label>
      <select
        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={details.bankId || ''}
        onChange={(event) => onChange('bankId', event.target.value)}
      >
        <option value="">اختر البنك</option>
        {banks.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name_ar || item.name_en}
          </option>
        ))}
      </select>
    </div>
  );
  const receiptField = field('رقم الإيصال', 'receiptNumber');
  if (code === 'CASH') return receiptField;
  if (code === 'INSTAPAY' || code === 'PAYSKY')
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {receiptField}
        {field('رقم المرجع', 'referenceNumber')}
        {field('تاريخ العملية', 'transactionDate', 'date', code === 'INSTAPAY')}
      </div>
    );
  if (code === 'BANKTRANSFER')
    return (
      <div className="grid gap-3 sm:grid-cols-4">
        {receiptField}
        {bank}
        {field('رقم المرجع', 'referenceNumber')}
        {field('تاريخ التحويل', 'transferDate', 'date')}
      </div>
    );
  if (code === 'CHEQUE')
    return (
      <div className="grid gap-3 sm:grid-cols-4">
        {receiptField}
        {bank}
        {field('رقم الشيك', 'chequeNumber')}
        {field('تاريخ الاستحقاق', 'chequeDueDate', 'date')}
      </div>
    );
  return null;
}

export default function CollectJoiningFees() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<JoiningFeeContract[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<JoiningFeeContract | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [collectedAt, setCollectedAt] = useState(today());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [paymentMethods, activeBanks] = await Promise.all([
          fetchPaymentMethods(),
          fetchBanks(),
        ]);
        setMethods(Array.isArray(paymentMethods) ? paymentMethods : []);
        setBanks(Array.isArray(activeBanks) ? activeBanks : []);
      } catch (error) {
        toast.error(`تعذر تحميل طرق الدفع: ${errorMessage(error)}`);
      }
    })();
  }, []);
  const load = async () => {
    const normalized = search.trim();
    if (!/^\d+$/.test(normalized)) {
      toast.error('اكتب رقم العقد أو كود العميل بالأرقام فقط.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/collections/outstanding-joining-fees', {
        params: { search: normalized },
      });
      setRows(response.data?.data || []);
    } catch (error) {
      setRows([]);
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const outstanding = Number(selected?.outstanding_amount || 0);
  const paidTotal = payments.reduce((sum, payment) => sum + value(payment.amount), 0);
  const remaining = outstanding - paidTotal;
  const fullyAllocated =
    selected !== null && Math.round(paidTotal * 100) === Math.round(outstanding * 100);
  const updatePayment = (key: number, change: Partial<Payment>) =>
    setPayments((items) => items.map((item) => (item.key === key ? { ...item, ...change } : item)));
  const changeMethod = (key: number, methodId: string) => {
    const method = methods.find((item) => String(item.id) === methodId);
    const code = String(method?.code || '')
      .toUpperCase()
      .replace(/_/g, '');
    updatePayment(key, {
      paymentMethodId: methodId,
      paymentDetails: code === 'INSTAPAY' ? { transactionDate: today() } : {},
    });
  };
  const open = (row: JoiningFeeContract) => {
    setSelected(row);
    setPayments([newPayment(String(row.outstanding_amount))]);
    setCollectedAt(today());
    setNotes('');
  };
  const close = () => {
    if (!saving) setSelected(null);
  };
  const validate = () => {
    if (!fullyAllocated) return 'يجب أن يساوي مجموع الدفعات كامل الرصيد المتبقي للعقد.';
    if (payments.some((payment) => !payment.paymentMethodId || value(payment.amount) <= 0))
      return 'أكمل طريقة الدفع والمبلغ لكل دفعة.';
    for (const payment of payments) {
      const code = String(
        methods.find((method) => String(method.id) === payment.paymentMethodId)?.code || '',
      )
        .toUpperCase()
        .replace(/_/g, '');
      const details = payment.paymentDetails;
      if (!details.receiptNumber?.trim()) return 'رقم الإيصال مطلوب لكل طرق الدفع.';
      if (
        (code === 'INSTAPAY' || code === 'PAYSKY') &&
        (!details.referenceNumber?.trim() || !details.transactionDate)
      )
        return 'رقم المرجع وتاريخ العملية مطلوبان.';
      if (
        code === 'BANKTRANSFER' &&
        (!details.bankId || !details.referenceNumber?.trim() || !details.transferDate)
      )
        return 'أكمل بيانات التحويل البنكي.';
      if (
        code === 'CHEQUE' &&
        (!details.bankId || !details.chequeNumber?.trim() || !details.chequeDueDate)
      )
        return 'أكمل بيانات الشيك.';
    }
    return '';
  };
  const submit = async () => {
    if (!selected) return;
    const invalid = validate();
    if (invalid) {
      toast.error(invalid);
      return;
    }
    setSaving(true);
    const toastId = toast.loading('جارٍ تسجيل الدفعات...');
    try {
      await api.post('/collections/joining-fees', {
        contractId: selected.contract_id,
        representativeId: selected.representative_id,
        collectedAt,
        collectionReason: `تحصيل الرصيد المتبقي للعقد — عقد #${selected.contract_id}`,
        notes: notes.trim() || null,
        payments: payments.map(({ paymentMethodId, amount, paymentDetails }) => ({
          paymentMethodId: Number(paymentMethodId),
          amount: value(amount),
          paymentDetails,
        })),
      });
      toast.success('تم تحصيل كامل الرصيد المتبقي للعقد.', { id: toastId });
      setSelected(null);
      await load();
    } catch (error) {
      toast.error(errorMessage(error), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">تحصيل الرصيد المتبقي للعقد</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ابحث برقم العقد أو كود العميل، ثم حصّل كامل الرصيد المتبقي بدفعة أو أكثر.
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <Loader2 className={cn('ml-2 h-4 w-4', loading && 'animate-spin')} />
          تحديث
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>البحث عن الرصيد المتبقي</CardTitle>
          <CardDescription>
            تظهر العقود غير المرفوضة التي لها رصيد متبقٍ في فاتورة العقد.
          </CardDescription>
          <div className="mt-3 flex max-w-xl gap-2">
            <Input
              dir="ltr"
              inputMode="numeric"
              value={search}
              onChange={(event) => setSearch(event.target.value.replace(/\D/g, ''))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void load();
                }
              }}
              placeholder="رقم العقد أو كود العميل"
            />
            <Button onClick={() => void load()} disabled={loading}>
              <Search className="ml-1 h-4 w-4" />
              بحث
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : rows.length ? (
            <div className="space-y-3">
              {rows.map((row) => (
                <div
                  key={row.contract_id}
                  className="flex flex-col gap-3 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      {row.customer_name_ar || row.customer_name_en || '—'}{' '}
                      <span className="font-normal text-muted-foreground">
                        (كود العميل: {row.customer_code})
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">العقد #{row.contract_id}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        المتبقي: {money(row.outstanding_amount)}
                      </Badge>
                    </div>
                  </div>
                  <Button onClick={() => open(row)}>
                    <Wallet className="ml-2 h-4 w-4" />
                    تحصيل المتبقي
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {search
                ? 'لا يوجد رصيد متبقٍ لهذا العقد أو العميل.'
                : 'ابحث برقم العقد أو كود العميل.'}
            </p>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!selected} onOpenChange={(isOpen) => !isOpen && close()}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تحصيل الرصيد المتبقي للعقد</DialogTitle>
            <DialogDescription>
              {selected
                ? `${selected.customer_name_ar || selected.customer_name_en || '—'} — عقد #${selected.contract_id}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="grid gap-3 rounded-xl bg-muted/60 p-4 text-sm sm:grid-cols-3">
                {/* <div>
                  <p className="text-muted-foreground">المتبقي بالكامل</p>
                  <p className="mt-1 font-bold">{money(outstanding)}</p>
                </div> */}
                {/* <div>
                  <p className="text-muted-foreground">مجموع الدفعات</p>
                  <p className="mt-1 font-bold">{money(paidTotal)}</p>
                </div> */}
                {/* <div>
                  <p className="text-muted-foreground">المتبقي للتوزيع</p>
                  <p
                    className={cn(
                      'mt-1 font-bold',
                      Math.abs(remaining) < 0.005 ? 'text-emerald-600' : 'text-amber-700',
                    )}
                  >
                    {money(remaining)}
                  </p>
                </div> */}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>تاريخ التحصيل</Label>
                  <Input
                    className="mt-1"
                    type="date"
                    value={collectedAt}
                    onChange={(event) => setCollectedAt(event.target.value)}
                  />
                </div>
                <div>
                  <Label>ملاحظات</Label>
                  <Input
                    className="mt-1"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="اختياري"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">الدفعات</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPayments((items) => [...items, newPayment()])}
                  >
                    <Plus className="ml-1 h-4 w-4" />
                    إضافة دفعة
                  </Button>
                </div>
                {payments.map((payment, index) => {
                  const method = methods.find(
                    (item) => String(item.id) === payment.paymentMethodId,
                  );
                  return (
                    <div key={payment.key} className="space-y-3 rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">دفعة {index + 1}</p>
                        {payments.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() =>
                              setPayments((items) =>
                                items.filter((item) => item.key !== payment.key),
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label>طريقة الدفع</Label>
                          <div className="mt-1">
                            <PaymentMethodPicker
                              methods={methods}
                              selectedId={payment.paymentMethodId}
                              onChange={(id) => changeMethod(payment.key, id)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>المبلغ</Label>
                          <Input
                            className="mt-1"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={payment.amount}
                            onChange={(event) =>
                              updatePayment(payment.key, { amount: event.target.value })
                            }
                          />
                        </div>
                      </div>
                      <PaymentDetails
                        method={method}
                        banks={banks}
                        details={payment.paymentDetails}
                        onChange={(name, next) =>
                          updatePayment(payment.key, {
                            paymentDetails: { ...payment.paymentDetails, [name]: next },
                          })
                        }
                      />
                    </div>
                  );
                })}
              </div>
              {!fullyAllocated && (
                <p className="text-sm text-amber-700">
                  لن يتم التسجيل حتى يصبح المتبقي للتوزيع صفرًا.
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={close} disabled={saving}>
                  <X className="ml-1 h-4 w-4" />
                  إلغاء
                </Button>
                <Button onClick={() => void submit()} disabled={saving || !fullyAllocated}>
                  {saving ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  )}
                  تسجيل جميع الدفعات
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, CheckCircle2, ChevronsUpDown, Loader2, Plus, Search, Trash2, Wallet, X } from 'lucide-react';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Badge } from 'src/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'src/components/ui/command';
import { fetchBanks, fetchPaymentMethods } from 'src/features/crm/contracts/api/contractService';
import { createAdditionalServiceCollection, fetchApprovedServiceRequestsForCollection } from 'src/features/crm/requests/api/serviceRequestService';
import { cn } from 'src/lib/utils';

type RequestItem = { invoiceLineId: number; description?: string; serviceNameAr?: string; serviceNameEn?: string; quantity: number; totalAmount: number; paidAmount: number; outstandingAmount: number };
type CollectionRequest = { requestId: number; contractId: number; representativeId?: number; customerCode?: string; customerNameAr?: string; customerNameEn?: string; zoneNameAr?: string; zoneNameEn?: string; invoiceId: number; invoiceNumber?: string; approvedAt?: string; totalAmount: number; paidAmount: number; outstandingAmount: number; items: RequestItem[] };
type Method = { id: number; code: string; name_ar?: string; name_en?: string };
type PaymentDetails = Record<string, string>;
type PaymentEntry = { key: number; paymentMethodId: string; amount: string; paymentDetails: PaymentDetails };

const today = () => new Date().toISOString().slice(0, 10);
const money = (value: number) => new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 2 }).format(value || 0);
const numberValue = (value: string) => Number(value || 0);
const errorMessage = (error: any) => error?.response?.data?.message || error?.message || 'تعذر إتمام التحصيل.';
let paymentSequence = 0;
const newPayment = (amount = ''): PaymentEntry => ({ key: ++paymentSequence, paymentMethodId: '', amount, paymentDetails: {} });

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
const paymentMethodLabel = (method: Method) => method.name_ar?.trim() || paymentMethodArabicName[method.code?.toUpperCase()] || method.name_en || method.code;

function MethodPicker({ methods, value, onChange }: { methods: Method[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = methods.find((method) => String(method.id) === value);
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild><Button type="button" variant="outline" role="combobox" aria-expanded={open} className="h-10 w-full justify-between font-normal"><span className="truncate">{selected ? paymentMethodLabel(selected) : 'اختر طريقة الدفع'}</span><ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start"><Command><CommandInput placeholder="ابحث باسم أو كود الطريقة..." /><CommandList><CommandEmpty>لا توجد طريقة مطابقة.</CommandEmpty><CommandGroup>{methods.map((method) => <CommandItem key={method.id} value={`${paymentMethodLabel(method)} ${method.code}`} onSelect={() => { onChange(String(method.id)); setOpen(false); }}><Check className={cn('ml-2 h-4 w-4', value === String(method.id) ? 'opacity-100' : 'opacity-0')} />{paymentMethodLabel(method)}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent>
  </Popover>;
}

function BankPicker({ banks, value, onChange }: { banks: any[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = banks.find((bank) => String(bank.id) === value);
  const bankLabel = (bank: any) => bank.nameAr || bank.name_ar || bank.nameEn || bank.name_en || `Bank #${bank.id}`;
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild><Button type="button" variant="outline" role="combobox" aria-expanded={open} className="h-10 w-full justify-between font-normal"><span className="truncate">{selected ? bankLabel(selected) : 'اختر البنك'}</span><ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start"><Command><CommandInput placeholder="ابحث باسم البنك..." /><CommandList><CommandEmpty>لا يوجد بنك مطابق.</CommandEmpty><CommandGroup>{banks.map((bank) => <CommandItem key={bank.id} value={`${bankLabel(bank)} ${bank.nameEn || bank.name_en || ''}`} onSelect={() => { onChange(String(bank.id)); setOpen(false); }}><Check className={cn('ml-2 h-4 w-4', value === String(bank.id) ? 'opacity-100' : 'opacity-0')} />{bankLabel(bank)}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent>
  </Popover>;
}

function PaymentFields({ method, banks, details, onChange }: { method?: Method; banks: any[]; details: PaymentDetails; onChange: (key: string, value: string) => void }) {
  if (!method) return null;
  const code = method.code?.toUpperCase();
  const field = (label: string, name: string, type = 'text', disabled = false) => <div><Label>{label}</Label><Input className="mt-1" type={type} inputMode={name === 'receiptNumber' ? 'numeric' : undefined} disabled={disabled} value={details[name] || ''} onChange={(event) => onChange(name, name === 'receiptNumber' ? event.target.value.replace(/\D/g, '') : event.target.value)} /></div>;
  const bankField = <div><Label>اسم البنك</Label><div className="mt-1"><BankPicker banks={banks} value={details.bankId || ''} onChange={(value) => onChange('bankId', value)} /></div></div>;
  const receiptField = field('رقم الإيصال', 'receiptNumber');
  if (code === 'CASH') return receiptField;
  if (code === 'INSTAPAY' || code === 'PAYSKY') return <div className="grid gap-3 sm:grid-cols-3">{receiptField}{field('رقم المرجع', 'referenceNumber')}{field('تاريخ العملية', 'transactionDate', 'date', code === 'INSTAPAY')}</div>;
  if (code === 'BANK_TRANSFER' || code === 'BANKTRANSFER') return <div className="grid gap-3 sm:grid-cols-4">{receiptField}{bankField}{field('رقم المرجع', 'referenceNumber')}{field('تاريخ التحويل', 'transferDate', 'date')}</div>;
  if (code === 'CHEQUE') return <div className="grid gap-3 sm:grid-cols-4">{receiptField}{bankField}{field('رقم الشيك', 'chequeNumber')}{field('تاريخ الاستحقاق', 'chequeDueDate', 'date')}</div>;
  return null;
}

export default function CollectAdditionalServices() {
  const [contractId, setContractId] = useState('');
  const [requests, setRequests] = useState<CollectionRequest[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  // Requests are loaded only after the user enters a contract ID. Starting in
  // loading mode would otherwise leave the page spinner visible forever.
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<CollectionRequest | null>(null);
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [collectedAt, setCollectedAt] = useState(today());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    void (async () => {
      try {
        const [paymentMethods, activeBanks] = await Promise.all([fetchPaymentMethods(), fetchBanks()]);
        setMethods(Array.isArray(paymentMethods) ? paymentMethods : []);
        setBanks(Array.isArray(activeBanks) ? activeBanks : []);
      } catch (error) { toast.error(`تعذر تحميل طرق الدفع: ${errorMessage(error)}`); }
    })();
  }, []);
  const loadRequests = async () => {
    const id = Number(contractId);
    if (!Number.isInteger(id) || id < 1) { toast.error('رقم عقد غير صالح. اكتب رقم العقد ثم اضغط بحث.'); return; }
    setLoading(true);
    try {
      const response = await fetchApprovedServiceRequestsForCollection(id);
      setRequests(response.data || []);
    } catch (error) { setRequests([]); toast.error(`تعذر تحميل طلبات التحصيل: ${errorMessage(error)}`); } finally { setLoading(false); }
  };
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return requests;
    return requests.filter((request) => [request.customerNameAr, request.customerNameEn, request.customerCode, request.contractId, request.invoiceNumber].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [requests, search]);
  const paymentTotal = payments.reduce((sum, payment) => sum + numberValue(payment.amount), 0);
  const outstanding = Number(selected?.outstandingAmount || 0);
  const remaining = outstanding - paymentTotal;
  const fullAmountCollected = selected !== null && Math.round(paymentTotal * 100) === Math.round(outstanding * 100);
  const canAddPayment = selected !== null && remaining > 0.005;
  const updatePayment = (key: number, change: Partial<PaymentEntry>) => setPayments((items) => items.map((item) => item.key === key ? { ...item, ...change } : item));
  const changeMethod = (key: number, paymentMethodId: string) => {
    const method = methods.find((item) => String(item.id) === paymentMethodId);
    updatePayment(key, { paymentMethodId, paymentDetails: method?.code?.toUpperCase() === 'INSTAPAY' ? { transactionDate: today() } : {} });
  };
  const openReview = (request: CollectionRequest) => { setSelected(request); setPayments([newPayment(String(request.outstandingAmount))]); setCollectedAt(today()); setNotes(''); };
  const closeReview = () => { if (!saving) setSelected(null); };
  const validate = () => {
    if (!fullAmountCollected) return 'يجب أن يساوي مجموع الدفعات كامل المبلغ المستحق.';
    if (payments.some((payment) => !payment.paymentMethodId || numberValue(payment.amount) <= 0)) return 'أكمل طريقة الدفع والمبلغ لكل دفعة.';
    for (const payment of payments) {
      const code = methods.find((method) => String(method.id) === payment.paymentMethodId)?.code?.toUpperCase();
      const details = payment.paymentDetails;
      if (!details.receiptNumber?.trim()) return 'رقم الإيصال مطلوب لكل طرق الدفع.';
      if ((code === 'INSTAPAY' || code === 'PAYSKY') && (!details.referenceNumber?.trim() || !details.transactionDate)) return 'رقم المرجع وتاريخ العملية مطلوبان.';
      if ((code === 'BANK_TRANSFER' || code === 'BANKTRANSFER') && (!details.bankId || !details.referenceNumber?.trim() || !details.transferDate)) return 'أكمل بيانات التحويل البنكي.';
      if (code === 'CHEQUE' && (!details.bankId || !details.chequeNumber?.trim() || !details.chequeDueDate)) return 'أكمل بيانات الشيك.';
    }
    return '';
  };
  const submit = async () => {
    if (!selected) return;
    const invalid = validate(); if (invalid) { toast.error(invalid); return; }
    setSaving(true); const toastId = toast.loading('جارٍ تسجيل الدفعات...');
    try {
      await createAdditionalServiceCollection({ serviceRequestId: selected.requestId, contractId: selected.contractId, representativeId: selected.representativeId || null, collectedAt, collectionReason: `تحصيل خدمات إضافية معتمدة — طلب #${selected.requestId}`, notes: notes.trim() || null, payments: payments.map(({ paymentMethodId, amount, paymentDetails }) => ({ paymentMethodId: Number(paymentMethodId), amount: numberValue(amount), paymentDetails })) });
      toast.success('تم تسجيل جميع الدفعات وتحصل كامل المبلغ.', { id: toastId }); setSelected(null); await loadRequests();
    } catch (error) { toast.error(errorMessage(error), { id: toastId }); } finally { setSaving(false); }
  };
  const updatePaymentAmount = (key: number, amount: string) => {
    const otherPaymentsTotal = payments.filter((payment) => payment.key !== key).reduce((sum, payment) => sum + numberValue(payment.amount), 0);
    const maximum = Math.max(0, outstanding - otherPaymentsTotal);
    const requested = numberValue(amount);
    updatePayment(key, { amount: amount && requested > maximum ? String(maximum) : amount });
  };
  return <div className="space-y-6" dir="rtl">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">تحصيل الخدمات الإضافية</h1><p className="mt-1 text-sm text-gray-500">قسّم التحصيل على دفعات، بشرط تحصيل الرصيد المستحق بالكامل.</p></div><Button variant="outline" onClick={loadRequests}><Loader2 className={cn('ml-2 h-4 w-4', loading && 'animate-spin')} />تحديث</Button></div>
    <Card><CardHeader><CardTitle>طلبات جاهزة للتحصيل</CardTitle><CardDescription>ابحث برقم العقد، ثم وزّع كامل الرصيد المستحق على دفعة واحدة أو أكثر.</CardDescription><div className="mt-3 flex max-w-lg gap-2"><Input dir="ltr" inputMode="numeric" value={contractId} onChange={(event) => setContractId(event.target.value.replace(/\D/g, ''))} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void loadRequests(); } }} placeholder="رقم العقد" /><Button type="button" onClick={loadRequests} disabled={loading}><Search className="ml-1 h-4 w-4" />بحث</Button></div>{requests.length > 0 && <div className="relative mt-3 max-w-lg"><Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" /><Input className="pr-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="تصفية باسم العميل أو الكود أو الفاتورة" /></div>}</CardHeader><CardContent>{loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> : filtered.length === 0 ? <div className="py-10 text-center text-sm text-gray-500">{contractId ? 'لا توجد طلبات خدمات إضافية معتمدة جاهزة للتحصيل لهذا العقد.' : 'اكتب رقم العقد للبحث عن طلبات التحصيل.'}</div> : <div className="space-y-3">{filtered.map((request) => <div key={request.requestId} className="flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="font-semibold">{request.customerNameAr || request.customerNameEn || '—'} <span className="text-sm font-normal text-gray-500">{request.customerCode ? `(${request.customerCode})` : ''}</span></div><div className="mt-1 text-sm text-gray-500">فاتورة {request.invoiceNumber || `#${request.invoiceId}`} · عقد #{request.contractId} · {request.items.map((item) => item.serviceNameAr || item.serviceNameEn || item.description || 'خدمة').join('، ')}</div><div className="mt-2 flex gap-2"><Badge variant="outline">المعتمد: {money(request.totalAmount)}</Badge><Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">المتبقي: {money(request.outstandingAmount)}</Badge></div></div><Button onClick={() => openReview(request)}><Wallet className="ml-2 h-4 w-4" />تحصيل</Button></div>)}</div>}</CardContent></Card>
    <Dialog open={!!selected} onOpenChange={(open) => !open && closeReview()}><DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto" dir="rtl"><DialogHeader><DialogTitle>تحصيل خدمات إضافية</DialogTitle><DialogDescription>{selected ? `${selected.customerNameAr || selected.customerNameEn || '—'} — المتبقي ${money(outstanding)}` : ''}</DialogDescription></DialogHeader>{selected && <div className="space-y-5"><div className="grid gap-3 rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-900 sm:grid-cols-3"><div><span className="text-gray-500">المستحق بالكامل</span><div className="mt-1 font-bold">{money(outstanding)}</div></div><div><span className="text-gray-500">مجموع الدفعات</span><div className="mt-1 font-bold">{money(paymentTotal)}</div></div><div><span className="text-gray-500">المتبقي للتوزيع</span><div className={cn('mt-1 font-bold', Math.abs(remaining) < 0.005 ? 'text-emerald-600' : 'text-amber-600')}>{money(remaining)}</div></div></div><div className="grid gap-3 sm:grid-cols-2"><div><Label>تاريخ التحصيل</Label><Input className="mt-1" type="date" value={collectedAt} onChange={(event) => setCollectedAt(event.target.value)} /></div><div><Label>ملاحظات</Label><Input className="mt-1" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="اختياري" /></div></div><div className="space-y-3"><div className="flex items-center justify-between"><Label className="text-base">الدفعات</Label><Button type="button" variant="outline" size="sm" disabled={!canAddPayment} title={canAddPayment ? undefined : 'تم توزيع كامل المبلغ المستحق'} onClick={() => setPayments((items) => [...items, newPayment()])}><Plus className="ml-1 h-4 w-4" />إضافة دفعة</Button></div>{payments.map((payment, index) => { const method = methods.find((item) => String(item.id) === payment.paymentMethodId); const maximumAmount = Math.max(0, outstanding - payments.filter((item) => item.key !== payment.key).reduce((sum, item) => sum + numberValue(item.amount), 0)); return <div key={payment.key} className="space-y-3 rounded-lg border p-4"><div className="flex items-center justify-between"><span className="font-medium">دفعة {index + 1}</span>{payments.length > 1 && <Button type="button" variant="ghost" size="icon" className="text-red-600" onClick={() => setPayments((items) => items.filter((item) => item.key !== payment.key))}><Trash2 className="h-4 w-4" /></Button>}</div><div className="grid gap-3 sm:grid-cols-2"><div><Label>طريقة الدفع</Label><div className="mt-1"><MethodPicker methods={methods} value={payment.paymentMethodId} onChange={(value) => changeMethod(payment.key, value)} /></div></div><div><Label>المبلغ</Label><Input className="mt-1" type="number" min="0.01" max={maximumAmount} step="0.01" value={payment.amount} onChange={(event) => updatePaymentAmount(payment.key, event.target.value)} /></div></div><PaymentFields method={method} banks={banks} details={payment.paymentDetails} onChange={(name, value) => updatePayment(payment.key, { paymentDetails: { ...payment.paymentDetails, [name]: value } })} /></div>; })}</div>{!fullAmountCollected && <p className="text-sm text-amber-700">لن يتم تسجيل التحصيل حتى يصبح المتبقي للتوزيع صفرًا.</p>}<div className="flex justify-end gap-2"><Button variant="outline" onClick={closeReview} disabled={saving}><X className="ml-1 h-4 w-4" />إلغاء</Button><Button onClick={submit} disabled={saving || !fullAmountCollected}>{saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="ml-2 h-4 w-4" />}تسجيل جميع الدفعات</Button></div></div>}</DialogContent></Dialog>
  </div>;
}

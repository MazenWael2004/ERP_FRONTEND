import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { CalendarDays, Check, CheckCircle2, ChevronsUpDown, Loader2, RefreshCw, Search, WalletCards } from 'lucide-react';
import { api } from 'src/shared/api/axios';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card';
import { Checkbox } from 'src/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Textarea } from 'src/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'src/components/ui/command';
import { cn } from 'src/lib/utils';
import { fetchBanks, fetchPaymentMethods } from 'src/features/crm/contracts/api/contractService';

type Due = {
  contractId: number;
  customerCode: string;
  customerName: string;
  zoneId?: number;
  zoneName: string;
  representativeName: string;
  monthlyAmount: number;
  nextDueDate?: string | null;
  lastPaidMonth?: string | null;
};
type Balance = { month: string; outstandingAmount: number; fullyPaid: boolean };
type PaymentMethod = { id: number; code: string; name_ar?: string; name_en?: string };

const paymentMethodArabicName: Record<string, string> = {
  CASH: 'نقدي',
  BANK_TRANSFER: 'تحويل بنكي',
  BANKTRANSFER: 'تحويل بنكي',
  CREDIT_CARD: 'بطاقة ائتمانية',
  CHEQUE: 'شيك',
  INSTAPAY: 'إنستاباي',
  PAYSKY: 'باي سكاي',
  ONLINE_PAYMENT: 'دفع إلكتروني',
};
const cairoToday = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}`;
};
const money = (value: number) => `${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} EGP`;
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value)) : '—';
const monthLabel = (month: string) => new Intl.DateTimeFormat('ar-EG', { month: 'long', year: 'numeric', timeZone: 'Africa/Cairo' }).format(new Date(`${month}-01T12:00:00`));
const methodName = (method?: PaymentMethod) =>
  method?.name_ar || paymentMethodArabicName[String(method?.code || '').toUpperCase()] || method?.name_en || method?.code || '';

function nextTwelveMonths() {
  const current = cairoToday().slice(0, 7);
  const [year, month] = current.split('-').map(Number);
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(year, month - 1 + index, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
}

function SearchableSelect({ value, onChange, options, placeholder }: { value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button type="button" variant="outline" role="combobox" aria-expanded={open} className={cn('h-10 w-full justify-between font-normal', !selected && 'text-muted-foreground')}><span className="truncate">{selected?.label || placeholder}</span><ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger><PopoverContent dir="rtl" align="start" className="w-[var(--radix-popover-trigger-width)] p-0"><Command><CommandInput placeholder="اكتب للبحث..." /><CommandList><CommandEmpty>لا توجد نتائج مطابقة.</CommandEmpty><CommandGroup>{options.map((option) => <CommandItem key={option.value} value={`${option.label} ${option.value}`} onSelect={() => { onChange(option.value); setOpen(false); }}><Check className={cn('ml-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} /><span className="truncate">{option.label}</span></CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>;
}

export default function SubscriptionCollections() {
  const [dues, setDues] = useState<Due[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [zone, setZone] = useState('ALL');
  const [selected, setSelected] = useState<Due | null>(null);
  const [balances, setBalances] = useState<Record<string, Balance>>({});
  const [months, setMonths] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [collectionDate, setCollectionDate] = useState(cairoToday());
  const [notes, setNotes] = useState('');
  const [details, setDetails] = useState<Record<string, string>>({});
  const [dialogLoading, setDialogLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadDues = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/collections/subscription-dues');
      setDues(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'تعذر تحميل اشتراكات العملاء.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadDues(); }, [loadDues]);
  useEffect(() => {
    Promise.all([fetchPaymentMethods(), fetchBanks()])
      .then(([paymentMethods, activeBanks]) => {
        setMethods(paymentMethods || []);
        setBanks(activeBanks || []);
        if (paymentMethods?.[0]) setPaymentMethodId(String(paymentMethods[0].id));
      })
      .catch(() => toast.error('تعذر تحميل طرق الدفع أو البنوك.'));
  }, []);

  const zones = useMemo(() => [...new Map(dues.filter((row) => row.zoneId).map((row) => [row.zoneId, row.zoneName])).entries()], [dues]);
  const filtered = useMemo(() => {
    const value = search.trim().toLocaleLowerCase('ar-EG');
    return dues.filter((row) => (!value || [row.customerCode, row.customerName, row.contractId, row.zoneName, row.representativeName].some((item) => String(item || '').toLocaleLowerCase('ar-EG').includes(value))) && (zone === 'ALL' || String(row.zoneId) === zone));
  }, [dues, search, zone]);
  const selectedMethod = methods.find((method) => String(method.id) === paymentMethodId);
  const selectedTotal = months.reduce((total, month) => total + Number(amounts[month] || 0), 0);

  const openCollection = async (due: Due) => {
    setSelected(due);
    setDialogLoading(true);
    setMonths([]); setBalances({}); setAmounts({}); setReceiptNumber(''); setCollectionDate(cairoToday()); setNotes(''); setDetails({});
    try {
      const response = await api.get(`/collections/subscription-month-balances/${due.contractId}`);
      const rows: Balance[] = response.data.data || [];
      const map = Object.fromEntries(rows.map((item) => [item.month, item]));
      setBalances(map);
      setAmounts(Object.fromEntries([...nextTwelveMonths(), ...rows.map((item) => item.month)].map((month) => [month, String(map[month]?.outstandingAmount ?? due.monthlyAmount)])));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'تعذر تحميل أرصدة الاشتراكات.');
    } finally {
      setDialogLoading(false);
    }
  };

  const availableMonths = useMemo(() => [...new Set([...nextTwelveMonths(), ...Object.keys(balances)])].sort(), [balances]);
  const toggleMonth = (month: string) => setMonths((current) => current.includes(month) ? current.filter((item) => item !== month) : [...current, month].sort());
  const paid = (month: string) => Boolean(balances[month]?.fullyPaid);
  const maxAmount = (month: string) => balances[month]?.outstandingAmount ?? selected?.monthlyAmount ?? 0;

  const submit = async () => {
    if (!selected || !paymentMethodId || !receiptNumber.trim() || !/^\d+$/.test(receiptNumber.trim()) || !months.length) {
      toast.error('اختر شهراً واحداً على الأقل، وطريقة الدفع، وأدخل رقم إيصال رقمي.'); return;
    }
    const invalid = months.some((month) => !Number(amounts[month]) || Number(amounts[month]) > maxAmount(month));
    if (invalid) { toast.error('تحقق من مبلغ كل شهر؛ يجب أن يكون أكبر من صفر ولا يتجاوز الرصيد المستحق.'); return; }
    const methodCode = String(selectedMethod?.code || '').replace(/_/g, '').toUpperCase();
    const paymentDetails: Record<string, string> = { ...details, receiptNumber: receiptNumber.trim() };
    if (['BANKTRANSFER', 'CHEQUE'].includes(methodCode) && !paymentDetails.bankId) { toast.error('اختر البنك.'); return; }
    if (methodCode === 'BANKTRANSFER' && (!paymentDetails.transferDate || !paymentDetails.referenceNumber)) { toast.error('أدخل تاريخ التحويل والرقم المرجعي.'); return; }
    if (['INSTAPAY', 'PAYSKY'].includes(methodCode) && (!paymentDetails.transactionDate || !paymentDetails.referenceNumber)) { toast.error('أدخل تاريخ العملية والرقم المرجعي.'); return; }
    if (methodCode === 'CHEQUE' && (!paymentDetails.chequeNumber || !paymentDetails.chequeDueDate)) { toast.error('أدخل رقم الشيك وتاريخ استحقاقه.'); return; }
    setSaving(true);
    try {
      await api.post('/collections/pay-selected-months', {
        contractId: selected.contractId, collectionDate, receiptNumber: receiptNumber.trim(), paymentMethodId: Number(paymentMethodId), amount: selectedTotal,
        selectedMonths: months, monthPayments: months.map((month) => ({ month, amount: Number(amounts[month]) })), notes, paymentDetails,
      });
      toast.success('تم تسجيل تحصيل الاشتراكات بنجاح.');
      setSelected(null); void loadDues();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'تعذر تسجيل التحصيل.');
    } finally { setSaving(false); }
  };

  return <div dir="rtl" className="min-h-screen bg-background p-4 md:p-6"><div className="mx-auto max-w-[1500px] space-y-5">
    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><h1 className="text-2xl font-bold">تحصيل الاشتراكات</h1><p className="mt-1 text-sm text-muted-foreground">ابحث عن العميل، اختر الشهور المستحقة، ثم سجّل الإيصال وطريقة الدفع.</p></div><Button variant="outline" onClick={loadDues} disabled={loading}><RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />تحديث</Button></div>
    <div className="grid gap-4 sm:grid-cols-3"><Metric label="العقود المتاحة" value={dues.length} /><Metric label="نتائج البحث" value={filtered.length} /><Metric label="إجمالي الاشتراك الشهري" value={money(filtered.reduce((sum, row) => sum + Number(row.monthlyAmount || 0), 0))} /></div>
    <Card><CardHeader className="gap-3 border-b md:flex-row md:items-center md:justify-between"><div><CardTitle>الاشتراكات الشهرية</CardTitle><CardDescription>تظهر العقود المفعلة ضمن نطاق عملك فقط.</CardDescription></div><div className="grid w-full gap-2 sm:grid-cols-2 md:w-[580px]"><div className="relative"><Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pr-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="اسم العميل، الكود، العقد، المنطقة أو المحصل" /></div><SearchableSelect value={zone} onChange={setZone} placeholder="كل المناطق" options={[{ value: 'ALL', label: 'كل المناطق' }, ...zones.map(([id, name]) => ({ value: String(id), label: String(name) }))]} /></div></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr>{['كود العميل','اسم العميل','المنطقة','المحصل','الاشتراك الشهري','آخر شهر مسدد','تاريخ الاستحقاق',''].map((label) => <th key={label} className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold">{label}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={8} className="p-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr> : filtered.length ? filtered.map((row) => <tr key={row.contractId} className="border-t hover:bg-muted/30"><td className="px-4 py-3">{row.customerCode}</td><td className="px-4 py-3 font-medium">{row.customerName}</td><td className="px-4 py-3">{row.zoneName}</td><td className="px-4 py-3">{row.representativeName}</td><td className="px-4 py-3 font-semibold text-emerald-700">{money(row.monthlyAmount)}</td><td className="px-4 py-3">{formatDate(row.lastPaidMonth)}</td><td className="px-4 py-3">{formatDate(row.nextDueDate)}</td><td className="px-4 py-3"><Button size="sm" onClick={() => void openCollection(row)}><WalletCards className="ml-2 h-4 w-4" />تحصيل</Button></td></tr>) : <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">لا توجد عقود مطابقة للبحث.</td></tr>}</tbody></table></div></CardContent></Card>
  </div>
  <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto"><DialogHeader><DialogTitle>تحصيل اشتراكات {selected?.customerName}</DialogTitle></DialogHeader>{selected && (dialogLoading ? <div className="flex h-52 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> : <div className="space-y-5"><div className="grid gap-3 rounded-lg bg-muted/50 p-4 sm:grid-cols-3"><Info label="كود العميل" value={selected.customerCode} /><Info label="الاشتراك الشهري" value={money(selected.monthlyAmount)} /><Info label="تاريخ الاستحقاق" value={formatDate(selected.nextDueDate)} /></div><div className="grid gap-3 md:grid-cols-3"><Field label="تاريخ التحصيل"><Input type="date" value={collectionDate} onChange={(event) => setCollectionDate(event.target.value)} /></Field><Field label="رقم الإيصال"><Input inputMode="numeric" value={receiptNumber} onChange={(event) => setReceiptNumber(event.target.value.replace(/\D/g, ''))} placeholder="رقم الإيصال" /></Field><Field label="طريقة الدفع"><SearchableSelect value={paymentMethodId} onChange={setPaymentMethodId} placeholder="اختر طريقة الدفع" options={methods.map((method) => ({ value: String(method.id), label: methodName(method) }))} /></Field></div>{['BANKTRANSFER','CHEQUE'].includes(String(selectedMethod?.code || '').replace(/_/g, '').toUpperCase()) && <Field label="البنك"><SearchableSelect value={details.bankId || ''} onChange={(bankId) => setDetails((current) => ({ ...current, bankId }))} placeholder="اختر البنك" options={banks.map((bank) => ({ value: String(bank.id), label: bank.name_ar || bank.nameAr || bank.name_en || bank.nameEn || `بنك #${bank.id}` }))} /></Field>}{String(selectedMethod?.code || '').replace(/_/g, '').toUpperCase() === 'BANKTRANSFER' && <div className="grid gap-3 md:grid-cols-2"><Field label="تاريخ التحويل"><Input type="date" value={details.transferDate || ''} onChange={(e) => setDetails((c) => ({ ...c, transferDate: e.target.value }))} /></Field><Field label="الرقم المرجعي"><Input value={details.referenceNumber || ''} onChange={(e) => setDetails((c) => ({ ...c, referenceNumber: e.target.value }))} /></Field></div>}{['INSTAPAY','PAYSKY'].includes(String(selectedMethod?.code || '').replace(/_/g, '').toUpperCase()) && <div className="grid gap-3 md:grid-cols-2"><Field label="تاريخ العملية"><Input type="date" value={details.transactionDate || ''} onChange={(e) => setDetails((c) => ({ ...c, transactionDate: e.target.value }))} /></Field><Field label="الرقم المرجعي"><Input value={details.referenceNumber || ''} onChange={(e) => setDetails((c) => ({ ...c, referenceNumber: e.target.value }))} /></Field></div>}{String(selectedMethod?.code || '').replace(/_/g, '').toUpperCase() === 'CHEQUE' && <div className="grid gap-3 md:grid-cols-2"><Field label="رقم الشيك"><Input inputMode="numeric" value={details.chequeNumber || ''} onChange={(e) => setDetails((c) => ({ ...c, chequeNumber: e.target.value.replace(/\D/g, '') }))} /></Field><Field label="تاريخ الاستحقاق"><Input type="date" value={details.chequeDueDate || ''} onChange={(e) => setDetails((c) => ({ ...c, chequeDueDate: e.target.value }))} /></Field></div>}<div><h3 className="mb-3 font-semibold">الشهور المراد تحصيلها</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{availableMonths.map((month) => { const completed = paid(month); const checked = months.includes(month); return <label key={month} className={`rounded-lg border p-3 ${completed ? 'bg-emerald-50 opacity-70' : checked ? 'border-primary bg-primary/5' : ''}`}><div className="flex items-start gap-3"><Checkbox checked={completed || checked} disabled={completed} onCheckedChange={() => toggleMonth(month)} /><div className="min-w-0 flex-1"><p className="font-medium">{monthLabel(month)}</p><p className="mt-1 text-xs text-muted-foreground">{completed ? 'مسدد بالكامل' : `المتبقي: ${money(maxAmount(month))}`}</p>{!completed && checked && <Input className="mt-2 h-9" type="number" min="0.01" max={maxAmount(month)} step="0.01" value={amounts[month] || ''} onChange={(e) => setAmounts((current) => ({ ...current, [month]: e.target.value }))} onClick={(e) => e.stopPropagation()} />}</div></div></label>; })}</div></div><Field label="ملاحظات"><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="ملاحظات اختيارية" /></Field><div className="rounded-lg bg-emerald-50 p-4 text-emerald-800"><span className="text-sm">إجمالي التحصيل</span><p className="text-xl font-bold">{money(selectedTotal)}</p></div></div>)}<DialogFooter><Button onClick={() => void submit()} disabled={dialogLoading || saving}>{saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="ml-2 h-4 w-4" />}تسجيل التحصيل</Button><Button variant="outline" onClick={() => setSelected(null)}>إلغاء</Button></DialogFooter></DialogContent></Dialog></div>;
}

function Metric({ label, value }: { label: string; value: string | number }) { return <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></CardContent></Card>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>; }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }

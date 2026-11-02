import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { CheckCircle2, FileText, Loader2, Search, Wallet, X } from 'lucide-react';
import CardBox from 'src/components/shared/CardBox';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table';
import { Textarea } from 'src/components/ui/textarea';
import { fetchBanks, fetchPaymentMethods } from 'src/features/crm/contracts/api/contractService';
import { createAdditionalServiceCollection, fetchApprovedServiceRequestsForCollection } from 'src/features/crm/requests/api/serviceRequestService';

type RequestItem = {
  invoiceLineId: number;
  description?: string;
  serviceNameAr?: string;
  serviceNameEn?: string;
  quantity: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
};

type CollectionRequest = {
  requestId: number;
  contractId: number;
  representativeId?: number;
  customerCode?: string;
  customerNameAr?: string;
  customerNameEn?: string;
  zoneNameAr?: string;
  zoneNameEn?: string;
  invoiceId: number;
  invoiceNumber?: string;
  approvedAt?: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  items: RequestItem[];
};

const today = () => new Date().toISOString().slice(0, 10);
const amount = (value: unknown) => `${Number(value || 0).toLocaleString('ar-EG')} ج.م`;
const errorMessage = (error: any) => error?.response?.data?.error?.message || error?.response?.data?.message || 'تعذر إتمام العملية. حاول مرة أخرى.';
const paymentDetailsDefaults = () => ({ transferDate: '', bankId: '', referenceNumber: '', chequeNumber: '', chequeDueDate: '', transactionDate: '', receiptNumber: '' });

export default function CollectAdditionalUnits() {
  const [contractId, setContractId] = useState('');
  const [requests, setRequests] = useState<CollectionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [methods, setMethods] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [selected, setSelected] = useState<CollectionRequest | null>(null);
  const [amountToCollect, setAmountToCollect] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [collectionDate, setCollectionDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(paymentDetailsDefaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [paymentMethods, activeBanks] = await Promise.all([fetchPaymentMethods(), fetchBanks()]);
        setMethods(Array.isArray(paymentMethods) ? paymentMethods : []);
        setBanks(Array.isArray(activeBanks) ? activeBanks : []);
      } catch (error) {
        await Swal.fire({ icon: 'error', title: 'تعذر تحميل طرق الدفع', text: errorMessage(error) });
      }
    };
    void loadLookups();
  }, []);

  const selectedMethod = useMemo(
    () => methods.find((method) => Number(method.id) === Number(paymentMethodId)),
    [methods, paymentMethodId],
  );
  const paymentMethodCode = String(selectedMethod?.code || '').toUpperCase().replace(/_/g, '');
  const totalOutstanding = useMemo(() => requests.reduce((sum, request) => sum + Number(request.outstandingAmount || 0), 0), [requests]);
  const customer = requests[0];

  const loadRequests = async () => {
    const id = Number(contractId);
    if (!Number.isInteger(id) || id < 1) {
      await Swal.fire({ icon: 'warning', title: 'رقم عقد غير صالح', text: 'اكتب رقم العقد ثم اضغط بحث.' });
      return;
    }
    try {
      setLoading(true);
      const response = await fetchApprovedServiceRequestsForCollection(id);
      setRequests(response.data || []);
    } catch (error) {
      setRequests([]);
      await Swal.fire({ icon: 'error', title: 'تعذر تحميل طلبات التحصيل', text: errorMessage(error) });
    } finally { setLoading(false); }
  };

  const openReview = (request: CollectionRequest) => {
    setSelected(request);
    setAmountToCollect(String(Number(request.outstandingAmount || 0)));
    setPaymentMethodId('');
    setCollectionDate(today());
    setNotes('');
    setPaymentDetails(paymentDetailsDefaults());
  };

  const updateDetails = (key: string, value: string) => setPaymentDetails((current) => ({ ...current, [key]: value }));

  const validatePaymentDetails = () => {
    if (!paymentMethodId) return 'اختر طريقة الدفع.';
    if (paymentMethodCode === 'CASH' && !paymentDetails.receiptNumber.trim()) return 'رقم الإيصال النقدي مطلوب.';
    if (paymentMethodCode === 'BANKTRANSFER' && (!paymentDetails.transferDate || !paymentDetails.bankId || !paymentDetails.referenceNumber.trim())) return 'أدخل تاريخ الحوالة والبنك والرقم المرجعي.';
    if ((paymentMethodCode === 'INSTAPAY' || paymentMethodCode === 'PAYSKY') && (!paymentDetails.transactionDate || !paymentDetails.referenceNumber.trim())) return 'أدخل تاريخ العملية والرقم المرجعي.';
    if (paymentMethodCode === 'CHEQUE' && (!paymentDetails.chequeDueDate || !paymentDetails.bankId || !paymentDetails.chequeNumber.trim())) return 'أدخل البنك ورقم الشيك وتاريخ الاستحقاق.';
    return '';
  };

  const submitCollection = async () => {
    if (!selected) return;
    const paymentAmount = Number(selected.outstandingAmount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      await Swal.fire({ icon: 'warning', title: 'لا يوجد رصيد مستحق', text: 'أعد تحميل الطلب قبل تسجيل التحصيل.' });
      return;
    }
    const detailsError = validatePaymentDetails();
    if (detailsError) {
      await Swal.fire({ icon: 'warning', title: 'بيانات الدفع ناقصة', text: detailsError });
      return;
    }

    let remainder = Math.round(paymentAmount * 100);
    const allocations = selected.items
      .filter((item) => Number(item.outstandingAmount) > 0)
      .map((item) => {
        const paidCents = Math.min(remainder, Math.round(Number(item.outstandingAmount) * 100));
        remainder -= paidCents;
        return { invoiceLineId: item.invoiceLineId, amountPaid: paidCents / 100, notes: `تحصيل طلب خدمات إضافية #${selected.requestId}` };
      })
      .filter((allocation) => allocation.amountPaid > 0);

    if (remainder > 0 || !allocations.length) {
      await Swal.fire({ icon: 'error', title: 'تعذر توزيع مبلغ التحصيل', text: 'أعد تحميل الطلب ثم حاول مرة أخرى.' });
      return;
    }

    try {
      setSaving(true);
      await createAdditionalServiceCollection({
        contractId: selected.contractId,
        representativeId: selected.representativeId || null,
        paymentMethodId: Number(paymentMethodId),
        amount: paymentAmount,
        collectedAt: collectionDate,
        collectionReason: `تحصيل خدمات إضافية معتمدة — طلب #${selected.requestId}`,
        notes: notes.trim() || null,
        paymentDetails,
        allocations,
      });
      setSelected(null);
      await Swal.fire({ icon: 'success', title: 'تم تسجيل التحصيل', text: 'تم ربط المبلغ ببنود فاتورة الخدمات الإضافية.' });
      await loadRequests();
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'تعذر تسجيل التحصيل', text: errorMessage(error) });
    } finally { setSaving(false); }
  };

  return <div dir="rtl" className="space-y-6">
    <BreadcrumbComp title="تحصيل الخدمات الإضافية" items={[{ title: 'CRM', to: '/' }, { title: 'التحصيل' }, { title: 'تحصيل الخدمات الإضافية' }]} />
    <CardBox><div className="mb-6 border-b pb-5"><h1 className="text-xl font-semibold">مراجعة التحصيل</h1><p className="mt-1 text-sm text-muted-foreground">ابحث برقم العقد لعرض طلبات الخدمات الإضافية المعتمدة والجاهزة للتحصيل.</p></div>
      <div className="max-w-2xl rounded-2xl border bg-muted/20 p-5"><Label htmlFor="collection-contract-id">كود العميل *</Label><div className="mt-2 flex gap-3"><Input id="collection-contract-id" dir="ltr" inputMode="numeric" value={contractId} onChange={(event) => setContractId(event.target.value.replace(/\D/g, ''))} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void loadRequests(); } }} placeholder="مثال: 123" className="h-11 rounded-xl text-right" /><Button type="button" onClick={() => void loadRequests()} disabled={loading} className="h-11 shrink-0 rounded-xl px-5">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="me-2 h-4 w-4" />}بحث</Button></div></div>
      {!!customer && <div className="mt-5 grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">العميل</p><p className="mt-1 font-semibold">{customer.customerNameAr || customer.customerNameEn || '—'}</p><p className="text-xs text-muted-foreground">كود العميل: {customer.customerCode || '—'}</p></div><div><p className="text-xs text-muted-foreground">المنطقة</p><p className="mt-1 font-semibold">{customer.zoneNameAr || customer.zoneNameEn || '—'}</p></div><div><p className="text-xs text-muted-foreground">إجمالي المستحق للخدمات الإضافية</p><p className="mt-1 text-xl font-bold text-primary">{amount(totalOutstanding)}</p></div></div>}
    </CardBox>

    <CardBox><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">الطلبات الجاهزة للتحصيل</h2><p className="mt-1 text-sm text-muted-foreground">تظهر الطلبات المعتمدة التي لا يزال بها رصيد خدمات إضافية مستحق.</p></div><Badge variant="secondary">{requests.length} طلب</Badge></div>
      <div className="overflow-x-auto rounded-xl border"><Table><TableHeader><TableRow><TableHead>رقم الطلب</TableHead><TableHead>الفاتورة</TableHead><TableHead>بنود الخدمات</TableHead><TableHead className="text-left">الإجمالي</TableHead><TableHead className="text-left">المدفوع</TableHead><TableHead className="text-left">المتبقي</TableHead><TableHead className="w-36" /></TableRow></TableHeader><TableBody>{requests.length ? requests.map((request) => <TableRow key={request.requestId}><TableCell className="font-medium">#{request.requestId}</TableCell><TableCell><p className="font-medium">{request.invoiceNumber || `#${request.invoiceId}`}</p><p className="text-xs text-muted-foreground">{request.approvedAt ? new Intl.DateTimeFormat('ar-EG').format(new Date(request.approvedAt)) : '—'}</p></TableCell><TableCell><div className="space-y-1">{request.items.map((item) => <p key={item.invoiceLineId} className="text-sm">{item.serviceNameAr || item.serviceNameEn || item.description || '—'} <span className="text-muted-foreground">× {item.quantity}</span></p>)}</div></TableCell><TableCell className="text-left">{amount(request.totalAmount)}</TableCell><TableCell className="text-left text-emerald-700">{amount(request.paidAmount)}</TableCell><TableCell className="text-left font-semibold text-destructive">{amount(request.outstandingAmount)}</TableCell><TableCell><Button type="button" size="sm" onClick={() => openReview(request)}><Wallet className="me-2 h-4 w-4" />مراجعة التحصيل</Button></TableCell></TableRow>) : <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">{loading ? 'جارٍ البحث...' : contractId ? 'لا توجد طلبات خدمات إضافية معتمدة جاهزة للتحصيل لهذا العقد.' : 'ابحث برقم العقد لعرض الطلبات.'}</TableCell></TableRow>}</TableBody></Table></div>
    </CardBox>

    <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open && !saving) setSelected(null); }}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>مراجعة التحصيل — طلب #{selected?.requestId}</DialogTitle></DialogHeader>{selected && <div className="space-y-5"><div className="rounded-xl border bg-muted/30 p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{selected.customerNameAr || selected.customerNameEn || '—'}</p><p className="mt-1 text-xs text-muted-foreground">العقد #{selected.contractId} · {selected.invoiceNumber || `فاتورة #${selected.invoiceId}`}</p></div><div className="text-left"><p className="text-xs text-muted-foreground">المتبقي</p><p className="text-lg font-bold text-destructive">{amount(selected.outstandingAmount)}</p></div></div><div className="mt-4 space-y-2 border-t pt-3">{selected.items.map((item) => <div key={item.invoiceLineId} className="flex justify-between gap-3 text-sm"><span>{item.serviceNameAr || item.serviceNameEn || item.description || '—'} × {item.quantity}</span><span className="font-medium">{amount(item.outstandingAmount)}</span></div>)}</div></div>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>مبلغ التحصيل</Label><Input type="number" value={amountToCollect} readOnly aria-readonly="true" className="cursor-not-allowed bg-muted font-semibold" /><p className="text-xs text-muted-foreground">يُحصّل كامل الرصيد المستحق في الطلب: {amount(selected.outstandingAmount)}</p></div><div className="space-y-2"><Label>تاريخ التحصيل *</Label><Input dir="ltr" type="date" value={collectionDate} onChange={(event) => setCollectionDate(event.target.value)} /></div></div>
      <div className="space-y-2"><Label>طريقة الدفع *</Label><Select value={paymentMethodId} onValueChange={(value) => { setPaymentMethodId(value); setPaymentDetails(paymentDetailsDefaults()); }}><SelectTrigger><SelectValue placeholder="اختر طريقة الدفع" /></SelectTrigger><SelectContent>{methods.map((method) => <SelectItem key={method.id} value={String(method.id)}>{method.nameAr || method.name_ar || method.code}</SelectItem>)}</SelectContent></Select></div>
      {paymentMethodCode === 'CASH' && <div className="space-y-2"><Label>رقم الإيصال النقدي *</Label><Input value={paymentDetails.receiptNumber} onChange={(event) => updateDetails('receiptNumber', event.target.value)} /></div>}
      {paymentMethodCode === 'BANKTRANSFER' && <div className="grid gap-4 sm:grid-cols-3"><div className="space-y-2"><Label>تاريخ الحوالة *</Label><Input dir="ltr" type="date" value={paymentDetails.transferDate} onChange={(event) => updateDetails('transferDate', event.target.value)} /></div><div className="space-y-2"><Label>البنك *</Label><Select value={paymentDetails.bankId} onValueChange={(value) => updateDetails('bankId', value)}><SelectTrigger><SelectValue placeholder="اختر البنك" /></SelectTrigger><SelectContent>{banks.map((bank) => <SelectItem key={bank.id} value={String(bank.id)}>{bank.nameAr || bank.name_ar || bank.nameEn || bank.name_en}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>الرقم المرجعي *</Label><Input value={paymentDetails.referenceNumber} onChange={(event) => updateDetails('referenceNumber', event.target.value)} /></div></div>}
      {(paymentMethodCode === 'INSTAPAY' || paymentMethodCode === 'PAYSKY') && <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>الرقم المرجعي *</Label><Input value={paymentDetails.referenceNumber} onChange={(event) => updateDetails('referenceNumber', event.target.value)} /></div><div className="space-y-2"><Label>تاريخ العملية *</Label><Input dir="ltr" type="date" value={paymentDetails.transactionDate} onChange={(event) => updateDetails('transactionDate', event.target.value)} /></div></div>}
      {paymentMethodCode === 'CHEQUE' && <div className="grid gap-4 sm:grid-cols-3"><div className="space-y-2"><Label>البنك *</Label><Select value={paymentDetails.bankId} onValueChange={(value) => updateDetails('bankId', value)}><SelectTrigger><SelectValue placeholder="اختر البنك" /></SelectTrigger><SelectContent>{banks.map((bank) => <SelectItem key={bank.id} value={String(bank.id)}>{bank.nameAr || bank.name_ar || bank.nameEn || bank.name_en}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>رقم الشيك *</Label><Input inputMode="numeric" value={paymentDetails.chequeNumber} onChange={(event) => updateDetails('chequeNumber', event.target.value.replace(/\D/g, ''))} /></div><div className="space-y-2"><Label>تاريخ الاستحقاق *</Label><Input dir="ltr" type="date" value={paymentDetails.chequeDueDate} onChange={(event) => updateDetails('chequeDueDate', event.target.value)} /></div></div>}
      <div className="space-y-2"><Label>ملاحظات</Label><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} placeholder="ملاحظات التحصيل..." /></div><div className="flex gap-3 border-t pt-5"><Button type="button" variant="outline" className="flex-1" onClick={() => setSelected(null)} disabled={saving}><X className="me-2 h-4 w-4" />إلغاء</Button><Button type="button" className="flex-1" onClick={() => void submitCollection()} disabled={saving}>{saving ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="me-2 h-4 w-4" />}تأكيد التحصيل</Button></div></div>}</DialogContent></Dialog>
  </div>;
}

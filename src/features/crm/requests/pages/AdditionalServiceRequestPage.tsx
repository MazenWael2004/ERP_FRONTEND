import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import CardBox from 'src/components/shared/CardBox';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';
import { Badge } from 'src/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import { createServiceRequest, fetchRequestCatalog, fetchRequestZones, fetchZoneContracts } from '../api/serviceRequestService';

type Zone = { id: number; nameEn: string; nameAr: string; code: string };
type Contract = { id: number; customerCode: string; customerNameAr: string; customerNameEn: string };
type CatalogItem = { id: number; type: 'ADDITIONAL_SERVICE' | 'HARDWARE'; code: string; nameEn: string; nameAr: string; joining_fee: number; joiningFee?: number; isQuantityBased: boolean };
type SelectedItem = CatalogItem & { quantity: number };
const errorMessage = (error: any) => error?.response?.data?.error?.message || error?.response?.data?.message || 'تعذر إتمام العملية. حاول مرة أخرى.';

export default function AdditionalServiceRequestPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('/add-new-request', 'CREATE');
  const [zones, setZones] = useState<Zone[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [zoneId, setZoneId] = useState('');
  const [contractId, setContractId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loadingZones, setLoadingZones] = useState(true);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [zonesResponse, catalogResponse] = await Promise.all([fetchRequestZones(), fetchRequestCatalog()]);
        setZones(zonesResponse.data || []);
        setCatalog(catalogResponse.data || []);
      } catch (error) {
        await Swal.fire({ icon: 'error', title: 'تعذر تحميل بيانات الطلب', text: errorMessage(error) });
      } finally { setLoadingZones(false); }
    };
    void load();
  }, []);

  useEffect(() => {
    setContractId(''); setContracts([]);
    if (!zoneId) return;
    const loadContracts = async () => {
      try { setLoadingContracts(true); const response = await fetchZoneContracts(Number(zoneId)); setContracts(response.data || []); }
      catch (error) { await Swal.fire({ icon: 'error', title: 'تعذر تحميل عقود المنطقة', text: errorMessage(error) }); }
      finally { setLoadingContracts(false); }
    };
    void loadContracts();
  }, [zoneId]);

  const availableCatalog = useMemo(() => catalog.filter((service) => !items.some((item) => item.id === service.id)), [catalog, items]);
  const total = items.reduce((sum, item) => sum + Number(item.joiningFee ?? item.joining_fee ?? 0) * item.quantity, 0);
  const addItem = () => {
    const item = catalog.find((service) => Number(service.id) === Number(selectedServiceId));
    if (item) { setItems((current) => [...current, { ...item, quantity: 1 }]); setSelectedServiceId(''); }
  };
  const updateQuantity = (id: number, quantity: number) => setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, Math.floor(quantity || 1)) } : item));
  const submit = async () => {
    if (!zoneId || !contractId || !items.length) {
      await Swal.fire({ icon: 'warning', title: 'بيانات ناقصة', text: 'اختر المنطقة والعقد وأضف خدمة واحدة على الأقل.' }); return;
    }
    try {
      setSaving(true);
      await createServiceRequest({ zoneId: Number(zoneId), contractId: Number(contractId), notes: notes.trim(), items: items.map((item) => ({ serviceId: item.id, quantity: item.quantity })) });
      await Swal.fire({ icon: 'success', title: 'تم إرسال الطلب', text: 'تم إرسال طلب الخدمات الإضافية إلى مدير العمليات للمراجعة.' });
      setContractId(''); setItems([]); setNotes(''); setSelectedServiceId('');
    } catch (error) { await Swal.fire({ icon: 'error', title: 'تعذر إرسال الطلب', text: errorMessage(error) }); }
    finally { setSaving(false); }
  };

  return <div className="space-y-6">
    <BreadcrumbComp title="طلب خدمات إضافية" items={[{ title: 'CRM', to: '/' }, { title: 'طلب خدمات إضافية' }]} />
    <CardBox><div className="mb-6"><h2 className="text-xl font-semibold">طلب خدمات إضافية</h2><p className="mt-1 text-sm text-muted-foreground">اختر المنطقة أولًا، ثم عقدًا منها. سيُرسل الطلب للاعتماد؛ لا يتم إنشاء أي تحصيل الآن.</p></div>
      {!canCreate ? <p className="text-destructive">ليس لديك صلاحية إنشاء طلبات خدمات إضافية.</p> : <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2"><Label>المنطقة *</Label><Select value={zoneId} onValueChange={setZoneId} disabled={loadingZones}><SelectTrigger><SelectValue placeholder={loadingZones ? 'جارٍ التحميل...' : 'اختر المنطقة'} /></SelectTrigger><SelectContent>{zones.map((zone) => <SelectItem key={zone.id} value={String(zone.id)}>{zone.nameAr || zone.nameEn} {zone.code ? `(${zone.code})` : ''}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>العقد *</Label><Select value={contractId} onValueChange={setContractId} disabled={!zoneId || loadingContracts}><SelectTrigger><SelectValue placeholder={loadingContracts ? 'جارٍ تحميل العقود...' : zoneId ? 'اختر العقد' : 'اختر المنطقة أولًا'} /></SelectTrigger><SelectContent>{contracts.map((contract) => <SelectItem key={contract.id} value={String(contract.id)}>#{contract.id} — {contract.customerNameAr || contract.customerNameEn} ({contract.customerCode || '—'})</SelectItem>)}</SelectContent></Select>{zoneId && !loadingContracts && !contracts.length && <p className="text-xs text-muted-foreground">لا توجد عقود في هذه المنطقة.</p>}</div>
        </div>
        <div className="rounded-lg border p-4"><div className="mb-4 flex flex-wrap items-end gap-3"><div className="min-w-[260px] flex-1 space-y-2"><Label>الخدمة أو الجهاز</Label><Select value={selectedServiceId} onValueChange={setSelectedServiceId}><SelectTrigger><SelectValue placeholder="اختر وحدة إضافية أو نسخ أو جهاز" /></SelectTrigger><SelectContent>{availableCatalog.map((service) => <SelectItem key={service.id} value={String(service.id)}>{service.nameAr || service.nameEn} — {service.type === 'HARDWARE' ? 'جهاز' : 'خدمة'} — {Number(service.joiningFee ?? service.joining_fee ?? 0).toLocaleString()} ج.م</SelectItem>)}</SelectContent></Select></div><Button type="button" onClick={addItem} disabled={!selectedServiceId}><Plus className="me-2 h-4 w-4" />إضافة</Button></div>
          <Table><TableHeader><TableRow><TableHead>الصنف</TableHead><TableHead>النوع</TableHead><TableHead>الكمية</TableHead><TableHead>سعر الوحدة</TableHead><TableHead>الإجمالي</TableHead><TableHead /></TableRow></TableHeader><TableBody>{items.length ? items.map((item) => { const unitPrice = Number(item.joiningFee ?? item.joining_fee ?? 0); return <TableRow key={item.id}><TableCell>{item.nameAr || item.nameEn}</TableCell><TableCell><Badge variant="secondary">{item.type === 'HARDWARE' ? 'جهاز' : 'خدمة'}</Badge></TableCell><TableCell>{item.isQuantityBased ? <Input className="w-24" type="number" min={1} value={item.quantity} onChange={(event) => updateQuantity(item.id, Number(event.target.value))} /> : '1'}</TableCell><TableCell>{unitPrice.toLocaleString()} ج.م</TableCell><TableCell>{(unitPrice * item.quantity).toLocaleString()} ج.م</TableCell><TableCell><Button type="button" variant="ghost" size="icon" onClick={() => setItems((current) => current.filter((selected) => selected.id !== item.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>; }) : <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">أضف الخدمات أو الأجهزة المطلوبة.</TableCell></TableRow>}</TableBody></Table>
          <div className="mt-4 text-end text-lg font-semibold">إجمالي مبدئي: {total.toLocaleString()} ج.م</div>
        </div>
        <div className="space-y-2"><Label>ملاحظات إضافية</Label><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} placeholder="أي تفاصيل يحتاجها مدير العمليات..." /><p className="text-xs text-muted-foreground">{notes.length}/1000</p></div>
        <div className="flex justify-end"><Button type="button" onClick={submit} disabled={saving}>{saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}إرسال للاعتماد</Button></div>
      </div>}
    </CardBox>
  </div>;
}

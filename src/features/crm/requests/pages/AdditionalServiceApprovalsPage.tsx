import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Check, Loader2, RefreshCw, X } from 'lucide-react';
import CardBox from 'src/components/shared/CardBox';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import { approveServiceRequest, fetchPendingServiceRequests, rejectServiceRequest } from '../api/serviceRequestService';

type Item = { id: number; quantity: number; unitPrice: number; totalAmount: number; serviceNameAr: string; serviceNameEn: string; serviceType: string };
type Request = { id: number; requestedAt: string; notes: string; contractId: number; zoneNameAr: string; zoneNameEn: string; customerCode: string; customerNameAr: string; customerNameEn: string; requesterNameAr: string; requesterNameEn: string; items: Item[] };
const errorMessage = (error: any) => error?.response?.data?.error?.message || error?.response?.data?.message || 'تعذر إتمام العملية. حاول مرة أخرى.';
const formatDate = (value: string) => value ? new Intl.DateTimeFormat('en-GB').format(new Date(value)) : '—';

export default function AdditionalServiceApprovalsPage() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission('/additional-service-requests', 'WRITE');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Request | null>(null);
  const [mode, setMode] = useState<'approve' | 'reject' | null>(null);
  const [managerNotes, setManagerNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const load = useCallback(async () => {
    try { setLoading(true); const response = await fetchPendingServiceRequests(); setRequests(response.data || []); }
    catch (error) { await Swal.fire({ icon: 'error', title: 'تعذر تحميل الطلبات', text: errorMessage(error) }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const openDecision = (request: Request, nextMode: 'approve' | 'reject') => { setSelected(request); setMode(nextMode); setManagerNotes(''); setRejectionReason(''); };
  const decide = async () => {
    if (!selected || !mode) return;
    if (mode === 'reject' && !rejectionReason.trim()) { await Swal.fire({ icon: 'warning', title: 'سبب الرفض مطلوب', text: 'اكتب سبب الرفض قبل الحفظ.' }); return; }
    try {
      setSaving(true);
      if (mode === 'approve') await approveServiceRequest(selected.id, managerNotes.trim());
      else await rejectServiceRequest(selected.id, rejectionReason.trim(), managerNotes.trim());
      await Swal.fire({ icon: 'success', title: mode === 'approve' ? 'تمت الموافقة وإصدار الفاتورة' : 'تم رفض الطلب', text: mode === 'approve' ? 'لم يتم إنشاء تحصيل؛ ستكون الفاتورة جاهزة للتحصيل لاحقًا.' : undefined });
      setSelected(null); setMode(null); await load();
    } catch (error) { await Swal.fire({ icon: 'error', title: 'تعذر حفظ القرار', text: errorMessage(error) }); }
    finally { setSaving(false); }
  };

  return <div className="space-y-6">
    <BreadcrumbComp title="اعتمادات الخدمات الإضافية" items={[{ title: 'CRM', to: '/' }, { title: 'اعتمادات الخدمات الإضافية' }]} />
    <CardBox><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">اعتمادات الخدمات الإضافية</h2><p className="mt-1 text-sm text-muted-foreground">الموافقة تُنشئ فاتورة فقط. التحصيل يتم لاحقًا من دورة التحصيل.</p></div><Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className="me-2 h-4 w-4" />تحديث</Button></div>
      <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>الطلب</TableHead><TableHead>العقد / العميل</TableHead><TableHead>المنطقة</TableHead><TableHead>الخدمات</TableHead><TableHead>الإجمالي</TableHead><TableHead>ملاحظات مقدم الطلب</TableHead><TableHead>التاريخ</TableHead><TableHead /></TableRow></TableHeader><TableBody>
        {loading ? <TableRow><TableCell colSpan={8} className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></TableCell></TableRow> : !requests.length ? <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">لا توجد طلبات بانتظار المراجعة.</TableCell></TableRow> : requests.map((request) => { const total = request.items.reduce((sum, item) => sum + Number(item.totalAmount), 0); return <TableRow key={request.id}><TableCell>#{request.id}</TableCell><TableCell><div className="font-medium">#{request.contractId} — {request.customerNameAr || request.customerNameEn}</div><div className="text-xs text-muted-foreground">{request.customerCode || '—'}</div></TableCell><TableCell>{request.zoneNameAr || request.zoneNameEn}</TableCell><TableCell><div className="space-y-1">{request.items.map((item) => <div key={item.id} className="text-sm">{item.serviceNameAr || item.serviceNameEn} × {item.quantity} <Badge variant="secondary" className="ms-1">{item.serviceType === 'HARDWARE' ? 'جهاز' : 'خدمة'}</Badge></div>)}</div></TableCell><TableCell>{total.toLocaleString()} ج.م</TableCell><TableCell className="max-w-[210px] whitespace-normal text-sm">{request.notes || '—'}</TableCell><TableCell>{formatDate(request.requestedAt)}</TableCell><TableCell><div className="flex gap-2">{canWrite && <><Button size="sm" onClick={() => openDecision(request, 'approve')}><Check className="me-1 h-4 w-4" />موافقة</Button><Button size="sm" variant="destructive" onClick={() => openDecision(request, 'reject')}><X className="me-1 h-4 w-4" />رفض</Button></>}</div></TableCell></TableRow>; })}
      </TableBody></Table></div>
    </CardBox>
    <Dialog open={Boolean(selected && mode)} onOpenChange={(open) => { if (!open && !saving) { setSelected(null); setMode(null); } }}><DialogContent><DialogHeader><DialogTitle>{mode === 'approve' ? 'الموافقة على الطلب' : 'رفض الطلب'} #{selected?.id}</DialogTitle><DialogDescription>{mode === 'approve' ? 'سيتم إنشاء فاتورة بالخدمات المعتمدة. لا يتم إنشاء تحصيل.' : 'سيظهر سبب الرفض ضمن سجل الطلب.'}</DialogDescription></DialogHeader><div className="space-y-4">{mode === 'reject' && <div className="space-y-2"><Label>سبب الرفض *</Label><Textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} maxLength={1000} /></div>}<div className="space-y-2"><Label>ملاحظات مدير العمليات</Label><Textarea value={managerNotes} onChange={(event) => setManagerNotes(event.target.value)} maxLength={1000} /></div></div><DialogFooter><Button variant="outline" onClick={() => { setSelected(null); setMode(null); }} disabled={saving}>إلغاء</Button><Button variant={mode === 'reject' ? 'destructive' : 'default'} onClick={() => void decide()} disabled={saving}>{saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}{mode === 'approve' ? 'اعتماد وإصدار فاتورة' : 'تأكيد الرفض'}</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}

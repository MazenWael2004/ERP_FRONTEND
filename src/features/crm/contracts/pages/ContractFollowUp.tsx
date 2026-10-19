import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, History, RefreshCw, Wrench, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Card, CardContent } from 'src/components/ui/card';
import {
  activateContract,
  approveContract,
  fetchContractHistory,
  fetchContractWorkflow,
  fetchZoneTechnicians,
  implementContract,
  rejectContract,
  type WorkflowContract,
  type WorkflowHistory,
} from '../api/contractWorkflowService';

const labels: Record<string, string> = {
  PENDING_APPROVAL: 'بانتظار اعتماد الدعم الفني',
  AWAITING_ACTIVATION: 'بانتظار تفعيل الكول سنتر',
  AWAITING_IMPLEMENTATION: 'بانتظار التنفيذ والتركيب',
  IMPLEMENTED: 'تم التنفيذ',
  REJECTED: 'مرفوض',
};
const money = (value?: number | null) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export default function ContractFollowUp() {
  const [contracts, setContracts] = useState<WorkflowContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [openHistory, setOpenHistory] = useState<number | null>(null);
  const [history, setHistory] = useState<Record<number, WorkflowHistory[]>>({});
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setContracts(await fetchContractWorkflow());
    } catch {
      setError('تعذر تحميل متابعة العقود. تحقق من الاتصال ثم أعد المحاولة.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const action = async (
    contract: WorkflowContract,
    type: 'APPROVE' | 'REJECT' | 'ACTIVATE' | 'IMPLEMENT',
  ) => {
    if (type === 'ACTIVATE') {
      let technicians: Array<{ id: number; name_ar?: string; name_en?: string }> = [];
      try {
        technicians = await fetchZoneTechnicians(contract.id);
      } catch {
        await Swal.fire('تعذر تحميل الفنيين', '', 'error');
        return;
      }
      const options = technicians
        .map(
          (item) =>
            `<option value="${item.id}">${item.name_ar || item.name_en || `فني #${item.id}`}</option>`,
        )
        .join('');
      const result = await Swal.fire({
        title: 'تفعيل العقد وتكليف فني',
        html: options
          ? `<select id="workflow-tech" class="swal2-select"><option value="">اختر الفني</option>${options}</select>`
          : 'لا يوجد فني مرتبط بمنطقة هذا العقد.',
        showCancelButton: true,
        confirmButtonText: 'تفعيل وتكليف',
        cancelButtonText: 'إلغاء',
        preConfirm: () => {
          const value = (document.getElementById('workflow-tech') as HTMLSelectElement | null)
            ?.value;
          if (!value) {
            Swal.showValidationMessage('اختر الفني المسؤول');
            return false;
          }
          return Number(value);
        },
      });
      if (!result.isConfirmed) return;
      setBusyId(contract.id);
      try {
        await activateContract(contract.id, result.value);
        await Swal.fire('تم التفعيل', 'تم إرسال العقد للفني المختار.', 'success');
        await load();
      } catch (e: any) {
        await Swal.fire('تعذر التفعيل', e?.response?.data?.message || 'حاول مرة أخرى.', 'error');
      } finally {
        setBusyId(null);
      }
      return;
    }
    const rejecting = type === 'REJECT';
    const result = await Swal.fire({
      title: rejecting
        ? 'سبب رفض العقد'
        : type === 'APPROVE'
          ? 'اعتماد العقد'
          : 'تأكيد التركيب والتنفيذ',
      input: 'textarea',
      inputPlaceholder: rejecting ? 'اكتب سبب الرفض' : 'ملاحظة اختيارية',
      showCancelButton: true,
      confirmButtonText: rejecting ? 'رفض العقد' : 'تأكيد',
      cancelButtonText: 'إلغاء',
      inputValidator: (value) => (rejecting && !value?.trim() ? 'سبب الرفض مطلوب' : undefined),
    });
    if (!result.isConfirmed) return;
    setBusyId(contract.id);
    try {
      if (type === 'APPROVE') await approveContract(contract.id, result.value);
      if (type === 'REJECT') await rejectContract(contract.id, result.value);
      if (type === 'IMPLEMENT') await implementContract(contract.id, result.value);
      await Swal.fire('تم حفظ الإجراء', '', 'success');
      await load();
    } catch (e: any) {
      await Swal.fire('تعذر حفظ الإجراء', e?.response?.data?.message || 'حاول مرة أخرى.', 'error');
    } finally {
      setBusyId(null);
    }
  };
  const toggleHistory = async (id: number) => {
    if (openHistory === id) {
      setOpenHistory(null);
      return;
    }
    setOpenHistory(id);
    if (history[id]) return;
    try {
      const rows = await fetchContractHistory(id);
      setHistory((current) => ({ ...current, [id]: rows }));
    } catch {
      setHistory((current) => ({ ...current, [id]: [] }));
    }
  };
  const count = (state: string) =>
    contracts.filter((item) => item.workflow_status === state).length;
  return (
    <div dir="rtl" className="space-y-6">
      <BreadcrumbComp
        title="متابعة العقود"
        items={[{ title: 'CRM' }, { title: 'متابعة العقود' }]}
        breadCrumbBg={undefined}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {['PENDING_APPROVAL', 'AWAITING_ACTIVATION', 'AWAITING_IMPLEMENTATION', 'IMPLEMENTED'].map(
          (state) => (
            <Card key={state}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{labels[state]}</p>
                <p className="mt-2 text-2xl font-bold">{count(state)}</p>
              </CardContent>
            </Card>
          ),
        )}
      </div>
      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div>
            <h2 className="font-bold">رحلة العقد</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              إنشاء ← اعتماد المدير وإنشاء الفواتير ← التفعيل ← التنفيذ ← أهداف الفني
            </p>
          </div>
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center text-destructive">{error}</div>
          ) : loading ? (
            <div className="p-12 text-center text-muted-foreground">جارٍ تحميل العقود...</div>
          ) : (
            <div className="divide-y">
              {contracts.map((contract) => (
                <div key={contract.id} className="p-4 sm:p-5">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold">
                          عقد #{contract.id} —{' '}
                          {contract.customer_name_ar || contract.customer_name_en}
                        </p>
                        <Badge
                          variant={
                            (contract.workflow_status === 'REJECTED'
                              ? 'destructive'
                              : contract.workflow_status === 'IMPLEMENTED'
                                ? 'default'
                                : 'secondary') as any
                          }
                        >
                          {labels[contract.workflow_status] || contract.workflow_status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {contract.customer_code || 'بدون كود'} ·{' '}
                        {contract.zone_name_ar || contract.zone_name_en || 'بدون منطقة'} ·{' '}
                        {money(contract.total_after_discount)}
                        {contract.technician_name_ar || contract.technician_name_en
                          ? ` · الفني: ${contract.technician_name_ar || contract.technician_name_en}`
                          : ''}
                      </p>
                      {contract.rejection_reason && (
                        <p className="mt-2 text-sm text-destructive">
                          سبب الرفض: {contract.rejection_reason}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void toggleHistory(contract.id)}
                      >
                        <History className="ml-2 h-4 w-4" />
                        السجل
                      </Button>
                      {contract.availableActions.includes('APPROVE') && (
                        <Button
                          size="sm"
                          disabled={busyId === contract.id}
                          onClick={() => void action(contract, 'APPROVE')}
                        >
                          <CheckCircle2 className="ml-2 h-4 w-4" />
                          اعتماد
                        </Button>
                      )}
                      {contract.availableActions.includes('REJECT') && (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busyId === contract.id}
                          onClick={() => void action(contract, 'REJECT')}
                        >
                          <XCircle className="ml-2 h-4 w-4" />
                          رفض
                        </Button>
                      )}
                      {contract.availableActions.includes('ACTIVATE') && (
                        <Button
                          size="sm"
                          disabled={busyId === contract.id}
                          onClick={() => void action(contract, 'ACTIVATE')}
                        >
                          <ClipboardList className="ml-2 h-4 w-4" />
                          تفعيل وتكليف
                        </Button>
                      )}
                      {contract.availableActions.includes('IMPLEMENT') && (
                        <Button
                          size="sm"
                          disabled={busyId === contract.id}
                          onClick={() => void action(contract, 'IMPLEMENT')}
                        >
                          <Wrench className="ml-2 h-4 w-4" />
                          تنفيذ / تركيب
                        </Button>
                      )}
                    </div>
                  </div>
                  {openHistory === contract.id && (
                    <div className="mt-4 rounded-xl border bg-muted/30 p-3">
                      <p className="mb-2 text-sm font-semibold">سجل الإجراءات</p>
                      {history[contract.id]?.length ? (
                        <div className="space-y-2">
                          {history[contract.id].map((item) => (
                            <div key={item.id} className="rounded-lg bg-background p-3 text-sm">
                              <span className="font-semibold">{item.action_code}</span>
                              <span className="mx-2 text-muted-foreground">
                                {new Date(item.created_at).toLocaleString('ar-EG')}
                              </span>
                              <span className="text-muted-foreground">
                                {item.performed_by_name_ar || item.performed_by_name_en || 'النظام'}
                              </span>
                              {item.description && (
                                <p className="mt-1 text-muted-foreground">{item.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">لا توجد إجراءات مسجلة.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {!contracts.length && (
                <div className="p-12 text-center text-muted-foreground">
                  لا توجد عقود ضمن نطاقك.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

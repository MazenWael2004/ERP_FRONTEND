import { memo, useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
  CheckCircle2,
  Check,
  ChevronsUpDown,
  ClipboardList,
  History,
  MessageSquarePlus,
  RefreshCw,
  Search,
  Wrench,
  XCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import { Textarea } from 'src/components/ui/textarea';
import { cn } from 'src/lib/utils';
import {
  activateContract,
  addContractNote,
  assignContractTechnician,
  approveContract,
  checkContract,
  fetchContractHistory,
  fetchContractWorkflow,
  fetchHierarchyAssignmentOptions,
  installContract,
  rejectContract,
  returnContractToManager,
} from '../api/contractWorkflowService';

const labels: any = {
  UNDER_CHECKING: 'تحت المراجعة',
  PENDING: 'بانتظار قرار مدير العمليات',
  UNDER_INSTALLATION: 'تحت التركيب',
  INSTALLED: 'تم التركيب - بانتظار التأكيد',
  ACTIVATED: 'مفعل',
  REJECTED_PENDING_REFUND: 'مرفوض - بانتظار رد المبالغ',
  REJECTED: 'مرفوض',
};
const pageSizeOptions = [10, 25, 50];
const money = (value: any) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
const dateTime = (value: any) =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Cairo',
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(value))
    : '—';
const currentMonthDateRange = () => {
  const today = new Date();
  const toDateInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
    endDate: toDateInput(today),
  };
};
const date = (value: any) =>
  value
    ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo' }).format(new Date(value))
    : '—';
const time12 = (value: any) => {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '—';
  const hour = Number(match[1]);
  const minute = match[2];
  if (hour > 23) return '—';
  return `${String(hour % 12 || 12).padStart(2, '0')}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
};
const text = (value: any) =>
  value === null || value === undefined || value === '' ? '—' : String(value);
const contactType = (value: any) => {
  const type = String(value || '').toUpperCase();
  if (type === 'OWNER') return 'مالك';
  if (type === 'TENANT') return 'مستأجر';
  return text(value);
};
const auditChanges = (metadata: unknown) => {
  try {
    const parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
    return Array.isArray((parsed as any)?.changes) ? (parsed as any).changes : [];
  } catch {
    return [];
  }
};
const historyActionLabel = (item: any) =>
  item.action_code === 'WORKFLOW_CUSTOMER_EDITED'
    ? 'تعديل بيانات العميل'
    : item.action_code === 'PENDING_CONTRACT_BILLING_EDITED'
      ? 'تعديل العقد والاشتراك والإضافات'
      : item.action_code;
const customerEditHistory = (items: any[] | undefined) =>
  (items || []).filter((item) =>
    ['WORKFLOW_CUSTOMER_EDITED', 'PENDING_CONTRACT_BILLING_EDITED'].includes(item.action_code),
  );
function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  disabled = false,
  error = false,
}: any) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option: any) => String(option.value) === String(value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={error}
          disabled={disabled}
          className={cn(
            'relative h-11 w-full justify-start rounded-xl bg-background py-0 pl-10 pr-3 text-right font-normal hover:bg-background',
            !selected && 'text-muted-foreground',
            error && 'border-destructive',
          )}
        >
          <span className="truncate">{selected?.label || placeholder}</span>
          <ChevronsUpDown className="absolute left-3 h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent dir="rtl" align="start" className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>لا توجد نتائج مطابقة</CommandEmpty>
            <CommandGroup>
              {options.map((option: any) => (
                <CommandItem
                  key={String(option.value)}
                  value={`${option.label} ${option.value}`}
                  onSelect={() => {
                    onValueChange(String(option.value));
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'ml-2 h-4 w-4',
                      String(value) === String(option.value) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
const columns: any[] = [
  { header: 'كود العميل (رقم العقد)', value: (c: any) => text(c.id) },
  { header: 'تاريخ إنشاء العقد', value: (c: any) => date(c.contract_date) },
  { header: 'وقت إنشاء العقد', value: (c: any) => time12(c.created_time), cellClassName: 'whitespace-nowrap' },
  {
    header: 'مسئول البيع',
    value: (c: any) => text(c.created_by_name_ar || c.created_by_name_en || c.created_by_username),
  },
  {
    header: 'مشارك',
    value: (c: any) =>
      text(c.representative_name_ar || c.representative_name_en || c.representative_username),
  },
  { header: 'البرنامج', value: (c: any) => text(c.program_name_ar || c.program_name_en) },
  { header: 'نوع الاشتراك', value: (c: any) => text(c.main_subscription_service_name_ar || c.main_subscription_service_name_en) },
  { header: 'اسم العميل ', value: (c: any) => text(c.customer_name_ar) },
  {
    header: 'نوع العميل',
    value: (c: any) => text(c.customer_type_name_ar || c.customer_type_name_en),
  },
  { header: 'الهيكل', value: (c: any) => text(c.structure) },
  { header: 'رقم المحمول المتعاقد', value: (c: any) => text(c.customer_phone) },
  { header: 'اسم المتعاقد', value: (c: any) => text(c.contact_name_ar || c.contact_name_en) },
  { header: 'صفة المتعاقد', value: (c: any) => contactType(c.contact_type) },
  { header: 'رقم القومي المتعاقد', value: (c: any) => text(c.contact_national_id) },
  { header: 'الرقم الضريبي', value: (c: any) => text(c.tax_number) },
  { header: 'السجل التجاري', value: (c: any) => text(c.registration_number) },
  { header: 'رقم الترخيص', value: (c: any) => text(c.license_number) },
  { header: 'المحافظة', value: (c: any) => text(c.governorate_name_ar || c.governorate_name_en) },
  { header: 'القسم / المركز', value: (c: any) => text(c.district_name_ar || c.district_name_en) },
  { header: 'الشياخة', value: (c: any) => text(c.shiyakha_name_ar || c.shiyakha_name_en) },
  { header: 'الفرع', value: (c: any) => text(c.zone_name_ar || c.zone_name_en) },
  { header: 'الشارع', value: (c: any) => text(c.street) },
  { header: 'رقم المبنى', value: (c: any) => text(c.building_number) },
  { header: 'رمز GLN', value: (c: any) => text(c.gln_code) },
  {
    header: 'رابط الخريطة',
    value: (c: any) => text(c.google_maps_url),
    cellClassName: 'min-w-[280px] max-w-[360px] whitespace-normal break-all leading-5',
  },
  { header: 'خط العرض', value: (c: any) => text(c.latitude), cellClassName: 'whitespace-nowrap tabular-nums' },
  { header: 'خط الطول', value: (c: any) => text(c.longitude), cellClassName: 'whitespace-nowrap tabular-nums' },
  { header: 'تاريخ التركيب المخطط', value: (c: any) => date(c.installation_date) },
  { header: 'تاريخ تعيين مدير الدعم الفني', value: (c: any) => date(c.technician_assigned_at) },
  { header: 'تاريخ التركيب الفعلي', value: (c: any) => date(c.actual_installation_date) },
  { header: 'تاريخ إصدار كود التفعيل', value: (c: any) => date(c.activation_code_issued_at) },
  { header: 'تاريخ التفعيل', value: (c: any) => date(c.activated_at) },

  { header: 'تاريخ الاستحقاق القادم', value: (c: any) => date(c.next_subscription_due_date) },
   {
    header: 'مسئول التركيب',
    value: (c: any) =>
      text(c.implemented_by_name_ar || c.implemented_by_name_en || c.implemented_by_username),
  },
  
  { header: 'إجمالي العقد بعد الخصم', value: (c: any) => Number(c.total_after_discount) },
  { header: 'المقدم', value: (c: any) => Number(c.advance_payment) },
  { header: 'ملاحظات العقد', value: (c: any) => text(c.notes) },
  {
    header: 'تمت المراجعة بواسطة',
    value: (c: any) => text(c.checked_by_name_ar || c.checked_by_name_en || c.checked_by_username),
  },
  { header: 'مراجعة خدمة العملاء', value: (c: any) => text(c.under_checking_notes) },
  { header: 'ملاحظات مدير عمليات', value: (c: any) => text(c.pending_notes) },
  { header: 'كود التفعيل', value: (c: any) => text(c.activation_code) },
  { header: 'ملاحظات  التركيبات', value: (c: any) => text(c.under_installation_notes) },
  { header: 'تأكيد خدمة العملاء', value: (c: any) => text(c.installed_notes) },
  { header: 'حالة العقد', value: (c: any) => labels[c.workflow_status] || c.workflow_status },
];

const ContractWorkflowRow = memo(function ContractWorkflowRow({
  contract,
  isBusy,
  isHistoryOpen,
  historyItems,
  onToggleHistory,
  onAction,
  onEditCustomer,
  onEditBilling,
  onShowAuditDetails,
}: any) {
  const editHistory = useMemo(() => customerEditHistory(historyItems), [historyItems]);

  return (
    <tr className="border-t align-top">
      {columns.map((column) => (
        <td
          key={column.header}
          className={cn('px-4 py-3', column.cellClassName || 'max-w-xs whitespace-nowrap')}
        >
          {column.value(contract)}
        </td>
      ))}
      <td className="min-w-[250px] px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => void onToggleHistory(contract.id)}>
            <History className="ml-2 h-4 w-4" />
            السجل
          </Button>
          {contract.availableActions.includes('EDIT_CUSTOMER') && (
            <Button size="sm" variant="outline" disabled={isBusy} onClick={() => onEditCustomer(contract)}>
              تعديل بيانات العميل
            </Button>
          )}
          {contract.availableActions.includes('EDIT_BILLING') && (
            <Button size="sm" variant="outline" disabled={isBusy} onClick={() => onEditBilling(contract)}>
              تعديل العقد والاشتراك والإضافات
            </Button>
          )}
          {contract.availableActions
            .filter((availableAction: string) => !['EDIT_CUSTOMER', 'EDIT_BILLING'].includes(availableAction))
            .map((availableAction: string) => (
              <Button key={availableAction} size="sm" disabled={isBusy} onClick={() => void onAction(contract, availableAction)}>
                {({
                  CHECK: 'تمت المراجعة', APPROVE: 'موافقة', ASSIGN_TECHNICIAN: 'تعيين الفني', REJECT: 'رفض',
                  INSTALL: 'تم التدريب', ACTIVATE: 'تأكيد التفعيل', RETURN_TO_MANAGER: 'إعادة لمدير الدعم الفني',
                } as any)[availableAction]}
              </Button>
            ))}
        </div>
        {isHistoryOpen && (
          <div className="mt-3 min-w-[420px] rounded-xl border bg-muted/30 p-3">
            <p className="mb-2 font-semibold">سجل التعديلات</p>
            {editHistory.length ? editHistory.map((item: any) => {
              const changes = auditChanges(item.metadata);
              return (
                <div key={item.id} className="border-t py-2 first:border-0">
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    <span className="font-medium">{historyActionLabel(item)}</span>
                    <span className="text-muted-foreground">{dateTime(item.created_at)}</span>
                    <span>{item.performed_by_name_ar || item.performed_by_name_en || 'النظام'}</span>
                  </div>
                  {(item.from_status || item.to_status) && item.from_status !== item.to_status && (
                    <p className="text-xs text-muted-foreground">
                      من: {labels[item.from_status || ''] || item.from_status || '—'} · إلى: {labels[item.to_status || ''] || item.to_status || '—'}
                    </p>
                  )}
                  {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                  {changes.length > 0 && (
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => onShowAuditDetails(contract, item, changes)}>
                      عرض تفاصيل التعديل ({changes.length})
                    </Button>
                  )}
                </div>
              );
            }) : <p className="text-sm text-muted-foreground">لا توجد تعديلات مسجلة على العقد أو بيانات العميل.</p>}
          </div>
        )}
      </td>
    </tr>
  );
});

export default function ContractFollowUp() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [salesResponsibleId, setSalesResponsibleId] = useState('');
  const [dateRange, setDateRange] = useState(currentMonthDateRange);
  const [appliedDateRange, setAppliedDateRange] = useState(currentMonthDateRange);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [busyId, setBusyId] = useState<any>(null);
  const [openHistory, setOpenHistory] = useState<any>(null);
  const [history, setHistory] = useState<any>({});
  const [auditDetails, setAuditDetails] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [assignmentSupervisorId, setAssignmentSupervisorId] = useState('');
  const [assignmentTechnicianId, setAssignmentTechnicianId] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [assignmentError, setAssignmentError] = useState('');
  const contractsQuery = useQuery({
    queryKey: ['contract-workflow', appliedDateRange.startDate, appliedDateRange.endDate],
    queryFn: () => fetchContractWorkflow(appliedDateRange),
  });
  const contracts = contractsQuery.data || [];
  const loading = contractsQuery.isPending || contractsQuery.isFetching;
  const error = contractsQuery.isError ? 'تعذر تحميل متابعة العقود. تحقق من الاتصال ثم أعد المحاولة.' : '';
  const refreshContracts = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['contract-workflow'] }),
    [queryClient],
  );
  const action = useCallback(async (contract: any, type: any) => {
    if (type === 'ASSIGN_TECHNICIAN') {
      try {
        const options = await fetchHierarchyAssignmentOptions(contract.id);
        if (!options.supervisors.length) {
          await Swal.fire(
            'لا يوجد مشرفون متاحون',
            'لا يوجد مشرف دعم فني تابع لك لديه فنيون.',
            'info',
          );
          return;
        }
        setAssignment({ contract, ...options });
        setAssignmentSupervisorId('');
        setAssignmentTechnicianId('');
        setAssignmentNote('');
        setAssignmentError('');
      } catch (e: any) {
        await Swal.fire('تعذر تحميل المشرفين والفنيين', e?.response?.data?.message || '', 'error');
      }
      return;
    }
    if (type === 'APPROVE') {
      const result = await Swal.fire({
        title: 'موافقة العقد',
        html: '<textarea id="workflow-note" class="swal2-textarea" placeholder="ملاحظة اختيارية"></textarea>',
        showCancelButton: true,
        confirmButtonText: 'موافقة',
        cancelButtonText: 'إلغاء',
        preConfirm: () => {
          const note = (document.getElementById('workflow-note') as any)?.value;
          return { note };
        },
      });
      if (!result.isConfirmed) return;
      setBusyId(contract.id);
      try {
        await approveContract(contract.id, result.value.note);
        await Swal.fire(
          'تم الاعتماد',
          'العقد الآن بانتظار مدير الدعم الفني لتعيين الفني.',
          'success',
        );
        await refreshContracts();
      } catch (e: any) {
        await Swal.fire('تعذر الموافقة', e?.response?.data?.message || 'حاول مرة أخرى.', 'error');
      } finally {
        setBusyId(null);
      }
      return;
    }
    const rejecting = type === 'REJECT' || type === 'RETURN_TO_MANAGER';
    if (type === 'INSTALL') {
      const installResult = await Swal.fire({
        title: 'تأكيد التركيب',
        html: '<input id="activation-code" class="swal2-input" placeholder="كود التفعيل اليدوي"><textarea id="workflow-note" class="swal2-textarea" placeholder="ملاحظة اختيارية"></textarea>',
        showCancelButton: true,
        confirmButtonText: 'تم التدريب',
        cancelButtonText: 'إلغاء',
        preConfirm: () => {
          const activationCode = (document.getElementById('activation-code') as any)?.value?.trim();
          const note = (document.getElementById('workflow-note') as any)?.value;
          if (!activationCode) {
            Swal.showValidationMessage('كود التفعيل اليدوي مطلوب');
            return false;
          }
          return { activationCode, note };
        },
      });
      if (!installResult.isConfirmed) return;
      setBusyId(contract.id);
      try {
        await installContract(
          contract.id,
          installResult.value.activationCode,
          installResult.value.note,
        );
        await Swal.fire('تم حفظ الإجراء', '', 'success');
        await refreshContracts();
      } catch (e: any) {
        await Swal.fire(
          'تعذر حفظ الإجراء',
          e?.response?.data?.message || 'حاول مرة أخرى.',
          'error',
        );
      } finally {
        setBusyId(null);
      }
      return;
    }
    const result = await Swal.fire({
      title:
        type === 'REJECT'
          ? 'سبب رفض العقد'
          : rejecting
            ? 'سبب إعادة العقد للدعم الفني'
            : type === 'CHECK'
              ? 'إنهاء مراجعة الكول سنتر'
              : 'تأكيد تفعيل العقد',
      input: 'textarea',
      inputPlaceholder: rejecting ? 'اكتب السبب' : 'ملاحظة اختيارية',
      showCancelButton: true,
      confirmButtonText: rejecting ? 'رفض العقد' : 'تأكيد',
      cancelButtonText: 'إلغاء',
      inputValidator: (value) => (rejecting && !value?.trim() ? 'سبب الرفض مطلوب' : undefined),
    });
    if (!result.isConfirmed) return;
    setBusyId(contract.id);
    try {
      if (type === 'CHECK') await checkContract(contract.id, result.value);
      if (type === 'REJECT') await rejectContract(contract.id, result.value);
      if (type === 'ACTIVATE') await activateContract(contract.id, result.value);
      if (type === 'RETURN_TO_MANAGER') await returnContractToManager(contract.id, result.value);
      await Swal.fire('تم حفظ الإجراء', '', 'success');
      await refreshContracts();
    } catch (e: any) {
      await Swal.fire('تعذر حفظ الإجراء', e?.response?.data?.message || 'حاول مرة أخرى.', 'error');
    } finally {
      setBusyId(null);
    }
  }, [refreshContracts]);
  const submitAssignment = async () => {
    if (!assignmentSupervisorId) {
      setAssignmentError('اختر المشرف الفني أولاً.');
      return;
    }
    if (!assignmentTechnicianId) {
      setAssignmentError('اختر الفني المسؤول عن التركيب.');
      return;
    }
    setAssignmentError('');
    setBusyId(assignment.contract.id);
    try {
      await assignContractTechnician(
        assignment.contract.id,
        Number(assignmentSupervisorId),
        Number(assignmentTechnicianId),
        assignmentNote.trim() || undefined,
      );
      setAssignment(null);
      await Swal.fire('تم تعيين الفني', 'يمكن للفني المختار بدء التركيب.', 'success');
      await refreshContracts();
    } catch (e: any) {
      setAssignmentError(e?.response?.data?.message || 'تعذر حفظ التعيين. حاول مرة أخرى.');
    } finally {
      setBusyId(null);
    }
  };
  const toggleHistory = useCallback(async (id: any) => {
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
  }, [history, openHistory]);
  const addNote = async (contract: any) => {
    const result = await Swal.fire({
      title: 'إضافة ملاحظة للمرحلة الحالية',
      input: 'textarea',
      inputPlaceholder: 'اكتب الملاحظة',
      showCancelButton: true,
      confirmButtonText: 'إضافة',
      cancelButtonText: 'إلغاء',
      inputValidator: (value) => (!value?.trim() ? 'الملاحظة مطلوبة' : undefined),
    });
    if (!result.isConfirmed) return;
    setBusyId(contract.id);
    try {
      await addContractNote(contract.id, result.value);
      await Swal.fire('تمت إضافة الملاحظة', '', 'success');
      setHistory((current) => {
        const next = { ...current };
        delete next[contract.id];
        return next;
      });
    } catch (e: any) {
      await Swal.fire(
        'تعذر إضافة الملاحظة',
        e?.response?.data?.message || 'حاول مرة أخرى.',
        'error',
      );
    } finally {
      setBusyId(null);
    }
  };
  const statusCounts = useMemo(
    () => contracts.reduce((counts: Record<string, number>, contract: any) => {
      counts[contract.workflow_status] = (counts[contract.workflow_status] || 0) + 1;
      return counts;
    }, {}),
    [contracts],
  );
  const count = (state: any) => statusCounts[state] || 0;
  const zones = useMemo(
    () =>
      Array.from(
        new Map(
          contracts
            .filter(
              (contract) => contract.zone_id || contract.zone_name_ar || contract.zone_name_en,
            )
            .map((contract) => [
              String(contract.zone_id ?? contract.zone_name_ar ?? contract.zone_name_en),
              contract,
            ]),
        ).values(),
      ),
    [contracts],
  );
  const salesResponsibles = useMemo(
    () =>
      Array.from(
        new Map(
          contracts
            .filter(
              (contract) =>
                contract.sales_responsible_id ||
                contract.created_by_name_ar ||
                contract.created_by_name_en ||
                contract.created_by_username,
            )
            .map((contract) => [
              String(
                contract.sales_responsible_id ??
                  contract.created_by_username ??
                  contract.created_by_name_ar ??
                  contract.created_by_name_en,
              ),
              contract,
            ]),
        ).values(),
      ),
    [contracts],
  );
  const filteredContracts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return contracts.filter((contract) => {
      const matchesStatus = !workflowStatus || contract.workflow_status === workflowStatus;
      const matchesZone =
        !zoneId ||
        String(contract.zone_id ?? contract.zone_name_ar ?? contract.zone_name_en) === zoneId;
      const responsibleValue = String(
        contract.sales_responsible_id ??
          contract.created_by_username ??
          contract.created_by_name_ar ??
          contract.created_by_name_en ??
          '',
      );
      const matchesSalesResponsible =
        !salesResponsibleId || responsibleValue === salesResponsibleId;
      if (!matchesStatus || !matchesZone || !matchesSalesResponsible) return false;
      if (!normalizedSearch) return true;

      return String(contract.id ?? '')
        .toLocaleLowerCase()
        .includes(normalizedSearch);
    });
  }, [contracts, search, workflowStatus, zoneId, salesResponsibleId]);
  const totalPages = Math.max(1, Math.ceil(filteredContracts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedContracts = useMemo(
    () => filteredContracts.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredContracts, pageSize],
  );
  const firstVisibleRow = filteredContracts.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastVisibleRow = Math.min(currentPage * pageSize, filteredContracts.length);
  const clearFilters = () => {
    const defaultDateRange = currentMonthDateRange();
    setSearch('');
    setWorkflowStatus('');
    setZoneId('');
    setSalesResponsibleId('');
    setDateRange(defaultDateRange);
    setPage(1);
    setAppliedDateRange(defaultDateRange);
  };
  const assignmentTechnicians = useMemo(
    () => assignment?.technicians.filter(
      (technician: any) => String(technician.supervisor_id) === assignmentSupervisorId,
    ) || [],
    [assignment, assignmentSupervisorId],
  );
  const editWorkflowCustomer = useCallback(
    (contract: any) => navigate('/add-new-contract', { state: { workflowCustomerEdit: true, contract } }),
    [navigate],
  );
  const editWorkflowBilling = useCallback(
    (contract: any) => navigate('/add-new-contract', { state: { workflowBillingEdit: true, contract } }),
    [navigate],
  );
  const showAuditDetails = useCallback(
    (contract: any, item: any, changes: any[]) => setAuditDetails({ contract, item, changes }),
    [],
  );
  return (
    <div dir="rtl" className="space-y-6">
      <BreadcrumbComp
        title="متابعة العقود"
        items={[{ title: 'CRM' }, { title: 'متابعة العقود' }]}
        breadCrumbBg={undefined}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {['UNDER_CHECKING', 'PENDING', 'UNDER_INSTALLATION', 'INSTALLED', 'ACTIVATED'].map(
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
              مراجعة الكول سنتر ← قرار مدير العمليات ← تعيين مدير الدعم الفني ← التركيب وكود التفعيل
              ← تأكيد الكول سنتر ← التفعيل
            </p>
          </div>
          <Button variant="outline" onClick={() => void refreshContracts()} disabled={loading}>
            <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-7">
          <label className="grid gap-1 text-sm xl:col-span-2">
            <span>بحث</span>
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="pr-9"
                placeholder="ابحث بكود العميل..."
              />
            </div>
          </label>
          <label className="grid gap-1 text-sm">
            <span>حالة العقد</span>
            <SearchableSelect
              value={workflowStatus}
              onValueChange={(value: string) => {
                setWorkflowStatus(value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'كل الحالات' },
                ...Object.entries(labels).map(([status, label]) => ({
                  value: status,
                  label: String(label),
                })),
              ]}
              placeholder="ابحث واختر الحالة"
              searchPlaceholder="ابحث باسم الحالة..."
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>الفرع</span>
            <SearchableSelect
              value={zoneId}
              onValueChange={(value: string) => {
                setZoneId(value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'كل الفروع' },
                ...zones.map((zone: any) => ({
                  value: String(zone.zone_id ?? zone.zone_name_ar ?? zone.zone_name_en),
                  label: zone.zone_name_ar || zone.zone_name_en,
                })),
              ]}
              placeholder="ابحث واختر المنطقة"
              searchPlaceholder="ابحث باسم المنطقة..."
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>مسؤول البيع</span>
            <SearchableSelect
              value={salesResponsibleId}
              onValueChange={(value: string) => {
                setSalesResponsibleId(value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'كل مسؤولي البيع' },
                ...salesResponsibles.map((responsible: any) => ({
                  value: String(
                    responsible.sales_responsible_id ??
                      responsible.created_by_username ??
                      responsible.created_by_name_ar ??
                      responsible.created_by_name_en,
                  ),
                  label:
                    responsible.created_by_name_ar ||
                    responsible.created_by_name_en ||
                    responsible.created_by_username,
                })),
              ]}
              placeholder="ابحث واختر مسؤول البيع"
              searchPlaceholder="ابحث باسم مسؤول البيع..."
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>من تاريخ العقد</span>
            <Input
              type="date"
              dir="ltr"
              value={dateRange.startDate}
              max={dateRange.endDate || undefined}
              onChange={(event) => setDateRange((current) => ({ ...current, startDate: event.target.value }))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>إلى تاريخ العقد</span>
            <Input
              type="date"
              dir="ltr"
              value={dateRange.endDate}
              min={dateRange.startDate || undefined}
              onChange={(event) => setDateRange((current) => ({ ...current, endDate: event.target.value }))}
            />
          </label>
          <div className="flex items-end gap-2 xl:col-span-7">
            <Button
              onClick={() => {
                setPage(1);
                if (
                  dateRange.startDate === appliedDateRange.startDate &&
                  dateRange.endDate === appliedDateRange.endDate
                ) {
                  void refreshContracts();
                } else {
                  setAppliedDateRange({ ...dateRange });
                }
              }}
              disabled={loading || !dateRange.startDate || !dateRange.endDate}
            >
              تطبيق الفترة
            </Button>
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={loading}
            >
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>
            تفاصيل متابعة العقود ({filteredContracts.length.toLocaleString('ar-EG')})
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {error ? (
            <div className="p-8 text-center text-destructive">{error}</div>
          ) : loading ? (
            <div className="p-12 text-center text-muted-foreground">جارٍ تحميل العقود...</div>
          ) : (
            <>
              <table className="w-full min-w-[5600px] text-sm">
                <thead className="bg-muted">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.header}
                        className="whitespace-nowrap px-4 py-3 text-right font-semibold"
                      >
                        {column.header}
                      </th>
                    ))}
                    <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedContracts.length ? (
                    paginatedContracts.map((contract) => (
                      <ContractWorkflowRow
                        key={contract.id}
                        contract={contract}
                        isBusy={busyId === contract.id}
                        isHistoryOpen={openHistory === contract.id}
                        historyItems={history[contract.id]}
                        onToggleHistory={toggleHistory}
                        onAction={action}
                        onEditCustomer={editWorkflowCustomer}
                        onEditBilling={editWorkflowBilling}
                        onShowAuditDetails={showAuditDetails}
                      />
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="p-8 text-center text-muted-foreground"
                      >
                        لا توجد عقود مطابقة للبحث أو الفلاتر.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {filteredContracts.length > 0 && (
                <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-muted-foreground">
                    عرض {firstVisibleRow.toLocaleString('ar-EG')}–
                    {lastVisibleRow.toLocaleString('ar-EG')} من{' '}
                    {filteredContracts.length.toLocaleString('ar-EG')} عقد
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground">عدد الصفوف:</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(value) => {
                        setPageSize(Number(value));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {pageSizeOptions.map((option) => (
                          <SelectItem key={option} value={String(option)}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={currentPage <= 1}
                    >
                      السابق
                    </Button>
                    <span className="min-w-24 text-center text-xs text-muted-foreground">
                      صفحة {currentPage.toLocaleString('ar-EG')} من{' '}
                      {totalPages.toLocaleString('ar-EG')}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              )}
              <table className="hidden">
                <thead className="bg-muted">
                  <tr>
                    {[
                      'رقم العقد',
                      'تاريخ العقد',
                      'العميل',
                      'كود العميل',
                      'الفرع',
                      'الفني',
                      'القيمة',
                      'حالة سير العمل',
                      'الإجراءات',
                    ].map((header) => (
                      <th
                        key={header}
                        className="whitespace-nowrap px-4 py-3 text-right font-semibold"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contracts.length ? (
                    contracts.map((contract) => (
                      <tr key={contract.id} className="border-t align-top">
                        <td className="whitespace-nowrap px-4 py-3 font-medium">#{contract.id}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo' }).format(
                            new Date(contract.contract_date),
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {contract.customer_name_ar || contract.customer_name_en || '—'}
                          {contract.rejection_reason && (
                            <p className="mt-1 text-xs text-destructive">
                              سبب الرفض: {contract.rejection_reason}
                            </p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {contract.customer_code || '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {contract.zone_name_ar || contract.zone_name_en || '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {contract.technician_name_ar || contract.technician_name_en || '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {money(contract.total_after_discount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <Badge
                            variant={
                              (contract.workflow_status === 'REJECTED'
                                ? 'destructive'
                                : contract.workflow_status === 'ACTIVATED'
                                  ? 'default'
                                  : 'secondary') as any
                            }
                          >
                            {labels[contract.workflow_status] || contract.workflow_status}
                          </Badge>
                        </td>
                        <td className="min-w-[260px] px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void toggleHistory(contract.id)}
                            >
                              <History className="ml-2 h-4 w-4" />
                              السجل
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === contract.id}
                              onClick={() => void addNote(contract)}
                            >
                              <MessageSquarePlus className="ml-2 h-4 w-4" />
                              ملاحظة
                            </Button>
                            {contract.availableActions.includes('CHECK') && (
                              <Button
                                size="sm"
                                disabled={busyId === contract.id}
                                onClick={() => void action(contract, 'CHECK')}
                              >
                                تمت المراجعة
                              </Button>
                            )}
                            {contract.availableActions.includes('APPROVE') && (
                              <Button
                                size="sm"
                                disabled={busyId === contract.id}
                                onClick={() => void action(contract, 'APPROVE')}
                              >
                                موافقة وتكليف
                              </Button>
                            )}
                            {contract.availableActions.includes('REJECT') && (
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={busyId === contract.id}
                                onClick={() => void action(contract, 'REJECT')}
                              >
                                رفض
                              </Button>
                            )}
                            {contract.availableActions.includes('INSTALL') && (
                              <Button
                                size="sm"
                                disabled={busyId === contract.id}
                                onClick={() => void action(contract, 'INSTALL')}
                              >
                                تم التركيب
                              </Button>
                            )}
                            {contract.availableActions.includes('ACTIVATE') && (
                              <Button
                                size="sm"
                                disabled={busyId === contract.id}
                                onClick={() => void action(contract, 'ACTIVATE')}
                              >
                                تأكيد التفعيل
                              </Button>
                            )}
                            {contract.availableActions.includes('RETURN_TO_MANAGER') && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === contract.id}
                                onClick={() => void action(contract, 'RETURN_TO_MANAGER')}
                              >
                                إعادة للدعم الفني
                              </Button>
                            )}
                          </div>
                          {openHistory === contract.id && (
                            <div className="mt-3 min-w-[500px] rounded-xl border bg-muted/30 p-3">
                              <p className="mb-2 font-semibold">سجل الإجراءات</p>
                              {history[contract.id]?.length ? (
                                history[contract.id].map((item) => (
                                  <div key={item.id} className="border-t py-2 first:border-0">
                                    <span className="font-medium">{item.action_code}</span>
                                    <span className="mx-2 text-muted-foreground">
                                      {dateTime(item.created_at)}
                                    </span>
                                    <span>
                                      {item.performed_by_name_ar ||
                                        item.performed_by_name_en ||
                                        'النظام'}
                                    </span>
                                    {(item.from_status || item.to_status) && (
                                      <p className="text-muted-foreground">
                                        من:{' '}
                                        {labels[item.from_status || ''] || item.from_status || '—'}{' '}
                                        · إلى:{' '}
                                        {labels[item.to_status || ''] || item.to_status || '—'}
                                      </p>
                                    )}
                                    {item.description && (
                                      <p className="text-muted-foreground">{item.description}</p>
                                    )}
                                    {auditChanges(item.metadata).map(
                                      (change: any, index: number) => (
                                        <p
                                          key={`${change.field || change.label}-${index}`}
                                          className="text-xs text-muted-foreground"
                                        >
                                          {change.label}: قبل {text(change.before)} · بعد{' '}
                                          {text(change.after)}
                                        </p>
                                      ),
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-muted-foreground">لا توجد إجراءات مسجلة.</p>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        لا توجد عقود ضمن نطاقك.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="hidden">
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
                                : contract.workflow_status === 'ACTIVATED'
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
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === contract.id}
                          onClick={() => void addNote(contract)}
                        >
                          <MessageSquarePlus className="ml-2 h-4 w-4" />
                          ملاحظة
                        </Button>
                        {contract.availableActions.includes('CHECK') && (
                          <Button
                            size="sm"
                            disabled={busyId === contract.id}
                            onClick={() => void action(contract, 'CHECK')}
                          >
                            <ClipboardList className="ml-2 h-4 w-4" />
                            تمت المراجعة
                          </Button>
                        )}
                        {contract.availableActions.includes('APPROVE') && (
                          <Button
                            size="sm"
                            disabled={busyId === contract.id}
                            onClick={() => void action(contract, 'APPROVE')}
                          >
                            <CheckCircle2 className="ml-2 h-4 w-4" />
                            تكليف
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
                        {contract.availableActions.includes('INSTALL') && (
                          <Button
                            size="sm"
                            disabled={busyId === contract.id}
                            onClick={() => void action(contract, 'INSTALL')}
                          >
                            <ClipboardList className="ml-2 h-4 w-4" />
                            تم التركيب
                          </Button>
                        )}
                        {contract.availableActions.includes('ACTIVATE') && (
                          <Button
                            size="sm"
                            disabled={busyId === contract.id}
                            onClick={() => void action(contract, 'ACTIVATE')}
                          >
                            <Wrench className="ml-2 h-4 w-4" />
                            تأكيد التفعيل
                          </Button>
                        )}
                        {contract.availableActions.includes('RETURN_TO_MANAGER') && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === contract.id}
                            onClick={() => void action(contract, 'RETURN_TO_MANAGER')}
                          >
                            <XCircle className="ml-2 h-4 w-4" />
                            إعادة للدعم الفني
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
                                  {dateTime(item.created_at)}
                                </span>
                                {(item.from_status || item.to_status) && (
                                  <p className="mt-1 text-muted-foreground">
                                    من: {labels[item.from_status || ''] || item.from_status || '—'}{' '}
                                    · إلى: {labels[item.to_status || ''] || item.to_status || '—'}
                                  </p>
                                )}
                                <span className="text-muted-foreground">
                                  {item.performed_by_name_ar ||
                                    item.performed_by_name_en ||
                                    'النظام'}
                                </span>
                                {item.description && (
                                  <p className="mt-1 text-muted-foreground">{item.description}</p>
                                )}
                                {auditChanges(item.metadata).map((change: any, index: number) => (
                                  <p
                                    key={`${change.field || change.label}-${index}`}
                                    className="mt-1 text-xs text-muted-foreground"
                                  >
                                    {change.label}: قبل {text(change.before)} · بعد{' '}
                                    {text(change.after)}
                                  </p>
                                ))}
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
            </>
          )}
        </CardContent>
      </Card>
      <Dialog open={Boolean(auditDetails)} onOpenChange={(open) => !open && setAuditDetails(null)}>
        <DialogContent dir="rtl" className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل تعديل بيانات العميل</DialogTitle>
            <p className="text-sm font-normal text-muted-foreground">
              العقد #{auditDetails?.contract?.id} ·{' '}
              {auditDetails?.item?.performed_by_name_ar ||
                auditDetails?.item?.performed_by_name_en ||
                'النظام'}{' '}
              · {dateTime(auditDetails?.item?.created_at)}
            </p>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {(auditDetails?.changes || []).map((change: any, index: number) => (
              <div
                key={`${change.field || change.label}-${index}`}
                className="rounded-xl border bg-muted/20 p-4"
              >
                <p className="mb-3 font-semibold">{change.label}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border bg-background p-3">
                    <p className="text-xs text-muted-foreground">القيمة السابقة</p>
                    <p className="mt-1 break-words text-sm font-medium">{text(change.before)}</p>
                  </div>
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs text-muted-foreground">القيمة الجديدة</p>
                    <p className="mt-1 break-words text-sm font-medium">{text(change.after)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAuditDetails(null)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(assignment)}
        onOpenChange={(open) => {
          if (!open && busyId !== assignment?.contract?.id) setAssignment(null);
        }}
      >
        <DialogContent dir="rtl" className="max-w-xl">
          <DialogHeader>
            <DialogTitle>تعيين فني للعقد #{assignment?.contract?.id}</DialogTitle>
            <p className="text-sm font-normal text-muted-foreground">
              اختر المشرف أولاً، ثم اختر أحد الفنيين التابعين له.
            </p>
          </DialogHeader>
          <div className="grid gap-5 py-2">
            <div className="grid gap-2">
              <Label>المشرف الفني</Label>
              <SearchableSelect
                value={assignmentSupervisorId}
                onValueChange={(value: string) => {
                  setAssignmentSupervisorId(value);
                  setAssignmentTechnicianId('');
                  setAssignmentError('');
                }}
                options={(assignment?.supervisors || []).map((supervisor: any) => ({
                  value: supervisor.id,
                  label:
                    supervisor.name_ar ||
                    supervisor.name_en ||
                    supervisor.username ||
                    `مشرف #${supervisor.id}`,
                }))}
                placeholder="ابحث واختر المشرف الفني"
                searchPlaceholder="ابحث باسم المشرف..."
                error={Boolean(assignmentError && !assignmentSupervisorId)}
              />
            </div>
            <div className="grid gap-2">
              <Label>الفني المسؤول</Label>
              <SearchableSelect
                value={assignmentTechnicianId}
                onValueChange={(value: string) => {
                  setAssignmentTechnicianId(value);
                  setAssignmentError('');
                }}
                options={assignmentTechnicians.map((technician: any) => ({
                  value: technician.id,
                  label:
                    technician.name_ar ||
                    technician.name_en ||
                    technician.username ||
                    `فني #${technician.id}`,
                }))}
                placeholder={
                  assignmentSupervisorId ? 'ابحث واختر الفني المسؤول' : 'اختر المشرف الفني أولاً'
                }
                searchPlaceholder="ابحث باسم الفني..."
                disabled={!assignmentSupervisorId}
                error={Boolean(
                  assignmentError && assignmentSupervisorId && !assignmentTechnicianId,
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignment-note">ملاحظة التعيين (اختيارية)</Label>
              <Textarea
                id="assignment-note"
                value={assignmentNote}
                onChange={(event) => setAssignmentNote(event.target.value)}
                placeholder="أي ملاحظة للفني أو المشرف"
              />
            </div>
            {assignmentError && <p className="text-sm text-destructive">{assignmentError}</p>}
          </div>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setAssignment(null)}
              disabled={busyId === assignment?.contract?.id}
            >
              إلغاء
            </Button>
            <Button
              onClick={() => void submitAssignment()}
              disabled={busyId === assignment?.contract?.id}
            >
              {busyId === assignment?.contract?.id ? 'جارٍ الحفظ...' : 'تعيين الفني'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

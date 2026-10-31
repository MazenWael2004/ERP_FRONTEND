import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Check, ChevronsUpDown, Loader2, RefreshCw, X } from 'lucide-react';
import CardBox from 'src/components/shared/CardBox';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'src/components/ui/command';
import { Textarea } from 'src/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import { cn } from 'src/lib/utils';
import {
  approveServiceRequest,
  fetchPendingServiceRequests,
  rejectServiceRequest,
} from '../api/serviceRequestService';

type Item = {
  id: number;
  quantity: number | string;
  unitPrice: number | string;
  totalAmount: number | string;
  serviceNameAr: string;
  serviceNameEn: string;
  serviceType: string;
};
type Request = {
  id: number;
  requestedAt: string;
  notes: string;
  workflowStatus?: string;
  contractId: number;
  currentSubscriptionAmount?: number | string | null;
  zoneNameAr: string;
  zoneNameEn: string;
  customerCode: string;
  customerNameAr: string;
  customerNameEn: string;
  requesterNameAr: string;
  requesterNameEn: string;
  newSubscriptionAmount?: number | string | null;
  items: Item[];
};
type SearchOption = { value: string; label: string };
const errorMessage = (error: any) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  'تعذر إتمام العملية. حاول مرة أخرى.';
const formatDate = (value: string) =>
  value ? new Intl.DateTimeFormat('en-GB').format(new Date(value)) : '—';
const safeAmount = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};
const formatAmount = (value: unknown) => safeAmount(value).toLocaleString('ar-EG');
const workflowStatusLabel = (status?: string) =>
  ({ PENDING: 'قيد المراجعة', APPROVED: 'تم الاعتماد', REJECTED: 'مرفوض' })[
    String(status || '').toUpperCase()
  ] ||
  status ||
  '—';

function SearchableFilterSelect({
  value,
  onValueChange,
  options,
  placeholder,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchOption[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button type="button" variant="outline" role="combobox" aria-expanded={open} className={cn('relative h-10 w-full justify-start bg-background py-0 pl-10 pr-3 text-right font-normal', !selected && 'text-muted-foreground')}><span className="truncate">{selected?.label || placeholder}</span><ChevronsUpDown className="absolute left-3 h-4 w-4 text-muted-foreground" /></Button></PopoverTrigger><PopoverContent dir="rtl" align="start" className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="ابحث في الخيارات..." /><CommandList><CommandEmpty>لا توجد نتائج مطابقة</CommandEmpty><CommandGroup>{options.map((option) => <CommandItem key={option.value} value={`${option.label} ${option.value}`} onSelect={() => { onValueChange(option.value); setOpen(false); }}><Check className={cn('ml-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} /><span className="min-w-0 flex-1 truncate">{option.label}</span></CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>;
}

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
  const [contractSearch, setContractSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [itemTypeFilter, setItemTypeFilter] = useState<'ALL' | 'ADDITIONAL_SERVICE' | 'HARDWARE'>(
    'ALL',
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchPendingServiceRequests();
      setRequests(response.data || []);
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'تعذر تحميل الطلبات', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const zoneOptions = useMemo(
    () =>
      Array.from(
        new Map(
          requests.map((request) => [
            String(request.zoneNameAr || request.zoneNameEn || ''),
            request.zoneNameAr || request.zoneNameEn,
          ]),
        ).entries(),
      ),
    [requests],
  );
  const filteredRequests = useMemo(() => {
    const search = contractSearch.trim().toLocaleLowerCase();
    return requests.filter((request) => {
      const matchesSearch = !search || String(request.contractId || '').includes(search);
      const zoneName = String(request.zoneNameAr || request.zoneNameEn || '');
      const matchesZone = zoneFilter === 'ALL' || zoneName === zoneFilter;
      const matchesType =
        itemTypeFilter === 'ALL' ||
        request.items.some((item) => item.serviceType === itemTypeFilter);
      const requestDate = String(request.requestedAt || '').slice(0, 10);
      const matchesStart = !startDate || requestDate >= startDate;
      const matchesEnd = !endDate || requestDate <= endDate;
      return matchesSearch && matchesZone && matchesType && matchesStart && matchesEnd;
    });
  }, [contractSearch, endDate, itemTypeFilter, requests, startDate, zoneFilter]);
  const clearFilters = () => {
    setContractSearch('');
    setZoneFilter('ALL');
    setItemTypeFilter('ALL');
    setStartDate('');
    setEndDate('');
  };
  const openDecision = (request: Request, nextMode: 'approve' | 'reject') => {
    setSelected(request);
    setMode(nextMode);
    setManagerNotes('');
    setRejectionReason('');
  };
  const decide = async () => {
    if (!selected || !mode) return;
    if (mode === 'reject' && !rejectionReason.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'سبب الرفض مطلوب',
        text: 'اكتب سبب الرفض قبل الحفظ.',
      });
      return;
    }
    try {
      setSaving(true);
      if (mode === 'approve') await approveServiceRequest(selected.id, managerNotes.trim());
      else await rejectServiceRequest(selected.id, rejectionReason.trim(), managerNotes.trim());
      await Swal.fire({
        icon: 'success',
        title: mode === 'approve' ? 'تمت الموافقة وإصدار الفاتورة' : 'تم رفض الطلب',
        text:
          mode === 'approve'
            ? 'لم يتم إنشاء تحصيل؛ ستكون الفاتورة جاهزة للتحصيل لاحقًا.'
            : undefined,
      });
      setSelected(null);
      setMode(null);
      await load();
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'تعذر حفظ القرار', text: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <BreadcrumbComp
        title="اعتمادات الخدمات الإضافية"
        items={[{ title: 'CRM', to: '/' }, { title: 'اعتمادات الخدمات الإضافية' }]}
      />
      <CardBox>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">اعتمادات الخدمات الإضافية</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              الموافقة تُنشئ فاتورة فقط. التحصيل يتم لاحقًا من دورة التحصيل.
            </p>
          </div>
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="me-2 h-4 w-4" />
            تحديث
          </Button>
        </div>
        <div className="mb-5 grid gap-3 rounded-xl border bg-muted/20 p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_150px_150px_auto]">
          <div className="space-y-2">
            <Label htmlFor="contract-search">رقم العقد</Label>
            <Input
              id="contract-search"
              inputMode="numeric"
              value={contractSearch}
              onChange={(event) => setContractSearch(event.target.value)}
              placeholder="ابحث برقم العقد، مثال: 125"
            />
          </div>
          <div className="space-y-2">
            <Label>المنطقة</Label>
            <SearchableFilterSelect value={zoneFilter} onValueChange={setZoneFilter} placeholder="كل المناطق" options={[{ value: 'ALL', label: 'كل المناطق' }, ...zoneOptions.map(([value, label]) => ({ value, label }))]} />
          </div>
          <div className="space-y-2">
            <Label>نوع البند</Label>
            <SearchableFilterSelect value={itemTypeFilter} onValueChange={(value) => setItemTypeFilter(value as typeof itemTypeFilter)} placeholder="كل البنود" options={[{ value: 'ALL', label: 'كل البنود' }, { value: 'ADDITIONAL_SERVICE', label: 'خدمات إضافية' }, { value: 'HARDWARE', label: 'أجهزة' }]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="request-start-date">من تاريخ</Label>
            <Input
              id="request-start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="request-end-date">إلى تاريخ</Label>
            <Input
              id="request-end-date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <Button type="button" variant="outline" className="self-end" onClick={clearFilters}>
            مسح الفلاتر
          </Button>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          عرض {filteredRequests.length} من {requests.length} طلبات معلقة.
        </p>
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>رقم الطلب</TableHead>
                <TableHead>حالة سير العمل</TableHead>
                <TableHead>كود العميل</TableHead>
                <TableHead>اسم العميل</TableHead>
                <TableHead>رقم العقد</TableHead>
                <TableHead>المنطقة</TableHead>
                <TableHead>بنود الطلب</TableHead>
                <TableHead className="text-left">الإجمالي</TableHead>
                <TableHead className="text-left">الاشتراك الشهري الجديد</TableHead>
                <TableHead>مقدم الطلب</TableHead>
                <TableHead>الملاحظات</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead className="w-36" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} className="py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : !requests.length ? (
                <TableRow>
                  <TableCell colSpan={13} className="py-10 text-center text-muted-foreground">
                    لا توجد طلبات بانتظار المراجعة.
                  </TableCell>
                </TableRow>
              ) : !filteredRequests.length ? (
                <TableRow>
                  <TableCell colSpan={13} className="py-10 text-center text-muted-foreground">
                    لا توجد طلبات مطابقة للفلاتر المحددة.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => {
                  const total = request.items.reduce(
                    (sum, item) => sum + safeAmount(item.totalAmount),
                    0,
                  );
                  const newMonthlySubscription =
                    safeAmount(request.currentSubscriptionAmount) +
                    safeAmount(request.newSubscriptionAmount);
                  return (
                    <TableRow key={request.id} className="align-top">
                      <TableCell className="font-semibold">#{request.id}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {workflowStatusLabel(request.workflowStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{request.customerCode || '—'}</TableCell>
                      <TableCell>
                        <p className="min-w-36 font-medium">
                          {request.customerNameAr || request.customerNameEn || '—'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {request.customerNameEn || '—'}
                        </p>
                      </TableCell>
                      <TableCell>#{request.contractId}</TableCell>
                      <TableCell className="min-w-28">
                        {request.zoneNameAr || request.zoneNameEn || '—'}
                      </TableCell>
                      <TableCell className="min-w-52">
                        <div className="space-y-2">
                          {request.items.map((item) => (
                            <div key={item.id} className="text-sm">
                              <span>
                                {item.serviceNameAr || item.serviceNameEn} ×{' '}
                                {safeAmount(item.quantity)}
                              </span>
                              <Badge variant="secondary" className="ms-1">
                                {item.serviceType === 'HARDWARE' ? 'جهاز' : 'خدمة'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-left font-semibold">
                        {formatAmount(total)} ج.م
                      </TableCell>
                      <TableCell className="text-left font-semibold text-primary">
                        {formatAmount(newMonthlySubscription)} ج.م/شهر
                      </TableCell>
                      <TableCell>
                        {request.requesterNameAr || request.requesterNameEn || '—'}
                      </TableCell>
                      <TableCell className="max-w-52 whitespace-normal text-sm text-muted-foreground">
                        {request.notes || '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(request.requestedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {canWrite && (
                            <>
                              <Button size="sm" onClick={() => openDecision(request, 'approve')}>
                                <Check className="me-1 h-4 w-4" />
                                موافقة
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openDecision(request, 'reject')}
                              >
                                <X className="me-1 h-4 w-4" />
                                رفض
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardBox>
      <Dialog
        open={Boolean(selected && mode)}
        onOpenChange={(open) => {
          if (!open && !saving) {
            setSelected(null);
            setMode(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === 'approve' ? 'الموافقة على الطلب' : 'رفض الطلب'} #{selected?.id}
            </DialogTitle>
            <DialogDescription>
              {mode === 'approve'
                ? 'سيتم إنشاء فاتورة بالخدمات المعتمدة. لا يتم إنشاء تحصيل.'
                : 'سيظهر سبب الرفض ضمن سجل الطلب.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {mode === 'reject' && (
              <div className="space-y-2">
                <Label>سبب الرفض *</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  maxLength={1000}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>ملاحظات مدير العمليات</Label>
              <Textarea
                value={managerNotes}
                onChange={(event) => setManagerNotes(event.target.value)}
                maxLength={1000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelected(null);
                setMode(null);
              }}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button
              variant={mode === 'reject' ? 'destructive' : 'default'}
              onClick={() => void decide()}
              disabled={saving}
            >
              {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {mode === 'approve' ? 'اعتماد وإصدار فاتورة' : 'تأكيد الرفض'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

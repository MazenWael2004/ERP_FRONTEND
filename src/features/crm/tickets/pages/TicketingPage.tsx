import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  ClipboardPlus,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Ticket,
  Wrench,
} from 'lucide-react';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';
import { api } from 'src/shared/api/axios';
import {
  createTicket,
  getTickets,
  updateTicket,
  type CreateTicketPayload,
  type CustomerTicket,
  type TicketPriority,
  type TicketStatus,
} from '../api/ticketService';
import { validateTicket } from '../validation';

type ScopedContract = {
  id: number;
  customer_name_ar?: string | null;
  customer_name_en?: string | null;
  customer_code?: string | null;
};

const statuses: Array<{ value: TicketStatus; label: string }> = [
  { value: 'OPEN', label: 'مفتوحة' },
  { value: 'IN_PROGRESS', label: 'قيد المعالجة' },
  { value: 'RESOLVED', label: 'تم الحل' },
  { value: 'CLOSED', label: 'مغلقة' },
];

const priorities: Array<{ value: TicketPriority; label: string }> = [
  { value: 'LOW', label: 'منخفضة' },
  { value: 'MEDIUM', label: 'متوسطة' },
  { value: 'HIGH', label: 'مرتفعة' },
  { value: 'URGENT', label: 'عاجلة' },
];

const categories = [
  { value: 'TECHNICAL', label: 'دعم فني' },
  { value: 'BILLING', label: 'الفواتير والتحصيل' },
  { value: 'INSTALLATION', label: 'تركيب وتشغيل' },
  { value: 'GENERAL', label: 'استفسار عام' },
  { value: 'OTHER', label: 'أخرى' },
];

const statusLabel = (status: TicketStatus) =>
  statuses.find((item) => item.value === status)?.label || status;
const priorityLabel = (priority: TicketPriority) =>
  priorities.find((item) => item.value === priority)?.label || priority;
const categoryLabel = (category: string) =>
  categories.find((item) => item.value === category)?.label || category;
const customerName = (item: {
  customer_name_ar?: string | null;
  customer_name_en?: string | null;
}) => item.customer_name_ar || item.customer_name_en || '—';
const date = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value),
      )
    : '—';

const emptyDraft: CreateTicketPayload = {
  contractId: 0,
  subject: '',
  description: '',
  category: 'TECHNICAL',
  priority: 'MEDIUM',
};

export default function TicketingPage() {
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [contracts, setContracts] = useState<ScopedContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsTicket, setDetailsTicket] = useState<CustomerTicket | null>(null);
  const [draft, setDraft] = useState<CreateTicketPayload>(emptyDraft);
  const [resolutionNote, setResolutionNote] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    setError('');
    try {
      setTickets(
        await getTickets({ status: statusFilter || undefined, search: search.trim() || undefined }),
      );
    } catch {
      setError('تعذر تحميل التذاكر. تحقق من الاتصال ثم أعد المحاولة.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, [statusFilter]);

  const openCreate = async () => {
    setCreateOpen(true);
    setError('');
    if (contracts.length) return;

    try {
      const response = await api.get<{ data?: ScopedContract[] }>('/tickets/contracts');
      setContracts(response.data.data ?? []);
    } catch {
      setError('تعذر تحميل عقود العملاء المتاحة لإنشاء تذكرة.');
    }
  };

  const submitTicket = async () => {
    const validationError = validateTicket(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await createTicket({
        ...draft,
        subject: draft.subject.trim(),
        description: draft.description.trim(),
      });
      setDraft(emptyDraft);
      setCreateOpen(false);
      await loadTickets();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error?.message || 'تعذر إنشاء التذكرة.');
    } finally {
      setSaving(false);
    }
  };

  const saveTicketChanges = async () => {
    if (!detailsTicket) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateTicket(detailsTicket.id, {
        status: detailsTicket.status,
        priority: detailsTicket.priority,
        resolutionNote: resolutionNote.trim(),
      });
      setDetailsTicket(updated);
      setResolutionNote(updated.resolution_note || '');
      await loadTickets();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error?.message || 'تعذر حفظ تحديث التذكرة.');
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(
    () => ({
      open: tickets.filter((item) => item.status === 'OPEN').length,
      inProgress: tickets.filter((item) => item.status === 'IN_PROGRESS').length,
      resolved: tickets.filter((item) => item.status === 'RESOLVED' || item.status === 'CLOSED')
        .length,
    }),
    [tickets],
  );

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">تذاكر دعم العملاء</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            سجّل مشكلة العميل وتابع مراحل الحل من مكان واحد.
          </p>
        </div>
        <Button onClick={() => void openCreate()}>
          <Plus className="ml-2 h-4 w-4" />
          تذكرة جديدة
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric
          label="تذاكر مفتوحة"
          value={stats.open}
          icon={<AlertCircle className="text-amber-600" />}
        />
        <Metric
          label="قيد المعالجة"
          value={stats.inProgress}
          icon={<Wrench className="text-blue-600" />}
        />
        <Metric
          label="تم حلها أو إغلاقها"
          value={stats.resolved}
          icon={<CheckCircle2 className="text-emerald-600" />}
        />
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <label className="grid min-w-56 gap-1 text-sm">
            <span>بحث</span>
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pr-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="رقم التذكرة أو العميل أو المشكلة"
                onKeyDown={(event) => event.key === 'Enter' && void loadTickets()}
              />
            </div>
          </label>
          <label className="grid gap-1 text-sm">
            <span>الحالة</span>
            <select
              className="h-9 min-w-44 rounded-md border border-input bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">كل الحالات</option>
              {statuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <Button variant="outline" onClick={() => void loadTickets()} disabled={loading}>
            <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            سجل التذاكر
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-right text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3">التذكرة</th>
                <th className="px-4 py-3">العميل</th>
                <th className="px-4 py-3">المشكلة</th>
                <th className="px-4 py-3">التصنيف</th>
                <th className="px-4 py-3">الأولوية</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">تاريخ الإنشاء</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : tickets.length ? (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t">
                    <td className="px-4 py-3 font-medium" dir="ltr">
                      {ticket.ticket_number}
                    </td>
                    <td className="px-4 py-3">
                      {customerName(ticket)}
                      <span className="block text-xs text-muted-foreground" dir="ltr">
                        {ticket.customer_code || `#${ticket.contract_id}`}
                      </span>
                    </td>
                    <td className="max-w-72 truncate px-4 py-3">{ticket.subject}</td>
                    <td className="px-4 py-3">{categoryLabel(ticket.category)}</td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3" dir="ltr">
                      {date(ticket.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDetailsTicket(ticket);
                          setResolutionNote(ticket.resolution_note || '');
                        }}
                      >
                        <Eye className="ml-2 h-4 w-4" />
                        متابعة
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-muted-foreground">
                    لا توجد تذاكر مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent dir="rtl" className="max-h-[92vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardPlus className="h-5 w-5" />
              إنشاء تذكرة دعم
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <Field label="عقد العميل">
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={draft.contractId || ''}
                onChange={(event) => setDraft({ ...draft, contractId: Number(event.target.value) })}
              >
                <option value="">اختر العميل والعقد</option>
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {customerName(contract)} — #{contract.id}
                    {contract.customer_code ? ` (${contract.customer_code})` : ''}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="عنوان المشكلة">
              <Input
                value={draft.subject}
                onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
                placeholder="مثال: توقف الخدمة في الفرع"
                maxLength={200}
              />
            </Field>
            <Field label="تفاصيل المشكلة">
              <Textarea
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                placeholder="اشرح المشكلة التي أبلغ عنها العميل والخطوات أو الملاحظات المهمة."
                className="min-h-32"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="التصنيف">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={draft.category}
                  onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                >
                  {categories.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="الأولوية">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={draft.priority}
                  onChange={(event) =>
                    setDraft({ ...draft, priority: event.target.value as TicketPriority })
                  }
                >
                  {priorities.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => void submitTicket()} disabled={saving}>
              {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}إنشاء التذكرة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailsTicket} onOpenChange={(open) => !open && setDetailsTicket(null)}>
        <DialogContent dir="rtl" className="max-h-[92vh] max-w-2xl overflow-y-auto">
          {detailsTicket && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {detailsTicket.ticket_number} — {detailsTicket.subject}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">العميل</p>
                  <p className="font-medium">
                    {customerName(detailsTicket)}{' '}
                    <span dir="ltr">#{detailsTicket.contract_id}</span>
                  </p>
                </div>
                <Field label="وصف المشكلة">
                  <p className="whitespace-pre-wrap rounded-md border bg-muted/20 p-3 text-sm">
                    {detailsTicket.description}
                  </p>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="الحالة">
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={detailsTicket.status}
                      onChange={(event) =>
                        setDetailsTicket({
                          ...detailsTicket,
                          status: event.target.value as TicketStatus,
                        })
                      }
                    >
                      {statuses.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="الأولوية">
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={detailsTicket.priority}
                      onChange={(event) =>
                        setDetailsTicket({
                          ...detailsTicket,
                          priority: event.target.value as TicketPriority,
                        })
                      }
                    >
                      {priorities.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="إجراء الحل أو الملاحظات">
                  <Textarea
                    value={resolutionNote}
                    onChange={(event) => setResolutionNote(event.target.value)}
                    placeholder="أضف ما تم اتخاذه لحل المشكلة."
                    className="min-h-28"
                  />
                </Field>
              </div>
              <DialogFooter className="gap-2 sm:justify-start">
                <Button variant="outline" onClick={() => setDetailsTicket(null)}>
                  إغلاق
                </Button>
                <Button onClick={() => void saveTicketChanges()} disabled={saving}>
                  {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}حفظ التحديث
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p dir="ltr" className="mt-1 text-right text-2xl font-bold">
            {value.toLocaleString('en-US')}
          </p>
        </div>
        {icon}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const className =
    status === 'OPEN'
      ? 'bg-amber-100 text-amber-800'
      : status === 'IN_PROGRESS'
        ? 'bg-blue-100 text-blue-800'
        : status === 'RESOLVED'
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-slate-100 text-slate-800';
  return (
    <Badge className={className}>
      <CircleDot className="ml-1 h-3 w-3" />
      {statusLabel(status)}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const className =
    priority === 'URGENT'
      ? 'bg-red-100 text-red-800'
      : priority === 'HIGH'
        ? 'bg-orange-100 text-orange-800'
        : priority === 'MEDIUM'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-slate-100 text-slate-800';
  return <Badge className={className}>{priorityLabel(priority)}</Badge>;
}

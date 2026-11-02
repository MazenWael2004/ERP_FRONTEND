import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
  CalendarDays,
  Check,
  ChevronsUpDown,
  Loader2,
  MapPin,
  Package,
  Plus,
  Search,
  Trash2,
  UserRound,
  Wrench,
} from 'lucide-react';
import CardBox from 'src/components/shared/CardBox';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';
import { Badge } from 'src/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs';
import { cn } from 'src/lib/utils';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import {
  createServiceRequest,
  fetchContractById,
  fetchRequestCatalog,
} from '../api/serviceRequestService';

type Contract = {
  id: number;
  customerCode: string;
  customerNameAr: string;
  customerNameEn: string;
  subscriptionPrice?: number;
  subscription_price?: number | string;
  zoneId: number;
  zoneNameAr?: string;
  zoneNameEn?: string;
  contractDate?: string;
  workflowStatus?: string;
};
type CatalogItem = {
  id: number;
  type: 'ADDITIONAL_SERVICE' | 'HARDWARE';
  code: string;
  nameEn: string;
  nameAr: string;
  joining_fee: number;
  joiningFee?: number;
  subscriptionFee?: number;
  subscription_fee?: number;
  isQuantityBased: boolean;
};
type SelectedItem = CatalogItem & { quantity: number };
type CatalogTab = 'services' | 'hardware';
type SearchOption = { value: string; label: string };
const errorMessage = (error: any) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  'تعذر إتمام العملية. حاول مرة أخرى.';
const workflowStatusLabels: Record<string, string> = {
  UNDER_CHECKING: 'تحت المراجعة',
  PENDING: 'قيد الانتظار',
  UNDER_INSTALLATION: 'قيد التنفيذ',
  INSTALLED: 'تم التركيب',
  ACTIVATED: 'مفعل',
  REJECTED: 'مرفوض',
};
const workflowStatusLabel = (status?: string) =>
  workflowStatusLabels[status || ''] || status || '—';

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
  emptyMessage = 'لا توجد نتائج مطابقة',
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchOption[];
  placeholder: string;
  disabled?: boolean;
  emptyMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'relative h-11 w-full justify-start rounded-xl bg-background py-0 pl-10 pr-3 text-right font-normal hover:bg-background',
            !selected && 'text-muted-foreground',
          )}
        >
          <span className="truncate">{selected?.label || placeholder}</span>
          <ChevronsUpDown className="absolute left-3 h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent dir="rtl" align="start" className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="ابحث في القائمة..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'ml-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0',
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

export default function AdditionalServiceRequestPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('/add-new-request', 'CREATE');
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [contractId, setContractId] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [activeCatalogTab, setActiveCatalogTab] = useState<CatalogTab>('services');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingContract, setLoadingContract] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const catalogResponse = await fetchRequestCatalog();
        setCatalog(catalogResponse.data || []);
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'تعذر تحميل بيانات الطلب',
          text: errorMessage(error),
        });
      } finally {
        setLoadingCatalog(false);
      }
    };
    void load();
  }, []);

  const availableCatalog = useMemo(
    () => catalog.filter((service) => !items.some((item) => item.id === service.id)),
    [catalog, items],
  );
  const serviceCatalog = useMemo(
    () => availableCatalog.filter((service) => service.type === 'ADDITIONAL_SERVICE'),
    [availableCatalog],
  );
  const hardwareCatalog = useMemo(
    () => availableCatalog.filter((service) => service.type === 'HARDWARE'),
    [availableCatalog],
  );
  const activeCatalog = activeCatalogTab === 'services' ? serviceCatalog : hardwareCatalog;
  const catalogOptions = useMemo<SearchOption[]>(
    () =>
      activeCatalog.map((service) => ({
        value: String(service.id),
        label: `${service.nameAr || service.nameEn} — ${Number(service.joiningFee ?? service.joining_fee ?? 0).toLocaleString('ar-EG')} ج.م${Number(service.subscriptionFee ?? service.subscription_fee ?? 0) ? ` · +${Number(service.subscriptionFee ?? service.subscription_fee ?? 0).toLocaleString('ar-EG')} ج.م/شهر` : ''}`,
      })),
    [activeCatalog],
  );
  const total = items.reduce(
    (sum, item) => sum + Number(item.joiningFee ?? item.joining_fee ?? 0) * item.quantity,
    0,
  );
  const addedMonthlySubscription = items.reduce(
    (sum, item) => sum + Number(item.subscriptionFee ?? item.subscription_fee ?? 0) * item.quantity,
    0,
  );
  const currentMonthlySubscription = Number(selectedContract?.subscriptionPrice ?? 0);
  const totalMonthlySubscription = currentMonthlySubscription + addedMonthlySubscription;
  const serviceItems = items.filter((item) => item.type === 'ADDITIONAL_SERVICE');
  const hardwareItems = items.filter((item) => item.type === 'HARDWARE');
  const addItem = () => {
    const item = activeCatalog.find((service) => Number(service.id) === Number(selectedServiceId));
    if (item) {
      setItems((current) => [...current, { ...item, quantity: 1 }]);
      setSelectedServiceId('');
    }
  };
  const updateQuantity = (id: number, quantity: number) =>
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, Math.floor(quantity || 1)) } : item,
      ),
    );
  const searchContract = async () => {
    const id = Number(contractId);
    if (!Number.isInteger(id) || id < 1) {
      await Swal.fire({
        icon: 'warning',
        title: 'رقم عقد غير صالح',
        text: 'اكتب رقم العقد الصحيح ثم اضغط بحث.',
      });
      return;
    }
    try {
      setLoadingContract(true);
      const response = await fetchContractById(id);
      const contract = response.data as Contract;
      setSelectedContract({
        ...contract,
        subscriptionPrice:
          Number(contract.subscriptionPrice ?? contract.subscription_price ?? 0) || 0,
      });
    } catch (error) {
      setSelectedContract(null);
      await Swal.fire({ icon: 'error', title: 'تعذر العثور على العقد', text: errorMessage(error) });
    } finally {
      setLoadingContract(false);
    }
  };
  const submit = async () => {
    if (!selectedContract || selectedContract.id !== Number(contractId) || !items.length) {
      await Swal.fire({
        icon: 'warning',
        title: 'بيانات ناقصة',
        text: 'ابحث عن العقد أولًا وأضف خدمة واحدة على الأقل.',
      });
      return;
    }
    try {
      setSaving(true);
      await createServiceRequest({
        zoneId: Number(selectedContract.zoneId),
        contractId: selectedContract.id,
        notes: notes.trim(),
        items: items.map((item) => ({ serviceId: item.id, quantity: item.quantity })),
      });
      await Swal.fire({
        icon: 'success',
        title: 'تم إرسال الطلب',
        text: 'تم إرسال طلب الخدمات الإضافية إلى مدير العمليات للمراجعة.',
      });
      setContractId('');
      setSelectedContract(null);
      setItems([]);
      setNotes('');
      setSelectedServiceId('');
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'تعذر إرسال الطلب', text: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const renderItems = (rows: SelectedItem[], emptyMessage: string) => (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الصنف</TableHead>
            <TableHead className="text-center">الكمية</TableHead>
            <TableHead className="text-left">إجمالي السعر</TableHead>
            <TableHead className="text-left">زيادة الاشتراك الشهري</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((item) => {
              const unitPrice = Number(item.joiningFee ?? item.joining_fee ?? 0);
              const subscriptionPrice = Number(item.subscriptionFee ?? item.subscription_fee ?? 0);
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.nameAr || item.nameEn}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.nameEn}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.isQuantityBased ? (
                      <Input
                        className="mx-auto h-9 w-20 text-center"
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                      />
                    ) : (
                      '1'
                    )}
                  </TableCell>
                  <TableCell className="text-left font-medium">
                    {(unitPrice * item.quantity).toLocaleString('ar-EG')} ج.م
                  </TableCell>
                  <TableCell className="text-left font-medium">
                    {subscriptionPrice
                      ? `+${(subscriptionPrice * item.quantity).toLocaleString('ar-EG')} ج.م/شهر`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setItems((current) => current.filter((selected) => selected.id !== item.id))
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      <BreadcrumbComp
        title="طلب خدمات إضافية"
        items={[{ title: 'CRM', to: '/' }, { title: 'طلب خدمات إضافية' }]}
      />
      <CardBox>
        <div className="mb-8 border-b pb-5">
          <h2 className="text-xl font-semibold">طلب خدمات أو أجهزة</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ابحث برقم العقد، راجع بيانات العميل، ثم أضف الخدمات أو الأجهزة المطلوبة. يُرسل الطلب
            للاعتماد ولا ينشئ تحصيلًا الآن.
          </p>
        </div>
        {!canCreate ? (
          <p className="text-destructive">ليس لديك صلاحية إنشاء طلبات خدمات إضافية.</p>
        ) : (
          <div className="space-y-7">
            <div className="rounded-2xl border bg-muted/20 p-5">
              <div className="max-w-2xl space-y-2">
                <Label htmlFor="request-contract-id">كود العميل*</Label>
                <div className="flex gap-3">
                  <Input
                    id="request-contract-id"
                    inputMode="numeric"
                    dir="ltr"
                    value={contractId}
                    onChange={(event) => {
                      setContractId(event.target.value.replace(/\D/g, ''));
                      setSelectedContract(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void searchContract();
                      }
                    }}
                    placeholder="مثال: 123"
                    className="h-11 rounded-xl text-right"
                  />
                  <Button
                    type="button"
                    className="h-11 shrink-0 rounded-xl px-5"
                    onClick={() => void searchContract()}
                    disabled={loadingContract || loadingCatalog}
                  >
                    {loadingContract ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="me-2 h-4 w-4" />
                    )}
                    بحث
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  اكتب رقم العقد فقط لعرض بيانات العميل والعقد.
                </p>
              </div>
              {selectedContract && (
                <div className="mt-5 overflow-hidden rounded-xl border bg-card shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-primary/5 px-4 py-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <UserRound className="h-4 w-4 text-primary" />
                      ملخص العميل والعقد
                    </div>
                    <Badge variant="secondary">العقد #{selectedContract.id}</Badge>
                  </div>
                  <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
                    <div className="bg-card p-4">
                      <p className="text-xs text-muted-foreground">اسم العميل</p>
                      <p className="mt-1 font-semibold">
                        {selectedContract.customerNameAr || selectedContract.customerNameEn || '—'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        كود العميل: {selectedContract.customerCode || '—'}
                      </p>
                    </div>
                    <div className="bg-card p-4">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        المنطقة
                      </p>
                      <p className="mt-1 font-semibold">
                        {selectedContract.zoneNameAr || selectedContract.zoneNameEn || '—'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        الحالة: {workflowStatusLabel(selectedContract.workflowStatus)}
                      </p>
                    </div>
                    <div className="bg-card p-4">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        تاريخ العقد
                      </p>
                      <p className="mt-1 font-semibold">
                        {selectedContract.contractDate
                          ? new Intl.DateTimeFormat('ar-EG').format(
                              new Date(selectedContract.contractDate),
                            )
                          : '—'}
                      </p>
                    </div>
                    <div className="bg-card p-4">
                      <p className="text-xs text-muted-foreground">الاشتراك الشهري الحالي</p>
                      <p className="mt-1 font-semibold">
                        {currentMonthlySubscription.toLocaleString('ar-EG')} ج.م/شهر
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-5">
                <h3 className="font-semibold">إضافة بنود الطلب</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  اختر نوع البند أولًا ثم ابحث عنه بالاسم أو السعر.
                  {!selectedContract && ' ابحث عن العقد أولًا للمتابعة.'}
                </p>
              </div>
              <Tabs
                value={activeCatalogTab}
                onValueChange={(value) => {
                  setActiveCatalogTab(value as CatalogTab);
                  setSelectedServiceId('');
                }}
              >
                <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-muted p-1 sm:w-[420px]">
                  <TabsTrigger value="services" className="gap-2 rounded-lg py-2.5">
                    <Package className="h-4 w-4" />
                    الخدمات الإضافية <Badge variant="secondary">{serviceItems.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="hardware" className="gap-2 rounded-lg py-2.5">
                    <Wrench className="h-4 w-4" />
                    الأجهزة <Badge variant="secondary">{hardwareItems.length}</Badge>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="services" className="mt-5">
                  <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <div className="space-y-2">
                      <Label>الخدمة الإضافية</Label>
                      <SearchableSelect
                        value={selectedServiceId}
                        onValueChange={setSelectedServiceId}
                        options={catalogOptions}
                        placeholder={
                          selectedContract
                            ? 'ابحث عن وحدة إضافية أو خدمة نسخ'
                            : 'ابحث عن العقد أولًا'
                        }
                        emptyMessage="لا توجد خدمات إضافية متاحة"
                        disabled={!selectedContract}
                      />
                    </div>
                    <Button
                      type="button"
                      className="h-11 rounded-xl"
                      onClick={addItem}
                      disabled={!selectedContract || !selectedServiceId}
                    >
                      <Plus className="me-2 h-4 w-4" />
                      إضافة
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="hardware" className="mt-5">
                  <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <div className="space-y-2">
                      <Label>الجهاز</Label>
                      <SearchableSelect
                        value={selectedServiceId}
                        onValueChange={setSelectedServiceId}
                        options={catalogOptions}
                        placeholder={selectedContract ? 'ابحث عن جهاز' : 'ابحث عن العقد أولًا'}
                        emptyMessage="لا توجد أجهزة متاحة"
                        disabled={!selectedContract}
                      />
                    </div>
                    <Button
                      type="button"
                      className="h-11 rounded-xl"
                      onClick={addItem}
                      disabled={!selectedContract || !selectedServiceId}
                    >
                      <Plus className="me-2 h-4 w-4" />
                      إضافة
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <div className="space-y-5">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">الخدمات الإضافية المختارة</h3>
                </div>
                {renderItems(serviceItems, 'لم تتم إضافة خدمات إضافية.')}
              </div>
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">الأجهزة المختارة</h3>
                </div>
                {renderItems(hardwareItems, 'لم تتم إضافة أجهزة.')}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border bg-muted/40 p-4">
                  <p className="text-sm text-muted-foreground">إجمالي السعر المبدئي</p>
                  <p className="mt-1 text-2xl font-bold">{total.toLocaleString('ar-EG')} ج.م</p>
                </div>
                <div className="rounded-2xl border bg-muted/40 p-4">
                  <p className="text-sm text-muted-foreground">الاشتراك الشهري الحالي</p>
                  <p className="mt-1 text-2xl font-bold">
                    {currentMonthlySubscription.toLocaleString('ar-EG')} ج.م/شهر
                  </p>
                </div>
                <div className="rounded-2xl border bg-muted/40 p-4">
                  <p className="text-sm text-muted-foreground">زيادة الاشتراك الشهري</p>
                  <p className="mt-1 text-2xl font-bold">
                    +{addedMonthlySubscription.toLocaleString('ar-EG')} ج.م/شهر
                  </p>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm text-muted-foreground">إجمالي الاشتراك الشهري الجديد</p>
                  <p className="mt-1 text-2xl font-bold">
                    {totalMonthlySubscription.toLocaleString('ar-EG')} ج.م/شهر
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>ملاحظات إضافية</Label>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={1000}
                placeholder="أي تفاصيل يحتاجها مدير العمليات..."
              />
              <p className="text-left text-xs text-muted-foreground">{notes.length}/1000</p>
            </div>
            <div className="flex justify-end border-t pt-5">
              <Button type="button" className="min-w-40" onClick={submit} disabled={saving}>
                {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}إرسال للمراجعة
              </Button>
            </div>
          </div>
        )}
      </CardBox>
    </div>
  );
}

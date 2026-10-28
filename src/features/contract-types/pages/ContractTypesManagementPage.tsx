import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FileText, Pencil, Plus, Power, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Checkbox } from 'src/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import {
  createContractType,
  fetchManagedContractTypes,
  setContractTypeStatus,
  updateContractType,
  type ContractTypePayload,
} from '../api/contractTypeService';

type ContractType = ContractTypePayload & {
  id: number;
  is_active: boolean;
  name_en?: string;
  name_ar?: string;
  max_months?: number;
  subscription_discount_percentage?: number;
  joining_fee_discount_percentage?: number;
  requires_selected_months?: boolean;
  auto_select_consecutive?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string | null;
};

type ContractTypeFormValues = {
  code: string;
  nameEn: string;
  nameAr: string;
  maxMonths: number;
  subscriptionDiscountPercentage: number;
  joiningFeeDiscountPercentage: number;
  requiresSelectedMonths: boolean;
  autoSelectConsecutive: boolean;
  displayOrder: number;
};

const emptyValues: ContractTypeFormValues = {
  code: '',
  nameEn: '',
  nameAr: '',
  maxMonths: 12,
  subscriptionDiscountPercentage: 0,
  joiningFeeDiscountPercentage: 0,
  requiresSelectedMonths: false,
  autoSelectConsecutive: false,
  displayOrder: 0,
};

const errorMessage = (error: any) => (
  error?.response?.data?.error?.message || error?.response?.data?.message || 'حاول مرة أخرى.'
);

export default function ContractTypesManagementPage() {
  const { i18n } = useTranslation();
  const { hasPermission } = useAuth();
  const isArabic = i18n.language.startsWith('ar');
  const canCreate = hasPermission('/contract-types', 'CREATE');
  const canEdit = hasPermission('/contract-types', 'WRITE');

  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContractType, setEditingContractType] = useState<ContractType | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContractTypeFormValues>({ defaultValues: emptyValues });
  const requiresSelectedMonths = watch('requiresSelectedMonths');
  const autoSelectConsecutive = watch('autoSelectConsecutive');

  const loadContractTypes = async () => {
    try {
      setIsLoading(true);
      const response = await fetchManagedContractTypes();
      setContractTypes(response.data || []);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: 'error',
        title: 'تعذر تحميل أنواع العقود',
        text: 'تحقق من الاتصال ثم أعد المحاولة.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadContractTypes();
  }, []);

  const filteredContractTypes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return contractTypes.filter((contractType) => {
      const matchesSearch = !normalizedSearch || [
        contractType.code,
        contractType.name_en || contractType.nameEn,
        contractType.name_ar || contractType.nameAr,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
      const matchesStatus = status === 'all' ||
        (status === 'active' ? contractType.is_active : !contractType.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [contractTypes, search, status]);

  const openCreate = () => {
    setEditingContractType(null);
    reset({ ...emptyValues, displayOrder: contractTypes.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (contractType: ContractType) => {
    setEditingContractType(contractType);
    reset({
      code: contractType.code,
      nameEn: contractType.name_en || contractType.nameEn,
      nameAr: contractType.name_ar || contractType.nameAr,
      maxMonths: Number(contractType.max_months ?? contractType.maxMonths),
      subscriptionDiscountPercentage: Number(
        contractType.subscription_discount_percentage ?? contractType.subscriptionDiscountPercentage,
      ),
      joiningFeeDiscountPercentage: Number(
        contractType.joining_fee_discount_percentage ?? contractType.joiningFeeDiscountPercentage,
      ),
      requiresSelectedMonths: Boolean(
        contractType.requires_selected_months ?? contractType.requiresSelectedMonths,
      ),
      autoSelectConsecutive: Boolean(
        contractType.auto_select_consecutive ?? contractType.autoSelectConsecutive,
      ),
      displayOrder: Number(contractType.display_order ?? contractType.displayOrder),
    });
    setDialogOpen(true);
  };

  const saveContractType = async (values: ContractTypeFormValues) => {
    const payload: ContractTypePayload = {
      code: values.code.trim().toUpperCase(),
      nameEn: values.nameEn.trim(),
      nameAr: values.nameAr.trim(),
      maxMonths: Number(values.maxMonths),
      subscriptionDiscountPercentage: Number(values.subscriptionDiscountPercentage),
      joiningFeeDiscountPercentage: Number(values.joiningFeeDiscountPercentage),
      requiresSelectedMonths: Boolean(values.requiresSelectedMonths),
      autoSelectConsecutive: Boolean(values.requiresSelectedMonths && values.autoSelectConsecutive),
      displayOrder: Number(values.displayOrder),
    };

    if (!/^[A-Z][A-Z0-9_]{1,49}$/.test(payload.code)) {
      await Swal.fire({
        icon: 'warning',
        title: 'كود غير صالح',
        text: 'ابدأ بحرف إنجليزي واستخدم أحرفًا كبيرة أو أرقامًا أو شرطة سفلية فقط.',
      });
      return;
    }
    if (!payload.nameEn || !payload.nameAr) {
      await Swal.fire({ icon: 'warning', title: 'بيانات ناقصة', text: 'أدخل الاسم بالعربية والإنجليزية.' });
      return;
    }
    if (!Number.isInteger(payload.maxMonths) || payload.maxMonths < 1 || payload.maxMonths > 120) {
      await Swal.fire({ icon: 'warning', title: 'عدد الأشهر غير صالح', text: 'أدخل عددًا صحيحًا من 1 إلى 120.' });
      return;
    }
    if (
      !Number.isFinite(payload.subscriptionDiscountPercentage) ||
      !Number.isFinite(payload.joiningFeeDiscountPercentage) ||
      payload.subscriptionDiscountPercentage < 0 || payload.subscriptionDiscountPercentage > 100 ||
      payload.joiningFeeDiscountPercentage < 0 || payload.joiningFeeDiscountPercentage > 100
    ) {
      await Swal.fire({ icon: 'warning', title: 'نسبة الخصم غير صالحة', text: 'يجب أن تكون نسبة الخصم من 0 إلى 100.' });
      return;
    }
    if (!Number.isInteger(payload.displayOrder) || payload.displayOrder < 0 || payload.displayOrder > 9999) {
      await Swal.fire({ icon: 'warning', title: 'ترتيب العرض غير صالح', text: 'أدخل رقمًا صحيحًا من 0 إلى 9999.' });
      return;
    }

    try {
      setIsSaving(true);
      if (editingContractType) {
        await updateContractType(editingContractType.id, payload);
      } else {
        await createContractType(payload);
      }
      setDialogOpen(false);
      await Swal.fire({
        icon: 'success',
        title: editingContractType ? 'تم تحديث نوع العقد' : 'تم إنشاء نوع العقد',
      });
      await loadContractTypes();
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'تعذر حفظ نوع العقد', text: errorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const changeStatus = async (contractType: ContractType) => {
    const nextStatus = !contractType.is_active;
    const result = await Swal.fire({
      icon: 'warning',
      title: nextStatus ? 'تفعيل نوع العقد؟' : 'تعطيل نوع العقد؟',
      text: nextStatus
        ? 'سيظهر هذا النوع مجددًا عند إنشاء عقد جديد.'
        : 'لن يظهر هذا النوع عند إنشاء عقود جديدة، بينما تبقى العقود القديمة محفوظة.',
      showCancelButton: true,
      confirmButtonText: nextStatus ? 'تفعيل' : 'تعطيل',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: nextStatus ? '#16a34a' : '#dc2626',
    });
    if (!result.isConfirmed) return;

    try {
      await setContractTypeStatus(contractType.id, nextStatus);
      await loadContractTypes();
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'تعذر تغيير الحالة', text: errorMessage(error) });
    }
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="space-y-6 p-4 md:p-6">
      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">إدارة أنواع العقود</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              إعداد العروض وقواعد الخصم والاشتراك التي تظهر عند إنشاء العقد.
            </p>
          </div>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="ms-2 h-4 w-4" />
            إضافة نوع عقد
          </Button>
        )}
      </section>

      <section className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالكود أو الاسم..." className="ps-10" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="active">مفعّل</SelectItem>
            <SelectItem value="inactive">معطّل</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={() => { setSearch(''); setStatus('all'); }}>
          <X className="ms-2 h-4 w-4" />
          مسح
        </Button>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الكود</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>المدة القصوى</TableHead>
                <TableHead>خصم الاشتراك</TableHead>
                <TableHead>خصم الانضمام</TableHead>
                <TableHead>اختيار الأشهر</TableHead>
                <TableHead>الترتيب</TableHead>
                <TableHead>الحالة</TableHead>
                {canEdit && <TableHead className="text-end">الإجراءات</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={canEdit ? 9 : 8} className="py-12 text-center text-muted-foreground">جارٍ تحميل أنواع العقود...</TableCell></TableRow>
              ) : filteredContractTypes.length === 0 ? (
                <TableRow><TableCell colSpan={canEdit ? 9 : 8} className="py-12 text-center text-muted-foreground">لا توجد نتائج.</TableCell></TableRow>
              ) : filteredContractTypes.map((contractType) => (
                <TableRow key={contractType.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium" dir="ltr">{contractType.code}</TableCell>
                  <TableCell>
                    {isArabic ? contractType.name_ar || contractType.nameAr : contractType.name_en || contractType.nameEn}
                    <div className="mt-1 text-xs text-muted-foreground">
                      {isArabic ? contractType.name_en || contractType.nameEn : contractType.name_ar || contractType.nameAr}
                    </div>
                  </TableCell>
                  <TableCell>{contractType.max_months ?? contractType.maxMonths} شهر</TableCell>
                  <TableCell>{Number(contractType.subscription_discount_percentage ?? contractType.subscriptionDiscountPercentage)}%</TableCell>
                  <TableCell>{Number(contractType.joining_fee_discount_percentage ?? contractType.joiningFeeDiscountPercentage)}%</TableCell>
                  <TableCell>{Boolean(contractType.requires_selected_months ?? contractType.requiresSelectedMonths) ? 'مطلوب' : 'غير مطلوب'}</TableCell>
                  <TableCell>{contractType.display_order ?? contractType.displayOrder}</TableCell>
                  <TableCell>
                    <Badge className={contractType.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-100 text-rose-700 hover:bg-rose-100'}>
                      {contractType.is_active ? 'مفعّل' : 'معطّل'}
                    </Badge>
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => openEdit(contractType)}>
                          <Pencil className="h-4 w-4" /><span className="sr-only">تعديل</span>
                        </Button>
                        <Button type="button" size="sm" variant={contractType.is_active ? 'destructive' : 'default'} onClick={() => void changeStatus(contractType)}>
                          <Power className="h-4 w-4" />{contractType.is_active ? 'تعطيل' : 'تفعيل'}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir={isArabic ? 'rtl' : 'ltr'} className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingContractType ? 'تعديل نوع العقد' : 'إضافة نوع عقد'}</DialogTitle>
            <DialogDescription>تؤثر هذه القواعد على العقود الجديدة فقط؛ الأسعار المحفوظة في العقود السابقة لا تتغير.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(saveContractType)} className="grid gap-5 md:grid-cols-2">
            <div><Label htmlFor="code">الكود</Label><Input id="code" dir="ltr" placeholder="SIX_MONTHS" {...register('code', { required: true, onChange: (event) => { event.target.value = event.target.value.toUpperCase(); } })} /><p className="mt-1 text-xs text-muted-foreground">أحرف إنجليزية كبيرة وأرقام وشرطة سفلية فقط.</p>{errors.code && <p className="mt-1 text-sm text-destructive">الكود مطلوب.</p>}</div>
            <div><Label htmlFor="displayOrder">ترتيب العرض</Label><Input id="displayOrder" type="number" min="0" max="9999" {...register('displayOrder', { valueAsNumber: true, required: true })} /></div>
            <div><Label htmlFor="nameAr">الاسم بالعربية</Label><Input id="nameAr" {...register('nameAr', { required: true })} />{errors.nameAr && <p className="mt-1 text-sm text-destructive">الاسم بالعربية مطلوب.</p>}</div>
            <div><Label htmlFor="nameEn">الاسم بالإنجليزية</Label><Input id="nameEn" dir="ltr" {...register('nameEn', { required: true })} />{errors.nameEn && <p className="mt-1 text-sm text-destructive">الاسم بالإنجليزية مطلوب.</p>}</div>
            <div><Label htmlFor="maxMonths">المدة القصوى بالأشهر</Label><Input id="maxMonths" type="number" min="1" max="120" {...register('maxMonths', { valueAsNumber: true, required: true })} /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="subscriptionDiscountPercentage">خصم الاشتراك %</Label><Input id="subscriptionDiscountPercentage" type="number" min="0" max="100" step="0.01" {...register('subscriptionDiscountPercentage', { valueAsNumber: true, required: true })} /></div><div><Label htmlFor="joiningFeeDiscountPercentage">خصم الانضمام %</Label><Input id="joiningFeeDiscountPercentage" type="number" min="0" max="100" step="0.01" {...register('joiningFeeDiscountPercentage', { valueAsNumber: true, required: true })} /></div></div>
            <div className="rounded-xl border p-4 md:col-span-2">
              <div className="flex items-center gap-3"><Checkbox id="requiresSelectedMonths" checked={Boolean(requiresSelectedMonths)} onCheckedChange={(checked) => { const enabled = checked === true; setValue('requiresSelectedMonths', enabled); if (!enabled) setValue('autoSelectConsecutive', false); }} /><Label htmlFor="requiresSelectedMonths">يجب على المستخدم اختيار الأشهر المدفوعة لهذا العرض</Label></div>
              <div className="mt-3 flex items-center gap-3"><Checkbox id="autoSelectConsecutive" disabled={!requiresSelectedMonths} checked={Boolean(autoSelectConsecutive)} onCheckedChange={(checked) => setValue('autoSelectConsecutive', checked === true)} /><Label htmlFor="autoSelectConsecutive" className={!requiresSelectedMonths ? 'text-muted-foreground' : ''}>الأشهر المختارة يجب أن تكون متتالية</Label></div>
            </div>
            <div className="flex justify-end gap-3 md:col-span-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button><Button type="submit" disabled={isSaving}>{isSaving ? 'جارٍ الحفظ...' : 'حفظ'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

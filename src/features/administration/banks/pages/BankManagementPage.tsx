import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { Landmark, Pencil, Plus, Power, Search, X } from 'lucide-react';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import {
  createBank,
  fetchManagedBanks,
  setBankStatus,
  updateBank,
  type BankPayload,
  type ManagedBank,
} from '../api/bankManagementService';

const emptyValues: BankPayload = { code: '', nameEn: '', nameAr: '' };
const errorMessage = (error: any) =>
  error?.response?.data?.error?.message || error?.response?.data?.message || 'حاول مرة أخرى.';

export default function BankManagementPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('/banks', 'CREATE');
  const canEdit = hasPermission('/banks', 'WRITE');
  const [banks, setBanks] = useState<ManagedBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<ManagedBank | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BankPayload>({
    defaultValues: emptyValues,
  });

  const loadBanks = async () => {
    try {
      setIsLoading(true);
      const response = await fetchManagedBanks();
      setBanks(response.data?.data || []);
    } catch (error) {
      console.error('Failed to load banks:', error);
      await Swal.fire({ icon: 'error', title: 'تعذر تحميل البنوك', text: errorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBanks();
  }, []);

  const filteredBanks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return banks.filter((bank) => {
      const matchesSearch = !normalizedSearch || [bank.code, bank.nameAr, bank.nameEn]
        .some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
      const matchesStatus = status === 'all' || (status === 'active' ? bank.isActive : !bank.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [banks, search, status]);

  const openCreate = () => {
    setEditingBank(null);
    reset(emptyValues);
    setDialogOpen(true);
  };

  const openEdit = (bank: ManagedBank) => {
    setEditingBank(bank);
    reset({ code: bank.code, nameEn: bank.nameEn, nameAr: bank.nameAr });
    setDialogOpen(true);
  };

  const saveBank = async (values: BankPayload) => {
    const payload = {
      code: values.code.trim().toUpperCase(),
      nameEn: values.nameEn.trim(),
      nameAr: values.nameAr.trim(),
    };
    if (!/^[A-Z][A-Z0-9_]{1,49}$/.test(payload.code)) {
      await Swal.fire({ icon: 'warning', title: 'كود غير صالح', text: 'ابدأ بحرف إنجليزي واستخدم أحرفًا كبيرة أو أرقامًا أو شرطة سفلية فقط.' });
      return;
    }
    if (!payload.nameEn || !payload.nameAr) {
      await Swal.fire({ icon: 'warning', title: 'بيانات ناقصة', text: 'أدخل اسم البنك بالعربية والإنجليزية.' });
      return;
    }

    try {
      setIsSaving(true);
      if (editingBank) await updateBank(editingBank.id, payload);
      else await createBank(payload);
      setDialogOpen(false);
      await loadBanks();
      await Swal.fire({ icon: 'success', title: editingBank ? 'تم تحديث البنك' : 'تمت إضافة البنك' });
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'تعذر حفظ البنك', text: errorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const changeStatus = async (bank: ManagedBank) => {
    const nextStatus = !bank.isActive;
    const result = await Swal.fire({
      icon: 'warning',
      title: nextStatus ? 'تفعيل البنك؟' : 'تعطيل البنك؟',
      text: nextStatus
        ? 'سيظهر البنك مجددًا في خيارات التحصيل والعقود.'
        : 'لن يظهر البنك في الخيارات الجديدة، مع الاحتفاظ بسجل التحصيل السابق.',
      showCancelButton: true,
      confirmButtonText: nextStatus ? 'تفعيل' : 'تعطيل',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: nextStatus ? '#16a34a' : '#dc2626',
    });
    if (!result.isConfirmed) return;
    try {
      await setBankStatus(bank.id, nextStatus);
      await loadBanks();
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'تعذر تغيير حالة البنك', text: errorMessage(error) });
    }
  };

  return (
    <div dir="rtl" className="space-y-6 p-4 md:p-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary"><Landmark className="h-6 w-6" /></div>
            <div>
              <h1 className="text-xl font-bold">إدارة البنوك</h1>
              <p className="mt-1 text-sm text-muted-foreground">إضافة البنوك وتعديلها والتحكم في ظهورها ضمن خيارات الدفع.</p>
            </div>
          </div>
          {canCreate && <Button onClick={openCreate}><Plus className="ml-2 h-4 w-4" />إضافة بنك</Button>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pr-9" placeholder="ابحث بالكود أو اسم البنك..." />
          </div>
          <select className="h-10 rounded-md border bg-background px-3" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">كل الحالات</option>
            <option value="active">مفعّل</option>
            <option value="inactive">معطّل</option>
          </select>
          <Button type="button" variant="outline" onClick={() => { setSearch(''); setStatus('all'); }}>
            <X className="ml-2 h-4 w-4" />مسح
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader><CardTitle>البنوك ({filteredBanks.length.toLocaleString('ar-EG')})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader><TableRow><TableHead>الكود</TableHead><TableHead>الاسم بالعربية</TableHead><TableHead>الاسم بالإنجليزية</TableHead><TableHead>الحالة</TableHead>{canEdit && <TableHead className="text-end">الإجراءات</TableHead>}</TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={canEdit ? 5 : 4} className="py-12 text-center text-muted-foreground">جارٍ تحميل البنوك...</TableCell></TableRow>
                : filteredBanks.length === 0 ? <TableRow><TableCell colSpan={canEdit ? 5 : 4} className="py-12 text-center text-muted-foreground">لا توجد بنوك مطابقة.</TableCell></TableRow>
                  : filteredBanks.map((bank) => <TableRow key={bank.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium" dir="ltr">{bank.code}</TableCell>
                    <TableCell>{bank.nameAr}</TableCell>
                    <TableCell dir="ltr">{bank.nameEn}</TableCell>
                    <TableCell><Badge className={bank.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-100 text-rose-700 hover:bg-rose-100'}>{bank.isActive ? 'مفعّل' : 'معطّل'}</Badge></TableCell>
                    {canEdit && <TableCell><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => openEdit(bank)}><Pencil className="h-4 w-4" /><span className="sr-only">تعديل</span></Button><Button size="sm" variant={bank.isActive ? 'destructive' : 'default'} onClick={() => void changeStatus(bank)}><Power className="ml-1 h-4 w-4" />{bank.isActive ? 'تعطيل' : 'تفعيل'}</Button></div></TableCell>}
                  </TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingBank ? 'تعديل البنك' : 'إضافة بنك'}</DialogTitle><DialogDescription>أدخل بيانات البنك كما ستظهر في خيارات الدفع.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit(saveBank)}>
            <div className="grid gap-2"><Label htmlFor="bank-code">الكود</Label><Input id="bank-code" dir="ltr" {...register('code', { required: 'الكود مطلوب' })} placeholder="EXAMPLE_BANK" />{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}</div>
            <div className="grid gap-2"><Label htmlFor="bank-name-ar">الاسم بالعربية</Label><Input id="bank-name-ar" {...register('nameAr', { required: 'الاسم بالعربية مطلوب' })} />{errors.nameAr && <p className="text-sm text-destructive">{errors.nameAr.message}</p>}</div>
            <div className="grid gap-2"><Label htmlFor="bank-name-en">الاسم بالإنجليزية</Label><Input id="bank-name-en" dir="ltr" {...register('nameEn', { required: 'English name is required' })} />{errors.nameEn && <p className="text-sm text-destructive">{errors.nameEn.message}</p>}</div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>إلغاء</Button><Button type="submit" disabled={isSaving}>{isSaving ? 'جارٍ الحفظ...' : 'حفظ'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

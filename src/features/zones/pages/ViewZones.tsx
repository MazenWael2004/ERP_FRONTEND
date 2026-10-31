import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { Edit3, MapPinned, Plus, Search, Trash2, X } from 'lucide-react';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import { createZone, deleteZone, fetchZones, updateZone } from '../api/zoneService';

type Zone = { id: number; code: string; name_ar: string; name_en: string };
type ZoneForm = { code: string; zoneNameAr: string; zoneNameEn: string };

const emptyZone: ZoneForm = { code: '', zoneNameAr: '', zoneNameEn: '' };
const errorMessage = (error: any) => error?.response?.data?.error?.message || error?.response?.data?.message || 'حاول مرة أخرى.';

export default function ZoneManagementPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('/zones', 'CREATE');
  const canEdit = hasPermission('/zones', 'WRITE');
  const canDelete = hasPermission('/zones', 'DELETE');
  const [zones, setZones] = useState<Zone[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ZoneForm>({ defaultValues: emptyZone });

  const loadZones = async () => {
    try {
      setLoading(true);
      const response = await fetchZones();
      setZones(response.data || []);
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'تعذر تحميل الفروع', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadZones(); }, []);

  const filteredZones = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return zones;
    return zones.filter((zone) => [zone.code, zone.name_ar, zone.name_en].some((value) => String(value || '').toLocaleLowerCase().includes(query)));
  }, [search, zones]);

  const openCreate = () => {
    setEditingZone(null);
    reset(emptyZone);
    setDialogOpen(true);
  };

  const openEdit = (zone: Zone) => {
    setEditingZone(zone);
    reset({ code: zone.code, zoneNameAr: zone.name_ar, zoneNameEn: zone.name_en });
    setDialogOpen(true);
  };

  const saveZone = async (values: ZoneForm) => {
    const payload = {
      code: values.code.trim().toUpperCase(),
      zoneNameAr: values.zoneNameAr.trim(),
      zoneNameEn: values.zoneNameEn.trim(),
    };
    if (!payload.code || !payload.zoneNameAr || !payload.zoneNameEn) return;

    try {
      setSaving(true);
      if (editingZone) await updateZone(editingZone.id, payload);
      else await createZone(payload);
      setDialogOpen(false);
      await loadZones();
      await Swal.fire({ icon: 'success', title: editingZone ? 'تم تعديل الفرع' : 'تمت إضافة الفرع', timer: 1300, showConfirmButton: false });
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'تعذر حفظ الفرع', text: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const removeZone = async (zone: Zone) => {
    const result = await Swal.fire({
      icon: 'warning', title: `حذف فرع ${zone.name_ar}؟`,
      text: 'سيتم إخفاؤه من الخيارات الجديدة مع الاحتفاظ بالسجل المرتبط به.',
      showCancelButton: true, confirmButtonText: 'حذف', cancelButtonText: 'إلغاء', confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    try {
      await deleteZone(zone.id);
      await loadZones();
      await Swal.fire({ icon: 'success', title: 'تم حذف الفرع', timer: 1300, showConfirmButton: false });
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'تعذر حذف الفرع', text: errorMessage(error) });
    }
  };

  const actionColumns = canEdit || canDelete;
  return (
    <div dir="rtl" className="space-y-6 p-4 md:p-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><MapPinned className="h-6 w-6" /></div><div><h1 className="text-xl font-bold">إدارة الفروع والمناطق</h1><p className="mt-1 text-sm text-muted-foreground">إدارة أسماء الفروع وأكوادها من شاشة واحدة.</p></div></div>
          {canCreate && <Button onClick={openCreate}><Plus className="ml-2 h-4 w-4" />إضافة فرع</Button>}
        </CardContent>
      </Card>

      <Card><CardContent className="flex flex-col gap-3 p-4 sm:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pr-9" placeholder="ابحث بالاسم أو الكود..." /></div><Button variant="outline" onClick={() => setSearch('')}><X className="ml-2 h-4 w-4" />مسح البحث</Button></CardContent></Card>

      <Card className="overflow-hidden"><CardHeader><CardTitle>الفروع ({filteredZones.length.toLocaleString('ar-EG')})</CardTitle></CardHeader><CardContent className="overflow-x-auto p-0"><Table><TableHeader><TableRow><TableHead>الكود</TableHead><TableHead>اسم الفرع</TableHead><TableHead>English name</TableHead>{actionColumns && <TableHead className="text-end">الإجراءات</TableHead>}</TableRow></TableHeader><TableBody>
        {loading ? <TableRow><TableCell colSpan={actionColumns ? 4 : 3} className="py-12 text-center text-muted-foreground">جارٍ تحميل الفروع...</TableCell></TableRow>
          : filteredZones.length === 0 ? <TableRow><TableCell colSpan={actionColumns ? 4 : 3} className="py-12 text-center text-muted-foreground">لا توجد فروع مطابقة.</TableCell></TableRow>
            : filteredZones.map((zone) => <TableRow key={zone.id} className="hover:bg-muted/40"><TableCell dir="ltr" className="font-medium text-primary">{zone.code}</TableCell><TableCell className="font-medium">{zone.name_ar}</TableCell><TableCell dir="ltr">{zone.name_en}</TableCell>{actionColumns && <TableCell><div className="flex justify-end gap-2">{canEdit && <Button size="sm" variant="outline" onClick={() => openEdit(zone)}><Edit3 className="ml-1 h-4 w-4" />تعديل</Button>}{canDelete && <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => void removeZone(zone)}><Trash2 className="ml-1 h-4 w-4" />حذف</Button>}</div></TableCell>}</TableRow>)}
      </TableBody></Table></CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent dir="rtl" className="sm:max-w-lg"><DialogHeader><DialogTitle>{editingZone ? 'تعديل الفرع' : 'إضافة فرع'}</DialogTitle><DialogDescription>ستظهر هذه البيانات في العقود والتقارير وقوائم اختيار الفرع.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={handleSubmit(saveZone)}><div className="grid gap-2"><Label htmlFor="zone-code">كود الفرع</Label><Input id="zone-code" dir="ltr" placeholder="BR-EXAMPLE" {...register('code', { required: 'كود الفرع مطلوب' })} />{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}</div><div className="grid gap-2"><Label htmlFor="zone-ar">اسم الفرع بالعربية</Label><Input id="zone-ar" {...register('zoneNameAr', { required: 'اسم الفرع بالعربية مطلوب' })} />{errors.zoneNameAr && <p className="text-sm text-destructive">{errors.zoneNameAr.message}</p>}</div><div className="grid gap-2"><Label htmlFor="zone-en">اسم الفرع بالإنجليزية</Label><Input id="zone-en" dir="ltr" {...register('zoneNameEn', { required: 'English branch name is required' })} />{errors.zoneNameEn && <p className="text-sm text-destructive">{errors.zoneNameEn.message}</p>}</div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>إلغاء</Button><Button type="submit" disabled={saving}>{saving ? 'جارٍ الحفظ...' : 'حفظ'}</Button></div></form></DialogContent></Dialog>
    </div>
  );
}

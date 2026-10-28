import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'src/components/ui/accordion';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, Pencil, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import {
  createRole,
  deleteRole,
  editRole,
  fetchRolePermissionCatalog,
  fetchRoles,
  getRoleById,
} from '../api/roleService';

type Permission = { pageId: number; actionId: number };
type Role = {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  is_system: boolean;
  permission_count: number;
  user_count: number;
  permissions?: Array<{ page_id: number; action_id: number }>;
};
type Page = {
  id: number;
  title_en: string;
  title_ar: string;
  route: string;
  module_id: number | null;
  module_name_en: string | null;
  module_name_ar: string | null;
};
type Action = { id: number; code: string; name_en: string; name_ar: string };
type RoleDraft = { roleCode: string; roleNameEn: string; roleNameAr: string };

const emptyDraft: RoleDraft = { roleCode: '', roleNameEn: '', roleNameAr: '' };
const permissionKey = (pageId: number, actionId: number) => `${pageId}:${actionId}`;
const apiError = (error: any) =>
  error?.response?.data?.error?.message || error?.response?.data?.message || 'حاول مرة أخرى.';

export default function RoleManagementPage() {
  const { i18n } = useTranslation();
  const { hasPermission, refreshPermissions } = useAuth();
  const isArabic = i18n.language.startsWith('ar');
  const canCreate = hasPermission('/roles', 'CREATE');
  const canEdit = hasPermission('/roles', 'WRITE');
  const canDelete = hasPermission('/roles', 'DELETE');

  const [roles, setRoles] = useState<Role[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [draft, setDraft] = useState<RoleDraft>(emptyDraft);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [rolesResponse, catalogResponse] = await Promise.all([
        fetchRoles(),
        fetchRolePermissionCatalog(),
      ]);
      setRoles(rolesResponse.data || []);
      setPages(catalogResponse.data?.pages || []);
      setActions(catalogResponse.data?.actions || []);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: 'error',
        title: 'تعذر تحميل الأدوار',
        text: 'تحقق من الاتصال ثم أعد المحاولة.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return roles;
    return roles.filter((role) =>
      [role.code, role.name_en, role.name_ar].some((value) => value.toLowerCase().includes(query)),
    );
  }, [roles, search]);

  const moduleGroups = useMemo(() => {
    const groups = new Map<string, { label: string; pages: Page[] }>();
    for (const page of pages) {
      const key = String(page.module_id ?? 'other');
      if (!groups.has(key)) {
        groups.set(key, {
          label: isArabic
            ? page.module_name_ar || 'صفحات أخرى'
            : page.module_name_en || 'Other pages',
          pages: [],
        });
      }
      groups.get(key)!.pages.push(page);
    }
    return [...groups.entries()];
  }, [pages, isArabic]);

  const readAction = useMemo(() => actions.find((action) => action.code === 'READ'), [actions]);
  const selectedPermissions = useMemo(
    () =>
      new Set(
        permissions.map((permission) => permissionKey(permission.pageId, permission.actionId)),
      ),
    [permissions],
  );

  const hasPermissionFor = (pageId: number, actionId: number) =>
    selectedPermissions.has(permissionKey(pageId, actionId));

  const togglePermission = (pageId: number, action: Action, checked: boolean) => {
    setPermissions((current) => {
      if (!checked && action.code === 'READ')
        return current.filter((permission) => permission.pageId !== pageId);
      const currentKeys = new Set(
        current.map((permission) => permissionKey(permission.pageId, permission.actionId)),
      );
      if (checked) {
        currentKeys.add(permissionKey(pageId, action.id));
        if (action.code !== 'READ' && readAction)
          currentKeys.add(permissionKey(pageId, readAction.id));
      } else {
        currentKeys.delete(permissionKey(pageId, action.id));
      }
      return [...currentKeys].map((key) => {
        const [pageValue, actionValue] = key.split(':').map(Number);
        return { pageId: pageValue, actionId: actionValue };
      });
    });
  };

  const setPageFullAccess = (pageId: number, checked: boolean) => {
    setPermissions((current) => {
      const otherPages = current.filter((permission) => permission.pageId !== pageId);
      return checked
        ? [...otherPages, ...actions.map((action) => ({ pageId, actionId: action.id }))]
        : otherPages;
    });
  };

  const openCreate = () => {
    setEditingRole(null);
    setDraft(emptyDraft);
    setPermissions([]);
    setDialogOpen(true);
  };

  const openEdit = async (role: Role) => {
    try {
      setIsSaving(true);
      const response = await getRoleById(role.id);
      const details: Role = response.data;
      setEditingRole(details);
      setDraft({
        roleCode: details.code,
        roleNameEn: details.name_en,
        roleNameAr: details.name_ar,
      });
      setPermissions(
        (details.permissions || []).map((permission) => ({
          pageId: Number(permission.page_id),
          actionId: Number(permission.action_id),
        })),
      );
      setDialogOpen(true);
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'تعذر تحميل الدور', text: apiError(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const saveRole = async () => {
    const payload = {
      roleNameEn: draft.roleNameEn.trim(),
      roleNameAr: draft.roleNameAr.trim(),
      permissions,
      ...(editingRole ? {} : { roleCode: draft.roleCode.trim().toUpperCase() }),
    };
    if (!payload.roleNameEn || !payload.roleNameAr) {
      await Swal.fire({
        icon: 'warning',
        title: 'بيانات ناقصة',
        text: 'أدخل اسم الدور بالعربية والإنجليزية.',
      });
      return;
    }
    if (!editingRole && !/^[A-Z][A-Z0-9_]{1,49}$/.test(payload.roleCode || '')) {
      await Swal.fire({
        icon: 'warning',
        title: 'كود غير صالح',
        text: 'ابدأ بحرف إنجليزي واستخدم أحرفًا كبيرة أو أرقامًا أو شرطة سفلية فقط.',
      });
      return;
    }
    if (!permissions.length) {
      await Swal.fire({
        icon: 'warning',
        title: 'الصلاحيات مطلوبة',
        text: 'اختر صلاحية واحدة على الأقل لهذا الدور.',
      });
      return;
    }
    try {
      setIsSaving(true);
      if (editingRole) await editRole(editingRole.id, payload);
      else await createRole(payload);
      await refreshPermissions();
      setDialogOpen(false);
      await Swal.fire({
        icon: 'success',
        title: editingRole ? 'تم تحديث الدور' : 'تم إنشاء الدور',
      });
      await loadData();
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'تعذر حفظ الدور', text: apiError(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const removeRole = async (role: Role) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'حذف الدور؟',
      text: 'لا يمكن حذف دور مرتبط بمستخدمين، ولا يمكن حذف أدوار النظام الأساسية.',
      showCancelButton: true,
      confirmButtonText: 'حذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    try {
      await deleteRole(role.id);
      await Swal.fire({ icon: 'success', title: 'تم حذف الدور' });
      await loadData();
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'تعذر حذف الدور', text: apiError(error) });
    }
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="space-y-6 p-4 md:p-6">
      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">إدارة الأدوار والصلاحيات</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              أنشئ الأدوار وحدد بدقة ما يمكن لكل دور رؤيته أو تنفيذه.
            </p>
          </div>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="ms-2 h-4 w-4" />
            إضافة دور
          </Button>
        )}
      </section>

      <section className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث بالكود أو الاسم..."
            className="ps-10"
          />
        </div>
        <Button type="button" variant="outline" onClick={() => setSearch('')}>
          <X className="ms-2 h-4 w-4" />
          مسح
        </Button>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>كود الدور</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الصلاحيات</TableHead>
                <TableHead>المستخدمون</TableHead>
                <TableHead>النوع</TableHead>
                {(canEdit || canDelete) && <TableHead className="text-end">الإجراءات</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={canEdit || canDelete ? 6 : 5}
                    className="py-12 text-center text-muted-foreground"
                  >
                    جارٍ تحميل الأدوار...
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canEdit || canDelete ? 6 : 5}
                    className="py-12 text-center text-muted-foreground"
                  >
                    لا توجد نتائج.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-muted/40">
                    <TableCell dir="ltr" className="font-medium">
                      {role.code}
                    </TableCell>
                    <TableCell>
                      {isArabic ? role.name_ar : role.name_en}
                      <div className="mt-1 text-xs text-muted-foreground">
                        {isArabic ? role.name_en : role.name_ar}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{Number(role.permission_count || 0)} صلاحية</Badge>
                    </TableCell>
                    <TableCell>{Number(role.user_count || 0)}</TableCell>
                    <TableCell>
                      {role.is_system ? (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          دور نظام
                        </Badge>
                      ) : (
                        <Badge variant="outline">مخصص</Badge>
                      )}
                    </TableCell>
                    {(canEdit || canDelete) && (
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {canEdit && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => void openEdit(role)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">تعديل</span>
                            </Button>
                          )}
                          {canDelete && !role.is_system && (
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => void removeRole(role)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">حذف</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          dir={isArabic ? 'rtl' : 'ltr'}
          className="max-h-[92vh] overflow-y-auto sm:max-w-5xl"
        >
          <DialogHeader>
            <DialogTitle>{editingRole ? 'تعديل الدور والصلاحيات' : 'إضافة دور جديد'}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'الكود ثابت لحماية تكامل النظام؛ يمكنك تعديل الاسم والصلاحيات.'
                : 'اختر كودًا ثابتًا للدور ثم امنحه صلاحياته.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <Label htmlFor="roleCode">كود الدور</Label>
              <Input
                id="roleCode"
                dir="ltr"
                value={draft.roleCode}
                disabled={Boolean(editingRole)}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    roleCode: event.target.value.toUpperCase(),
                  }))
                }
                placeholder="SALES_MANAGER"
              />
              <p className="mt-1 text-xs text-muted-foreground">لا يتغير بعد إنشاء الدور.</p>
            </div>
            <div>
              <Label htmlFor="roleNameAr">الاسم بالعربية</Label>
              <Input
                id="roleNameAr"
                value={draft.roleNameAr}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, roleNameAr: event.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="roleNameEn">الاسم بالإنجليزية</Label>
              <Input
                id="roleNameEn"
                dir="ltr"
                value={draft.roleNameEn}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, roleNameEn: event.target.value }))
                }
              />
            </div>
          </div>
          <section className="rounded-2xl border">
            <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">الصلاحيات</h2>
                <p className="text-sm text-muted-foreground">
                  اختيار إجراء يضيف صلاحية القراءة تلقائيًا. إزالة القراءة تزيل بقية إجراءات الصفحة.
                </p>
              </div>
              <Badge variant="secondary">{permissions.length} صلاحية مختارة</Badge>
            </div>
            <Accordion type="multiple" className="px-4">
              {moduleGroups.map(([moduleId, group]) => (
                <AccordionItem key={moduleId} value={moduleId}>
                  <AccordionTrigger>
                    {group.label}
                    <span className="ms-2 text-xs text-muted-foreground">
                      ({group.pages.length})
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-3 pb-2 md:grid-cols-2">
                      {group.pages.map((page) => {
                        const pageActionCount = permissions.filter(
                          (permission) => permission.pageId === page.id,
                        ).length;
                        const fullAccess = actions.length > 0 && pageActionCount === actions.length;
                        return (
                          <div key={page.id} className="rounded-xl border p-3">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium">
                                  {isArabic ? page.title_ar : page.title_en}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                                  {page.route}
                                </p>
                              </div>
                              <label className="flex cursor-pointer items-center gap-2 text-xs">
                                <Checkbox
                                  checked={fullAccess}
                                  onCheckedChange={(checked) =>
                                    setPageFullAccess(page.id, checked === true)
                                  }
                                />
                                كل الصلاحيات
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
                              {actions.map((action) => (
                                <label
                                  key={action.id}
                                  className="flex cursor-pointer items-center gap-2 text-xs"
                                >
                                  <Checkbox
                                    checked={hasPermissionFor(page.id, action.id)}
                                    onCheckedChange={(checked) =>
                                      togglePermission(page.id, action, checked === true)
                                    }
                                  />
                                  <span>{isArabic ? action.name_ar : action.name_en}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button type="button" disabled={isSaving} onClick={() => void saveRole()}>
              {isSaving ? 'جارٍ الحفظ...' : 'حفظ الدور'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

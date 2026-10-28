import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { Check, Pencil, Plus, Power, Search, UserRound, X } from 'lucide-react';
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
import { fetchRolesWithoutAuth } from 'src/features/roles/api/roleService';
import { createUser, fetchUsers, setUserStatus, updateUser } from '../api/userService';

type Role = { id: number; name_en: string; name_ar: string; code?: string };
type User = {
  id: number;
  username: string;
  name_en: string;
  name_ar: string;
  is_enabled: boolean;
  roles: Role[];
};

type UserFormValues = {
  userName: string;
  nameEn: string;
  nameAr: string;
  roles: number[];
  password: string;
  confirmPassword: string;
};

const emptyValues: UserFormValues = {
  userName: '',
  nameEn: '',
  nameAr: '',
  roles: [],
  password: '',
  confirmPassword: '',
};

const isValidPassword = (value: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);

export default function UserManagementPage() {
  const { i18n } = useTranslation();
  const { user: currentUser, hasPermission } = useAuth();
  const isArabic = i18n.language.startsWith('ar');
  const canCreate = hasPermission('/users', 'CREATE');
  const canEdit = hasPermission('/users', 'WRITE');

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [roleId, setRoleId] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [changePassword, setChangePassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: emptyValues,
  });
  const selectedRoleIds = watch('roles') || [];

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetchUsers({
        search: search.trim() || undefined,
        status: status === 'all' ? undefined : status,
        roleId: roleId === 'all' ? undefined : Number(roleId),
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: 'error',
        title: 'تعذر تحميل المستخدمين',
        text: 'تحقق من الاتصال ثم أعد المحاولة.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [status, roleId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadUsers(), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await fetchRolesWithoutAuth();
        setRoles(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    void loadRoles();
  }, []);

  const dialogTitle = editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم';
  const passwordRequired = !editingUser || changePassword;

  const openCreate = () => {
    setEditingUser(null);
    setChangePassword(true);
    reset(emptyValues);
    setDialogOpen(true);
  };

  const openEdit = (account: User) => {
    setEditingUser(account);
    setChangePassword(false);
    reset({
      userName: account.username,
      nameEn: account.name_en || '',
      nameAr: account.name_ar || '',
      roles: (account.roles || []).map((role) => Number(role.id)),
      password: '',
      confirmPassword: '',
    });
    setDialogOpen(true);
  };

  const toggleRole = (id: number, checked: boolean) => {
    const current = selectedRoleIds.map(Number);
    setValue(
      'roles',
      checked ? [...new Set([...current, id])] : current.filter((roleId) => roleId !== id),
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );
  };

  const saveUser = async (values: UserFormValues) => {
    const normalized = {
      userName: values.userName.trim(),
      nameEn: values.nameEn.trim(),
      nameAr: values.nameAr.trim(),
      roles: values.roles.map(Number),
    };

    if (
      !normalized.userName ||
      !normalized.nameEn ||
      !normalized.nameAr ||
      !normalized.roles.length
    ) {
      await Swal.fire({
        icon: 'warning',
        title: 'بيانات ناقصة',
        text: 'أدخل اسم المستخدم والاسمين والدور واحدًا على الأقل.',
      });
      return;
    }
    if (passwordRequired && !isValidPassword(values.password)) {
      await Swal.fire({
        icon: 'warning',
        title: 'كلمة المرور غير صالحة',
        text: 'يجب أن تتكون من 8 أحرف على الأقل وتحتوي حرفًا ورقمًا.',
      });
      return;
    }
    if (passwordRequired && values.password !== values.confirmPassword) {
      await Swal.fire({ icon: 'warning', title: 'كلمتا المرور غير متطابقتين' });
      return;
    }

    try {
      setIsSaving(true);
      const payload = passwordRequired ? { ...normalized, password: values.password } : normalized;
      if (editingUser) {
        await updateUser(editingUser.id, payload);
      } else {
        await createUser(payload);
      }
      setDialogOpen(false);
      await Swal.fire({
        icon: 'success',
        title: editingUser ? 'تم تحديث المستخدم' : 'تم إنشاء المستخدم',
      });
      await loadUsers();
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.response?.data?.message;
      await Swal.fire({
        icon: 'error',
        title: 'تعذر حفظ المستخدم',
        text: message || 'حاول مرة أخرى.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const changeStatus = async (account: User) => {
    const enable = !account.is_enabled;
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: enable ? 'تفعيل المستخدم؟' : 'تعطيل المستخدم؟',
      text: enable
        ? 'سيتمكن المستخدم من تسجيل الدخول فورًا.'
        : 'سيتم إيقاف تسجيل الدخول واستخدام الجلسات الحالية لهذا المستخدم.',
      showCancelButton: true,
      confirmButtonText: enable ? 'تفعيل' : 'تعطيل',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: enable ? '#16a34a' : '#dc2626',
    });
    if (!confirmation.isConfirmed) return;

    try {
      await setUserStatus(account.id, enable);
      await loadUsers();
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'تعذر تغيير حالة المستخدم',
        text:
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          'حاول مرة أخرى.',
      });
    }
  };

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        ...role,
        label: isArabic ? role.name_ar : role.name_en,
      })),
    [roles, isArabic],
  );

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="space-y-6 p-4 md:p-6">
      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">إدارة المستخدمين</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              إضافة الحسابات، تعديلها، تعيين الأدوار، وتعطيل أو تفعيل الوصول.
            </p>
          </div>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="ms-2 h-4 w-4" />
            إضافة مستخدم
          </Button>
        )}
      </section>

      <section className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-[minmax(0,1fr)_180px_220px_auto]">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث باسم المستخدم أو الاسم..."
            className="ps-10"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="enabled">مفعّل</SelectItem>
            <SelectItem value="disabled">معطّل</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger>
            <SelectValue placeholder="كل الأدوار" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأدوار</SelectItem>
            {roleOptions.map((role) => (
              <SelectItem key={role.id} value={String(role.id)}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSearch('');
            setStatus('all');
            setRoleId('all');
          }}
        >
          <X className="ms-2 h-4 w-4" />
          مسح
        </Button>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المستخدم</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>الأدوار</TableHead>
                <TableHead>الحالة</TableHead>
                {canEdit && <TableHead className="text-end">الإجراءات</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={canEdit ? 5 : 4}
                    className="py-12 text-center text-muted-foreground"
                  >
                    جارٍ تحميل المستخدمين...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canEdit ? 5 : 4}
                    className="py-12 text-center text-muted-foreground"
                  >
                    لا توجد نتائج.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((account) => (
                  <TableRow key={account.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium" dir="ltr">
                      {account.username}
                    </TableCell>
                    <TableCell>
                      {isArabic ? account.name_ar : account.name_en}
                      <div className="mt-1 text-xs text-muted-foreground">
                        {isArabic ? account.name_en : account.name_ar}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(account.roles || []).map((role) => (
                          <Badge key={role.id} variant="secondary">
                            {isArabic ? role.name_ar : role.name_en}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          account.is_enabled
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-100'
                        }
                      >
                        {account.is_enabled ? 'مفعّل' : 'معطّل'}
                      </Badge>
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(account)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">تعديل</span>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={account.is_enabled ? 'destructive' : 'default'}
                            disabled={Number(account.id) === Number(currentUser?.id)}
                            title={
                              Number(account.id) === Number(currentUser?.id)
                                ? 'لا يمكنك تعطيل حسابك'
                                : undefined
                            }
                            onClick={() => void changeStatus(account)}
                          >
                            <Power className="h-4 w-4" />
                            {account.is_enabled ? 'تعطيل' : 'تفعيل'}
                          </Button>
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
          className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'حدّث بيانات الحساب والأدوار. اترك كلمة المرور فارغة للإبقاء عليها.'
                : 'أنشئ حسابًا مستقلاً ثم عيّن الأدوار التي تحدد وصوله.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(saveUser)} className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="userName">اسم المستخدم</Label>
              <Input
                id="userName"
                dir="ltr"
                className="mt-2"
                {...register('userName', { required: true })}
              />
              {errors.userName && (
                <p className="mt-1 text-xs text-destructive">اسم المستخدم مطلوب.</p>
              )}
            </div>
            <div>
              <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
              <Input id="nameEn" className="mt-2" {...register('nameEn', { required: true })} />
              {errors.nameEn && (
                <p className="mt-1 text-xs text-destructive">الاسم بالإنجليزية مطلوب.</p>
              )}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="nameAr">الاسم بالعربية</Label>
              <Input id="nameAr" className="mt-2" {...register('nameAr', { required: true })} />
              {errors.nameAr && (
                <p className="mt-1 text-xs text-destructive">الاسم بالعربية مطلوب.</p>
              )}
            </div>
            {editingUser && (
              <div className="md:col-span-2 flex items-center gap-2 rounded-xl border bg-muted/30 p-3">
                <Checkbox
                  id="changePassword"
                  checked={changePassword}
                  onCheckedChange={(checked) => setChangePassword(Boolean(checked))}
                />
                <Label htmlFor="changePassword" className="cursor-pointer">
                  تعيين كلمة مرور جديدة
                </Label>
              </div>
            )}
            {passwordRequired && (
              <>
                <div>
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    dir="ltr"
                    className="mt-2"
                    {...register('password')}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    dir="ltr"
                    className="mt-2"
                    {...register('confirmPassword')}
                  />
                </div>
              </>
            )}
            <div className="md:col-span-2">
              <Label>الأدوار</Label>
              <div className="mt-2 grid max-h-52 gap-2 overflow-y-auto rounded-xl border p-3 sm:grid-cols-2">
                {roleOptions.map((role) => {
                  const checked = selectedRoleIds.map(Number).includes(role.id);
                  return (
                    <label
                      key={role.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-muted"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => toggleRole(role.id, Boolean(value))}
                      />
                      <span>{role.label}</span>
                      {checked && <Check className="ms-auto h-4 w-4 text-emerald-600" />}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'جارٍ الحفظ...' : 'حفظ المستخدم'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

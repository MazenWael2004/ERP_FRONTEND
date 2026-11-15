import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { Check, ChevronsUpDown, Eye, EyeOff, Pencil, Plus, Power, Search, UserRound, X } from 'lucide-react';
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
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
import { createUser, fetchUserList, fetchUsers, setUserStatus, updateUser } from '../api/userService';

type Role = { id: number; name_en: string; name_ar: string; code?: string };
type User = {
  id: number;
  username: string;
  name_en: string;
  name_ar: string;
  is_enabled: boolean;
  manager_user_id?: number | null;
  manager_username?: string | null;
  manager_name_en?: string | null;
  manager_name_ar?: string | null;
  roles: Role[];
};

type UserFormValues = {
  userName: string;
  nameEn: string;
  nameAr: string;
  roles: number[];
  managerUserId: string;
  password: string;
  confirmPassword: string;
};

const emptyValues: UserFormValues = {
  userName: '',
  nameEn: '',
  nameAr: '',
  roles: [],
  managerUserId: '',
  password: '',
  confirmPassword: '',
};

const pageSizeOptions = [10, 25, 50];

const isValidPassword = (value: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);

export default function UserManagementPage() {
  const { i18n } = useTranslation();
  const { user: currentUser, hasPermission } = useAuth();
  const isArabic = i18n.language.startsWith('ar');
  const canCreate = hasPermission('/users', 'CREATE');
  const canEdit = hasPermission('/users', 'WRITE');

  const [users, setUsers] = useState<User[]>([]);
  const [managerUsers, setManagerUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [roleId, setRoleId] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [managerPickerOpen, setManagerPickerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [changePassword, setChangePassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

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
  const selectedManagerUserId = watch('managerUserId') || '';

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetchUsers({
        search: search.trim() || undefined,
        status: status === 'all' ? undefined : status,
        roleId: roleId === 'all' ? undefined : Number(roleId),
      });
      setUsers(response.data || []);
      setPage(1);
    } catch (error) {
      console.error(error);
      toast.error('تعذر تحميل المستخدمين. تحقق من الاتصال ثم أعد المحاولة.');
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

  const loadManagerUsers = async () => {
    try {
      const response = await fetchUserList();
      setManagerUsers(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void loadManagerUsers();
  }, []);

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
    setShowPasswords(false);
    reset(emptyValues);
    setDialogOpen(true);
  };

  const openEdit = (account: User) => {
    setEditingUser(account);
    setChangePassword(false);
    setShowPasswords(false);
    reset({
      userName: account.username,
      nameEn: account.name_en || '',
      nameAr: account.name_ar || '',
      roles: (account.roles || []).map((role) => Number(role.id)),
      managerUserId: account.manager_user_id ? String(account.manager_user_id) : '',
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
      managerUserId: values.managerUserId ? Number(values.managerUserId) : null,
    };

    if (
      !normalized.userName ||
      !normalized.nameEn ||
      !normalized.nameAr ||
      !normalized.roles.length
    ) {
      toast.error('بيانات ناقصة: أدخل اسم المستخدم والاسمين والدور واحدًا على الأقل.');
      return;
    }
    if (passwordRequired && !isValidPassword(values.password)) {
      toast.error('كلمة المرور غير صالحة: يجب أن تتكون من 8 أحرف على الأقل وتحتوي حرفًا ورقمًا.');
      return;
    }
    if (passwordRequired && values.password !== values.confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين.');
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
      toast.success(editingUser ? 'تم تحديث المستخدم.' : 'تم إنشاء المستخدم.');
      await loadUsers();
      await loadManagerUsers();
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.response?.data?.message;
      toast.error(`تعذر حفظ المستخدم: ${message || 'حاول مرة أخرى.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const changeStatus = async (account: User) => {
    const enable = !account.is_enabled;
    const confirmation = await Swal.fire({
      icon: 'question',
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
      toast.success(enable ? 'تم تفعيل المستخدم.' : 'تم تعطيل المستخدم.');
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        'حاول مرة أخرى.';
      toast.error(`تعذر تغيير حالة المستخدم: ${message}`);
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
  const managerOptions = useMemo(
    () => managerUsers
      .filter((account) => account.is_enabled && account.id !== editingUser?.id)
      .sort((first, second) =>
        (isArabic ? first.name_ar : first.name_en).localeCompare(isArabic ? second.name_ar : second.name_en),
      ),
    [editingUser?.id, isArabic, managerUsers],
  );
  const selectedManager = managerUsers.find(
    (account) => String(account.id) === String(selectedManagerUserId),
  );
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(
    () => users.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, pageSize, users],
  );
  const firstVisibleUser = users.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastVisibleUser = Math.min(currentPage * pageSize, users.length);

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
                <TableHead>المدير المباشر</TableHead>
                <TableHead>الأدوار</TableHead>

                <TableHead>الحالة</TableHead>
                {canEdit && <TableHead className="text-end">الإجراءات</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={canEdit ? 6 : 5}
                    className="py-12 text-center text-muted-foreground"
                  >
                    جارٍ تحميل المستخدمين...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canEdit ? 6 : 5}
                    className="py-12 text-center text-muted-foreground"
                  >
                    لا توجد نتائج.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((account) => (
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
                      {account.manager_user_id ? (
                        <>
                          <span>{isArabic ? account.manager_name_ar : account.manager_name_en}</span>
                          <div className="mt-1 text-xs text-muted-foreground" dir="ltr">
                            #{account.manager_user_id} · {account.manager_username}
                          </div>
                        </>
                      ) : '—'}
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
        {!isLoading && users.length > 0 && (
          <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">
              عرض {firstVisibleUser.toLocaleString('ar-EG')}–{lastVisibleUser.toLocaleString('ar-EG')} من{' '}
              {users.length.toLocaleString('ar-EG')} مستخدم
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
                صفحة {currentPage.toLocaleString('ar-EG')} من {totalPages.toLocaleString('ar-EG')}
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
            <div className="md:col-span-2">
              <Label>المدير المباشر (رقم المستخدم)</Label>
              <Popover open={managerPickerOpen} onOpenChange={setManagerPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={managerPickerOpen}
                    className="mt-2 w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedManager
                        ? `#${selectedManager.id} — ${isArabic ? selectedManager.name_ar : selectedManager.name_en} (${selectedManager.username})`
                        : 'بدون مدير مباشر'}
                    </span>
                    <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ابحث بالرقم أو الاسم أو اسم المستخدم..." />
                    <CommandList>
                      <CommandEmpty>لا يوجد مستخدم مطابق.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="بدون مدير مباشر"
                          onSelect={() => {
                            setValue('managerUserId', '', { shouldDirty: true });
                            setManagerPickerOpen(false);
                          }}
                        >
                          <Check className={`ms-2 h-4 w-4 ${selectedManagerUserId ? 'opacity-0' : 'opacity-100'}`} />
                          بدون مدير مباشر
                        </CommandItem>
                        {managerOptions.map((account) => (
                          <CommandItem
                            key={account.id}
                            value={`${account.id} ${account.username} ${account.name_ar} ${account.name_en}`}
                            onSelect={() => {
                              setValue('managerUserId', String(account.id), { shouldDirty: true });
                              setManagerPickerOpen(false);
                            }}
                          >
                            <Check
                              className={`ms-2 h-4 w-4 ${String(account.id) === String(selectedManagerUserId) ? 'opacity-100' : 'opacity-0'}`}
                            />
                            #{account.id} — {isArabic ? account.name_ar : account.name_en} ({account.username})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="mt-1 text-xs text-muted-foreground">اختياري. يحدد خط التقارير للمستخدم.</p>
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
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPasswords ? 'text' : 'password'}
                      dir="ltr"
                      className="pr-10"
                      {...register('password')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                      onClick={() => setShowPasswords((current) => !current)}
                      aria-label={showPasswords ? 'إخفاء كلمات المرور' : 'إظهار كلمات المرور'}
                      title={showPasswords ? 'إخفاء كلمات المرور' : 'إظهار كلمات المرور'}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirmPassword"
                    type={showPasswords ? 'text' : 'password'}
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

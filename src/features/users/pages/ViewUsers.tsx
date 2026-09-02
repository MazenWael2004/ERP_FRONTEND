import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchUsers, deleteUser } from '../../users/api/userService';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { DataTable } from 'src/components/utilities/table/DataTable';
import { fetchRoles,fetchRolesWithoutAuth } from 'src/features/roles/api/roleService';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import { Button } from 'src/components/ui/button';
import Swal from 'sweetalert2';
import { Plus, Download, Filter, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from 'src/components/ui/input';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import { Label } from 'src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from 'src/components/ui/select';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import userIcon from '../../../assets/images/logos/working.png';

export default function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const { hasPermission } = useAuth();
  const [filterOpen, setFilterOpen] = useState(false);
  // HARDCODED FIX LATER.......
  const canEdit = hasPermission('/users', 'WRITE');
  const canDelete = hasPermission('/users', 'DELETE');
  const canAdd = hasPermission('/users', 'CREATE');
  
  console.log(hasPermission('/users','READ'));
  const isArabic = i18n.language.startsWith('ar');

  const userColumns = [
    {
      accessorKey: 'username',
      header: t('USERNAME'),
    },
    {
      accessorKey: isArabic ? 'employee_name_ar' : 'employee_name_en',
      header: t('EMPLOYEE_NAME'),
    },
    {
      accessorKey: isArabic ? 'job_title_ar' : 'job_title_en',
      header: t('JOB_TITLE'),
    },
  ];

  const {
    register: registerFilter,
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilters,
  } = useForm({
    defaultValues: {
      roleId: null,
    },
  });

  const handleEditUser = (user: any) => {
    nav('/users/edit', {
      state: { user: user },
    });
  };

  const handleReset = () => {
    resetFilters({
      roleId: null,
    });
  };

  const loadUsers = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await fetchUsers(filters);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await fetchRolesWithoutAuth();
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleApplyFilters = async (filters: any) => {
    console.log('FILTERS:', filters);

    await loadUsers(filters);

    setFilterOpen(false);
  };

  const handleDelete = async (user: any) => {
    const result = await Swal.fire({
      title: t('ARE_YOU_SURE'),
      text: t('CANNOT_UNDO_ACTION'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('YES_DELETE'),
      cancelButtonText: t('CANCEL'),
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUser(user.id);

      await Swal.fire({
        title: t('DELETED'),
        text: t('USER_DELETED_SUCCESSFULLY'),
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      await loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);

      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete the user.',
        icon: 'error',
      });
    }
  };
  return (
    <>
      <BreadcrumbComp title={t('USERS_TABLE')} breadCrumbBg={userIcon} />
      <div className="flex gap-6 flex-col ">
        <div className="flex justify-end gap-2">
          {/* HARDCODED FIX LATER..... */}
          {canAdd && (
            <Button
              onClick={() => nav('/users/new-user')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('ADD_USER')}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`transition-all duration-200 ${
              filterOpen
                ? 'border-slate-700 bg-slate-100 text-slate-900'
                : 'border-slate-500 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Filter className="mr-2 h-4 w-4" />
            {t('FILTER')}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="border-blue-600 text-blue-600
                         hover:bg-blue-50 hover:text-blue-700
                         transition-all duration-200"
          >
            <Download className="mr-2 h-4 w-4" />
            {t('EXPORT')}
          </Button>
        </div>
        {/* Filter Panel */}
        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogContent  dir={isArabic ? 'rtl' : 'ltr'}
  className={`sm:max-w-[420px] ${
    isArabic ? '[&>button]:right-auto [&>button]:left-4' : ''
  }`}>
            <DialogHeader>
              <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
                {t('FILTER_USERS')}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleFilterSubmit(handleApplyFilters)} dir={isArabic ? 'rtl' : 'ltr'}>
              {/* Filters */}
              <div className="space-y-4">
                {/* Role */}
                <Controller
                  name="roleId"
                  control={filterControl}
                  render={({ field }) => {
                    const selectedRole = roles.find(
                      (role) => Number(role.id) === Number(field.value),
                    );

                    return (
                      <div>
                        <Label>{t('ROLE')}</Label>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              className={`mt-2 w-full justify-between ${
                                isArabic ? 'text-right' : 'text-left'
                              }`}
                              dir={isArabic ? 'rtl' : 'ltr'}
                            >
                              {selectedRole
                                ? isArabic
                                  ? selectedRole.name_ar
                                  : selectedRole.name_en
                                : t('SELECT_ROLE')}

                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] p-0"
                            align="start"
                            dir={isArabic ? 'rtl' : 'ltr'}
                          >
                            <Command>
                              <CommandInput placeholder={t('SEARCH_ROLE')} />

                              <CommandList>
                                <CommandEmpty>{t('GOVERNORATE_NOT_FOUND')}</CommandEmpty>

                                <CommandGroup>
                                  {roles.map((role) => {
                                    const roleName = isArabic ? role.name_ar : role.name_en;

                                    return (
                                      <CommandItem
                                        key={role.id}
                                        value={roleName}
                                        onSelect={() => {
                                          field.onChange(Number(role.id));
                                        }}
                                      >
                                        {roleName}

                                        {Number(field.value) === Number(role.id) && (
                                          <Check className="ml-auto h-4 w-4" />
                                        )}
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    );
                  }}
                />
              </div>

              {/* Footer */}
              <div
                className={`mt-6 flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 ${
                  isArabic ? 'justify-start' : 'justify-end'
                }`}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="border-red-300 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/50 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 transition-colors duration-200"
                >
                  {t('RESET')}
                </Button>
                <Button
                  type="submit"
                  className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  <Filter className={`${isArabic ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                  {t('APPLY_FILTER')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <DataTable
          data={users}
          columns={userColumns}
          onEdit={canEdit ? (user) => handleEditUser(user) : undefined}
          // onEdit={canEdit ? (user) => handleEditUser(user) : undefined}
          onDelete={canDelete ? (user) => handleDelete(user) : undefined}
        />
      </div>
    </>
  );
}

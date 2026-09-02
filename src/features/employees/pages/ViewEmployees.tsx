import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchEmployees, deleteEmployee } from '../api/employeeService';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { DataTable } from 'src/components/utilities/table/DataTable';
import axios from 'axios';
import { Button } from 'src/components/ui/button';
import Swal from 'sweetalert2';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import { Plus, Download, Filter, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from 'src/components/ui/input';
import { Check, ChevronsUpDown } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import employeesIcon from '../../../assets/images/logos/businessman.png';

export default function ViewEmployees() {
  const [employees, setEmployees] = useState([]);
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const canEdit = hasPermission('/employees', 'WRITE');
  const canAdd = hasPermission('/employees', 'CREATE');
  const canDelete = hasPermission('/employees', 'DELETE');
  const isArabic = i18n.language.startsWith('ar');

  const employeeColumns = [
    {
      accessorKey: 'employee_number',
      header: t('EMPLOYEE_NUMBER'),
    },
    {
      accessorKey: 'name_ar',
      header: t('EMPLOYEE_NAME_AR'),
    },
    {
      accessorKey: 'name_en',
      header: t('EMPLOYEE_NAME_EN'),
    },
    {
      accessorKey: 'email',
      header: t('EMAIL'),
    },
    {
      accessorKey: 'telephone_num',
      header: t('TELEPHONE_NUMBER'),
    },
    {
      accessorKey: 'street',
      header: t('STREET'),
    },
    {
      accessorKey: isArabic ? 'city_name_ar' : 'city_name_en',
      header: t('CITY'),
    },
    {
      accessorKey: isArabic ? 'governorate_name_ar' : 'governorate_name_en',
      header: t('GOVERNORATE'),
    },
  ];

  // const [visibleColumns, setVisibleColumns] = useState(employeeColumns.map((c) => c.accessorKey));

  // const displayedColumns = employeeColumns.filter((col) =>
  //   visibleColumns.includes(col.accessorKey),
  // );

  const {
    register: registerFilter,
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilters,
  } = useForm({
    defaultValues: {
      startHiringDate: null,
      endHiringDate: null,
      startBirthDate:null,
      endBirthDate:null,
      isTerminated:null,
    },
  });

  const handleEditEmployee = (employee: any) => {
    nav('/employees/edit', {
      state: { employee: employee },
    });
  };

  const loadEmployees = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await fetchEmployees(filters);
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // console.log(employees);

    const handleApplyFilters = async (filters: any) => {
    console.log('FILTERS:', filters);

    await loadEmployees(filters);

    setFilterOpen(false);
  };

  const handleReset = () => {
    resetFilters({
      startHiringDate: null,
      endHiringDate:null,
      startBirthDate:null,
      endBirthDate:null,
      isTerminated:null,
    });
  };


  const handleDelete = async (employee: any) => {
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
      await deleteEmployee(employee.id);

      await Swal.fire({
        title: t('DELETED'),
        text: t('EMPLOYEE_DELETED_SUCCESSFULLY'),
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      await loadEmployees();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message;

        if (status === 409) {
          await Swal.fire({
            icon: 'error',
            title: t('ERROR'),
            text: t(message),
            confirmButtonText: t('OK'),
          });

          return;
        }

        console.error('Delete employee error:', error.response?.data);
      } else {
        console.error('Unexpected error:', error);
      }

      await Swal.fire({
        title: t('ERROR'),
        text: t('EMPLOYEE_DELETE_FAILED'),
        icon: 'error',
        confirmButtonText: t('OK'),
      });
    }
  };

  return (
    <>
      <BreadcrumbComp title={t('EMPLOYEES_TABLE')} breadCrumbBg={employeesIcon} />
      <div className="flex gap-6 flex-col ">
        {canAdd && (
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => nav('/employees/new-employee')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('ADD_EMPLOYEE')}
            </Button>

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
        )}

        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Display Columns</Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {employeeColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.accessorKey}
                checked={visibleColumns.includes(column.accessorKey)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setVisibleColumns((prev) => [...prev, column.accessorKey]);
                  } else {
                    setVisibleColumns((prev) => prev.filter((c) => c !== column.accessorKey));
                  }
                }}
              >
                {column.header}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu> */}
     <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
  <DialogContent
     dir={isArabic ? 'rtl' : 'ltr'}
  className={`sm:max-w-[420px] ${
    isArabic ? '[&>button]:right-auto [&>button]:left-4' : ''
  }`}
  >
    <DialogHeader>
      <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
        {t('FILTER_EMPLOYEES')}
      </DialogTitle>
    </DialogHeader>

    <form
      onSubmit={handleFilterSubmit(handleApplyFilters)}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Hiring Date */}
      <div className="mb-3">
        <Label className="text-sm font-medium">
          {t('HIRING_DATE')}
        </Label>

        <div className="mt-2 grid grid-cols-2 gap-3">
          {/* From */}
          <Controller
            name="startHiringDate"
            control={filterControl}
            render={({ field }) => (
              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400">
                  {t('FROM')}
                </Label>

                <Input
                  type="date"
                  {...field}
                  value={field.value || ''}
                  className="mt-1 w-full"
                />
              </div>
            )}
          />

          {/* To */}
          <Controller
            name="endHiringDate"
            control={filterControl}
            render={({ field }) => (
              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400">
                  {t('TO')}
                </Label>

                <Input
                  type="date"
                  {...field}
                  value={field.value || ''}
                  className="mt-1 w-full"
                />
              </div>
            )}
          />
        </div>
      </div>

      {/* Birth Date */}
      <div className="mb-6">
        <Label className="text-sm font-medium">
          {t('BIRTH_DATE')}
        </Label>

        <div className="mt-2 grid grid-cols-2 gap-3">
          {/* From */}
          <Controller
            name="startBirthDate"
            control={filterControl}
            render={({ field }) => (
              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400">
                  {t('FROM')}
                </Label>

                <Input
                  type="date"
                  {...field}
                  value={field.value || ''}
                  className="mt-1 w-full"
                />
              </div>
            )}
          />

          {/* To */}
          <Controller
            name="endBirthDate"
            control={filterControl}
            render={({ field }) => (
              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400">
                  {t('TO')}
                </Label>

                <Input
                  type="date"
                  {...field}
                  value={field.value || ''}
                  className="mt-1 w-full"
                />
              </div>
            )}
          />
        </div>
      </div>

      {/* Employment Status */}
      <Controller
        name="isTerminated"
        control={filterControl}
        render={({ field }) => (
          <div>
            <Label>{t('EMPLOYMENT_STATUS')}</Label>

            <Select
              value={
                field.value === null || field.value === undefined
                  ? 'all'
                  : String(field.value)
              }
              onValueChange={(value) => {
                field.onChange(value === 'all' ? null : Number(value));
              }}
            >
              <SelectTrigger className="mt-2 w-full" dir={isArabic ? 'rtl' : 'ltr'}>
                <SelectValue placeholder={t('SELECT_STATUS')} />
              </SelectTrigger>

              <SelectContent dir={isArabic ? 'rtl' : 'ltr'}>
                <SelectItem value="all">{t('ALL')}</SelectItem>
                <SelectItem value="0">{t('ACTIVE')}</SelectItem>
                <SelectItem value="1">{t('TERMINATED')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      />

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
          data={employees}
          columns={employeeColumns}
          onEdit={canEdit ? (employee) => handleEditEmployee(employee) : undefined}
          onDelete={canDelete ? (employee) => handleDelete(employee) : undefined}
        />
      </div>
    </>
  );
}

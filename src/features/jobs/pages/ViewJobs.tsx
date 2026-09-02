import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchJobs, deleteJob } from '../api/jobService';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { DataTable } from 'src/components/utilities/table/DataTable';
import { Button } from 'src/components/ui/button';
import axios from 'axios';
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
import Swal from 'sweetalert2';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import userIcon from '../../../assets/images/logos/working.png';
import jobIcon from '../../../assets/images/logos/job-offer.png';
import { useAuth } from 'src/features/auth/hooks/useAuth';

export default function ViewJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, hasPermission } = useAuth();
  const canEdit = hasPermission('/jobs', 'WRITE');
  const canDelete = hasPermission('/jobs', 'DELETE');
  const canAdd = hasPermission('/jobs', 'CREATE');
  const isArabic = i18n.language.startsWith('ar');

  const jobColumns = [
    {
      accessorKey: 'title_en',
      header: t('JOB_TITLE_EN'),
    },
    {
      accessorKey: 'title_ar',
      header: t('JOB_TITLE_AR'),
    },
    {
      accessorKey: 'code',
      header: t('JOB_CODE'),
    },
  ];

  const {
    register: registerFilter,
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilters,
  } = useForm({
    defaultValues: {
      isZoneMandatory: null,
    },
  });

  const handleEditJob = (job: any) => {
    nav('/jobs/edit', {
      state: { job: job },
    });
  };

  const loadJobs = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await fetchJobs(filters);
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleApplyFilters = async (filters: any) => {
    console.log('FILTERS:', filters);

    await loadJobs(filters);

    setFilterOpen(false);
  };

  const handleReset = () => {
    resetFilters({
      isZoneMandatory: null,
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
      await deleteJob(employee.id);

      await Swal.fire({
        title: t('DELETED'),
        text: t('JOB_DELETED_SUCCESSFULLY'),
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      await loadJobs();
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

        console.error('Delete job error:', error.response?.data);
      } else {
        console.error('Unexpected error:', error);
      }

      await Swal.fire({
        title: t('ERROR'),
        text: t('JOB_DELETE_FAILED'),
        icon: 'error',
        confirmButtonText: t('OK'),
      });
    }
  };

  return (
    <>
      <BreadcrumbComp title={t('JOBS_TABLE')} breadCrumbBg={jobIcon} />
      <div className="flex gap-6 flex-col ">
        <div className="flex justify-end gap-2">
          {canAdd && (
            <Button
              onClick={() => nav('/jobs/new-job')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('ADD_JOB')}
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
{filterOpen && (
  <form
    onSubmit={handleFilterSubmit(handleApplyFilters)}
    dir={isArabic ? 'rtl' : 'ltr'}
    className={`absolute top-12 z-50 w-[420px] rounded-xl border
      bg-white p-5 shadow-xl
      text-gray-900
      border-gray-200
      dark:bg-gray-900
      dark:text-gray-100
      dark:border-gray-700
      ${isArabic ? 'left-0' : 'right-0'}`}
  >
    {/* Header */}
    <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
      <div className={isArabic ? 'text-right' : 'text-left'}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('FILTER_JOBS')}
        </h3>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setFilterOpen(false)}
        className="
          h-8 w-8 shrink-0 rounded-full
          text-gray-500
          hover:bg-gray-100
          hover:text-gray-900
          dark:text-gray-400
          dark:hover:bg-gray-800
          dark:hover:text-gray-100
        "
      >
        <X className="h-4 w-4" />
      </Button>
    </div>

 

{/* Employment Status */}
<Controller
  name="isZoneMandatory"
  control={filterControl}
  render={({ field }) => (
    <div>
      <Label>{t('ZONE_STATUS')}</Label>

      <Select
        value={
          field.value === null || field.value === undefined
            ? 'all'
            : String(field.value)
        }
        onValueChange={(value) => {
          field.onChange(
            value === 'all'
              ? null
              : Number(value)
          );
        }}
      >
        <SelectTrigger className="mt-2 w-full" dir={isArabic ? 'rtl' : 'ltr'}>
          <SelectValue placeholder={t('SELECT_STATUS')} />
        </SelectTrigger>

        <SelectContent dir={isArabic ? 'rtl' : 'ltr'}>
          <SelectItem value="all">
            {t('ALL')}
          </SelectItem>

          <SelectItem value="0">
            {t('NO')}
          </SelectItem>

          <SelectItem value="1">
            {t('YES')}
          </SelectItem>
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
        className="
          border-red-300
          bg-white
          text-red-600
          hover:bg-red-50
          hover:text-red-700

          dark:border-red-500/50
          dark:bg-gray-800
          dark:text-red-400
          dark:hover:bg-red-950/40
          dark:hover:text-red-300

          transition-colors duration-200
        "
      >
        {t('RESET')}
      </Button>

      <Button
        type="submit"
        className="
          bg-slate-900
          text-white
          hover:bg-slate-800
          dark:bg-slate-100
          dark:text-slate-900
          dark:hover:bg-white
        "
      >
        <Filter className={`${isArabic ? 'ml-2' : 'mr-2'} h-4 w-4`} />
        {t('APPLY_FILTER')}
      </Button>
    </div>
  </form>
)}
        <DataTable
          data={jobs}
          columns={jobColumns}
          onEdit={
            canEdit
              ? (job) => {
                  handleEditJob(job);
                }
              : undefined
          }
          onDelete={
            canDelete
              ? (job) => {
                  handleDelete(job);
                }
              : undefined
          }
        />
      </div>
    </>
  );
}

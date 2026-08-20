import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchJobs, deleteJob } from '../api/jobService';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { DataTable } from 'src/components/utilities/table/DataTable';
import { Button } from 'src/components/ui/button';
import { Plus } from 'lucide-react';

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
  const nav = useNavigate();
  const { t,i18n } = useTranslation();
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
    {
      accessorKey: 'is_zone_mandatory',
      header: t('IS_ZONE_MANDATORY'),
    },
  ];

  const handleEditJob = (job: any) => {
    nav('/jobs/edit', {
      state: { job: job },
    });
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await fetchJobs();
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
        title: 'Deleted!',
        text: 'The job has been deleted successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      await loadJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);

      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete the job.',
        icon: 'error',
      });
    }
  };

  return (
    <>
      <BreadcrumbComp title={t('JOBS_TABLE')} breadCrumbBg={jobIcon} />
      <div className="flex gap-6 flex-col ">
        <div className="flex justify-end">
          {canAdd && (
            <Button
              onClick={() => nav('/jobs/new-job')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('ADD_JOB')}
            </Button>
          )}
        </div>
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

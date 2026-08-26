import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchPrograms,deleteProgram } from '../api/programService';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { DataTable } from 'src/components/utilities/table/DataTable';
import axios from 'axios';
import { Button } from 'src/components/ui/button';
import { Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import rolesIcon from '../../../assets/images/logos/roles.png';
import { useAuth } from 'src/features/auth/hooks/useAuth';


export default function ViewPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { t,i18n } = useTranslation();
  const { hasPermission } = useAuth();
  const canAdd = hasPermission('/programs', 'CREATE');
  const canEdit = hasPermission('/programs', 'WRITE');
  const canDelete = hasPermission('/programs', 'DELETE');
   const isArabic = i18n.language.startsWith('ar');

  const roleColumns = [
  {
    accessorKey:'name_en',
    header: t("PROGRAM_NAME_EN"),
  },
   {
    accessorKey:'name_ar',
    header: t("PROGRAM_NAME_AR"),
  },
];


   const handleEditProgram = (program: any) => {
    nav('/programs/edit', {
      state: { program: program },
    });
  };

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const response = await fetchPrograms();
      setPrograms(response.data);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleDelete = async (program: any) => {
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
      await deleteProgram(program.id);

      await Swal.fire({
        title: t('DELETED'),
        text: t('PROGRAM_DELETED_SUCCESSFULLY'),
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      await loadPrograms();
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

        console.error('Delete program error:', error.response?.data);
      } else {
        console.error('Unexpected error:', error);
      }

      await Swal.fire({
        title: t('ERROR'),
        text: t('PROGRAM_DELETE_FAILED'),
        icon: 'error',
        confirmButtonText: t('OK'),
      });
    }
  };
  return (
    <>
      <BreadcrumbComp title={t("PROGRAMS_TABLE")} breadCrumbBg={rolesIcon} />
      <div className="flex gap-6 flex-col ">
        <div className="flex justify-end">
          {canAdd && (
            <Button
              onClick={() => nav('/programs/new-program')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("ADD_PROGRAM")}
            </Button>
          )}
        </div>

        <DataTable
          data={programs}
          columns={roleColumns}
          onEdit={canEdit? (program) => handleEditProgram(program) : undefined}
          onDelete={canDelete ? (program)=> handleDelete(program): undefined}
        />
      </div>
    </>
  );
}

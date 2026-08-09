import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchRoles, deleteRole } from '../api/roleService';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { DataTable } from 'src/components/utilities/table/DataTable';
import axios from 'axios';
import { Button } from 'src/components/ui/button';
import { Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import rolesIcon from '../../../assets/images/logos/roles.png';

const roleColumns = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name_en',
    header: 'Name En',
  },
  {
    accessorKey: 'name_ar',
    header: 'Name Ar',
  },
];

export default function ViewRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { t } = useTranslation();

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await fetchRoles();
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleDelete = async (role: any) => {
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
      await deleteRole(role.id);

      await Swal.fire({
        title: t('DELETED'),
        text: t('ROLE_DELETED_SUCCESSFULLY'),
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      await loadRoles();
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

        console.error('Delete role error:', error.response?.data);
      } else {
        console.error('Unexpected error:', error);
      }

      await Swal.fire({
        title: t('ERROR'),
        text: t('ROLE_DELETE_FAILED'),
        icon: 'error',
        confirmButtonText: t('OK'),
      });
    }
  };
  return (
    <>
      <BreadcrumbComp title="Roles Table" breadCrumbBg={rolesIcon} />
      <div className="flex gap-6 flex-col ">
        <div className="flex justify-end">
          <Button
            onClick={() => nav('/roles/new-role')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </div>

        <DataTable
          data={roles}
          columns={roleColumns}
          onEdit={(role) => {
            nav(`/roles/${role.id}`);
          }}
          onDelete={(role) => {
            handleDelete(role);
          }}
        />
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchZones, deleteZone } from '../../zones/api/zoneService';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { DataTable } from 'src/components/utilities/table/DataTable';
import { Button } from 'src/components/ui/button';
import { Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import userIcon from '../../../assets/images/logos/working.png';
import zoneIcon from '../../../assets/images/logos/zones.png';
import axios from 'axios';
import { useAuth } from 'src/features/auth/hooks/useAuth';

export default function ViewUsers() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const { hasPermission } = useAuth();
  const canAdd = hasPermission('/zones', 'CREATE');
  const canEdit = hasPermission('/zones', 'WRITE');
  const canDelete = hasPermission('/zones', 'DELETE');
  const isArabic = i18n.language.startsWith('ar');

  const zoneColumns = [
    {
      accessorKey: 'name_en',
      header: t('ZONE_NAME_EN'),
    },
    {
      accessorKey: 'name_ar',
      header: t('ZONE_NAME_AR'),
    },
  ];

  const handleEditZone = (zone: any) => {
    nav('/zones/edit', {
      state: { zone: zone },
    });
  };

  const loadZones = async () => {
    try {
      setLoading(true);
      const response = await fetchZones();
      setZones(response.data);
    } catch (error) {
      console.error('Failed to fetch zones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

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
      await deleteZone(user.id);

      await Swal.fire({
        title: t('DELETED'),
        text: t('ZONE_DELETED_SUCCESSFULLY'),
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      await loadZones();
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

        console.error('Delete zone error:', error.response?.data);
      } else {
        console.error('Unexpected error:', error);
      }

      await Swal.fire({
        title: t('ERROR'),
        text: t('ZONE_DELETE_FAILED'),
        icon: 'error',
        confirmButtonText: t('OK'),
      });
    }
  };
  return (
    <>
      <BreadcrumbComp title={t('ZONES_TABLE')} breadCrumbBg={zoneIcon} />
      <div className="flex gap-6 flex-col ">
        {canAdd && (
          <div className="flex justify-end">
            <Button
              onClick={() => nav('/zones/new-zone')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('ADD_ZONE')}
            </Button>
          </div>
        )}

        <DataTable
          data={zones}
          columns={zoneColumns}
          onEdit={canEdit ? (zone) => handleEditZone(zone) : undefined}
          onDelete={canDelete ? (zone) => handleDelete(zone) : undefined}
        />
      </div>
    </>
  );
}

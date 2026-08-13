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
import { useAuth } from 'src/features/auth/hooks/useAuth';

const zoneColumns = [
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

export default function ViewUsers() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canAdd = hasPermission('/zones', 'CREATE');
  const canEdit = hasPermission('/zones', 'WRITE');
  const canDelete = hasPermission('/zones', 'DELETE');

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
      title: 'Are you sure?',
      text: "You won't be able to undo this action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteZone(user.id);

      await Swal.fire({
        title: 'Deleted!',
        text: 'The zone has been deleted successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      await loadZones();
    } catch (error) {
      console.error('Failed to delete zone:', error);

      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete the zone.',
        icon: 'error',
      });
    }
  };
  return (
    <>
      <BreadcrumbComp title="Zones Table" breadCrumbBg={zoneIcon} />
      <div className="flex gap-6 flex-col ">
        {canAdd && (
          <div className="flex justify-end">
            <Button
              onClick={() => nav('/zones/new-zone')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Zone
            </Button>
          </div>
        )}

        

        <DataTable
          data={zones}
          columns={zoneColumns}
          onEdit={canEdit ? (zone) => nav(`/zones/${zone.id}`) : undefined}
          onDelete={canDelete ? (zone) => handleDelete(zone) : undefined}
        />
      </div>
    </>
  );
}

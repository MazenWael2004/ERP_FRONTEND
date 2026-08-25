import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchCustomers,deleteCustomer } from '../api/customerService';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { DataTable } from 'src/components/utilities/table/DataTable';
import { Button } from 'src/components/ui/button';
import { Plus } from 'lucide-react';

import Swal from 'sweetalert2';
import jobIcon from '../../../assets/images/logos/job-offer.png';
import { useAuth } from 'src/features/auth/hooks/useAuth';

export default function ViewJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { t,i18n } = useTranslation();
  const { user, hasPermission } = useAuth();
  const canEdit = hasPermission('/customers', 'WRITE');
  const canDelete = hasPermission('/customers', 'DELETE');
  const canAdd = hasPermission('/customers', 'CREATE');
  const isArabic = i18n.language.startsWith('ar');

  const customerColumns = [
  
    {
      accessorKey: 'name_en',
      header: t('CUSTOMER_NAME_EN'),
    },
    {
      accessorKey: 'name_ar',
      header: t('CUSTOMER_NAME_AR'),
    },
     {
      accessorKey: 'code',
      header: t('CUSTOMER_CODE'),
    },
     {
      accessorKey: isArabic?'zone_name_ar':'zone_name_en',
      header: t('ZONE'),
    },
     
     {
      accessorKey: isArabic?'program_name_ar':'program_name_en',
      header: t('PROGRAM'),
    },
  ];

  const handleEditCustomer = (customer: any) => {
    nav('/customers/edit', {
      state: { customer: customer },
    });
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetchCustomers();
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDelete = async (customer: any) => {
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
      await deleteCustomer(customer.id);

      await Swal.fire({
        title: t("DELETED"),
        text: t("CUSTOMER_DELETED_SUCCESSFULLY"),
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      await loadCustomers();
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
      <BreadcrumbComp title={t('CUSTOMERS_TABLE')} breadCrumbBg={jobIcon} />
      <div className="flex gap-6 flex-col ">
        <div className="flex justify-end">
          {canAdd && (
            <Button
              onClick={() => nav('/customers/new-customer')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('ADD_CUSTOMER')}
            </Button>
          )}
        </div>
        <DataTable
          data={jobs}
          columns={customerColumns}
          onEdit={
            canEdit
              ? (customer) => {
                  handleEditCustomer(customer);
                }
              : undefined
          }
           onDelete={
             canDelete
               ? (customer) => {
                   handleDelete(customer);
                }
               : undefined
          }
        />
      </div>
    </>
  );
}

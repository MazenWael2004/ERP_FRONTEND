import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { DataTable } from 'src/components/utilities/table/DataTable';
import { Button } from 'src/components/ui/button';
import { Plus, Check, X } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import contractsIcon from '../../../assets/images/logos/roles.png';
import { useAuth } from 'src/features/auth/hooks/useAuth';

export default function ViewContracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  const { t } = useTranslation();
  const { hasPermission } = useAuth();

  const canAdd = hasPermission('/contracts', 'CREATE');
  const canEdit = hasPermission('/contracts', 'WRITE');
  const canDelete = hasPermission('/contracts', 'DELETE');

  // Contract approval/rejection permissions
  const canApprove = hasPermission('/contracts', 'APPROVE');
  const canReject = hasPermission('/contracts', 'REJECT');

  /*
   * Temporary mock data.
   */
  const mockContracts = [
    {
      id: 1,
      contract_number: 'CNT-2026-0001',
      contract_date: '2026-09-01',
      customer_name: 'El Shorouk Pharmacy',
      branch_name: 'El Shorouk Main Branch',
      representative_name: 'Ahmed Hassan',
      plan_name: 'Gold',
      joining_fee: 10000,
      down_payment_paid: 7000,
      remaining_amount: 3000,
      status: 'ACTIVE',
    },
    {
      id: 2,
      contract_number: 'CNT-2026-0002',
      contract_date: '2026-09-03',
      customer_name: 'Care Plus Pharmacies',
      branch_name: 'Nasr City Branch',
      representative_name: 'Mohamed Ali',
      plan_name: 'Silver',
      joining_fee: 10000,
      down_payment_paid: 10000,
      remaining_amount: 0,
      status: 'ACTIVE',
    },
    {
      id: 3,
      contract_number: 'CNT-2026-0003',
      contract_date: '2026-09-05',
      customer_name: 'Life Care Pharmacy',
      branch_name: 'Heliopolis Branch',
      representative_name: 'Omar Khaled',
      plan_name: 'Gold',
      joining_fee: 10000,
      down_payment_paid: 5000,
      remaining_amount: 5000,
      status: 'PENDING',
    },
    {
      id: 4,
      contract_number: 'CNT-2026-0004',
      contract_date: '2026-09-07',
      customer_name: 'United Pharmacies',
      branch_name: 'Maadi Branch',
      representative_name: 'Ahmed Hassan',
      plan_name: 'Silver',
      joining_fee: 10000,
      down_payment_paid: 10000,
      remaining_amount: 0,
      status: 'ACTIVE',
    },
    {
      id: 5,
      contract_number: 'CNT-2026-0005',
      contract_date: '2026-09-09',
      customer_name: 'Al Amal Pharmacy',
      branch_name: 'Dokki Branch',
      representative_name: 'Youssef Samir',
      plan_name: 'Gold',
      joining_fee: 10000,
      down_payment_paid: 3000,
      remaining_amount: 7000,
      status: 'PENDING',
    },
    {
      id: 6,
      contract_number: 'CNT-2026-0006',
      contract_date: '2026-09-10',
      customer_name: 'Healthy Life Pharmacy',
      branch_name: '6th October Branch',
      representative_name: 'Mohamed Ali',
      plan_name: 'Silver',
      joining_fee: 10000,
      down_payment_paid: 10000,
      remaining_amount: 0,
      status: 'ACTIVE',
    },
  ];

  const handleEditContract = (contract: any) => {
    nav('/contracts/edit', {
      state: {
        contract,
      },
    });
  };

  const handleApprove = async (contract: any) => {
    const result = await Swal.fire({
      title: t('APPROVE_CONTRACT'),
      text: t('ARE_YOU_SURE_APPROVE_CONTRACT'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('YES_APPROVE'),
      cancelButtonText: t('CANCEL'),
    });

    if (!result.isConfirmed) return;

    try {
      /*
       * TODO:
       *
       * await approveContract(contract.id);
       *
       * When the API is ready, replace the local update
       * with the API call.
       */

      setContracts((current) =>
        current.map((item) =>
          item.id === contract.id
            ? {
                ...item,
                status: 'ACTIVE',
              }
            : item
        )
      );

      await Swal.fire({
        title: t('APPROVED'),
        text: t('CONTRACT_APPROVED_SUCCESSFULLY'),
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Approve contract error:', error.response?.data);
      } else {
        console.error('Unexpected error:', error);
      }

      await Swal.fire({
        title: t('ERROR'),
        text: t('CONTRACT_APPROVE_FAILED'),
        icon: 'error',
        confirmButtonText: t('OK'),
      });
    }
  };

  const handleReject = async (contract: any) => {
    const result = await Swal.fire({
      title: t('REJECT_CONTRACT'),
      text: t('ARE_YOU_SURE_REJECT_CONTRACT'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('YES_REJECT'),
      cancelButtonText: t('CANCEL'),
    });

    if (!result.isConfirmed) return;

    try {
      /*
       * TODO:
       *
       * await rejectContract(contract.id);
       */

      setContracts((current) =>
        current.map((item) =>
          item.id === contract.id
            ? {
                ...item,
                status: 'REJECTED',
              }
            : item
        )
      );

      await Swal.fire({
        title: t('REJECTED'),
        text: t('CONTRACT_REJECTED_SUCCESSFULLY'),
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Reject contract error:', error.response?.data);
      } else {
        console.error('Unexpected error:', error);
      }

      await Swal.fire({
        title: t('ERROR'),
        text: t('CONTRACT_REJECT_FAILED'),
        icon: 'error',
        confirmButtonText: t('OK'),
      });
    }
  };

  const handleDelete = async (contract: any) => {
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
      /*
       * TODO:
       *
       * await deleteContract(contract.id);
       */

      setContracts((current) =>
        current.filter((item) => item.id !== contract.id)
      );

      await Swal.fire({
        title: t('DELETED'),
        text: t('CONTRACT_DELETED_SUCCESSFULLY'),
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message;

        if (status === 409) {
          await Swal.fire({
            icon: 'error',
            title: t('ERROR'),
            text: message
              ? t(message)
              : t('CONTRACT_DELETE_FAILED'),
            confirmButtonText: t('OK'),
          });

          return;
        }

        console.error(
          'Delete contract error:',
          error.response?.data
        );
      } else {
        console.error('Unexpected error:', error);
      }

      await Swal.fire({
        title: t('ERROR'),
        text: t('CONTRACT_DELETE_FAILED'),
        icon: 'error',
        confirmButtonText: t('OK'),
      });
    }
  };

  const contractColumns = [
    {
      accessorKey: 'contract_number',
      header: t('CONTRACT_NUMBER'),
    },
    {
      accessorKey: 'customer_name',
      header: t('CUSTOMER'),
    },
    {
      accessorKey: 'branch_name',
      header: t('BRANCH'),
    },
    {
      accessorKey: 'contract_date',
      header: t('CONTRACT_DATE'),
    },
    {
      accessorKey: 'representative_name',
      header: t('REPRESENTATIVE'),
    },
    {
      accessorKey: 'plan_name',
      header: t('PLAN'),
      cell: ({ row }: any) => {
        const plan = row.original.plan_name;

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              plan === 'Gold'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {plan}
          </span>
        );
      },
    },
    {
      accessorKey: 'joining_fee',
      header: t('JOINING_FEE'),
      cell: ({ row }: any) =>
        `${Number(
          row.original.joining_fee
        ).toLocaleString()} EGP`,
    },
    {
      accessorKey: 'down_payment_paid',
      header: t('DOWN_PAYMENT_PAID'),
      cell: ({ row }: any) =>
        `${Number(
          row.original.down_payment_paid
        ).toLocaleString()} EGP`,
    },
    {
      accessorKey: 'remaining_amount',
      header: t('REMAINING_AMOUNT'),
      cell: ({ row }: any) => {
        const amount = row.original.remaining_amount;

        return (
          <span
            className={
              amount > 0
                ? 'font-medium text-red-600'
                : 'font-medium text-green-600'
            }
          >
            {Number(amount).toLocaleString()} EGP
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: t('STATUS'),
      cell: ({ row }: any) => {
        const status = row.original.status;

        const styles: Record<string, string> = {
          ACTIVE: 'bg-green-100 text-green-800',
          PENDING: 'bg-yellow-100 text-yellow-800',
          REJECTED: 'bg-red-100 text-red-800',
          CANCELLED: 'bg-red-100 text-red-800',
          COMPLETED: 'bg-blue-100 text-blue-800',
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              styles[status] ||
              'bg-gray-100 text-gray-800'
            }`}
          >
            {t(status)}
          </span>
        );
      },
    },
    {
      id: 'approval_actions',
      header: t('APPROVAL'),
      cell: ({ row }: any) => {
        const contract = row.original;

        // Approval actions are only relevant for pending contracts
        if (contract.status !== 'PENDING') {
          return (
            <span className="text-gray-400 text-sm">
              -
            </span>
          );
        }

        return (
          <div className="flex items-center gap-2">
            {canApprove && (
              <Button
                size="sm"
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => handleApprove(contract)}
              >
                <Check className="mr-1 h-4 w-4" />
                {t('APPROVE')}
              </Button>
            )}

            {canReject && (
              <Button
                size="sm"
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => handleReject(contract)}
              >
                <X className="mr-1 h-4 w-4" />
                {t('REJECT')}
              </Button>
            )}

            {!canApprove && !canReject && (
              <span className="text-gray-400 text-sm">
                -
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const loadContracts = async () => {
    try {
      setLoading(true);

      /*
       * TODO:
       *
       * const response = await fetchContracts();
       * setContracts(response.data);
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      setContracts(mockContracts);
    } catch (error) {
      console.error(
        'Failed to fetch contracts:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const handleAddContract = () => {
    nav('/contracts/new-contract');
  };

  return (
    <>
      <BreadcrumbComp
        title={t('CONTRACTS_TABLE')}
        breadCrumbBg={contractsIcon}
      />

      <div className="flex gap-6 flex-col">
        <div className="flex justify-end">
          {canAdd && (
            <Button
              onClick={handleAddContract}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('ADD_CONTRACT')}
            </Button>
          )}
        </div>

        <DataTable
          data={contracts}
          columns={contractColumns}
          onEdit={
            canEdit
              ? (contract) =>
                  handleEditContract(contract)
              : undefined
          }
          onDelete={
            canDelete
              ? (contract) =>
                  handleDelete(contract)
              : undefined
          }
        />
      </div>
    </>
  );
}


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchUsers, deleteUser } from '../../users/api/userService';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { DataTable } from 'src/components/utilities/table/DataTable';
import { useAuth } from 'src/features/auth/hooks/useAuth';
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

const userColumns = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'username',
    header: 'Username',
  },
  {
    accessorKey: 'employee_name',
    header: 'Employee Name',
  },
];

export default function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  // HARDCODED FIX LATER.......
  const canEdit = hasPermission('/users', 'WRITE');
  const canDelete = hasPermission('/users', 'DELETE');
  const canAdd = hasPermission('/users', 'CREATE');
  const handleEditUser = (user: any) => {
    nav('/users/edit', {
      state: { user: user },
    });
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchUsers();
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
      await deleteUser(user.id);

      await Swal.fire({
        title: 'Deleted!',
        text: 'The user has been deleted successfully.',
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
      <BreadcrumbComp title="Users Table" breadCrumbBg={userIcon} />
      <div className="flex gap-6 flex-col ">
        <div className="flex justify-end">
          {/* HARDCODED FIX LATER..... */}
          {canAdd && (
            <Button
              onClick={() => nav('/users/new-user')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
        </div>

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

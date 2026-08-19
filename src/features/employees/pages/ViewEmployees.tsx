import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchEmployees, deleteEmployee } from '../api/employeeService';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { DataTable } from 'src/components/utilities/table/DataTable';
import { Button } from 'src/components/ui/button';
import { Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import employeesIcon from '../../../assets/images/logos/businessman.png';

const employeeColumns = [
  {
    accessorKey: 'employee_number',
    header: 'Employee Number',
  },
  {
    accessorKey: 'name_en',
    header: 'English Name',
  },
  {
    accessorKey: 'name_ar',
    header: 'Arabic Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'telephone_num',
    header: 'Telephone Number',
  },
  {
    accessorKey: 'street',
    header: 'Street',
  },
  {
    accessorKey: 'city',
    header: 'City',
  },
  {
    accessorKey: 'is_terminated',
    header: 'isTerminated',
  },
];

export default function ViewEmployees() {
  const [employees, setEmployees] = useState([]);
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { t } = useTranslation();
  const [selectedRows, setSelectedRows] = useState([]);
  const canEdit = hasPermission('/employees', 'WRITE');
  const canAdd = hasPermission('/employees', 'CREATE');
  const canDelete = hasPermission('/employees', 'DELETE');
  // const [visibleColumns, setVisibleColumns] = useState(employeeColumns.map((c) => c.accessorKey));

  // const displayedColumns = employeeColumns.filter((col) =>
  //   visibleColumns.includes(col.accessorKey),
  // );

  const handleEditEmployee = (employee: any) => {
    nav('/employees/edit', {
      state: { employee: employee },
    });
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetchEmployees();
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

  const handleDelete = async (employee: any) => {
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
      await deleteEmployee(employee.id);

      await Swal.fire({
        title: 'Deleted!',
        text: 'The employee has been deleted successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      await loadEmployees();
    } catch (error) {
      console.error('Failed to delete employee:', error);

      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete the employee.',
        icon: 'error',
      });
    }
  };

  return (
    <>
      <BreadcrumbComp title="Employees Table" breadCrumbBg={employeesIcon} />
      <div className="flex gap-6 flex-col ">
        {canAdd && (
          <div className="flex justify-end">
            <Button
              onClick={() => nav('/employees/new-employee')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
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

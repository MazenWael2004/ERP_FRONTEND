import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import axios from "axios";
import { getUserById, updateUser } from "../api/userService";
import { fetchEmployees } from "src/features/employees/api/employeeService";
import { useAuth } from '../../auth/hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from "sweetalert2";
import {fetchRoles} from "../../roles/api/roleService";
import { Icon } from '@iconify/react/dist/iconify.js';
import { Calendar } from 'src/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { Autocomplete, TextField } from "@mui/material";
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Select, SelectContent, SelectTrigger, SelectValue,SelectItem } from 'src/components/ui/select';
import { Button } from 'src/components/ui/button';
import { editUserSchema  } from "../validation";
import { useLocation } from 'react-router-dom';


function EditUser() {
  const { id } = useParams();
  const location = useLocation();
  const user = location.state?.user;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [employees,setEmployees] = useState([]);
  const {
  register,
  control,
  watch,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm({
  resolver: zodResolver(editUserSchema),
});



  useEffect(() => {
  if (!user) return;

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [userResponse, employeesResponse] = await Promise.all([
        getUserById(Number(user.id)),
        fetchEmployees(),
      ]);

      setEmployees(employeesResponse.data);

      reset({
        userName: userResponse.data.username,
        employeeId: userResponse.data.employee_id,
        roles: userResponse.data.roles,
      });
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 404
      ) {
        navigate("/404", { replace: true });
        return;
      }

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
}, [user?.id, reset, navigate]);

  const handleSave = async (data:any) => {
    if (!user) return;
    console.log(data);
    try {
      await updateUser(user.id,data);

      toast.success(t("USER_UPDATED_SUCCESSFULLY"));
      navigate("/users");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          await Swal.fire({
            icon: 'error',
            title: t('ERROR'),
            text: t(error.response?.data.error.message),
            confirmButtonText: t('OK'),
          });
          console.log(error.response?.data);
        } else if(error.response?.status === 404) {
          await Swal.fire({
            icon: 'error',
            title: t('ERROR'),
            text: t(error.response?.data.error.message),
            confirmButtonText: t('OK'),
          });
          console.log(error.response?.data);
        }
      } else {
        console.log('Unexpected error');
      }
    } 
  };

  useEffect(() => {
    async function loadRoles() {
      try {
        const response = await fetchRoles(); // your API
        setRoles(response.data);
      } catch (err) {
        console.error(err);
      }
    }
  
    loadRoles();
  }, []);
  
if (isLoading) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary" />

        <p className="text-sm text-gray-500">
          Loading user information...
        </p>
      </div>
    </div>
  );
}


   return (
    <form
      className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      onSubmit={handleSubmit(handleSave)}
    >
      <div>
        <Label htmlFor="userName">{t("USERNAME")}</Label>
        <Input id="userName" className="mt-2 w-full" {...register('userName')} />
        {errors.userName && (
          <span className="error-message">{t(errors.userName.message!)}</span>
        )}
      </div>

       <Controller
              name="employeeId"
              control={control}
              render={({ field }) => (
                <div>
                  <Label>Employee Name</Label>
      
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
      
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={String(employee.id)}>
                          {t('LANG') === 'ar' ? employee.name_ar : employee.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
      
                  {errors.employeeId && <span className="error-message">{t(errors.employeeId.message!)}</span>}
                </div>
              )}
            />

        <div className="form-group">
          <Controller
            name="roles"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <Autocomplete
                multiple
                options={roles}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) =>
                  option.name_en
                }
                value={roles.filter((r) => (field.value ?? []).includes(r.id))}
                onChange={(_, selectedRoles) => {
                  const ids = selectedRoles.map((r) => r.id);
                  field.onChange(ids);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("ROLE")}
                    error={!!errors.roles}
                    helperText={errors.roles ? t(errors.roles.message!) : ""}
                  />
                )}
              />
            )}
          />
        </div>



      {/* <div>
        <Label htmlFor="countries">Select Input</Label>
        <Select>
          <SelectTrigger className="mt-2 w-full">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>...</SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" className="mt-2 w-full" />
      </div> */}
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          Save
        </Button>
      </div>
    </form>
  );
}

export default EditUser;

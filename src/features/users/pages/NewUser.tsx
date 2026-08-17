import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../features/auth/hooks/useAuth.tsx';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema } from '../validation.ts';
import axios from 'axios';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'src/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { createUser } from '../api/userService.ts';
import Swal from 'sweetalert2';
import { fetchRoles } from '../../roles/api/roleService.ts';
import { fetchEmployees } from 'src/features/employees/api/employeeService.ts';
import { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from 'src/components/ui/select';
import { Button } from 'src/components/ui/button';

function NewUser() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { t } = useTranslation();
  const { user,hasPermission } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordFields, setPasswordFields] = useState(true);
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // console.log(user);

  const handleSave = async (data: any) => {
    setIsLoading(true);

    try {
      const result = await createUser(data);

      console.log(result);

      await Swal.fire({
        icon: 'success',
        title: t('SUCCESS'),
        text: t('USER_CREATED_SUCCESSFULLY'),
        confirmButtonText: t('OK'),
      });

      nav('/users');
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
        } else if (error.response?.status === 404) {
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
    } finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createUserSchema),
  });

  const [employees, setEmployees] = useState([]);
  const employeeId = watch('employeeId');

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await fetchRoles();
        setRoles(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadRoles();
  }, []);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await fetchEmployees();
        setEmployees(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadEmployees();
  }, []);

  return (
    <form
      className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      onSubmit={handleSubmit(handleSave)}
    >
      <div>
        <Label htmlFor="userName">
          {t('USERNAME')}
          <span className="ml-1 text-red-500">*</span>
        </Label>

        <Input id="userName" className="mt-2 w-full" {...register('userName')} />

        {errors.userName && <span className="error-message">{t(errors.userName.message!)}</span>}
      </div>

      {/* Passwords */}

      <div>
        <Label htmlFor="password">
          {t('PASSWORD')}
          <span className="ml-1 text-red-500">*</span>
        </Label>

        <div className="relative mt-2">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="w-full pr-10"
            {...register('password')}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
        absolute
        right-3
        top-1/2
        -translate-y-1/2
        text-gray-500
        hover:text-gray-700
        dark:hover:text-gray-300
      "
          >
            <Icon
              icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}
              width="20"
              height="20"
            />
          </button>
        </div>

        {errors.password && <span className="error-message">{t(errors.password.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="confirmPassword">
          {t('CONFIRM_PASSWORD')}
          <span className="ml-1 text-red-500">*</span>
        </Label>

        <div className="relative mt-2">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            className="w-full pr-10"
            {...register('confirmPassword')}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="
        absolute
        right-3
        top-1/2
        -translate-y-1/2
        text-gray-500
        hover:text-gray-700
        dark:hover:text-gray-300
      "
          >
            <Icon
              icon={showConfirmPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}
              width="20"
              height="20"
            />
          </button>
        </div>

        {errors.confirmPassword && (
          <span className="error-message">{t(errors.confirmPassword.message!)}</span>
        )}
      </div>

      {/* Roles */}
      <div>
        {t('ROLE')}
        <span className="ml-1 text-red-500">*</span>
        <Controller
          name="roles"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={roles}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option) => option.name_en}
              value={roles.filter((r) => (field.value ?? []).includes(r.id))}
              onChange={(_, selectedRoles) => field.onChange(selectedRoles.map((r) => r.id))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!!errors.roles}
                  helperText={errors.roles ? t(errors.roles.message!) : ''}
                />
              )}
            />
          )}
        />
      </div>

      <Controller
        name="employeeId"
        control={control}
        render={({ field }) => (
          <div>
            <Label>Employee Name
              <span className="ml-1 text-red-500">*</span>
            </Label>

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

            {errors.employeeId && (
              <span className="error-message">{t(errors.employeeId.message!)}</span>
            )}
          </div>
        )}
      />

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

export default NewUser;

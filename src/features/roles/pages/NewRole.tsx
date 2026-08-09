import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth.tsx';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoleSchema } from '../validation.ts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { createRole } from '../../roles/api/roleService.ts';
import Swal from 'sweetalert2';
import { fetchRoles } from '../../roles/api/roleService.ts';
import { useState } from 'react';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';

function NewRole() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  // console.log(user);

  const handleSave = async (data: any) => {
    setIsLoading(true);

    try {
      const result = await createRole(data);

      console.log(result);

      await Swal.fire({
        icon: 'success',
        title: t('SUCCESS'),
        text: t('ROLE_CREATED_SUCCESSFULLY'),
        confirmButtonText: t('OK'),
      });

      nav('/roles');
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createRoleSchema),
  });

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

  return (
    <form
      className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      onSubmit={handleSubmit(handleSave)}
    >
      <div>
        <Label htmlFor="roleNameEn">{t('ROLE_NAME_EN')}</Label>
        <Input id="roleNameEn" className="mt-2 w-full" {...register('roleNameEn')} />
        {errors.roleNameEn && (
          <span className="error-message">{t(errors.roleNameEn.message!)}</span>
        )}
      </div>

      <div>
        <Label htmlFor="roleNameAr">{t('ROLE_NAME_AR')}</Label>
        <Input id="roleNameAr" className="mt-2 w-full" {...register('roleNameAr')} />
        {errors.roleNameAr && (
          <span className="error-message">{t(errors.roleNameAr.message!)}</span>
        )}
      </div>

      <div>
        <Label htmlFor="route">{t('ROUTE')}</Label>
        <Input id="route" className="mt-2 w-full" {...register('route')} />
        {errors.route && (
          <span className="error-message">{t(errors.route.message!)}</span>
        )}
      </div>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          Save
        </Button>
      </div>
    </form>
  );
}

export default NewRole;

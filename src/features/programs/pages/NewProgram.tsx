import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth.tsx';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProgramSchema } from '../validation.ts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// check program exists later.....
import { createProgram,checkProgramExists } from '../api/programService.ts';
import { fetchPrograms } from 'src/features/programs/api/programService.ts';
import Swal from 'sweetalert2';
import { useState } from 'react';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';


function NewProgram() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createProgramSchema),
  });

  const name_en = watch('nameEn');
  const name_ar = watch('nameAr');
  const code  = watch("code")
  
    const checkFieldExists = async (
      field: 'name_en' | 'name_ar' | 'code',
      value: string,
      formField: 'nameEn' | 'nameAr' | 'code',
      errorMessage: string,
    ) => {
      try {
        const response = await checkProgramExists(field, value, null);
  
        console.log(`${field} response:`, response);
  
        if (response.exists) {
          setError(formField, {
            type: 'manual',
            message: errorMessage,
          });
        } else {
          clearErrors(formField);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    useEffect(() => {
      if (!name_en || name_en.trim() === '') {
        clearErrors('nameEn');
        return;
      }
  
      const timer = setTimeout(() => {
        checkFieldExists('name_en', name_en, 'nameEn', 'PROGRAM_NAME_EN_EXISTS');
      }, 500);
  
      return () => clearTimeout(timer);
    }, [name_en]);
  
    useEffect(() => {
      if (!name_ar || name_ar.trim() === '') {
        clearErrors('nameAr');
        return;
      }
  
      const timer = setTimeout(() => {
        checkFieldExists('name_ar', name_ar, 'nameAr', 'PROGRAM_NAME_AR_EXISTS');
      }, 500);
  
      return () => clearTimeout(timer);
    }, [name_ar]);

    useEffect(() => {
      if (!code || code.trim() === '') {
        clearErrors('code');
        return;
      }
  
      const timer = setTimeout(() => {
        checkFieldExists('code', code, 'code', 'PROGRAM_CODE_EXISTS');
      }, 500);
  
      return () => clearTimeout(timer);
    }, [code]);

  const handleSave = async (data: any) => {
    setIsLoading(true);
    console.log(data);

    try {
      await createProgram(data);

      await Swal.fire({
        icon: 'success',
        title: t('SUCCESS'),
        text: t('PROGRAM_CREATED_SUCCESSFULLY'),
        showConfirmButton: false,
        timer: 1500,
      });

      nav('/programs');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;

        console.log('Backend message:', message);

        if (t(message) === t('PROGRAM_NAME_EN_EXISTS')) {
          setError('nameEn', {
            type: 'server',
            message: 'PROGRAM_NAME_EN_EXISTS',
          });
          return;
        }

        if (t(message) === t('PROGRAM_NAME_AR_EXISTS')) {
          setError('nameAr', {
            type: 'server',
            message: 'PROGRAM_NAME_AR_EXISTS',
          });
          return;
        }

        if (t(message) === t('PROGRAM_CODE_EXISTS')) {
          setError('code', {
            type: 'server',
            message: 'PROGRAM_CODE_EXISTS',
          });
          return;
        }
      }

      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      onSubmit={handleSubmit(handleSave)}
    >
      <div>
        <Label htmlFor="nameEn">
          {t('PROGRAM_NAME_EN')} <span className="text-red-500">*</span>
        </Label>
        <Input id="nameEn" className="mt-2 w-full" {...register('nameEn')} />
        {errors.nameEn && <span className="error-message">{t(errors.nameEn.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="nameAr">
          {t('PROGRAM_NAME_AR')} <span className="text-red-500">*</span>
        </Label>
        <Input id="nameAr" className="mt-2 w-full" {...register('nameAr')} />
        {errors.nameAr && <span className="error-message">{t(errors.nameAr.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="code">
          {t('PROGRAM_CODE')} <span className="text-red-500">*</span>
        </Label>
        <Input id="code" className="mt-2 w-full" {...register('code')} />
        {errors.code && <span className="error-message">{t(errors.code.message!)}</span>}
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {t('SAVE')}
        </Button>
      </div>
    </form>
  );
}

export default NewProgram;

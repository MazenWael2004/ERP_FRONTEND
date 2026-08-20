import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth.tsx';
import { useEffect } from 'react';
import { useForm, } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createJobSchema } from '../validation.ts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { createJob,checkJobExists } from '../api/jobService.ts';
import Swal from 'sweetalert2';
import { fetchRoles } from '../../roles/api/roleService.ts';
import { useState } from 'react';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';
import Spinner from 'src/shared/components/Spinner.tsx';

function NewJob() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordFields, setPasswordFields] = useState(true);
  const [roles, setRoles] = useState([]);

  // console.log(user);

  const handleSave = async (data: any) => {
    setIsLoading(true);

    try {
      const result = await createJob(data);

      console.log(result);

      await Swal.fire({
        icon: 'success',
        title: t('SUCCESS'),
        text: t('JOB_CREATED_SUCCESSFULLY'),
        showConfirmButton:false,
        timer:1500,
      });

      nav('/jobs');
      // error.reponse?.status === 409
    } catch (error) {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;

        console.log("Backend message:", message);

        if (t(message) === t("JOB_CODE_ALREADY_EXISTS")) {
            setError("jobCode", {
                type: "server",
                message: "JOB_CODE_ALREADY_EXISTS",
            });
            return;
        }

        if (t(message) === t("JOB_TITLE_EN_ALREADY_EXISTS")) {
            setError("jobTitleEn", {
                type: "server",
                message: "JOB_TITLE_EN_ALREADY_EXISTS",
            });
            return;
        }

        if (t(message) === t("JOB_TITLE_AR_ALREADY_EXISTS")) {
            setError("jobTitleAr", {
                type: "server",
                message: "JOB_TITLE_AR_ALREADY_EXISTS",
            });
            return;
        }
    }

    console.error("Unexpected error:", error);
} finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createJobSchema),
  });

  const code = watch("jobCode");
  const title_en = watch("jobTitleEn");
  const title_ar = watch("jobTitleAr");

   const checkFieldExists = async (
    field: "code" | "title_en" | "title_ar",
    value: string,
    formField: "jobCode" | "jobTitleEn" | "jobTitleAr",
    errorMessage: string
  ) => {
    try {
      const response = await checkJobExists(field, value,null);
  
      console.log(`${field} response:`, response);
  
      if (response.exists) {
        setError(formField, {
          type: "manual",
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
    if (!code || code.trim() === "") {
      clearErrors("jobCode");
      return;
    }
  
    const timer = setTimeout(() => {
      checkFieldExists(
        "code",
        code,
        "jobCode",
        "JOB_CODE_ALREADY_EXISTS"
      );
    }, 500);
  
    return () => clearTimeout(timer);
  }, [code]);


  useEffect(() => {
    if (!title_en || title_en.trim() === "") {
      clearErrors("jobTitleEn");
      return;
    }
  
    const timer = setTimeout(() => {
      checkFieldExists(
        "title_en",
        title_en,
        "jobTitleEn",
        "JOB_TITLE_EN_ALREADY_EXISTS"
      );
    }, 500);
  
    return () => clearTimeout(timer);
  }, [title_en]);
  

  useEffect(() => {
    if (!title_ar || title_ar.trim() === "") {
      clearErrors("jobTitleAr");
      return;
    }
  
    const timer = setTimeout(() => {
      checkFieldExists(
        "title_ar",
        title_ar,
        "jobTitleAr",
        "JOB_TITLE_AR_ALREADY_EXISTS"
      );
    }, 500);
  
    return () => clearTimeout(timer);
  }, [title_ar]);
  
  


  // useEffect(() => {
  //   const loadRoles = async () => {
  //     try {
  //       const response = await fetchRoles();
  //       setRoles(response.data);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   loadRoles();
  // }, []);

  return (
    <form
      className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      onSubmit={handleSubmit(handleSave)}
    >
      <div>
        <Label htmlFor="jobCode">{t('JOB_CODE')} <span className="text-red-500">*</span></Label>
        <Input id="jobCode" className="mt-2 w-full" {...register('jobCode')} />
        {errors.jobCode && <span className="error-message">{t(errors.jobCode.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="jobTitleEn">{t('JOB_TITLE_EN')} <span className="text-red-500">*</span></Label>
        <Input id="jobTitleEn" className="mt-2 w-full" {...register('jobTitleEn')} />
        {errors.jobTitleEn && (
          <span className="error-message">{t(errors.jobTitleEn.message!)}</span>
        )}
      </div>

      <div>
        <Label htmlFor="jobTitleAr">{t('JOB_TITLE_AR')} <span className="text-red-500">*</span></Label>
        <Input id="jobTitleAr" className="mt-2 w-full" {...register('jobTitleAr')} />
        {errors.jobTitleAr && (
          <span className="error-message">{t(errors.jobTitleAr.message!)}</span>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Input
          id="isZoneMandatory"
          type="checkbox"
          className="h-4 w-4"
          {...register('isZoneMandatory')}
        />

        <Label htmlFor="isZoneMandatory">{t('IS_ZONE_MANDATORY')}</Label>
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {t("SAVE")}
        </Button>
      </div>
    </form>
  );
}

export default NewJob;

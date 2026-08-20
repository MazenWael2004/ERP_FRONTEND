import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getEmployeeById, updateEmployee, checkEmployeeExists } from '../api/employeeService';
import { useAuth } from '../../auth/hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEmployeeSchema, editEmployeeSchema } from '../../employees/validation';
import { fetchJobs } from '../../jobs/api/jobService';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Calendar } from 'src/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { createEmployee } from '../api/employeeService';
import { fetchZones } from '../../zones/api/zoneService';
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
import { useLocation } from 'react-router-dom';

function EditEmployee() {
  const { id } = useParams();
  const location = useLocation();
  const currentEmployee = location.state?.employee;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isZonesInputDisabled, setIsZonesInputDisabled] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [jobs, setJobs] = useState([]);
  const isArabic = i18n.language.startsWith('ar');

  const {
    register,
    control,
    watch,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editEmployeeSchema),
  });

  const jobId = watch('jobId');
  const name_en = watch('employeeNameEn');
  const name_ar = watch('employeeNameAr');
  const employee_num = watch('employeeNum');
  const telephone_num = watch('telephoneNum');
  const email = watch('email');

  const checkFieldExists = async (
    field: 'name_en' | 'name_ar' | 'email' | 'employee_number' | 'telephone_num',
    value: string | string | string | number | string,
    formField: 'employeeNameEn' | 'employeeNameAr' | 'email' | 'employeeNum' | 'telephoneNum',
    errorMessage: string,
  ) => {
    try {
      const response = await checkEmployeeExists(field, value, currentEmployee.id);

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
      clearErrors('employeeNameEn');
      return;
    }

    const timer = setTimeout(() => {
      checkFieldExists('name_en', name_en, 'employeeNameEn', 'EMPLOYEE_NAME_EN_EXISTS');
    }, 500);

    return () => clearTimeout(timer);
  }, [name_en]);

  useEffect(() => {
    if (!name_ar || name_ar.trim() === '') {
      clearErrors('employeeNameAr');
      return;
    }

    const timer = setTimeout(() => {
      checkFieldExists('name_ar', name_ar, 'employeeNameAr', 'EMPLOYEE_NAME_AR_EXISTS');
    }, 500);

    return () => clearTimeout(timer);
  }, [name_ar]);

  useEffect(() => {
    if (!email || email.trim() === '') {
      clearErrors('email');
      return;
    }

    const timer = setTimeout(() => {
      checkFieldExists('email', email, 'email', 'EMPLOYEE_EMAIL_EXISTS');
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  useEffect(() => {
    if (!employee_num) {
      clearErrors('employeeNum');
      return;
    }

    const timer = setTimeout(() => {
      checkFieldExists('employee_number', employee_num, 'employeeNum', 'EMPLOYEE_NUMBER_EXISTS');
    }, 500);

    return () => clearTimeout(timer);
  }, [employee_num]);

  useEffect(() => {
    if (!telephone_num) {
      clearErrors('telephoneNum');
      return;
    }

    const timer = setTimeout(() => {
      checkFieldExists(
        'telephone_num',
        telephone_num,
        'telephoneNum',
        'EMPLOYEE_TELEPHONE_NUMBER_EXISTS',
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [telephone_num]);

  useEffect(() => {
    if (!currentEmployee?.id) navigate('/employees');

    const loadData = async () => {
      try {
        setIsLoading(true);

        const [employeeResponse, jobsResponse, zonesResponse] = await Promise.all([
          getEmployeeById(Number(currentEmployee.id)),
          fetchJobs(),
          fetchZones(),
        ]);

        const employeeData = employeeResponse.data;

        console.log('EMPLOYEE:', employeeData);
        console.log('JOB ID:', employeeData.job_id);

        // Set all option data first
        setJobs(jobsResponse.data);
        setZones(zonesResponse.data);

        // Then populate the form
        reset({
          employeeNameAr: employeeData.name_ar,
          employeeNameEn: employeeData.name_en,
          email: employeeData.email,
          employeeNum: employeeData.employee_number,
          street: employeeData.street,
          city: employeeData.city,
          governorate: employeeData.governorate,
          telephoneNum: employeeData.telephone_num,
          birthDate: new Date(employeeData.birth_date),
          jobId: Number(employeeData.job_id),
          zones: employeeData.zones?.map((z) => z.id) ?? [],
          isTerminated: employeeData.is_terminated ?? false,
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          navigate('/404', { replace: true });
          return;
        }

        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentEmployee?.id, reset, navigate]);

  const handleSave = async (data: any) => {
    if (!currentEmployee) return;
    console.log(data);
    try {
      await updateEmployee(Number(currentEmployee.id), data);

      toast.success(t('EMPLOYEE_UPDATED_SUCCESSFULLY'));
      navigate('/employees');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;

        console.log('Backend message:', message);

        if (t(message) === 'Employee Name En already exists') {
          setError('employeeNameEn', {
            type: 'server',
            message: 'EMPLOYEE_NAME_EN_EXISTS',
          });
          return;
        }

        if (t(message) === 'Employee Name Ar already exists') {
          setError('employeeNameAr', {
            type: 'server',
            message: 'EMPLOYEE_NAME_AR_EXISTS',
          });
          return;
        }

        if (t(message) === 'Employee Email already exists') {
          setError('email', {
            type: 'server',
            message: 'EMPLOYEE_EMAIL_EXISTS',
          });
          return;
        }

        if (t(message) === 'An Employee already owns this telephone number') {
          setError('telephoneNum', {
            type: 'server',
            message: 'EMPLOYEE_TELEPHONE_NUMBER_EXISTS',
          });
          return;
        }

        if (t(message) === 'Employee number already exists') {
          setError('employeeNum', {
            type: 'server',
            message: 'EMPLOYEE_NUMBER_EXISTS',
          });
          return;
        }
      }

      console.error('Unexpected error:', error);
    }
  };

  const [zones, setZones] = useState([]);

  useEffect(() => {
    const job = jobs.find((job) => job.id === jobId);
    setIsZonesInputDisabled(!job?.is_zone_mandatory);
  }, [jobId, jobs]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary" />
          <p className="text-sm text-gray-500">Loading employee information...</p>
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
        <Label htmlFor="employeeNameEn">{t('EMPLOYEE_NAME_EN')}</Label>
        <Input id="employeeNameEn" className="mt-2 w-full" {...register('employeeNameEn')} />
        {errors.employeeNameEn && (
          <span className="error-message">{t(errors.employeeNameEn.message!)}</span>
        )}
      </div>

      <div>
        <Label htmlFor="employeeNameAr">{t('EMPLOYEE_NAME_AR')}</Label>
        <Input id="employeeNameAr" className="mt-2 w-full" {...register('employeeNameAr')} />
        {errors.employeeNameAr && (
          <span className="error-message">{t(errors.employeeNameAr.message!)}</span>
        )}
      </div>
      <div>
        <Label htmlFor="email">{t('EMAIL')}</Label>
        <Input id="email" className="mt-2 w-full" {...register('email')} />
        {errors.email && <span className="error-message">{t(errors.email.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="employeeNum">{t('EMPLOYEE_NUMBER')}</Label>
        <Input id="employeeNum" className="mt-2 w-full" {...register('employeeNum')} />
        {errors.employeeNum && (
          <span className="error-message">{t(errors.employeeNum.message!)}</span>
        )}
      </div>

      <Controller
        name="birthDate"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-3">
            <Label htmlFor="date" className="px-1">
              {t('DATE_OF_BIRTH')}
            </Label>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-full justify-between font-normal hover:bg-transparent focus:border-primary"
                >
                  {field.value ? field.value.toLocaleDateString() : 'Select date'}

                  <Icon icon="solar:calendar-minimalistic-linear" width={18} height={18} />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    field.onChange(date);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>

            {errors.birthDate && (
              <span className="error-message">{t(errors.birthDate.message!)}</span>
            )}
          </div>
        )}
      />

      <div>
        <Label htmlFor="street">{t('STREET')}</Label>
        <Input id="street" className="mt-2 w-full" {...register('street')} />
        {errors.street && <span className="error-message">{t(errors.street.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="city">{t('CITY')}</Label>
        <Input id="city" className="mt-2 w-full" {...register('city')} />
        {errors.city && <span className="error-message">{t(errors.city.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="governorate">{t('GOVERNORATE')}</Label>
        <Input id="city" className="mt-2 w-full" {...register('governorate')} />
        {errors.governorate && (
          <span className="error-message">{t(errors.governorate.message!)}</span>
        )}
      </div>

      <div>
        <Label htmlFor="telephoneNum">{t('TELEPHONE_NUMBER')}</Label>
        <Input id="city" className="mt-2 w-full" {...register('telephoneNum')} />
        {errors.telephoneNum && (
          <span className="error-message">{t(errors.telephoneNum.message!)}</span>
        )}
      </div>

      <Controller
        name="jobId"
        control={control}
        render={({ field }) => (
          <div>
            <Label>{t('JOB')}</Label>

            <Select
              value={field.value ? String(field.value) : ''}
              onValueChange={(value) => field.onChange(Number(value))}
            >
              <SelectTrigger
                dir={isArabic ? 'rtl' : 'ltr'}
                className={`mt-2 w-full ${isArabic ? 'text-right' : 'text-left'}`}
              >
                <SelectValue placeholder={t('SELECT_JOB')} />
              </SelectTrigger>

              <SelectContent
                dir={isArabic ? 'rtl' : 'ltr'}
                className={isArabic ? 'text-right' : 'text-left'}
              >
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={String(job.id)}>
                    {i18n.language === 'ar' ? job.title_ar : job.title_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.jobId && <span className="error-message">{t(errors.jobId.message!)}</span>}
          </div>
        )}
      />

      {!isZonesInputDisabled && (
        <div className="form-group">
          <Controller
            name="zones"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <Autocomplete
                multiple
                options={zones}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) =>
                  i18n.language === 'ar' ? option.name_ar : option.name_en
                }
                value={zones.filter((z) => (field.value ?? []).includes(z.id))}
                onChange={(_, selectedZones) => {
                  const ids = selectedZones.map((z) => z.id);
                  field.onChange(ids);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('ZONE')}
                    error={!!errors.zones}
                    helperText={errors.zones ? t(errors.zones.message!) : ''}
                  />
                )}
              />
            )}
          />
        </div>
      )}

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

      <div className="flex items-center space-x-2">
        <Input
          id="isTerminated"
          type="checkbox"
          className="h-4 w-4"
          {...register('isTerminated')}
        />

        <Label htmlFor="isTerminated">{t('IS_TERMINATED')}</Label>
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {t('SAVE')}
        </Button>
      </div>
    </form>
  );
}

export default EditEmployee;

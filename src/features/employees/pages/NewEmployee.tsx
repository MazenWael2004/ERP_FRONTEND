import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Swal from 'sweetalert2';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEmployeeSchema } from '../../employees/validation';
import { fetchJobs } from '../../jobs/api/jobService';
import {
  fetchGovernorates,
  fetchCitiesOfGovernorate,
} from 'src/features/customers/api/customerService';
import axios from 'axios';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'src/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { createEmployee, checkEmployeeExists } from '../api/employeeService';
import { fetchZones } from '../../zones/api/zoneService';
import { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Input } from 'src/components/ui/input';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';

import { Check, ChevronsUpDown,Plus } from 'lucide-react';
import { Label } from 'src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from 'src/components/ui/select';
import { Button } from 'src/components/ui/button';

function NewEmployee() {
  const [open, setOpen] = useState(false);
  const [isZonesInputDisabled, setIsZonesInputDisabled] = useState(true);
  const [isGovernorateSelected, setIsGovernorateSelected] = useState(false);
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const isArabic = i18n.language.startsWith('ar');

  // console.log(user);

  const handleSave = async (data: any) => {
    setIsLoading(true);

    try {
      const result = await createEmployee(data);

      console.log(result);

      await Swal.fire({
        icon: 'success',
        title: t('SUCCESS'),
        text: t('EMPLOYEE_CREATED_SUCCESSFULLY'),
        showConfirmButton: false,
        timer: 1500,
      });

      nav('/employees');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;

        console.log('Backend message:', message);

        if (t(message) === t('EMPLOYEE_NAME_EN_EXISTS')) {
          setError('employeeNameEn', {
            type: 'server',
            message: 'EMPLOYEE_NAME_EN_EXISTS',
          });
          return;
        }

        if (t(message) === t('EMPLOYEE_NAME_AR_EXISTS')) {
          setError('employeeNameAr', {
            type: 'server',
            message: 'EMPLOYEE_NAME_AR_EXISTS',
          });
          return;
        }

        if (t(message) === t('EMPLOYEE_EMAIL_EXISTS')) {
          setError('email', {
            type: 'server',
            message: 'EMPLOYEE_EMAIL_EXISTS',
          });
          return;
        }

        if (t(message) === t('EMPLOYEE_TELEPHONE_NUMBER_EXISTS')) { 
          setError('telephoneNum', {
            type: 'server',
            message: 'EMPLOYEE_TELEPHONE_NUMBER_EXISTS',
          });
          return;
        }

        if (t(message) === t('EMPLOYEE_NUMBER_EXISTS')) {
          setError('employeeNum', {
            type: 'server',
            message: 'EMPLOYEE_NUMBER_EXISTS',
          });
          return;
        }
      }

      console.error('Unexpected error:', error);
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
    resolver: zodResolver(createEmployeeSchema),
  });

  const [jobs, setJobs] = useState([]);
  const name_en = watch('employeeNameEn');
  const name_ar = watch('employeeNameAr');
  const employee_num = watch('employeeNum');
  const telephone_num = watch('telephoneNum');
  const email = watch('email');
  const jobId = watch('jobId');
  const governorateId = watch('governorateId');
  const cityId = watch("cityId");
  const docs = watch("documents");

  const checkFieldExists = async (
    field: 'name_en' | 'name_ar' | 'email' | 'employee_number' | 'telephone_num',
    value: string | string | string | number | string,
    formField: 'employeeNameEn' | 'employeeNameAr' | 'email' | 'employeeNum' | 'telephoneNum',
    errorMessage: string,
  ) => {
    try {
      const response = await checkEmployeeExists(field, value, null);

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
    async function loadJobs() {
      try {
        const response = await fetchJobs(); // your API
        setJobs(response.data);
      } catch (err) {
        console.error(err);
      }
    }

    loadJobs();
  }, []);

  const [zones, setZones] = useState([]);

  useEffect(() => {
    async function loadZones() {
      try {
        const response = await fetchZones(); // your API
        setZones(response.data);
      } catch (err) {
        console.error(err);
      }
    }

    loadZones();
  }, []);

  useEffect(() => {
    const job = jobs.find((job) => job.id === jobId);
    setIsZonesInputDisabled(!job?.is_zone_mandatory);
  }, [jobId, jobs]);

  useEffect(() => {
    async function loadGovernorates() {
      try {
        const response = await fetchGovernorates(); // your API
        setGovernorates(response.data);
        console.log(governorates);
      } catch (err) {
        console.error(err);
      }
    }

    loadGovernorates();
  }, []);

  useEffect(() => {
      async function loadCitiesOfGovernorate(governorateId: any) {
        try {
          const response = await fetchCitiesOfGovernorate(governorateId); // your API
          setCities(response.data);
        } catch (err) {
          console.error(err);
        }
      }
  
      loadCitiesOfGovernorate(governorateId);
    }, [governorateId]);

  return (
    <form
  className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
  onSubmit={handleSubmit(
    (data) => {
      console.log('SUBMITTED DATA:', data);
      handleSave(data);
    },
    (errors) => {
      console.log('VALIDATION ERRORS:', errors);
    }
  )}
>
      <div>
        <Label htmlFor="employeeNameEn">
          {t('EMPLOYEE_NAME_EN')} <span className="text-red-500">*</span>
        </Label>
        <Input id="employeeNameEn" className="mt-2 w-full" {...register('employeeNameEn')} />
        {errors.employeeNameEn && (
          <span className="error-message">{t(errors.employeeNameEn.message!)}</span>
        )}
      </div>

      <div>
        <Label htmlFor="employeeNameAr">
          {t('EMPLOYEE_NAME_AR')} <span className="text-red-500">*</span>
        </Label>
        <Input id="employeeNameAr" className="mt-2 w-full" {...register('employeeNameAr')} />
        {errors.employeeNameAr && (
          <span className="error-message">{t(errors.employeeNameAr.message!)}</span>
        )}
      </div>
      <div>
        <Label htmlFor="email">
          {t('EMAIL')}
          <span className="text-red-500">*</span>
        </Label>
        <Input id="email" className="mt-2 w-full" {...register('email')} />
        {errors.email && <span className="error-message">{t(errors.email.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="employeeNum">
          {t('EMPLOYEE_NUM')}
          <span className="text-red-500">*</span>
        </Label>
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
              <span className="text-red-500">*</span>
            </Label>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-full justify-between font-normal hover:bg-transparent focus:border-primary"
                >
                  {field.value ? field.value.toLocaleDateString() : t('SELECT_DATE')}

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
        <Label htmlFor="street">
          {t('STREET')}
          <span className="text-red-500">*</span>
        </Label>
        <Input id="street" className="mt-2 w-full" {...register('street')} />
        {errors.street && <span className="error-message">{t(errors.street.message!)}</span>}
      </div>

      <Controller
        name="governorateId"
        control={control}
        render={({ field }) => {
          const selectedGovernorate = governorates.find(
            (governorate) => Number(governorate.id) === Number(field.value),
          );

          return (
            <div>
              <Label>
                {t('GOVERNORATE')}
                <span className="text-red-500">*</span>
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className={`mt-2 w-full justify-between ${
                      isArabic ? 'text-right' : 'text-left'
                    }`}
                    dir={isArabic ? 'rtl' : 'ltr'}
                  >
                    {selectedGovernorate
                      ? isArabic
                        ? selectedGovernorate.name_ar
                        : selectedGovernorate.name_en
                      : t('SELECT_GOVERNORATE')}

                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                  dir={isArabic ? 'rtl' : 'ltr'}
                >
                  <Command>
                    <CommandInput placeholder={t('SEARCH_GOVERNORATE')} />

                    <CommandList>
                      <CommandEmpty>{t('GOVERNORATE_NOT_FOUND')}</CommandEmpty>

                      <CommandGroup>
                        {governorates.map((governorate) => {
                          const governorateName = isArabic
                            ? governorate.name_ar
                            : governorate.name_en;

                          return (
                            <CommandItem
                              key={governorate.id}
                              value={governorateName}
                              onSelect={() => {
                                field.onChange(Number(governorate.id));
                                setIsGovernorateSelected(true);
                              }}
                            >
                              {governorateName}

                              {Number(field.value) === Number(governorate.id) && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {errors.governorateId && (
                <span className="error-message">{t(errors.governorateId.message!)}</span>
              )}
            </div>
          );
        }}
      />

      {isGovernorateSelected && (
        <Controller
          name="cityId"
          control={control}
          render={({ field }) => {
            const selectedCity = cities.find((city) => Number(city.id) === Number(field.value));

            return (
              <div>
                <Label>
                  {t('CITY')}
                  <span className="text-red-500">*</span>
                </Label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className={`mt-2 w-full justify-between ${
                        isArabic ? 'text-right' : 'text-left'
                      }`}
                      dir={isArabic ? 'rtl' : 'ltr'}
                    >
                      {selectedCity
                        ? isArabic
                          ? selectedCity.name_ar
                          : selectedCity.name_en
                        : t('SELECT_CITY')}

                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                    dir={isArabic ? 'rtl' : 'ltr'}
                  >
                    <Command>
                      <CommandInput placeholder={t('SEARCH_CITY')} />

                      <CommandList>
                        <CommandEmpty>{t('CITY_NOT_FOUND')}</CommandEmpty>

                        <CommandGroup>
                          {cities.map((city) => {
                            const cityName = isArabic ? city.name_ar : city.name_en;

                            return (
                              <CommandItem
                                key={city.id}
                                value={cityName}
                                onSelect={() => {
                                  field.onChange(Number(city.id));
                                }}
                              >
                                {cityName}

                                {Number(field.value) === Number(city.id) && (
                                  <Check className="ml-auto h-4 w-4" />
                                )}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {errors.cityId && (
                  <span className="error-message">{t(errors.cityId.message!)}</span>
                )}
              </div>
            );
          }}
        />
      )}

      <div>
        <Label htmlFor="telephoneNum">
          {t('TELEPHONE_NUMBER')}
          <span className="text-red-500">*</span>
        </Label>
        <Input id="city" className="mt-2 w-full" {...register('telephoneNum')} />
        {errors.telephoneNum && (
          <span className="error-message">{t(errors.telephoneNum.message!)}</span>
        )}
      </div>

      <Controller
          name="jobId"
          control={control}
          render={({ field }) => {
            const selectedJob = jobs.find((job) => Number(job.id) === Number(field.value));

            return (
              <div>
                <Label>
                  {t('JOB')}
                  <span className="text-red-500">*</span>
                </Label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className={`mt-2 w-full justify-between ${
                        isArabic ? 'text-right' : 'text-left'
                      }`}
                      dir={isArabic ? 'rtl' : 'ltr'}
                    >
                      {selectedJob
                        ? isArabic
                          ? selectedJob.title_ar
                          : selectedJob.title_en
                        : t('SELECT_JOB')}

                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                    dir={isArabic ? 'rtl' : 'ltr'}
                  >
                    <Command>
                      <CommandInput placeholder={t('SEARCH_JOB')} />

                      <CommandList>
                        <CommandEmpty>{t('JOB_NOT_FOUND')}</CommandEmpty>

                        <CommandGroup>
                          {jobs.map((job) => {
                            const jobName = isArabic ? job.title_ar : job.title_en;

                            return (
                              <CommandItem
                                key={job.id}
                                value={jobName}
                                onSelect={() => {
                                  field.onChange(Number(job.id));
                              
                                }}
                              >
                                {jobName}

                                {Number(field.value) === Number(job.id) && (
                                  <Check className="ml-auto h-4 w-4" />
                                )}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {errors.jobId && (
                  <span className="error-message">{t(errors.jobId.message!)}</span>
                )}
              </div>
            );
          }}
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

       <div>
        <Label
          htmlFor="documents"
          className="relative flex h-[168px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 transition hover:border-primary hover:bg-gray-50"
        >
          <Plus className="h-8 w-8 text-gray-400" />
      
          <span className="text-sm font-medium text-gray-500">
            {t('ADD_DOCUMENT')}
          </span>
      
          {docs?.length > 0 && (
            <span className="text-xs text-gray-500">
              {docs.length} {t('DOCUMENTS_SELECTED')}
            </span>
          )}
        </Label>
      
        <Input
          id="documents"
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          {...register('documents')}
        />
      
        {docs?.length > 0 && (
          <div className="mt-3 space-y-2">
            {Array.from(docs).map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2"
              >
                <span className="text-lg">
                  {file.type === 'application/pdf' ? '📄' : '📎'}
                </span>
      
                <span className="truncate text-sm text-gray-700">
                  {file.name}
                </span>
      
                <span className="ml-auto text-xs text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
        )}
      
        {errors.documents && (
          <span className="error-message">
            {t(errors.documents.message!)}
          </span>
        )}
      </div>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {t('SAVE')}
        </Button>
      </div>
    </form>
  );
}

export default NewEmployee;

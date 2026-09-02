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
import {
  fetchGovernorates,
  fetchCitiesOfGovernorate,
} from 'src/features/customers/api/customerService';
import { Autocomplete, TextField } from '@mui/material';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';

import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
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
  const [isGovernorateSelected, setIsGovernorateSelected] = useState(false);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);
  const [deletedDocumentIds, setDeletedDocumentIds] = useState<number[]>([]);
  const [previewImageIndex, setPreviewImageIndex] = useState(-1);
  const [jobs, setJobs] = useState([]);
  const isArabic = i18n.language.startsWith('ar');
  const imageDocuments = documents.filter((doc) => doc.mime_type.startsWith('image/'));

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
  const governorateId = watch('governorateId');
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
        setDocuments(employeeData.documents || []);

        // Then populate the form
        reset({
          employeeNameAr: employeeData.name_ar,
          employeeNameEn: employeeData.name_en,
          email: employeeData.email,
          employeeNum: employeeData.employee_number,
          street: employeeData.street,
          cityId: employeeData.city_id,
          governorateId: employeeData.governorate_id,
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
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value)); // e.g. zones
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else {
        formData.append(key, String(value));
      }
    });

    newDocuments.forEach((file) => {
     formData.append('documents', file); // must match multer field name on the backend route
    });

    formData.append('deletedDocumentIds', JSON.stringify(deletedDocumentIds));
    try {
       await updateEmployee(Number(currentEmployee.id), formData);


      toast.success(t('EMPLOYEE_UPDATED_SUCCESSFULLY'));
      navigate('/employees');
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
    }
  };

  const [zones, setZones] = useState([]);

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
      {/* hardcoded */}
      {true && (
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
        <Label htmlFor="telephoneNum">{t('TELEPHONE_NUMBER')}</Label>
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

      <div className="flex items-center space-x-2">
        <Input
          id="isTerminated"
          type="checkbox"
          className="h-4 w-4"
          {...register('isTerminated')}
        />

        <Label htmlFor="isTerminated">{t('IS_TERMINATED')}</Label>
      </div>

      <div className="md:col-span-2">
              <Label>{t('DOCUMENTS')}</Label>
      
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                {documents.map((document) => {
                  const documentUrl = `http://localhost:3000/${document.file_path}`;
      
                  return (
                    <div
                      key={document.id}
                      className="relative rounded-lg border p-2 cursor-pointer
                   transition-all duration-300 ease-in-out
                   hover:-translate-y-1 hover:shadow-lg hover:border-primary"
                      onClick={() => {
                        const index = imageDocuments.findIndex((img) => img.id === document.id);
      
                        setPreviewImageIndex(index);
                      }}
                    >
                      {/* Remove button */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 z-10 h-7 w-7 rounded-full"
                        onClick={() => {
                          setDocuments((prev) => prev.filter((doc) => doc.id !== document.id));
      
                          setDeletedDocumentIds((prev) => [...prev, document.id]);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
      
                      {document.mime_type.startsWith('image/') ? (
                        <div
                          className="relative flex h-40 flex-col"
                          onClick={(e) => {
                            e.stopPropagation();
      
                            const index = imageDocuments.findIndex((img) => img.id === document.id);
      
                            setPreviewImageIndex(index);
                          }}
                        >
                          <img
                            src={documentUrl}
                            alt={document.original_name || 'Customer document'}
                            className="h-40 w-full rounded-md object-cover"
                          />
                        </div>
                      ) : document.mime_type === 'application/pdf' ? (
                        <div className="flex h-40 flex-col items-center justify-center gap-3">
                          <span className="text-4xl">📄</span>
      
                          <span className="max-w-[90%] truncate text-sm text-gray-500">
                            {document.original_name || 'PDF Document'}
                          </span>
      
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.open(documentUrl, '_blank')}
                          >
                            {t('PREVIEW')}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex h-40 flex-col items-center justify-center gap-2">
                          <span className="text-4xl">📎</span>
      
                          <span className="max-w-[90%] truncate text-sm text-gray-500">
                            {document.original_name || document.file_path}
                          </span>
      
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.open(documentUrl, '_blank')}
                          >
                            {t('PREVIEW')}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
      
                {/* Add Document */}
                <label
                  htmlFor="document-upload"
                  className="relative flex h-[168px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 transition hover:border-primary hover:bg-gray-50"
                >
                  {newDocuments.length === 0 ? (
                    <>
                      <Plus className="h-8 w-8 text-gray-400" />
      
                      <span className="text-sm font-medium text-gray-500">{t('ADD_DOCUMENT')}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-8 w-8 text-primary" />
      
                      <span className="text-sm font-medium">
                        {newDocuments.length} {t('DOCUMENTS_SELECTED')}
                      </span>
      
                      <span className="max-w-[90%] truncate text-xs text-gray-500">
                        {newDocuments.map((file) => file.name).join(', ')}
                      </span>
                    </>
                  )}
      
                  <input
                    id="document-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
      
                      setNewDocuments((prev) => [...prev, ...files]);
      
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>
      
            {previewImageIndex >= 0 && imageDocuments.length > 0 && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
                onClick={() => setPreviewImageIndex(-1)}
              >
                {/* Previous */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute left-6 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/90"
                  onClick={(e) => {
                    e.stopPropagation();
      
                    setPreviewImageIndex((prev) => (prev === 0 ? imageDocuments.length - 1 : prev - 1));
                  }}
                >
                  ←
                </Button>
      
                {/* Image */}
                <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                  <img
                    src={`http://localhost:3000/${imageDocuments[previewImageIndex].file_path}`}
                    alt={imageDocuments[previewImageIndex].original_name || 'Customer document'}
                    className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
                  />
      
                  {/* Image name */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-black/60 px-4 py-2 text-sm text-white">
                    {imageDocuments[previewImageIndex].original_name}
                  </div>
      
                  {/* Counter */}
                  <div className="absolute right-3 top-3 rounded-md bg-black/60 px-3 py-1 text-sm text-white">
                    {previewImageIndex + 1} / {imageDocuments.length}
                  </div>
                </div>
      
                {/* Next */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute right-6 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/90"
                  onClick={(e) => {
                    e.stopPropagation();
      
                    setPreviewImageIndex((prev) => (prev === imageDocuments.length - 1 ? 0 : prev + 1));
                  }}
                >
                  →
                </Button>
      
                {/* Close */}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-6 top-6 rounded-full"
                  onClick={() => setPreviewImageIndex(-1)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
      

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {t('SAVE')}
        </Button>
      </div>
    </form>
  );
}

export default EditEmployee;

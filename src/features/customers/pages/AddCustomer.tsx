import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth.tsx';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCustomerSchema } from '../validation.ts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { createCustomer, checkCustomerExists } from '../api/customerService.ts';
import Swal from 'sweetalert2';
import { fetchZones } from 'src/features/zones/api/zoneService.ts';
import { fetchPrograms } from 'src/features/programs/api/programService.ts';
import { fetchGovernorates, fetchCitiesOfGovernorate } from '../api/customerService.ts';
import { useState } from 'react';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from 'src/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';

import { Check, ChevronsUpDown,Plus } from 'lucide-react';
import { Button } from 'src/components/ui/button';

import Spinner from 'src/shared/components/Spinner.tsx';

function NewCustomer() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordFields, setPasswordFields] = useState(true);
  const [isGovernorateSelected, setIsGovernorateSelected] = useState(false);
  const [cities, setCities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [zones, setZones] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'subscription' | 'documents'>('basic');
  const isArabic = i18n.language.startsWith('ar');

  const tabs = [
    { id: 'basic', label: isArabic ? 'البيانات الأساسية' : 'Basic Information' },
    { id: 'location', label: isArabic ? 'الموقع' : 'Location' },
    { id: 'subscription', label: isArabic ? 'الاشتراك' : 'Subscription' },
    { id: 'documents', label: isArabic ? 'المستندات' : 'Documents' },
  ] as const;
  

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
    async function loadPrograms() {
      try {
        const response = await fetchPrograms(); // your API
        setPrograms(response.data);
      } catch (err) {
        console.error(err);
      }
    }

    loadPrograms();
  }, []);

  // console.log(user);

  const handleSave = async (data: any) => {
    setIsLoading(true);
    console.log(data);
    console.log('FORM');
    try {
      const result = await createCustomer(data);

      console.log(result);

      await Swal.fire({
        icon: 'success',
        title: t('SUCCESS'),
        text: t('CUSTOMER_CREATED_SUCCESSFULLY'),
        showConfirmButton: false,
        timer: 1500,
      });

      nav('/customers');
      // error.reponse?.status === 409
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;

        console.log('Backend message:', message);

        if (t(message) === t('CUSTOMER_NAME_EN_EXISTS')) {
          setError('nameEn', {
            type: 'server',
            message: 'CUSTOMER_NAME_EN_EXISTS',
          });
          return;
        }

        if (t(message) === t('CUSTOMER_NAME_AR_EXISTS')) {
          setError('nameAr', {
            type: 'server',
            message: 'CUSTOMER_NAME_AR_EXISTS',
          });
          return;
        }

        if (t(message) === t('CUSTOMER_CODE_EXISTS')) {
          setError('code', {
            type: 'server',
            message: 'CUSTOMER_CODE_EXISTS',
          });
          return;
        }

        if (t(message) === t('CUSTOMER_TAX_NUMBER_EXISTS')) {
          setError('taxNumber', {
            type: 'server',
            message: 'CUSTOMER_TAX_NUMBER_EXISTS',
          });
          return;
        }

        if (t(message) === t('CUSTOMER_REGISTRATION_NUMBER_EXISTS')) {
          setError('registrationNumber', {
            type: 'server',
            message: 'CUSTOMER_REGISTRATION_NUMBER_EXISTS',
          });
          return;
        }

        if (t(message) === t('CUSTOMER_TELEPHONE_NUMBER_EXISTS')) {
          setError('telephoneNumber', {
            type: 'server',
            message: 'CUSTOMER_TELEPHONE_NUMBER_EXISTS',
          });
          return;
        }
      }

      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextTab = (e?: React.MouseEvent) => {
  e?.preventDefault();
  const index = tabs.findIndex((tab) => tab.id === activeTab);
  if (index < tabs.length - 1) {
    setActiveTab(tabs[index + 1].id);
  }
};

const goToPreviousTab = (e?: React.MouseEvent) => {
  e?.preventDefault();
  const index = tabs.findIndex((tab) => tab.id === activeTab);
  if (index > 0) {
    setActiveTab(tabs[index - 1].id);
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
    resolver: zodResolver(createCustomerSchema),
  });

  const name_en = watch('nameEn');
  const name_ar = watch('nameAr');
  const code = watch('code');
  const tax_number = watch('taxNumber');
  const registration_number = watch('registrationNumber');
  const telephone_number = watch('telephoneNumber');
  const governorateId = watch('governorateId');
  const docs = watch("documents");

  useEffect(()=>{
    console.log(docs);
  },[docs]);

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

  // console.log('GOVERNORATE_ID', governorateId);

  const checkFieldExists = async (
    field:
      | 'code'
      | 'name_en'
      | 'name_ar'
      | 'tax_number'
      | 'registration_number'
      | 'telephone_number',
    value: string,
    formField:
      | 'code'
      | 'nameEn'
      | 'nameAr'
      | 'taxNumber'
      | 'registrationNumber'
      | 'telephoneNumber',
    errorMessage: string,
  ) => {
    try {
      const response = await checkCustomerExists(field, value, null);

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
    if (!code || code.trim() === '') {
      clearErrors('code');
      return;
    }

    const timer = setTimeout(() => {
      checkFieldExists('code', code, 'code', 'CUSTOMER_CODE_EXISTS');
    }, 500);

    return () => clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    if (!name_en || name_en.trim() === '') {
      clearErrors('nameEn');
      return;
    }

    const timer = setTimeout(() => {
      checkFieldExists('name_en', name_en, 'nameEn', 'CUSTOMER_NAME_EN_EXISTS');
    }, 500);

    return () => clearTimeout(timer);
  }, [name_en]);

  useEffect(() => {
    if (!name_ar || name_ar.trim() === '') {
      clearErrors('nameAr');
      return;
    }

    const timer = setTimeout(() => {
      checkFieldExists('name_ar', name_ar, 'nameAr', 'CUSTOMER_NAME_AR_EXISTS');
    }, 500);

    return () => clearTimeout(timer);
  }, [name_ar]);

  useEffect(() => {
    if (!tax_number || tax_number.trim() === '') {
      clearErrors('taxNumber');
      return;
    }

    const timer = setTimeout(() => {
      checkFieldExists('tax_number', tax_number, 'taxNumber', 'CUSTOMER_TAX_NUMBER_EXISTS');
    }, 500);

    return () => clearTimeout(timer);
  }, [tax_number]);

  useEffect(() => {
    if (!registration_number || registration_number.trim() === '') {
      clearErrors('registrationNumber');
      return;
    }

    const timer = setTimeout(() => {
      checkFieldExists(
        'registration_number',
        registration_number,
        'registrationNumber',
        'CUSTOMER_REGISTRATION_NUMBER_EXISTS',
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [registration_number]);

  useEffect(() => {
    if (!telephone_number || telephone_number.trim() === '') {
      clearErrors('telephoneNumber');
      return;
    }

    const timer = setTimeout(() => {
      checkFieldExists(
        'telephone_number',
        telephone_number,
        'telephoneNumber',
        'CUSTOMER_TELEPHONE_NUMBER_EXISTS',
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [telephone_number]);

  return (
    <form
      className="mt-6"
      onSubmit={handleSubmit(handleSave)}
    >
      {/* Tabs */}
      <div
         className={`mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 ${
    isArabic ? 'rtl' : ''
  }`}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="border-b border-gray-200 bg-gray-50/80 px-2 pt-2">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative min-w-fit rounded-t-lg px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:bg-white/70 hover:text-gray-800'
                  }`}
                >
                  {tab.label}

                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Basic Information */}
        <div className={`${activeTab === 'basic' ? 'block' : 'hidden'} p-6`}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isArabic ? 'البيانات الأساسية' : 'Basic Information'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isArabic
                ? 'أدخل البيانات الأساسية الخاصة بالعميل.'
                : 'Enter the main information for the customer.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="customerNameEn">
                {t('CUSTOMER_NAME_EN')} <span className="text-red-500">*</span>
              </Label>
              <Input id="customerNameEn" className="mt-2 w-full" {...register('nameEn')} />
              {errors.nameEn && (
                <span className="error-message">{t(errors.nameEn.message!)}</span>
              )}
            </div>

            <div>
              <Label htmlFor="customerNameAr">
                {t('CUSTOMER_NAME_AR')} <span className="text-red-500">*</span>
              </Label>
              <Input id="customerNameAr" className="mt-2 w-full" {...register('nameAr')} />
              {errors.nameAr && (
                <span className="error-message">{t(errors.nameAr.message!)}</span>
              )}
            </div>

            <div>
              <Label htmlFor="code">
                {t('CUSTOMER_CODE')} <span className="text-red-500">*</span>
              </Label>
              <Input id="code" className="mt-2 w-full" {...register('code')} />
              {errors.code && (
                <span className="error-message">{t(errors.code.message!)}</span>
              )}
            </div>

            <div>
              <Label htmlFor="customerTaxNumber">
                {t('CUSTOMER_TAX_NUMBER')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerTaxNumber"
                className="mt-2 w-full"
                {...register('taxNumber')}
              />
              {errors.taxNumber && (
                <span className="error-message">{t(errors.taxNumber.message!)}</span>
              )}
            </div>

            <div>
              <Label htmlFor="customerRegistrationNumber">
                {t('CUSTOMER_REGISTRATION_NUMBER')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerRegistrationNumber"
                className="mt-2 w-full"
                {...register('registrationNumber')}
              />
              {errors.registrationNumber && (
                <span className="error-message">
                  {t(errors.registrationNumber.message!)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className={`${activeTab === 'location' ? 'block' : 'hidden'} p-6`}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isArabic ? 'الموقع' : 'Location'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isArabic
                ? 'حدد عنوان العميل وموقعه الجغرافي.'
                : 'Specify the customer address and geographical location.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="street">
                {t('STREET')} <span className="text-red-500">*</span>
              </Label>
              <Input id="street" className="mt-2 w-full" {...register('street')} />
              {errors.street && (
                <span className="error-message">{t(errors.street.message!)}</span>
              )}
            </div>

            <Controller
              name="governorateId"
              control={control}
              render={({ field }) => {
                const selectedGovernorate = governorates.find(
                  (governorate) => Number(governorate.id) === Number(field.value)
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
                      <span className="error-message">
                        {t(errors.governorateId.message!)}
                      </span>
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
                  const selectedCity = cities.find(
                    (city) => Number(city.id) === Number(field.value)
                  );

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
                        <span className="error-message">
                          {t(errors.cityId.message!)}
                        </span>
                      )}
                    </div>
                  );
                }}
              />
            )}

            <div>
              <Label htmlFor="telephoneNumber">
                {t('TELEPHONE_NUMBER')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="telephoneNumber"
                className="mt-2 w-full"
                {...register('telephoneNumber')}
              />
              {errors.telephoneNumber && (
                <span className="error-message">
                  {t(errors.telephoneNumber.message!)}
                </span>
              )}
            </div>

            <Controller
              name="zoneId"
              control={control}
              render={({ field }) => {
                const selectedZone = zones.find(
                  (zone) => Number(zone.id) === Number(field.value)
                );

                return (
                  <div>
                    <Label>
                      {t('ZONE')}
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
                          {selectedZone
                            ? isArabic
                              ? selectedZone.name_ar
                              : selectedZone.name_en
                            : t('SELECT_ZONE')}

                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                        dir={isArabic ? 'rtl' : 'ltr'}
                      >
                        <Command>
                          <CommandInput placeholder={t('SEARCH_ZONE')} />

                          <CommandList>
                            <CommandEmpty>{t('ZONE_NOT_FOUND')}</CommandEmpty>

                            <CommandGroup>
                              {zones.map((zone) => {
                                const zoneName = isArabic ? zone.name_ar : zone.name_en;

                                return (
                                  <CommandItem
                                    key={zone.id}
                                    value={zoneName}
                                    onSelect={() => {
                                      field.onChange(Number(zone.id));
                                    }}
                                  >
                                    {zoneName}

                                    {Number(field.value) === Number(zone.id) && (
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

                    {errors.zoneId && (
                      <span className="error-message">
                        {t(errors.zoneId.message!)}
                      </span>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* Subscription */}
        <div className={`${activeTab === 'subscription' ? 'block' : 'hidden'} p-6`}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isArabic ? 'الاشتراك' : 'Subscription'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isArabic
                ? 'اختر البرنامج الذي سيشترك فيه العميل.'
                : 'Select the program the customer will subscribe to.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              name="programId"
              control={control}
              render={({ field }) => {
                const selectedProgram = programs.find(
                  (program) => Number(program.id) === Number(field.value)
                );

                return (
                  <div>
                    <Label>
                      {t('PROGRAM')}
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
                          {selectedProgram
                            ? isArabic
                              ? selectedProgram.name_ar
                              : selectedProgram.name_en
                            : t('SELECT_PROGRAM')}

                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                        dir={isArabic ? 'rtl' : 'ltr'}
                      >
                        <Command>
                          <CommandInput placeholder={t('SEARCH_PROGRAM')} />

                          <CommandList>
                            <CommandEmpty>{t('PROGRAM_NOT_FOUND')}</CommandEmpty>

                            <CommandGroup>
                              {programs.map((program) => {
                                const programName = isArabic
                                  ? program.name_ar
                                  : program.name_en;

                                return (
                                  <CommandItem
                                    key={program.id}
                                    value={programName}
                                    onSelect={() => {
                                      field.onChange(Number(program.id));
                                    }}
                                  >
                                    {programName}

                                    {Number(field.value) === Number(program.id) && (
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

                    {errors.programId && (
                      <span className="error-message">
                        {t(errors.programId.message!)}
                      </span>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* Documents */}
        <div className={`${activeTab === 'documents' ? 'block' : 'hidden'} p-6`}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isArabic ? 'المستندات' : 'Documents'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isArabic
                ? 'أضف المستندات المطلوبة الخاصة بالعميل.'
                : 'Upload the required customer documents.'}
            </p>
          </div>

          <div className="max-w-2xl">
            <Label
              htmlFor="documents"
              className="relative flex h-[180px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 transition hover:border-primary hover:bg-gray-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>

              <span className="text-sm font-semibold text-gray-600">
                {t('ADD_DOCUMENT')}
              </span>

              <span className="text-xs text-gray-400">
                PDF, DOC, DOCX or Images
              </span>

              {docs?.length > 0 && (
                <span className="text-xs font-medium text-primary">
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
              <div className="mt-4 space-y-2">
                {Array.from(docs).map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 rounded-lg border bg-gray-50 px-4 py-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-lg shadow-sm">
                      {file.type === 'application/pdf' ? '📄' : '📎'}
                    </span>

                    <span className="truncate text-sm font-medium text-gray-700">
                      {file.name}
                    </span>

                    <span className="ml-auto shrink-0 text-xs text-gray-400">
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
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => nav('/customers')}
          disabled={isLoading}
        >
          {isArabic ? 'إلغاء' : 'Cancel'}
        </Button>

        <div className="flex gap-2">
          {activeTab !== 'basic' && (
            <Button
              type="button"
              variant="outline"
              onClick={(e) => goToPreviousTab(e)}
              disabled={isLoading}
            >
              {isArabic ? 'السابق' : 'Previous'}
            </Button>
          )}

          {activeTab !== 'documents' ? (
            <Button
              type="button"
              onClick={(e) => goToNextTab(e)}
              disabled={isLoading}
            >
              {isArabic ? 'التالي' : 'Next'}
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : t('SAVE')}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

export default NewCustomer;

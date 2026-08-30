import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getCustomerById, updateCustomer, checkCustomerExists } from '../api/customerService';
import { fetchZones } from 'src/features/zones/api/zoneService';
import { fetchPrograms } from 'src/features/programs/api/programService';
import { fetchGovernorates, fetchCitiesOfGovernorate } from '../api/customerService.ts';
import { useAuth } from '../../auth/hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from 'sweetalert2';
import { Autocomplete, TextField } from '@mui/material';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from 'src/components/ui/select';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';
import { createCustomerSchema } from '../validation';
import { useLocation } from 'react-router-dom';

function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [zones, setZones] = useState([]);
  const [isGovernorateSelected, setIsGovernorateSelected] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [cities, setCities] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const currentCustomer = location.state?.customer;
  const isArabic = i18n.language.startsWith('ar');
  const [documents, setDocuments] = useState([]);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);

  const {
    register,
    control,
    watch,
    setError,
    clearErrors,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createCustomerSchema),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        if (!currentCustomer) {
          navigate('/customers');
          return;
        }

        // Load everything at the same time
        const [customerResponse, zonesResponse, programsResponse] = await Promise.all([
          getCustomerById(currentCustomer.id),
          fetchZones(),
          fetchPrograms(),
        ]);

        // Set dropdown data
        setZones(zonesResponse.data);
        setPrograms(programsResponse.data);

        // Set form data
        const customer = customerResponse.data;
        setDocuments(customer.documents || []);

        reset({
          nameEn: customer.name_en,
          nameAr: customer.name_ar,
          code: customer.code,
          taxNumber: customer.tax_number,
          registrationNumber: customer.registration_number,
          street: customer.street,
          cityId: customer.city_id,
          governorateId: customer.governorate_id,
          telephoneNumber: customer.telephone_number,
          zoneId: customer.zone_id,
          programId: customer.program_id,
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          navigate('/404', { replace: true });
          return;
        }

        console.error('Error loading customer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, currentCustomer, navigate, reset]);

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

  const name_en = watch('nameEn');
  const name_ar = watch('nameAr');
  const code = watch('code');
  const tax_number = watch('taxNumber');
  const registration_number = watch('registrationNumber');
  const telephone_number = watch('telephoneNumber');

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
      const response = await checkCustomerExists(field, value, currentCustomer.id);

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
  //   const name_ar = watch("nameAr");

  //     const checkFieldExists = async (
  //     field: "name_en" | "name_ar",
  //     value: string,
  //     formField: "zoneNameEn" | "zoneNameAr",
  //     errorMessage: string
  //   ) => {
  //     try {
  //       const response = await checkZoneExists(field, value,currentZone.id);

  //       console.log(`${field} response:`, response);

  //       if (response.exists) {
  //         setError(formField, {
  //           type: "manual",
  //           message: errorMessage,
  //         });
  //       } else {
  //         clearErrors(formField);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   useEffect(() => {
  //     if (!nameEn || nameEn.trim() === "") {
  //       clearErrors("zoneNameEn");
  //       return;
  //     }

  //     const timer = setTimeout(() => {
  //       checkFieldExists(
  //         "name_en",
  //         nameEn,
  //         "zoneNameEn",
  //         "ZONE_EN_ALREADY_EXISTS"
  //       );
  //     }, 500);

  //     return () => clearTimeout(timer);
  //   }, [nameEn]);

  //   useEffect(() => {
  //     if (!nameAr || nameAr.trim() === "") {
  //       clearErrors("zoneNameAr");
  //       return;
  //     }

  //     const timer = setTimeout(() => {
  //       checkFieldExists(
  //         "name_ar",
  //         nameAr,
  //         "zoneNameAr",
  //         "ZONE_AR_ALREADY_EXISTS"
  //       );
  //     }, 500);

  //     return () => clearTimeout(timer);
  //   }, [nameAr]);

  const handleSave = async (data: any) => {
    if (!currentCustomer) return;
    console.log(data);
    try {
      await updateCustomer(currentCustomer.id, data);

      toast.success(t('CUSTOMER_UPDATED_SUCCESSFULLY'));
      navigate('/customers');
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
    }
  };

  const governorateId = watch('governorateId');
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
        <Label htmlFor="customerNameEn">
          {t('CUSTOMER_NAME_EN')} <span className="text-red-500">*</span>
        </Label>
        <Input id="jobCode" className="mt-2 w-full" {...register('nameEn')} />
        {errors.nameEn && <span className="error-message">{t(errors.nameEn.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="customerNameAr">
          {t('CUSTOMER_NAME_AR')} <span className="text-red-500">*</span>
        </Label>
        <Input id="jobCode" className="mt-2 w-full" {...register('nameAr')} />
        {errors.nameAr && <span className="error-message">{t(errors.nameAr.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="code">
          {t('CUSTOMER_CODE')} <span className="text-red-500">*</span>
        </Label>
        <Input id="jobCode" className="mt-2 w-full" {...register('code')} />
        {errors.code && <span className="error-message">{t(errors.code.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="customerTaxNumber">
          {t('CUSTOMER_TAX_NUMBER')} <span className="text-red-500">*</span>
        </Label>
        <Input id="jobCode" className="mt-2 w-full" {...register('taxNumber')} />
        {errors.taxNumber && <span className="error-message">{t(errors.taxNumber.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="customerTaxNumber">
          {t('CUSTOMER_REGISTRATION_NUMBER')} <span className="text-red-500">*</span>
        </Label>
        <Input id="jobCode" className="mt-2 w-full" {...register('registrationNumber')} />
        {errors.registrationNumber && (
          <span className="error-message">{t(errors.registrationNumber.message!)}</span>
        )}
      </div>

      <div>
        <Label htmlFor="street">
          {t('STREET')} <span className="text-red-500">*</span>
        </Label>
        <Input id="jobCode" className="mt-2 w-full" {...register('street')} />
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
      {/*  hardcoded */}
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
        <Label htmlFor="telephoneNumber">
          {t('TELEPHONE_NUMBER')} <span className="text-red-500">*</span>
        </Label>
        <Input id="jobCode" className="mt-2 w-full" {...register('telephoneNumber')} />
        {errors.telephoneNumber && (
          <span className="error-message">{t(errors.telephoneNumber.message!)}</span>
        )}
      </div>

      <Controller
        name="zoneId"
        control={control}
        render={({ field }) => {
          const selectedZone = zones.find((zone) => Number(zone.id) === Number(field.value));

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
                                setIsGovernorateSelected(true);
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

              {errors.zoneId && <span className="error-message">{t(errors.zoneId.message!)}</span>}
            </div>
          );
        }}
      />

      <Controller
        name="programId"
        control={control}
        render={({ field }) => {
          const selectedProgram = programs.find(
            (program) => Number(program.id) === Number(field.value),
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
                          const programName = isArabic ? program.name_ar : program.name_en;

                          return (
                            <CommandItem
                              key={program.id}
                              value={programName}
                              onSelect={() => {
                                field.onChange(Number(program.id));
                                setIsGovernorateSelected(true);
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
                <span className="error-message">{t(errors.programId.message!)}</span>
              )}
            </div>
          );
        }}
      />

      <div className="md:col-span-2">
        <Label>{t('DOCUMENTS')}</Label>

        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {documents.length > 0 ? (
            documents.map((document) => {
              const documentUrl = `http://localhost:3000/${document.file_path}`;

              return (
                <div key={document.id} className="relative rounded-lg border p-2">
                  {/* Remove button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 z-10 h-7 w-7 rounded-full"
                    onClick={() => {
                      setDocuments((prev) => prev.filter((doc) => doc.id !== document.id));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {document.mime_type.startsWith('image/') ? (
                    <img
                      src={documentUrl}
                      alt="Customer document"
                      className="h-40 w-full rounded-md object-cover"
                    />
                  ) : document.mime_type === 'application/pdf' ? (
                    <div className="flex h-40 flex-col items-center justify-center gap-3">
                      <span className="text-4xl">📄</span>

                      <span className="text-sm text-gray-500">PDF Document</span>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.open(documentUrl, '_blank')}
                      >
                        {t('PREVIEW')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center">
                      <span className="text-sm text-gray-500">{document.file_path}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">{t('NO_DOCUMENTS')}</p>
          )}
        </div>
      </div>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {t('SAVE')}
        </Button>
      </div>
    </form>
  );
}

export default EditCustomer;

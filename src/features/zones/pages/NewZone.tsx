import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth.tsx';

import { useEffect } from 'react';
import { useForm,Controller} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createZoneSchema } from '../validation.ts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  fetchGovernorates,
  fetchCitiesOfGovernorate,
} from 'src/features/customers/api/customerService';
import { createZone,fetchZones,checkZoneExists } from '../api/zoneService.ts';
import Swal from 'sweetalert2';
import { Check, ChevronsUpDown,Plus } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';


function NewZone() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const { user } = useAuth();
  const [isGovernorateSelected, setIsGovernorateSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordFields, setPasswordFields] = useState(true);
  const [roles, setRoles] = useState([]);
  const isArabic = i18n.language.startsWith('ar');

  // console.log(user);

  const handleSave = async (data: any) => {
    setIsLoading(true);

    try {
      const result = await createZone(data);

      console.log(result);

      await Swal.fire({
        icon: 'success',
        title: t('SUCCESS'),
        text: t('ZONE_CREATED_SUCCESSFULLY'),
        showConfirmButton:false,
        timer:1500,
      });

      nav('/zones');
    } catch (error) {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;

        console.log("Backend message:", message);

        if (t(message) === t("ZONE_EN_ALREADY_EXISTS")) {
            setError("zoneNameEn", {
                type: "server",
                message: "ZONE_EN_ALREADY_EXISTS",
            });
            return;
        }

        if (t(message) === t("ZONE_AR_ALREADY_EXISTS")) {
            setError("zoneNameAr", {
                type: "server",
                message: "ZONE_AR_ALREADY_EXISTS",
            });
            return;
        }

         if (t(message) === t("ZONE_CODE_ALREADY_EXISTS")) {
            setError("zoneNameAr", {
                type: "server",
                message: "ZONE_CODE_ALREADY_EXISTS",
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
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createZoneSchema),
  });

  const nameEn = watch("zoneNameEn");
  const nameAr = watch("zoneNameAr");
  const code = watch("code");
  const governorateId = watch('governorateId');

  const checkFieldExists = async (
  field: "name_en" | "name_ar" | "code",
  value: string,
  formField: "zoneNameEn" | "zoneNameAr" | "code",
  errorMessage: string
) => {
  try {
    const response = await checkZoneExists(field, value,null);

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
  if (!nameEn || nameEn.trim() === "") {
    clearErrors("zoneNameEn");
    return;
  }

  const timer = setTimeout(() => {
    checkFieldExists(
      "name_en",
      nameEn,
      "zoneNameEn",
      "ZONE_EN_ALREADY_EXISTS"
    );
  }, 500);

  return () => clearTimeout(timer);
}, [nameEn]);


useEffect(() => {
  if (!nameAr || nameAr.trim() === "") {
    clearErrors("zoneNameAr");
    return;
  }

  const timer = setTimeout(() => {
    checkFieldExists(
      "name_ar",
      nameAr,
      "zoneNameAr",
      "ZONE_AR_ALREADY_EXISTS"
    );
  }, 500);

  return () => clearTimeout(timer);
}, [nameAr]);

useEffect(() => {
  if (!code || code.trim() === "") {
    clearErrors("code");
    return;
  }

  const timer = setTimeout(() => {
    checkFieldExists(
      "code",
      code,
      "code",
      "ZONE_CODE_ALREADY_EXISTS"
    );
  }, 500);

  return () => clearTimeout(timer);
}, [code]);


  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await fetchZones();
        setRoles(response.data);
      } catch (err) {
        console.error(err);
      }
    };

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
      onSubmit={handleSubmit(handleSave)}
    >
      <div>
        <Label htmlFor="zoneNameEn">{t('ZONE_NAME_EN')} <span className="ml-1 text-red-500">*</span></Label>
        <Input id="zoneNameEn" className="mt-2 w-full" {...register('zoneNameEn')} />
        {errors.zoneNameEn && <span className="error-message">{t(errors.zoneNameEn.message!)}</span>}
        
      </div>

  

      <div>
        <Label htmlFor="zoneNameAr">{t('ZONE_NAME_AR')} <span className="ml-1 text-red-500">*</span></Label>
        <Input id="zoneNameAr" className="mt-2 w-full" {...register('zoneNameAr')} />
        {errors.zoneNameAr && <span className="error-message">{t(errors.zoneNameAr.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="code">{t('ZONE_CODE')} <span className="ml-1 text-red-500">*</span></Label>
        <Input id="zoneNameAr" className="mt-2 w-full" {...register('code')} />
        {errors.code && <span className="error-message">{t(errors.code.message!)}</span>}
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

    
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {t("SAVE")}
        </Button>
      </div>
    </form>
  );
}

export default NewZone;

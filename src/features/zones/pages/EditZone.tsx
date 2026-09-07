import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getZoneById, updateZone, checkZoneExists } from '../api/zoneService';
import { useAuth } from '../../auth/hooks/useAuth';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { useForm, Controller } from 'react-hook-form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';

import {
  fetchGovernorates,
  fetchCitiesOfGovernorate,
} from 'src/features/customers/api/customerService';
import { Check, ChevronsUpDown,Plus } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from 'sweetalert2';
import { Autocomplete, TextField } from '@mui/material';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';
import { createZoneSchema } from '../validation';
import { useLocation } from 'react-router-dom';

function EditZone() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const { t, i18n } = useTranslation();
  const [isGovernorateSelected, setIsGovernorateSelected] = useState(false);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const currentZone = location.state?.zone;
  const isArabic = i18n.language.startsWith('ar');

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
    resolver: zodResolver(createZoneSchema),
  });

  const nameEn = watch('zoneNameEn');
  const nameAr = watch('zoneNameAr');
  const code = watch('code');
  const governorateId = watch('governorateId');

  useEffect(() => {
    if (!currentZone) navigate('/zones');

    const fetchZone = async () => {
      try {
        const response = await getZoneById(currentZone.id);

        reset({
          zoneNameEn: response.data.name_en,
          zoneNameAr: response.data.name_ar,
          code: response.data.code,
          governorateId: response.data.governorate_id,
          cityId: response.data.city_id,
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          navigate('/404', { replace: true });
          return;
        }
        console.error(error);
      }
    };

    fetchZone();
  }, [id, reset]);

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

  

  const checkFieldExists = async (
    field: 'name_en' | 'name_ar' | 'code',
    value: string,
    formField: 'zoneNameEn' | 'zoneNameAr' | 'code',
    errorMessage: string,
  ) => {
    try {
      const response = await checkZoneExists(field, value, currentZone.id);

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
    if (!nameEn || nameEn.trim() === '') {
      clearErrors('zoneNameEn');
      return;
    }

    const timer = setTimeout(() => {
      checkFieldExists('name_en', nameEn, 'zoneNameEn', 'ZONE_EN_ALREADY_EXISTS');
    }, 500);

    return () => clearTimeout(timer);
  }, [nameEn]);

  useEffect(() => {
    if (!nameAr || nameAr.trim() === '') {
      clearErrors('zoneNameAr');
      return;
    }

    const timer = setTimeout(() => {
      checkFieldExists('name_ar', nameAr, 'zoneNameAr', 'ZONE_AR_ALREADY_EXISTS');
    }, 500);

    return () => clearTimeout(timer);
  }, [nameAr]);

  useEffect(() => {
    if (!code || code.trim() === '') {
      clearErrors('code');
      return;
    }

    const timer = setTimeout(() => {
      checkFieldExists('code', code, 'code', 'ZONE_CODE_ALREADY_EXISTS');
    }, 500);

    return () => clearTimeout(timer);
  }, [code]);

  const handleSave = async (data: any) => {
    if (!currentZone) return;
    console.log(data);
    try {
      await updateZone(currentZone.id, data);

      toast.success(t('ZONE_UPDATED_SUCCESSFULLY'));
      navigate('/zones');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;

        console.log('Backend message:', message);

        if (t(message) === t('ZONE_EN_ALREADY_EXISTS')) {
          setError('zoneNameEn', {
            type: 'server',
            message: 'ZONE_EN_ALREADY_EXISTS',
          });
          return;
        }

        if (t(message) === t('ZONE_AR_ALREADY_EXISTS')) {
          setError('zoneNameAr', {
            type: 'server',
            message: 'ZONE_AR_ALREADY_EXISTS',
          });
          return;
        }

        if (t(message) === t('ZONE_CODE_ALREADY_EXISTS')) {
          setError('code', {
            type: 'server',
            message: 'ZONE_CODE_ALREADY_EXISTS',
          });
          return;
        }
      }

      console.error('Unexpected error:', error);
    }
  };

  return (
    <form
      className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      onSubmit={handleSubmit(handleSave)}
    >
      <div>
        <Label htmlFor="zoneNameEn">{t('ZONE_NAME_EN')}</Label>
        <Input id="zoneNameEn" className="mt-2 w-full" {...register('zoneNameEn')} />
        {errors.zoneNameEn && (
          <span className="error-message">{t(errors.zoneNameEn.message!)}</span>
        )}
      </div>

      <div>
        <Label htmlFor="zoneNameAr">{t('ZONE_NAME_AR')}</Label>
        <Input id="zoneNameAr" className="mt-2 w-full" {...register('zoneNameAr')} />
        {errors.zoneNameAr && (
          <span className="error-message">{t(errors.zoneNameAr.message!)}</span>
        )}
      </div>

      <div>
        <Label htmlFor="code">
          {t('ZONE_CODE')} <span className="ml-1 text-red-500">*</span>
        </Label>
        <Input id="code" className="mt-2 w-full" {...register('code')} />
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
          {t('SAVE')}
        </Button>
      </div>
    </form>
  );
}

export default EditZone;

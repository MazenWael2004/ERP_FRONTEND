import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import Swal from 'sweetalert2';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'src/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { createPricingSchema } from '../validation';
import { fetchPrograms } from 'src/features/programs/api/programService.ts';
import { createPricing } from '../api/pricingService';
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
import { Check, ChevronsUpDown, Plus, Trash2 } from 'lucide-react';
import { Label } from 'src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from 'src/components/ui/select';
import { Button } from 'src/components/ui/button';

export default function NewPricing() {
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isArabic = i18n.language.startsWith('ar');

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPricingSchema),

    defaultValues: {
      nameEn: '',
      nameAr: '',
      downPayment: undefined,
      numberOfMonthsPaidAdvance: undefined,

      periods: [
        {
          fromMonth: undefined,
          toMonth: undefined,
          price: undefined,
        },
      ],
    },
  });

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'periods',
  });

  const handleSave = async (data: any) => {
    setIsLoading(true);

    try {
      const result = await createPricing(data);

      console.log(result);

      await Swal.fire({
        icon: 'success',
        title: t('SUCCESS'),
        text: t('PRICING_CREATED_SUCCESSFULLY'),
        showConfirmButton: false,
        timer: 1500,
      });

      nav('/pricings');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;

        console.log('Backend message:', message);

        if (t(message) === t('PRICING_NAME_EN_EXISTS')) {
          setError('nameEn', {
            type: 'server',
            message: 'PRICING_NAME_EN_EXISTS',
          });
          return;
        }

        if (t(message) === t('PRICING_NAME_AR_EXISTS')) {
          setError('nameAr', {
            type: 'server',
            message: 'PRICING_NAME_AR_EXISTS',
          });
          return;
        }

        if (t(message) === t('PRICING_CODE_EXISTS')) {
          setError('code', {
            type: 'server',
            message: 'PRICING_CODE_EXISTS',
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
      onSubmit={handleSubmit(
        (data) => {
          console.log('SUBMITTED DATA:', data);
          handleSave(data);
        },
        (errors) => {
          console.log('VALIDATION ERRORS:', errors);
        },
      )}
    >
      <div>
        <Label htmlFor="pricingNameEn">
          {t('PRICING_NAME_EN')} <span className="text-red-500">*</span>
        </Label>
        <Input id="pricingNameEn" className="mt-2 w-full" {...register('nameEn')} />
        {errors.nameEn && <span className="error-message">{t(errors.nameEn.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="pricingNameAr">
          {t('PRICING_NAME_AR')} <span className="text-red-500">*</span>
        </Label>
        <Input id="employeeNameAr" className="mt-2 w-full" {...register('nameAr')} />
        {errors.nameAr && <span className="error-message">{t(errors.nameAr.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="code">
          {t('PRICING_CODE')} <span className="text-red-500">*</span>
        </Label>
        <Input id="code" className="mt-2 w-full" {...register('code')} />
        {errors.code && <span className="error-message">{t(errors.code.message!)}</span>}
      </div>

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

      <div>
        <Label htmlFor="downPayment">
          {t('DOWN_PAYMENT')}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="downPayment"
          className="mt-2 w-full"
          {...register('downPayment', {
            valueAsNumber: true,
          })}
        />
        {errors.downPayment && (
          <span className="error-message">{t(errors.downPayment.message!)}</span>
        )}
      </div>

      <div>
        <Label htmlFor="downPayment">
          {t('NUMBER_OF_MONTHS_PAID_ADVANCE')}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="numberOfMonthsPaidAdvance"
          className="mt-2 w-full"
          {...register('numberOfMonthsPaidAdvance', {
            valueAsNumber: true,
          })}
        />
        {errors.numberOfMonthsPaidAdvance && (
          <span className="error-message">{t(errors.numberOfMonthsPaidAdvance.message!)}</span>
        )}
      </div>

      {/* Pricing Periods */}
      <div className="md:col-span-2 mt-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{t('PRICING_PERIODS')}</h3>

            <p className="text-sm text-muted-foreground mt-1">{t('PRICING_PERIODS_DESCRIPTION')}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                fromMonth: undefined,
                toMonth: undefined,
                price: undefined,
              })
            }
            className="flex items-center gap-2"
          >
            <Plus size={17} />
            {t('ADD_PERIOD')}
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="
          rounded-xl
          border
          bg-card
          p-5
          shadow-sm
          transition
          hover:shadow-md
        "
            >
              {/* Period header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-primary/10
                text-sm
                font-semibold
                text-primary
              "
                  >
                    {index + 1}
                  </div>

                  <h4 className="font-medium">
                    {t('PERIOD')} {index + 1}
                  </h4>
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </Button>
                )}
              </div>

              {/* Period inputs */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* From month */}
                <div>
                  <Label htmlFor={`fromMonth-${index}`}>
                    {t('FROM_MONTH')}
                    <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    id={`fromMonth-${index}`}
                    type="number"
                    min={1}
                    placeholder={t('FROM_MONTH')}
                    className="mt-2 w-full"
                    {...register(`periods.${index}.fromMonth`, {
                      valueAsNumber: true,
                    })}
                  />

                  {errors.periods?.[index]?.fromMonth && (
                    <span className="error-message">
                      {t(errors.periods[index]?.fromMonth?.message!)}
                    </span>
                  )}
                </div>

                {/* To month */}
                <div>
                  <Label htmlFor={`toMonth-${index}`}>
                    {t('TO_MONTH')}
                    <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    id={`toMonth-${index}`}
                    type="number"
                    min={1}
                    placeholder={t('TO_MONTH')}
                    className="mt-2 w-full"
                    {...register(`periods.${index}.toMonth`, {
                      valueAsNumber: true,
                    })}
                  />

                  {errors.periods?.[index]?.toMonth && (
                    <span className="error-message">
                      {t(errors.periods[index]?.toMonth?.message!)}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div>
                  <Label htmlFor={`price-${index}`}>
                    {t('SUBSCRIPTION_PRICE')}
                    <span className="text-red-500">*</span>
                  </Label>

                  <div className="relative mt-2">
                    <Input
                      id={`price-${index}`}
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder={t('SUBSCRIPTION_PRICE')}
                      className="w-full pe-14"
                      {...register(`periods.${index}.price`, {
                        valueAsNumber: true,
                      })}
                    />

                    <span
                      className="
                  pointer-events-none
                  absolute
                  end-3
                  top-1/2
                  -translate-y-1/2
                  text-xs
                  font-medium
                  text-muted-foreground
                "
                    >
                      {t('EGP')}
                    </span>
                  </div>

                  {errors.periods?.[index]?.price && (
                    <span className="error-message">
                      {t(errors.periods[index]?.price?.message!)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* General periods error */}
        {errors.periods?.message && (
          <span className="error-message mt-2 block">{t(errors.periods.message)}</span>
        )}
      </div>

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

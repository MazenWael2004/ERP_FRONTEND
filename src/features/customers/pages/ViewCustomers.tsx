import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { fetchCustomers, deleteCustomer } from '../api/customerService';
import { fetchGovernorates, fetchCities, fetchCitiesOfGovernorate } from '../api/customerService';
import { fetchZones } from 'src/features/zones/api/zoneService';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { Input } from 'src/components/ui/input';
import { fetchPrograms } from 'src/features/programs/api/programService.ts';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Label } from 'src/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from 'src/components/ui/select';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { DataTable } from 'src/components/utilities/table/DataTable';
import { Button } from 'src/components/ui/button';
import { Plus, Download, Filter, X } from 'lucide-react';

import Swal from 'sweetalert2';
import jobIcon from '../../../assets/images/logos/job-offer.png';
import { useAuth } from 'src/features/auth/hooks/useAuth';

export default function ViewCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, hasPermission } = useAuth();
  const canEdit = hasPermission('/customers', 'WRITE');
  const canDelete = hasPermission('/customers', 'DELETE');
  const canAdd = hasPermission('/customers', 'CREATE');
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isGovernorateSelected, setIsGovernorateSelected] = useState(false);
  const [zones, setZones] = useState([]);
  const isArabic = i18n.language.startsWith('ar');
  const [filterOpen, setFilterOpen] = useState(false);
  const [programs, setPrograms] = useState([]);

  const customerColumns = [
    {
      accessorKey: 'name_en',
      header: t('CUSTOMER_NAME_EN'),
    },
    {
      accessorKey: 'name_ar',
      header: t('CUSTOMER_NAME_AR'),
    },
    {
      accessorKey: 'code',
      header: t('CUSTOMER_CODE'),
    },
    {
      accessorKey: isArabic ? 'zone_name_ar' : 'zone_name_en',
      header: t('ZONE'),
    },

    {
      accessorKey: isArabic ? 'program_name_ar' : 'program_name_en',
      header: t('PROGRAM'),
    },
  ];

  const {
    register: registerFilter,
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    watch,
    reset: resetFilters,
  } = useForm({
    defaultValues: {
      governorateId: null,
      cityId: null,
    },
  });

  const governorateId = watch('governorateId');

  const handleEditCustomer = (customer: any) => {
    nav('/customers/edit', {
      state: { customer: customer },
    });
  };

  const handleReset = () => {
    resetFilters({
      cityId: null,
      governorateId: null,
    });
  };

  useEffect(() => {
    async function loadGovernorates() {
      try {
        const response = await fetchGovernorates(); // your API
        setGovernorates(response.data);
        // console.log(governorates);
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

  const loadCustomers = async (filters = {}) => {
    try {
      setLoading(true);

      console.log('Loading customers with filters:', filters);

      const response = await fetchCustomers(filters);

      console.log('Customers response:', response);

      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadCustomers();
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

  const handleApplyFilters = async (filters: any) => {
    console.log('FILTERS:', filters);

    await loadCustomers(filters);

    setFilterOpen(false);
  };

  const handleDelete = async (customer: any) => {
    const result = await Swal.fire({
      title: t('ARE_YOU_SURE'),
      text: t('CANNOT_UNDO_ACTION'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('YES_DELETE'),
      cancelButtonText: t('CANCEL'),
    });

    if (!result.isConfirmed) return;

    try {
      await deleteCustomer(customer.id);

      await Swal.fire({
        title: t('DELETED'),
        text: t('CUSTOMER_DELETED_SUCCESSFULLY'),
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      await loadCustomers();
    } catch (error) {
      console.error('Failed to delete job:', error);

      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete the job.',
        icon: 'error',
      });
    }
  };

  return (
    <>
      <BreadcrumbComp title={t('CUSTOMERS_TABLE')} breadCrumbBg={jobIcon} />
      <div className="flex gap-6 flex-col ">
        <div className="flex gap-6 flex-col">
          <div className="flex justify-end gap-2">
            {canAdd && (
              <Button
                onClick={() => nav('/customers/new-customer')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('ADD_CUSTOMER')}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => setFilterOpen((prev) => !prev)}
              className={`transition-all duration-200 ${
                filterOpen
                  ? 'border-slate-700 bg-slate-100 text-slate-900'
                  : 'border-slate-500 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Filter className="mr-2 h-4 w-4" />
              {t('FILTER')}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="border-blue-600 text-blue-600
             hover:bg-blue-50 hover:text-blue-700
             transition-all duration-200"
            >
              <Download className="mr-2 h-4 w-4" />
              {t('EXPORT')}
            </Button>
          </div>
          {/* Filter Panel */}
          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogContent
              dir={isArabic ? 'rtl' : 'ltr'}
              className={`sm:max-w-[420px] ${
                isArabic ? '[&>button]:right-auto [&>button]:left-4' : ''
              }`}
            >
              <DialogHeader>
                <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
                  {t('FILTER_CUSTOMERS')}
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleFilterSubmit(handleApplyFilters)}
                dir={isArabic ? 'rtl' : 'ltr'}
              >
                {/* Filters */}
                <div className="space-y-4">
                  {/* Governorate + City */}
                  <div className="grid grid-cols-2 gap-3">
                    <Controller
                      name="governorateId"
                      control={filterControl}
                      render={({ field }) => {
                        const selectedGovernorate = governorates.find(
                          (governorate) => Number(governorate.id) === Number(field.value),
                        );

                        return (
                          <div>
                            <Label>{t('GOVERNORATE')}</Label>
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
                          </div>
                        );
                      }}
                    />

                    {isGovernorateSelected && (
        <Controller
          name="cityId"
          control={filterControl}
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

              
              </div>
            );
          }}
        />
      )}
                  </div>

                  {/* Zone */}
                  {/* <Controller
                    name="zoneId"
                    control={filterControl}
                    render={({ field }) => {
                      const selectedZone = zones.find(
                        (zone) => Number(zone.id) === Number(field.value),
                      );

                      return (
                        <div>
                          <Label>{t('ZONE')}</Label>
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
                                          onSelect={() => field.onChange(Number(zone.id))}
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
                        </div>
                      );
                    }}
                  /> */}

                  {/* Program */}
                  {/* <Controller
                    name="programId"
                    control={filterControl}
                    render={({ field }) => {
                      const selectedProgram = programs.find(
                        (program) => Number(program.id) === Number(field.value),
                      );

                      return (
                        <div>
                          <Label>{t('PROGRAM')}</Label>
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
                                          onSelect={() => field.onChange(Number(program.id))}
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
                        </div>
                      );
                    }}
                  /> */}
                </div>

                {/* Footer */}
                <div
                  className={`mt-6 flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 ${
                    isArabic ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="border-red-300 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/50 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 transition-colors duration-200"
                  >
                    {t('RESET')}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  >
                    <Filter className={`${isArabic ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    {t('APPLY_FILTER')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable
          data={customers}
          columns={customerColumns}
          onEdit={
            canEdit
              ? (customer) => {
                  handleEditCustomer(customer);
                }
              : undefined
          }
          onDelete={
            canDelete
              ? (customer) => {
                  handleDelete(customer);
                }
              : undefined
          }
        />
      </div>
    </>
  );
}

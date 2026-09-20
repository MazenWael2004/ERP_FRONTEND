
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';

import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { DataTable } from 'src/components/utilities/table/DataTable';
import { useAuth } from 'src/features/auth/hooks/useAuth';

import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';

import { Filter, RotateCcw } from 'lucide-react';

type FilterForm = {
  startDate: string;
  endDate: string;
  representative: string;
  customer: string;
  collectionType: string;
  paymentMethod: string;
  status: string;
};

export default function ViewCollections() {
  const { t, i18n } = useTranslation();
  const { hasPermission } = useAuth();

  const isArabic = i18n.language.startsWith('ar');

  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  /*
   * Applied filters.
   *
   * These are separate from the form values so that
   * changing a value inside the dialog does not immediately
   * change the table.
   */
  const [appliedFilters, setAppliedFilters] =
    useState<FilterForm>({
      startDate: '',
      endDate: '',
      representative: 'ALL',
      customer: '',
      collectionType: 'ALL',
      paymentMethod: 'ALL',
      status: 'ALL',
    });

  /*
   * Filter form
   */
  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilterForm,
  } = useForm<FilterForm>({
    defaultValues: {
      startDate: '',
      endDate: '',
      representative: 'ALL',
      customer: '',
      collectionType: 'ALL',
      paymentMethod: 'ALL',
      status: 'ALL',
    },
  });

  /*
   * Mock collections
   */
  const mockCollections = [
    {
      id: 1,
      collection_number: 'COL-2026-0001',
      collection_date: '2026-09-01',
      contract_number: 'CNT-2026-0001',
      customer_name: 'El Shorouk Pharmacy',
      branch_name: 'El Shorouk Main Branch',
      representative_name: 'Ahmed Hassan',
      collection_type: 'DOWN_PAYMENT',
      amount: 7000,
      payment_method: 'CASH',
      status: 'RECEIVED',
    },
    {
      id: 2,
      collection_number: 'COL-2026-0002',
      collection_date: '2026-09-02',
      contract_number: 'CNT-2026-0002',
      customer_name: 'Care Plus Pharmacies',
      branch_name: 'Nasr City Branch',
      representative_name: 'Mohamed Ali',
      collection_type: 'SUBSCRIPTION',
      amount: 500,
      payment_method: 'CASH',
      status: 'TRANSFERRED',
    },
    {
      id: 3,
      collection_number: 'COL-2026-0003',
      collection_date: '2026-09-03',
      contract_number: 'CNT-2026-0003',
      customer_name: 'Life Care Pharmacy',
      branch_name: 'Heliopolis Branch',
      representative_name: 'Omar Khaled',
      collection_type: 'DOWN_PAYMENT',
      amount: 5000,
      payment_method: 'BANK_TRANSFER',
      status: 'RECEIVED',
    },
    {
      id: 4,
      collection_number: 'COL-2026-0004',
      collection_date: '2026-09-04',
      contract_number: 'CNT-2026-0004',
      customer_name: 'United Pharmacies',
      branch_name: 'Maadi Branch',
      representative_name: 'Ahmed Hassan',
      collection_type: 'SUBSCRIPTION',
      amount: 500,
      payment_method: 'CREDIT_CARD',
      status: 'TRANSFERRED',
    },
    {
      id: 5,
      collection_number: 'COL-2026-0005',
      collection_date: '2026-09-05',
      contract_number: 'CNT-2026-0005',
      customer_name: 'Al Amal Pharmacy',
      branch_name: 'Dokki Branch',
      representative_name: 'Youssef Samir',
      collection_type: 'ADDITIONAL_UNIT',
      amount: 4000,
      payment_method: 'CASH',
      status: 'RECEIVED',
    },
    {
      id: 6,
      collection_number: 'COL-2026-0006',
      collection_date: '2026-09-06',
      contract_number: 'CNT-2026-0006',
      customer_name: 'Healthy Life Pharmacy',
      branch_name: '6th October Branch',
      representative_name: 'Mohamed Ali',
      collection_type: 'SUBSCRIPTION',
      amount: 500,
      payment_method: 'CHEQUE',
      status: 'TRANSFERRED',
    },
    {
      id: 7,
      collection_number: 'COL-2026-0007',
      collection_date: '2026-09-08',
      contract_number: 'CNT-2026-0001',
      customer_name: 'El Shorouk Pharmacy',
      branch_name: 'El Shorouk Main Branch',
      representative_name: 'Ahmed Hassan',
      collection_type: 'SUBSCRIPTION',
      amount: 600,
      payment_method: 'CASH',
      status: 'RECEIVED',
    },
    {
      id: 8,
      collection_number: 'COL-2026-0008',
      collection_date: '2026-09-10',
      contract_number: 'CNT-2026-0003',
      customer_name: 'Life Care Pharmacy',
      branch_name: 'Heliopolis Branch',
      representative_name: 'Omar Khaled',
      collection_type: 'OTHER_SERVICE',
      amount: 1500,
      payment_method: 'ONLINE_PAYMENT',
      status: 'TRANSFERRED',
    },
  ];

  /*
   * Load collections
   */
  const loadCollections = async () => {
    try {
      setLoading(true);

      /*
       * TODO:
       *
       * const response = await fetchCollections();
       * setCollections(response.data);
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      setCollections(mockCollections);
    } catch (error) {
      console.error(
        'Failed to fetch collections:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  /*
   * Apply filters
   */
  const handleApplyFilters = (values: FilterForm) => {
    setAppliedFilters(values);
    setFilterOpen(false);
  };

  /*
   * Reset filters
   */
  const handleReset = () => {
    const defaultFilters: FilterForm = {
      startDate: '',
      endDate: '',
      representative: 'ALL',
      customer: '',
      collectionType: 'ALL',
      paymentMethod: 'ALL',
      status: 'ALL',
    };

    resetFilterForm(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  /*
   * Filter data
   */
  const filteredCollections = useMemo(() => {
    return collections.filter((collection) => {

      /*
       * Date range
       */
      if (
        appliedFilters.startDate &&
        collection.collection_date <
          appliedFilters.startDate
      ) {
        return false;
      }

      if (
        appliedFilters.endDate &&
        collection.collection_date >
          appliedFilters.endDate
      ) {
        return false;
      }

      /*
       * Representative
       */
      if (
        appliedFilters.representative !== 'ALL' &&
        collection.representative_name !==
          appliedFilters.representative
      ) {
        return false;
      }

      /*
       * Customer
       */
      if (
        appliedFilters.customer &&
        !collection.customer_name
          .toLowerCase()
          .includes(
            appliedFilters.customer.toLowerCase()
          )
      ) {
        return false;
      }

      /*
       * Collection type
       */
      if (
        appliedFilters.collectionType !== 'ALL' &&
        collection.collection_type !==
          appliedFilters.collectionType
      ) {
        return false;
      }

      /*
       * Payment method
       */
      if (
        appliedFilters.paymentMethod !== 'ALL' &&
        collection.payment_method !==
          appliedFilters.paymentMethod
      ) {
        return false;
      }

      /*
       * Status
       */
      if (
        appliedFilters.status !== 'ALL' &&
        collection.status !== appliedFilters.status
      ) {
        return false;
      }

      return true;
    });
  }, [collections, appliedFilters]);

  /*
   * Summary
   */
  const totalCollected = filteredCollections.reduce(
    (total, collection) =>
      total + Number(collection.amount),
    0
  );

  const totalReceived = filteredCollections
    .filter(
      (collection) => collection.status === 'RECEIVED'
    )
    .reduce(
      (total, collection) =>
        total + Number(collection.amount),
      0
    );

  const totalTransferred = filteredCollections
    .filter(
      (collection) =>
        collection.status === 'TRANSFERRED'
    )
    .reduce(
      (total, collection) =>
        total + Number(collection.amount),
      0
    );

  /*
   * Table columns
   */
  const collectionColumns = [
    {
      accessorKey: 'collection_number',
      header: t('COLLECTION_NUMBER'),
    },
    {
      accessorKey: 'collection_date',
      header: t('COLLECTION_DATE'),
    },
    {
      accessorKey: 'contract_number',
      header: t('CONTRACT_NUMBER'),
    },
    {
      accessorKey: 'customer_name',
      header: t('CUSTOMER'),
    },
    {
      accessorKey: 'branch_name',
      header: t('BRANCH'),
    },
    {
      accessorKey: 'representative_name',
      header: t('REPRESENTATIVE'),
    },
    {
      accessorKey: 'collection_type',
      header: t('COLLECTION_TYPE'),
      cell: ({ row }: any) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {t(row.original.collection_type)}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: t('AMOUNT'),
      cell: ({ row }: any) => (
        <span className="font-semibold">
          {Number(
            row.original.amount
          ).toLocaleString()}{' '}
          EGP
        </span>
      ),
    },
    {
      accessorKey: 'payment_method',
      header: t('PAYMENT_METHOD'),
      cell: ({ row }: any) =>
        t(row.original.payment_method),
    },
    {
      accessorKey: 'status',
      header: t('STATUS'),
      cell: ({ row }: any) => {
        const status = row.original.status;

        const styles: Record<string, string> = {
          RECEIVED:
            'bg-yellow-100 text-yellow-800',
          TRANSFERRED:
            'bg-green-100 text-green-800',
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              styles[status] ||
              'bg-gray-100 text-gray-800'
            }`}
          >
            {t(status)}
          </span>
        );
      },
    },
  ];

  // if (!hasPermission('/collections', 'READ')) {
  //   return null;
  // }

  return (
    <>
      <BreadcrumbComp
        title={t('COLLECTIONS_TABLE')}
      
      />

      <div className="flex flex-col gap-6">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('TOTAL_COLLECTED')}
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {totalCollected.toLocaleString()} EGP
            </h2>
          </div>

          <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('NOT_TRANSFERRED')}
            </p>

            <h2 className="text-2xl font-bold mt-2 text-yellow-600">
              {totalReceived.toLocaleString()} EGP
            </h2>
          </div>

          <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('TRANSFERRED_TO_FINANCE')}
            </p>

            <h2 className="text-2xl font-bold mt-2 text-green-600">
              {totalTransferred.toLocaleString()} EGP
            </h2>
          </div>

        </div>

        {/* Top actions */}
        <div className="flex justify-end">

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setFilterOpen((prev) => !prev)
            }
            className={`transition-all duration-200 ${
              filterOpen
                ? 'border-slate-700 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                : 'border-slate-500 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            <Filter
              className={`${
                isArabic ? 'ml-2' : 'mr-2'
              } h-4 w-4`}
            />

            {t('FILTER')}
          </Button>

        </div>

        {/* Collections Table */}
        <DataTable
          data={filteredCollections}
          columns={collectionColumns}
        />

      </div>

      {/* Filter Dialog */}
      <Dialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
      >
        <DialogContent
          dir={isArabic ? 'rtl' : 'ltr'}
          className={`sm:max-w-[500px] ${
            isArabic
              ? '[&>button]:right-auto [&>button]:left-4'
              : ''
          }`}
        >

          <DialogHeader>
            <DialogTitle
              className={
                isArabic
                  ? 'text-right'
                  : 'text-left'
              }
            >
              {t('FILTER_COLLECTIONS')}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleFilterSubmit(
              handleApplyFilters
            )}
            dir={isArabic ? 'rtl' : 'ltr'}
          >

            {/* Collection Date */}
            <div className="mb-5">

              <Label className="text-sm font-medium">
                {t('COLLECTION_DATE')}
              </Label>

              <div className="mt-2 grid grid-cols-2 gap-3">

                {/* From */}
                <Controller
                  name="startDate"
                  control={filterControl}
                  render={({ field }) => (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">
                        {t('FROM')}
                      </Label>

                      <Input
                        type="date"
                        {...field}
                        value={field.value || ''}
                        className="mt-1 w-full"
                      />
                    </div>
                  )}
                />

                {/* To */}
                <Controller
                  name="endDate"
                  control={filterControl}
                  render={({ field }) => (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">
                        {t('TO')}
                      </Label>

                      <Input
                        type="date"
                        {...field}
                        value={field.value || ''}
                        className="mt-1 w-full"
                      />
                    </div>
                  )}
                />

              </div>
            </div>

            {/* Representative */}
            <div className="mb-4">

              <Label>
                {t('REPRESENTATIVE')}
              </Label>

              <Controller
                name="representative"
                control={filterControl}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className="mt-2 w-full"
                      dir={
                        isArabic
                          ? 'rtl'
                          : 'ltr'
                      }
                    >
                      <SelectValue
                        placeholder={t(
                          'SELECT_REPRESENTATIVE'
                        )}
                      />
                    </SelectTrigger>

                    <SelectContent
                      dir={
                        isArabic
                          ? 'rtl'
                          : 'ltr'
                      }
                    >
                      <SelectItem value="ALL">
                        {t('ALL')}
                      </SelectItem>

                      <SelectItem value="Ahmed Hassan">
                        Ahmed Hassan
                      </SelectItem>

                      <SelectItem value="Mohamed Ali">
                        Mohamed Ali
                      </SelectItem>

                      <SelectItem value="Omar Khaled">
                        Omar Khaled
                      </SelectItem>

                      <SelectItem value="Youssef Samir">
                        Youssef Samir
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

            </div>

            {/* Customer */}
            <div className="mb-4">

              <Label>
                {t('CUSTOMER')}
              </Label>

              <Controller
                name="customer"
                control={filterControl}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder={t(
                      'SEARCH_CUSTOMER'
                    )}
                    className="mt-2"
                  />
                )}
              />

            </div>

            {/* Collection Type */}
            <div className="mb-4">

              <Label>
                {t('COLLECTION_TYPE')}
              </Label>

              <Controller
                name="collectionType"
                control={filterControl}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className="mt-2 w-full"
                      dir={
                        isArabic
                          ? 'rtl'
                          : 'ltr'
                      }
                    >
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent
                      dir={
                        isArabic
                          ? 'rtl'
                          : 'ltr'
                      }
                    >
                      <SelectItem value="ALL">
                        {t('ALL')}
                      </SelectItem>

                      <SelectItem value="SUBSCRIPTION">
                        {t('SUBSCRIPTION')}
                      </SelectItem>

                      <SelectItem value="DOWN_PAYMENT">
                        {t('DOWN_PAYMENT')}
                      </SelectItem>

                      <SelectItem value="ADDITIONAL_UNIT">
                        {t('ADDITIONAL_UNIT')}
                      </SelectItem>

                      <SelectItem value="OTHER_SERVICE">
                        {t('OTHER_SERVICE')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

            </div>

            {/* Payment Method */}
            <div className="mb-4">

              <Label>
                {t('PAYMENT_METHOD')}
              </Label>

              <Controller
                name="paymentMethod"
                control={filterControl}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className="mt-2 w-full"
                      dir={
                        isArabic
                          ? 'rtl'
                          : 'ltr'
                      }
                    >
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent
                      dir={
                        isArabic
                          ? 'rtl'
                          : 'ltr'
                      }
                    >
                      <SelectItem value="ALL">
                        {t('ALL')}
                      </SelectItem>

                      <SelectItem value="CASH">
                        {t('CASH')}
                      </SelectItem>

                      <SelectItem value="BANK_TRANSFER">
                        {t('BANK_TRANSFER')}
                      </SelectItem>

                      <SelectItem value="CREDIT_CARD">
                        {t('CREDIT_CARD')}
                      </SelectItem>

                      <SelectItem value="CHEQUE">
                        {t('CHEQUE')}
                      </SelectItem>

                      <SelectItem value="ONLINE_PAYMENT">
                        {t('ONLINE_PAYMENT')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

            </div>

            {/* Status */}
            <Controller
              name="status"
              control={filterControl}
              render={({ field }) => (
                <div>
                  <Label>
                    {t('STATUS')}
                  </Label>

                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className="mt-2 w-full"
                      dir={
                        isArabic
                          ? 'rtl'
                          : 'ltr'
                      }
                    >
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent
                      dir={
                        isArabic
                          ? 'rtl'
                          : 'ltr'
                      }
                    >
                      <SelectItem value="ALL">
                        {t('ALL')}
                      </SelectItem>

                      <SelectItem value="RECEIVED">
                        {t('RECEIVED')}
                      </SelectItem>

                      <SelectItem value="TRANSFERRED">
                        {t('TRANSFERRED')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* Footer */}
            <div
              className={`mt-6 flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 ${
                isArabic
                  ? 'justify-start'
                  : 'justify-end'
              }`}
            >

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="border-red-300 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/50 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 transition-colors duration-200"
              >
                <RotateCcw
                  className={`${
                    isArabic
                      ? 'ml-2'
                      : 'mr-2'
                  } h-4 w-4`}
                />

                {t('RESET')}
              </Button>

              <Button
                type="submit"
                className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                <Filter
                  className={`${
                    isArabic
                      ? 'ml-2'
                      : 'mr-2'
                  } h-4 w-4`}
                />

                {t('APPLY_FILTER')}
              </Button>

            </div>

          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}


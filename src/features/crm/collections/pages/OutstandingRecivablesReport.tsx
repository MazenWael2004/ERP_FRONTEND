import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { DataTable } from 'src/components/utilities/table/DataTable';
import { Card } from 'src/components/ui/card';
import { CircleDollarSign, Wallet, AlertCircle } from 'lucide-react';



const mockData = [
  {
    id: 1,
    customer_name: 'A-Pharmacy',
    gln_code: '6221234500012',
    invoice_number: 'INV-2026-0001',
    billing_period_start: '2026-09-01',
    billing_period_end: '2026-09-30',
    amount_due: 500,
    amount_paid: 500,
    remaining_amount: 0,
    payment_status: 'FULLY PAID',
  },
  {
    id: 2,
    customer_name: 'A-Pharmacy',
    gln_code: '6221234500012',
    invoice_number: 'INV-2026-0002',
    billing_period_start: '2026-10-01',
    billing_period_end: '2026-10-31',
    amount_due: 500,
    amount_paid: 300,
    remaining_amount: 200,
    payment_status: 'PARTIALLY PAID',
  },
  {
    id: 3,
    customer_name: 'Care Plus Pharmacies',
    gln_code: '6221234500029',
    invoice_number: 'INV-2026-0003',
    billing_period_start: '2026-09-01',
    billing_period_end: '2026-09-30',
    amount_due: 600,
    amount_paid: 600,
    remaining_amount: 0,
    payment_status: 'FULLY PAID',
  },
  {
    id: 4,
    customer_name: 'Care Plus Pharmacies',
    gln_code: '6221234500036',
    invoice_number: 'INV-2026-0005',
    billing_period_start: '2026-09-01',
    billing_period_end: '2026-09-30',
    amount_due: 600,
    amount_paid: 400,
    remaining_amount: 200,
    payment_status: 'PARTIALLY PAID',
  },
  {
    id: 5,
    customer_name: 'Techno Medical Supplies',
    gln_code: '6221234500043',
    invoice_number: 'INV-2026-0006',
    billing_period_start: '2026-09-01',
    billing_period_end: '2026-09-30',
    amount_due: 500,
    amount_paid: 500,
    remaining_amount: 0,
    payment_status: 'FULLY PAID',
  },
  {
    id: 6,
    customer_name: 'Future Medical Group',
    gln_code: '6221234500050',
    invoice_number: 'INV-2026-0007',
    billing_period_start: '2026-09-01',
    billing_period_end: '2026-09-30',
    amount_due: 600,
    amount_paid: 0,
    remaining_amount: 600,
    payment_status: 'UNPAID',
  },
  {
    id: 7,
    customer_name: 'Future Medical Group',
    gln_code: '6221234500067',
    invoice_number: 'INV-2026-0008',
    billing_period_start: '2026-09-01',
    billing_period_end: '2026-09-30',
    amount_due: 500,
    amount_paid: 250,
    remaining_amount: 250,
    payment_status: 'PARTIALLY PAID',
  },
];

export default function OutstandingReport() {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language.startsWith('ar');

  const [reportData] = useState(mockData);

  const summary = useMemo(() => {
    return reportData.reduce(
      (acc, row) => {
        acc.amountDue += Number(row.amount_due || 0);
        acc.amountPaid += Number(row.amount_paid || 0);
        acc.remaining += Number(row.remaining_amount || 0);

        return acc;
      },
      {
        amountDue: 0,
        amountPaid: 0,
        remaining: 0,
      }
    );
  }, [reportData]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-EG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getPaymentStatus = (status: string) => {
    switch (status) {
      case 'FULLY PAID':
        return t('FULLY_PAID');

      case 'PARTIALLY PAID':
        return t('PARTIALLY_PAID');

      case 'UNPAID':
        return t('UNPAID');

      default:
        return status;
    }
  };

  const outstandingColumns = [
    {
      accessorKey: 'customer_name',
      header: t('CUSTOMER'),
    },
    {
      accessorKey: 'gln_code',
      header: t('BRANCH'),
    },
    {
      accessorKey: 'invoice_number',
      header: t('INVOICE'),
    },
    {
      accessorKey: 'billing_period_start',
      header: t('BILLING_PERIOD'),
      cell: ({ row }: any) => {
        const start = row.original.billing_period_start;
        const end = row.original.billing_period_end;

        if (!start) return '-';

        return `${start} - ${end}`;
      },
    },
    {
      accessorKey: 'amount_due',
      header: t('AMOUNT_DUE'),
      cell: ({ row }: any) =>
        formatAmount(Number(row.original.amount_due || 0)),
    },
    {
      accessorKey: 'amount_paid',
      header: t('AMOUNT_PAID'),
      cell: ({ row }: any) =>
        formatAmount(Number(row.original.amount_paid || 0)),
    },
    {
      accessorKey: 'remaining_amount',
      header: t('REMAINING'),
      cell: ({ row }: any) => (
        <span className="font-semibold">
          {formatAmount(Number(row.original.remaining_amount || 0))}
        </span>
      ),
    },
    {
      accessorKey: 'payment_status',
      header: t('PAYMENT_STATUS'),
      cell: ({ row }: any) => {
        const status = row.original.payment_status;

        let className = '';

        if (status === 'FULLY PAID') {
          className =
            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        } else if (status === 'PARTIALLY PAID') {
          className =
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        } else if (status === 'UNPAID') {
          className =
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        }

        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
          >
            {getPaymentStatus(status)}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <BreadcrumbComp
        title={t('OUTSTANDING_REPORT')}

      />

      <div className="flex flex-col gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Amount Due */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('TOTAL_AMOUNT_DUE')}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {formatAmount(summary.amountDue)}
                </h3>
              </div>

              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <CircleDollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Amount Paid */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('TOTAL_COLLECTED')}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {formatAmount(summary.amountPaid)}
                </h3>
              </div>

              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Outstanding */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('OUTSTANDING')}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {formatAmount(summary.remaining)}
                </h3>
              </div>

              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Report Table */}
        <DataTable
          data={reportData}
          columns={outstandingColumns}
        />
      </div>
    </>
  );
}
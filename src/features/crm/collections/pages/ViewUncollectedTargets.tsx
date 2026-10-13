import { useMemo, useState } from "react";
import {
  Filter,
  Wallet,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import CardBox from "src/components/shared/CardBox";
import BreadcrumbComp from "src/layouts/full/shared/breadcrumb/BreadcrumbComp";
import { DataTable } from 'src/components/utilities/table/DataTable';

import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";

const mockUnpaidTargets = [
  {
    id: 1,
    customer_name: "El Noor Pharmacy",
    branch_name: "Nasr City Branch",
    contract_number: "CNT-2026-0012",
    representative_name: "Ahmed Ali",
    collection_type: "SUBSCRIPTION",
    period_month: 9,
    period_year: 2026,
    amount: 600,
    paid_amount: 0,
    remaining_amount: 600,
    due_date: "2026-09-01",
    status: "OVERDUE",
  },
  {
    id: 2,
    customer_name: "El Salam Pharmacy",
    branch_name: "Dokki Branch",
    contract_number: "CNT-2026-0021",
    representative_name: "Mohamed Samir",
    collection_type: "SUBSCRIPTION",
    period_month: 9,
    period_year: 2026,
    amount: 500,
    paid_amount: 0,
    remaining_amount: 500,
    due_date: "2026-09-01",
    status: "OVERDUE",
  },
  {
    id: 3,
    customer_name: "Care Pharmacy",
    branch_name: "Maadi Branch",
    contract_number: "CNT-2026-0034",
    representative_name: "Ahmed Ali",
    collection_type: "SUBSCRIPTION",
    period_month: 9,
    period_year: 2026,
    amount: 600,
    paid_amount: 300,
    remaining_amount: 300,
    due_date: "2026-09-01",
    status: "PARTIALLY_PAID",
  },
  {
    id: 4,
    customer_name: "Life Pharmacy",
    branch_name: "Heliopolis Branch",
    contract_number: "CNT-2026-0042",
    representative_name: "Omar Hassan",
    collection_type: "SUBSCRIPTION",
    period_month: 9,
    period_year: 2026,
    amount: 600,
    paid_amount: 0,
    remaining_amount: 600,
    due_date: "2026-09-05",
    status: "OVERDUE",
  },
  {
    id: 5,
    customer_name: "Future Pharmacy",
    branch_name: "Zamalek Branch",
    contract_number: "CNT-2026-0050",
    representative_name: "Mohamed Samir",
    collection_type: "ADDITIONAL_UNIT",
    period_month: null,
    period_year: null,
    amount: 4000,
    paid_amount: 1000,
    remaining_amount: 3000,
    due_date: "2026-09-10",
    status: "PARTIALLY_PAID",
  },
  {
    id: 6,
    customer_name: "Health Plus Pharmacy",
    branch_name: "6 October Branch",
    contract_number: "CNT-2026-0058",
    representative_name: "Omar Hassan",
    collection_type: "SUBSCRIPTION",
    period_month: 9,
    period_year: 2026,
    amount: 500,
    paid_amount: 0,
    remaining_amount: 500,
    due_date: "2026-09-01",
    status: "OVERDUE",
  },
];

const representatives = [
  "ALL",
  "Ahmed Ali",
  "Mohamed Samir",
  "Omar Hassan",
];

export default function ViewUnpaidTargets() {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language.startsWith("ar");

  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    representative: "ALL",
    customer: "",
    status: "ALL",
  });

  const filteredTargets = useMemo(() => {
    return mockUnpaidTargets.filter((item) => {
      const matchesRepresentative =
        filters.representative === "ALL" ||
        item.representative_name === filters.representative;

      const matchesCustomer =
        !filters.customer ||
        item.customer_name
          .toLowerCase()
          .includes(filters.customer.toLowerCase());

      const matchesStatus =
        filters.status === "ALL" ||
        item.status === filters.status;

      return (
        matchesRepresentative &&
        matchesCustomer &&
        matchesStatus
      );
    });
  }, [filters]);

  const totalOutstanding = filteredTargets.reduce(
    (sum, item) => sum + item.remaining_amount,
    0
  );

  const overdueAmount = filteredTargets
    .filter((item) => item.status === "OVERDUE")
    .reduce(
      (sum, item) => sum + item.remaining_amount,
      0
    );

  const partiallyPaidAmount = filteredTargets
    .filter((item) => item.status === "PARTIALLY_PAID")
    .reduce(
      (sum, item) => sum + item.remaining_amount,
      0
    );

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount);

  const getStatusBadge = (status) => {
    if (status === "OVERDUE") {
      return (
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {t("OVERDUE")}
        </span>
      );
    }

    if (status === "PARTIALLY_PAID") {
      return (
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          {t("PARTIALLY_PAID")}
        </span>
      );
    }

    return null;
  };

  const getCollectionType = (type) => {
    switch (type) {
      case "SUBSCRIPTION":
        return t("SUBSCRIPTION");

      case "ADDITIONAL_UNIT":
        return t("ADDITIONAL_UNIT");

      default:
        return type;
    }
  };

  const columns = [
    {
      accessorKey: "customer_name",
      header: t("PHARMACY"),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.customer_name}
        </span>
      ),
    },

    {
      accessorKey: "branch_name",
      header: t("BRANCH"),
      cell: ({ row }) => row.original.branch_name,
    },

    {
      accessorKey: "representative_name",
      header: t("REPRESENTATIVE"),
      cell: ({ row }) => row.original.representative_name,
    },

    {
      accessorKey: "collection_type",
      header: t("TYPE"),
      cell: ({ row }) =>
        getCollectionType(row.original.collection_type),
    },

    {
      accessorKey: "period",
      header: t("PERIOD"),
      cell: ({ row }) => {
        const { period_month, period_year } = row.original;

        if (!period_month) {
          return "-";
        }

        return `${String(period_month).padStart(
          2,
          "0"
        )}/${period_year}`;
      },
    },

    {
      accessorKey: "amount",
      header: t("AMOUNT"),
      cell: ({ row }) => (
        <span className="font-medium">
          {formatAmount(row.original.amount)}
        </span>
      ),
    },

    {
      accessorKey: "paid_amount",
      header: t("PAID"),
      cell: ({ row }) =>
        formatAmount(row.original.paid_amount),
    },

    {
      accessorKey: "remaining_amount",
      header: t("REMAINING"),
      cell: ({ row }) => (
        <span className="font-semibold text-red-600">
          {formatAmount(row.original.remaining_amount)}
        </span>
      ),
    },

    {
      accessorKey: "due_date",
      header: t("DUE_DATE"),
      cell: ({ row }) => row.original.due_date,
    },

    {
      accessorKey: "status",
      header: t("STATUS"),
      cell: ({ row }) =>
        getStatusBadge(row.original.status),
    },
  ];

  return (
    <>
      <BreadcrumbComp
        title={t("UNPAID_TARGETS")}
        items={[
          {
            title: t("TECHNICAL_SUPPORT"),
            link: "/technical-support",
          },
          {
            title: t("UNPAID_TARGETS"),
          },
        ]}
      />

      <CardBox className="mt-5">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {t("UNPAID_TARGETS")}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {t("PHARMACIES_WITH_OUTSTANDING_PAYMENTS")}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setFilterOpen(true)}
          >
            <Filter
              className={`${
                isArabic ? "ml-2" : "mr-2"
              } h-4 w-4`}
            />

            {t("FILTER")}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Total Outstanding */}
          <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  {t("TOTAL_OUTSTANDING")}
                </p>

                <h3 className="text-xl font-bold">
                  {formatAmount(totalOutstanding)}
                </h3>
              </div>
            </div>
          </div>

          {/* Overdue */}
          <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  {t("OVERDUE_AMOUNT")}
                </p>

                <h3 className="text-xl font-bold">
                  {formatAmount(overdueAmount)}
                </h3>
              </div>
            </div>
          </div>

          {/* Partially Paid */}
          <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  {t("PARTIALLY_PAID")}
                </p>

                <h3 className="text-xl font-bold">
                  {formatAmount(partiallyPaidAmount)}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredTargets}
        />
      </CardBox>

      {/* Filter Dialog */}
      <Dialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
      >
        <DialogContent
          dir={isArabic ? "rtl" : "ltr"}
          className="[&>button]:right-auto [&>button]:left-4"
        >
          <DialogHeader>
            <DialogTitle>
              {t("FILTER_UNPAID_TARGETS")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Representative */}
            <div className="space-y-2">
              <Label>{t("REPRESENTATIVE")}</Label>

              <Select
                value={filters.representative}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    representative: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {representatives.map((representative) => (
                    <SelectItem
                      key={representative}
                      value={representative}
                    >
                      {representative === "ALL"
                        ? t("ALL")
                        : representative}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pharmacy */}
            <div className="space-y-2">
              <Label>{t("PHARMACY")}</Label>

              <Input
                placeholder={t("SEARCH_PHARMACY")}
                value={filters.customer}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    customer: e.target.value,
                  }))
                }
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>{t("STATUS")}</Label>

              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">
                    {t("ALL")}
                  </SelectItem>

                  <SelectItem value="OVERDUE">
                    {t("OVERDUE")}
                  </SelectItem>

                  <SelectItem value="PARTIALLY_PAID">
                    {t("PARTIALLY_PAID")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFilters({
                    representative: "ALL",
                    customer: "",
                    status: "ALL",
                  });
                }}
              >
                {t("RESET")}
              </Button>

              <Button
                type="button"
                onClick={() => setFilterOpen(false)}
              >
                {t("APPLY_FILTER")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
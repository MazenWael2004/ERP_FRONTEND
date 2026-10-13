
import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Search,
  Wallet,
  X,
} from "lucide-react";

import  CardBox  from "src/components/shared/CardBox";
import { DataTable } from "src/components/utilities/table/DataTable";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";
import { Label } from "src/components/ui/label";
import { Textarea } from "src/components/ui/textarea";

export default function Collections() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("OUTSTANDING");

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [collectionDialog, setCollectionDialog] = useState(false);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [successDialog, setSuccessDialog] = useState(false);

  // ---------------------------------------------------------------------------
  // MOCK API DATA
  // ---------------------------------------------------------------------------

  const [collectionItems, setCollectionItems] = useState<any[]>([
    {
      id: 1,
      customer_branch_id: 15,
      customer_name: "صيدلية الأمل",
      branch_name: "فرع مدينة نصر",

      contract_id: 101,
      contract_number: "CNT-2026-0012",

      collection_type: "MONTHLY_SUBSCRIPTION",

      invoice_line_id: 5001,

      description: "اشتراك شهري - أكتوبر 2026",

      period_year: 2026,
      period_month: 10,

      due_date: "2026-10-01",

      amount: 600,
      paid_amount: 0,
      remaining_amount: 600,

      status: "OUTSTANDING",
    },

    {
      id: 2,
      customer_branch_id: 15,
      customer_name: "صيدلية الأمل",
      branch_name: "فرع مدينة نصر",

      contract_id: 101,
      contract_number: "CNT-2026-0012",

      collection_type: "MONTHLY_SUBSCRIPTION",

      invoice_line_id: 4998,

      description: "اشتراك شهري - سبتمبر 2026",

      period_year: 2026,
      period_month: 9,

      due_date: "2026-09-01",

      amount: 600,
      paid_amount: 300,
      remaining_amount: 300,

      status: "PARTIAL",
    },

    {
      id: 3,
      customer_branch_id: 22,
      customer_name: "صيدلية النور",
      branch_name: "فرع الهرم",

      contract_id: 115,
      contract_number: "CNT-2026-0018",

      collection_type: "MONTHLY_SUBSCRIPTION",

      invoice_line_id: 5021,

      description: "اشتراك شهري - أكتوبر 2026",

      period_year: 2026,
      period_month: 10,

      due_date: "2026-10-01",

      amount: 500,
      paid_amount: 0,
      remaining_amount: 500,

      status: "OUTSTANDING",
    },

    {
      id: 4,
      customer_branch_id: 30,
      customer_name: "صيدلية الحياة",
      branch_name: "فرع السادس من أكتوبر",

      contract_id: 124,
      contract_number: "CNT-2026-0024",

      collection_type: "OTHER",

      invoice_line_id: 5042,

      description: "تغيير Hardware",

      period_year: null,
      period_month: null,

      due_date: "2026-09-25",

      amount: 400,
      paid_amount: 0,
      remaining_amount: 400,

      status: "OUTSTANDING",
    },

    {
      id: 5,
      customer_branch_id: 15,
      customer_name: "صيدلية الأمل",
      branch_name: "فرع مدينة نصر",

      contract_id: 101,
      contract_number: "CNT-2026-0012",

      collection_type: "OTHER",

      invoice_line_id: 5045,

      description: "تركيب وحدة إضافية",

      period_year: null,
      period_month: null,

      due_date: "2026-09-20",

      amount: 4000,
      paid_amount: 1000,
      remaining_amount: 3000,

      status: "PARTIAL",
    },

    {
      id: 6,
      customer_branch_id: 35,
      customer_name: "صيدلية الشفاء",
      branch_name: "فرع المعادي",

      contract_id: 130,
      contract_number: "CNT-2026-0030",

      collection_type: "OTHER",

      invoice_line_id: 5051,

      description: "Replication Download",

      period_year: null,
      period_month: null,

      due_date: "2026-09-15",

      amount: 4000,
      paid_amount: 0,
      remaining_amount: 4000,

      status: "OUTSTANDING",
    },
  ]);

  // ---------------------------------------------------------------------------
  // FILTER DATA
  // ---------------------------------------------------------------------------

  const filteredItems = useMemo(() => {
    return collectionItems.filter((item) => {
      const matchesSearch =
        item.customer_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.branch_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.contract_number
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "MONTHLY" &&
          item.collection_type === "MONTHLY_SUBSCRIPTION") ||
        (typeFilter === "OTHER" &&
          item.collection_type === "OTHER");

      const matchesStatus =
        statusFilter === "ALL" ||
        item.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [collectionItems, search, typeFilter, statusFilter]);

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------

  const summary = useMemo(() => {
    const outstanding = collectionItems.reduce(
      (sum, item) => sum + item.remaining_amount,
      0
    );

    const monthly = collectionItems
      .filter(
        (item) => item.collection_type === "MONTHLY_SUBSCRIPTION"
      )
      .reduce((sum, item) => sum + item.remaining_amount, 0);

    const other = collectionItems
      .filter((item) => item.collection_type === "OTHER")
      .reduce((sum, item) => sum + item.remaining_amount, 0);

    return {
      outstanding,
      monthly,
      other,
      count: collectionItems.length,
    };
  }, [collectionItems]);

  // ---------------------------------------------------------------------------
  // OPEN COLLECTION
  // ---------------------------------------------------------------------------

  const openCollection = (item: any) => {
    setSelectedItem(item);

    setAmount(String(item.remaining_amount));
    setPaymentMethod("CASH");
    setReceiptNumber("");
    setNotes("");

    setCollectionDialog(true);
  };

  // ---------------------------------------------------------------------------
  // SUBMIT COLLECTION
  // ---------------------------------------------------------------------------

  const handleCollection = () => {
    if (!selectedItem) return;

    const collectedAmount = Number(amount);

    if (
      !collectedAmount ||
      collectedAmount <= 0 ||
      collectedAmount > selectedItem.remaining_amount
    ) {
      return;
    }

    // Mock updating invoice line
    setCollectionItems((current) =>
      current.map((item) => {
        if (item.id !== selectedItem.id) {
          return item;
        }

        const newPaidAmount =
          item.paid_amount + collectedAmount;

        const newRemainingAmount =
          item.amount - newPaidAmount;

        return {
          ...item,
          paid_amount: newPaidAmount,
          remaining_amount: newRemainingAmount,
          status:
            newRemainingAmount === 0
              ? "PAID"
              : "PARTIAL",
        };
      })
    );

    setCollectionDialog(false);
    setSuccessDialog(true);
  };

  // ---------------------------------------------------------------------------
  // TABLE COLUMNS
  // ---------------------------------------------------------------------------

  const columns = [
    {
      accessorKey: "customer_name",
      header: "العميل",
      cell: ({ row }: any) => {
        const item = row.original;

        return (
          <div>
            <p className="font-semibold text-slate-900">
              {item.customer_name}
            </p>

            <p className="text-xs text-slate-500">
              {item.branch_name}
            </p>
          </div>
        );
      },
    },

    {
      accessorKey: "contract_number",
      header: "العقد",
      cell: ({ row }: any) => (
        <span className="font-medium">
          {row.original.contract_number}
        </span>
      ),
    },

    {
      accessorKey: "collection_type",
      header: "نوع التحصيل",
      cell: ({ row }: any) => {
        const item = row.original;

        if (item.collection_type === "MONTHLY_SUBSCRIPTION") {
          return (
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              اشتراك شهري
            </span>
          );
        }

        return (
          <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
            أخرى
          </span>
        );
      },
    },

    {
      accessorKey: "description",
      header: "البيان",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {row.original.collection_type ===
          "MONTHLY_SUBSCRIPTION" ? (
            <CalendarDays
              size={16}
              className="text-slate-400"
            />
          ) : (
            <FileText
              size={16}
              className="text-slate-400"
            />
          )}

          <span>{row.original.description}</span>
        </div>
      ),
    },

    {
      accessorKey: "due_date",
      header: "تاريخ الاستحقاق",
      cell: ({ row }: any) => (
        <span className="text-sm text-slate-600">
          {row.original.due_date}
        </span>
      ),
    },

    {
      accessorKey: "amount",
      header: "المستحق",
      cell: ({ row }: any) => (
        <span className="font-semibold">
          {row.original.amount.toLocaleString()} ج.م
        </span>
      ),
    },

    {
      accessorKey: "paid_amount",
      header: "المدفوع",
      cell: ({ row }: any) => (
        <span className="font-semibold text-emerald-600">
          {row.original.paid_amount.toLocaleString()} ج.م
        </span>
      ),
    },

    {
      accessorKey: "remaining_amount",
      header: "المتبقي",
      cell: ({ row }: any) => (
        <span className="font-bold text-red-600">
          {row.original.remaining_amount.toLocaleString()} ج.م
        </span>
      ),
    },

    {
      id: "actions",
      header: "الإجراء",
      cell: ({ row }: any) => {
        const item = row.original;

        if (item.remaining_amount <= 0) {
          return (
            <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
              <CheckCircle2 size={16} />
              تم التحصيل
            </span>
          );
        }

        return (
          <Button
            size="sm"
            onClick={() => openCollection(item)}
          >
            <Wallet size={16} />
            تحصيل
          </Button>
        );
      },
    },
  ];

  return (
    <div
      dir="rtl"
      className="space-y-6"
    >
      {/* ---------------------------------------------------------------- */}
      {/* HEADER */}
      {/* ---------------------------------------------------------------- */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          التحصيلات
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          متابعة وتسجيل المبالغ المستحقة على العقود والعملاء
          التابعين لك
        </p>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* SUMMARY CARDS */}
      {/* ---------------------------------------------------------------- */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <CardBox>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                إجمالي المستحق
              </p>

              <p className="mt-2 text-2xl font-bold">
                {summary.outstanding.toLocaleString()} ج.م
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <CircleDollarSign size={22} />
            </div>
          </div>
        </CardBox>

        <CardBox>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                الاشتراكات الشهرية
              </p>

              <p className="mt-2 text-2xl font-bold">
                {summary.monthly.toLocaleString()} ج.م
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <CalendarDays size={22} />
            </div>
          </div>
        </CardBox>

        <CardBox>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                مبالغ أخرى
              </p>

              <p className="mt-2 text-2xl font-bold">
                {summary.other.toLocaleString()} ج.م
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <FileText size={22} />
            </div>
          </div>
        </CardBox>

        <CardBox>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                عمليات التحصيل
              </p>

              <p className="mt-2 text-2xl font-bold">
                {summary.count}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Wallet size={22} />
            </div>
          </div>
        </CardBox>

      </div>

      {/* ---------------------------------------------------------------- */}
      {/* FILTERS */}
      {/* ---------------------------------------------------------------- */}

      <CardBox>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="بحث باسم العميل أو العقد..."
              className="pr-10"
            />
          </div>

          {/* Type */}
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="نوع التحصيل" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">
                كل الأنواع
              </SelectItem>

              <SelectItem value="MONTHLY">
                الاشتراكات الشهرية
              </SelectItem>

              <SelectItem value="OTHER">
                مبالغ أخرى
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">
                كل الحالات
              </SelectItem>

              <SelectItem value="OUTSTANDING">
                مستحق
              </SelectItem>

              <SelectItem value="PARTIAL">
                تحصيل جزئي
              </SelectItem>

              <SelectItem value="PAID">
                تم التحصيل
              </SelectItem>
            </SelectContent>
          </Select>

        </div>
      </CardBox>

      {/* ---------------------------------------------------------------- */}
      {/* DATA TABLE */}
      {/* ---------------------------------------------------------------- */}

      <CardBox>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              المستحقات
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              المستحقات الخاصة بالعملاء والفروع المسندة إليك
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
            {filteredItems.length} نتيجة
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filteredItems}
        />
      </CardBox>

      {/* ---------------------------------------------------------------- */}
      {/* COLLECTION DIALOG */}
      {/* ---------------------------------------------------------------- */}

      <Dialog
        open={collectionDialog}
        onOpenChange={setCollectionDialog}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.collection_type ===
              "MONTHLY_SUBSCRIPTION"
                ? "تحصيل الاشتراك الشهري"
                : "تحصيل مبلغ آخر"}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-5">

              {/* Customer */}
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="font-bold">
                      {selectedItem.customer_name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {selectedItem.branch_name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {selectedItem.contract_number}
                    </p>
                  </div>

                  <div className="text-left">
                    <p className="text-xs text-slate-500">
                      المتبقي
                    </p>

                    <p className="text-lg font-bold text-red-600">
                      {selectedItem.remaining_amount.toLocaleString()}{" "}
                      ج.م
                    </p>
                  </div>

                </div>
              </div>

              {/* Description */}
              <div>
                <Label>البيان</Label>

                <div className="mt-2 rounded-lg border bg-white p-3 text-sm">
                  {selectedItem.description}
                </div>
              </div>

              {/* Amount */}
              <div>
                <Label>المبلغ المحصل</Label>

                <Input
                  type="number"
                  min={1}
                  max={selectedItem.remaining_amount}
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  className="mt-2"
                />

                <p className="mt-1 text-xs text-slate-500">
                  الحد الأقصى:{" "}
                  {selectedItem.remaining_amount.toLocaleString()}{" "}
                  ج.م
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <Label>طريقة الدفع</Label>

                <Select
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="CASH">
                      نقدي
                    </SelectItem>

                    <SelectItem value="BANK_TRANSFER">
                      تحويل بنكي
                    </SelectItem>

                    <SelectItem value="CREDIT_CARD">
                      بطاقة ائتمان
                    </SelectItem>

                    <SelectItem value="CHEQUE">
                      شيك
                    </SelectItem>

                    <SelectItem value="ONLINE_PAYMENT">
                      دفع إلكتروني
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Receipt */}
              <div>
                <Label>رقم الإيصال</Label>

                <Input
                  value={receiptNumber}
                  onChange={(e) =>
                    setReceiptNumber(e.target.value)
                  }
                  placeholder="رقم الإيصال"
                  className="mt-2"
                />
              </div>

              {/* Notes */}
              <div>
                <Label>ملاحظات</Label>

                <Textarea
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  placeholder="ملاحظات إضافية..."
                  className="mt-2"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">

                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    setCollectionDialog(false)
                  }
                >
                  إلغاء
                </Button>

                <Button
                  className="flex-1"
                  disabled={
                    !amount ||
                    Number(amount) <= 0 ||
                    Number(amount) >
                      selectedItem.remaining_amount
                  }
                  onClick={handleCollection}
                >
                  <Wallet size={17} />
                  تسجيل التحصيل
                </Button>

              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------------------------------------------------------------- */}
      {/* SUCCESS */}
      {/* ---------------------------------------------------------------- */}

      <Dialog
        open={successDialog}
        onOpenChange={setSuccessDialog}
      >
        <DialogContent className="max-w-md text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={34} />
          </div>

          <DialogHeader>
            <DialogTitle>
              تم تسجيل التحصيل بنجاح
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-slate-500">
            تم تسجيل عملية التحصيل وربطها بالمستحقات الخاصة
            بالعقد.
          </p>

          <div className="rounded-xl bg-slate-50 p-4 text-right">

            <div className="flex justify-between py-2 text-sm">
              <span className="text-slate-500">
                العميل
              </span>

              <span className="font-semibold">
                {selectedItem?.customer_name}
              </span>
            </div>

            <div className="flex justify-between py-2 text-sm">
              <span className="text-slate-500">
                المبلغ
              </span>

              <span className="font-bold">
                {Number(amount || 0).toLocaleString()} ج.م
              </span>
            </div>

            <div className="flex justify-between py-2 text-sm">
              <span className="text-slate-500">
                طريقة الدفع
              </span>

              <span className="font-semibold">
                {paymentMethod === "CASH"
                  ? "نقدي"
                  : paymentMethod === "BANK_TRANSFER"
                  ? "تحويل بنكي"
                  : paymentMethod === "CREDIT_CARD"
                  ? "بطاقة ائتمان"
                  : paymentMethod === "CHEQUE"
                  ? "شيك"
                  : "دفع إلكتروني"}
              </span>
            </div>

          </div>

          <Button
            className="w-full"
            onClick={() =>
              setSuccessDialog(false)
            }
          >
            إغلاق
          </Button>

        </DialogContent>
      </Dialog>
    </div>
  );
}


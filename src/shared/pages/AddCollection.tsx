import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Search,
  User,
  Wallet,
} from "lucide-react";

import CardBox from "src/components/shared/CardBox";
import BreadcrumbComp from "src/layouts/full/shared/breadcrumb/BreadcrumbComp";

import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Textarea } from "src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "src/components/ui/table";
import { Checkbox } from "src/components/ui/checkbox";
import { Badge } from "src/components/ui/badge";

type CollectionType =
  | "SUBSCRIPTION"
  | "INSTALLATION"
  | "ADDITIONAL_UNIT"
  | "REPLICATION"
  | "OTHER";

type ObligationStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

interface CustomerBranch {
  id: number;
  customerName: string;
  branchName: string;
  contractNumber: string;
  planName: string;
  representativeName: string;
}

interface PaymentObligation {
  id: number;
  description: string;
  collectionType: CollectionType;
  periodYear?: number;
  periodMonth?: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: ObligationStatus;
}

interface Allocation {
  obligationId: number;
  amount: number;
}

const branches: CustomerBranch[] = [
  {
    id: 1,
    customerName: "ABC Pharmacy",
    branchName: "Nasr City Branch",
    contractNumber: "CNT-2026-00125",
    planName: "Gold",
    representativeName: "Ahmed Mohamed",
  },
  {
    id: 2,
    customerName: "El Salam Pharmacy",
    branchName: "Haram Branch",
    contractNumber: "CNT-2026-00126",
    planName: "Silver",
    representativeName: "Mohamed Ali",
  },
];

const obligations: Record<number, PaymentObligation[]> = {
  1: [
    {
      id: 101,
      description: "September 2026 Subscription",
      collectionType: "SUBSCRIPTION",
      periodYear: 2026,
      periodMonth: 9,
      dueDate: "2026-09-01",
      amount: 600,
      paidAmount: 0,
      remainingAmount: 600,
      status: "UNPAID",
    },
    {
      id: 102,
      description: "October 2026 Subscription",
      collectionType: "SUBSCRIPTION",
      periodYear: 2026,
      periodMonth: 10,
      dueDate: "2026-10-01",
      amount: 600,
      paidAmount: 0,
      remainingAmount: 600,
      status: "UNPAID",
    },
    {
      id: 103,
      description: "Additional Unit Installation",
      collectionType: "ADDITIONAL_UNIT",
      dueDate: "2026-09-05",
      amount: 4000,
      paidAmount: 2000,
      remainingAmount: 2000,
      status: "PARTIALLY_PAID",
    },
  ],
  2: [
    {
      id: 201,
      description: "September 2026 Subscription",
      collectionType: "SUBSCRIPTION",
      periodYear: 2026,
      periodMonth: 9,
      dueDate: "2026-09-01",
      amount: 500,
      paidAmount: 0,
      remainingAmount: 500,
      status: "UNPAID",
    },
    {
      id: 202,
      description: "Replication Download",
      collectionType: "REPLICATION",
      dueDate: "2026-09-10",
      amount: 4000,
      paidAmount: 0,
      remainingAmount: 4000,
      status: "UNPAID",
    },
  ],
};

const collectionTypeLabels: Record<CollectionType, string> = {
  SUBSCRIPTION: "Subscription",
  INSTALLATION: "Installation",
  ADDITIONAL_UNIT: "Additional Unit",
  REPLICATION: "Replication",
  OTHER: "Other",
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const getStatusLabel = (status: ObligationStatus) => {
  switch (status) {
    case "PAID":
      return "Paid";
    case "PARTIALLY_PAID":
      return "Partially Paid";
    default:
      return "Unpaid";
  }
};

export default function AddCollection() {
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(
    null,
  );

  const [selectedObligationIds, setSelectedObligationIds] = useState<number[]>(
    [],
  );

  const [allocations, setAllocations] = useState<Allocation[]>([]);

  const [amountReceived, setAmountReceived] = useState<string>("");

  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");

  const [collectionDate, setCollectionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const [notes, setNotes] = useState<string>("");

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === selectedBranchId) ?? null,
    [selectedBranchId],
  );

  const branchObligations = useMemo(
    () =>
      selectedBranchId
        ? obligations[selectedBranchId] ?? []
        : [],
    [selectedBranchId],
  );

  const selectedObligations = useMemo(
    () =>
      branchObligations.filter((obligation) =>
        selectedObligationIds.includes(obligation.id),
      ),
    [branchObligations, selectedObligationIds],
  );

  const receivedAmount = Number(amountReceived) || 0;

  const totalAllocated = useMemo(
    () => allocations.reduce((sum, allocation) => sum + allocation.amount, 0),
    [allocations],
  );

  const unallocatedAmount = receivedAmount - totalAllocated;

  const canSubmit =
    selectedBranchId !== null &&
    receivedAmount > 0 &&
    totalAllocated > 0 &&
    Math.abs(unallocatedAmount) < 0.01;

  const handleBranchChange = (value: string) => {
    const id = Number(value);

    setSelectedBranchId(id);
    setSelectedObligationIds([]);
    setAllocations([]);
    setAmountReceived("");
  };

  const toggleObligation = (obligationId: number, checked: boolean) => {
    if (checked) {
      setSelectedObligationIds((current) => [
        ...current,
        obligationId,
      ]);

      const obligation = branchObligations.find(
        (item) => item.id === obligationId,
      );

      if (!obligation) return;

      setAllocations((current) => [
        ...current,
        {
          obligationId,
          amount: obligation.remainingAmount,
        },
      ]);
    } else {
      setSelectedObligationIds((current) =>
        current.filter((id) => id !== obligationId),
      );

      setAllocations((current) =>
        current.filter(
          (allocation) => allocation.obligationId !== obligationId,
        ),
      );
    }
  };

  const updateAllocation = (
    obligationId: number,
    value: string,
  ) => {
    const numericValue = Number(value) || 0;

    const obligation = branchObligations.find(
      (item) => item.id === obligationId,
    );

    if (!obligation) return;

    const safeAmount = Math.min(
      Math.max(numericValue, 0),
      obligation.remainingAmount,
    );

    setAllocations((current) =>
      current.map((allocation) =>
        allocation.obligationId === obligationId
          ? {
              ...allocation,
              amount: safeAmount,
            }
          : allocation,
      ),
    );
  };

  const handleAmountReceivedChange = (value: string) => {
    setAmountReceived(value);

    const numericAmount = Number(value) || 0;

    if (selectedObligations.length === 0) {
      return;
    }

    let remaining = numericAmount;

    const newAllocations: Allocation[] = [];

    for (const obligation of selectedObligations) {
      if (remaining <= 0) {
        newAllocations.push({
          obligationId: obligation.id,
          amount: 0,
        });

        continue;
      }

      const allocation = Math.min(
        obligation.remainingAmount,
        remaining,
      );

      newAllocations.push({
        obligationId: obligation.id,
        amount: allocation,
      });

      remaining -= allocation;
    }

    setAllocations(newAllocations);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedObligationIds([]);
      setAllocations([]);
      return;
    }

    const ids = branchObligations.map((obligation) => obligation.id);

    setSelectedObligationIds(ids);

    let remaining = receivedAmount;

    const newAllocations = branchObligations.map((obligation) => {
      const allocation = Math.min(
        obligation.remainingAmount,
        Math.max(remaining, 0),
      );

      remaining -= allocation;

      return {
        obligationId: obligation.id,
        amount: allocation,
      };
    });

    setAllocations(newAllocations);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const payload = {
      customerBranchId: selectedBranchId,
      paymentMethodId: paymentMethod,
      amount: receivedAmount,
      collectedAt: collectionDate,
      notes,
      allocations: allocations.filter(
        (allocation) => allocation.amount > 0,
      ),
    };

    console.log("Collection payload:", payload);

    // TODO:
    // POST /collections
    //
    // Backend should create:
    // 1. collections
    // 2. collection_allocations
    // 3. update payment_obligations
    //
    // All inside one SQL transaction.
  };

  return (
    <div className="container mx-auto max-w-[1600px] p-4 md:p-6">
      <BreadcrumbComp
        title="Add Collection"
        items={[
          {
            title: "Collections",
            to: "/collections",
          },
          {
            title: "Add Collection",
          },
        ]}
      />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Add Collection
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Record money received from a customer and allocate it
            against outstanding obligations.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main Content */}
        <div className="flex flex-col gap-6">
          {/* Customer */}
          <CardBox>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="size-5 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Customer / Branch
                </h2>

                <p className="text-sm text-muted-foreground">
                  Select the customer branch receiving the collection.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customerBranch">
                  Customer Branch
                </Label>

                <Select
                  value={
                    selectedBranchId
                      ? String(selectedBranchId)
                      : undefined
                  }
                  onValueChange={handleBranchChange}
                >
                  <SelectTrigger id="customerBranch">
                    <SelectValue placeholder="Search or select customer branch..." />
                  </SelectTrigger>

                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem
                        key={branch.id}
                        value={String(branch.id)}
                      >
                        {branch.customerName} — {branch.branchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBranch && (
                <>
                  <InfoItem
                    icon={<Building2 className="size-4" />}
                    label="Customer"
                    value={selectedBranch.customerName}
                  />

                  <InfoItem
                    icon={<Building2 className="size-4" />}
                    label="Branch"
                    value={selectedBranch.branchName}
                  />

                  <InfoItem
                    icon={<FileText className="size-4" />}
                    label="Contract"
                    value={selectedBranch.contractNumber}
                  />

                  <InfoItem
                    icon={<Wallet className="size-4" />}
                    label="Plan"
                    value={selectedBranch.planName}
                  />

                  <InfoItem
                    icon={<User className="size-4" />}
                    label="Representative"
                    value={selectedBranch.representativeName}
                  />
                </>
              )}
            </div>
          </CardBox>

          {/* Outstanding Obligations */}
          <CardBox>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">
                  Outstanding Obligations
                </h2>

                <p className="text-sm text-muted-foreground">
                  Select the obligations that this payment should settle.
                </p>
              </div>

              {selectedBranch && branchObligations.length > 0 && (
                <Badge variant="secondary">
                  {branchObligations.length} Outstanding
                </Badge>
              )}
            </div>

            {!selectedBranch ? (
              <EmptyState
                icon={<Search className="size-5" />}
                title="Select a customer branch"
                description="Outstanding obligations will appear here after selecting a branch."
              />
            ) : branchObligations.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="size-5" />}
                title="No outstanding obligations"
                description="This customer currently has nothing available for collection."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            selectedObligationIds.length ===
                              branchObligations.length &&
                            branchObligations.length > 0
                          }
                          onCheckedChange={(checked) =>
                            handleSelectAll(Boolean(checked))
                          }
                        />
                      </TableHead>

                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">
                        Amount
                      </TableHead>
                      <TableHead className="text-right">
                        Paid
                      </TableHead>
                      <TableHead className="text-right">
                        Remaining
                      </TableHead>
                      <TableHead className="text-right">
                        Allocate
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {branchObligations.map((obligation) => {
                      const selected =
                        selectedObligationIds.includes(
                          obligation.id,
                        );

                      const allocation =
                        allocations.find(
                          (item) =>
                            item.obligationId === obligation.id,
                        )?.amount ?? 0;

                      return (
                        <TableRow key={obligation.id}>
                          <TableCell>
                            <Checkbox
                              checked={selected}
                              onCheckedChange={(checked) =>
                                toggleObligation(
                                  obligation.id,
                                  Boolean(checked),
                                )
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <div className="font-medium">
                              {obligation.description}
                            </div>

                            {obligation.periodYear &&
                              obligation.periodMonth && (
                                <div className="text-xs text-muted-foreground">
                                  Period:{" "}
                                  {obligation.periodMonth}/
                                  {obligation.periodYear}
                                </div>
                              )}
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline">
                              {
                                collectionTypeLabels[
                                  obligation.collectionType
                                ]
                              }
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {formatDate(obligation.dueDate)}
                          </TableCell>

                          <TableCell className="text-right font-medium">
                            {formatMoney(obligation.amount)}
                          </TableCell>

                          <TableCell className="text-right text-muted-foreground">
                            {formatMoney(obligation.paidAmount)}
                          </TableCell>

                          <TableCell className="text-right font-semibold">
                            {formatMoney(
                              obligation.remainingAmount,
                            )}
                          </TableCell>

                          <TableCell>
                            {selected ? (
                              <Input
                                type="number"
                                min={0}
                                max={obligation.remainingAmount}
                                step="0.01"
                                value={allocation}
                                onChange={(event) =>
                                  updateAllocation(
                                    obligation.id,
                                    event.target.value,
                                  )
                                }
                                className="ml-auto w-[120px] text-right"
                              />
                            ) : (
                              <div className="text-right text-muted-foreground">
                                —
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardBox>

          {/* Collection Details */}
          <CardBox>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <CircleDollarSign className="size-5 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Collection Details
                </h2>

                <p className="text-sm text-muted-foreground">
                  Enter the actual payment received from the customer.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amountReceived">
                  Amount Received
                </Label>

                <div className="relative">
                  <Input
                    id="amountReceived"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={amountReceived}
                    onChange={(event) =>
                      handleAmountReceivedChange(
                        event.target.value,
                      )
                    }
                    className="pr-16 text-lg font-semibold"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    EGP
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">
                  Payment Method
                </Label>

                <Select
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="CASH">
                      Cash
                    </SelectItem>

                    <SelectItem value="BANK_TRANSFER">
                      Bank Transfer
                    </SelectItem>

                    <SelectItem value="CREDIT_CARD">
                      Credit Card
                    </SelectItem>

                    <SelectItem value="CHEQUE">
                      Cheque
                    </SelectItem>

                    <SelectItem value="ONLINE_PAYMENT">
                      Online Payment
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collectionDate">
                  Collection Date
                </Label>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="collectionDate"
                    type="date"
                    value={collectionDate}
                    onChange={(event) =>
                      setCollectionDate(event.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">
                  Notes
                </Label>

                <Textarea
                  id="notes"
                  placeholder="Add any notes about this collection..."
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  rows={4}
                />
              </div>
            </div>
          </CardBox>
        </div>

        {/* Summary */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <CardBox>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Wallet className="size-5 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Collection Summary
                </h2>

                <p className="text-sm text-muted-foreground">
                  Review before submitting.
                </p>
              </div>
            </div>

            {selectedBranch && (
              <div className="mb-5 rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">
                  Customer
                </p>

                <p className="mt-1 font-semibold">
                  {selectedBranch.customerName}
                </p>

                <p className="text-sm text-muted-foreground">
                  {selectedBranch.branchName}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <SummaryRow
                label="Amount Received"
                value={`EGP ${formatMoney(receivedAmount)}`}
                emphasized
              />

              <SummaryRow
                label="Total Allocated"
                value={`EGP ${formatMoney(totalAllocated)}`}
              />

              <div className="border-t pt-4">
                <SummaryRow
                  label="Unallocated"
                  value={`EGP ${formatMoney(
                    Math.max(unallocatedAmount, 0),
                  )}`}
                  valueClassName={
                    Math.abs(unallocatedAmount) < 0.01
                      ? "text-green-600"
                      : "text-destructive"
                  }
                />
              </div>

              <SummaryRow
                label="Payment Method"
                value={
                  paymentMethod === "BANK_TRANSFER"
                    ? "Bank Transfer"
                    : paymentMethod === "CREDIT_CARD"
                      ? "Credit Card"
                      : paymentMethod === "ONLINE_PAYMENT"
                        ? "Online Payment"
                        : paymentMethod === "CHEQUE"
                          ? "Cheque"
                          : "Cash"
                }
              />

              <SummaryRow
                label="Selected Obligations"
                value={String(selectedObligations.length)}
              />
            </div>

            {/* Validation */}
            <div className="mt-6">
              {receivedAmount === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Enter the amount received to continue.
                </div>
              ) : unallocatedAmount > 0.01 ? (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
                  <strong>
                    EGP {formatMoney(unallocatedAmount)}
                  </strong>{" "}
                  is not allocated to an obligation.
                </div>
              ) : unallocatedAmount < -0.01 ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  Allocated amount cannot exceed the amount received.
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400">
                  <CheckCircle2 className="size-4" />
                  Payment is fully allocated.
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Button
                className="w-full"
                size="lg"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                <Wallet className="mr-2 size-4" />
                Collect & Issue Receipt
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
            </div>
          </CardBox>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="mt-0.5 text-muted-foreground">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasized = false,
  valueClassName = "",
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span
        className={`text-right ${
          emphasized
            ? "text-lg font-bold text-foreground"
            : "text-sm font-medium"
        } ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>

      <p className="font-medium">{title}</p>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}


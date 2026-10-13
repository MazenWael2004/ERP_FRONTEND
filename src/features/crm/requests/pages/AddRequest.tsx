import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Search,
  Building2,
  User,
  Package,
  FileText,
  Calculator,
} from "lucide-react";

import CardBox from "src/components/shared/CardBox";
import BreadcrumbComp from "src/layouts/full/shared/breadcrumb/BreadcrumbComp";

import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Textarea } from "src/components/ui/textarea";
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
  DialogFooter,
} from "src/components/ui/dialog";
import { Label } from "src/components/ui/label";

// ============================================================
// TYPES
// ============================================================

type Customer = {
  id: number;
  name: string;
  code: string;
  type: "PHARMACEUTICAL" | "COMMERCIAL";
};

type Branch = {
  id: number;
  customerId: number;
  name: string;
  city: string;
};

type PlanService = {
  id: number;
  name: string;
  isQuantityBased: boolean;
  price: number;
};

type ServiceRequestItem = {
  id: number;
  planServiceId: number;
  serviceName: string;
  quantity: number | null;
  unitPrice: number;
  totalAmount: number;
};

// ============================================================
// MOCK DATA
// Replace these with API calls
// ============================================================

const customers: Customer[] = [
  {
    id: 1,
    name: "ABC Pharmacy",
    code: "CUS-00125",
    type: "PHARMACEUTICAL",
  },
  {
    id: 2,
    name: "El Shifa Pharmacy",
    code: "CUS-00126",
    type: "PHARMACEUTICAL",
  },
  {
    id: 3,
    name: "Cairo Medical Supplies",
    code: "CUS-00127",
    type: "COMMERCIAL",
  },
];

const branches: Branch[] = [
  {
    id: 101,
    customerId: 1,
    name: "Main Branch",
    city: "Cairo",
  },
  {
    id: 102,
    customerId: 1,
    name: "Nasr City Branch",
    city: "Cairo",
  },
  {
    id: 103,
    customerId: 2,
    name: "Main Branch",
    city: "Giza",
  },
  {
    id: 104,
    customerId: 3,
    name: "Dokki Branch",
    city: "Giza",
  },
];

const planServices: PlanService[] = [
  {
    id: 1,
    name: "Additional Unit",
    isQuantityBased: true,
    price: 100,
  },
  {
    id: 2,
    name: "HD Change",
    isQuantityBased: false,
    price: 300,
  },
  {
    id: 3,
    name: "Replication",
    isQuantityBased: false,
    price: 1000,
  },
  {
    id: 4,
    name: "Additional Storage",
    isQuantityBased: true,
    price: 50,
  },
];

// ============================================================
// COMPONENT
// ============================================================

const AddServiceRequest = () => {
  // ----------------------------------------------------------
  // Form state
  // ----------------------------------------------------------

  const [customerId, setCustomerId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<ServiceRequestItem[]>([]);

  // ----------------------------------------------------------
  // Add service dialog
  // ----------------------------------------------------------

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");

  // ----------------------------------------------------------
  // Derived data
  // ----------------------------------------------------------

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === Number(customerId)),
    [customerId]
  );

  const customerBranches = useMemo(
    () =>
      branches.filter(
        (branch) => branch.customerId === Number(customerId)
      ),
    [customerId]
  );

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === Number(branchId)),
    [branchId]
  );

  const selectedService = useMemo(
    () =>
      planServices.find(
        (service) => service.id === Number(selectedServiceId)
      ),
    [selectedServiceId]
  );

  const requestTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.totalAmount, 0),
    [items]
  );

  // ----------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------

  const handleCustomerChange = (value: string) => {
    setCustomerId(value);

    // Branch belongs to customer, so reset it
    setBranchId("");
  };

  const handleServiceChange = (value: string) => {
    setSelectedServiceId(value);

    const service = planServices.find(
      (item) => item.id === Number(value)
    );

    if (service?.isQuantityBased) {
      setQuantity("1");
    } else {
      setQuantity("1");
    }
  };

  const handleAddService = () => {
    if (!selectedService) return;

    // Prevent duplicate services
    const alreadyAdded = items.some(
      (item) => item.planServiceId === selectedService.id
    );

    if (alreadyAdded) {
      alert("This service has already been added.");
      return;
    }

    const serviceQuantity = selectedService.isQuantityBased
      ? Math.max(1, Number(quantity))
      : null;

    const totalAmount = selectedService.isQuantityBased
      ? serviceQuantity! * selectedService.price
      : selectedService.price;

    const newItem: ServiceRequestItem = {
      id: Date.now(),
      planServiceId: selectedService.id,
      serviceName: selectedService.name,
      quantity: serviceQuantity,
      unitPrice: selectedService.price,
      totalAmount,
    };

    setItems((prev) => [...prev, newItem]);

    // Reset dialog
    setSelectedServiceId("");
    setQuantity("1");
    setServiceDialogOpen(false);
  };

  const handleRemoveItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    if (!customerId) {
      alert("Please select a customer.");
      return;
    }

    if (!branchId) {
      alert("Please select a branch.");
      return;
    }

    if (items.length === 0) {
      alert("Please add at least one service.");
      return;
    }

    const payload = {
      customer_branch_id: Number(branchId),
      requested_at: new Date().toISOString(),
      notes: notes || null,

      items: items.map((item) => ({
        plan_service_id: item.planServiceId,
        quantity: item.quantity,
      })),
    };

    console.log("SERVICE REQUEST PAYLOAD:", payload);

    /*
      API:

      await axios.post("/service-requests", payload);

      Backend should calculate:
      - unit_price
      - total_amount
      - request total_amount
      - status = PENDING
    */

    alert("Service request created successfully.");
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <BreadcrumbComp
        title="Add Service Request"
        items={[
          { title: "Service Requests", to: "/service-requests" },
          { title: "Add Request" },
        ]}
      />

      <div className="space-y-6">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <CardBox>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-foreground">
              New Service Request
            </h2>

            <p className="text-sm text-muted-foreground">
              Create a request for one or more optional services for a
              customer branch.
            </p>
          </div>
        </CardBox>

        {/* ================================================== */}
        {/* CUSTOMER INFORMATION */}
        {/* ================================================== */}

        <CardBox>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold">Customer Information</h3>

              <p className="text-sm text-muted-foreground">
                Select the customer branch requesting the services.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Customer */}

            <div className="space-y-2">
              <Label>
                Customer <span className="text-destructive">*</span>
              </Label>

              <Select
                value={customerId}
                onValueChange={handleCustomerChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>

                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem
                      key={customer.id}
                      value={String(customer.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{customer.name}</span>

                        <span className="text-xs text-muted-foreground">
                          ({customer.code})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Branch */}

            <div className="space-y-2">
              <Label>
                Branch <span className="text-destructive">*</span>
              </Label>

              <Select
                value={branchId}
                onValueChange={setBranchId}
                disabled={!customerId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      customerId
                        ? "Select branch"
                        : "Select customer first"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {customerBranches.map((branch) => (
                    <SelectItem
                      key={branch.id}
                      value={String(branch.id)}
                    >
                      {branch.name} — {branch.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected customer summary */}

          {selectedCustomer && selectedBranch && (
            <div className="mt-6 rounded-lg border bg-muted/30 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Customer
                  </p>

                  <p className="mt-1 font-medium">
                    {selectedCustomer.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Customer Code
                  </p>

                  <p className="mt-1 font-medium">
                    {selectedCustomer.code}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Branch
                  </p>

                  <p className="mt-1 font-medium">
                    {selectedBranch.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardBox>

        {/* ================================================== */}
        {/* SERVICES */}
        {/* ================================================== */}

        <CardBox>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h3 className="font-semibold">
                  Requested Services
                </h3>

                <p className="text-sm text-muted-foreground">
                  Add one or more optional services.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setServiceDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>

          {/* Empty state */}

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-14">
              <Package className="mb-3 h-10 w-10 text-muted-foreground" />

              <h4 className="font-medium">
                No services added
              </h4>

              <p className="mt-1 text-sm text-muted-foreground">
                Add at least one optional service to continue.
              </p>

              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setServiceDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop table */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="px-4 py-3 font-medium">
                        Service
                      </th>

                      <th className="px-4 py-3 text-center font-medium">
                        Quantity
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Unit Price
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Total
                      </th>

                      <th className="w-16 px-4 py-3" />
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b last:border-0"
                      >
                        <td className="px-4 py-4">
                          <span className="font-medium">
                            {item.serviceName}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          {item.quantity ?? "—"}
                        </td>

                        <td className="px-4 py-4 text-right">
                          {item.unitPrice.toLocaleString()} EGP
                        </td>

                        <td className="px-4 py-4 text-right font-medium">
                          {item.totalAmount.toLocaleString()} EGP
                        </td>

                        <td className="px-4 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              handleRemoveItem(item.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}

              <div className="space-y-3 md:hidden">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {item.serviceName}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.quantity
                            ? `Quantity: ${item.quantity}`
                            : "Price-based service"}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() =>
                          handleRemoveItem(item.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 flex justify-between border-t pt-3">
                      <span className="text-sm text-muted-foreground">
                        Total
                      </span>

                      <span className="font-semibold">
                        {item.totalAmount.toLocaleString()} EGP
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}

              <div className="mt-6 flex justify-end">
                <div className="w-full rounded-lg bg-muted/40 p-4 sm:w-80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-muted-foreground" />

                      <span className="text-sm text-muted-foreground">
                        Request Total
                      </span>
                    </div>

                    <span className="text-lg font-bold">
                      {requestTotal.toLocaleString()} EGP
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardBox>

        {/* ================================================== */}
        {/* NOTES */}
        {/* ================================================== */}

        <CardBox>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold">Notes</h3>

              <p className="text-sm text-muted-foreground">
                Add any additional information about this request.
              </p>
            </div>
          </div>

          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Enter request notes..."
            rows={4}
            maxLength={1000}
          />

          <div className="mt-2 text-right text-xs text-muted-foreground">
            {notes.length}/1000
          </div>
        </CardBox>

        {/* ================================================== */}
        {/* ACTIONS */}
        {/* ================================================== */}

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Button
            variant="outline"
            type="button"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!customerId || !branchId || items.length === 0}
          >
            Submit Request
          </Button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* ADD SERVICE DIALOG */}
      {/* ==================================================== */}

      <Dialog
        open={serviceDialogOpen}
        onOpenChange={setServiceDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Optional Service</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Service */}

            <div className="space-y-2">
              <Label>
                Service <span className="text-destructive">*</span>
              </Label>

              <Select
                value={selectedServiceId}
                onValueChange={handleServiceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>

                <SelectContent>
                  {planServices
                    .filter(
                      (service) =>
                        !items.some(
                          (item) =>
                            item.planServiceId === service.id
                        )
                    )
                    .map((service) => (
                      <SelectItem
                        key={service.id}
                        value={String(service.id)}
                      >
                        <div className="flex w-full items-center justify-between gap-6">
                          <span>{service.name}</span>

                          <span className="text-xs text-muted-foreground">
                            {service.price.toLocaleString()} EGP
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}

            {selectedService?.isQuantityBased && (
              <div className="space-y-2">
                <Label>
                  Quantity{" "}
                  <span className="text-destructive">*</span>
                </Label>

                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                />
              </div>
            )}

            {/* Price */}

            {selectedService && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedService.isQuantityBased
                      ? "Unit Price"
                      : "Price"}
                  </span>

                  <span className="font-medium">
                    {selectedService.price.toLocaleString()} EGP
                  </span>
                </div>

                <div className="mt-3 flex justify-between border-t pt-3">
                  <span className="text-sm text-muted-foreground">
                    Total
                  </span>

                  <span className="font-semibold">
                    {(
                      selectedService.isQuantityBased
                        ? selectedService.price *
                          Math.max(1, Number(quantity) || 1)
                        : selectedService.price
                    ).toLocaleString()}{" "}
                    EGP
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setServiceDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button
              disabled={!selectedService}
              onClick={handleAddService}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddServiceRequest;
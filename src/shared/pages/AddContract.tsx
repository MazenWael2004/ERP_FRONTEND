import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  FileText,
  Package,
  Plus,
  Trash2,
  User,
  Wallet,
} from "lucide-react";

import CardBox from "src/components/shared/CardBox";
import BreadcrumbComp from "src/layouts/full/shared/breadcrumb/BreadcrumbComp";

import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";

type Step = 1 | 2 | 3 | 4 | 5;

type ContractItem = {
  id: number;
  type: "ADDITIONAL_UNIT" | "SERVICE" | "HARDWARE";
  name: string;
  quantity: number;
  unitPrice: number;
};

type SubscriptionMonth = {
  year: number;
  month: number;
  label: string;
};

const customers = [
  {
    id: 1,
    code: "CUS-00125",
    name: "ABC Pharmacy",
    type: "PHARMACEUTICAL",
    owner: "Mohamed Ahmed",
    taxNumber: "123456789",
    branches: [
      {
        id: 101,
        name: "Main Branch",
        manager: "Ahmed Mohamed",
        gln: "6221234567890",
        address: "12 Tahrir St, Dokki, Giza",
      },
      {
        id: 102,
        name: "Nasr City Branch",
        manager: "Mahmoud Ali",
        gln: "6221234567891",
        address: "15 Abbas El Akkad, Nasr City",
      },
    ],
  },
  {
    id: 2,
    code: "CUS-00142",
    name: "El Shifa Pharmacy",
    type: "PHARMACEUTICAL",
    owner: "Ahmed Hassan",
    taxNumber: "987654321",
    branches: [
      {
        id: 201,
        name: "Main Branch",
        manager: "Omar Hassan",
        gln: "6221234567892",
        address: "45 Faisal St, Giza",
      },
    ],
  },
];

const products = [
  {
    id: 1,
    name: "B-Connect ERP",
    packages: [
      {
        id: 1,
        name: "Silver",
        prices: [
          {
            id: 1,
            period: "1 - 12 Months",
            monthlyPrice: 500,
            joiningFee: 10000,
            discount: 0,
          },
          {
            id: 2,
            period: "13 - 24 Months",
            monthlyPrice: 500,
            joiningFee: 10000,
            discount: 0,
          },
          {
            id: 3,
            period: "25 - 36 Months",
            monthlyPrice: 500,
            joiningFee: 10000,
            discount: 0,
          },
        ],
      },
      {
        id: 2,
        name: "Gold",
        prices: [
          {
            id: 4,
            period: "1 - 12 Months",
            monthlyPrice: 600,
            joiningFee: 10000,
            discount: 0,
          },
          {
            id: 5,
            period: "13 - 24 Months",
            monthlyPrice: 600,
            joiningFee: 10000,
            discount: 0,
          },
          {
            id: 6,
            period: "25 - 36 Months",
            monthlyPrice: 600,
            joiningFee: 10000,
            discount: 0,
          },
        ],
      },
    ],
  },
];

const representatives = [
  {
    id: 1,
    name: "Ahmed Ali",
    managerId: 10,
  },
  {
    id: 2,
    name: "Omar Hassan",
    managerId: 11,
  },
];

const managers = [
  {
    id: 10,
    name: "Mohamed Hassan",
  },
  {
    id: 11,
    name: "Mahmoud Ibrahim",
  },
];

const transactionTypes = [
  {
    value: "NEW_CUSTOMER",
    label: "New Customer",
  },
  {
    value: "REACTIVATION",
    label: "Reactivation",
  },
  {
    value: "ADDITIONAL_UNIT",
    label: "Additional Unit Request",
  },
  {
    value: "COMMERCIAL_ESTABLISHMENT",
    label: "Commercial Establishment Request",
  },
];

const itemTypes = [
  {
    value: "ADDITIONAL_UNIT",
    label: "Additional Unit",
  },
  {
    value: "SERVICE",
    label: "Service",
  },
  {
    value: "HARDWARE",
    label: "Hardware",
  },
];

const itemOptions = [
  "Additional PC",
  "Printer",
  "Barcode Scanner",
  "Installation Service",
  "Training Service",
];

const paymentMethods = [
  {
    value: "CASH",
    label: "Cash",
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
  },
  {
    value: "CREDIT_CARD",
    label: "Credit Card",
  },
  {
    value: "CHEQUE",
    label: "Cheque",
  },
  {
    value: "ONLINE_PAYMENT",
    label: "Online Payment",
  },
];

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const AddContract = () => {
  const [step, setStep] = useState<Step>(1);

  // ==========================================================
  // CUSTOMER
  // ==========================================================

  const [customerId, setCustomerId] = useState("");
  const [branchId, setBranchId] = useState("");

  // ==========================================================
  // CONTRACT
  // ==========================================================

  const [transactionType, setTransactionType] =
    useState("NEW_CUSTOMER");

  const [contractNumber] = useState("CNT-2026-000125");
  const [contractDate] = useState("2026-09-17");

  const [representativeId, setRepresentativeId] =
    useState("");

  const [managerId, setManagerId] =
    useState("");

  // ==========================================================
  // PRICING
  // ==========================================================

  const [productId, setProductId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [pricingId, setPricingId] = useState("");

  // ==========================================================
  // ADDITIONAL ITEMS
  // ==========================================================

  const [items, setItems] = useState<ContractItem[]>([]);

  // ==========================================================
  // PAYMENT
  // ==========================================================

  // The deposit is the amount actually paid by the customer.
  const [depositAmount, setDepositAmount] = useState("");

  // Exact months that are being paid in advance.
  const [selectedSubscriptionMonths, setSelectedSubscriptionMonths] =
    useState<SubscriptionMonth[]>([]);

  const [paymentMethod, setPaymentMethod] = useState("");

  const [paymentDate, setPaymentDate] =
    useState("2026-09-17");

  const [paymentReference, setPaymentReference] =
    useState("");

  const [paymentNotes, setPaymentNotes] =
    useState("");

  // ==========================================================
  // INSTALLATION
  // ==========================================================

  const [installationRequired, setInstallationRequired] =
    useState(true);

  const [installationDate, setInstallationDate] =
    useState("");

  const [
    installationRepresentativeId,
    setInstallationRepresentativeId,
  ] = useState("");

  const [existingProgram, setExistingProgram] =
    useState("");

  const [equipment, setEquipment] =
    useState<string[]>([]);

  // ==========================================================
  // ADD ITEM FORM
  // ==========================================================

  const [showAddItem, setShowAddItem] =
    useState(false);

  const [newItemType, setNewItemType] =
    useState<ContractItem["type"]>("ADDITIONAL_UNIT");

  const [newItemName, setNewItemName] =
    useState("");

  const [newItemQuantity, setNewItemQuantity] =
    useState("1");

  const [newItemPrice, setNewItemPrice] =
    useState("");

  // ==========================================================
  // SELECTED DATA
  // ==========================================================

  const selectedCustomer = useMemo(
    () =>
      customers.find(
        (customer) =>
          customer.id.toString() === customerId
      ),
    [customerId]
  );

  const selectedBranch = useMemo(
    () =>
      selectedCustomer?.branches.find(
        (branch) =>
          branch.id.toString() === branchId
      ),
    [selectedCustomer, branchId]
  );

  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) =>
          product.id.toString() === productId
      ),
    [productId]
  );

  const selectedPackage = useMemo(
    () =>
      selectedProduct?.packages.find(
        (pkg) =>
          pkg.id.toString() === packageId
      ),
    [selectedProduct, packageId]
  );

  const selectedPricing = useMemo(
    () =>
      selectedPackage?.prices.find(
        (price) =>
          price.id.toString() === pricingId
      ),
    [selectedPackage, pricingId]
  );

  // ==========================================================
  // SUBSCRIPTION MONTHS
  // ==========================================================

  const subscriptionMonths = useMemo(() => {
    const result: SubscriptionMonth[] = [];

    const startDate = new Date(contractDate);

    if (Number.isNaN(startDate.getTime())) {
      return result;
    }

    // Show the next 12 subscription months.
    for (let i = 0; i < 12; i++) {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1
      );

      result.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }

    return result;
  }, [contractDate]);

  const toggleSubscriptionMonth = (
    month: SubscriptionMonth
  ) => {
    setSelectedSubscriptionMonths((current) => {
      const exists = current.some(
        (item) =>
          item.year === month.year &&
          item.month === month.month
      );

      if (exists) {
        return current.filter(
          (item) =>
            !(
              item.year === month.year &&
              item.month === month.month
            )
        );
      }

      return [...current, month].sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }

        return a.month - b.month;
      });
    });
  };

  // ==========================================================
  // FINANCIAL CALCULATIONS
  // ==========================================================

  const additionalItemsTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          item.quantity *
            item.unitPrice,
        0
      ),
    [items]
  );

  const depositAmountValue = Number(
    depositAmount || 0
  );

  const monthlySubscriptionAmount =
    selectedPricing?.monthlyPrice || 0;

  const subscriptionMonthCount =
    selectedSubscriptionMonths.length;

  const subscriptionPrepayment =
    subscriptionMonthCount *
    monthlySubscriptionAmount;

  /*
   * This is the actual amount collected from the customer now.
   *
   * Deposit
   * +
   * Selected subscription months
   */
  const totalPaidNow =
    depositAmountValue +
    subscriptionPrepayment;

  /*
   * Charges created by the contract.
   *
   * IMPORTANT:
   * Deposit is NOT included here because it is a payment.
   */
  const initialCharges =
    (selectedPricing?.joiningFee || 0) +
    additionalItemsTotal;

  /*
   * Remaining setup charges after applying the deposit.
   */
  const remainingInitialCharges =
    Math.max(
      initialCharges -
        depositAmountValue,
      0
    );

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const canGoNext = () => {
    if (step === 1) {
      return Boolean(
        customerId && branchId
      );
    }

    if (step === 2) {
      return Boolean(
        transactionType &&
          representativeId &&
          managerId
      );
    }

    if (step === 3) {
      return Boolean(
        productId &&
          packageId &&
          pricingId
      );
    }

    if (step === 4) {
      /*
       * If money is being collected,
       * a payment method is required.
       */
      if (totalPaidNow > 0) {
        return Boolean(paymentMethod);
      }

      return true;
    }

    return true;
  };

  const nextStep = () => {
    if (!canGoNext()) {
      return;
    }

    setStep((current) =>
      current < 5
        ? ((current + 1) as Step)
        : current
    );
  };

  const previousStep = () => {
    setStep((current) =>
      current > 1
        ? ((current - 1) as Step)
        : current
    );
  };

  // ==========================================================
  // ITEMS
  // ==========================================================

  const addItem = () => {
    if (!newItemName || !newItemPrice) {
      return;
    }

    const item: ContractItem = {
      id: Date.now(),
      type: newItemType,
      name: newItemName,
      quantity: Number(
        newItemQuantity || 1
      ),
      unitPrice: Number(newItemPrice),
    };

    setItems((current) => [
      ...current,
      item,
    ]);

    setNewItemName("");
    setNewItemQuantity("1");
    setNewItemPrice("");
    setShowAddItem(false);
  };

  const removeItem = (id: number) => {
    setItems((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  // ==========================================================
  // EQUIPMENT
  // ==========================================================

  const toggleEquipment = (name: string) => {
    setEquipment((current) =>
      current.includes(name)
        ? current.filter(
            (item) => item !== name
          )
        : [...current, name]
    );
  };

  // ==========================================================
  // CREATE CONTRACT
  // ==========================================================

  const createContract = async () => {
    const payload = {
      customer_id: Number(customerId),

      customer_branch_id: Number(
        branchId
      ),

      contract_number:
        contractNumber,

      contract_date:
        contractDate,

      transaction_type:
        transactionType,

      representative_id: Number(
        representativeId
      ),

      technical_support_manager_id:
        Number(managerId),

      pricing_id: Number(pricingId),

      // ======================================================
      // DEPOSIT
      // ======================================================

      deposit_amount:
        depositAmountValue,

      // ======================================================
      // SUBSCRIPTION PAYMENTS
      // ======================================================

      subscription_payments:
        selectedSubscriptionMonths.map(
          (month) => ({
            year: month.year,
            month: month.month,
            amount:
              monthlySubscriptionAmount,
          })
        ),

      // ======================================================
      // ADDITIONAL ITEMS
      // ======================================================

      items: items.map((item) => ({
        type: item.type,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),

      // ======================================================
      // INITIAL COLLECTION
      // ======================================================

      initial_payment: {
        amount: totalPaidNow,

        payment_method:
          totalPaidNow > 0
            ? paymentMethod
            : null,

        payment_date:
          totalPaidNow > 0
            ? paymentDate
            : null,

        reference_number:
          paymentReference || null,

        notes:
          paymentNotes || null,
      },

      // ======================================================
      // INSTALLATION
      // ======================================================

      installation:
        installationRequired
          ? {
              required: true,

              installation_date:
                installationDate ||
                null,

              representative_id:
                installationRepresentativeId
                  ? Number(
                      installationRepresentativeId
                    )
                  : null,

              existing_program:
                existingProgram ||
                null,

              equipment,
            }
          : {
              required: false,
            },
    };

    console.log(
      "CREATE CONTRACT PAYLOAD",
      payload
    );

    // Example:
    //
    // await api.post("/contracts", payload);

    alert(
      "Contract created successfully."
    );
  };

  // ==========================================================
  // STEPS
  // ==========================================================

  const steps = [
    {
      id: 1,
      title: "Customer",
      icon: Building2,
    },
    {
      id: 2,
      title: "Contract",
      icon: FileText,
    },
    {
      id: 3,
      title: "Pricing",
      icon: Package,
    },
    {
      id: 4,
      title: "Payment",
      icon: Wallet,
    },
    {
      id: 5,
      title: "Review",
      icon: Check,
    },
  ];

  // ==========================================================
  // JSX
  // ==========================================================

  return (
    <div className="space-y-6">
      <BreadcrumbComp
        title="Add Contract"
        items={[
          {
            title: "Contracts",
          },
          {
            title: "Add Contract",
          },
        ]}
      />

      <CardBox>
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Add Contract
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create a new contract for a customer branch.
          </p>
        </div>

        {/* ================================================== */}
        {/* STEPPER */}
        {/* ================================================== */}

        <div className="mb-10 overflow-x-auto">
          <div className="flex min-w-[700px] items-center">
            {steps.map((item, index) => {
              const Icon = item.icon;

              const active =
                step === item.id;

              const completed =
                step > item.id;

              return (
                <div
                  key={item.id}
                  className="flex flex-1 items-center"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition",
                        completed
                          ? "border-primary bg-primary text-white"
                          : active
                          ? "border-primary text-primary"
                          : "border-gray-200 text-gray-400 dark:border-gray-700",
                      ].join(" ")}
                    >
                      {completed ? (
                        <Check size={18} />
                      ) : (
                        <Icon size={18} />
                      )}
                    </div>

                    <div>
                      <p
                        className={[
                          "text-sm font-medium",
                          active ||
                          completed
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-400",
                        ].join(" ")}
                      >
                        {item.id}.{" "}
                        {item.title}
                      </p>
                    </div>
                  </div>

                  {index <
                    steps.length - 1 && (
                    <div
                      className={[
                        "mx-4 h-px flex-1",
                        step > item.id
                          ? "bg-primary"
                          : "bg-gray-200 dark:bg-gray-700",
                      ].join(" ")}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================== */}
        {/* STEP 1 — CUSTOMER */}
        {/* ================================================== */}

        {step === 1 && (
          <div className="space-y-6">
            <SectionHeader
              icon={
                <Building2 size={20} />
              }
              title="Customer & Branch"
              description="Select the customer and branch this contract belongs to."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                label="Customer"
                required
              >
                <Select
                  value={customerId}
                  onValueChange={(value) => {
                    setCustomerId(value);
                    setBranchId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>

                  <SelectContent>
                    {customers.map(
                      (customer) => (
                        <SelectItem
                          key={
                            customer.id
                          }
                          value={customer.id.toString()}
                        >
                          {customer.name} (
                          {
                            customer.code
                          }
                          )
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Branch"
                required
              >
                <Select
                  value={branchId}
                  onValueChange={
                    setBranchId
                  }
                  disabled={
                    !selectedCustomer
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedCustomer
                          ? "Select branch"
                          : "Select customer first"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {selectedCustomer?.branches.map(
                      (branch) => (
                        <SelectItem
                          key={
                            branch.id
                          }
                          value={branch.id.toString()}
                        >
                          {
                            branch.name
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            {selectedCustomer && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="mb-4 flex items-center gap-2">
                  <User size={18} />

                  <h3 className="font-semibold">
                    Customer Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <InfoItem
                    label="Customer"
                    value={
                      selectedCustomer.name
                    }
                  />

                  <InfoItem
                    label="Code"
                    value={
                      selectedCustomer.code
                    }
                  />

                  <InfoItem
                    label="Type"
                    value={
                      selectedCustomer.type
                    }
                  />

                  <InfoItem
                    label="Owner"
                    value={
                      selectedCustomer.owner
                    }
                  />

                  <InfoItem
                    label="Tax Number"
                    value={
                      selectedCustomer.taxNumber
                    }
                  />
                </div>
              </div>
            )}

            {selectedBranch && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                <h3 className="mb-4 font-semibold">
                  Branch Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <InfoItem
                    label="Branch"
                    value={
                      selectedBranch.name
                    }
                  />

                  <InfoItem
                    label="Manager"
                    value={
                      selectedBranch.manager
                    }
                  />

                  <InfoItem
                    label="GLN"
                    value={
                      selectedBranch.gln
                    }
                  />

                  <InfoItem
                    label="Address"
                    value={
                      selectedBranch.address
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================== */}
        {/* STEP 2 — CONTRACT */}
        {/* ================================================== */}

        {step === 2 && (
          <div className="space-y-6">
            <SectionHeader
              icon={
                <FileText size={20} />
              }
              title="Contract Information"
              description="Define the contract type and responsible staff."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Contract Number">
                <Input
                  value={contractNumber}
                  disabled
                />
              </FormField>

              <FormField label="Contract Date">
                <Input
                  type="date"
                  value={contractDate}
                  disabled
                />
              </FormField>

              <FormField
                label="Transaction Type"
                required
              >
                <Select
                  value={
                    transactionType
                  }
                  onValueChange={
                    setTransactionType
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {transactionTypes.map(
                      (type) => (
                        <SelectItem
                          key={
                            type.value
                          }
                          value={
                            type.value
                          }
                        >
                          {type.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Representative"
                required
              >
                <Select
                  value={
                    representativeId
                  }
                  onValueChange={(
                    value
                  ) => {
                    setRepresentativeId(
                      value
                    );

                    const representative =
                      representatives.find(
                        (rep) =>
                          rep.id.toString() ===
                          value
                      );

                    if (
                      representative
                    ) {
                      setManagerId(
                        representative.managerId.toString()
                      );
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select representative" />
                  </SelectTrigger>

                  <SelectContent>
                    {representatives.map(
                      (
                        representative
                      ) => (
                        <SelectItem
                          key={
                            representative.id
                          }
                          value={representative.id.toString()}
                        >
                          {
                            representative.name
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Technical Support Manager"
                required
              >
                <Select
                  value={managerId}
                  onValueChange={
                    setManagerId
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>

                  <SelectContent>
                    {managers.map(
                      (manager) => (
                        <SelectItem
                          key={
                            manager.id
                          }
                          value={manager.id.toString()}
                        >
                          {manager.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                The representative will be responsible
                for handling this contract and the
                selected customer branch.
              </p>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* STEP 3 — PRICING */}
        {/* ================================================== */}

        {step === 3 && (
          <div className="space-y-8">
            <SectionHeader
              icon={
                <Package size={20} />
              }
              title="Pricing & Services"
              description="Select the product, package, pricing period, and additional items."
            />

            {/* PRODUCT / PACKAGE / PRICING */}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormField
                label="Software Product"
                required
              >
                <Select
                  value={productId}
                  onValueChange={(value) => {
                    setProductId(value);
                    setPackageId("");
                    setPricingId("");
                    setSelectedSubscriptionMonths(
                      []
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>

                  <SelectContent>
                    {products.map(
                      (product) => (
                        <SelectItem
                          key={
                            product.id
                          }
                          value={product.id.toString()}
                        >
                          {
                            product.name
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Package"
                required
              >
                <Select
                  value={packageId}
                  onValueChange={(value) => {
                    setPackageId(value);
                    setPricingId("");
                    setSelectedSubscriptionMonths(
                      []
                    );
                  }}
                  disabled={
                    !selectedProduct
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>

                  <SelectContent>
                    {selectedProduct?.packages.map(
                      (pkg) => (
                        <SelectItem
                          key={pkg.id}
                          value={pkg.id.toString()}
                        >
                          {pkg.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Pricing Period"
                required
              >
                <Select
                  value={pricingId}
                  onValueChange={(value) => {
                    setPricingId(value);
                    setSelectedSubscriptionMonths(
                      []
                    );
                  }}
                  disabled={
                    !selectedPackage
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing" />
                  </SelectTrigger>

                  <SelectContent>
                    {selectedPackage?.prices.map(
                      (price) => (
                        <SelectItem
                          key={price.id}
                          value={price.id.toString()}
                        >
                          {
                            price.period
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            {/* PRICING SUMMARY */}

            {selectedPricing && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FinancialCard
                  label="Monthly Subscription"
                  value={
                    selectedPricing.monthlyPrice
                  }
                />

                <FinancialCard
                  label="Joining Fee"
                  value={
                    selectedPricing.joiningFee
                  }
                />

                <FinancialCard
                  label="Discount"
                  value={
                    selectedPricing.discount
                  }
                  suffix="%"
                />
              </div>
            )}

            {/* ADDITIONAL ITEMS */}

            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Additional Items
                  </h3>

                  <p className="text-sm text-gray-500">
                    Add additional units, services, or hardware.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setShowAddItem(true)
                  }
                >
                  <Plus
                    size={16}
                    className="mr-2"
                  />

                  Add Item
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                  <Package
                    size={32}
                    className="mx-auto mb-2 text-gray-400"
                  />

                  <p className="text-sm text-gray-500">
                    No additional items added.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          Type
                        </th>

                        <th className="px-4 py-3 text-left">
                          Item
                        </th>

                        <th className="px-4 py-3 text-right">
                          Quantity
                        </th>

                        <th className="px-4 py-3 text-right">
                          Unit Price
                        </th>

                        <th className="px-4 py-3 text-right">
                          Total
                        </th>

                        <th />
                      </tr>
                    </thead>

                    <tbody>
                      {items.map(
                        (item) => (
                          <tr
                            key={
                              item.id
                            }
                            className="border-t dark:border-gray-700"
                          >
                            <td className="px-4 py-3">
                              {item.type.replace(
                                "_",
                                " "
                              )}
                            </td>

                            <td className="px-4 py-3 font-medium">
                              {
                                item.name
                              }
                            </td>

                            <td className="px-4 py-3 text-right">
                              {
                                item.quantity
                              }
                            </td>

                            <td className="px-4 py-3 text-right">
                              {formatMoney(
                                item.unitPrice
                              )}{" "}
                              EGP
                            </td>

                            <td className="px-4 py-3 text-right font-medium">
                              {formatMoney(
                                item.quantity *
                                  item.unitPrice
                              )}{" "}
                              EGP
                            </td>

                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeItem(
                                    item.id
                                  )
                                }
                              >
                                <Trash2
                                  size={16}
                                  className="text-red-500"
                                />
                              </Button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ADD ITEM FORM */}

              {showAddItem && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                  <h4 className="mb-4 font-semibold">
                    Add Contract Item
                  </h4>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <FormField label="Type">
                      <Select
                        value={
                          newItemType
                        }
                        onValueChange={(
                          value
                        ) =>
                          setNewItemType(
                            value as ContractItem["type"]
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {itemTypes.map(
                            (type) => (
                              <SelectItem
                                key={
                                  type.value
                                }
                                value={
                                  type.value
                                }
                              >
                                {
                                  type.label
                                }
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Item">
                      <Select
                        value={
                          newItemName
                        }
                        onValueChange={
                          setNewItemName
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>

                        <SelectContent>
                          {itemOptions.map(
                            (item) => (
                              <SelectItem
                                key={item}
                                value={item}
                              >
                                {item}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Quantity">
                      <Input
                        type="number"
                        min="1"
                        value={
                          newItemQuantity
                        }
                        onChange={(e) =>
                          setNewItemQuantity(
                            e.target.value
                          )
                        }
                      />
                    </FormField>

                    <FormField label="Unit Price">
                      <Input
                        type="number"
                        min="0"
                        value={
                          newItemPrice
                        }
                        onChange={(e) =>
                          setNewItemPrice(
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    </FormField>
                  </div>

                  <div className="mt-5 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setShowAddItem(false)
                      }
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={addItem}
                    >
                      <Plus
                        size={16}
                        className="mr-2"
                      />

                      Add Item
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* INSTALLATION */}

            <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
              <div className="mb-5">
                <h3 className="font-semibold">
                  Installation
                </h3>

                <p className="text-sm text-gray-500">
                  Configure installation requirements
                  for this contract.
                </p>
              </div>

              <div className="mb-5 flex gap-3">
                <Button
                  type="button"
                  variant={
                    installationRequired
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setInstallationRequired(
                      true
                    )
                  }
                >
                  Required
                </Button>

                <Button
                  type="button"
                  variant={
                    !installationRequired
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setInstallationRequired(
                      false
                    )
                  }
                >
                  Not Required
                </Button>
              </div>

              {installationRequired && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <FormField label="Installation Date">
                    <Input
                      type="date"
                      value={
                        installationDate
                      }
                      onChange={(e) =>
                        setInstallationDate(
                          e.target.value
                        )
                      }
                    />
                  </FormField>

                  <FormField label="Installation Representative">
                    <Select
                      value={
                        installationRepresentativeId
                      }
                      onValueChange={
                        setInstallationRepresentativeId
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select representative" />
                      </SelectTrigger>

                      <SelectContent>
                        {representatives.map(
                          (rep) => (
                            <SelectItem
                              key={rep.id}
                              value={rep.id.toString()}
                            >
                              {rep.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Existing Program">
                    <Input
                      value={
                        existingProgram
                      }
                      onChange={(e) =>
                        setExistingProgram(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Previous ERP"
                    />
                  </FormField>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* STEP 4 — PAYMENT */}
        {/* ================================================== */}

        {step === 4 && (
          <div className="space-y-6">
            <SectionHeader
              icon={
                <Wallet size={20} />
              }
              title="Initial Payment"
              description="Record the deposit and select the exact subscription months being paid in advance."
            />

            {/* FINANCIAL SUMMARY */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FinancialCard
                label="Joining Fee"
                value={
                  selectedPricing?.joiningFee ||
                  0
                }
              />

              <FinancialCard
                label="Additional Items"
                value={
                  additionalItemsTotal
                }
              />

              <FinancialCard
                label="Monthly Subscription"
                value={
                  monthlySubscriptionAmount
                }
              />

              <FinancialCard
                label="Deposit"
                value={
                  depositAmountValue
                }
              />
            </div>

            {/* DEPOSIT */}

            <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
              <div className="mb-5 flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Wallet size={20} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Deposit
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The deposit is the amount actually
                    paid by the customer. It is not an
                    additional contract charge.
                  </p>
                </div>
              </div>

              <div className="max-w-md">
                <FormField label="Deposit Amount">
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        depositAmount
                      }
                      onChange={(e) =>
                        setDepositAmount(
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                      className="pr-16"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      EGP
                    </span>
                  </div>
                </FormField>
              </div>
            </div>

            {/* EXACT SUBSCRIPTION MONTHS */}

            <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Monthly Subscription Payment
                    </h3>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Select the exact months the
                      customer is paying for now.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Monthly Price
                  </p>

                  <p className="font-semibold">
                    {formatMoney(
                      monthlySubscriptionAmount
                    )}{" "}
                    EGP
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {subscriptionMonths.map(
                  (month) => {
                    const isSelected =
                      selectedSubscriptionMonths.some(
                        (item) =>
                          item.year ===
                            month.year &&
                          item.month ===
                            month.month
                      );

                    return (
                      <label
                        key={`${month.year}-${month.month}`}
                        className={[
                          "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={
                              isSelected
                            }
                            onChange={() =>
                              toggleSubscriptionMonth(
                                month
                              )
                            }
                            className="h-4 w-4 rounded border-gray-300"
                          />

                          <div>
                            <p className="font-medium">
                              {
                                month.label
                              }
                            </p>

                            <p className="text-xs text-gray-500">
                              Monthly Subscription
                            </p>
                          </div>
                        </div>

                        <span className="font-medium">
                          {formatMoney(
                            monthlySubscriptionAmount
                          )}{" "}
                          EGP
                        </span>
                      </label>
                    );
                  }
                )}
              </div>

              {/* SELECTED MONTHS SUMMARY */}

              <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Selected Months
                  </span>

                  <span className="font-semibold">
                    {
                      subscriptionMonthCount
                    }
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Subscription Prepayment
                  </span>

                  <span className="text-lg font-bold">
                    {formatMoney(
                      subscriptionPrepayment
                    )}{" "}
                    EGP
                  </span>
                </div>
              </div>

              {/* SELECTED MONTH NAMES */}

              {selectedSubscriptionMonths.length >
                0 && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                  <div className="flex items-start gap-3">
                    <Check
                      size={20}
                      className="mt-0.5 text-green-600"
                    />

                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300">
                        Months being paid
                      </p>

                      <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                        {selectedSubscriptionMonths
                          .map(
                            (month) =>
                              month.label
                          )
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PAYMENT DETAILS */}

            <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
              <div className="mb-5">
                <h3 className="font-semibold">
                  Payment Details
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Details of the actual collection received
                  from the customer.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  label="Payment Method"
                  required={
                    totalPaidNow > 0
                  }
                >
                  <Select
                    value={
                      paymentMethod
                    }
                    onValueChange={
                      setPaymentMethod
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>

                    <SelectContent>
                      {paymentMethods.map(
                        (method) => (
                          <SelectItem
                            key={
                              method.value
                            }
                            value={
                              method.value
                            }
                          >
                            {
                              method.label
                            }
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Payment Date">
                  <Input
                    type="date"
                    value={
                      paymentDate
                    }
                    onChange={(e) =>
                      setPaymentDate(
                        e.target.value
                      )
                    }
                  />
                </FormField>

                <FormField label="Reference Number">
                  <Input
                    value={
                      paymentReference
                    }
                    onChange={(e) =>
                      setPaymentReference(
                        e.target.value
                      )
                    }
                    placeholder="Receipt / transaction reference"
                  />
                </FormField>

                <FormField label="Payment Notes">
                  <Input
                    value={
                      paymentNotes
                    }
                    onChange={(e) =>
                      setPaymentNotes(
                        e.target.value
                      )
                    }
                    placeholder="Optional notes"
                  />
                </FormField>
              </div>
            </div>

            {/* PAYMENT SUMMARY */}

            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-5">
              <h3 className="mb-4 font-semibold">
                Payment Summary
              </h3>

              <div className="space-y-3">
                <SummaryRow
                  label="Deposit"
                  value={
                    depositAmountValue
                  }
                />

                <SummaryRow
                  label="Subscription Prepayment"
                  value={
                    subscriptionPrepayment
                  }
                />

                <div className="border-t pt-3 dark:border-gray-700">
                  <SummaryRow
                    label="Total Paid Now"
                    value={
                      totalPaidNow
                    }
                    bold
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* STEP 5 — REVIEW */}
        {/* ================================================== */}

        {step === 5 && (
          <div className="space-y-6">
            <SectionHeader
              icon={
                <Check size={20} />
              }
              title="Review Contract"
              description="Review all contract information before creating it."
            />

            {/* CUSTOMER */}

            <ReviewSection title="Customer">
              <ReviewGrid
                items={[
                  {
                    label: "Customer",
                    value:
                      selectedCustomer?.name ||
                      "-",
                  },
                  {
                    label:
                      "Customer Code",
                    value:
                      selectedCustomer?.code ||
                      "-",
                  },
                  {
                    label: "Type",
                    value:
                      selectedCustomer?.type ||
                      "-",
                  },
                  {
                    label: "Owner",
                    value:
                      selectedCustomer?.owner ||
                      "-",
                  },
                ]}
              />
            </ReviewSection>

            {/* BRANCH */}

            <ReviewSection title="Branch">
              <ReviewGrid
                items={[
                  {
                    label: "Branch",
                    value:
                      selectedBranch?.name ||
                      "-",
                  },
                  {
                    label: "Manager",
                    value:
                      selectedBranch?.manager ||
                      "-",
                  },
                  {
                    label: "GLN",
                    value:
                      selectedBranch?.gln ||
                      "-",
                  },
                  {
                    label: "Address",
                    value:
                      selectedBranch?.address ||
                      "-",
                  },
                ]}
              />
            </ReviewSection>

            {/* CONTRACT */}

            <ReviewSection title="Contract">
              <ReviewGrid
                items={[
                  {
                    label:
                      "Contract Number",
                    value:
                      contractNumber,
                  },
                  {
                    label:
                      "Contract Date",
                    value:
                      contractDate,
                  },
                  {
                    label: "Transaction",
                    value:
                      transactionTypes.find(
                        (type) =>
                          type.value ===
                          transactionType
                      )?.label || "-",
                  },
                  {
                    label:
                      "Representative",
                    value:
                      representatives.find(
                        (rep) =>
                          rep.id.toString() ===
                          representativeId
                      )?.name || "-",
                  },
                  {
                    label: "Manager",
                    value:
                      managers.find(
                        (manager) =>
                          manager.id.toString() ===
                          managerId
                      )?.name || "-",
                  },
                ]}
              />
            </ReviewSection>

            {/* PACKAGE */}

            <ReviewSection title="Package & Pricing">
              <ReviewGrid
                items={[
                  {
                    label: "Product",
                    value:
                      selectedProduct?.name ||
                      "-",
                  },
                  {
                    label: "Package",
                    value:
                      selectedPackage?.name ||
                      "-",
                  },
                  {
                    label:
                      "Pricing Period",
                    value:
                      selectedPricing?.period ||
                      "-",
                  },
                  {
                    label:
                      "Monthly Subscription",
                    value: `${formatMoney(
                      monthlySubscriptionAmount
                    )} EGP`,
                  },
                  {
                    label:
                      "Joining Fee",
                    value: `${formatMoney(
                      selectedPricing?.joiningFee ||
                        0
                    )} EGP`,
                  },
                ]}
              />
            </ReviewSection>

            {/* SUBSCRIPTION PAYMENT */}

            <ReviewSection title="Subscription Payment">
              <div className="space-y-4">
                <ReviewGrid
                  items={[
                    {
                      label:
                        "Months Selected",
                      value:
                        subscriptionMonthCount.toString(),
                    },
                    {
                      label:
                        "Monthly Amount",
                      value: `${formatMoney(
                        monthlySubscriptionAmount
                      )} EGP`,
                    },
                    {
                      label:
                        "Subscription Prepayment",
                      value: `${formatMoney(
                        subscriptionPrepayment
                      )} EGP`,
                    },
                  ]}
                />

                {selectedSubscriptionMonths.length >
                  0 && (
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                    <p className="mb-3 text-sm font-medium">
                      Exact Months Paid
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {selectedSubscriptionMonths.map(
                        (month) => (
                          <span
                            key={`${month.year}-${month.month}`}
                            className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                          >
                            {month.label}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ReviewSection>

            {/* ADDITIONAL ITEMS */}

            <ReviewSection title="Additional Items">
              {items.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No additional items.
                </p>
              ) : (
                <div className="space-y-2">
                  {items.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-3 dark:bg-gray-800"
                      >
                        <div>
                          <p className="font-medium">
                            {
                              item.name
                            }
                          </p>

                          <p className="text-xs text-gray-500">
                            {
                              item.quantity
                            }{" "}
                            ×{" "}
                            {formatMoney(
                              item.unitPrice
                            )}{" "}
                            EGP
                          </p>
                        </div>

                        <p className="font-semibold">
                          {formatMoney(
                            item.quantity *
                              item.unitPrice
                          )}{" "}
                          EGP
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </ReviewSection>

            {/* FINANCIAL SUMMARY */}

            <ReviewSection title="Financial Summary">
              <div className="space-y-3">
                <SummaryRow
                  label="Joining Fee"
                  value={
                    selectedPricing?.joiningFee ||
                    0
                  }
                />

                <SummaryRow
                  label="Additional Items"
                  value={
                    additionalItemsTotal
                  }
                />

                <SummaryRow
                  label="Initial Charges"
                  value={
                    initialCharges
                  }
                />

                <div className="border-t pt-3 dark:border-gray-700">
                  <SummaryRow
                    label="Deposit Paid"
                    value={
                      depositAmountValue
                    }
                  />
                </div>

                <SummaryRow
                  label="Subscription Prepayment"
                  value={
                    subscriptionPrepayment
                  }
                />

                <div className="border-t pt-3 dark:border-gray-700">
                  <SummaryRow
                    label="Total Paid Now"
                    value={
                      totalPaidNow
                    }
                    bold
                  />
                </div>

                <SummaryRow
                  label="Remaining Initial Charges"
                  value={
                    remainingInitialCharges
                  }
                />
              </div>
            </ReviewSection>

            {/* PAYMENT */}

            <ReviewSection title="Payment">
              <ReviewGrid
                items={[
                  {
                    label:
                      "Payment Method",
                    value:
                      paymentMethod ||
                      "No payment",
                  },
                  {
                    label:
                      "Payment Date",
                    value:
                      totalPaidNow > 0
                        ? paymentDate
                        : "-",
                  },
                  {
                    label:
                      "Reference Number",
                    value:
                      paymentReference ||
                      "-",
                  },
                  {
                    label:
                      "Total Paid Now",
                    value: `${formatMoney(
                      totalPaidNow
                    )} EGP`,
                  },
                ]}
              />
            </ReviewSection>

            {/* INSTALLATION */}

            <ReviewSection title="Installation">
              <ReviewGrid
                items={[
                  {
                    label: "Required",
                    value:
                      installationRequired
                        ? "Yes"
                        : "No",
                  },
                  {
                    label:
                      "Installation Date",
                    value:
                      installationDate ||
                      "-",
                  },
                  {
                    label:
                      "Installation Representative",
                    value:
                      representatives.find(
                        (rep) =>
                          rep.id.toString() ===
                          installationRepresentativeId
                      )?.name || "-",
                  },
                  {
                    label:
                      "Existing Program",
                    value:
                      existingProgram ||
                      "-",
                  },
                  {
                    label: "Equipment",
                    value:
                      equipment.length >
                      0
                        ? equipment.join(
                            ", "
                          )
                        : "-",
                  },
                ]}
              />
            </ReviewSection>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Creating the contract will create the contract,
                related invoice lines, and the initial collection
                in one transaction.
              </p>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <div className="mt-10 flex items-center justify-between border-t pt-6 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 1) {
                window.history.back();
              } else {
                previousStep();
              }
            }}
          >
            <ArrowLeft
              size={16}
              className="mr-2"
            />

            {step === 1
              ? "Cancel"
              : "Back"}
          </Button>

          <div className="flex gap-3">
            {step === 5 ? (
              <Button
                onClick={
                  createContract
                }
              >
                <Check
                  size={16}
                  className="mr-2"
                />

                Create Contract
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={
                  !canGoNext()
                }
              >
                Next

                <ArrowRight
                  size={16}
                  className="ml-2"
                />
              </Button>
            )}
          </div>
        </div>
      </CardBox>
    </div>
  );
};

/* ========================================================== */
/* SMALL COMPONENTS */
/* ========================================================== */

const SectionHeader = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
        {icon}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
};

const FormField = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
};

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
};

const FinancialCard = ({
  label,
  value,
  suffix = "EGP",
}: {
  label: string;
  value: number;
  suffix?: string;
}) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
        {formatMoney(value)}{" "}
        {suffix}
      </p>
    </div>
  );
};

const ReviewSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
      <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      {children}
    </div>
  );
};

const ReviewGrid = ({
  items,
}: {
  items: {
    label: string;
    value: string;
  }[];
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {items.map((item) => (
        <InfoItem
          key={item.label}
          label={item.label}
          value={item.value}
        />
      ))}
    </div>
  );
};

const SummaryRow = ({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) => {
  return (
    <div className="flex items-center justify-between">
      <span
        className={
          bold
            ? "font-semibold text-gray-900 dark:text-white"
            : "text-sm text-gray-600 dark:text-gray-400"
        }
      >
        {label}
      </span>

      <span
        className={
          bold
            ? "font-semibold text-gray-900 dark:text-white"
            : "text-sm font-medium"
        }
      >
        {formatMoney(value)} EGP
      </span>
    </div>
  );
};

export default AddContract;
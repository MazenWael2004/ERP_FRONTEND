import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";

import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { Button } from "../../components/ui/button";

import { Checkbox } from "../../components/ui/checkbox";

import {
  Trash2,
  Plus,
  Upload,
  Building2,
  User,
  FileText,
  Phone,
  Save,
  X,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

const customerSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),

  code: z.string().min(1, "Customer code is required"),

  customerTypeId: z.string().min(1, "Customer type is required"),

  structure: z.enum(["SINGLE", "CHAIN"]),

  statusId: z.string().min(1, "Status is required"),

  credit: z.coerce.number().min(0, "Credit cannot be negative"),

  taxNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  licenseNumber: z.string().optional(),

  zoneId: z.string().min(1, "Zone is required"),

  branches: z
    .array(
      z.object({
        managerId: z.string().optional(),

        isMainBranch: z.boolean(),

        buildingNumber: z.string().min(1, "Building number is required"),
        street: z.string().min(1, "Street is required"),

        glnCode: z.string().optional(),

        zoneId: z.string().min(1, "Zone is required"),

        latitude: z.string().optional(),
        longitude: z.string().optional(),

        phones: z.array(
          z.object({
            phoneNumber: z.string().min(1, "Phone number is required"),

            phoneType: z.enum([
              "LANDLINE",
              "MOBILE",
              "WHATSAPP",
            ]),

            isPrimary: z.boolean(),
          })
        ),
      })
    )
    .min(1, "At least one branch is required"),

  documents: z.array(
    z.object({
      type: z.string().min(1, "Document type is required"),
      documentNumber: z.string().optional(),
      issuedAt: z.string().optional(),
      expiresAt: z.string().optional(),
      file: z.any().optional(),
    })
  ),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

// ============================================================
// MOCK DATA
// Replace these with API queries
// ============================================================

const customerTypes = [
  {
    id: "1",
    nameEn: "Pharmaceutical",
    nameAr: "صيدلية",
  },
  {
    id: "2",
    nameEn: "Commercial",
    nameAr: "تجاري",
  },
];

const statuses = [
  {
    id: "1",
    nameEn: "Active",
    nameAr: "نشط",
  },
  {
    id: "2",
    nameEn: "Inactive",
    nameAr: "غير نشط",
  },
];

const zones = [
  {
    id: "1",
    nameEn: "Nasr City",
    nameAr: "مدينة نصر",
  },
  {
    id: "2",
    nameEn: "Maadi",
    nameAr: "المعادي",
  },
  {
    id: "3",
    nameEn: "Dokki",
    nameAr: "الدقي",
  },
];

const managers = [
  {
    id: "1",
    name: "Ahmed Mohamed",
  },
  {
    id: "2",
    name: "Mohamed Ali",
  },
];

const documentTypes = [
  {
    value: "TAX_CARD",
    label: "Tax Card",
  },
  {
    value: "COMMERCIAL_REGISTER",
    label: "Commercial Register",
  },
  {
    value: "LICENSE",
    label: "License",
  },
  {
    value: "CONTRACT",
    label: "Contract",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function AddCustomer() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),

    defaultValues: {
      nameEn: "",
      nameAr: "",
      code: "",

      customerTypeId: "",
      structure: "SINGLE",
      statusId: "",

      credit: 0,

      taxNumber: "",
      registrationNumber: "",
      licenseNumber: "",

      zoneId: "",

      branches: [
        {
          managerId: "",
          isMainBranch: true,

          buildingNumber: "",
          street: "",
          glnCode: "",

          zoneId: "",

          latitude: "",
          longitude: "",

          phones: [
            {
              phoneNumber: "",
              phoneType: "MOBILE",
              isPrimary: true,
            },
          ],
        },
      ],

      documents: [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  const structure = watch("structure");

  // ============================================================
  // BRANCHES
  // ============================================================

  const {
    fields: branchFields,
    append: appendBranch,
    remove: removeBranch,
  } = useFieldArray({
    control,
    name: "branches",
  });

  // ============================================================
  // DOCUMENTS
  // ============================================================

  const {
    fields: documentFields,
    append: appendDocument,
    remove: removeDocument,
  } = useFieldArray({
    control,
    name: "documents",
  });

  // ============================================================
  // SUBMIT
  // ============================================================

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      setIsSubmitting(true);

      console.log("Customer data:", data);

      /*
      const formData = new FormData();

      formData.append("nameEn", data.nameEn);
      formData.append("nameAr", data.nameAr);
      formData.append("code", data.code);
      formData.append(
        "customerTypeId",
        data.customerTypeId
      );
      formData.append("structure", data.structure);
      formData.append("statusId", data.statusId);
      formData.append(
        "credit",
        String(data.credit)
      );
      formData.append(
        "taxNumber",
        data.taxNumber || ""
      );
      formData.append(
        "registrationNumber",
        data.registrationNumber || ""
      );
      formData.append(
        "licenseNumber",
        data.licenseNumber || ""
      );

      formData.append(
        "branches",
        JSON.stringify(data.branches)
      );

      data.documents.forEach((document, index) => {
        if (document.file) {
          formData.append(
            `documents`,
            document.file
          );
        }
      });

      await api.post(
        "/customers",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );
      */
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // BRANCH HANDLERS
  // ============================================================

  const addBranch = () => {
    appendBranch({
      managerId: "",

      isMainBranch: false,

      buildingNumber: "",
      street: "",
      glnCode: "",

      zoneId: "",

      latitude: "",
      longitude: "",

      phones: [
        {
          phoneNumber: "",
          phoneType: "MOBILE",
          isPrimary: true,
        },
      ],
    });
  };

  const removeBranchHandler = (index: number) => {
    if (branchFields.length === 1) return;

    removeBranch(index);
  };

  // ============================================================
  // DOCUMENT HANDLERS
  // ============================================================

  const addDocument = () => {
    appendDocument({
      type: "",
      documentNumber: "",
      issuedAt: "",
      expiresAt: "",
      file: undefined,
    });
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6 pb-10">
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Customer
          </h1>

          <p className="text-sm text-muted-foreground">
            Create a new customer and configure its branches,
            contacts, and documents.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />

            {isSubmitting
              ? "Saving..."
              : "Create Customer"}
          </Button>
        </div>
      </div>

      {/* ======================================================
          CUSTOMER INFORMATION
      ====================================================== */}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />

            <div>
              <CardTitle>
                Customer Information
              </CardTitle>

              <CardDescription>
                Basic information about the customer.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* ENGLISH NAME */}

            <div className="space-y-2">
              <Label>
                Customer Name (English)
                <span className="text-destructive"> *</span>
              </Label>

              <Input
                placeholder="Enter customer name"
                {...register("nameEn")}
              />

              {errors.nameEn && (
                <p className="text-sm text-destructive">
                  {errors.nameEn.message}
                </p>
              )}
            </div>

            {/* ARABIC NAME */}

            <div className="space-y-2">
              <Label>
                Customer Name (Arabic)
                <span className="text-destructive"> *</span>
              </Label>

              <Input
                dir="rtl"
                placeholder="أدخل اسم العميل"
                {...register("nameAr")}
              />

              {errors.nameAr && (
                <p className="text-sm text-destructive">
                  {errors.nameAr.message}
                </p>
              )}
            </div>

            {/* CODE */}

            <div className="space-y-2">
              <Label>
                Customer Code
                <span className="text-destructive"> *</span>
              </Label>

              <Input
                placeholder="CUS-0001"
                {...register("code")}
              />

              {errors.code && (
                <p className="text-sm text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* TYPE */}

            <div className="space-y-2">
              <Label>
                Customer Type
                <span className="text-destructive"> *</span>
              </Label>

              <Select
                value={watch("customerTypeId")}
                onValueChange={(value) =>
                  setValue(
                    "customerTypeId",
                    value,
                    {
                      shouldValidate: true,
                    }
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>

                <SelectContent>
                  {customerTypes.map((type) => (
                    <SelectItem
                      key={type.id}
                      value={type.id}
                    >
                      {type.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.customerTypeId && (
                <p className="text-sm text-destructive">
                  {errors.customerTypeId.message}
                </p>
              )}
            </div>

            {/* STRUCTURE */}

            <div className="space-y-2">
              <Label>
                Structure
                <span className="text-destructive"> *</span>
              </Label>

              <Select
                value={structure}
                onValueChange={(value) =>
                  setValue(
                    "structure",
                    value as "SINGLE" | "CHAIN"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="SINGLE">
                    Single Branch
                  </SelectItem>

                  <SelectItem value="CHAIN">
                    Chain / Multiple Branches
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* STATUS */}

            <div className="space-y-2">
              <Label>
                Status
                <span className="text-destructive"> *</span>
              </Label>

              <Select
                value={watch("statusId")}
                onValueChange={(value) =>
                  setValue(
                    "statusId",
                    value,
                    {
                      shouldValidate: true,
                    }
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem
                      key={status.id}
                      value={status.id}
                    >
                      {status.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CREDIT */}

            <div className="space-y-2">
              <Label>Credit</Label>

              <Input
                type="number"
                min="0"
                step="0.01"
                {...register("credit")}
              />
            </div>

            {/* CUSTOMER ZONE */}

            <div className="space-y-2">
              <Label>
                Zone
                <span className="text-destructive"> *</span>
              </Label>

              <Select
                value={watch("zoneId")}
                onValueChange={(value) =>
                  setValue("zoneId", value, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>

                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem
                      key={zone.id}
                      value={zone.id}
                    >
                      {zone.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          REGISTRATION INFORMATION
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Registration Information
          </CardTitle>

          <CardDescription>
            Legal and registration information for the customer.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* TAX */}

            <div className="space-y-2">
              <Label>Tax Number</Label>

              <Input
                placeholder="Tax number"
                {...register("taxNumber")}
              />
            </div>

            {/* REGISTRATION */}

            <div className="space-y-2">
              <Label>Registration Number</Label>

              <Input
                placeholder="Commercial registration"
                {...register(
                  "registrationNumber"
                )}
              />
            </div>

            {/* LICENSE */}

            <div className="space-y-2">
              <Label>License Number</Label>

              <Input
                placeholder="License number"
                {...register("licenseNumber")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          BRANCHES
      ====================================================== */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />

              <div>
                <CardTitle>
                  Branches
                </CardTitle>

                <CardDescription>
                  Add the branches belonging to this customer.
                </CardDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addBranch}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Branch
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {branchFields.map((branch, branchIndex) => (
            <div
              key={branch.id}
              className="rounded-lg border p-5"
            >
              {/* BRANCH HEADER */}

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    Branch {branchIndex + 1}
                  </h3>

                  {branchIndex === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Main branch
                    </p>
                  )}
                </div>

                {branchFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() =>
                      removeBranchHandler(
                        branchIndex
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* BRANCH DETAILS */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* MANAGER */}

                <div className="space-y-2">
                  <Label>Branch Manager</Label>

                  <Select
                    value={
                      watch(
                        `branches.${branchIndex}.managerId`
                      ) || ""
                    }
                    onValueChange={(value) =>
                      setValue(
                        `branches.${branchIndex}.managerId`,
                        value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>

                    <SelectContent>
                      {managers.map((manager) => (
                        <SelectItem
                          key={manager.id}
                          value={manager.id}
                        >
                          {manager.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* GLN */}

                <div className="space-y-2">
                  <Label>GLN Code</Label>

                  <Input
                    placeholder="GLN code"
                    {...register(
                      `branches.${branchIndex}.glnCode`
                    )}
                  />
                </div>

                {/* BUILDING */}

                <div className="space-y-2">
                  <Label>
                    Building Number
                    <span className="text-destructive">
                      {" "}
                      *
                    </span>
                  </Label>

                  <Input
                    placeholder="Building number"
                    {...register(
                      `branches.${branchIndex}.buildingNumber`
                    )}
                  />
                </div>

                {/* STREET */}

                <div className="space-y-2">
                  <Label>
                    Street
                    <span className="text-destructive">
                      {" "}
                      *
                    </span>
                  </Label>

                  <Input
                    placeholder="Street"
                    {...register(
                      `branches.${branchIndex}.street`
                    )}
                  />
                </div>

                {/* ZONE */}

                <div className="space-y-2">
                  <Label>
                    Zone
                    <span className="text-destructive">
                      {" "}
                      *
                    </span>
                  </Label>

                  <Select
                    value={
                      watch(
                        `branches.${branchIndex}.zoneId`
                      ) || ""
                    }
                    onValueChange={(value) =>
                      setValue(
                        `branches.${branchIndex}.zoneId`,
                        value,
                        {
                          shouldValidate: true,
                        }
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>

                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem
                          key={zone.id}
                          value={zone.id}
                        >
                          {zone.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* LATITUDE */}

                <div className="space-y-2">
                  <Label>Latitude</Label>

                  <Input
                    type="number"
                    step="any"
                    placeholder="30.0444"
                    {...register(
                      `branches.${branchIndex}.latitude`
                    )}
                  />
                </div>

                {/* LONGITUDE */}

                <div className="space-y-2">
                  <Label>Longitude</Label>

                  <Input
                    type="number"
                    step="any"
                    placeholder="31.2357"
                    {...register(
                      `branches.${branchIndex}.longitude`
                    )}
                  />
                </div>
              </div>

              {/* MAIN BRANCH */}

              <div className="mt-5 flex items-center gap-2">
                <Checkbox
                  checked={
                    watch(
                      `branches.${branchIndex}.isMainBranch`
                    )
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      branchFields.forEach(
                        (_, index) => {
                          setValue(
                            `branches.${index}.isMainBranch`,
                            index === branchIndex
                          );
                        }
                      );
                    }
                  }}
                />

                <Label>
                  Main Branch
                </Label>
              </div>

              {/* PHONES */}

              <div className="mt-6 rounded-lg bg-muted/40 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />

                    <h4 className="font-medium">
                      Phone Numbers
                    </h4>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const phones =
                        getValues(
                          `branches.${branchIndex}.phones`
                        ) || [];

                      setValue(
                        `branches.${branchIndex}.phones`,
                        [
                          ...phones,
                          {
                            phoneNumber: "",
                            phoneType: "MOBILE",
                            isPrimary: false,
                          },
                        ]
                      );
                    }}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Phone
                  </Button>
                </div>

                <div className="space-y-3">
                  {(
                    watch(
                      `branches.${branchIndex}.phones`
                    ) || []
                  ).map((phone, phoneIndex) => (
                    <div
                      key={phoneIndex}
                      className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_180px_auto_auto]"
                    >
                      {/* PHONE */}

                      <div className="space-y-2">
                        <Label>
                          Phone Number
                        </Label>

                        <Input
                          placeholder="01xxxxxxxxx"
                          {...register(
                            `branches.${branchIndex}.phones.${phoneIndex}.phoneNumber`
                          )}
                        />
                      </div>

                      {/* TYPE */}

                      <div className="space-y-2">
                        <Label>
                          Type
                        </Label>

                        <Select
                          value={phone.phoneType}
                          onValueChange={(value) =>
                            setValue(
                              `branches.${branchIndex}.phones.${phoneIndex}.phoneType`,
                              value as
                                | "LANDLINE"
                                | "MOBILE"
                                | "WHATSAPP"
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="MOBILE">
                              Mobile
                            </SelectItem>

                            <SelectItem value="LANDLINE">
                              Landline
                            </SelectItem>

                            <SelectItem value="WHATSAPP">
                              WhatsApp
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* PRIMARY */}

                      <div className="flex items-center gap-2 pb-2">
                        <Checkbox
                          checked={
                            phone.isPrimary
                          }
                          onCheckedChange={(
                            checked
                          ) => {
                            if (checked) {
                              const phones =
                                getValues(
                                  `branches.${branchIndex}.phones`
                                ) || [];

                              setValue(
                                `branches.${branchIndex}.phones`,
                                phones.map(
                                  (
                                    p,
                                    index
                                  ) => ({
                                    ...p,
                                    isPrimary:
                                      index ===
                                      phoneIndex,
                                  })
                                )
                              );
                            }
                          }}
                        />

                        <Label>
                          Primary
                        </Label>
                      </div>

                      {/* DELETE */}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mb-1 text-destructive"
                        onClick={() => {
                          const phones =
                            getValues(
                              `branches.${branchIndex}.phones`
                            ) || [];

                          if (
                            phones.length ===
                            1
                          )
                            return;

                          setValue(
                            `branches.${branchIndex}.phones`,
                            phones.filter(
                              (_, index) =>
                                index !==
                                phoneIndex
                            )
                          );
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ======================================================
          DOCUMENTS
      ====================================================== */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />

              <div>
                <CardTitle>
                  Documents
                </CardTitle>

                <CardDescription>
                  Upload customer registration and legal documents.
                </CardDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addDocument}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {documentFields.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

              <p className="text-sm font-medium">
                No documents added
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add tax cards, licenses, registration documents,
                or other customer documents.
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={addDocument}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {documentFields.map(
                (document, documentIndex) => (
                  <div
                    key={document.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {/* TYPE */}

                      <div className="space-y-2">
                        <Label>
                          Document Type
                        </Label>

                        <Select
                          value={
                            watch(
                              `documents.${documentIndex}.type`
                            ) || ""
                          }
                          onValueChange={(
                            value
                          ) =>
                            setValue(
                              `documents.${documentIndex}.type`,
                              value,
                              {
                                shouldValidate:
                                  true,
                              }
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>

                          <SelectContent>
                            {documentTypes.map(
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
                      </div>

                      {/* NUMBER */}

                      <div className="space-y-2">
                        <Label>
                          Document Number
                        </Label>

                        <Input
                          placeholder="Document number"
                          {...register(
                            `documents.${documentIndex}.documentNumber`
                          )}
                        />
                      </div>

                      {/* ISSUE DATE */}

                      <div className="space-y-2">
                        <Label>
                          Issue Date
                        </Label>

                        <Input
                          type="date"
                          {...register(
                            `documents.${documentIndex}.issuedAt`
                          )}
                        />
                      </div>

                      {/* EXPIRY */}

                      <div className="space-y-2">
                        <Label>
                          Expiry Date
                        </Label>

                        <Input
                          type="date"
                          {...register(
                            `documents.${documentIndex}.expiresAt`
                          )}
                        />
                      </div>
                    </div>

                    {/* FILE */}

                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(event) => {
                            const file =
                              event.target
                                .files?.[0];

                            setValue(
                              `documents.${documentIndex}.file`,
                              file
                            );
                          }}
                        />
                      </div>

                      <Upload className="h-5 w-5 text-muted-foreground" />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() =>
                          removeDocument(
                            documentIndex
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ======================================================
          BOTTOM ACTIONS
      ====================================================== */}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>

        <Button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          <Save className="mr-2 h-4 w-4" />

          {isSubmitting
            ? "Creating..."
            : "Create Customer"}
        </Button>
      </div>
    </div>
  );
}
import { useRef, useState } from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'src/components/ui/popover';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';

import {
  ArrowLeft,
  ArrowRight,
  ChevronsUpDown,
  Building2,
  CalendarDays,
  Check,
  CreditCard,
  FileText,
  MapPin,
  Plus,
  Receipt,
  Search,
  Trash2,
  Upload,
  UserRound,
  Users,
  Wrench,
} from 'lucide-react';

import { useFieldArray, useForm } from 'react-hook-form';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card';

import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';
import { Checkbox } from 'src/components/ui/checkbox';
import { Badge } from 'src/components/ui/badge';
import { Separator } from 'src/components/ui/separator';

export default function AddCustomerContract() {
  const isRtl = true;

  const [activeStep, setActiveStep] = useState(1);
  const [participantOpen, setParticipantOpen] = useState(false);

  /* =========================================================
     USERS
  ========================================================= */

  const users = [
    {
      id: 1,
      name: 'Ahmed Mohamed',
      nameAr: 'أحمد محمد',
      role: 'TECHNICAL_SUPPORT_MANAGER',
    },
    {
      id: 2,
      name: 'Mohamed Hassan',
      nameAr: 'محمد حسن',
      role: 'TECHNICAL_SUPPORT_SUPERVISOR',
    },
    {
      id: 3,
      name: 'Omar Khaled',
      nameAr: 'عمر خالد',
      role: 'TECHNICAL_SUPPORT_SUPERVISOR',
    },
    {
      id: 4,
      name: 'Ali Mahmoud',
      nameAr: 'علي محمود',
      role: 'TECHNICAL_SUPPORT_ENGINEER',
    },
    {
      id: 5,
      name: 'Hassan Ahmed',
      nameAr: 'حسن أحمد',
      role: 'TECHNICAL_SUPPORT_ENGINEER',
    },
    {
      id: 6,
      name: 'Youssef Mohamed',
      nameAr: 'يوسف محمد',
      role: 'SALES_REPRESENTATIVE',
    },
    {
      id: 7,
      name: 'Mostafa Ibrahim',
      nameAr: 'مصطفى إبراهيم',
      role: 'SALES_REPRESENTATIVE',
    },
    {
      id: 8,
      name: 'Mahmoud Adel',
      nameAr: 'محمود عادل',
      role: 'SALES_REPRESENTATIVE',
    },
  ];

  const salesRepresentatives = users.filter(
    (user) => user.role === 'SALES_REPRESENTATIVE'
  );

  /* =========================================================
     FORM
  ========================================================= */

  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur',

    defaultValues: {
      customerMode: 'new',

      customerId: '',
      customerNameEn: '',
      customerNameAr: '',
      customerCode: '',
      customerType: '',
      structure: '',
      zoneId: '',
      licenseNumber: '',
      taxNumber: '',
      registrationNumber: '',

      contractDate: new Date().toISOString().split('T')[0],
      branchId: '',
      contractNumber: '',
      programName: '',
      plan: '',

      hasParticipant: false,
      participantId: '',

      responsibleRep: '',

      nextDueDate: '',
      installationDate: '',
      notes: '',

      paymentAmount: 0,
      paymentMethod: '',

      discountAmount: 0,

      selectedMonths: [],

      documents: [],

      contacts: [
        {
          type: 'OWNER',
          nameEn: '',
          nameAr: '',
          nationalId: '',
          email: '',
          phones: [
            {
              number: '',
              type: 'محمول',
            },
          ],
        },
      ],

      branches: [
        {
          governorate: '',
          city: '',
          street: '',
          buildingNumber: '',
          glnCode: '',
        },
      ],
    },
  });

  /* =========================================================
     FIELD ARRAYS
  ========================================================= */

  const {
    fields: documentFields,
    append: appendDocument,
    remove: removeDocument,
    update: updateDocument,
  } = useFieldArray({
    control,
    name: 'documents',
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: 'contacts',
  });

  const {
    fields: branchFields,
    append: appendBranch,
    remove: removeBranch,
  } = useFieldArray({
    control,
    name: 'branches',
  });

  /* =========================================================
     WATCH
  ========================================================= */

  const customerMode = watch('customerMode');
  const customerId = watch('customerId');

  const customerNameAr = watch('customerNameAr');
  const customerCode = watch('customerCode');
  const customerType = watch('customerType');
  const structure = watch('structure');

  const plan = watch('plan');

  const participantId = watch('participantId');
  const hasParticipant = watch('hasParticipant');

  const branchId = watch('branchId');
  const responsibleRep = watch('responsibleRep');

  const paymentMethod = watch('paymentMethod');

  const selectedMonths = watch('selectedMonths') || [];

  const paymentAmount = Number(
    watch('paymentAmount') || 0
  );

  const discountAmountInput = Number(
    watch('discountAmount') || 0
  );

  const branches = watch('branches') || [];

  const selectedParticipant = users.find(
    (user) => String(user.id) === String(participantId)
  );

  const selectedResponsibleRep = salesRepresentatives.find(
    (user) => String(user.id) === String(responsibleRep)
  );

  /* =========================================================
     STATIC DATA
  ========================================================= */

  const inactiveCustomers = [
    {
      id: 'CUST-0012',
      nameAr: 'صيدلية الحياة',
      nameEn: 'Al Hayat Pharmacy',
      code: 'PH-0012',
      type: 'PHARMACEUTICAL',
      structure: 'CHAIN',
      licenseNumber: 'LIC-45879',
      taxNumber: '302-112-456',
      registrationNumber: 'REG-78210',
    },
    {
      id: 'CUST-0024',
      nameAr: 'صيدليات الشفاء',
      nameEn: 'El Shefaa Pharmacies',
      code: 'PH-0024',
      type: 'PHARMACEUTICAL',
      structure: 'CHAIN',
      licenseNumber: 'LIC-88431',
      taxNumber: '308-551-912',
      registrationNumber: 'REG-11982',
    },
    {
      id: 'CUST-0031',
      nameAr: 'مركز النخبة التجاري',
      nameEn: 'Elite Commercial Center',
      code: 'CM-0031',
      type: 'COMMERCIAL',
      structure: 'SINGLE',
      licenseNumber: 'LIC-91123',
      taxNumber: '312-721-881',
      registrationNumber: 'REG-66220',
    },
  ];

  const monthOptions = [
    'سبتمبر 2026',
    'أكتوبر 2026',
    'نوفمبر 2026',
    'ديسمبر 2026',
    'يناير 2027',
    'فبراير 2027',
    'مارس 2027',
    'أبريل 2027',
    'مايو 2027',
    'يونيو 2027',
    'يوليو 2027',
    'أغسطس 2027',
  ];

  const planPrices = {
    SILVER: 600,
    GOLD: 700,
  };

  const planName = {
    SILVER: 'الخطة الفضية',
    GOLD: 'الخطة الذهبية',
  };

  const paymentMethodName = {
    CASH: 'نقدي',
    BANK_TRANSFER: 'تحويل بنكي',
    CREDIT_CARD: 'بطاقة ائتمان',
    CHEQUE: 'شيك',
    ONLINE_PAYMENT: 'دفع إلكتروني',
  };

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const joiningFee = 10000;

  const monthlySubscription =
    selectedMonths.length *
    (planPrices[plan as keyof typeof planPrices] || 0);

  // Total before discount.
  const grossContractValue =
    joiningFee + monthlySubscription;

  // Discount applies to the ENTIRE contract:
  // joining fee + subscription.
  const discountAmount = Math.min(
    Math.max(discountAmountInput, 0),
    grossContractValue
  );

  const totalContractValue =
    grossContractValue - discountAmount;

  const remainingAmount = Math.max(
    totalContractValue - paymentAmount,
    0
  );

  const paidPercentage =
    totalContractValue > 0
      ? Math.min(
          (paymentAmount / totalContractValue) * 100,
          100
        )
      : 0;

  const selectedBranch =
    branchId !== ''
      ? branches[Number(branchId)]
      : null;

  const customerStatus =
    customerMode === 'reactivate'
      ? 'إعادة تفعيل'
      : 'عميل جديد';

  /* =========================================================
     FILE UPLOAD
  ========================================================= */

  const addDocumentInputRef = useRef<any>(null);
  const replaceDocumentInputRef = useRef<any>(null);

  const [replaceDocumentIndex, setReplaceDocumentIndex] =
    useState<any>(null);

  const openDocumentPicker = () => {
    addDocumentInputRef.current?.click();
  };

  const openReplacePicker = (index: number) => {
    setReplaceDocumentIndex(index);
    replaceDocumentInputRef.current?.click();
  };

  const handleDocumentUpload = (event: any) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    files.forEach((file: any) => {
      appendDocument({
        file,
        name: file.name,
        type: file.type || 'ملف',
        size: file.size,
      });
    });

    event.target.value = '';
  };

  const handleDocumentReplace = (event: any) => {
    const file = event.target.files?.[0];

    if (!file || replaceDocumentIndex === null) {
      return;
    }

    updateDocument(replaceDocumentIndex, {
      file,
      name: file.name,
      type: file.type || 'ملف',
      size: file.size,
    });

    setReplaceDocumentIndex(null);
    event.target.value = '';
  };

  /* =========================================================
     REACTIVATE CUSTOMER
  ========================================================= */

  const handleInactiveCustomer = (
    selectedId: string
  ) => {
    const customer = inactiveCustomers.find(
      (item) => item.id === selectedId
    );

    if (!customer) {
      setValue('customerId', '');
      return;
    }

    setValue('customerId', customer.id, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('customerNameEn', customer.nameEn, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('customerNameAr', customer.nameAr, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('customerCode', customer.code, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('customerType', customer.type, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('structure', customer.structure, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue(
      'licenseNumber',
      customer.licenseNumber,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );

    setValue('taxNumber', customer.taxNumber, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue(
      'registrationNumber',
      customer.registrationNumber,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  /* =========================================================
     MONTHS
  ========================================================= */

  const toggleMonth = (month: string) => {
    const current =
      getValues('selectedMonths') || [];

    const updated = current.includes(month)
      ? current.filter(
          (item: string) => item !== month
        )
      : [...current, month];

    setValue('selectedMonths', updated, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  /* =========================================================
     STEP VALIDATION
  ========================================================= */

  const handleNext = async () => {
    const valid = await trigger([
      'customerId',

      'customerNameAr',
      'customerNameEn',
      'customerCode',
      'customerType',
      'structure',
      'zoneId',
      'licenseNumber',
      'taxNumber',
      'registrationNumber',

      'contacts.0.type',
      'contacts.0.nameAr',
      'contacts.0.nameEn',
      'contacts.0.nationalId',
      'contacts.0.email',
      'contacts.0.phones.0.number',

      'branches.0.governorate',
      'branches.0.city',
      'branches.0.street',
      'branches.0.buildingNumber',
      'branches.0.glnCode',
    ]);

    if (!valid) {
      return;
    }

    const data = getValues();

    console.log('STEP 1 DATA:', data);

    setActiveStep(2);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleBack = () => {
    setActiveStep(1);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* =========================================================
     FINAL SUBMIT
  ========================================================= */

  const onSubmit = (data: any) => {
    const payload = {
      ...data,

      joiningFee,

      monthlySubscription,

      grossContractValue,

      discountAmount,

      totalContractValue,

      remainingAmount,

      paidPercentage,
    };

    console.log('FINAL FORM:', payload);

    console.log('FILES:', data.documents);

    /*
      Example API:

      const formData = new FormData();

      formData.append(
        'data',
        JSON.stringify({
          ...payload,
          documents: undefined,
        })
      );

      data.documents.forEach((document: any) => {
        if (document.file) {
          formData.append(
            'documents',
            document.file
          );
        }
      });

      await axios.post(
        '/api/v1/contracts',
        formData
      );
    */
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-background text-foreground"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mx-auto max-w-[1500px] space-y-6 p-4 md:p-6 lg:p-8">

          {/* =================================================
              HIDDEN FIELDS
          ================================================= */}

          <input
            type="hidden"
            {...register('customerMode')}
          />

          <input
            type="hidden"
            {...register('customerId', {
              validate: (value) =>
                customerMode === 'new' ||
                value ||
                'يجب اختيار العميل غير النشط',
            })}
          />

          <input
            type="hidden"
            {...register('selectedMonths', {
              validate: (value) =>
                value?.length > 0 ||
                'يجب اختيار شهر واحد على الأقل',
            })}
          />

          <input
            type="hidden"
            {...register('participantId', {
              validate: (value) =>
                !hasParticipant ||
                value ||
                'يجب اختيار المشارك',
            })}
          />

          {/* =================================================
              HEADER
          ================================================= */}

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              إنشاء عميل وعقد جديد
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              قم بإدخال بيانات العميل ثم تفاصيل العقد والخطة والتحصيل.
            </p>
          </div>

          {/* =================================================
              STEPPER
          ================================================= */}

          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    id: 1,
                    title: 'بيانات العميل',
                    description:
                      'العميل، المستندات، جهات الاتصال، الفروع',
                    icon: Users,
                  },
                  {
                    id: 2,
                    title: 'العقد والخطة',
                    description:
                      'الخطة، الدفع، التحصيل، المراجعة',
                    icon: FileText,
                  },
                ].map((step: any) => {
                  const Icon = step.icon;

                  const isActive =
                    activeStep === step.id;

                  const isDone =
                    activeStep > step.id;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => {
                        if (
                          step.id === 1 ||
                          activeStep > step.id
                        ) {
                          setActiveStep(step.id);
                        }
                      }}
                      className={`
                        relative flex items-center gap-4
                        rounded-2xl border p-4 text-right
                        transition-all

                        ${
                          isActive
                            ? 'border-foreground bg-foreground text-background shadow-md'
                            : isDone
                              ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40'
                              : 'border-border bg-card hover:bg-accent'
                        }
                      `}
                    >
                      <div
                        className={`
                          flex h-11 w-11 shrink-0
                          items-center justify-center
                          rounded-xl

                          ${
                            isActive
                              ? 'bg-background/10'
                              : isDone
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                                : 'bg-muted text-muted-foreground'
                          }
                        `}
                      >
                        {isDone ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <div
                          className={`
                            text-sm font-semibold
                            ${
                              isActive
                                ? 'text-background'
                                : 'text-foreground'
                            }
                          `}
                        >
                          {step.id}. {step.title}
                        </div>

                        <div
                          className={`
                            mt-1 text-xs
                            ${
                              isActive
                                ? 'text-background/70'
                                : 'text-muted-foreground'
                            }
                          `}
                        >
                          {step.description}
                        </div>
                      </div>

                      {isActive && (
                        <div className="absolute bottom-0 left-6 right-6 h-1 rounded-t-full bg-background" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* =================================================
              STEP 1
          ================================================= */}

          {activeStep === 1 && (
            <div className="space-y-6">

              {/* Customer Mode */}

              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserRound className="h-5 w-5 text-muted-foreground" />
                    نوع العملية
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* New */}

                    <button
                      type="button"
                      onClick={() => {
                        setValue(
                          'customerMode',
                          'new',
                          {
                            shouldDirty: true,
                          }
                        );

                        setValue(
                          'customerId',
                          ''
                        );
                      }}
                      className={`
                        rounded-2xl border p-5
                        text-right transition-all

                        ${
                          customerMode === 'new'
                            ? 'border-foreground bg-foreground text-background shadow-md'
                            : 'border-border bg-card hover:bg-accent'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-bold">
                            عميل جديد
                          </div>

                          <p
                            className={`
                              mt-2 text-xs leading-5

                              ${
                                customerMode === 'new'
                                  ? 'text-background/70'
                                  : 'text-muted-foreground'
                              }
                            `}
                          >
                            إنشاء سجل عميل جديد وإدخال جميع البيانات.
                          </p>
                        </div>

                        <div
                          className={`
                            rounded-xl p-3
                            ${
                              customerMode === 'new'
                                ? 'bg-background/10'
                                : 'bg-muted'
                            }
                          `}
                        >
                          <Plus className="h-5 w-5" />
                        </div>
                      </div>
                    </button>

                    {/* Reactivate */}

                    <button
                      type="button"
                      onClick={() =>
                        setValue(
                          'customerMode',
                          'reactivate',
                          {
                            shouldDirty: true,
                          }
                        )
                      }
                      className={`
                        rounded-2xl border p-5
                        text-right transition-all

                        ${
                          customerMode === 'reactivate'
                            ? 'border-amber-500 bg-amber-50 shadow-md dark:border-amber-700 dark:bg-amber-950/40'
                            : 'border-border bg-card hover:bg-accent'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-bold">
                            إعادة تفعيل عميل غير نشط
                          </div>

                          <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            اختيار عميل سابق وإعادة تفعيل العقد مع إمكانية تعديل بياناته.
                          </p>
                        </div>

                        <div className="rounded-xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                          <Receipt className="h-5 w-5" />
                        </div>
                      </div>
                    </button>
                  </div>

                  {customerMode === 'reactivate' && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                      <Label>
                        اختر العميل غير النشط
                      </Label>

                      <div className="relative mt-2">
                        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <select
                          value={customerId}
                          onChange={(e) =>
                            handleInactiveCustomer(
                              e.target.value
                            )
                          }
                          className="
                            h-11 w-full appearance-none
                            rounded-xl border border-border
                            bg-background pr-10 pl-4
                            text-sm text-foreground
                            outline-none focus:ring-2
                            focus:ring-ring
                          "
                        >
                          <option value="">
                            اختر العميل...
                          </option>

                          {inactiveCustomers.map(
                            (customer) => (
                              <option
                                key={customer.id}
                                value={customer.id}
                              >
                                {customer.nameAr} —{' '}
                                {customer.code}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      {errors.customerId && (
                        <ErrorText>
                          {errors.customerId.message}
                        </ErrorText>
                      )}

                      {customerId && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                          <Check className="h-4 w-4" />
                          تم تحميل بيانات العميل ويمكنك تعديلها قبل المتابعة.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer Basic Info */}

              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    البيانات الأساسية للعميل
                  </CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                  <FormField
                    label="اسم العميل بالعربية"
                    registration={register(
                      'customerNameAr',
                      {
                        required:
                          'اسم العميل بالعربية مطلوب',
                        minLength: {
                          value: 2,
                          message:
                            'اسم العميل قصير جدًا',
                        },
                      }
                    )}
                    placeholder="مثال: صيدلية النور"
                    error={
                      errors.customerNameAr?.message
                    }
                  />

                  <FormField
                    label="اسم العميل بالإنجليزية"
                    registration={register(
                      'customerNameEn',
                      {
                        required:
                          'اسم العميل بالإنجليزية مطلوب',
                      }
                    )}
                    placeholder="Example: Al Nour Pharmacy"
                    error={
                      errors.customerNameEn?.message
                    }
                  />

                  <FormField
                    label="كود العميل"
                    registration={register(
                      'customerCode',
                      {
                        required:
                          'كود العميل مطلوب',
                      }
                    )}
                    placeholder="PH-0098"
                    error={
                      errors.customerCode?.message
                    }
                  />

                  <SelectField
                    label="نوع العميل"
                    registration={register(
                      'customerType',
                      {
                        required:
                          'نوع العميل مطلوب',
                      }
                    )}
                    options={[
                      [
                        'PHARMACEUTICAL',
                        'صيدلي',
                      ],
                      [
                        'COMMERCIAL',
                        'تجاري',
                      ],
                    ]}
                    error={
                      errors.customerType?.message
                    }
                  />

                  <SelectField
                    label="هيكل العميل"
                    registration={register(
                      'structure',
                      {
                        required:
                          'هيكل العميل مطلوب',
                      }
                    )}
                    options={[
                      [
                        'SINGLE',
                        'فرع واحد',
                      ],
                      [
                        'CHAIN',
                        'سلسلة',
                      ],
                    ]}
                    error={
                      errors.structure?.message
                    }
                  />

                  <SelectField
                    label="فرع المتحدة"
                    registration={register(
                      'zoneId',
                      {
                        required:
                          'فرع المتحدة مطلوب',
                      }
                    )}
                    options={[
                      [
                        'Zone A',
                        'منطقة أ',
                      ],
                      [
                        'Zone B',
                        'منطقة ب',
                      ],
                    ]}
                    error={
                      errors.zoneId?.message
                    }
                  />

                  <FormField
                    label="رقم الترخيص"
                    registration={register(
                      'licenseNumber',
                      {
                        required:
                          'رقم الترخيص مطلوب',
                      }
                    )}
                    placeholder="LIC-45879"
                    error={
                      errors.licenseNumber?.message
                    }
                  />

                  <FormField
                    label="الرقم الضريبي / البطاقة الشخصية"
                    registration={register(
                      'taxNumber',
                      {
                        required:
                          'الرقم الضريبي مطلوب',
                      }
                    )}
                    placeholder="302-112-456"
                    error={
                      errors.taxNumber?.message
                    }
                  />

                  <FormField
                    label="السجل التجاري"
                    registration={register(
                      'registrationNumber',
                      {
                        required:
                          'رقم التسجيل مطلوب',
                      }
                    )}
                    placeholder="REG-78210"
                    error={
                      errors.registrationNumber?.message
                    }
                  />
                </CardContent>
              </Card>

              {/* Documents */}

              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        مستندات العميل
                      </CardTitle>

                      <p className="mt-1 text-xs text-muted-foreground">
                        أضف مستندات العميل مثل السجل التجاري والرخصة وملفات PDF وWord والصور.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={
                        openDocumentPicker
                      }
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة مستند
                    </Button>

                    <input
                      ref={
                        addDocumentInputRef
                      }
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={
                        handleDocumentUpload
                      }
                    />

                    <input
                      ref={
                        replaceDocumentInputRef
                      }
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={
                        handleDocumentReplace
                      }
                    />
                  </div>
                </CardHeader>

                <CardContent>
                  {documentFields.length > 0 ? (
                    <div className="space-y-3">
                      {documentFields.map(
                        (
                          document: any,
                          index: number
                        ) => (
                          <div
                            key={document.id}
                            className="
                              flex items-center justify-between
                              gap-4 rounded-2xl border
                              border-border bg-muted/40 p-4
                            "
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              </div>

                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold">
                                  {document.name}
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span>
                                    {document.type ||
                                      'ملف'}
                                  </span>

                                  {document.size > 0 && (
                                    <>
                                      <span>•</span>

                                      <span>
                                        {formatFileSize(
                                          document.size
                                        )}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() =>
                                  openReplacePicker(
                                    index
                                  )
                                }
                              >
                                <Upload className="ml-2 h-4 w-4" />
                                استبدال
                              </Button>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-xl text-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  removeDocument(
                                    index
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
                  ) : (
                    <div
                      className="
                        flex flex-col items-center justify-center
                        rounded-2xl border border-dashed
                        border-border bg-muted/20
                        py-12 text-center
                      "
                    >
                      <div className="mb-3 rounded-xl bg-background p-3 shadow-sm">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>

                      <p className="text-sm font-semibold">
                        لا توجد مستندات
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        يمكنك رفع PDF أو Word أو Excel أو الصور
                      </p>

                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4 rounded-xl"
                        onClick={
                          openDocumentPicker
                        }
                      >
                        <Upload className="ml-2 h-4 w-4" />
                        رفع مستند
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                    الملفات المسموح بها: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG
                  </div>
                </CardContent>
              </Card>

              {/* Contacts */}

              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      جهات الاتصال
                    </CardTitle>

                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() =>
                        appendContact({
                          type: 'EMPLOYEE',
                          nameEn: '',
                          nameAr: '',
                          nationalId: '',
                          email: '',
                          phones: [
                            {
                              number: '',
                              type: 'محمول',
                            },
                          ],
                        })
                      }
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة جهة اتصال
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {contactFields.map(
                    (
                      contact: any,
                      contactIndex: number
                    ) => {
                      const contactError = (
                        errors as any
                      ).contacts?.[
                        contactIndex
                      ];

                      return (
                        <div
                          key={contact.id}
                          className="
                            rounded-2xl border
                            border-border bg-muted/30 p-5
                          "
                        >
                          <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-sm">
                                <span className="text-sm font-bold">
                                  {contactIndex + 1}
                                </span>
                              </div>

                              <div>
                                <div className="text-sm font-semibold">
                                  جهة الاتصال{' '}
                                  {contactIndex + 1}
                                </div>

                                <div className="mt-1 text-xs text-muted-foreground">
                                  بيانات المسؤول أو الموظف
                                </div>
                              </div>
                            </div>

                            {contactFields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="rounded-xl text-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  removeContact(
                                    contactIndex
                                  )
                                }
                              >
                                <Trash2 className="ml-2 h-4 w-4" />
                                حذف
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                            <SelectField
                              label="نوع جهة الاتصال"
                              registration={register(
                                `contacts.${contactIndex}.type`,
                                {
                                  required:
                                    'نوع جهة الاتصال مطلوب',
                                }
                              )}
                              options={[
                                [
                                  'OWNER',
                                  'مالك',
                                ],
                                [
                                  'MANAGER',
                                  'مدير',
                                ],
                                [
                                  'EMPLOYEE',
                                  'موظف',
                                ],
                              ]}
                              error={
                                contactError?.type
                                  ?.message
                              }
                            />

                            <FormField
                              label="الاسم بالعربية"
                              registration={register(
                                `contacts.${contactIndex}.nameAr`,
                                {
                                  required:
                                    'اسم جهة الاتصال مطلوب',
                                }
                              )}
                              placeholder="الاسم بالعربية"
                              error={
                                contactError?.nameAr
                                  ?.message
                              }
                            />

                            <FormField
                              label="الاسم بالإنجليزية"
                              registration={register(
                                `contacts.${contactIndex}.nameEn`,
                                {
                                  required:
                                    'الاسم بالإنجليزية مطلوب',
                                }
                              )}
                              placeholder="English name"
                              error={
                                contactError?.nameEn
                                  ?.message
                              }
                            />

                            <FormField
                              label="الرقم القومي"
                              registration={register(
                                `contacts.${contactIndex}.nationalId`,
                                {
                                  required:
                                    'الرقم القومي مطلوب',
                                  pattern: {
                                    value: /^\d{14}$/,
                                    message:
                                      'الرقم القومي يجب أن يكون 14 رقمًا',
                                  },
                                }
                              )}
                              placeholder="14 رقم"
                              error={
                                contactError
                                  ?.nationalId
                                  ?.message
                              }
                            />

                            <FormField
                              label="البريد الإلكتروني"
                              registration={register(
                                `contacts.${contactIndex}.email`,
                                {
                                  required:
                                    'البريد الإلكتروني مطلوب',
                                  pattern: {
                                    value:
                                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message:
                                      'البريد الإلكتروني غير صحيح',
                                  },
                                }
                              )}
                              placeholder="name@example.com"
                              error={
                                contactError?.email
                                  ?.message
                              }
                            />
                          </div>

                          <ContactPhones
                            control={control}
                            register={register}
                            contactIndex={
                              contactIndex
                            }
                            errors={errors}
                          />
                        </div>
                      );
                    }
                  )}
                </CardContent>
              </Card>

              {/* Branches */}

              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        فروع العميل
                      </CardTitle>

                      <p className="mt-1 text-xs text-muted-foreground">
                        أضف الفروع التابعة للعميل وأدخل بيانات كل فرع
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() =>
                        appendBranch({
                          governorate: '',
                          city: '',
                          street: '',
                          buildingNumber: '',
                          glnCode: '',
                        })
                      }
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة فرع
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="overflow-hidden rounded-xl border border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1000px] text-sm">
                        <thead>
                          <tr className="border-b bg-muted/40">
                            <th className="px-4 py-3 text-right font-semibold">
                              #
                            </th>

                            <th className="px-4 py-3 text-right font-semibold">
                              المحافظة
                            </th>

                            <th className="px-4 py-3 text-right font-semibold">
                              المدينة
                            </th>

                            <th className="px-4 py-3 text-right font-semibold">
                              الشارع
                            </th>

                            <th className="px-4 py-3 text-right font-semibold">
                              رمز الموقع العالمي (GLN)
                            </th>

                            <th className="px-4 py-3 text-right font-semibold">
                              رقم المبنى
                            </th>

                            <th className="px-4 py-3 text-center font-semibold">
                              الإجراءات
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {branchFields.map(
                            (
                              branch: any,
                              index: number
                            ) => {
                              const branchError = (
                                errors as any
                              ).branches?.[
                                index
                              ];

                              return (
                                <tr
                                  key={branch.id}
                                  className="border-b last:border-b-0 hover:bg-muted/20"
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                                      {index + 1}
                                    </div>
                                  </td>

                                  <td className="px-4 py-3">
                                    <select
                                      {...register(
                                        `branches.${index}.governorate`,
                                        {
                                          required:
                                            'المحافظة مطلوبة',
                                        }
                                      )}
                                      className="
                                        h-11 w-full
                                        rounded-xl border
                                        border-border
                                        bg-background
                                        px-3 text-sm
                                        text-foreground
                                        outline-none
                                        focus:ring-2
                                        focus:ring-ring
                                      "
                                    >
                                      <option value="">
                                        اختر المحافظة
                                      </option>

                                      <option value="القاهرة">
                                        القاهرة
                                      </option>

                                      <option value="الجيزة">
                                        الجيزة
                                      </option>

                                      <option value="القليوبية">
                                        القليوبية
                                      </option>

                                      <option value="الإسكندرية">
                                        الإسكندرية
                                      </option>

                                      <option value="الشرقية">
                                        الشرقية
                                      </option>

                                      <option value="الدقهلية">
                                        الدقهلية
                                      </option>
                                    </select>

                                    {branchError
                                      ?.governorate
                                      ?.message && (
                                      <ErrorText>
                                        {
                                          branchError
                                            .governorate
                                            .message
                                        }
                                      </ErrorText>
                                    )}
                                  </td>

                                  <td className="px-4 py-3">
                                    <Input
                                      {...register(
                                        `branches.${index}.city`,
                                        {
                                          required:
                                            'المدينة مطلوبة',
                                        }
                                      )}
                                      placeholder="مثال: الدقي"
                                      className="h-11 rounded-xl bg-background"
                                    />

                                    {branchError
                                      ?.city
                                      ?.message && (
                                      <ErrorText>
                                        {
                                          branchError
                                            .city
                                            .message
                                        }
                                      </ErrorText>
                                    )}
                                  </td>

                                  <td className="px-4 py-3">
                                    <Input
                                      {...register(
                                        `branches.${index}.street`,
                                        {
                                          required:
                                            'الشارع مطلوب',
                                        }
                                      )}
                                      placeholder="شارع التحرير"
                                      className="h-11 rounded-xl bg-background"
                                    />

                                    {branchError
                                      ?.street
                                      ?.message && (
                                      <ErrorText>
                                        {
                                          branchError
                                            .street
                                            .message
                                        }
                                      </ErrorText>
                                    )}
                                  </td>

                                  <td className="px-4 py-3">
                                    <Input
                                      {...register(
                                        `branches.${index}.glnCode`,
                                        {
                                          required:
                                            'رمز الموقع العالمي (GLN) مطلوب',
                                        }
                                      )}
                                      placeholder="22828317"
                                      className="h-11 rounded-xl bg-background"
                                    />

                                    {branchError
                                      ?.glnCode
                                      ?.message && (
                                      <ErrorText>
                                        {
                                          branchError
                                            .glnCode
                                            .message
                                        }
                                      </ErrorText>
                                    )}
                                  </td>

                                  <td className="px-4 py-3">
                                    <Input
                                      {...register(
                                        `branches.${index}.buildingNumber`,
                                        {
                                          required:
                                            'رقم المبنى مطلوب',
                                        }
                                      )}
                                      placeholder="25"
                                      className="h-11 rounded-xl bg-background"
                                    />

                                    {branchError
                                      ?.buildingNumber
                                      ?.message && (
                                      <ErrorText>
                                        {
                                          branchError
                                            .buildingNumber
                                            .message
                                        }
                                      </ErrorText>
                                    )}
                                  </td>

                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10"
                                        onClick={() =>
                                          removeBranch(
                                            index
                                          )
                                        }
                                        disabled={
                                          branchFields.length ===
                                          1
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* =================================================
              STEP 2
          ================================================= */}

          {activeStep === 2 && (
            <div className="space-y-6">

              {/* Contract */}

              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    معلومات العقد والخطة
                  </CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                  {/* Contract Date */}

                  <div>
                    <Label>
                      تاريخ العقد
                    </Label>

                    <div className="relative mt-2">
                      <CalendarDays className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        type="date"
                        {...register(
                          'contractDate'
                        )}
                        readOnly
                        className="h-11 rounded-xl pr-10"
                      />
                    </div>
                  </div>

                  {/* Contract Number */}

                  <FormField
                    label="رقم العقد"
                    registration={register(
                      'contractNumber',
                      {
                        required:
                          'رقم العقد مطلوب',
                      }
                    )}
                    error={
                      errors.contractNumber
                        ?.message
                    }
                  />

                  {/* Branch */}

                  <SelectField
                    label="الفرع التابع للعميل"
                    registration={register(
                      'branchId',
                      {
                        required:
                          'يجب اختيار الفرع',
                      }
                    )}
                    options={[
                      ['', 'اختر الفرع'],

                      ...branches.map(
                        (
                          branch: any,
                          index: number
                        ) => [
                          String(index),
                          `الفرع ${index + 1} — ${
                            branch.city ||
                            'مدينة غير محددة'
                          }${
                            branch.glnCode
                              ? ` — ${branch.glnCode}`
                              : ''
                          }`,
                        ]
                      ),
                    ]}
                    error={
                      errors.branchId?.message
                    }
                  />

                  {/* Program */}

                  <FormField
                    label="اسم البرنامج"
                    registration={register(
                      'programName',
                      {
                        required:
                          'اسم البرنامج مطلوب',
                      }
                    )}
                    placeholder="اسم البرنامج"
                    error={
                      errors.programName
                        ?.message
                    }
                  />

                  {/* Plan */}

                  <SelectField
                    label="نوع العقد"
                    registration={register(
                      'plan',
                      {
                        required:
                          'نوع العقد مطلوب',
                      }
                    )}
                    options={[
                      [
                        '',
                        'اختر الخطة',
                      ],
                      [
                        'SILVER',
                        'الخطة الفضية — 600 جنيه / شهر',
                      ],
                      [
                        'GOLD',
                        'الخطة الذهبية — 700 جنيه / شهر',
                      ],
                    ]}
                    error={
                      errors.plan?.message
                    }
                  />

                  {/* Responsible Representative */}

                  <SelectField
                    label="المندوب المسؤول"
                    registration={register(
                      'responsibleRep',
                      {
                        required:
                          'المندوب المسؤول مطلوب',
                      }
                    )}
                    options={[
                      [
                        '',
                        'اختر المندوب',
                      ],

                      ...salesRepresentatives.map(
                        (user) => [
                          String(user.id),
                          `${user.nameAr} — ${user.name}`,
                        ]
                      ),
                    ]}
                    error={
                      errors.responsibleRep
                        ?.message
                    }
                  />

                  {/* Participant */}

                  <div className="rounded-xl border border-border bg-card p-4 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <Label className="text-sm font-medium">
                          يوجد مشارك في العقد؟
                        </Label>

                        <p className="mt-1 text-xs text-muted-foreground">
                          يمكنك إضافة مستخدم آخر كمشارك في هذا العقد.
                        </p>
                      </div>

                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          {...register(
                            'hasParticipant',
                            {
                              onChange: (
                                event
                              ) => {
                                if (
                                  !event.target
                                    .checked
                                ) {
                                  setValue(
                                    'participantId',
                                    ''
                                  );
                                }
                              },
                            }
                          )}
                          className="h-4 w-4 rounded border-border"
                        />

                        <span className="text-sm">
                          مشارك
                        </span>
                      </label>
                    </div>

                    {hasParticipant && (
                      <div className="mt-4">
                        <Label>
                          المشارك
                        </Label>

                        <Popover
                          open={
                            participantOpen
                          }
                          onOpenChange={
                            setParticipantOpen
                          }
                        >
                          <PopoverTrigger
                            asChild
                          >
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              aria-expanded={
                                participantOpen
                              }
                              className="mt-2 h-11 w-full justify-between rounded-xl font-normal"
                            >
                              <div className="flex items-center gap-2">
                                <UserRound className="h-4 w-4 text-muted-foreground" />

                                <span
                                  className={
                                    selectedParticipant
                                      ? 'text-foreground'
                                      : 'text-muted-foreground'
                                  }
                                >
                                  {selectedParticipant?.name ||
                                    'اختر المشارك'}
                                </span>
                              </div>

                              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent
                            align="start"
                            className="w-[--radix-popover-trigger-width] p-0"
                          >
                            <Command>
                              <CommandInput placeholder="ابحث عن مستخدم..." />

                              <CommandList>
                                <CommandEmpty>
                                  لا يوجد مستخدم بهذا الاسم
                                </CommandEmpty>

                                <CommandGroup heading="المستخدمون">
                                  {users.map(
                                    (user) => (
                                      <CommandItem
                                        key={
                                          user.id
                                        }
                                        value={`${user.name} ${user.nameAr}`}
                                        onSelect={() => {
                                          setValue(
                                            'participantId',
                                            String(
                                              user.id
                                            ),
                                            {
                                              shouldValidate:
                                                true,
                                              shouldDirty:
                                                true,
                                            }
                                          );

                                          setParticipantOpen(
                                            false
                                          );
                                        }}
                                      >
                                        <UserRound className="mr-2 h-4 w-4 text-muted-foreground" />

                                        <span>
                                          {
                                            user.nameAr
                                          }{' '}
                                          —{' '}
                                          {
                                            user.name
                                          }
                                        </span>

                                        <Check
                                          className={`mr-auto h-4 w-4 ${
                                            String(
                                              participantId
                                            ) ===
                                            String(
                                              user.id
                                            )
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          }`}
                                        />
                                      </CommandItem>
                                    )
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {errors.participantId && (
                          <ErrorText>
                            {
                              errors
                                .participantId
                                .message
                            }
                          </ErrorText>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Next Due Date */}

                  <div>
                    <Label>
                      تاريخ استحقاق الاشتراك القادم
                    </Label>

                    <div className="relative mt-2">
                      <CalendarDays className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        type="date"
                        {...register(
                          'nextDueDate',
                          {
                            required:
                              'تاريخ الاستحقاق مطلوب',
                          }
                        )}
                        className="h-11 rounded-xl pr-10"
                      />
                    </div>

                    {errors.nextDueDate && (
                      <ErrorText>
                        {
                          errors.nextDueDate
                            .message
                        }
                      </ErrorText>
                    )}
                  </div>

                  {/* Installation */}

                  <div>
                    <Label>
                      تاريخ التركيب
                    </Label>

                    <div className="relative mt-2">
                      <Wrench className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        type="date"
                        {...register(
                          'installationDate'
                        )}
                        className="h-11 rounded-xl pr-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Months */}

              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-base">
                        الشهور المطلوب سدادها
                      </CardTitle>

                      <p className="mt-1 text-xs text-muted-foreground">
                        اختر الشهور التي يريد العميل سدادها في التحصيل الحالي.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Badge
                        variant="secondary"
                        className="rounded-full"
                      >
                        {selectedMonths.length}{' '}
                        شهور
                      </Badge>

                      <Badge
                        variant="outline"
                        className="rounded-full"
                      >
                        {monthlySubscription.toLocaleString(
                          'ar-EG'
                        )}{' '}
                        جنيه
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {monthOptions.map(
                      (month) => {
                        const checked =
                          selectedMonths.includes(
                            month
                          );

                        return (
                          <label
                            key={month}
                            className={`
                              flex cursor-pointer
                              items-center gap-3
                              rounded-xl border p-3
                              transition-all

                              ${
                                checked
                                  ? 'border-foreground bg-foreground text-background'
                                  : 'border-border bg-background hover:bg-accent'
                              }
                            `}
                          >
                            <Checkbox
                              checked={
                                checked
                              }
                              onCheckedChange={() =>
                                toggleMonth(
                                  month
                                )
                              }
                            />

                            <span className="text-sm font-medium">
                              {month}
                            </span>
                          </label>
                        );
                      }
                    )}
                  </div>

                  {errors.selectedMonths && (
                    <ErrorText>
                      {
                        errors.selectedMonths
                          .message
                      }
                    </ErrorText>
                  )}
                </CardContent>
              </Card>

              {/* Payment + Review */}

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">

                {/* Payment */}

                <Card className="border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      الدفع والتحصيل
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">

                    {/* Money Summary */}

                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

                      <MoneyCard
                        label="رسوم الانضمام"
                        value={joiningFee}
                      />

                      <MoneyCard
                        label="قيمة الاشتراك"
                        value={
                          monthlySubscription
                        }
                        subtitle={`${selectedMonths.length} شهور`}
                      />

                      <MoneyCard
                        label="الإجمالي قبل الخصم"
                        value={
                          grossContractValue
                        }
                      />

                      <div className="rounded-2xl border border-foreground bg-foreground p-4 text-background">
                        <div className="text-xs opacity-70">
                          إجمالي العقد
                        </div>

                        <div className="mt-2 text-xl font-bold">
                          {totalContractValue.toLocaleString(
                            'ar-EG'
                          )}
                        </div>

                        <div className="text-xs opacity-70">
                          جنيه
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Discount */}

                    <Card className="border-border bg-card shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">
                          الخصم
                        </CardTitle>

                        <p className="text-xs text-muted-foreground">
                          الخصم يتم تطبيقه على إجمالي العقد بالكامل، بما في ذلك رسوم الانضمام والاشتراك.
                        </p>
                      </CardHeader>

                      <CardContent>
                        <div>
                          <FormField
                            label="قيمة الخصم"
                            registration={register(
                              'discountAmount',
                              {
                                valueAsNumber:
                                  true,

                                min: {
                                  value: 0,
                                  message:
                                    'الخصم لا يمكن أن يكون سالبًا',
                                },

                                validate: (
                                  value
                                ) => {
                                  const amount =
                                    Number(
                                      value || 0
                                    );

                                  return (
                                    amount <=
                                      grossContractValue ||
                                    'الخصم لا يمكن أن يتجاوز إجمالي العقد'
                                  );
                                },
                              }
                            )}
                            type="number"
                            error={
                              errors
                                .discountAmount
                                ?.message
                            }
                          />

                          <div className="mt-3 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                            الحد الأقصى للخصم:{' '}
                            <span className="font-semibold text-foreground">
                              {grossContractValue.toLocaleString(
                                'ar-EG'
                              )}{' '}
                              جنيه
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Collection */}

                    <div>
                      <div className="mb-4">
                        <h3 className="text-sm font-bold">
                          تسجيل مبلغ التحصيل
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          أدخل المبلغ الذي تم تحصيله الآن وحدد وسيلة الدفع.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        <div>
                          <Label>
                            المبلغ المحصل الآن
                          </Label>

                          <div className="relative mt-2">
                            <Input
                              type="number"
                              min="0"
                              max={
                                totalContractValue
                              }
                              step="0.01"
                              {...register(
                                'paymentAmount',
                                {
                                  valueAsNumber:
                                    true,

                                  min: {
                                    value: 0,
                                    message:
                                      'المبلغ لا يمكن أن يكون سالبًا',
                                  },

                                  validate: (
                                    value
                                  ) =>
                                    Number(
                                      value || 0
                                    ) <=
                                      totalContractValue ||
                                    'المبلغ المحصل لا يمكن أن يتجاوز إجمالي العقد',
                                }
                              )}
                              className="h-12 rounded-xl pl-16 text-lg font-semibold"
                            />

                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              جنيه
                            </div>
                          </div>

                          {errors.paymentAmount && (
                            <ErrorText>
                              {
                                errors
                                  .paymentAmount
                                  .message
                              }
                            </ErrorText>
                          )}
                        </div>

                        <SelectField
                          label="طريقة الدفع"
                          registration={register(
                            'paymentMethod',
                            {
                              validate:
                                (value) =>
                                  paymentAmount <=
                                    0 ||
                                  value ||
                                  'طريقة الدفع مطلوبة عند تسجيل تحصيل',
                            }
                          )}
                          options={[
                            [
                              '',
                              'اختر طريقة الدفع',
                            ],
                            [
                              'CASH',
                              'نقدي',
                            ],
                            [
                              'BANK_TRANSFER',
                              'تحويل بنكي',
                            ],
                            [
                              'CREDIT_CARD',
                              'بطاقة ائتمان',
                            ],
                            [
                              'CHEQUE',
                              'شيك',
                            ],
                            [
                              'ONLINE_PAYMENT',
                              'دفع إلكتروني',
                            ],
                          ]}
                          error={
                            errors
                              .paymentMethod
                              ?.message
                          }
                        />
                      </div>

                      {/* Payment Progress */}

                      <div className="mt-5 rounded-2xl bg-muted p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            نسبة السداد
                          </span>

                          <span className="font-bold">
                            {paidPercentage.toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                          <div
                            className="h-full rounded-full bg-foreground transition-all"
                            style={{
                              width: `${paidPercentage}%`,
                            }}
                          />
                        </div>

                        <div className="mt-3 flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            مدفوع:
                            <span className="mr-1 font-semibold text-emerald-600 dark:text-emerald-400">
                              {paymentAmount.toLocaleString(
                                'ar-EG'
                              )}{' '}
                              جنيه
                            </span>
                          </span>

                          <span className="text-muted-foreground">
                            متبقي:
                            <span className="mr-1 font-semibold text-amber-600 dark:text-amber-400">
                              {remainingAmount.toLocaleString(
                                'ar-EG'
                              )}{' '}
                              جنيه
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Notes */}

                    <div>
                      <Label>
                        ملاحظات العقد
                      </Label>

                      <Textarea
                        {...register('notes')}
                        placeholder="أضف أي ملاحظات مرتبطة بالعقد أو العميل..."
                        className="mt-2 min-h-[120px] resize-none rounded-xl"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Review */}

                <Card className="border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      مراجعة قبل الإرسال
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-5">

                    <div className="rounded-2xl bg-foreground p-5 text-background">
                      <div className="text-xs opacity-70">
                        نوع العملية
                      </div>

                      <div className="mt-2 text-lg font-bold">
                        {customerStatus}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-background/10 pt-4">
                        <span className="text-xs opacity-70">
                          الخطة
                        </span>

                        <span className="text-sm font-semibold">
                          {
                            planName[
                              plan as keyof typeof planName
                            ]
                          }
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">

                      <ReviewRow
                        label="العميل"
                        value={
                          customerNameAr ||
                          '—'
                        }
                      />

                      <ReviewRow
                        label="الكود"
                        value={
                          customerCode ||
                          '—'
                        }
                      />

                      <ReviewRow
                        label="نوع العميل"
                        value={
                          customerType ===
                          'PHARMACEUTICAL'
                            ? 'صيدلي'
                            : customerType ===
                                'COMMERCIAL'
                              ? 'تجاري'
                              : '—'
                        }
                      />

                      <ReviewRow
                        label="هيكل العميل"
                        value={
                          structure ===
                          'CHAIN'
                            ? 'سلسلة'
                            : structure ===
                                'SINGLE'
                              ? 'فرع واحد'
                              : '—'
                        }
                      />

                      <ReviewRow
                        label="الفرع"
                        value={
                          selectedBranch
                            ? `الفرع ${
                                Number(
                                  branchId
                                ) + 1
                              } — ${
                                selectedBranch.city ||
                                'مدينة غير محددة'
                              }`
                            : 'لم يتم الاختيار'
                        }
                      />

                      <ReviewRow
                        label="المندوب المسؤول"
                        value={
                          selectedResponsibleRep
                            ? `${selectedResponsibleRep.nameAr}`
                            : '—'
                        }
                      />

                      <ReviewRow
                        label="المشارك"
                        value={
                          hasParticipant
                            ? selectedParticipant
                                ?.nameAr ||
                              'لم يتم الاختيار'
                            : 'لا يوجد'
                        }
                      />

                      <ReviewRow
                        label="عدد جهات الاتصال"
                        value={`${contactFields.length}`}
                      />

                      <ReviewRow
                        label="عدد الفروع"
                        value={`${branchFields.length}`}
                      />

                      <ReviewRow
                        label="المستندات"
                        value={`${documentFields.length}`}
                      />

                      <ReviewRow
                        label="الشهور المحددة"
                        value={`${selectedMonths.length} شهور`}
                      />

                      <Separator />

                      <ReviewRow
                        label="رسوم الانضمام"
                        value={`${joiningFee.toLocaleString(
                          'ar-EG'
                        )} جنيه`}
                      />

                      <ReviewRow
                        label="الاشتراك"
                        value={`${monthlySubscription.toLocaleString(
                          'ar-EG'
                        )} جنيه`}
                      />

                      <ReviewRow
                        label="الإجمالي قبل الخصم"
                        value={`${grossContractValue.toLocaleString(
                          'ar-EG'
                        )} جنيه`}
                      />

                      <ReviewRow
                        label="الخصم"
                        value={`${discountAmount.toLocaleString(
                          'ar-EG'
                        )} جنيه`}
                      />

                      <ReviewRow
                        label="إجمالي العقد"
                        value={`${totalContractValue.toLocaleString(
                          'ar-EG'
                        )} جنيه`}
                      />

                      <ReviewRow
                        label="المحصل"
                        value={`${paymentAmount.toLocaleString(
                          'ar-EG'
                        )} جنيه`}
                      />

                      <ReviewRow
                        label="المتبقي"
                        value={`${remainingAmount.toLocaleString(
                          'ar-EG'
                        )} جنيه`}
                      />

                      <ReviewRow
                        label="طريقة الدفع"
                        value={
                          paymentMethod
                            ? paymentMethodName[
                                paymentMethod as keyof typeof paymentMethodName
                              ]
                            : 'لا يوجد تحصيل'
                        }
                      />
                    </div>

                    <Separator />

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-emerald-100 p-2 dark:bg-emerald-900">
                          <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                        </div>

                        <div>
                          <div className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                            العقد جاهز للمراجعة
                          </div>

                          <p className="mt-1 text-xs leading-5 text-emerald-700 dark:text-emerald-300">
                            بعد الإرسال سيتم تحويل العقد إلى مدير الدعم الفني للمراجعة والموافقة.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <Card className="sticky bottom-4 border-border bg-card shadow-lg">
            <CardContent className="flex flex-col-reverse gap-3 p-4 md:flex-row md:items-center md:justify-between">

              <div className="text-xs text-muted-foreground">
                الخطوة {activeStep} من 2
              </div>

              <div className="flex w-full items-center gap-3 md:w-auto">

                {activeStep === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="h-11 flex-1 rounded-xl md:flex-none"
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                    السابق
                  </Button>
                )}

                {activeStep === 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="
                      h-11 flex-1 rounded-xl
                      bg-foreground
                      text-background
                      hover:bg-foreground/90
                      md:flex-none
                    "
                  >
                    التالي

                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                      h-11 flex-1 rounded-xl
                      bg-emerald-600
                      text-white
                      hover:bg-emerald-700
                      md:flex-none
                    "
                  >
                    {isSubmitting
                      ? 'جاري الإرسال...'
                      : 'إرسال العقد للمراجعة'}

                    <Check className="mr-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   CONTACT PHONES
========================================================= */

function ContactPhones({
  control,
  register,
  contactIndex,
  errors,
}: any) {
  const {
    fields: phoneFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `contacts.${contactIndex}.phones`,
  });

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">
            أرقام الهاتف
          </div>

          <div className="mt-1 text-xs text-muted-foreground">
            بحد أقصى 3 أرقام لكل جهة اتصال
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          disabled={phoneFields.length >= 3}
          onClick={() =>
            append({
              number: '',
              type: 'محمول',
            })
          }
        >
          <Plus className="ml-2 h-4 w-4" />
          إضافة رقم
        </Button>
      </div>

      <div className="space-y-3">
        {phoneFields.map(
          (
            phone: any,
            phoneIndex: number
          ) => {
            const phoneError = (
              errors as any
            )?.contacts?.[
              contactIndex
            ]?.phones?.[phoneIndex];

            return (
              <div
                key={phone.id}
                className="grid grid-cols-12 gap-3"
              >
                <div className="col-span-12 md:col-span-2">
                  <Input
                    value={`الهاتف ${
                      phoneIndex + 1
                    }`}
                    readOnly
                    className="h-11 rounded-xl bg-background"
                  />
                </div>

                <div className="col-span-8 md:col-span-4">
                  <Input
                    {...register(
                      `contacts.${contactIndex}.phones.${phoneIndex}.number`,
                      {
                        required:
                          'رقم الهاتف مطلوب',

                        pattern: {
                          value:
                            /^[0-9+\-\s]{7,15}$/,
                          message:
                            'رقم الهاتف غير صحيح',
                        },
                      }
                    )}
                    placeholder="010xxxxxxxx"
                    className="h-11 rounded-xl bg-background"
                  />

                  {phoneError?.number
                    ?.message && (
                    <ErrorText>
                      {
                        phoneError
                          .number
                          .message
                      }
                    </ErrorText>
                  )}
                </div>

                <div className="col-span-4 md:col-span-4">
                  <select
                    {...register(
                      `contacts.${contactIndex}.phones.${phoneIndex}.type`
                    )}
                    className="
                      h-11 w-full rounded-xl
                      border border-border
                      bg-background px-3
                      text-sm text-foreground
                    "
                  >
                    <option value="محمول">
                      محمول
                    </option>

                    <option value="هاتف أرضي">
                      هاتف أرضي
                    </option>

                    <option value="واتساب">
                      واتساب
                    </option>
                  </select>
                </div>

                <div className="col-span-12 flex justify-end md:col-span-2">
                  {phoneFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        remove(phoneIndex)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  registration,
  placeholder,
  type = 'text',
  error,
}: any) {
  return (
    <div>
      <Label>{label}</Label>

      <Input
        type={type}
        {...registration}
        placeholder={placeholder}
        className="mt-2 h-11 rounded-xl"
      />

      {error && (
        <ErrorText>
          {String(error)}
        </ErrorText>
      )}
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({
  label,
  registration,
  options,
  error,
}: any) {
  return (
    <div>
      <Label>{label}</Label>

      <select
        {...registration}
        className="
          mt-2 h-11 w-full
          rounded-xl border
          border-border
          bg-background
          px-3 text-sm
          text-foreground
          outline-none
          focus:ring-2
          focus:ring-ring
        "
      >
        {options.map(
          (
            [optionValue, optionLabel]: any
          ) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          )
        )}
      </select>

      {error && (
        <ErrorText>
          {String(error)}
        </ErrorText>
      )}
    </div>
  );
}

/* =========================================================
   MONEY CARD
========================================================= */

function MoneyCard({
  label,
  value,
  subtitle = 'جنيه',
}: any) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4">
      <div className="text-xs text-muted-foreground">
        {label}
      </div>

      <div className="mt-2 text-xl font-bold">
        {Number(value || 0).toLocaleString(
          'ar-EG'
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        {subtitle}
      </div>
    </div>
  );
}

/* =========================================================
   REVIEW ROW
========================================================= */

function ReviewRow({
  label,
  value,
}: any) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-left font-semibold">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorText({
  children,
}: any) {
  return (
    <p className="mt-1 text-xs font-medium text-destructive">
      {children}
    </p>
  );
}

/* =========================================================
   FILE SIZE
========================================================= */

function formatFileSize(
  bytes: number
) {
  if (!bytes) {
    return '0 KB';
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(2)} MB`;
}
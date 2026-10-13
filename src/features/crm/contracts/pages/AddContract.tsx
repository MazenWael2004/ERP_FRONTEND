import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { useNavigate } from 'react-router';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';

import { cn } from 'src/lib/utils';

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
  RefreshCw,
  Search,
  Trash2,
  Upload,
  UserRound,
  Users,
  Wrench,
} from 'lucide-react';

import { useFieldArray, useForm, useWatch, Controller } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { fetchZones } from 'src/features/zones/api/zoneService';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from 'src/components/ui/input-otp';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';
import { Checkbox } from 'src/components/ui/checkbox';
import { Badge } from 'src/components/ui/badge';
import { Separator } from 'src/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import { api } from 'src/shared/api/axios';
import { fetchPaymentMethods } from '../api/contractService';

function generateMonthOptions() {
  const now = new Date();

  return Array.from({ length: 12 }, (_, offset) => {
    const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return {
      label: date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }),
      value: `${year}-${month}-01`,
    };
  });
}

function generateCustomerCode() {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `CUS-${datePart}-${randomPart}`;
}
type EgyptAdministrativeDivision = {
  id: string;
  level: number;
  nameAr: string;
  nameEn: string;
  parentId: string | null;
  hasChildren: boolean;
};

function normalizeArabicForMatching(value = '') {
  return value
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u065F]/g, '')
    .trim();
}

function getAdministrativeDivisions(payload: unknown): EgyptAdministrativeDivision[] {
  const records = Array.isArray(payload) ? payload : (payload as { data?: unknown })?.data;

  if (!Array.isArray(records)) {
    return [];
  }

  return records.filter(
    (item): item is EgyptAdministrativeDivision =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof (item as EgyptAdministrativeDivision).id === 'string' &&
      typeof (item as EgyptAdministrativeDivision).level === 'number',
  );
}

function uniqueAdministrativeDivisions(divisions: EgyptAdministrativeDivision[]) {
  return Array.from(new Map(divisions.map((division) => [division.id, division])).values());
}
const EGYPTIAN_TELEPHONE_CODES = [
  { code: '010', region: 'ڤودافون', regionEn: 'Vodafone', isMobile: true },
  { code: '011', region: 'اتصالات', regionEn: 'Etisalat', isMobile: true },
  { code: '012', region: 'أورنج', regionEn: 'Orange', isMobile: true },
  { code: '015', region: 'وي / العاشر من رمضان', regionEn: 'WE / 10th of Ramadan', isMobile: true },
  {
    code: '02',
    region: 'القاهرة والجيزة',
    regionEn: 'Cairo & Giza',
    governorates: ['القاهرة', 'الجيزة'],
  },
  { code: '03', region: 'الإسكندرية', regionEn: 'Alexandria', governorates: ['الإسكندرية'] },
  {
    code: '013',
    region: 'القليوبية (بنها)',
    regionEn: 'Qalyubia (Benha)',
    governorates: ['القليوبية'],
  },
  { code: '040', region: 'الغربية (طنطا)', regionEn: 'Gharbia (Tanta)', governorates: ['الغربية'] },
  {
    code: '045',
    region: 'البحيرة (دمنهور)',
    regionEn: 'Beheira (Damanhour)',
    governorates: ['البحيرة'],
  },
  { code: '046', region: 'مطروح', regionEn: 'Matruh', governorates: ['مطروح'] },
  { code: '047', region: 'كفر الشيخ', regionEn: 'Kafr El Sheikh', governorates: ['كفر الشيخ'] },
  {
    code: '048',
    region: 'المنوفية (شبين الكوم)',
    regionEn: 'Monufia (Shebin El Kom)',
    governorates: ['المنوفية'],
  },
  {
    code: '050',
    region: 'الدقهلية (المنصورة)',
    regionEn: 'Dakahlia (Mansoura)',
    governorates: ['الدقهلية'],
  },
  {
    code: '055',
    region: 'الشرقية (الزقازيق)',
    regionEn: 'Sharqia (Zagazig)',
    governorates: ['الشرقية'],
  },
  { code: '057', region: 'دمياط', regionEn: 'Damietta', governorates: ['دمياط'] },
  { code: '062', region: 'السويس', regionEn: 'Suez', governorates: ['السويس'] },
  { code: '064', region: 'الإسماعيلية', regionEn: 'Ismailia', governorates: ['الإسماعيلية'] },
  {
    code: '065',
    region: 'البحر الأحمر (الغردقة)',
    regionEn: 'Red Sea (Hurghada)',
    governorates: ['البحر الأحمر'],
  },
  { code: '066', region: 'بورسعيد', regionEn: 'Port Said', governorates: ['بورسعيد'] },
  {
    code: '068',
    region: 'شمال سيناء (العريش)',
    regionEn: 'North Sinai (Arish)',
    governorates: ['شمال سيناء'],
  },
  { code: '069', region: 'جنوب سيناء', regionEn: 'South Sinai', governorates: ['جنوب سيناء'] },
  { code: '082', region: 'بني سويف', regionEn: 'Beni Suef', governorates: ['بني سويف'] },
  { code: '084', region: 'الفيوم', regionEn: 'Faiyum', governorates: ['الفيوم'] },
  { code: '086', region: 'المنيا', regionEn: 'Minya', governorates: ['المنيا'] },
  { code: '088', region: 'أسيوط', regionEn: 'Asyut', governorates: ['أسيوط'] },
  { code: '092', region: 'الوادي الجديد', regionEn: 'New Valley', governorates: ['الوادي الجديد'] },
  { code: '093', region: 'سوهاج', regionEn: 'Sohag', governorates: ['سوهاج'] },
  { code: '095', region: 'الأقصر', regionEn: 'Luxor', governorates: ['الأقصر'] },
  { code: '096', region: 'قنا', regionEn: 'Qena', governorates: ['قنا'] },
  { code: '097', region: 'أسوان', regionEn: 'Aswan', governorates: ['أسوان'] },
];

function getLandlineTelephoneCode(governorate = '') {
  const normalizedGovernorate = normalizeArabicForMatching(governorate);

  if (!normalizedGovernorate) {
    return undefined;
  }

  return EGYPTIAN_TELEPHONE_CODES.find((telephoneCode) =>
    telephoneCode.governorates?.some((name) => {
      const normalizedName = normalizeArabicForMatching(name);
      return (
        normalizedName === normalizedGovernorate ||
        normalizedGovernorate.includes(normalizedName) ||
        normalizedName.includes(normalizedGovernorate)
      );
    }),
  );
}

type SellableService = {
  id: number;
  type: 'SERVICE' | 'HARDWARE' | 'SUBSCRIPTION';
  code: string;
  nameEn: string;
  nameAr: string;
  price: number;
  isQuantityBased: boolean;
};
export default function AddCustomerContract() {
  const isRtl = true;
  const { user } = useAuth();
  const currentUserName = user?.username || 'المستخدم الحالي';

  const [activeStep, setActiveStep] = useState(1);
  const [participantOpen, setParticipantOpen] = useState(false);
  const nav = useNavigate();
  const [openBranch, setOpenBranch] = useState(false);
  const [governorates, setGovernorates] = useState<EgyptAdministrativeDivision[]>([]);
  const [districts, setDistricts] = useState<EgyptAdministrativeDivision[]>([]);
  const [shiyakhas, setShiyakhas] = useState<EgyptAdministrativeDivision[]>([]);
  const [isGeographyLoading, setIsGeographyLoading] = useState(true);
  const [geographyError, setGeographyError] = useState('');
  const [geographyRefresh, setGeographyRefresh] = useState(0);
  const [availableServices, setAvailableServices] = useState<SellableService[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');
  const [servicesRefresh, setServicesRefresh] = useState(0);
  const [zones, setZones] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await fetchZones();
        const records = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        setZones(records);
      } catch (error) {
        console.error('Failed to fetch zones:', error);
      }
    };

    loadZones();
  }, []);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await fetchPaymentMethods();
        setPaymentMethods(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
      }
    };

    loadPaymentMethods();
  }, []);

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

  /* =========================================================
     PROGRAMS
  ========================================================= */

  const programs: any[] = [
    {
      id: 1,
      name_en: 'E-Plus',
    },
    {
      id: 2,
      name_en: 'E-Chain',
    },
  ];

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
      customerTypeId: null,
      structure: '',
      zoneId: '',
      licenseNumber: '',
      taxNumber: '',
      registrationNumber: '',

      contractDate: new Date().toISOString().split('T')[0],
      branchId: '',
      contractNumber: '',
      programId: null,
      planId: null,
      contractType: '',

      hasParticipant: false,
      participantId: '',

      representativeId: user?.id ?? '',

      nextDueDate: '',
      installationDate: new Date().toISOString().split('T')[0],
      notes: '',

      paymentAmount: 0,
      paymentMethodId: null,
      paymentDetails: {
        transferDate: '',
        bankName: '',
        referenceNumber: '',
        chequeNumber: '',
        receiptNumber: '',
      },

      baseSubscriptionAmount: 0,

      // Each month is { label: 'نوفمبر 2026', value: '2026-11-01' }
      selectedMonths: [] as { label: string; value: string }[],

      documents: [],

      additionalServices: [] as { serviceId: number; quantity: number }[],

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

      address: {
        governorateId: '',
        districtId: '',
        shiyakhaId: '',
        street: '',
        buildingNumber: '',
        glnCode: '',
      },
    },
  });

  // Pricing starts async and changes with plan, offer, months, and add-ons. Keep the
  // suggested collection equal to the discounted total until the user edits it.
  const hasManuallyEditedPaymentAmount = useRef(false);

  useEffect(() => {
    if (user?.id) {
      setValue('representativeId', user.id, { shouldValidate: true });
    }
  }, [setValue, user?.id]);

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
    fields: additionalServiceFields,
    append: appendAdditionalService,
    remove: removeAdditionalService,
  } = useFieldArray({
    control,
    name: 'additionalServices',
  });

  const addAdditionalService = (service: SellableService) => {
    const selectedServices = getValues('additionalServices') || [];
    const existingIndex = selectedServices.findIndex(
      (item: any) => Number(item.serviceId) === service.id,
    );

    if (existingIndex >= 0) {
      if (service.isQuantityBased) {
        const quantity = Number(selectedServices[existingIndex]?.quantity || 0) + 1;
        setValue(`additionalServices.${existingIndex}.quantity`, quantity, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      return;
    }

    appendAdditionalService({ serviceId: service.id, quantity: 1 });
  };

  // const {
  //   fields: branchFields,
  //   append: appendBranch,
  //   remove: removeBranch,
  // } = useFieldArray({
  //   control,
  //   name: 'branches',
  // });

  /* =========================================================
     WATCH
  ========================================================= */

  const customerMode = watch('customerMode');
  const customerId = watch('customerId');
  useEffect(() => {
    if (customerMode === 'new') {
      setValue('customerCode', generateCustomerCode(), { shouldValidate: true });
    }
  }, [customerMode, setValue]);

  const customerNameAr = watch('customerNameAr');
  const customerCode = watch('customerCode');
  const customerTypeId = watch('customerTypeId');
  const structure = watch('structure');

  const planId = watch('planId');
  const contractType = watch('contractType');

  const participantId = watch('participantId');
  const hasParticipant = watch('hasParticipant');

  const branchId = watch('branchId');
  const zoneId = watch('zoneId');

  const governorateId = watch('address.governorateId');
  const districtId = watch('address.districtId');

  const selectedGovernorate = governorates.find((division) => division.id === governorateId);

  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();

    const loadDivisions = async () => {
      const request = districtId
        ? { url: `/geography/${districtId}/children`, setDivisions: setShiyakhas }
        : governorateId
          ? { url: `/geography/${governorateId}/children`, setDivisions: setDistricts }
          : { url: '/geography/governorates', setDivisions: setGovernorates };

      setIsGeographyLoading(true);
      setGeographyError('');

      try {
        const response = await api.get(request.url, { signal: abortController.signal });
        const divisions = response.data?.data;

        if (!Array.isArray(divisions)) {
          throw new Error('Invalid geography response.');
        }

        if (isActive) {
          request.setDivisions(divisions as EgyptAdministrativeDivision[]);
        }
      } catch (error) {
        if (!abortController.signal.aborted && isActive) {
          setGeographyError('تعذر تحميل التقسيمات الجغرافية. تحقق من الاتصال ثم أعد المحاولة.');
        }
      } finally {
        if (isActive) {
          setIsGeographyLoading(false);
        }
      }
    };

    if (!governorateId) {
      setDistricts([]);
      setShiyakhas([]);
    } else if (!districtId) {
      setShiyakhas([]);
    }

    void loadDivisions();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [districtId, geographyRefresh, governorateId]);

  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();

    const loadServices = async () => {
      setIsServicesLoading(true);
      setServicesError('');
      try {
        const response = await api.get('/services', { signal: abortController.signal });
        const records = response.data?.data;
        if (!Array.isArray(records)) throw new Error('Invalid services response.');

        if (isActive) {
          setAvailableServices(
            records.map((service: any) => ({
              ...service,
              id: Number(service.id),
              price: Number(service.price),
              isQuantityBased: Boolean(service.isQuantityBased),
            })),
          );
        }
      } catch (error) {
        if (!abortController.signal.aborted && isActive) {
          setServicesError('تعذر تحميل الخدمات والأجهزة. تحقق من الاتصال ثم أعد المحاولة.');
        }
      } finally {
        if (isActive) setIsServicesLoading(false);
      }
    };

    void loadServices();
    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [servicesRefresh]);
  const paymentMethodId = watch('paymentMethodId');
  const paymentDetails = watch('paymentDetails');

  const selectedMonths = watch('selectedMonths') || [];
  const selectedAdditionalServices = watch('additionalServices') || [];

  const paymentAmount = Number(watch('paymentAmount') || 0);

  const branches = watch('branches') || [];

  const selectedParticipant = users.find((user) => String(user.id) === String(participantId));

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

  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const plans = [
    { id: 1, code: 'SILVER', name: 'Silver' },
    { id: 2, code: 'GOLD', name: 'Gold' },
  ].map((plan) => ({
    ...plan,
    price: Number(
      availableServices.find(
        (service) => service.type === 'SUBSCRIPTION' && service.code === plan.code,
      )?.price ?? 0,
    ),
  }));

  const joiningFeeService = availableServices.find((service) => service.code === 'JOINING_FEE');
  const additionalUnitService = availableServices.find((service) => service.code === 'ADDITIONAL_UNIT');
  const additionalUnitSubscriptionService = availableServices.find(
    (service) => service.code === 'ADDITIONAL_UNIT_SUBSCRIPTION',
  );
  // Hardware is deliberately excluded from contract creation. All remaining SERVICE
  // catalog entries are retained as replication services.
  const replicationServices = availableServices.filter(
    (service) => service.type === 'SERVICE' && !['JOINING_FEE', 'ADDITIONAL_UNIT'].includes(service.code),
  );

  const contractTypeRules: any = {
    REGULAR: {
      label: 'عادي — بدون خصم',
      maxMonths: 12,
      subscriptionDiscountPercentage: 0,
      joiningFeeDiscountPercentage: 0,
      requiresSelectedMonths: false,
      autoSelectConsecutive: false,
    },

    SIX_MONTHS: {
      label: '6 أشهر — خصم 50% اشتراك، 40% رسوم الانضمام',
      maxMonths: 6,
      subscriptionDiscountPercentage: 50,
      joiningFeeDiscountPercentage: 40,
      requiresSelectedMonths: true,
      autoSelectConsecutive: true,
    },
  };

  const currentContractTypeRule = contractTypeRules[contractType] || {
    label: '',
    maxMonths: 0,
    subscriptionDiscountPercentage: 0,
    joiningFeeDiscountPercentage: 0,
    requiresSelectedMonths: false,
  };

  const visibleMonthOptions = useMemo(() => {
    if (!contractType) {
      return [];
    }

    if (currentContractTypeRule.autoSelectConsecutive) {
      // An offer starts with two choices. Once one is chosen, show the full
      // automatically selected offer period so the customer can review it.
      const visibleOfferMonths = selectedMonths.length > 0 ? currentContractTypeRule.maxMonths : 2;
      return monthOptions.slice(0, Math.min(visibleOfferMonths, currentContractTypeRule.maxMonths));
    }

    // Regular contracts start with the current and next month. Once selected,
    // reveal exactly one following month so the subscription stays consecutive.
    const visibleMonthCount = selectedMonths.length === 0 ? 2 : selectedMonths.length + 1;
    return monthOptions.slice(0, Math.min(visibleMonthCount, currentContractTypeRule.maxMonths));
  }, [
    contractType,
    currentContractTypeRule.autoSelectConsecutive,
    currentContractTypeRule.maxMonths,
    monthOptions,
    selectedMonths.length,
  ]);
  // const paymentMethods = [
  //   { id: 1, code: 'CASH', label: 'نقدي' },
  //   { id: 2, code: 'BANK_TRANSFER', label: 'تحويل بنكي' },
  //   { id: 4, code: 'CHEQUE', label: 'شيك' },
  //   { id: 5, code: 'INSTAPAY', label: 'Instapay' },
  //   { id: 5, code: 'PAYSKY', label: 'Paysky' },
  // ];
  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const joiningFee = Number(joiningFeeService?.price ?? 0);

  const selectedPlan = plans.find((p: any) => p.id === Number(planId));

  const mainMonthlySubscription = selectedPlan?.price || 0;
  const additionalUnitSubscription = Number(additionalUnitSubscriptionService?.price ?? 0);
  const monthlyRecurringSubscription = mainMonthlySubscription + additionalUnitSubscription;

  const monthlySubscription = selectedMonths.length * monthlyRecurringSubscription;

  /*
   * Latest selected month (ISO dates compare correctly as strings).
   * null when no month is selected.
   */
  const latestSelectedMonth = selectedMonths.length
    ? selectedMonths.reduce((latest: any, month: any) =>
        month.value > latest.value ? month : latest,
      )
    : null;

  const subscriptionDiscountPercentage = currentContractTypeRule.subscriptionDiscountPercentage;
  const joiningFeeDiscountPercentage = currentContractTypeRule.joiningFeeDiscountPercentage;

  const subscriptionDiscount = monthlySubscription * (subscriptionDiscountPercentage / 100);
  const joiningFeeDiscount = joiningFee * (joiningFeeDiscountPercentage / 100);

  const subscriptionPriceAfterDiscount = monthlySubscription - subscriptionDiscount;
  const joiningFeeAfterContractTypeDiscount = joiningFee - joiningFeeDiscount;

  const selectedAdditionalServiceRows = useMemo(
    () =>
      selectedAdditionalServices
        .map((item: any) => {
          const service = availableServices.find(
            (candidate) => candidate.id === Number(item.serviceId),
          );
          if (!service) return null;
          const quantity = Math.max(Number(item.quantity) || 1, 1);
          return { ...service, quantity, total: service.price * quantity };
        })
        .filter((item): item is SellableService & { quantity: number; total: number } =>
          Boolean(item),
        ),
    [availableServices, selectedAdditionalServices],
  );
  const additionalServicesTotal = selectedAdditionalServiceRows.reduce(
    (total, service) => total + service.total,
    0,
  );
  const grossContractValue =
    joiningFeeAfterContractTypeDiscount + subscriptionPriceAfterDiscount + additionalServicesTotal;
  const discountAmount = subscriptionDiscount + joiningFeeDiscount;

  const totalContractValue = grossContractValue;

  const totalBeforeDiscount = joiningFee + monthlySubscription + additionalServicesTotal;
  const joiningFeeAfterDiscount = joiningFeeAfterContractTypeDiscount;
  const subscriptionFeeAfterDiscount = subscriptionPriceAfterDiscount;

  useEffect(() => {
    if (!hasManuallyEditedPaymentAmount.current) {
      setValue('paymentAmount', totalContractValue, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [setValue, totalContractValue]);

  const remainingAmount = Math.max(totalContractValue - paymentAmount, 0);

  const paidPercentage =
    totalContractValue > 0 ? Math.min((paymentAmount / totalContractValue) * 100, 100) : 0;

  const selectedBranch = branchId !== '' ? (branches[Number(branchId)] ?? null) : null;
  const selectedZone = zoneId !== '' ? (zones[Number(zoneId)] ?? null) : null;

  const customerStatus = customerMode === 'reactivate' ? 'إعادة تفعيل' : 'عميل جديد';

  const selectedPaymentMethod = paymentMethods.find(
    (method) => Number(method.id) === Number(paymentMethodId),
  );
  const paymentMethodCode = String(selectedPaymentMethod?.code || '').toUpperCase().replace(/_/g, '');

  useEffect(() => {
    const fieldsByMethod: Record<string, string[]> = {
      BANK_TRANSFER: ['transferDate', 'bankName', 'referenceNumber'],
      INSTAPAY: ['referenceNumber'],
      PAYSKY: ['referenceNumber'],
      CHEQUE: ['bankName', 'chequeNumber'],
      CASH: ['receiptNumber'],
    };
    const allowed = new Set(fieldsByMethod[paymentMethodCode] || []);
    (['transferDate', 'bankName', 'referenceNumber', 'chequeNumber', 'receiptNumber'] as const).forEach((field) => {
      if (!allowed.has(field) && paymentDetails?.[field]) {
        setValue(`paymentDetails.${field}`, '', { shouldDirty: true });
      }
    });
  }, [paymentDetails, paymentMethodCode, setValue]);

  /* =========================================================
     FILE UPLOAD
  ========================================================= */

  const addDocumentInputRef = useRef<any>(null);
  const replaceDocumentInputRef = useRef<any>(null);

  const [replaceDocumentIndex, setReplaceDocumentIndex] = useState<any>(null);

  const openDocumentPicker = () => {
    addDocumentInputRef.current?.click();
  };

  const openReplacePicker = (index: number) => {
    setReplaceDocumentIndex(index);
    replaceDocumentInputRef.current?.click();
  };

  const isAcceptedDocument = (file: File) => {
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    return (
      ['.pdf', '.jpg', '.jpeg', '.png'].includes(extension) &&
      ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
    );
  };

  const showInvalidDocumentAlert = () => {
    void Swal.fire({
      icon: 'warning',
      title: 'نوع ملف غير مدعوم',
      text: 'يسمح فقط بملفات PDF أو JPG أو JPEG أو PNG، وبحد أقصى 5 ميجابايت للملف.',
      confirmButtonText: 'حسناً',
    });
  };

  const handleDocumentUpload = (event: any) => {
    const files = Array.from(event.target.files || []) as File[];
    const validFiles = files.filter(
      (file) => isAcceptedDocument(file) && file.size <= 5 * 1024 * 1024,
    );

    if (validFiles.length !== files.length) showInvalidDocumentAlert();

    validFiles.forEach((file) => {
      appendDocument({
        file,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    });

    event.target.value = '';
  };

  const handleDocumentReplace = (event: any) => {
    const file = event.target.files?.[0] as File | undefined;

    if (!file || replaceDocumentIndex === null) {
      return;
    }

    if (!isAcceptedDocument(file) || file.size > 5 * 1024 * 1024) {
      showInvalidDocumentAlert();
      event.target.value = '';
      return;
    }

    updateDocument(replaceDocumentIndex, {
      file,
      name: file.name,
      type: file.type,
      size: file.size,
    });

    setReplaceDocumentIndex(null);
    event.target.value = '';
  };

  /* =========================================================
     REACTIVATE CUSTOMER
  ========================================================= */

  const handleInactiveCustomer = (selectedId: string) => {
    const customer = inactiveCustomers.find((item) => item.id === selectedId);

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

    setValue('customerTypeId', customer.typeId, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('structure', customer.structure, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('licenseNumber', customer.licenseNumber, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('taxNumber', customer.taxNumber, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('registrationNumber', customer.registrationNumber, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  /* =========================================================
     MONTHS
  ========================================================= */

  // Re-check nextDueDate whenever the selected months change,
  // but only if the user already picked a date.
  const revalidateNextDueDate = () => {
    if (getValues('nextDueDate')) {
      trigger('nextDueDate');
    }
  };

  const handleContractTypeChange = (value: string) => {
    const selectedMonthsForType: { label: string; value: string }[] = [];

    setValue('contractType', value, {
      shouldDirty: true,
      shouldValidate: true,
    });

    // Both contract types start without paid months. The offer shows its first two
    // months and selecting either one completes its required consecutive period.
    setValue('selectedMonths', selectedMonthsForType, {
      shouldDirty: true,
      shouldValidate: true,
    });

    revalidateNextDueDate();
  };

  const toggleMonth = (month: { label: string; value: string }) => {
    if (!contractType) {
      return;
    }

    const current = getValues('selectedMonths') || [];

    if (currentContractTypeRule.autoSelectConsecutive) {
      // One of the first two offer months confirms the whole discounted period.
      if (current.length >= currentContractTypeRule.maxMonths) {
        return;
      }

      setValue('selectedMonths', monthOptions.slice(0, currentContractTypeRule.maxMonths), {
        shouldDirty: true,
        shouldValidate: true,
      });
      revalidateNextDueDate();
      return;
    }

    const sortedCurrent = [...current].sort((a: any, b: any) => a.value.localeCompare(b.value));
    const selectedIndex = sortedCurrent.findIndex((item: any) => item.value === month.value);
    let updated: { label: string; value: string }[];

    if (selectedIndex >= 0) {
      // Removing a month also removes every following month, so no gap can remain.
      updated = monthOptions.slice(0, selectedIndex);
    } else {
      const selectedMonthIndex = monthOptions.findIndex((item) => item.value === month.value);

      // Selecting the visible next month includes every preceding month.
      if (selectedMonthIndex < 0 || selectedMonthIndex > sortedCurrent.length + 1) {
        return;
      }

      updated = monthOptions.slice(0, selectedMonthIndex + 1);
    }

    setValue('selectedMonths', updated, {
      shouldDirty: true,
      shouldValidate: true,
    });

    revalidateNextDueDate();
  };

  /* =========================================================
     STEP VALIDATION
  ========================================================= */

  const scrollToFirstValidationError = () => {
    // Wait for React Hook Form to render field errors and, when needed, the target step.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const form = document.querySelector('.add-contract-form');
        const errorTarget = form?.querySelector<HTMLElement>(
          '[aria-invalid="true"], [data-validation-anchor="true"]',
        );

        if (!errorTarget) return;

        errorTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const focusTarget = errorTarget.matches('input, select, textarea, button')
          ? errorTarget
          : errorTarget.querySelector<HTMLElement>('input, select, textarea, button');
        focusTarget?.focus({ preventScroll: true });
      });
    });
  };

  const handleInvalidSubmit = (submitErrors: Record<string, unknown>) => {
    const hasStepOneError = [
      'customerId',
      'customerNameAr',
      'customerNameEn',
      'customerCode',
      'customerTypeId',
      'structure',
      'zoneId',
      'licenseNumber',
      'taxNumber',
      'registrationNumber',
      'contacts',
      'address',
    ].some((field) => Boolean(submitErrors[field]));

    setActiveStep(hasStepOneError ? 1 : 2);
    scrollToFirstValidationError();
  };
  const handleNext = async () => {
    const valid = await trigger([
      'customerId',

      'customerNameAr',
      'customerNameEn',
      'customerCode',
      'customerTypeId',
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

      'address.governorateId',
      'address.districtId',
      'address.shiyakhaId',
      'address.street',
      'address.buildingNumber',
      'address.glnCode',
    ]);

    if (!valid) {
      scrollToFirstValidationError();
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

  const onSubmit = async (data: any) => {
    if (!user?.id) {
      await Swal.fire({
        icon: 'error',
        title: 'تعذر إنشاء العقد',
        text: 'لم يتم العثور على المستخدم المسجل دخوله.',
        confirmButtonText: 'حسناً',
      });
      return;
    }
    if (isServicesLoading || servicesError || !joiningFeeService || !selectedPlan?.price || !additionalUnitSubscriptionService) {
      await Swal.fire({
        icon: 'error',
        title: 'تعذر إنشاء العقد',
        text: 'تعذر التحقق من أسعار الاشتراك ورسوم الانضمام من كتالوج الخدمات. أعد المحاولة بعد تحميل الخدمات.',
        confirmButtonText: 'حسناً',
      });
      return;
    }

    const selectedMonthsPayload = data.selectedMonths.map((month: any) => month.value.slice(0, 7));
    const discountedMonthlyAmount = Number(
      (monthlyRecurringSubscription * (1 - subscriptionDiscountPercentage / 100)).toFixed(2),
    );

    const contactsPayload = (data.contacts || []).map((contact: any) => ({
      ...contact,
      phones: (contact.phones || []).map((phone: any) => {
        if (phone.type !== 'هاتف أرضي') {
          return phone;
        }

        const landlineCode = getLandlineTelephoneCode(selectedGovernorate?.nameAr || '');
        return {
          ...phone,
          // The form stores only the subscriber portion; preserve the API's full phone number.
          number: `${landlineCode?.code || ''}${String(phone.number || '').replace(/\D/g, '')}`,
        };
      }),
    }));

    const payload = {
      ...data,
      contacts: contactsPayload,
      representativeId: user.id,
      contractBranchIndex: Number(branchId),
      address: {
        governorateId: data.address.governorateId,
        districtId: data.address.districtId,
        shiyakhaId: data.address.shiyakhaId || null,
        street: data.address.street,
        buildingNumber: data.address.buildingNumber,
        glnCode: data.address.glnCode || null,
      },
      // Explicit financial values for reporting and contract displays.
      joiningFeeBeforeDiscount: joiningFee,
      joiningFeeAfterDiscount,
      subscriptionFeeBeforeDiscount: monthlySubscription,
      subscriptionFeeAfterDiscount,
      totalBeforeDiscount,
      totalAfterDiscount: totalContractValue,

      // Existing API fields retained for backward compatibility.
      joiningFeeAmount: joiningFeeAfterDiscount,
      advancePayment: paymentAmount,
      remainingAmount,
      baseSubscriptionAmount: monthlyRecurringSubscription,
      mainSubscriptionAmount: mainMonthlySubscription,
      additionalUnitSubscriptionAmount: additionalUnitSubscription,
      grossContractValue,
      // Don't put File objects in JSON
      // documents: data.documents.map((doc: any) => ({
      //   documentType: doc.documentType,
      //   fileName: doc.file.name,
      // })),

      discountAmount,
      subscriptionDiscountPercentage,
      joiningFeeDiscountPercentage,
      joiningFeeDiscount,
      totalContractValue,
      selectedMonths: selectedMonthsPayload,
      monthPayments: selectedMonthsPayload.map((month: string) => ({
        month,
        amount: discountedMonthlyAmount,
      })),
      // The server resolves the current catalog price; the client only selects item IDs and quantities.
      additionalServices: (data.additionalServices || [])
        .map((service: any) => ({
          serviceId: Number(service.serviceId),
          quantity: Math.max(Number(service.quantity) || 0, 0),
        }))
        .filter(
          (service: any) =>
            Number.isInteger(service.serviceId) && service.serviceId > 0 && service.quantity > 0 &&
            availableServices.find((item) => item.id === service.serviceId)?.type === 'SERVICE',
        ),
      repAssistantId: participantId || null,
    };

    console.log(payload);

    const confirmation = await Swal.fire({
      icon: 'question',
      title: 'تأكيد إنشاء العقد',
      text: 'هل تريد إرسال العقد الآن؟',
      showCancelButton: true,
      confirmButtonText: 'إرسال العقد',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    void Swal.fire({
      title: 'جاري إنشاء العقد...',
      text: 'يرجى الانتظار حتى يتم حفظ البيانات.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'documents') return;
        formData.append(
          key,
          value !== null && typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
        );
      });

      (data.documents || []).forEach((document: any) => {
        if (document.file instanceof File) {
          formData.append('documents', document.file);
        }
      });

      const response = await api.post('/customers', formData);

      Swal.close();
      await Swal.fire({
        icon: 'success',
        title: 'تم إنشاء العقد بنجاح',
        text: response.data?.message || 'تم حفظ العقد بنجاح.',
        confirmButtonText: 'حسناً',
      });
      nav('/contracts-summary-report');
    } catch (error) {
      Swal.close();
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error?.message || error.response?.data?.message
        : undefined;

      await Swal.fire({
        icon: 'error',
        title: 'تعذر إنشاء العقد',
        text: message || 'حدث خطأ أثناء حفظ العقد. يرجى المحاولة مرة أخرى.',
        confirmButtonText: 'حسناً',
      });
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="rtl-contract-form min-h-screen bg-background text-foreground"
    >
      <style>{`
        /* Align native dropdown arrows consistently on the left in RTL forms. */
        .rtl-contract-form select {
          direction: rtl;
          text-align: right;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          padding-left: 2.5rem;
          padding-right: 0.875rem;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: left 0.875rem center;
          background-size: 1rem 1rem;
        }
        /* Number spinners stay on the right and do not overlap RTL text. */
        .rtl-contract-form input[type='number'] {
          direction: ltr;
          text-align: right;
          padding-right: 0.75rem;
        }
      `}</style>
      <form className="add-contract-form" onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)}>
        <div className="mx-auto max-w-[1500px] space-y-6 p-4 md:p-6 lg:p-8">
          {/* =================================================
              HIDDEN FIELDS
          ================================================= */}

          <input type="hidden" {...register('customerMode')} />

          <input
            type="hidden"
            {...register('customerId', {
              validate: (value) => customerMode === 'new' || value || 'يجب اختيار العميل غير النشط',
            })}
          />

          <input
            type="hidden"
            {...register('selectedMonths', {
              validate: (value) =>
                !currentContractTypeRule.requiresSelectedMonths ||
                (Array.isArray(value) && value.length > 0) ||
                'اختر شهرًا واحدًا على الأقل للاستفادة من العرض',
            })}
          />

          <input type="hidden" {...register('participantId', { valueAsNumber: true })} />

          {/* =================================================
              HEADER
          ================================================= */}

          <div>
            <h1 className="text-2xl font-bold tracking-tight">إنشاء عميل وعقد جديد</h1>

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
                    description: 'العميل، المستندات، جهات الاتصال، العنوان ',
                    icon: Users,
                  },
                  {
                    id: 2,
                    title: 'العقد والخطة',
                    description: 'الخطة، الدفع، التحصيل، المراجعة',
                    icon: FileText,
                  },
                ].map((step: any) => {
                  const Icon = step.icon;

                  const isActive = activeStep === step.id;

                  const isDone = activeStep > step.id;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => {
                        if (step.id === 1 || activeStep > step.id) {
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
                        {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>

                      <div>
                        <div
                          className={`
                            text-sm font-semibold
                            ${isActive ? 'text-background' : 'text-foreground'}
                          `}
                        >
                          {step.id}. {step.title}
                        </div>

                        <div
                          className={`
                            mt-1 text-xs
                            ${isActive ? 'text-background/70' : 'text-muted-foreground'}
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
                        setValue('customerMode', 'new', {
                          shouldDirty: true,
                        });

                        setValue('customerId', '');
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
                          <div className="text-sm font-bold">عميل جديد</div>

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
                            ${customerMode === 'new' ? 'bg-background/10' : 'bg-muted'}
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
                        setValue('customerMode', 'reactivate', {
                          shouldDirty: true,
                        })
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
                          <div className="text-sm font-bold">إعادة تفعيل عميل غير نشط</div>

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
                      <Label>اختر العميل غير النشط</Label>

                      <div className="relative mt-2">
                        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <select
                          value={customerId}
                          onChange={(e) => handleInactiveCustomer(e.target.value)}
                          className={cn(
                            'h-11 w-full appearance-none rounded-xl border border-border bg-background pr-10 pl-4 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring',
                            errors.customerId &&
                              'border-error bg-error/10 text-error focus:ring-error',
                          )}
                        >
                          <option value="">اختر العميل...</option>

                          {inactiveCustomers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.nameAr} — {customer.code}
                            </option>
                          ))}
                        </select>
                      </div>

                      {errors.customerId && <ErrorText>{errors.customerId.message}</ErrorText>}

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

                <CardContent className="space-y-5">
                  {/* Compact customer type selector */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4"
                    data-validation-anchor={errors.customerTypeId ? 'true' : undefined}
                  >
                    <Label>
                      نوع العميل <span className="mr-1 text-red-500">*</span>
                    </Label>
                    <input
                      type="hidden"
                      {...register('customerTypeId', {
                        required: 'نوع العميل مطلوب',
                        validate: (value) => value === 1 || value === 2 || 'نوع العميل مطلوب',
                      })}
                    />
                    <div
                      className="flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs"
                      role="group"
                      aria-label="نوع العميل"
                    >
                      {[
                        { value: 1, label: 'صيدلي' },
                        { value: 2, label: 'تجاري' },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          aria-pressed={customerTypeId === item.value}
                          onClick={() =>
                            setValue('customerTypeId', item.value, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            })
                          }
                          className={cn(
                            'rounded-md px-3 py-1.5 transition-colors',
                            customerTypeId === item.value
                              ? 'bg-background font-semibold text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    {errors.customerTypeId?.message && (
                      <div className="w-full">
                        <ErrorText>{String(errors.customerTypeId.message)}</ErrorText>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <FormField
                      label={
                        <>
                          اسم العميل بالعربية
                          <span className="mr-1 text-red-500">*</span>
                        </>
                      }
                      registration={register('customerNameAr', {
                        required: 'اسم العميل بالعربية مطلوب',

                        minLength: {
                          value: 2,
                          message: 'اسم العميل قصير جدًا',
                        },

                        pattern: {
                          value: /^[\u0621-\u064A\u064B-\u065F\u0670\s]+$/,
                          message: 'اسم العميل يجب أن يحتوي على حروف عربية فقط',
                        },

                        validate: (value) =>
                          value.trim().length >= 2 || 'اسم العميل يجب أن يحتوي على حرفين على الأقل',
                      })}
                      placeholder="مثال: صيدلية الأمل"
                      error={errors.customerNameAr?.message}
                    />

                    <FormField
                      label="اسم العميل بالإنجليزية"
                      registration={register('customerNameEn')}
                      placeholder="Example: Al Aml Pharmacy"
                    />

                    <div>
                      <Label>
                        كود العميل
                        <span className="mr-1 text-red-500">*</span>
                      </Label>

                      <div className="relative mt-2">
                        <Input
                          {...register('customerCode', {
                            required: 'كود العميل مطلوب',
                          })}
                          readOnly
                          placeholder="PH-0098"
                          variant={errors.customerCode ? 'failure' : 'default'}
                          aria-invalid={Boolean(errors.customerCode)}
                          className="h-11 cursor-not-allowed rounded-xl bg-muted pr-10"
                        />

                        {customerMode === 'new' && (
                          <button
                            type="button"
                            onClick={() =>
                              setValue('customerCode', generateCustomerCode(), {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            title="توليد كود جديد"
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {customerMode === 'new'
                          ? 'يتم توليد الكود تلقائياً، ويمكنك إعادة توليده.'
                          : 'كود العميل المحدد محفوظ كما هو.'}
                      </p>

                      {errors.customerCode?.message && (
                        <ErrorText>{String(errors.customerCode.message)}</ErrorText>
                      )}
                    </div>

                    <SelectField
                      label={
                        <>
                          هيكل العميل
                          <span className="mr-1 text-red-500">*</span>
                        </>
                      }
                      registration={register('structure', {
                        required: 'هيكل العميل مطلوب',
                      })}
                      options={[
                        ['SINGLE', 'فرع واحد'],
                        ['CHAIN', 'سلسلة'],
                      ]}
                      error={errors.structure?.message}
                    />

                    <SelectField
                      label={
                        <>
                          الفرع
                          <span className="mr-1 text-red-500">*</span>
                        </>
                      }
                      registration={register('zoneId', {
                        required: 'المنطقة مطلوبة',
                        valueAsNumber: true,
                      })}
                      options={zones.map((zone) => [zone.id, zone.name_ar])}
                      error={errors.zoneId?.message}
                    />

                    <FormField
                      label={
                        <>
                          رقم الترخيص
                          <span className="mr-1 text-red-500">*</span>
                        </>
                      }
                      registration={register('licenseNumber', {
                        required: 'رقم الترخيص مطلوب',
                      })}
                      placeholder="LIC-45879"
                      error={errors.licenseNumber?.message}
                    />

                    <div>
                      <Label htmlFor="taxNumber">
                        الرقم الضريبي
                        <span className="mr-1 text-red-500">*</span>
                      </Label>

                      <Controller
                        control={control}
                        name="taxNumber"
                        rules={{
                          required: 'الرقم الضريبي مطلوب',
                          validate: (value) =>
                            value.replace(/\D/g, '').length === 9 ||
                            'أدخل الرقم الضريبي المكوّن من 9 أرقام',
                        }}
                        render={({ field, fieldState }) => (
                          <InputOTP
                            id="taxNumber"
                            dir="ltr"
                            maxLength={9}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            aria-label="الرقم الضريبي"
                            value={String(field.value || '')
                              .replace(/\D/g, '')
                              .slice(0, 9)}
                            onBlur={field.onBlur}
                            onChange={(value) => {
                              field.onChange(value.replace(/\D/g, '').slice(0, 9));
                            }}
                            onComplete={(value) => field.onChange(value.replace(/\D/g, ''))}
                            containerClassName="mt-2 w-full justify-end"
                          >
                            <InputOTPGroup
                              dir="ltr"
                              className="grid w-full max-w-[28rem] grid-cols-9 gap-1.5 sm:gap-2"
                            >
                              {Array.from({ length: 9 }, (_, index) => (
                                <InputOTPSlot
                                  key={index}
                                  index={index}
                                  className={cn(
                                    'h-10 w-full min-w-0 rounded-xl border border-input bg-background text-sm shadow-sm first:rounded-xl last:rounded-xl sm:h-11 sm:text-base',
                                    fieldState.error && 'border-error bg-error/10 text-error',
                                  )}
                                />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        )}
                      />

                      <p className="mt-1.5 text-xs text-muted-foreground">
                        أدخل الرقم الضريبي المكوّن من 9 أرقام.
                      </p>

                      {errors.taxNumber?.message && (
                        <ErrorText>{String(errors.taxNumber.message)}</ErrorText>
                      )}
                    </div>
                    <FormField
                      label={
                        <>
                          السجل التجاري
                          <span className="mr-1 text-red-500">*</span>
                        </>
                      }
                      registration={register('registrationNumber', {
                        required: 'رقم السجل التجاري مطلوب',
                      })}
                      placeholder="REG-78210"
                      error={errors.registrationNumber?.message}
                    />
                  </div>
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
                        أضف مستندات العميل مثل السجل التجاري والرخصة بصيغة PDF أو JPG أو JPEG أو
                        PNG.
                      </p>
                    </div>

                    {/* <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={openDocumentPicker}
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة مستند
                    </Button> */}

                    <input
                      ref={addDocumentInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleDocumentUpload}
                    />

                    <input
                      ref={replaceDocumentInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleDocumentReplace}
                    />
                  </div>
                </CardHeader>

                <CardContent>
                  {documentFields.length > 0 ? (
                    <div className="space-y-3">
                      {documentFields.map((document: any, index: number) => (
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
                              <div className="truncate text-sm font-semibold">{document.name}</div>

                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span>{document.type || 'ملف'}</span>

                                {document.size > 0 && (
                                  <>
                                    <span>•</span>

                                    <span>{formatFileSize(document.size)}</span>
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
                              onClick={() => openReplacePicker(index)}
                            >
                              <Upload className="ml-2 h-4 w-4" />
                              استبدال
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="rounded-xl text-destructive hover:bg-destructive/10"
                              onClick={() => removeDocument(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
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

                      <p className="text-sm font-semibold">لا توجد مستندات</p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        يمكنك رفع PDF أو JPG أو JPEG أو PNG
                      </p>

                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4 rounded-xl"
                        onClick={openDocumentPicker}
                      >
                        <Upload className="ml-2 h-4 w-4" />
                        رفع مستند
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                    الملفات المسموح بها: PDF, JPG, JPEG, PNG — بحد أقصى 5 ميجابايت لكل ملف
                  </div>
                </CardContent>
              </Card>

              {/* Facility Address */}

              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      عنوان المنشأة
                    </CardTitle>

                    <p className="mt-1 text-xs text-muted-foreground">
                      اختر المحافظة ثم المركز أو القسم ثم الحي أو الشياخة. يتم حفظ المعرّفات الرسمية
                      فقط في العقد.
                    </p>
                  </div>
                </CardHeader>

                <CardContent>
                  {geographyError && (
                    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-error/40 bg-error/10 p-3 text-sm text-error sm:flex-row sm:items-center sm:justify-between">
                      <span>{geographyError}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setGeographyRefresh((value) => value + 1)}
                        className="border-error text-error hover:bg-error/10 hover:text-error"
                      >
                        <RefreshCw className="me-2 h-4 w-4" />
                        إعادة المحاولة
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <Label>
                        المحافظة
                        <span className="mr-1 text-red-500">*</span>
                      </Label>
                      <select
                        {...register('address.governorateId', {
                          required: 'المحافظة مطلوبة',
                          onChange: () => {
                            setDistricts([]);
                            setShiyakhas([]);
                            setValue('address.districtId', '', {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                            setValue('address.shiyakhaId', '', {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          },
                        })}
                        disabled={isGeographyLoading || Boolean(geographyError)}
                        aria-invalid={Boolean(errors.address?.governorateId)}
                        className={cn(
                          'mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-muted',
                          errors.address?.governorateId &&
                            'border-error bg-error/10 text-error focus:ring-error',
                        )}
                      >
                        <option value="">
                          {isGeographyLoading ? 'جارٍ تحميل المحافظات...' : 'اختر المحافظة'}
                        </option>
                        {governorates.map((governorate) => (
                          <option key={governorate.id} value={governorate.id}>
                            {governorate.nameAr} — {governorate.nameEn}
                          </option>
                        ))}
                      </select>
                      {errors.address?.governorateId?.message && (
                        <ErrorText>{errors.address.governorateId.message}</ErrorText>
                      )}
                    </div>

                    <div>
                      <Label>
                        المركز / القسم
                        <span className="mr-1 text-red-500">*</span>
                      </Label>
                      <select
                        {...register('address.districtId', {
                          required: 'المركز أو القسم مطلوب',
                          onChange: () => {
                            setShiyakhas([]);
                            setValue('address.shiyakhaId', '', {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          },
                        })}
                        disabled={!governorateId || isGeographyLoading || Boolean(geographyError)}
                        aria-invalid={Boolean(errors.address?.districtId)}
                        className={cn(
                          'mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-muted',
                          errors.address?.districtId &&
                            'border-error bg-error/10 text-error focus:ring-error',
                        )}
                      >
                        <option value="">
                          {governorateId ? 'اختر المركز أو القسم' : 'اختر المحافظة أولاً'}
                        </option>
                        {districts.map((district) => (
                          <option key={district.id} value={district.id}>
                            {district.nameAr} — {district.nameEn}
                          </option>
                        ))}
                      </select>
                      {errors.address?.districtId?.message && (
                        <ErrorText>{errors.address.districtId.message}</ErrorText>
                      )}
                    </div>

                    <div>
                      <Label>
                        الحي / الشياخة
                        {shiyakhas.length > 0 && <span className="mr-1 text-red-500">*</span>}
                      </Label>
                      <select
                        {...register('address.shiyakhaId', {
                          validate: (value) =>
                            shiyakhas.length === 0 || Boolean(value) || 'الحي أو الشياخة مطلوب',
                        })}
                        disabled={
                          !districtId ||
                          isGeographyLoading ||
                          Boolean(geographyError) ||
                          shiyakhas.length === 0
                        }
                        aria-invalid={Boolean(errors.address?.shiyakhaId)}
                        className={cn(
                          'mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-muted',
                          errors.address?.shiyakhaId &&
                            'border-error bg-error/10 text-error focus:ring-error',
                        )}
                      >
                        <option value="">
                          {!districtId
                            ? 'اختر المركز أو القسم أولاً'
                            : shiyakhas.length === 0
                              ? 'لا توجد شياخات مسجلة'
                              : 'اختر الحي أو الشياخة'}
                        </option>
                        {shiyakhas.map((shiyakha) => (
                          <option key={shiyakha.id} value={shiyakha.id}>
                            {shiyakha.nameAr} — {shiyakha.nameEn}
                          </option>
                        ))}
                      </select>
                      {errors.address?.shiyakhaId?.message && (
                        <ErrorText>{errors.address.shiyakhaId.message}</ErrorText>
                      )}
                    </div>

                    <FormField
                      label={
                        <>
                          الشارع
                          <span className="mr-1 text-red-500">*</span>
                        </>
                      }
                      registration={register('address.street', {
                        required: 'الشارع مطلوب',
                      })}
                      placeholder="شارع التحرير"
                      error={errors.address?.street?.message}
                    />

                    <FormField
                      label={
                        <>
                          رقم المبنى
                          <span className="mr-1 text-red-500">*</span>
                        </>
                      }
                      registration={register('address.buildingNumber', {
                        required: 'رقم المبنى مطلوب',
                      })}
                      placeholder="25"
                      error={errors.address?.buildingNumber?.message}
                    />

                    <FormField
                      label="رمز الموقع العالمي (GLN)"
                      registration={register('address.glnCode')}
                      placeholder="22828317"
                      error={errors.address?.glnCode?.message}
                    />
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    مصدر التقسيمات: قاعدة بيانات النظام
                  </p>
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
                  {contactFields.map((contact: any, contactIndex: number) => {
                    const contactError = (errors as any).contacts?.[contactIndex];

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
                              <span className="text-sm font-bold">{contactIndex + 1}</span>
                            </div>

                            <div>
                              <div className="text-sm font-semibold">
                                جهة الاتصال {contactIndex + 1}
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
                              onClick={() => removeContact(contactIndex)}
                            >
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <SelectField
                            label={
                              <>
                                نوع جهات الاتصال
                                <span className="mr-1 text-red-500">*</span>
                              </>
                            }
                            registration={register(`contacts.${contactIndex}.type`, {
                              required: 'نوع جهة الاتصال مطلوب',
                            })}
                            options={[
                              ['OWNER', 'مالك'],
                              ['MANAGER', 'مدير'],
                              ['EMPLOYEE', 'موظف'],
                            ]}
                            error={contactError?.type?.message}
                          />

                          <FormField
                            label={
                              <>
                                الاسم باللغة العربية
                                <span className="mr-1 text-red-500">*</span>
                              </>
                            }
                            registration={register(`contacts.${contactIndex}.nameAr`, {
                              required: 'اسم جهة الاتصال مطلوب',
                            })}
                            placeholder="الاسم بالعربية"
                            error={contactError?.nameAr?.message}
                          />

                          <FormField
                            label="الاسم بالإنجليزية"
                            registration={register(`contacts.${contactIndex}.nameEn`)}
                            placeholder="English name"
                          />

                          <FormField
                            label={
                              <>
                                الرقم القومي
                                <span className="mr-1 text-red-500">*</span>
                              </>
                            }
                            registration={register(`contacts.${contactIndex}.nationalId`, {
                              required: 'الرقم القومي مطلوب',
                              pattern: {
                                value: /^\d{14}$/,
                                message: 'الرقم القومي يجب أن يكون 14 رقمًا',
                              },
                            })}
                            placeholder="29501023201952"
                            maxLength={14}
                            inputMode="numeric"
                            onInput={(e: React.FormEvent<HTMLInputElement>) => {
                              e.currentTarget.value = e.currentTarget.value
                                .replace(/\D/g, '')
                                .slice(0, 14);
                            }}
                            error={contactError?.nationalId?.message}
                          />

                          <FormField
                            label="البريد الإلكتروني"
                            registration={register(`contacts.${contactIndex}.email`, {
                              validate: (value) =>
                                !value ||
                                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
                                'البريد الإلكتروني غير صحيح',
                            })}
                            type="email"
                            placeholder="name@example.com"
                            error={contactError?.email?.message}
                          />
                        </div>

                        <ContactPhones
                          control={control}
                          register={register}
                          contactIndex={contactIndex}
                          governorate={selectedGovernorate?.nameAr || ''}
                          errors={errors}
                        />
                      </div>
                    );
                  })}
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
                    <Label>تاريخ العقد</Label>

                    <div className="relative mt-2">
                      <CalendarDays className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        type="date"
                        {...register('contractDate')}
                        readOnly
                        className="h-11 rounded-xl pr-10"
                      />
                    </div>
                  </div>

                  {/* Contract Number */}

                  {/* <FormField
                    label={
                      <>
                        رقم العقد
                        <span className="mr-1 text-red-500">*</span>
                      </>
                    }
                    registration={register('contractNumber', {
                      required: 'رقم العقد مطلوب',
                    })}
                    error={errors.contractNumber?.message}
                  /> */}

                  {/* Branch */}

                  {/* <SelectField
                    label={
                      <>
                        الفرع التابع للعميل
                        <span className="mr-1 text-red-500">*</span>
                      </>
                    }
                    registration={register('branchId', {
                      required: 'يجب اختيار الفرع',

                      // The selected branch must still exist in step 1's branches
                      validate: (value) =>
                        !!getValues('branches')?.[Number(value)] ||
                        'الفرع المختار غير موجود، يرجى اختيار الفرع مرة أخرى',
                    })}
                    options={[
                      ['', 'اختر الفرع'],

                      ...branches.map((branch: any, index: number) => [
                        String(index),
                        `الفرع ${index + 1} — ${branch.city || 'مدينة غير محددة'}${
                          branch.glnCode ? ` — ${branch.glnCode}` : ''
                        }`,
                      ]),
                    ]}
                    error={errors.branchId?.message}
                  /> */}

                  <SelectField
                    label={
                      <>
                        اسم البرنامج
                        <span className="mr-1 text-red-500">*</span>
                      </>
                    }
                    registration={register('programId', {
                      required: 'يجب اختيار البرنامج',
                      valueAsNumber: true,
                    })}
                    options={[
                      ['', 'اختر البرنامج'],
                      ...programs.map((program: any) => [String(program.id), program.name_en]),
                    ]}
                    error={errors.programId?.message}
                  />

                  {/* Plan */}

                  <div>
                    <Label>
                      العرض
                      <span className="mr-1 text-red-500">*</span>
                    </Label>

                    <select
                      {...register('contractType', {
                        required: 'نوع الخطة مطلوب',
                        onChange: (event) => {
                          handleContractTypeChange(event.target.value);
                        },
                      })}
                      aria-invalid={Boolean(errors.contractType)}
                      className={cn(
                        'mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring',
                        errors.contractType &&
                          'border-error bg-error/10 text-error focus:ring-error',
                      )}
                    >
                      <option value="">اختر نوع الخطة</option>

                      <option value="REGULAR">عادي — حتى 12 شهر بدون خصم</option>

                      <option value="SIX_MONTHS">6 أشهر — خصم 50% اشتراك، 40% رسوم الانضمام</option>
                    </select>

                    {errors.contractType && (
                      <ErrorText>{String(errors.contractType.message)}</ErrorText>
                    )}
                  </div>

                  <SelectField
                    label="نوع التعاقد"
                    registration={register('planId', {
                      required: 'يجب اختيار نوع التعاقد',
                      valueAsNumber: true,
                    })}
                    options={[
                      ['', 'اختار نوع التعاقد'],
                      ...plans.map((plan: any) => [
                        String(plan.id),
                        `${plan.name} — ${plan.price} جنيه شهريًا`,
                      ]),
                    ]}
                    error={errors.planId?.message}
                  />

                  {/* Responsible Representative */}
                  <div className="rounded-xl border border-border bg-card p-4 md:col-span-2 lg:col-span-1">
                    <Label className="text-sm font-medium">المندوب</Label>
                    <Input
                      value={currentUserName}
                      readOnly
                      className="mt-2 h-11 cursor-not-allowed bg-muted"
                    />
                    <input type="hidden" {...register('representativeId')} />
                    <p className="mt-2 text-xs text-muted-foreground">
                      يتم تعيين المندوب المسؤول تلقائياً من المستخدم المسجل دخوله.
                    </p>
                  </div>
                  {/* Participant */}

                  <div className="rounded-xl border border-border bg-card p-4 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <Label className="text-sm font-medium">يوجد مشارك في العقد؟</Label>

                        <p className="mt-1 text-xs text-muted-foreground">
                          يمكنك إضافة مستخدم آخر كمشارك في هذا العقد.
                        </p>
                      </div>

                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          {...register('hasParticipant', {
                            onChange: (event) => {
                              if (!event.target.checked) {
                                setValue('participantId', '');
                              }
                            },
                          })}
                          className="h-4 w-4 rounded border-border"
                        />

                        <span className="text-sm">مشارك</span>
                      </label>
                    </div>

                    {hasParticipant && (
                      <div className="mt-4">
                        <Label>المشارك</Label>

                        <Popover open={participantOpen} onOpenChange={setParticipantOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              aria-expanded={participantOpen}
                              className={cn(
                                'mt-2 h-11 w-full justify-between rounded-xl font-normal',
                                errors.participantId &&
                                  'border-error text-error hover:bg-error/10 hover:text-error',
                              )}
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
                                  {selectedParticipant?.name || 'اختر المشارك'}
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
                                <CommandEmpty>لا يوجد مستخدم بهذا الاسم</CommandEmpty>

                                <CommandGroup heading="المستخدمون">
                                  {users.map((user) => (
                                    <CommandItem
                                      key={user.id}
                                      value={`${user.name} ${user.nameAr}`}
                                      onSelect={() => {
                                        setValue('participantId', String(user.id), {
                                          shouldValidate: true,
                                          shouldDirty: true,
                                        });

                                        setParticipantOpen(false);
                                      }}
                                    >
                                      <UserRound className="mr-2 h-4 w-4 text-muted-foreground" />

                                      <span>
                                        {user.nameAr} — {user.name}
                                      </span>

                                      <Check
                                        className={`mr-auto h-4 w-4 ${
                                          String(participantId) === String(user.id)
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        }`}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {errors.participantId && (
                          <ErrorText>{errors.participantId.message}</ErrorText>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Next Due Date */}

                  {/* <div>
                    <Label>تاريخ استحقاق الاشتراك القادم</Label>

                    <div className="relative mt-2">
                      <CalendarDays className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        type="date"
                        {...register('nextDueDate', {
                          required: 'تاريخ الاستحقاق مطلوب',

                          // Must be later than the latest selected month.
                          // If no month is selected, any date is accepted.
                          validate: (value) => {
                            const months = getValues('selectedMonths') || [];

                            if (months.length === 0) {
                              return true;
                            }

                            const latest = months.reduce((max: any, month: any) =>
                              month.value > max.value ? month : max,
                            );

                            return (
                              value > latest.value ||
                              `يجب أن يكون تاريخ الاستحقاق بعد آخر شهر تم اختياره (${latest.value})`
                            );
                          },
                        })}
                        className="h-11 rounded-xl pr-10"
                      />
                    </div>

                    {latestSelectedMonth && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        يجب أن يكون التاريخ بعد {latestSelectedMonth.label} (
                        {latestSelectedMonth.value})
                      </p>
                    )}

                    {errors.nextDueDate && <ErrorText>{errors.nextDueDate.message}</ErrorText>}
                  </div> */}

                  {/* Installation */}

                  <div>
                    <Label>تاريخ التركيب</Label>

                    <div className="relative mt-2">
                      <Wrench className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        type="date"
                        {...register('installationDate')}
                        className="h-11 rounded-xl pr-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional units and replication services */}
              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Wrench className="h-5 w-5 text-muted-foreground" />
                        الوحدات الإضافية وخدمات النسخ
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        رسوم اشتراك الوحدات الإضافية الشهرية إلزامية، أما الوحدات وخدمات النسخ أدناه فهي اختيارية وتُحسب مرة واحدة.
                      </p>
                    </div>
                    <Badge variant="secondary" className="w-fit rounded-full">
                      {additionalServiceFields.length} عناصر اختيارية
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {isServicesLoading ? (
                    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center text-sm text-muted-foreground">
                      جارٍ تحميل كتالوج الخدمات...
                    </div>
                  ) : servicesError ? (
                    <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive sm:flex-row">
                      <span>{servicesError}</span>
                      <Button type="button" size="sm" variant="outline" onClick={() => setServicesRefresh((value) => value + 1)}>
                        <RefreshCw className="ml-2 h-4 w-4" /> إعادة المحاولة
                      </Button>
                    </div>
                  ) : (
                    <Tabs defaultValue="additional-units" dir="rtl">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="additional-units">الوحدات الإضافية</TabsTrigger>
                        <TabsTrigger value="replication">خدمات النسخ</TabsTrigger>
                      </TabsList>

                      <TabsContent value="additional-units" className="space-y-4 pt-3">
                        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                          <div>
                            <p className="font-semibold">اشتراك الوحدات الإضافية الشهري (إلزامي)</p>
                            <p className="mt-1 text-xs text-muted-foreground">يُضاف مرة واحدة لكل شهر، حتى عند عدم اختيار أي وحدة إضافية.</p>
                          </div>
                          <span className="font-bold">{additionalUnitSubscription.toLocaleString('ar-EG')} جنيه/شهر</span>
                        </div>
                        {additionalUnitService ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addAdditionalService(additionalUnitService)}
                            className={cn(
                              'h-auto min-h-24 w-full justify-between rounded-xl border p-4 text-right hover:bg-accent',
                              additionalServiceFields.some((item: any) => Number(item.serviceId) === additionalUnitService.id) && 'border-primary bg-primary/5',
                            )}
                          >
                            <span className="text-right">
                              <span className="block font-semibold">{additionalUnitService.nameAr}</span>
                              <span className="mt-1 block text-xs font-normal text-muted-foreground">سعر الوحدة {additionalUnitService.price.toLocaleString('ar-EG')} جنيه · رسوم لمرة واحدة</span>
                            </span>
                            <Plus className="h-4 w-4 shrink-0" />
                          </Button>
                        ) : (
                          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">لا توجد خدمة وحدات إضافية مهيأة في الكتالوج.</p>
                        )}
                        {additionalServiceFields.map((field: any, index: number) => {
                          const service = availableServices.find((item) => item.id === Number(field.serviceId));
                          if (!service || service.code !== 'ADDITIONAL_UNIT') return null;
                          const quantity = Math.max(Number(selectedAdditionalServices[index]?.quantity) || 1, 1);
                          return (
                            <div key={field.id} className="grid grid-cols-1 items-end gap-3 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-[minmax(0,1fr)_130px_150px_auto]">
                              <input type="hidden" {...register(`additionalServices.${index}.serviceId`, { valueAsNumber: true })} />
                              <div><p className="font-semibold">{service.nameAr}</p><p className="mt-1 text-xs text-muted-foreground">سعر الوحدة {service.price.toLocaleString('ar-EG')} جنيه</p></div>
                              <div><Label>الكمية</Label><Input type="number" min="1" step="1" {...register(`additionalServices.${index}.quantity`, { valueAsNumber: true, min: { value: 1, message: 'الكمية يجب أن تكون 1 على الأقل' } })} className="mt-2 h-11 rounded-xl" /></div>
                              <div><Label>إجمالي لمرة واحدة</Label><div className="mt-2 flex h-11 items-center rounded-xl border border-input bg-background px-3 text-sm font-semibold">{(service.price * quantity).toLocaleString('ar-EG')} جنيه</div></div>
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeAdditionalService(index)} className="h-11 w-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive" title="حذف الوحدة"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          );
                        })}
                      </TabsContent>

                      <TabsContent value="replication" className="space-y-4 pt-3">
                        {replicationServices.length === 0 ? (
                          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">لا توجد خدمات نسخ متاحة حالياً.</p>
                        ) : (
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {replicationServices.map((service) => (
                              <Button key={service.id} type="button" variant="outline" onClick={() => addAdditionalService(service)} className={cn('h-auto min-h-24 justify-between rounded-xl border p-4 text-right hover:bg-accent', additionalServiceFields.some((item: any) => Number(item.serviceId) === service.id) && 'border-primary bg-primary/5')}>
                                <span className="text-right"><span className="block font-semibold">{service.nameAr}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{service.nameEn} · {service.isQuantityBased ? 'حسب الكمية' : 'لمرة واحدة'}</span><span className="mt-2 block font-bold">{service.price.toLocaleString('ar-EG')} جنيه</span></span><Plus className="h-4 w-4 shrink-0" />
                              </Button>
                            ))}
                          </div>
                        )}
                        {additionalServiceFields.map((field: any, index: number) => {
                          const service = availableServices.find((item) => item.id === Number(field.serviceId));
                          if (!service || service.code === 'ADDITIONAL_UNIT') return null;
                          const quantity = Math.max(Number(selectedAdditionalServices[index]?.quantity) || 1, 1);
                          return (
                            <div key={field.id} className="grid grid-cols-1 items-end gap-3 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-[minmax(0,1fr)_130px_150px_auto]">
                              <input type="hidden" {...register(`additionalServices.${index}.serviceId`, { valueAsNumber: true })} />
                              <div><p className="font-semibold">{service.nameAr}</p><p className="mt-1 text-xs text-muted-foreground">{service.nameEn}</p></div>
                              <div>{service.isQuantityBased ? <><Label>الكمية</Label><Input type="number" min="1" step="1" {...register(`additionalServices.${index}.quantity`, { valueAsNumber: true, min: { value: 1, message: 'الكمية يجب أن تكون 1 على الأقل' } })} className="mt-2 h-11 rounded-xl" /></> : <><Label>الكمية</Label><div className="mt-2 flex h-11 items-center rounded-xl border border-input bg-muted/40 px-3 text-sm">خدمة واحدة</div></>}</div>
                              <div><Label>الإجمالي</Label><div className="mt-2 flex h-11 items-center rounded-xl border border-input bg-background px-3 text-sm font-semibold">{(service.price * quantity).toLocaleString('ar-EG')} جنيه</div></div>
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeAdditionalService(index)} className="h-11 w-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive" title="حذف الخدمة"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          );
                        })}
                      </TabsContent>
                    </Tabs>
                  )}

                  <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 text-sm">
                    <span className="text-muted-foreground">إجمالي الاختيارات لمرة واحدة</span>
                    <span className="font-bold">{additionalServicesTotal.toLocaleString('ar-EG')} جنيه</span>
                  </div>
                </CardContent>
              </Card>

              {/* Months */}

              <Card
                className={cn(
                  'border-border bg-card shadow-sm',
                  errors.selectedMonths && 'border-error',
                )}
                data-validation-anchor={errors.selectedMonths ? 'true' : undefined}
              >
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-base">الشهور المطلوب سدادها</CardTitle>

                      <p className="mt-1 text-xs text-muted-foreground">
                        اختر الشهور التي يريد العميل سدادها في التحصيل الحالي.
                      </p>

                      {currentContractTypeRule.requiresSelectedMonths && (
                        <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                          اختيار شهر واحد على الأقل مطلوب للاستفادة من العرض.
                        </p>
                      )}

                      {currentContractTypeRule.autoSelectConsecutive && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          اختر أحد أول شهرين ليتم تحديد كامل فترة العرض (
                          {currentContractTypeRule.maxMonths}
                          أشهر متتالية) تلقائيًا بدءًا من الشهر الحالي.
                        </p>
                      )}

                      {contractType === 'REGULAR' && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          يظهر الشهر الحالي والشهر التالي. مع كل اختيار يظهر الشهر التالي للحفاظ على
                          تسلسل الاشتراك.
                        </p>
                      )}

                      {contractType && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="rounded-full">
                            نوع العقد: {currentContractTypeRule.label}
                          </Badge>

                          <Badge variant="secondary" className="rounded-full">
                            الحد الأقصى: {currentContractTypeRule.maxMonths} شهر
                          </Badge>

                          <Badge variant="secondary" className="rounded-full">
                            خصم الاشتراك: {subscriptionDiscountPercentage}%
                          </Badge>

                          <Badge variant="secondary" className="rounded-full">
                            خصم رسوم الانضمام: {joiningFeeDiscountPercentage}%
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        {selectedMonths.length} / {currentContractTypeRule.maxMonths || 0} شهور
                      </Badge>

                      <Badge variant="outline" className="rounded-full">
                        {subscriptionPriceAfterDiscount.toLocaleString('ar-EG')} جنيه
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {visibleMonthOptions.map((month) => {
                      const checked = selectedMonths.some(
                        (item: any) => item.value === month.value,
                      );

                      const maxMonthsReached =
                        selectedMonths.length >= currentContractTypeRule.maxMonths;
                      const disabled =
                        !contractType ||
                        (currentContractTypeRule.autoSelectConsecutive && maxMonthsReached) ||
                        (!checked && maxMonthsReached);

                      return (
                        <label
                          key={month.value}
                          className={`
        flex items-center gap-3
        rounded-xl border p-3
        transition-all

        ${
          checked
            ? disabled
              ? 'cursor-default border-foreground bg-foreground text-background'
              : 'cursor-pointer border-foreground bg-foreground text-background'
            : disabled
              ? 'cursor-not-allowed border-border bg-muted/50 opacity-50'
              : 'cursor-pointer border-border bg-background hover:bg-accent'
        }
      `}
                        >
                          <Checkbox
                            checked={checked}
                            disabled={disabled}
                            onCheckedChange={() => toggleMonth(month)}
                          />

                          <span className="text-sm font-medium">{month.label}</span>
                        </label>
                      );
                    })}
                  </div>

                  {errors.selectedMonths && <ErrorText>{errors.selectedMonths.message}</ErrorText>}
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

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <MoneyCard label="رسوم الانضمام قبل الخصم" value={joiningFee} />

                      <MoneyCard label="رسوم الانضمام بعد الخصم" value={joiningFeeAfterDiscount} />

                      <MoneyCard label="الاشتراك الرئيسي الشهري" value={mainMonthlySubscription} subtitle="لكل شهر" />

                      <MoneyCard label="اشتراك الوحدات الإضافية الإلزامي" value={additionalUnitSubscription} subtitle="لكل شهر" />

                      <MoneyCard label="إجمالي الاشتراك الشهري قبل الخصم" value={monthlyRecurringSubscription} subtitle="لكل شهر" />

                      <MoneyCard label="خصم الاشتراك" value={subscriptionDiscount} subtitle={`${subscriptionDiscountPercentage}% · الأشهر المختارة`} />

                      <MoneyCard
                        label="إجمالي الاشتراكات قبل الخصم"
                        value={monthlySubscription}
                        subtitle={`${selectedMonths.length} شهور`}
                      />

                      <MoneyCard
                        label="إجمالي الاشتراكات بعد الخصم"
                        value={subscriptionFeeAfterDiscount}
                        subtitle={`${selectedMonths.length} شهور · ${Number((monthlyRecurringSubscription * (1 - subscriptionDiscountPercentage / 100)).toFixed(2)).toLocaleString('ar-EG')} جنيه/شهر`}
                      />

                      <MoneyCard
                        label="الخدمات والأجهزة الإضافية"
                        value={additionalServicesTotal}
                        subtitle={`${selectedAdditionalServiceRows.length} عناصر`}
                      />

                      <MoneyCard label="الإجمالي قبل الخصم" value={totalBeforeDiscount} />

                      <MoneyCard label="الإجمالي بعد الخصم" value={totalContractValue} />
                    </div>

                    {/* Collection */}

                    <div>
                      <div className="mb-4">
                        <h3 className="text-sm font-bold">تسجيل مبلغ التحصيل</h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          أدخل المبلغ الذي تم تحصيله الآن وحدد وسيلة الدفع.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label>المبلغ المحصل الآن</Label>

                          <div className="relative mt-2">
                            <Input
                              type="number"
                              min="0.01"
                              max={totalContractValue}
                              step="0.01"
                              {...register('paymentAmount', {
                                valueAsNumber: true,
                                required: 'المبلغ المحصل مطلوب',

                                min: {
                                  value: 0.01,
                                  message: 'المبلغ المحصل يجب أن يكون أكبر من صفر',
                                },

                                validate: (value) =>
                                  Number(value || 0) <= totalContractValue ||
                                  'المبلغ المحصل لا يمكن أن يتجاوز إجمالي العقد',
                              })}
                              variant={errors.paymentAmount ? 'failure' : 'default'}
                              aria-invalid={Boolean(errors.paymentAmount)}
                              onInput={() => {
                                hasManuallyEditedPaymentAmount.current = true;
                              }}
                              className="h-12 rounded-xl pl-16 text-lg font-semibold"
                            />

                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              جنيه
                            </div>
                          </div>

                          {errors.paymentAmount && (
                            <ErrorText>{errors.paymentAmount.message}</ErrorText>
                          )}
                        </div>

                        <SelectField
                          label="طريقة الدفع"
                          registration={register('paymentMethodId', {
                            required: 'طريقة الدفع مطلوبة',
                            valueAsNumber: true,
                          })}
                          options={paymentMethods.map((method) => [
                            method.id,
                            method.nameAr ?? method.name_ar ?? method.code,
                          ])}
                          error={errors.paymentMethodId?.message}
                        />
                      </div>

                      {paymentMethodCode === 'BANK_TRANSFER' && (
                        <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-3">
                          <TextField label="تاريخ الحوالة" type="date" registration={register('paymentDetails.transferDate', { required: 'تاريخ الحوالة مطلوب' })} error={errors.paymentDetails?.transferDate?.message} />
                          <TextField label="اسم البنك" registration={register('paymentDetails.bankName', { required: 'اسم البنك مطلوب' })} error={errors.paymentDetails?.bankName?.message} placeholder="اسم البنك" />
                          <TextField label="الرقم المرجعي" registration={register('paymentDetails.referenceNumber', { required: 'الرقم المرجعي مطلوب' })} error={errors.paymentDetails?.referenceNumber?.message} placeholder="الرقم المرجعي" />
                        </div>
                      )}
                      {(paymentMethodCode === 'INSTAPAY' || paymentMethodCode === 'PAYSKY') && (
                        <div className="rounded-xl border border-border bg-muted/20 p-4"><TextField label="الرقم المرجعي" registration={register('paymentDetails.referenceNumber', { required: 'الرقم المرجعي مطلوب' })} error={errors.paymentDetails?.referenceNumber?.message} placeholder="الرقم المرجعي" /></div>
                      )}
                      {paymentMethodCode === 'CHEQUE' && (
                        <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-2"><TextField label="اسم البنك" registration={register('paymentDetails.bankName', { required: 'اسم البنك مطلوب' })} error={errors.paymentDetails?.bankName?.message} placeholder="اسم البنك" /><TextField label="رقم الشيك" registration={register('paymentDetails.chequeNumber', { required: 'رقم الشيك مطلوب' })} error={errors.paymentDetails?.chequeNumber?.message} placeholder="رقم الشيك" /></div>
                      )}
                      {paymentMethodCode === 'CASH' && (
                        <div className="rounded-xl border border-border bg-muted/20 p-4"><TextField label="رقم الإيصال" registration={register('paymentDetails.receiptNumber', { required: 'رقم الإيصال مطلوب' })} error={errors.paymentDetails?.receiptNumber?.message} placeholder="رقم الإيصال" /></div>
                      )}

                      {/* Payment Progress */}

                      <div className="mt-5 rounded-2xl bg-muted p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">نسبة السداد</span>

                          <span className="font-bold">{paidPercentage.toFixed(0)}%</span>
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
                              {paymentAmount.toLocaleString('ar-EG')} جنيه
                            </span>
                          </span>

                          <span className="text-muted-foreground">
                            متبقي:
                            <span className="mr-1 font-semibold text-amber-600 dark:text-amber-400">
                              {remainingAmount.toLocaleString('ar-EG')} جنيه
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Notes */}

                    <div>
                      <Label>ملاحظات العقد</Label>

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
                      <div className="text-xs opacity-70">نوع العملية</div>

                      <div className="mt-2 text-lg font-bold">{customerStatus}</div>

                      <div className="mt-4 flex items-center justify-between border-t border-background/10 pt-4">
                        <span className="text-xs opacity-70">الخطة</span>

                        <span className="text-sm font-semibold">{selectedPlan?.name || '—'}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <ReviewRow label="العميل" value={customerNameAr || '—'} />

                      <ReviewRow label="الكود" value={customerCode || '—'} />

                      <ReviewRow
                        label="نوع العميل"
                        value={
                          customerTypeId === 1 ? 'صيدلي' : customerTypeId === 2 ? 'تجاري' : '—'
                        }
                      />

                      <ReviewRow
                        label="هيكل العميل"
                        value={
                          structure === 'CHAIN'
                            ? 'سلسلة'
                            : structure === 'SINGLE'
                              ? 'فرع واحد'
                              : '—'
                        }
                      />

                      <ReviewRow
                        label="الفرع"
                        value={
                          selectedZone
                            ? `فرع ${selectedZone.name_ar || 'مدينة غير محددة'}`
                            : 'لم يتم الاختيار'
                        }
                      />

                      <ReviewRow label="المندوب المسؤول" value={currentUserName} />

                      <ReviewRow
                        label="المشارك"
                        value={
                          hasParticipant
                            ? selectedParticipant?.nameAr || 'لم يتم الاختيار'
                            : 'لا يوجد'
                        }
                      />

                      <ReviewRow label="عدد جهات الاتصال" value={`${contactFields.length}`} />

                      <ReviewRow label="المستندات" value={`${documentFields.length}`} />

                      <ReviewRow label="الشهور المحددة" value={`${selectedMonths.length} شهور`} />

                      <Separator />

                      <ReviewRow
                        label="رسوم الانضمام قبل الخصم"
                        value={`${joiningFee.toLocaleString('ar-EG')} جنيه`}
                      />

                      <ReviewRow
                        label="رسوم الانضمام بعد الخصم"
                        value={`${joiningFeeAfterDiscount.toLocaleString('ar-EG')} جنيه`}
                      />

                      <ReviewRow
                        label="الاشتراك قبل الخصم"
                        value={`${monthlySubscription.toLocaleString('ar-EG')} جنيه`}
                      />

                      <ReviewRow
                        label="الاشتراك بعد الخصم"
                        value={`${subscriptionFeeAfterDiscount.toLocaleString('ar-EG')} جنيه`}
                      />

                      <ReviewRow
                        label="الخدمات والأجهزة الإضافية"
                        value={`${additionalServicesTotal.toLocaleString('ar-EG')} جنيه`}
                      />

                      <ReviewRow
                        label="الإجمالي قبل الخصم"
                        value={`${totalBeforeDiscount.toLocaleString('ar-EG')} جنيه`}
                      />

                      <ReviewRow
                        label="إجمالي خصومات العقد"
                        value={`${discountAmount.toLocaleString('ar-EG')} جنيه`}
                      />

                      <ReviewRow
                        label="الإجمالي بعد الخصم"
                        value={`${totalContractValue.toLocaleString('ar-EG')} جنيه`}
                      />

                      <ReviewRow
                        label="المحصل"
                        value={`${paymentAmount.toLocaleString('ar-EG')} جنيه`}
                      />

                      <ReviewRow
                        label="المتبقي"
                        value={`${remainingAmount.toLocaleString('ar-EG')} جنيه`}
                      />

                      <ReviewRow
                        label="طريقة الدفع"
                        value={
                          paymentMethodId
                            ? (() => {
                                const method = paymentMethods.find(
                                  (item) => Number(item.id) === Number(paymentMethodId),
                                );
                                return (
                                  method?.nameAr ?? method?.name_ar ?? method?.code ?? 'غير معروف'
                                );
                              })()
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
              <div className="text-xs text-muted-foreground">الخطوة {activeStep} من 2</div>

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
                    onClick={(e) => {
                      e.preventDefault();
                      handleNext();
                    }}
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
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال العقد'}

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

function ContactPhones({ control, register, contactIndex, governorate, errors }: any) {
  const {
    fields: phoneFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `contacts.${contactIndex}.phones`,
  });
  const phoneValues =
    useWatch({
      control,
      name: `contacts.${contactIndex}.phones`,
    }) || [];

  const mobilePhonePattern = /^(010|011|012|015)\d{8}$/;

  return (
    <div className="space-y-3">
      {phoneFields.map((phone: any, phoneIndex: number) => {
        const phoneType = phoneValues[phoneIndex]?.type || phone.type || 'محمول';
        const isLandline = phoneType === 'هاتف أرضي';
        const landlineCode = getLandlineTelephoneCode(governorate);
        const landlineNumberLength = landlineCode ? 10 - landlineCode.code.length : 8;
        const inputName = `contacts.${contactIndex}.phones.${phoneIndex}.number`;
        const fieldError = errors?.contacts?.[contactIndex]?.phones?.[phoneIndex]?.number;

        return (
          <div
            key={phone.id}
            className="rounded-xl border border-border bg-muted/20 p-3.5 shadow-sm"
          >
            <div className="grid grid-cols-12 gap-3 md:items-end">
              <div
                className={`col-span-12 sm:col-span-8 ${isLandline ? 'md:col-span-5' : 'md:col-span-4'}`}
              >
                <Label className="text-xs text-muted-foreground">
                  {isLandline ? 'رقم الهاتف الأرضي *' : 'رقم الهاتف *'}
                </Label>

                <div
                  className={isLandline ? 'mt-1 flex items-center gap-2' : ''}
                  dir={isLandline ? 'ltr' : undefined}
                >
                  {isLandline && (
                    <Input
                      value={landlineCode?.code || '—'}
                      readOnly
                      dir="ltr"
                      aria-label="كود المحافظة"
                      aria-invalid={Boolean(fieldError) || !landlineCode}
                      title={landlineCode ? `كود ${landlineCode.region}` : 'اختر المحافظة أولاً'}
                      variant={fieldError || !landlineCode ? 'failure' : 'default'}
                      className="h-11 w-14 shrink-0 rounded-xl bg-muted px-1 text-center font-mono font-semibold tracking-wide tabular-nums"
                    />
                  )}

                  <Input
                    {...register(inputName, {
                      required: 'رقم الهاتف مطلوب',

                      onChange: (e) => {
                        e.target.value = e.target.value
                          .replace(/\D/g, '')
                          .slice(0, isLandline ? landlineNumberLength : 11);
                      },

                      validate: (value: string) => {
                        const digits = String(value || '').replace(/\D/g, '');

                        if (isLandline) {
                          if (!landlineCode) {
                            return 'اختر المحافظة أولاً لتحديد كود الهاتف الأرضي';
                          }

                          return (
                            digits.length === landlineNumberLength ||
                            `رقم الهاتف الأرضي يجب أن يتكون من ${landlineNumberLength} أرقام بعد الكود`
                          );
                        }

                        return (
                          mobilePhonePattern.test(digits) ||
                          'رقم الهاتف يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقمًا'
                        );
                      },
                    })}
                    type="text"
                    maxLength={isLandline ? landlineNumberLength : 11}
                    placeholder={isLandline ? 'x'.repeat(landlineNumberLength) : '010xxxxxxxx'}
                    inputMode="numeric"
                    dir="ltr"
                    variant={fieldError ? 'failure' : 'default'}
                    aria-invalid={Boolean(fieldError)}
                    className={`h-11 rounded-xl text-left font-mono tracking-wide tabular-nums ${
                      isLandline ? 'min-w-0 flex-1' : 'mt-1 w-full'
                    }`}
                  />
                </div>

                {fieldError && (
                  <p className="mt-1 text-xs text-destructive">{fieldError.message}</p>
                )}
              </div>
              <div
                className={`col-span-12 sm:col-span-4 ${isLandline ? 'md:col-span-3' : 'md:col-span-4'}`}
              >
                <Label className="text-xs text-muted-foreground">النوع</Label>
                <select
                  {...register(`contacts.${contactIndex}.phones.${phoneIndex}.type`)}
                  className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm transition-shadow focus:ring-2 focus:ring-ring"
                >
                  <option value="محمول">محمول</option>
                  <option value="هاتف أرضي">هاتف أرضي</option>
                  <option value="واتساب">واتساب</option>
                </select>
              </div>

              <div
                className={`col-span-12 flex justify-start sm:justify-end ${isLandline ? 'md:col-span-1' : 'md:col-span-2'}`}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => remove(phoneIndex)}
                  disabled={phoneFields.length <= 1}
                  className="h-11 w-11 rounded-xl text-destructive hover:text-destructive"
                  title="حذف الرقم"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {phoneFields.length < 3 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ label: '', number: '', type: 'محمول' })}
          className="rounded-xl"
        >
          <Plus className="me-2 h-4 w-4" />
          إضافة رقم هاتف
        </Button>
      )}
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
  maxLength,
  inputMode,
  onInput,
}: any) {
  return (
    <div>
      <Label>{label}</Label>

      <Input
        type={type}
        variant={error ? 'failure' : 'default'}
        aria-invalid={Boolean(error)}
        {...registration}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        onInput={onInput}
        className="mt-2 h-11 rounded-xl"
      />

      {error && <ErrorText>{String(error)}</ErrorText>}
    </div>
  );
}
/* =========================================================
   SELECT
========================================================= */

function TextField({ label, registration, error, type = 'text', placeholder = '' }: any) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} {...registration} placeholder={placeholder} variant={error ? 'failure' : 'default'} aria-invalid={Boolean(error)} className="mt-2 h-11 rounded-xl" />
      {error && <ErrorText>{String(error)}</ErrorText>}
    </div>
  );
}
function SelectField({ label, registration, options, error }: any) {
  return (
    <div>
      <Label>{label}</Label>

      <select
        {...registration}
        aria-invalid={Boolean(error)}
        className={cn(
          'mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring',
          error && 'border-error bg-error/10 text-error focus:ring-error',
        )}
      >
        {options.map(([optionValue, optionLabel]: any) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>

      {error && <ErrorText>{String(error)}</ErrorText>}
    </div>
  );
}
/* =========================================================
   MONEY CARD
========================================================= */

function MoneyCard({ label, value, subtitle = 'جنيه' }: any) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>

      <div className="mt-2 text-xl font-bold">{Number(value || 0).toLocaleString('ar-EG')}</div>

      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </div>
  );
}

/* =========================================================
   REVIEW ROW
========================================================= */

function ReviewRow({ label, value }: any) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>

      <span className="max-w-[60%] truncate text-left font-semibold">{value}</span>
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorText({ children }: any) {
  return <p className="mt-1 text-xs font-medium text-destructive">{children}</p>;
}

/* =========================================================
   FILE SIZE
========================================================= */

function formatFileSize(bytes: number) {
  if (!bytes) {
    return '0 KB';
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

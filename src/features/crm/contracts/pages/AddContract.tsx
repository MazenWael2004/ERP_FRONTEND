import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { useLocation, useNavigate } from 'react-router';

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
  Pencil,
  Receipt,
  RefreshCw,
  Trash2,
  Upload,
  UserRound,
  Users,
  Wrench,
  ExternalLink,
  MapPinned,
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
import {
  fetchBanks,
  fetchContractTypes,
  fetchNextCustomerCode,
  fetchPaymentMethods,
} from '../api/contractService';

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
  type: 'SERVICE' | 'ADDITIONAL_SERVICE' | 'HARDWARE' | 'SUBSCRIPTION';
  code: string;
  nameEn: string;
  nameAr: string;
  joining_fee: number;
  subscription_fee: number;
  isSubscriptionBased: boolean;
  subscriptionClass: 'MAIN' | 'ADDITIONAL' | null;
  billingType: 'MONTHLY' | 'ONE_TIME';
  isQuantityBased: boolean;
};

type ContractTypeOffer = {
  id: number;
  code: string;
  name_ar: string;
  name_en: string;
  max_months: number;
  subscription_discount_percentage: number;
  joining_fee_discount_percentage: number;
  requires_selected_months: boolean | number;
  auto_select_consecutive: boolean | number;
};
export default function AddCustomerContract() {
  const isRtl = true;
  const { user } = useAuth();
  const currentUserName = user?.username || 'المستخدم الحالي';
  const installationDateMin = new Date().toISOString().split('T')[0];

  const [activeStep, setActiveStep] = useState(1);
  const [participantOpen, setParticipantOpen] = useState(false);
  const nav = useNavigate();
  const location = useLocation();
  const workflowCustomerEdit = location.state?.workflowCustomerEdit === true;
  const workflowContract = location.state?.contract;
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
  const [selectedAdditionalServiceId, setSelectedAdditionalServiceId] = useState('');
  const [contractTypes, setContractTypes] = useState<ContractTypeOffer[]>([]);
  const [isContractTypesLoading, setIsContractTypesLoading] = useState(true);
  const [contractTypesError, setContractTypesError] = useState('');
  const [zones, setZones] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [isBanksLoading, setIsBanksLoading] = useState(true);
  const [isCustomerCodePreviewLoading, setIsCustomerCodePreviewLoading] = useState(false);

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

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const response = await fetchBanks();
        setBanks(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Failed to fetch banks:', error);
      } finally {
        setIsBanksLoading(false);
      }
    };

    loadBanks();
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
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur',

    defaultValues: {
      customerMode: '',

      customerId: '',
      customerNameAr: '',
      customerCode: 'سيتم توليده تلقائياً',
      customerTypeId: null,
      structure: '',
      parentCustomerId: '',
      zoneId: '',
      licenseNumber: '',
      taxRegistrationType: 'TAX_NUMBER',
      taxNumber: '',
      taxExemptionNationalId: '',
      taxExemptionComment: '',
      registrationNumber: '',

      contractDate: new Date().toISOString().split('T')[0],
      branchId: '',
      contractNumber: '',
      programId: null,
      mainSubscriptionServiceId: null,
      contractType: '',

      hasParticipant: false,
      participantId: '',

      representativeId: user?.id ?? '',

      nextDueDate: '',
      installationDate: installationDateMin,
      notes: '',

      paymentAmount: 0,
      paymentMethodId: null,
      paymentDetails: {
        transferDate: '',
        bankId: '',
        bankName: '',
        referenceNumber: '',
        chequeNumber: '',
        chequeDueDate: '',
        transactionDate: '',
        receiptNumber: '',
      },
      initialPayments: [
        {
          amount: 0,
          paymentMethodId: null,
          paymentDetails: {
            transferDate: '',
            bankId: '',
            bankName: '',
            referenceNumber: '',
            chequeNumber: '',
            chequeDueDate: '',
            transactionDate: '',
            receiptNumber: '',
          },
        },
      ],
      addOnPayment: {
        amount: 0,
        paymentMethodId: null,
        collectionReason: 'إضافات العقد',
        notes: '',
        paymentDetails: {
          transferDate: '',
          bankId: '',
          bankName: '',
          referenceNumber: '',
          chequeNumber: '',
          chequeDueDate: '',
          transactionDate: '',
          receiptNumber: '',
        },
      },

      baseSubscriptionAmount: 0,

      // Each month is { label: 'نوفمبر 2026', value: '2026-11-01' }
      selectedMonths: [] as { label: string; value: string }[],

      documents: [],

      additionalServices: [] as { serviceId: number; quantity: number }[],
      hardwareDevices: [] as { serviceId: number; quantity: number }[],

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
            {
              number: '',
              type: 'هاتف أرضي',
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
        googleMapsUrl: '',
        latitude: '',
        longitude: '',
      },
    },
  });

  // Pricing starts async and changes with plan, offer, months, and add-ons. Keep the
  // suggested collection equal to the discounted total until the user edits it.
  const hasManuallyEditedInitialPayments = useRef(false);
  const hasManuallyEditedAddOnPaymentAmount = useRef(false);
  const isAdvancingToAddOnsRef = useRef(false);

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
  const {
    fields: hardwareDeviceFields,
    append: appendHardwareDevice,
    remove: removeHardwareDevice,
  } = useFieldArray({
    control,
    name: 'hardwareDevices',
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

  const addHardwareDevice = (device: SellableService) => {
    const selectedDevices = getValues('hardwareDevices') || [];
    const existingIndex = selectedDevices.findIndex(
      (item: any) => Number(item.serviceId) === device.id,
    );

    if (existingIndex >= 0) {
      if (device.isQuantityBased) {
        const quantity = Number(selectedDevices[existingIndex]?.quantity || 0) + 1;
        setValue(`hardwareDevices.${existingIndex}.quantity`, quantity, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      return;
    }

    appendHardwareDevice({ serviceId: device.id, quantity: 1 });
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
    if (customerMode !== 'new') {
      return;
    }

    let isActive = true;

    const loadNextCustomerCode = async () => {
      setIsCustomerCodePreviewLoading(true);

      try {
        const nextCode = await fetchNextCustomerCode();
        if (isActive && nextCode) {
          setValue('customerCode', nextCode, { shouldDirty: false, shouldValidate: false });
        }
      } catch {
        if (isActive) {
          setValue('customerCode', 'سيتم توليده تلقائياً', {
            shouldDirty: false,
            shouldValidate: false,
          });
        }
      } finally {
        if (isActive) {
          setIsCustomerCodePreviewLoading(false);
        }
      }
    };

    void loadNextCustomerCode();

    return () => {
      isActive = false;
    };
  }, [customerMode, setValue]);
  const customerNameAr = watch('customerNameAr');
  const customerCode = watch('customerCode');
  const customerTypeId = watch('customerTypeId');
  const taxRegistrationType = watch('taxRegistrationType');
  const structure = watch('structure');
  const parentCustomerId = watch('parentCustomerId');

  const [parentCustomers, setParentCustomers] = useState<any[]>([]);
  const [isParentCustomersLoading, setIsParentCustomersLoading] = useState(false);

  useEffect(() => {
    let isActive = true;
    const loadParentCustomers = async () => {
      setIsParentCustomersLoading(true);
      try {
        const response = await api.get('/customers', { params: { options: 'parent' } });
        if (isActive)
          setParentCustomers(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch {
        if (isActive) setParentCustomers([]);
      } finally {
        if (isActive) setIsParentCustomersLoading(false);
      }
    };
    void loadParentCustomers();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (structure !== 'CHAIN' && parentCustomerId) {
      setValue('parentCustomerId', '', { shouldDirty: true, shouldValidate: true });
    }
  }, [parentCustomerId, setValue, structure]);

  const parentCustomerOptions = parentCustomers;

  const mainSubscriptionServiceId = watch('mainSubscriptionServiceId');
  const contractType = watch('contractType');

  const participantId = watch('participantId');
  const hasParticipant = watch('hasParticipant');

  const branchId = watch('branchId');
  const zoneId = watch('zoneId');

  const governorateId = watch('address.governorateId');
  const districtId = watch('address.districtId');

  const selectedGovernorate = governorates.find((division) => division.id === governorateId);

  const selectedDistrict = districts.find((division) => division.id === districtId);
  const shiyakhaId = watch('address.shiyakhaId');
  const selectedShiyakha = shiyakhas.find((division) => division.id === shiyakhaId);

  const openGoogleMaps = () => {
    const address = getValues('address');
    const query = [
      address.buildingNumber,
      address.street,
      selectedShiyakha?.nameAr,
      selectedDistrict?.nameAr,
      selectedGovernorate?.nameAr,
      'Egypt',
    ]
      .filter(Boolean)
      .join(', ');

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || 'Egypt')}`,
      '_blank',
      'noopener,noreferrer',
    );
  };
  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();

    const loadDivisions = async () => {
      const fetchDivisions = async (url: string) => {
        const response = await api.get(url, { signal: abortController.signal });
        const divisions = response.data?.data;

        if (!Array.isArray(divisions)) {
          throw new Error('Invalid geography response.');
        }

        return divisions as EgyptAdministrativeDivision[];
      };

      // An edited workflow contract already has its full address. Fetch each
      // level so the saved governorate, district, and shiyakha can be shown.
      if (workflowCustomerEdit) {
        setIsGeographyLoading(true);
        setGeographyError('');

        try {
          const [loadedGovernorates, loadedDistricts, loadedShiyakhas] = await Promise.all([
            fetchDivisions('/geography/governorates'),
            governorateId
              ? fetchDivisions(`/geography/${governorateId}/children`)
              : Promise.resolve([]),
            districtId ? fetchDivisions(`/geography/${districtId}/children`) : Promise.resolve([]),
          ]);

          if (isActive) {
            setGovernorates(loadedGovernorates);
            setDistricts(loadedDistricts);
            setShiyakhas(loadedShiyakhas);
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
        return;
      }

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
  }, [districtId, geographyRefresh, governorateId, workflowCustomerEdit]);

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
              joining_fee: Number(service.joining_fee ?? 0),
              subscription_fee: Number(service.subscription_fee ?? 0),
              isSubscriptionBased: Boolean(service.isSubscriptionBased),
              subscriptionClass:
                service.subscriptionClass === 'MAIN' || service.subscriptionClass === 'ADDITIONAL'
                  ? service.subscriptionClass
                  : null,
              billingType: service.billingType === 'MONTHLY' ? 'MONTHLY' : 'ONE_TIME',
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

  useEffect(() => {
    let isActive = true;

    const loadContractTypes = async () => {
      setIsContractTypesLoading(true);
      setContractTypesError('');
      try {
        const records = await fetchContractTypes();
        if (!Array.isArray(records)) throw new Error('Invalid contract types response.');
        if (isActive) {
          setContractTypes(
            records.map((contractType: any) => ({
              ...contractType,
              id: Number(contractType.id),
              max_months: Number(contractType.max_months),
              subscription_discount_percentage: Number(
                contractType.subscription_discount_percentage ?? 0,
              ),
              joining_fee_discount_percentage: Number(
                contractType.joining_fee_discount_percentage ?? 0,
              ),
              requires_selected_months: Boolean(contractType.requires_selected_months),
              auto_select_consecutive: Boolean(contractType.auto_select_consecutive),
            })),
          );
        }
      } catch (error) {
        if (isActive)
          setContractTypesError('تعذر تحميل عروض التعاقد. تحقق من الاتصال ثم أعد المحاولة.');
      } finally {
        if (isActive) setIsContractTypesLoading(false);
      }
    };

    void loadContractTypes();
    return () => {
      isActive = false;
    };
  }, []);
  const addOnPaymentMethodId = watch('addOnPayment.paymentMethodId');

  const selectedMonths = watch('selectedMonths') || [];
  const selectedAdditionalServices =
    useWatch({
      control,
      name: 'additionalServices',
    }) || [];
  const selectedHardwareDevices =
    useWatch({
      control,
      name: 'hardwareDevices',
    }) || [];
  const contactValues = useWatch({ control, name: 'contacts' }) || [];

  const initialPayments = useWatch({ control, name: 'initialPayments' }) || [];
  const paymentAmount = initialPayments.reduce(
    (total: number, payment: any) => total + (Number(payment?.amount) || 0),
    0,
  );
  const addOnPaymentAmount = Number(watch('addOnPayment.amount') || 0);

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

  const inactiveCustomersForSelectedType = inactiveCustomers.filter((customer) =>
    customerTypeId === 1
      ? customer.type === 'PHARMACEUTICAL'
      : customerTypeId === 2
        ? customer.type === 'COMMERCIAL'
        : false,
  );

  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const mainSubscriptionServices = availableServices.filter(
    (service) =>
      service.type === 'SUBSCRIPTION' &&
      service.isSubscriptionBased &&
      service.billingType === 'MONTHLY' &&
      service.subscriptionClass === 'MAIN',
  );

  const joiningFeeService = availableServices.find((service) => service.code === 'JOINING_FEE');
  // At contract creation, only these two add-ons are selectable. Other
  // ADDITIONAL_SERVICE catalog items remain available for their dedicated
  // request/workflow screens and must not appear in this picker.
  const contractAdditionalServiceCodes = new Set(['ADDITIONAL_UNIT', 'REPLICATION_SERVICE']);
  const additionalServicesCatalog = availableServices.filter(
    (service) =>
      service.type === 'ADDITIONAL_SERVICE' &&
      service.billingType === 'ONE_TIME' &&
      !service.isSubscriptionBased &&
      contractAdditionalServiceCodes.has(service.code),
  );
  // Retained for the legacy markup below while the catalog-driven selector is active.
  const additionalUnitService = additionalServicesCatalog.find(
    (service) => service.code === 'ADDITIONAL_UNIT',
  );
  const additionalServiceOptions = additionalServicesCatalog.filter(
    (service) => service.code !== 'ADDITIONAL_UNIT',
  );
  const selectedAdditionalServiceIds = new Set(
    additionalServiceFields.map((item: any) => Number(item.serviceId)),
  );
  const additionalServicePickerOptions = additionalServicesCatalog
    .filter((service) => service.isQuantityBased || !selectedAdditionalServiceIds.has(service.id))
    .map((service) => [
      service.id,
      `${service.nameAr} — ${Number(service.joining_fee).toLocaleString('ar-EG')} جنيه${
        service.isQuantityBased ? ' · حسب الكمية' : ''
      }`,
    ]);
  const addSelectedAdditionalService = () => {
    const service = additionalServicesCatalog.find(
      (candidate) => candidate.id === Number(selectedAdditionalServiceId),
    );
    if (!service) return;
    addAdditionalService(service);
    setSelectedAdditionalServiceId('');
  };
  const hardwareDevices = availableServices.filter(
    (service) =>
      service.type === 'HARDWARE' &&
      service.billingType === 'ONE_TIME' &&
      !service.isSubscriptionBased,
  );

  const contractTypeRules = useMemo(
    () =>
      Object.fromEntries(
        contractTypes.map((offer) => [
          offer.code,
          {
            label: offer.name_ar || offer.name_en,
            maxMonths: offer.max_months,
            subscriptionDiscountPercentage: offer.subscription_discount_percentage,
            joiningFeeDiscountPercentage: offer.joining_fee_discount_percentage,
            requiresSelectedMonths: Boolean(offer.requires_selected_months),
            autoSelectConsecutive: Boolean(offer.auto_select_consecutive),
          },
        ]),
      ),
    [contractTypes],
  ) as Record<string, any>;

  const currentContractTypeRule = contractTypeRules[contractType] || {
    label: '',
    maxMonths: 0,
    subscriptionDiscountPercentage: 0,
    joiningFeeDiscountPercentage: 0,
    requiresSelectedMonths: false,
    autoSelectConsecutive: false,
  };

  const visibleMonthOptions = useMemo(() => {
    if (!contractType) {
      return [];
    }

    if (currentContractTypeRule.autoSelectConsecutive) {
      // Before choosing, allow the customer to select either available start
      // month. Afterwards, display the six-month period from that chosen start.
      const selectedStartValue = [...selectedMonths].sort((left: any, right: any) =>
        left.value.localeCompare(right.value),
      )[0]?.value;
      const selectedStartIndex = monthOptions.findIndex(
        (month) => month.value === selectedStartValue,
      );

      if (selectedStartIndex >= 0) {
        return monthOptions.slice(
          selectedStartIndex,
          selectedStartIndex + currentContractTypeRule.maxMonths,
        );
      }

      return monthOptions.slice(0, 2);
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
    selectedMonths,
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

  const selectedMainSubscriptionService = mainSubscriptionServices.find(
    (service) => service.id === Number(mainSubscriptionServiceId),
  );

  const joiningFee = Number(joiningFeeService?.joining_fee ?? 0);

  const mainMonthlySubscription = selectedMainSubscriptionService?.subscription_fee || 0;

  // The chosen months at contract creation collect the main plan only.
  const initialCollectedMonthlySubscription = mainMonthlySubscription;
  const monthlySubscription = selectedMonths.length * initialCollectedMonthlySubscription;

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

  const monthlySubscriptionAfterDiscount = Number(
    (initialCollectedMonthlySubscription * (1 - subscriptionDiscountPercentage / 100)).toFixed(2),
  );
  const subscriptionPriceAfterDiscount = Number(
    (monthlySubscriptionAfterDiscount * selectedMonths.length).toFixed(2),
  );
  const subscriptionDiscount = monthlySubscription - subscriptionPriceAfterDiscount;
  const joiningFeeAfterContractTypeDiscount = Number(
    (joiningFee * (1 - joiningFeeDiscountPercentage / 100)).toFixed(2),
  );
  const joiningFeeDiscount = joiningFee - joiningFeeAfterContractTypeDiscount;

  const selectedAdditionalServiceRows = selectedAdditionalServices
    .map((item: any) => {
      const service = availableServices.find(
        (candidate) => candidate.id === Number(item.serviceId),
      );
      if (
        !service ||
        service.type !== 'ADDITIONAL_SERVICE' ||
        service.billingType !== 'ONE_TIME' ||
        service.isSubscriptionBased
      )
        return null;
      const quantity = Math.max(Number(item.quantity) || 1, 1);
      return { ...service, quantity, total: service.joining_fee * quantity };
    })
    .filter((item): item is SellableService & { quantity: number; total: number } => Boolean(item));
  const additionalServicesTotal = selectedAdditionalServiceRows.reduce(
    (total, service) => total + service.total,
    0,
  );
  const selectedHardwareDeviceRows = selectedHardwareDevices
    .map((item: any) => {
      const device = availableServices.find((candidate) => candidate.id === Number(item.serviceId));
      if (!device || device.type !== 'HARDWARE') return null;
      const quantity = Math.max(Number(item.quantity) || 1, 1);
      return { ...device, quantity, total: device.joining_fee * quantity };
    })
    .filter((item): item is SellableService & { quantity: number; total: number } => Boolean(item));
  const hardwareDevicesTotal = selectedHardwareDeviceRows.reduce(
    (total, device) => total + device.total,
    0,
  );
  const addOnTotal = additionalServicesTotal;
  const grossContractValue = joiningFeeAfterContractTypeDiscount + subscriptionPriceAfterDiscount;
  const totalContractValue = Number(grossContractValue.toFixed(2));
  const discountAmount = subscriptionDiscount + joiningFeeDiscount;

  const totalBeforeDiscount = joiningFee + monthlySubscription;
  const joiningFeeAfterDiscount = joiningFeeAfterContractTypeDiscount;
  const subscriptionFeeAfterDiscount = subscriptionPriceAfterDiscount;

  useEffect(() => {
    if (!hasManuallyEditedInitialPayments.current && initialPayments.length === 1) {
      setValue('initialPayments.0.amount', totalContractValue, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [initialPayments.length, setValue, totalContractValue]);

  useEffect(() => {
    if (!hasManuallyEditedAddOnPaymentAmount.current) {
      setValue('addOnPayment.amount', addOnTotal, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [addOnTotal, setValue]);

  const remainingAmount = Math.max(totalContractValue - paymentAmount, 0);
  const addOnRemainingAmount = Math.max(addOnTotal - addOnPaymentAmount, 0);

  const paidPercentage =
    totalContractValue > 0 ? Math.min((paymentAmount / totalContractValue) * 100, 100) : 0;
  const addOnPaidPercentage =
    addOnTotal > 0 ? Math.min((addOnPaymentAmount / addOnTotal) * 100, 100) : 0;

  const selectedBranch = branchId !== '' ? (branches[Number(branchId)] ?? null) : null;
  const selectedZone = zoneId !== '' ? (zones[Number(zoneId)] ?? null) : null;

  const customerStatus =
    customerMode === 'reactivate' ? 'إعادة تفعيل' : customerMode === 'new' ? 'عميل جديد' : '—';
  const selectedAddOnPaymentMethod = paymentMethods.find(
    (method) => Number(method.id) === Number(addOnPaymentMethodId),
  );
  const addOnPaymentMethodCode = String(selectedAddOnPaymentMethod?.code || '')
    .toUpperCase()
    .replace(/_/g, '');
  const initialPaymentMethodLabel = initialPayments.length
    ? initialPayments
        .map((payment: any) => {
          const method = paymentMethods.find(
            (item) => Number(item.id) === Number(payment?.paymentMethodId),
          );
          return method?.nameAr ?? method?.name_ar ?? method?.code ?? 'غير معروف';
        })
        .join(' + ')
    : 'لا يوجد تحصيل';

  /* =========================================================
     FILE UPLOAD
  ========================================================= */

  const addDocumentInputRef = useRef<any>(null);
  const replaceDocumentInputRef = useRef<any>(null);

  const [replaceDocumentIndex, setReplaceDocumentIndex] = useState<any>(null);
  const [renamingDocumentIndex, setRenamingDocumentIndex] = useState<number | null>(null);
  const [documentNameDraft, setDocumentNameDraft] = useState('');

  const openDocumentPicker = () => {
    addDocumentInputRef.current?.click();
  };

  const openReplacePicker = (index: number) => {
    setReplaceDocumentIndex(index);
    replaceDocumentInputRef.current?.click();
  };
  const normaliseDocumentName = (name: string, originalFileName: string) => {
    const trimmedName = name.trim().replace(/[\\/]/g, '-');
    if (!trimmedName) return originalFileName;

    const extensionStart = originalFileName.lastIndexOf('.');
    const extension = extensionStart >= 0 ? originalFileName.slice(extensionStart) : '';
    return extension && !trimmedName.toLowerCase().endsWith(extension.toLowerCase())
      ? `${trimmedName}${extension}`
      : trimmedName;
  };

  const startDocumentRename = (index: number, name: string) => {
    setRenamingDocumentIndex(index);
    setDocumentNameDraft(name);
  };

  const saveDocumentRename = (index: number, document: any) => {
    updateDocument(index, {
      ...document,
      name: normaliseDocumentName(documentNameDraft, document.file?.name || document.name),
    });
    setRenamingDocumentIndex(null);
    setDocumentNameDraft('');
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

    setValue('customerNameAr', customer.nameAr, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('customerCode', customer.code, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('customerTypeId', customer.type === 'PHARMACEUTICAL' ? 1 : 2, {
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
      const isSelected = current.some((item: any) => item.value === month.value);

      // A six-month offer is one contiguous period. Clicking any selected
      // month clears it, allowing the user to choose a different start month.
      if (isSelected) {
        setValue('selectedMonths', [], {
          shouldDirty: true,
          shouldValidate: true,
        });
        revalidateNextDueDate();
        return;
      }

      const startIndex = monthOptions.findIndex((item) => item.value === month.value);
      const offerMonths = monthOptions.slice(
        startIndex,
        startIndex + currentContractTypeRule.maxMonths,
      );

      if (startIndex < 0 || offerMonths.length !== currentContractTypeRule.maxMonths) {
        return;
      }

      setValue('selectedMonths', offerMonths, {
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
    // Add-on fields are entered on the final step. Give them priority over stale
    // errors from an earlier step so submitting an additional unit/replication
    // receipt never hides the field the user needs to correct.
    const hasAddOnError = ['addOnPayment', 'additionalServices', 'hardwareDevices'].some((field) =>
      Boolean(submitErrors[field]),
    );

    const hasStepOneError = [
      'customerMode',
      'customerId',
      'customerNameAr',
      'customerTypeId',
      'structure',
      'parentCustomerId',
      'zoneId',
      'licenseNumber',
      'taxNumber',
      'taxExemptionNationalId',
      'taxExemptionComment',
      'registrationNumber',
      'contacts',
      'address',
    ].some((field) => Boolean(submitErrors[field]));

    const hasSubscriptionError = [
      'contractDate',
      'programId',
      'mainSubscriptionServiceId',
      'contractType',
      'selectedMonths',
      'initialPayments',
      'installationDate',
      'nextDueDate',
    ].some((field) => Boolean(submitErrors[field]));

    setActiveStep((currentStep) => {
      if (hasAddOnError) return 3;
      if (hasStepOneError) return 1;
      if (hasSubscriptionError) return 2;
      return currentStep;
    });
    scrollToFirstValidationError();
  };
  const handleNext = async () => {
    const valid = await trigger([
      'customerMode',
      'customerId',

      'customerNameAr',
      'customerTypeId',
      'structure',
      'parentCustomerId',
      'zoneId',
      'licenseNumber',
      'registrationNumber',
      ...(taxRegistrationType === 'TAX_NUMBER'
        ? ['taxNumber']
        : ['taxExemptionNationalId', 'taxExemptionComment']),

      // Validate the full nested groups, rather than only the first contact and
      // address inputs. Otherwise a later final submit discovers a missed error
      // and appears to send the user backwards from the Add-ons step.
      'contacts',
      'address',
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
    setActiveStep((step) => Math.max(1, step - 1));

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handlePlanNext = async () => {
    // These are all step-2 fields. Validate them here so final Send is reserved
    // for submitting the contract, not for redirecting to a missed plan error.
    const subscriptionFields = [
      'contractDate',
      'programId',
      'mainSubscriptionServiceId',
      'contractType',
      'selectedMonths',
      'initialPayments',
      'installationDate',
      'nextDueDate',
    ];
    const paymentFields = initialPayments.flatMap((payment: any, index: number) => {
      const prefix = `initialPayments.${index}`;
      const method = paymentMethods.find(
        (item) => Number(item.id) === Number(payment?.paymentMethodId),
      );
      const code = String(method?.code || '')
        .toUpperCase()
        .replace(/_/g, '');
      const fields = [`${prefix}.amount`, `${prefix}.paymentMethodId`];
      if (code === 'CASH') fields.push(`${prefix}.paymentDetails.receiptNumber`);
      if (code === 'BANKTRANSFER')
        fields.push(
          `${prefix}.paymentDetails.transferDate`,
          `${prefix}.paymentDetails.bankId`,
          `${prefix}.paymentDetails.referenceNumber`,
        );
      if (code === 'CHEQUE')
        fields.push(
          `${prefix}.paymentDetails.bankId`,
          `${prefix}.paymentDetails.chequeNumber`,
          `${prefix}.paymentDetails.chequeDueDate`,
        );
      if (code === 'INSTAPAY' || code === 'PAYSKY')
        fields.push(
          `${prefix}.paymentDetails.referenceNumber`,
          `${prefix}.paymentDetails.transactionDate`,
        );
      return fields;
    });
    const valid = await trigger([...subscriptionFields, ...paymentFields] as any);
    if (!valid || paymentAmount <= 0 || paymentAmount > totalContractValue + 0.01) {
      scrollToFirstValidationError();
      return;
    }
    goToAddOnsStep();
  };
  const goToAddOnsStep = () => {
    isAdvancingToAddOnsRef.current = true;
    setActiveStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    window.setTimeout(() => {
      isAdvancingToAddOnsRef.current = false;
    }, 0);
  };

  /* =========================================================
     FINAL SUBMIT
  ========================================================= */

  useEffect(() => {
    if (!workflowCustomerEdit || !workflowContract) return;
    const landlineCode =
      getLandlineTelephoneCode(workflowContract.governorate_name_ar || '')?.code || '';
    const savedLandline = String(workflowContract.landline_phone || '').replace(/\D/g, '');
    const landlineSubscriber =
      landlineCode && savedLandline.startsWith(landlineCode)
        ? savedLandline.slice(landlineCode.length)
        : savedLandline;
    reset((current) => ({
      ...current,
      customerMode: 'new',
      customerNameAr: workflowContract.customer_name_ar || '',
      customerCode: workflowContract.customer_code || '',
      customerTypeId: workflowContract.customer_type_id || null,
      structure: workflowContract.structure || '',
      parentCustomerId: workflowContract.parent_customer_id || '',
      zoneId: workflowContract.zone_id || '',
      licenseNumber: workflowContract.license_number || '',
      taxNumber: workflowContract.tax_number || '',
      registrationNumber: workflowContract.registration_number || '',
      address: {
        governorateId: workflowContract.geographic_governorate_id || '',
        districtId: workflowContract.geographic_district_id || '',
        shiyakhaId: workflowContract.geographic_shiyakha_id || '',
        street: workflowContract.street || '',
        buildingNumber: workflowContract.building_number || '',
        glnCode: workflowContract.gln_code || '',
        googleMapsUrl: workflowContract.google_maps_url || '',
        latitude: workflowContract.latitude || '',
        longitude: workflowContract.longitude || '',
      },
      contacts: [
        {
          type: 'OWNER',
          nameEn: workflowContract.contact_name_en || '',
          nameAr: workflowContract.contact_name_ar || '',
          nationalId: workflowContract.contact_national_id || '',
          email: workflowContract.contact_email || '',
          phones: [
            {
              number: workflowContract.mobile_phone || workflowContract.customer_phone || '',
              type: 'محمول',
            },
            { number: landlineSubscriber, type: 'هاتف أرضي' },
          ],
        },
      ],
    }));
    setActiveStep(1);
  }, [workflowCustomerEdit, workflowContract, reset]);

  const saveWorkflowCustomer = async () => {
    if (!workflowCustomerEdit || !workflowContract) return;
    const data = getValues();
    const landlineCode = getLandlineTelephoneCode(selectedGovernorate?.nameAr || '')?.code || '';
    const landlineSubscriber = String(data.contacts?.[0]?.phones?.[1]?.number || '').replace(
      /\D/g,
      '',
    );
    try {
      await api.patch(`/contract-workflow/${workflowContract.id}/customer`, {
        nameAr: data.customerNameAr,
        taxNumber: data.taxNumber,
        registrationNumber: data.registrationNumber,
        licenseNumber: data.licenseNumber,
        structure: data.structure,
        parentCustomerId: data.structure === 'CHAIN' ? Number(data.parentCustomerId) : null,
        customerTypeId: data.customerTypeId,
        zoneId: data.zoneId,
        address: data.address,
        contact: {
          nameEn: data.contacts?.[0]?.nameEn,
          nameAr: data.contacts?.[0]?.nameAr,
          nationalId: data.contacts?.[0]?.nationalId,
          email: data.contacts?.[0]?.email,
          mobilePhone: data.contacts?.[0]?.phones?.[0]?.number,
          landlinePhone: landlineSubscriber ? `${landlineCode}${landlineSubscriber}` : '',
        },
      });
      await Swal.fire({ icon: 'success', title: 'تم حفظ بيانات العميل' });
      nav('/contract-follow-up');
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'تعذر حفظ بيانات العميل',
        text: error?.response?.data?.message || 'حاول مرة أخرى.',
      });
    }
  };

  const onSubmit = async (data: any) => {
    if (workflowCustomerEdit) {
      await saveWorkflowCustomer();
      return;
    }
    // Only the final Add-ons step may open the creation confirmation.
    // This also protects against an Enter-key form submit from the plan step.
    if (activeStep !== 3 || isAdvancingToAddOnsRef.current) {
      if (activeStep !== 3) {
        goToAddOnsStep();
      }
      return;
    }

    if (!user?.id) {
      await Swal.fire({
        icon: 'error',
        title: 'تعذر إنشاء العقد',
        text: 'لم يتم العثور على المستخدم المسجل دخوله.',
        confirmButtonText: 'حسناً',
      });
      return;
    }
    if (
      isServicesLoading ||
      servicesError ||
      isContractTypesLoading ||
      contractTypesError ||
      !contractTypeRules[data.contractType] ||
      !joiningFeeService ||
      !selectedMainSubscriptionService?.subscription_fee
    ) {
      await Swal.fire({
        icon: 'error',
        title: 'تعذر إنشاء العقد',
        text:
          contractTypesError || isContractTypesLoading
            ? 'تعذر التحقق من عروض التعاقد. أعد المحاولة بعد تحميل العروض.'
            : 'تعذر التحقق من أسعار الاشتراك ورسوم الانضمام من كتالوج الخدمات. أعد المحاولة بعد تحميل الخدمات.',
        confirmButtonText: 'حسناً',
      });
      return;
    }

    const selectedMonthsPayload = data.selectedMonths.map((month: any) => month.value.slice(0, 7));
    const discountedMonthlyAmount = monthlySubscriptionAfterDiscount;

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
      customerNameAr: data.customerNameAr,
      customerTypeId: data.customerTypeId,
      structure: data.structure,
      parentCustomerId: data.structure === 'CHAIN' ? Number(data.parentCustomerId) : null,
      taxRegistrationType: data.taxRegistrationType,
      taxNumber: data.taxRegistrationType === 'TAX_NUMBER' ? data.taxNumber : null,
      taxExemptionNationalId:
        data.taxRegistrationType === 'NATIONAL_ID' ? data.taxExemptionNationalId : null,
      taxExemptionComment:
        data.taxRegistrationType === 'NATIONAL_ID' ? data.taxExemptionComment?.trim() : null,
      registrationNumber: data.registrationNumber,
      licenseNumber: data.licenseNumber,
      zoneId: data.zoneId,
      contacts: contactsPayload,
      address: {
        governorateId: data.address.governorateId,
        districtId: data.address.districtId,
        shiyakhaId: data.address.shiyakhaId || null,
        street: data.address.street,
        buildingNumber: data.address.buildingNumber,
        googleMapsUrl: data.address.googleMapsUrl || null,
        latitude: data.address.latitude || null,
        longitude: data.address.longitude || null,
        glnCode: data.address.glnCode || null,
      },
      mainSubscriptionServiceId: Number(data.mainSubscriptionServiceId),
      programId: data.programId,
      contractType: data.contractType,
      contractNumber: data.contractNumber,
      contractDate: data.contractDate,
      selectedMonths: selectedMonthsPayload,
      monthPayments: selectedMonthsPayload.map((month: string) => ({
        month,
        amount: discountedMonthlyAmount,
      })),
      repAssistantId: participantId || null,
      subscriptionDiscountPercentage,
      joiningFeeDiscountPercentage,
      paymentAmount,
      // Legacy fields are retained for older servers; the API uses initialPayments
      // when present and creates one collection receipt for each entry.
      paymentMethodId: Number(data.initialPayments?.[0]?.paymentMethodId || 0),
      paymentDetails: data.initialPayments?.[0]?.paymentDetails || {},
      initialPayments: (data.initialPayments || []).map((payment: any) => ({
        amount: Number(payment?.amount || 0),
        paymentMethodId: Number(payment?.paymentMethodId || 0),
        paymentDetails: payment?.paymentDetails || {},
      })),
      addOnPayment:
        addOnTotal > 0
          ? {
              amount: Number(data.addOnPayment?.amount || 0),
              paymentMethodId: Number(data.addOnPayment?.paymentMethodId || 0),
              paymentDetails: data.addOnPayment?.paymentDetails || {},
              collectionReason: data.addOnPayment?.collectionReason || 'إضافات العقد',
              notes: data.addOnPayment?.notes || null,
            }
          : null,
      additionalServices: (data.additionalServices || [])
        .map((service: any) => ({
          serviceId: Number(service.serviceId),
          quantity: Math.max(Number(service.quantity) || 0, 0),
        }))
        .filter(
          (service: any) => {
            const catalogService = availableServices.find((item) => item.id === service.serviceId);
            return Boolean(
              Number.isInteger(service.serviceId) &&
                service.serviceId > 0 &&
                service.quantity > 0 &&
                catalogService?.type === 'ADDITIONAL_SERVICE' &&
                catalogService.billingType === 'ONE_TIME' &&
                !catalogService.isSubscriptionBased &&
                contractAdditionalServiceCodes.has(catalogService.code),
            );
          },
        ),
      hardwareDevices: (data.hardwareDevices || [])
        .map((device: any) => ({
          serviceId: Number(device.serviceId),
          quantity: Math.max(Number(device.quantity) || 0, 0),
        }))
        .filter(
          (device: any) =>
            Number.isInteger(device.serviceId) &&
            device.serviceId > 0 &&
            device.quantity > 0 &&
            availableServices.find((item) => item.id === device.serviceId)?.type === 'HARDWARE',
        ),
      installationDate: data.installationDate,
      notes: data.notes,
      // Keep files visible in the submit payload log. They are appended to
      // FormData separately below and are never JSON-serialized.
      documents: data.documents || [],
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
        if (
          key === 'documents' ||
          value === undefined ||
          (key === 'addOnPayment' && value === null)
        ) {
          return;
        }
        formData.append(
          key,
          value !== null && typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
        );
      });

      (data.documents || []).forEach((document: any) => {
        if (document.file instanceof File) {
          formData.append(
            'documents',
            document.file,
            normaliseDocumentName(document.name, document.file.name),
          );
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
      nav('/contract-follow-up');
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

        /* Keep the selected value readable; the shared outline button defaults to white on hover. */
        .rtl-contract-form button[role='combobox']:not([aria-invalid='true']):hover {
          color: hsl(var(--foreground));
        }
        /* Number spinners stay on the right and do not overlap RTL text. */
        .rtl-contract-form input[type='number'] {
          direction: ltr;
          text-align: right;
          padding-right: 0.75rem;
        }
      `}</style>
      <form
        className="add-contract-form"
        onSubmit={(event) => {
          if (activeStep === 2) {
            event.preventDefault();
            void handlePlanNext();
            return;
          }

          handleSubmit(onSubmit, handleInvalidSubmit)(event);
        }}
      >
        <div className="mx-auto max-w-[1500px] space-y-6 p-4 md:p-6 lg:p-8">
          {/* =================================================
              HIDDEN FIELDS
          ================================================= */}

          <input
            type="hidden"
            {...register('customerMode', {
              required: 'اختر نوع العملية',
            })}
          />

          <input
            type="hidden"
            {...register('customerId', {
              validate: (value) =>
                customerMode !== 'reactivate' || value || 'يجب اختيار العميل غير النشط',
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
              قم بإدخال بيانات العميل ثم تفاصيل العقد والاشتراك والتحصيل.
            </p>
          </div>

          {/* =================================================
              STEPPER
          ================================================= */}

          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  {
                    id: 1,
                    title: 'بيانات العميل',
                    description: 'العميل، المستندات، جهات الاتصال، العنوان ',
                    icon: Users,
                  },
                  {
                    id: 2,
                    title: 'العقد والاشتراك',
                    description: 'التعاقد، الاشتراك، وتحصيل العقد',
                    icon: FileText,
                  },
                  {
                    id: 3,
                    title: 'الإضافات والأجهزة',
                    description: 'وحدات إضافية، نسخ، أجهزة، وإيصال مستقل',
                    icon: Wrench,
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
              {/* Customer type must be selected before choosing the operation. */}
              <Card
                className="border-border bg-card shadow-sm"
                data-validation-anchor={errors.customerTypeId ? 'true' : undefined}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    نوع العميل
                    <span className="text-red-500">*</span>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <input
                    type="hidden"
                    {...register('customerTypeId', {
                      required: 'نوع العميل مطلوب',
                      validate: (value) => value === 1 || value === 2 || 'نوع العميل مطلوب',
                    })}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      { value: 1, label: 'صيدلي', description: 'صيدليات وسلاسل الصيدليات' },
                      { value: 2, label: 'تجاري', description: 'المنشآت والأنشطة التجارية' },
                    ].map((item) => {
                      const isSelected = customerTypeId === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            setValue('customerTypeId', item.value, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            });
                            setValue('customerMode', '', {
                              shouldDirty: true,
                              shouldValidate: false,
                            });
                            setValue('customerId', '', {
                              shouldDirty: true,
                              shouldValidate: false,
                            });
                          }}
                          className={cn(
                            'rounded-2xl border p-5 text-right transition-all',
                            isSelected
                              ? 'border-foreground bg-foreground text-background shadow-md'
                              : 'border-border bg-card hover:bg-accent',
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-sm font-bold">{item.label}</div>
                              <p
                                className={cn(
                                  'mt-2 text-xs leading-5',
                                  isSelected ? 'text-background/70' : 'text-muted-foreground',
                                )}
                              >
                                {item.description}
                              </p>
                            </div>
                            <div
                              className={cn(
                                'rounded-xl p-3',
                                isSelected ? 'bg-background/10' : 'bg-muted',
                              )}
                            >
                              <Building2 className="h-5 w-5" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {errors.customerTypeId?.message && (
                    <div className="mt-3">
                      <ErrorText>{String(errors.customerTypeId.message)}</ErrorText>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer operation */}

              <Card
                className="border-border bg-card shadow-sm"
                data-validation-anchor={errors.customerMode ? 'true' : undefined}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserRound className="h-5 w-5 text-muted-foreground" />
                    نوع العملية
                    <span className="text-red-500">*</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* New */}

                    <button
                      type="button"
                      disabled={!customerTypeId}
                      onClick={() => {
                        setValue('customerMode', 'new', {
                          shouldDirty: true,
                          shouldValidate: true,
                        });

                        setValue('customerId', '');
                      }}
                      className={`
                        rounded-2xl border p-5
                        text-right transition-all

                        ${
                          customerMode === 'new'
                            ? 'border-foreground bg-foreground text-background shadow-md'
                            : customerTypeId
                              ? 'border-border bg-card hover:bg-accent'
                              : 'cursor-not-allowed border-border bg-muted/50 text-muted-foreground opacity-60'
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
                      disabled={!customerTypeId}
                      onClick={() =>
                        setValue('customerMode', 'reactivate', {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className={`
                        rounded-2xl border p-5
                        text-right transition-all

                        ${
                          customerMode === 'reactivate'
                            ? 'border-amber-500 bg-amber-50 shadow-md dark:border-amber-700 dark:bg-amber-950/40'
                            : customerTypeId
                              ? 'border-border bg-card hover:bg-accent'
                              : 'cursor-not-allowed border-border bg-muted/50 text-muted-foreground opacity-60'
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

                  {!customerTypeId && (
                    <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                      اختر نوع العميل أولاً ثم حدد نوع العملية.
                    </p>
                  )}

                  {errors.customerMode?.message && (
                    <ErrorText>{String(errors.customerMode.message)}</ErrorText>
                  )}

                  {customerMode === 'reactivate' && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                      <Label>اختر العميل غير النشط</Label>

                      <div>
                        {' '}
                        <SearchableSelect
                          value={customerId}
                          onValueChange={handleInactiveCustomer}
                          options={[
                            ['', 'اختر العميل...'],
                            ...inactiveCustomersForSelectedType.map((customer) => [
                              customer.id,
                              `${customer.nameAr} — ${customer.code}`,
                            ]),
                          ]}
                          error={Boolean(errors.customerId)}
                          placeholder="اختر العميل..."
                          searchPlaceholder="ابحث باسم العميل أو الكود..."
                        />
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
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <FormField
                      label={
                        <>
                          اسم العميل
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

                    <div>
                      <Label>كود العميل</Label>

                      <div className="relative mt-2">
                        <Input
                          {...register('customerCode')}
                          readOnly
                          placeholder="سيتم توليده تلقائياً"
                          className="h-11 cursor-not-allowed rounded-xl bg-muted"
                        />
                      </div>

                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {customerMode === 'new'
                          ? isCustomerCodePreviewLoading
                            ? 'جارٍ تحميل الكود المتوقع…'
                            : 'هذا هو الكود المتوقع؛ ويُثبت الكود النهائي تلقائياً عند الحفظ.'
                          : customerMode === 'reactivate'
                            ? 'كود العميل المحدد محفوظ كما هو.'
                            : 'اختر نوع العملية أولاً لتحديد طريقة إنشاء الكود.'}
                      </p>
                    </div>

                    <SelectField
                      label={
                        <>
                          نوع الصيدلية
                          <span className="mr-1 text-red-500">*</span>
                        </>
                      }
                      registration={register('structure', {
                        required: 'هيكل العميل مطلوب',
                      })}
                      options={[
                        ['SINGLE', 'فردي'],
                        ['CHAIN', 'سلاسل'],
                      ]}
                      control={control}
                      error={errors.structure?.message}
                    />

                    {structure === 'CHAIN' && (
                      <div data-validation-anchor={errors.parentCustomerId ? 'true' : undefined}>
                        <Label>
                          تابع لأي صيدلية / عميل؟ <span className="mr-1 text-red-500">*</span>
                        </Label>
                        <input
                          type="hidden"
                          {...register('parentCustomerId', {
                            validate: (value) =>
                              structure !== 'CHAIN' ||
                              Number(value) > 0 ||
                              'اختر الصيدلية أو العميل الرئيسي',
                          })}
                        />
                        <SearchableSelect
                          value={parentCustomerId}
                          onValueChange={(value: string) =>
                            setValue('parentCustomerId', value, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            })
                          }
                          disabled={isParentCustomersLoading || !customerTypeId}
                          error={Boolean(errors.parentCustomerId)}
                          placeholder={
                            isParentCustomersLoading
                              ? 'جارٍ تحميل العملاء...'
                              : 'اختر الصيدلية أو العميل الرئيسي'
                          }
                          searchPlaceholder="ابحث بالاسم أو كود العميل..."
                          emptyMessage="لا يوجد عملاء متاحون"
                          options={[
                            ['', 'اختر الصيدلية أو العميل الرئيسي'],
                            ...parentCustomerOptions.map((customer) => [
                              customer.id,
                              customer.name || 'عميل',
                            ]),
                          ]}
                        />
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          ستظهر الصيدلية/العميل الرئيسي في التقارير لتسهيل متابعة فروع السلاسل.
                        </p>
                        {errors.parentCustomerId?.message && (
                          <ErrorText>{String(errors.parentCustomerId.message)}</ErrorText>
                        )}
                      </div>
                    )}

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
                      control={control}
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
                        pattern: {
                          value: /^\d+$/,
                          message: 'رقم الترخيص يجب أن يحتوي على أرقام فقط',
                        },
                      })}
                      placeholder="45879"
                      inputMode="numeric"
                      onInput={(event: React.FormEvent<HTMLInputElement>) => {
                        event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
                      }}
                      error={errors.licenseNumber?.message}
                    />

                    <div
                      className="space-y-3"
                      data-validation-anchor={
                        errors.taxNumber ||
                        errors.taxExemptionNationalId ||
                        errors.taxExemptionComment
                          ? 'true'
                          : undefined
                      }
                    >
                      <Label>
                        الرقم الضريبي <span className="mr-1 text-red-500">*</span>
                      </Label>

                      <input
                        type="hidden"
                        {...register('taxRegistrationType', {
                          validate: (value) =>
                            value === 'TAX_NUMBER' ||
                            value === 'NATIONAL_ID' ||
                            'اختر حالة الرقم الضريبي',
                        })}
                      />
                      <div
                        className="flex flex-wrap gap-2"
                        role="group"
                        aria-label="حالة الرقم الضريبي"
                      >
                        {[
                          { value: 'TAX_NUMBER', label: 'لديه رقم ضريبي' },
                          { value: 'NATIONAL_ID', label: 'لا يوجد رقم ضريبي' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={taxRegistrationType === option.value}
                            onClick={() =>
                              setValue('taxRegistrationType', option.value, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              })
                            }
                            className={cn(
                              'rounded-lg border px-3 py-2 text-xs transition-colors',
                              taxRegistrationType === option.value
                                ? 'border-primary bg-primary/10 font-semibold text-primary'
                                : 'border-border bg-background text-muted-foreground hover:text-foreground',
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      {taxRegistrationType === 'TAX_NUMBER' ? (
                        <>
                          <Controller
                            control={control}
                            name="taxNumber"
                            rules={{
                              validate: (value) =>
                                taxRegistrationType !== 'TAX_NUMBER' ||
                                String(value || '').replace(/\D/g, '').length === 9 ||
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
                                onChange={(value) =>
                                  field.onChange(value.replace(/\D/g, '').slice(0, 9))
                                }
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
                          <p className="text-xs text-muted-foreground">
                            أدخل الرقم الضريبي المكوّن من 9 أرقام.
                          </p>
                          {errors.taxNumber?.message && (
                            <ErrorText>{String(errors.taxNumber.message)}</ErrorText>
                          )}
                        </>
                      ) : (
                        <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/60 dark:bg-amber-950/20">
                          <FormField
                            label={
                              <>
                                الرقم القومي لصاحب المنشأة
                                <span className="mr-1 text-red-500">*</span>
                              </>
                            }
                            registration={register('taxExemptionNationalId', {
                              validate: (value) =>
                                taxRegistrationType !== 'NATIONAL_ID' ||
                                /^\d{14}$/.test(String(value || '')) ||
                                'الرقم القومي يجب أن يكون 14 رقمًا',
                            })}
                            placeholder="14 رقمًا"
                            inputMode="numeric"
                            maxLength={14}
                            onInput={(event: React.FormEvent<HTMLInputElement>) => {
                              event.currentTarget.value = event.currentTarget.value
                                .replace(/\D/g, '')
                                .slice(0, 14);
                            }}
                            error={errors.taxExemptionNationalId?.message}
                          />
                          <div>
                            <Label htmlFor="taxExemptionComment">
                              سبب عدم وجود رقم ضريبي <span className="mr-1 text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="taxExemptionComment"
                              {...register('taxExemptionComment', {
                                validate: (value) =>
                                  taxRegistrationType !== 'NATIONAL_ID' ||
                                  String(value || '').trim().length >= 3 ||
                                  'يرجى كتابة سبب عدم وجود رقم ضريبي',
                              })}
                              maxLength={1000}
                              rows={3}
                              placeholder="مثال: منشأة فردية لم تستخرج رقمًا ضريبيًا بعد"
                              className="mt-2 resize-y"
                            />
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              يُحفظ هذا التعليق مع بيانات العميل للمراجعة.
                            </p>
                            {errors.taxExemptionComment?.message && (
                              <ErrorText>{String(errors.taxExemptionComment.message)}</ErrorText>
                            )}
                          </div>
                        </div>
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
                        pattern: {
                          value: /^\d+$/,
                          message: 'رقم السجل التجاري يجب أن يحتوي على أرقام فقط',
                        },
                      })}
                      placeholder="78210"
                      inputMode="numeric"
                      onInput={(event: React.FormEvent<HTMLInputElement>) => {
                        event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
                      }}
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
                      {documentFields.map((document: any, index: number) => {
                        const isRenaming = renamingDocumentIndex === index;

                        return (
                          <div
                            key={document.id}
                            className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/40 p-4 lg:flex-row lg:items-center lg:justify-between"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              </div>

                              <div className="min-w-0">
                                {isRenaming ? (
                                  <div className="space-y-1">
                                    <Label htmlFor={`document-name-${index}`} className="text-xs">
                                      اسم المستند
                                    </Label>
                                    <Input
                                      id={`document-name-${index}`}
                                      autoFocus
                                      value={documentNameDraft}
                                      onChange={(event) => setDocumentNameDraft(event.target.value)}
                                      onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                          event.preventDefault();
                                          saveDocumentRename(index, document);
                                        }
                                        if (event.key === 'Escape') {
                                          setRenamingDocumentIndex(null);
                                          setDocumentNameDraft('');
                                        }
                                      }}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      سيتم الحفاظ على امتداد الملف الأصلي تلقائياً.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="truncate text-sm font-semibold">
                                    {document.name}
                                  </div>
                                )}

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

                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              {isRenaming ? (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="rounded-xl"
                                    onClick={() => saveDocumentRename(index, document)}
                                  >
                                    حفظ الاسم
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-xl"
                                    onClick={() => {
                                      setRenamingDocumentIndex(null);
                                      setDocumentNameDraft('');
                                    }}
                                  >
                                    إلغاء
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={() => startDocumentRename(index, document.name)}
                                >
                                  <Pencil className="ml-2 h-4 w-4" />
                                  تعديل الاسم
                                </Button>
                              )}

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
                                onClick={() => {
                                  removeDocument(index);
                                  if (isRenaming) {
                                    setRenamingDocumentIndex(null);
                                    setDocumentNameDraft('');
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
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
                      اختر المحافظة ثم المركز أو القسم ثم الحي أو الشياخة.
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
                      <Controller
                        control={control}
                        name="address.governorateId"
                        rules={{ required: 'المحافظة مطلوبة' }}
                        render={({ field }) => (
                          <SearchableSelect
                            value={field.value}
                            onValueChange={(value: string) => {
                              field.onChange(value);
                              field.onBlur();
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
                            }}
                            disabled={isGeographyLoading || Boolean(geographyError)}
                            error={Boolean(errors.address?.governorateId)}
                            placeholder={
                              isGeographyLoading ? 'جارٍ تحميل المحافظات...' : 'اختر المحافظة'
                            }
                            searchPlaceholder="ابحث عن محافظة..."
                            options={[
                              [
                                '',
                                isGeographyLoading ? 'جارٍ تحميل المحافظات...' : 'اختر المحافظة',
                              ],
                              ...governorates.map((governorate) => [
                                governorate.id,
                                `${governorate.nameAr} — ${governorate.nameEn}`,
                              ]),
                            ]}
                          />
                        )}
                      />
                      {errors.address?.governorateId?.message && (
                        <ErrorText>{errors.address.governorateId.message}</ErrorText>
                      )}
                    </div>

                    <div>
                      <Label>
                        المركز / القسم
                        <span className="mr-1 text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="address.districtId"
                        rules={{ required: 'المركز أو القسم مطلوب' }}
                        render={({ field }) => (
                          <SearchableSelect
                            value={field.value}
                            onValueChange={(value: string) => {
                              field.onChange(value);
                              field.onBlur();
                              setShiyakhas([]);
                              setValue('address.shiyakhaId', '', {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }}
                            disabled={
                              !governorateId || isGeographyLoading || Boolean(geographyError)
                            }
                            error={Boolean(errors.address?.districtId)}
                            placeholder={
                              governorateId ? 'اختر المركز أو القسم' : 'اختر المحافظة أولاً'
                            }
                            searchPlaceholder="ابحث عن مركز أو قسم..."
                            options={[
                              ['', governorateId ? 'اختر المركز أو القسم' : 'اختر المحافظة أولاً'],
                              ...districts.map((district) => [
                                district.id,
                                `${district.nameAr} — ${district.nameEn}`,
                              ]),
                            ]}
                          />
                        )}
                      />
                      {errors.address?.districtId?.message && (
                        <ErrorText>{errors.address.districtId.message}</ErrorText>
                      )}
                    </div>

                    <div>
                      <Label>
                        الحي / الشياخة
                        {shiyakhas.length > 0 && <span className="mr-1 text-red-500">*</span>}
                      </Label>
                      <Controller
                        control={control}
                        name="address.shiyakhaId"
                        rules={{
                          validate: (value) =>
                            shiyakhas.length === 0 || Boolean(value) || 'الحي أو الشياخة مطلوب',
                        }}
                        render={({ field }) => (
                          <SearchableSelect
                            value={field.value}
                            onValueChange={(value: string) => {
                              field.onChange(value);
                              field.onBlur();
                            }}
                            disabled={
                              !districtId ||
                              isGeographyLoading ||
                              Boolean(geographyError) ||
                              shiyakhas.length === 0
                            }
                            error={Boolean(errors.address?.shiyakhaId)}
                            placeholder={
                              !districtId
                                ? 'اختر المركز أو القسم أولاً'
                                : shiyakhas.length === 0
                                  ? 'لا توجد شياخات مسجلة'
                                  : 'اختر الحي أو الشياخة'
                            }
                            searchPlaceholder="ابحث عن حي أو شياخة..."
                            options={[
                              [
                                '',
                                !districtId
                                  ? 'اختر المركز أو القسم أولاً'
                                  : shiyakhas.length === 0
                                    ? 'لا توجد شياخات مسجلة'
                                    : 'اختر الحي أو الشياخة',
                              ],
                              ...shiyakhas.map((shiyakha) => [
                                shiyakha.id,
                                `${shiyakha.nameAr} — ${shiyakha.nameEn}`,
                              ]),
                            ]}
                          />
                        )}
                      />
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
                        pattern: {
                          value: /^\d+$/,
                          message: 'رقم المبنى يجب أن يحتوي على أرقام فقط',
                        },
                      })}
                      placeholder="25"
                      inputMode="numeric"
                      onInput={(event: React.FormEvent<HTMLInputElement>) => {
                        event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
                      }}
                      error={errors.address?.buildingNumber?.message}
                    />

                    <FormField
                      label="رمز الموقع العالمي (GLN)"
                      registration={register('address.glnCode', {
                        validate: (value) =>
                          !value ||
                          /^\d+$/.test(String(value)) ||
                          'رمز GLN يجب أن يحتوي على أرقام فقط',
                      })}
                      placeholder="22828317"
                      inputMode="numeric"
                      onInput={(event: React.FormEvent<HTMLInputElement>) => {
                        event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
                      }}
                      error={errors.address?.glnCode?.message}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <Label>موقع المنشأة على خرائط Google</Label>
                        <p className="mt-1 text-xs text-muted-foreground">
                          افتح الخريطة، حدّد موقع المنشأة، ثم الصق رابط المشاركة هنا.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 rounded-xl"
                        onClick={openGoogleMaps}
                      >
                        <MapPinned className="ml-2 h-4 w-4" />
                        فتح خرائط Google
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                      <FormField
                        label="رابط موقع Google Maps"
                        registration={register('address.googleMapsUrl', {
                          validate: (value) => {
                            if (!value) return true;
                            if (String(value).length > 2048) {
                              return 'رابط Google Maps يجب ألا يتجاوز 2048 حرفًا';
                            }
                            try {
                              const hostname = new URL(String(value)).hostname.toLowerCase();
                              return (
                                hostname === 'maps.app.goo.gl' ||
                                hostname === 'google.com' ||
                                hostname.endsWith('.google.com') ||
                                'يرجى إدخال رابط صالح من خرائط Google'
                              );
                            } catch {
                              return 'يرجى إدخال رابط صالح من خرائط Google';
                            }
                          },
                        })}
                        placeholder="https://maps.app.goo.gl/..."
                        error={errors.address?.googleMapsUrl?.message}
                      />

                      <FormField
                        label="خط العرض (Latitude)"
                        registration={register('address.latitude', {
                          validate: (value) => {
                            const longitude = getValues('address.longitude');
                            if (!value && !longitude) return true;
                            const latitude = Number(value);
                            return (
                              (Number.isFinite(latitude) && latitude >= -90 && latitude <= 90) ||
                              'خط العرض يجب أن يكون بين -90 و 90'
                            );
                          },
                        })}
                        placeholder="30.044420"
                        inputMode="decimal"
                        error={errors.address?.latitude?.message}
                      />

                      <FormField
                        label="خط الطول (Longitude)"
                        registration={register('address.longitude', {
                          validate: (value) => {
                            const latitude = getValues('address.latitude');
                            if (!value && !latitude) return true;
                            const longitude = Number(value);
                            return (
                              (Number.isFinite(longitude) &&
                                longitude >= -180 &&
                                longitude <= 180) ||
                              'خط الطول يجب أن يكون بين -180 و 180'
                            );
                          },
                        })}
                        placeholder="31.235712"
                        inputMode="decimal"
                        error={errors.address?.longitude?.message}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Contacts */}

              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      بيانات المتعاقد
                    </CardTitle>

                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() =>
                        appendContact({
                          type: 'MANAGER',
                          nameEn: '',
                          nameAr: '',
                          nationalId: '',
                          email: '',
                          phones: [
                            {
                              number: '',
                              type: 'محمول',
                            },
                            {
                              number: '',
                              type: 'هاتف أرضي',
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
                    const isPrimaryContact = contactIndex === 0;
                    const contactType =
                      contactValues[contactIndex]?.type || contact.type || 'OWNER';
                    const primaryRoleLabel = contactType === 'Tenant' ? 'مستأجر' : 'صاحب';

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
                                {isPrimaryContact ? 'بيانات المتعاقد' : 'بيانات المسؤول أو الموظف'}
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
                          {isPrimaryContact ? (
                            <>
                              <div>
                                <Label>
                                  نوع المتعاقد
                                  <span className="mr-1 text-red-500">*</span>
                                </Label>
                                <input
                                  type="hidden"
                                  {...register(`contacts.${contactIndex}.type`, {
                                    required: 'نوع جهة الاتصال مطلوب',
                                  })}
                                />
                                <div className="mt-2 grid grid-cols-2 rounded-xl border bg-muted/40 p-1">
                                  {[
                                    ['OWNER', 'صاحب'],
                                    ['Tenant', 'مستأجر'],
                                  ].map(([value, label]) => (
                                    <button
                                      key={value}
                                      type="button"
                                      aria-pressed={contactType === value}
                                      onClick={() =>
                                        setValue(`contacts.${contactIndex}.type`, value, {
                                          shouldDirty: true,
                                          shouldTouch: true,
                                          shouldValidate: true,
                                        })
                                      }
                                      className={cn(
                                        'rounded-lg px-3 py-2 text-sm transition-colors',
                                        contactType === value
                                          ? 'bg-background font-semibold text-foreground shadow-sm'
                                          : 'text-muted-foreground hover:text-foreground',
                                      )}
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </div>
                                {contactError?.type?.message && (
                                  <ErrorText>{contactError.type.message}</ErrorText>
                                )}
                              </div>

                              <div>
                                <Label>صفة</Label>
                                <Input
                                  value={primaryRoleLabel}
                                  readOnly
                                  className="mt-2 h-11 cursor-default rounded-xl bg-muted"
                                />
                              </div>
                            </>
                          ) : (
                            <SelectField
                              label={
                                <>
                                  صفة
                                  <span className="mr-1 text-red-500">*</span>
                                </>
                              }
                              registration={register(`contacts.${contactIndex}.type`, {
                                required: 'نوع جهة الاتصال مطلوب',
                              })}
                              options={[
                                ['MANAGER', 'مدير'],
                                ['EMPLOYEE', 'موظف'],
                              ]}
                              control={control}
                              error={contactError?.type?.message}
                            />
                          )}

                          <FormField
                            label={
                              <>
                                الاسم باللغة العربية
                                <span className="mr-1 text-red-500">*</span>
                              </>
                            }
                            registration={register(`contacts.${contactIndex}.nameAr`, {
                              required: 'اسم جهة الاتصال مطلوب',
                              pattern: {
                                value: /^[\u0621-\u064A\s]+$/,
                                message: 'اسم جهة الاتصال يجب أن يحتوي على حروف عربية فقط',
                              },
                            })}
                            placeholder="الاسم بالعربية"
                            onInput={(event: React.FormEvent<HTMLInputElement>) => {
                              event.currentTarget.value = event.currentTarget.value.replace(
                                /[^\u0621-\u064A\s]/g,
                                '',
                              );
                            }}
                            error={contactError?.nameAr?.message}
                          />

                          {/* <FormField
                            label="الاسم بالإنجليزية"
                            registration={register(`contacts.${contactIndex}.nameEn`)}
                            placeholder="English name"
                          /> */}

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

          {(activeStep === 2 || activeStep === 3) && (
            <div className="space-y-6">
              {activeStep === 2 && (
                <>
                  {/* Contract */}

                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        معلومات العقد والاشتراك
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
                        control={control}
                        error={errors.programId?.message}
                      />

                      {/* Contract offer */}

                      <div>
                        <Label>
                          العرض
                          <span className="mr-1 text-red-500">*</span>
                        </Label>

                        <Controller
                          control={control}
                          name="contractType"
                          rules={{ required: 'نوع التعاقد مطلوب' }}
                          render={({ field }) => (
                            <SearchableSelect
                              value={field.value}
                              onValueChange={(value: string) => {
                                field.onChange(value);
                                field.onBlur();
                                handleContractTypeChange(value);
                              }}
                              error={Boolean(errors.contractType)}
                              placeholder="اختر نوع التعاقد"
                              searchPlaceholder="ابحث عن نوع التعاقد..."
                              options={[
                                [
                                  '',
                                  isContractTypesLoading
                                    ? 'جارٍ تحميل العروض...'
                                    : 'اختر نوع التعاقد',
                                ],
                                ...contractTypes.map((offer) => [
                                  offer.code,
                                  offer.name_ar || offer.name_en,
                                ]),
                              ]}
                            />
                          )}
                        />

                        {errors.contractType && (
                          <ErrorText>{String(errors.contractType.message)}</ErrorText>
                        )}
                      </div>

                      <SelectField
                        label="نوع التعاقد"
                        registration={register('mainSubscriptionServiceId', {
                          required: 'يجب اختيار خدمة الاشتراك الأساسية',
                          valueAsNumber: true,
                        })}
                        options={[
                          ['', 'اختر خدمة الاشتراك الأساسية'],
                          ...mainSubscriptionServices.map((service) => [
                            String(service.id),
                            `${service.nameAr} — ${service.subscription_fee.toLocaleString('ar-EG')} جنيه شهريًا`,
                          ]),
                        ]}
                        control={control}
                        error={errors.mainSubscriptionServiceId?.message}
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
                        {/* <p className="mt-2 text-xs text-muted-foreground">
                      يتم تعيين المندوب المسؤول تلقائياً من المستخدم المسجل دخوله.
                    </p> */}
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
                            min={installationDateMin}
                            {...register('installationDate', {
                              validate: (value) =>
                                !value ||
                                value >= installationDateMin ||
                                'لا يمكن أن يكون تاريخ التركيب في الماضي',
                            })}
                            className="h-11 rounded-xl pr-10"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {activeStep === 3 && (
                <>
                  {/* Additional units and replication services */}
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Wrench className="h-5 w-5 text-muted-foreground" />
                            الخدمات الإضافية والأجهزة
                          </CardTitle>
                          <p className="mt-1 text-xs text-muted-foreground">
                            الخدمات الإضافية تُفوتر وتُحصّل عند اعتماد العقد، بينما الأجهزة تُفوتر
                            فقط دون تحصيل مبدئي.
                          </p>
                        </div>
                        <Badge variant="secondary" className="w-fit rounded-full">
                          {additionalServiceFields.length + hardwareDeviceFields.length} عناصر
                          اختيارية
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
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setServicesRefresh((value) => value + 1)}
                          >
                            <RefreshCw className="ml-2 h-4 w-4" /> إعادة المحاولة
                          </Button>
                        </div>
                      ) : (
                        <Tabs defaultValue="additional-services" dir="rtl">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="additional-services">الخدمات الإضافية</TabsTrigger>
                            <TabsTrigger value="hardware">الأجهزة</TabsTrigger>
                          </TabsList>

                          <TabsContent value="additional-services" className="space-y-4 pt-3">
                            <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <h4 className="font-semibold">أضف خدمة من الكتالوج</h4>
                                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    اختر الوحدة الإضافية أو خدمة النسخ. الخدمات حسب الكمية يمكن
                                    إضافتها أكثر من مرة.
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="rounded-full">
                                    {additionalServiceFields.length} خدمات مختارة
                                  </Badge>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setServicesRefresh((value) => value + 1)}
                                    disabled={isServicesLoading}
                                    className="h-8 rounded-lg px-2.5 text-xs"
                                  >
                                    <RefreshCw
                                      className={cn(
                                        'ml-1.5 h-3.5 w-3.5',
                                        isServicesLoading && 'animate-spin',
                                      )}
                                    />
                                    تحديث الكتالوج
                                  </Button>
                                </div>
                              </div>

                              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                                <div>
                                  <Label>الخدمة الإضافية</Label>
                                  <SearchableSelect
                                    value={selectedAdditionalServiceId}
                                    options={additionalServicePickerOptions}
                                    onValueChange={setSelectedAdditionalServiceId}
                                    placeholder={
                                      additionalServicePickerOptions.length
                                        ? 'اختر خدمة إضافية'
                                        : 'لا توجد خدمات إضافية متاحة'
                                    }
                                    searchPlaceholder="ابحث بالاسم أو السعر..."
                                    emptyMessage="لا توجد خدمات مطابقة"
                                    disabled={!additionalServicePickerOptions.length}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  onClick={addSelectedAdditionalService}
                                  disabled={!selectedAdditionalServiceId}
                                  className="h-11 rounded-xl sm:min-w-32"
                                >
                                  <Plus className="ml-2 h-4 w-4" /> إضافة الخدمة
                                </Button>
                              </div>
                            </div>

                            {additionalServiceFields.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-8 text-center text-sm text-muted-foreground">
                                لم يتم اختيار خدمات إضافية بعد.
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {additionalServiceFields.map((field: any, index: number) => {
                                  const service = availableServices.find(
                                    (item) => item.id === Number(field.serviceId),
                                  );
                                  if (
                                    !service ||
                                    service.type !== 'ADDITIONAL_SERVICE' ||
                                    service.billingType !== 'ONE_TIME' ||
                                    service.isSubscriptionBased
                                  )
                                    return null;
                                  const quantity = Math.max(
                                    Number(selectedAdditionalServices[index]?.quantity) || 1,
                                    1,
                                  );
                                  return (
                                    <div
                                      key={field.id}
                                      className="grid grid-cols-1 items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_130px_150px_auto]"
                                    >
                                      <input
                                        type="hidden"
                                        {...register(`additionalServices.${index}.serviceId`, {
                                          valueAsNumber: true,
                                        })}
                                      />
                                      <div className="min-w-0">
                                        <p className="truncate font-semibold">{service.nameAr}</p>
                                        <p className="mt-1 truncate text-xs text-muted-foreground">
                                          {service.nameEn} ·{' '}
                                          {service.joining_fee.toLocaleString('ar-EG')} جنيه
                                        </p>
                                      </div>
                                      <div>
                                        <Label>عدد الوحدات</Label>
                                        {service.isQuantityBased ? (
                                          <Input
                                            type="number"
                                            min="1"
                                            step="1"
                                            {...register(`additionalServices.${index}.quantity`, {
                                              valueAsNumber: true,
                                              min: {
                                                value: 1,
                                                message: 'الكمية يجب أن تكون 1 على الأقل',
                                              },
                                            })}
                                            className="mt-2 h-11 rounded-xl"
                                          />
                                        ) : (
                                          <div className="mt-2 flex h-11 items-center rounded-xl border border-input bg-muted/40 px-3 text-sm">
                                            خدمة واحدة
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <Label>السعر</Label>
                                        <div className="mt-2 flex h-11 items-center rounded-xl border border-input bg-muted/20 px-3 text-sm font-semibold">
                                          {(service.joining_fee * quantity).toLocaleString('ar-EG')}{' '}
                                          جنيه
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeAdditionalService(index)}
                                        className="h-11 w-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        title="حذف الخدمة"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {false && (
                              <>
                                {/* <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                          <div>
                            <p className="font-semibold">اشتراك الوحدات الإضافية الشهري (إلزامي)</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              يُضاف مرة واحدة لكل شهر، حتى عند عدم اختيار أي وحدة إضافية.
                            </p>
                          </div>
                          <span className="font-bold">
                            {additionalUnitSubscription.toLocaleString('ar-EG')} جنيه/شهر
                          </span>
                        </div> */}
                                {additionalUnitService ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addAdditionalService(additionalUnitService)}
                                    className={cn(
                                      'h-auto min-h-24 w-full justify-between rounded-xl border p-4 text-right hover:bg-accent',
                                      additionalServiceFields.some(
                                        (item: any) =>
                                          Number(item.serviceId) === additionalUnitService.id,
                                      ) && 'border-primary bg-primary/5',
                                    )}
                                  >
                                    <span className="text-right">
                                      <span className="block font-semibold">
                                        {additionalUnitService.nameAr}
                                      </span>
                                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                                        سعر الوحدة{' '}
                                        {additionalUnitService.joining_fee.toLocaleString('ar-EG')}{' '}
                                        جنيه · رسوم
                                      </span>
                                    </span>
                                    <Plus className="h-4 w-4 shrink-0" />
                                  </Button>
                                ) : (
                                  <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                                    لا توجد خدمة وحدات إضافية مهيأة في الكتالوج.
                                  </p>
                                )}
                                {additionalServiceFields.map((field: any, index: number) => {
                                  const service = availableServices.find(
                                    (item) => item.id === Number(field.serviceId),
                                  );
                                  if (!service || service.code !== 'ADDITIONAL_UNIT') return null;
                                  const quantity = Math.max(
                                    Number(selectedAdditionalServices[index]?.quantity) || 1,
                                    1,
                                  );
                                  return (
                                    <div
                                      key={field.id}
                                      className="grid grid-cols-1 items-end gap-3 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-[minmax(0,1fr)_130px_150px_auto]"
                                    >
                                      <input
                                        type="hidden"
                                        {...register(`additionalServices.${index}.serviceId`, {
                                          valueAsNumber: true,
                                        })}
                                      />
                                      <div>
                                        <p className="font-semibold">{service.nameAr}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                          سعر الوحدة {service.joining_fee.toLocaleString('ar-EG')}{' '}
                                          جنيه
                                        </p>
                                      </div>
                                      <div>
                                        <Label>الكمية</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          step="1"
                                          {...register(`additionalServices.${index}.quantity`, {
                                            valueAsNumber: true,
                                            min: {
                                              value: 1,
                                              message: 'الكمية يجب أن تكون 1 على الأقل',
                                            },
                                          })}
                                          className="mt-2 h-11 rounded-xl"
                                        />
                                      </div>
                                      <div>
                                        <Label>إجمالي</Label>
                                        <div className="mt-2 flex h-11 items-center rounded-xl border border-input bg-background px-3 text-sm font-semibold">
                                          {(service.joining_fee * quantity).toLocaleString('ar-EG')}{' '}
                                          جنيه
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeAdditionalService(index)}
                                        className="h-11 w-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        title="حذف الوحدة"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  );
                                })}
                                <div className="space-y-4 border-t border-border pt-5">
                                  <h4 className="text-sm font-semibold">خدمات إضافية متاحة</h4>
                                  {additionalServiceOptions.length === 0 ? (
                                    <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                                      لا توجد خدمات إضافية أخرى متاحة حالياً في الكتالوج.
                                    </p>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                      {additionalServiceOptions.map((service) => (
                                        <Button
                                          key={service.id}
                                          type="button"
                                          variant="outline"
                                          onClick={() => addAdditionalService(service)}
                                          className={cn(
                                            'h-auto min-h-24 justify-between rounded-xl border p-4 text-right hover:bg-accent',
                                            additionalServiceFields.some(
                                              (item: any) => Number(item.serviceId) === service.id,
                                            ) && 'border-primary bg-primary/5',
                                          )}
                                        >
                                          <span className="text-right">
                                            <span className="block font-semibold">
                                              {service.nameAr}
                                            </span>
                                            <span className="mt-1 block text-xs font-normal text-muted-foreground">
                                              {service.nameEn} ·{' '}
                                              {service.isQuantityBased
                                                ? 'حسب الكمية'
                                                : 'خدمة واحدة لمرة واحدة'}
                                            </span>
                                            <span className="mt-2 block font-bold">
                                              {service.joining_fee.toLocaleString('ar-EG')} جنيه
                                            </span>
                                          </span>
                                          <Plus className="h-4 w-4 shrink-0" />
                                        </Button>
                                      ))}
                                    </div>
                                  )}
                                  {additionalServiceFields.map((field: any, index: number) => {
                                    const service = availableServices.find(
                                      (item) => item.id === Number(field.serviceId),
                                    );
                                    if (
                                      !service ||
                                      service.type !== 'ADDITIONAL_SERVICE' ||
                                      service.code === 'ADDITIONAL_UNIT'
                                    )
                                      return null;
                                    const quantity = Math.max(
                                      Number(selectedAdditionalServices[index]?.quantity) || 1,
                                      1,
                                    );
                                    return (
                                      <div
                                        key={field.id}
                                        className="grid grid-cols-1 items-end gap-3 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-[minmax(0,1fr)_130px_150px_auto]"
                                      >
                                        <input
                                          type="hidden"
                                          {...register(`additionalServices.${index}.serviceId`, {
                                            valueAsNumber: true,
                                          })}
                                        />
                                        <div>
                                          <p className="font-semibold">{service.nameAr}</p>
                                          <p className="mt-1 text-xs text-muted-foreground">
                                            {service.nameEn}
                                          </p>
                                        </div>
                                        <div>
                                          {service.isQuantityBased ? (
                                            <>
                                              <Label>الكمية</Label>
                                              <Input
                                                type="number"
                                                min="1"
                                                step="1"
                                                {...register(
                                                  `additionalServices.${index}.quantity`,
                                                  {
                                                    valueAsNumber: true,
                                                    min: {
                                                      value: 1,
                                                      message: 'الكمية يجب أن تكون 1 على الأقل',
                                                    },
                                                  },
                                                )}
                                                className="mt-2 h-11 rounded-xl"
                                              />
                                            </>
                                          ) : (
                                            <>
                                              <Label>الكمية</Label>
                                              <div className="mt-2 flex h-11 items-center rounded-xl border border-input bg-muted/40 px-3 text-sm">
                                                خدمة واحدة
                                              </div>
                                            </>
                                          )}
                                        </div>
                                        <div>
                                          <Label>الإجمالي</Label>
                                          <div className="mt-2 flex h-11 items-center rounded-xl border border-input bg-background px-3 text-sm font-semibold">
                                            {(service.joining_fee * quantity).toLocaleString(
                                              'ar-EG',
                                            )}{' '}
                                            جنيه
                                          </div>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => removeAdditionalService(index)}
                                          className="h-11 w-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                                          title="حذف الخدمة"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </TabsContent>

                          <TabsContent value="hardware" className="space-y-4 pt-3">
                            <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/20">
                              <p className="font-semibold text-amber-900 dark:text-amber-200">
                                فاتورة أجهزة مستقلة
                              </p>
                              <p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-300">
                                {' '}
                                الأجهزة المختارة ستُنشأ لها فاتورة أجهزة مستقلة عند اعتماد العقد،
                                دون إنشاء إيصال تحصيل في هذه المرحلة.
                              </p>
                            </div>
                            {hardwareDevices.length === 0 ? (
                              <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                                لا توجد أجهزة متاحة حالياً في الكتالوج.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {hardwareDevices.map((device) => (
                                  <Button
                                    key={device.id}
                                    type="button"
                                    variant="outline"
                                    onClick={() => addHardwareDevice(device)}
                                    className={cn(
                                      'h-auto min-h-24 justify-between rounded-xl border p-4 text-right hover:bg-accent',
                                      hardwareDeviceFields.some(
                                        (item: any) => Number(item.serviceId) === device.id,
                                      ) && 'border-amber-500 bg-amber-50 dark:bg-amber-950/20',
                                    )}
                                  >
                                    <span className="text-right">
                                      <span className="block font-semibold">{device.nameAr}</span>
                                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                                        {device.nameEn} ·{' '}
                                        {device.isQuantityBased ? 'حسب الكمية' : 'قطعة واحدة'}
                                      </span>
                                      <span className="mt-2 block font-bold">
                                        {device.joining_fee.toLocaleString('ar-EG')} جنيه
                                      </span>
                                    </span>
                                    <Plus className="h-4 w-4 shrink-0" />
                                  </Button>
                                ))}
                              </div>
                            )}
                            {hardwareDeviceFields.map((field: any, index: number) => {
                              const device = availableServices.find(
                                (item) => item.id === Number(field.serviceId),
                              );
                              if (!device || device.type !== 'HARDWARE') return null;
                              const quantity = Math.max(
                                Number(selectedHardwareDevices[index]?.quantity) || 1,
                                1,
                              );
                              return (
                                <div
                                  key={field.id}
                                  className="grid grid-cols-1 items-end gap-3 rounded-xl border border-amber-200 bg-amber-50/40 p-4 md:grid-cols-[minmax(0,1fr)_130px_150px_auto] dark:border-amber-900 dark:bg-amber-950/10"
                                >
                                  <input
                                    type="hidden"
                                    {...register(`hardwareDevices.${index}.serviceId`, {
                                      valueAsNumber: true,
                                    })}
                                  />
                                  <div>
                                    <p className="font-semibold">{device.nameAr}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {device.nameEn}
                                    </p>
                                  </div>
                                  <div>
                                    {device.isQuantityBased ? (
                                      <>
                                        <Label>الكمية</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          step="1"
                                          {...register(`hardwareDevices.${index}.quantity`, {
                                            valueAsNumber: true,
                                            min: {
                                              value: 1,
                                              message: 'الكمية يجب أن تكون 1 على الأقل',
                                            },
                                          })}
                                          className="mt-2 h-11 rounded-xl"
                                        />
                                      </>
                                    ) : (
                                      <>
                                        <Label>الكمية</Label>
                                        <div className="mt-2 flex h-11 items-center rounded-xl border border-input bg-muted/40 px-3 text-sm">
                                          قطعة واحدة
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <div>
                                    <Label>إجمالي الفاتورة</Label>
                                    <div className="mt-2 flex h-11 items-center rounded-xl border border-input bg-background px-3 text-sm font-semibold">
                                      {(device.joining_fee * quantity).toLocaleString('ar-EG')} جنيه
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeHardwareDevice(index)}
                                    className="h-11 w-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    title="حذف الجهاز"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </TabsContent>
                        </Tabs>
                      )}

                      <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 text-sm">
                        <span className="text-muted-foreground">إجمالي الإضافات والخدمات</span>
                        <span className="font-bold">
                          {additionalServicesTotal.toLocaleString('ar-EG')} جنيه
                        </span>
                      </div>
                      {/* <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/20">
                        <span className="text-amber-900 dark:text-amber-200">
                          إجمالي الأجهزة — فاتورة فقط
                        </span>
                        <span className="font-bold text-amber-900 dark:text-amber-200">
                          {hardwareDevicesTotal.toLocaleString('ar-EG')} جنيه
                        </span>
                      </div> */}
                    </CardContent>
                  </Card>

                  <AddOnReceiptSection
                    total={addOnTotal}
                    additionalServices={selectedAdditionalServiceRows}
                    amount={addOnPaymentAmount}
                    remainingAmount={addOnRemainingAmount}
                    paidPercentage={addOnPaidPercentage}
                    paymentMethodCode={addOnPaymentMethodCode}
                    paymentMethodLabel={
                      selectedAddOnPaymentMethod?.nameAr ??
                      selectedAddOnPaymentMethod?.name_ar ??
                      selectedAddOnPaymentMethod?.code ??
                      '—'
                    }
                    paymentMethods={paymentMethods}
                    banks={banks}
                    isBanksLoading={isBanksLoading}
                    register={register}
                    control={control}
                    errors={errors}
                    onAmountInput={() => {
                      hasManuallyEditedAddOnPaymentAmount.current = true;
                    }}
                  />
                </>
              )}

              {activeStep === 2 && (
                <>
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
                              اختر شهر بداية العرض ليتم تحديد كامل فترة العرض (
                              {currentContractTypeRule.maxMonths}
                              أشهر متتالية) تلقائيًا من الشهر الذي اخترته. اضغط على أي شهر محدد
                              لإلغاء الاختيار.
                            </p>
                          )}

                          {contractType && !currentContractTypeRule.autoSelectConsecutive && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              يظهر الشهر الحالي والشهر التالي. مع كل اختيار يظهر الشهر التالي للحفاظ
                              على تسلسل الاشتراك.
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
                          const disabled = !contractType || (!checked && maxMonthsReached);

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

                      {errors.selectedMonths && (
                        <ErrorText>{errors.selectedMonths.message}</ErrorText>
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

                        <div className="space-y-5">
                          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                            <FinancialSummaryCard
                              title="رسوم الانضمام الأساسية"
                              unitPrice={joiningFee}
                              quantity={1}
                              discountAmount={joiningFeeDiscount}
                              discountPercentage={joiningFeeDiscountPercentage}
                              totalBeforeDiscount={joiningFee}
                              totalAfterDiscount={joiningFeeAfterDiscount}
                            />

                            <FinancialSummaryCard
                              title="الاشتراكات"
                              description={`المحصل عند إنشاء العقد: الاشتراك الرئيسي ${mainMonthlySubscription.toLocaleString('ar-EG')} فقط.`}
                              unitPrice={initialCollectedMonthlySubscription}
                              quantity={selectedMonths.length}
                              quantityLabel="عدد الشهور"
                              discountAmount={subscriptionDiscount}
                              discountPercentage={subscriptionDiscountPercentage}
                              totalBeforeDiscount={monthlySubscription}
                              totalAfterDiscount={subscriptionFeeAfterDiscount}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            <MoneyCard label="إجمالي العقد قبل الخصم" value={totalBeforeDiscount} />

                            <MoneyCard label="إجمالي الخصم" value={discountAmount} />

                            <MoneyCard label="الإجمالي بعد الخصم" value={grossContractValue} />
                          </div>
                        </div>

                        {/* Collection */}
                        <InitialPaymentsSection
                          total={totalContractValue}
                          paymentMethods={paymentMethods}
                          banks={banks}
                          isBanksLoading={isBanksLoading}
                          register={register}
                          control={control}
                          errors={errors}
                          onAmountInput={() => {
                            hasManuallyEditedInitialPayments.current = true;
                          }}
                        />

                        <div className="rounded-2xl bg-muted p-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">نسبة السداد</span>
                            <span className="font-bold">{paidPercentage.toFixed(0)}%</span>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                            <div
                              className="h-full rounded-full bg-foreground transition-all"
                              style={{ width: `${paidPercentage}%` }}
                            />
                          </div>
                          <div className="mt-3 flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              مدفوع:{' '}
                              <span className="mr-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                {paymentAmount.toLocaleString('ar-EG')} جنيه
                              </span>
                            </span>
                            <span className="text-muted-foreground">
                              متبقي:{' '}
                              <span className="mr-1 font-semibold text-amber-600 dark:text-amber-400">
                                {remainingAmount.toLocaleString('ar-EG')} جنيه
                              </span>
                            </span>
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
                            <span className="text-xs opacity-70">خدمة الاشتراك</span>

                            <span className="text-sm font-semibold">
                              {selectedMainSubscriptionService?.nameAr || '—'}
                            </span>
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
                            label="نوع الصيدلية"
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

                          <ReviewRow
                            label="الشهور المحددة"
                            value={`${selectedMonths.length} شهور`}
                          />

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
                            label="الإجمالي قبل الخصم"
                            value={`${totalBeforeDiscount.toLocaleString('ar-EG')} جنيه`}
                          />

                          <ReviewRow
                            label="إجمالي خصومات العقد"
                            value={`${discountAmount.toLocaleString('ar-EG')} جنيه`}
                          />

                          <ReviewRow
                            label="الإجمالي بعد الخصم"
                            value={`${grossContractValue.toLocaleString('ar-EG')} جنيه`}
                          />

                          <ReviewRow
                            label="المحصل"
                            value={`${paymentAmount.toLocaleString('ar-EG')} جنيه`}
                          />

                          <ReviewRow
                            label="المتبقي"
                            value={`${remainingAmount.toLocaleString('ar-EG')} جنيه`}
                          />

                          <ReviewRow label="طرق الدفع" value={initialPaymentMethodLabel} />
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
                                بعد الإرسال سيتم تحويل العقد إلى مدير الدعم الفني للمراجعة
                                والموافقة.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <Card className="sticky bottom-4 border-border bg-card shadow-lg">
            <CardContent className="flex flex-col-reverse gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div className="text-xs text-muted-foreground">الخطوة {activeStep} من 3</div>

              <div className="flex w-full items-center gap-3 md:w-auto">
                {activeStep > 1 && (
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

                {workflowCustomerEdit ? (
                  <Button
                    type="button"
                    onClick={() => void saveWorkflowCustomer()}
                    className="h-11 flex-1 rounded-xl bg-foreground text-background hover:bg-foreground/90 md:flex-none"
                  >
                    حفظ بيانات العميل
                  </Button>
                ) : activeStep === 1 ? (
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
                ) : activeStep === 2 ? (
                  <Button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void handlePlanNext();
                    }}
                    className="
                      h-11 flex-1 rounded-xl
                      bg-foreground
                      text-background
                      hover:bg-foreground/90
                      md:flex-none
                    "
                  >
                    التالي: الإضافات والأجهزة
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
  const mandatoryPhoneTypes = useMemo(() => ['محمول', 'هاتف أرضي'], []);
  const existingPhoneTypes = useMemo(
    () => new Set(phoneValues.map((phone: any) => phone?.type).filter(Boolean)),
    [phoneValues],
  );
  const hasWhatsApp = existingPhoneTypes.has('واتساب');

  useEffect(() => {
    const missingPhoneTypes = mandatoryPhoneTypes.filter(
      (phoneType) => !existingPhoneTypes.has(phoneType),
    );

    if (missingPhoneTypes.length > 0) {
      append(missingPhoneTypes.map((type) => ({ number: '', type })));
    }
  }, [append, existingPhoneTypes, mandatoryPhoneTypes]);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
        رقم الهاتف المحمول والهاتف الأرضي مطلوبان. يمكنك إضافة رقم واتساب عند الحاجة.
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {phoneFields.map((phone: any, phoneIndex: number) => {
          const phoneType = phoneValues[phoneIndex]?.type || phone.type || 'محمول';
          const isLandline = phoneType === 'هاتف أرضي';
          const isWhatsApp = phoneType === 'واتساب';
          const landlineCode = getLandlineTelephoneCode(governorate);
          const landlineNumberLength = landlineCode ? 10 - landlineCode.code.length : 8;
          const inputName = `contacts.${contactIndex}.phones.${phoneIndex}.number`;
          const fieldError = errors?.contacts?.[contactIndex]?.phones?.[phoneIndex]?.number;
          const phoneLabel = isLandline
            ? 'رقم الهاتف الأرضي'
            : isWhatsApp
              ? 'رقم واتساب'
              : 'رقم الهاتف المحمول';
          const validationLabel = isWhatsApp ? 'رقم واتساب' : phoneLabel;

          return (
            <div
              key={phone.id}
              className={`rounded-xl border border-border bg-muted/20 p-3 shadow-sm ${
                isWhatsApp ? 'md:col-span-2' : ''
              }`}
            >
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div>
                  <Label className="text-xs text-muted-foreground">{phoneLabel} *</Label>

                  <div
                    className={isLandline ? 'mt-1 flex items-center gap-1.5' : 'mt-1'}
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
                        className="h-10 w-12 shrink-0 rounded-lg bg-muted px-1 text-center font-mono text-xs font-semibold tracking-wide tabular-nums"
                      />
                    )}

                    <Input
                      {...register(inputName, {
                        required: `${validationLabel} مطلوب`,
                        onChange: (event: any) => {
                          event.target.value = event.target.value
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
                            `${validationLabel} يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقمًا`
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
                      className={`h-10 rounded-lg text-left text-sm font-mono tracking-wide tabular-nums ${
                        isLandline ? 'min-w-0 flex-1' : 'w-full'
                      }`}
                    />
                  </div>

                  {fieldError && (
                    <p className="mt-1 text-xs text-destructive">{fieldError.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <span className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {isWhatsApp ? 'اختياري' : 'مطلوب'}
                  </span>
                  {isWhatsApp ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(phoneIndex)}
                      className="h-10 w-10 rounded-lg text-destructive hover:text-destructive"
                      title="حذف رقم واتساب"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!hasWhatsApp && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ number: '', type: 'واتساب' })}
          className="rounded-xl"
        >
          <Plus className="ml-2 h-4 w-4" />
          إضافة رقم واتساب اختياري
        </Button>
      )}
    </div>
  );
}

function InitialPaymentsSection({
  total,
  paymentMethods,
  banks,
  isBanksLoading,
  register,
  control,
  errors,
  onAmountInput,
}: any) {
  const { fields, append, remove } = useFieldArray({ control, name: 'initialPayments' });
  const payments = useWatch({ control, name: 'initialPayments' }) || [];
  const bankOptions = [
    ['', isBanksLoading ? 'جارٍ تحميل البنوك...' : 'اختر البنك'],
    ...banks.map((bank: any) => [
      bank.id,
      `${bank.nameAr ?? bank.name_ar ?? bank.nameEn ?? bank.name_en} — ${bank.nameEn ?? bank.name_en}`,
    ]),
  ];
  const collectedAmount = payments.reduce(
    (sum: number, payment: any) => sum + (Number(payment?.amount) || 0),
    0,
  );
  const remainingAmount = Math.max(Number(total) - collectedAmount, 0);
  const newPayment = () => {
    if (remainingAmount <= 0.009) return;
    append({
      amount: Number(remainingAmount.toFixed(2)),
      paymentMethodId: null,
      paymentDetails: {
        transferDate: '',
        bankId: '',
        bankName: '',
        referenceNumber: '',
        chequeNumber: '',
        chequeDueDate: '',
        transactionDate: '',
        receiptNumber: '',
      },
    });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold">تسجيل مبلغ التحصيل</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            يمكن توزيع المبلغ المحصل على أكثر من وسيلة دفع. سيُنشأ إيصال مستقل لكل وسيلة.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={newPayment}
          disabled={remainingAmount <= 0.009}
          className="rounded-xl"
        >
          <Plus className="ml-2 h-4 w-4" /> إضافة وسيلة دفع
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const payment = payments[index] || {};
          const method = paymentMethods.find(
            (item: any) => Number(item.id) === Number(payment.paymentMethodId),
          );
          const code = String(method?.code || '')
            .toUpperCase()
            .replace(/_/g, '');
          const entryErrors = errors.initialPayments?.[index] || {};
          const prefix = `initialPayments.${index}`;
          const otherPaymentsTotal = payments.reduce(
            (sum: number, item: any, itemIndex: number) =>
              itemIndex === index ? sum : sum + (Number(item?.amount) || 0),
            0,
          );
          const maximumForThisPayment = Math.max(Number(total) - otherPaymentsTotal, 0);
          return (
            <div key={field.id} className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">دفعة {index + 1}</span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="ml-1 h-4 w-4" /> حذف
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>المبلغ المحصل</Label>
                  <div className="relative mt-2">
                    <Input
                      type="number"
                      min="0.01"
                      max={maximumForThisPayment}
                      step="0.01"
                      {...register(`${prefix}.amount`, {
                        valueAsNumber: true,
                        required: 'المبلغ المحصل مطلوب',
                        min: { value: 0.01, message: 'المبلغ يجب أن يكون أكبر من صفر' },
                        validate: (value: number) =>
                          Number(value || 0) <= maximumForThisPayment ||
                          'إجمالي وسائل الدفع لا يمكن أن يتجاوز إجمالي العقد',
                      })}
                      variant={entryErrors.amount ? 'failure' : 'default'}
                      aria-invalid={Boolean(entryErrors.amount)}
                      onInput={onAmountInput}
                      className="h-12 rounded-xl pl-16 text-lg font-semibold"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      جنيه
                    </div>
                  </div>
                  {entryErrors.amount && <ErrorText>{entryErrors.amount.message}</ErrorText>}
                </div>
                <SelectField
                  label="طريقة الدفع"
                  registration={register(`${prefix}.paymentMethodId`, {
                    required: 'طريقة الدفع مطلوبة',
                    valueAsNumber: true,
                  })}
                  options={paymentMethods.map((item: any) => [
                    item.id,
                    item.nameAr ?? item.name_ar ?? item.code,
                  ])}
                  control={control}
                  error={entryErrors.paymentMethodId?.message}
                />
              </div>
              {code === 'BANKTRANSFER' && (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <TextField
                    label="تاريخ الحوالة"
                    type="date"
                    registration={register(`${prefix}.paymentDetails.transferDate`, {
                      required: 'تاريخ الحوالة مطلوب',
                    })}
                    error={entryErrors.paymentDetails?.transferDate?.message}
                  />
                  <SelectField
                    label="البنك"
                    registration={register(`${prefix}.paymentDetails.bankId`, {
                      required: 'البنك مطلوب',
                      valueAsNumber: true,
                    })}
                    options={bankOptions}
                    control={control}
                    disabled={isBanksLoading}
                    error={entryErrors.paymentDetails?.bankId?.message}
                  />
                  <TextField
                    label="الرقم المرجعي"
                    registration={register(`${prefix}.paymentDetails.referenceNumber`, {
                      required: 'الرقم المرجعي مطلوب',
                      validate: (value: string) =>
                        /^\d+$/.test(value) || 'الرقم المرجعي يجب أن يحتوي على أرقام فقط',
                    })}
                    error={entryErrors.paymentDetails?.referenceNumber?.message}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onInput={(event: React.FormEvent<HTMLInputElement>) => {
                      event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
                    }}
                  />
                </div>
              )}
              {(code === 'INSTAPAY' || code === 'PAYSKY') && (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TextField
                    label="الرقم المرجعي"
                    registration={register(`${prefix}.paymentDetails.referenceNumber`, {
                      required: 'الرقم المرجعي مطلوب',
                      validate: (value: string) =>
                        /^\d+$/.test(value) || 'الرقم المرجعي يجب أن يحتوي على أرقام فقط',
                    })}
                    error={entryErrors.paymentDetails?.referenceNumber?.message}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onInput={(event: React.FormEvent<HTMLInputElement>) => {
                      event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
                    }}
                  />
                  <TextField
                    label="تاريخ العملية"
                    type="date"
                    registration={register(`${prefix}.paymentDetails.transactionDate`, {
                      required: 'تاريخ العملية مطلوب',
                    })}
                    error={entryErrors.paymentDetails?.transactionDate?.message}
                  />
                </div>
              )}
              {code === 'CHEQUE' && (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <SelectField
                    label="البنك"
                    registration={register(`${prefix}.paymentDetails.bankId`, {
                      required: 'البنك مطلوب',
                      valueAsNumber: true,
                    })}
                    options={bankOptions}
                    control={control}
                    disabled={isBanksLoading}
                    error={entryErrors.paymentDetails?.bankId?.message}
                  />
                  <TextField
                    label="رقم الشيك"
                    registration={register(`${prefix}.paymentDetails.chequeNumber`, {
                      required: 'رقم الشيك مطلوب',
                      validate: (value: string) =>
                        /^\d+$/.test(value) || 'رقم الشيك يجب أن يحتوي على أرقام فقط',
                    })}
                    error={entryErrors.paymentDetails?.chequeNumber?.message}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onInput={(event: React.FormEvent<HTMLInputElement>) => {
                      event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
                    }}
                  />
                  <TextField
                    label="تاريخ استحقاق الشيك"
                    type="date"
                    registration={register(`${prefix}.paymentDetails.chequeDueDate`, {
                      required: 'تاريخ الاستحقاق مطلوب',
                    })}
                    error={entryErrors.paymentDetails?.chequeDueDate?.message}
                  />
                </div>
              )}
              {code === 'CASH' && (
                <div className="mt-4">
                  <TextField
                    label="رقم الإيصال"
                    registration={register(`${prefix}.paymentDetails.receiptNumber`, {
                      required: 'رقم الإيصال مطلوب',
                      validate: (value: string) =>
                        /^\d+$/.test(value) || 'رقم الايصال يجب أن يحتوي على أرقام فقط',
                    })}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onInput={(event: React.FormEvent<HTMLInputElement>) => {
                      event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
                    }}
                    error={entryErrors.paymentDetails?.receiptNumber?.message}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function AddOnReceiptSection({
  total,
  additionalServices,
  amount,
  remainingAmount,
  paidPercentage,
  paymentMethodCode,
  paymentMethodLabel,
  paymentMethods,
  banks,
  isBanksLoading,
  register,
  control,
  errors,
  onAmountInput,
}: any) {
  if (total <= 0) {
    return (
      <Card className="border-dashed border-border bg-muted/20 shadow-sm">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          لم يتم اختيار خدمات إضافية. لن يتم إنشاء فاتورة أو إيصال خدمات إضافية.
        </CardContent>
      </Card>
    );
  }

  const bankOptions = [
    ['', isBanksLoading ? 'جارٍ تحميل البنوك...' : 'اختر البنك'],
    ...banks.map((bank: any) => [
      bank.id,
      `${bank.nameAr ?? bank.name_ar ?? bank.nameEn ?? bank.name_en} — ${bank.nameEn ?? bank.name_en}`,
    ]),
  ];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <Card className="border-amber-200 bg-card shadow-sm dark:border-amber-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            تحصيل الإضافات وإيصال مستقل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/20">
            تُحصّل الخدمات الإضافية والأجهزة في إيصال منفصل عن إيصال العقد والخطة.
          </div> */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>مبلغ إيصال الإضافات</Label>
              <div className="relative mt-2">
                <Input
                  type="number"
                  min="0.01"
                  max={total}
                  step="0.01"
                  {...register('addOnPayment.amount', {
                    valueAsNumber: true,
                    required: 'مبلغ إيصال الإضافات مطلوب',
                    validate: (value: number) =>
                      Math.abs(Number(value || 0) - total) < 0.01 ||
                      'يجب تحصيل إجمالي الإضافات كاملًا في إيصال منفصل',
                  })}
                  variant={errors.addOnPayment?.amount ? 'failure' : 'default'}
                  aria-invalid={Boolean(errors.addOnPayment?.amount)}
                  onInput={onAmountInput}
                  className="h-12 rounded-xl pl-16 text-lg font-semibold"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  جنيه
                </div>
              </div>
              {errors.addOnPayment?.amount && (
                <ErrorText>{String(errors.addOnPayment.amount.message)}</ErrorText>
              )}
            </div>

            <SelectField
              label="طريقة دفع الإضافات"
              registration={register('addOnPayment.paymentMethodId', {
                required: 'طريقة دفع الإضافات مطلوبة',
                valueAsNumber: true,
              })}
              options={paymentMethods.map((method: any) => [
                method.id,
                method.nameAr ?? method.name_ar ?? method.code,
              ])}
              control={control}
              error={errors.addOnPayment?.paymentMethodId?.message}
            />
          </div>

          {paymentMethodCode === 'BANKTRANSFER' && (
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-3">
              <TextField
                label="تاريخ الحوالة"
                type="date"
                registration={register('addOnPayment.paymentDetails.transferDate', {
                  required: 'تاريخ الحوالة مطلوب',
                })}
                error={errors.addOnPayment?.paymentDetails?.transferDate?.message}
              />
              <SelectField
                label="البنك"
                registration={register('addOnPayment.paymentDetails.bankId', {
                  required: 'البنك مطلوب',
                  valueAsNumber: true,
                })}
                options={bankOptions}
                control={control}
                disabled={isBanksLoading}
                error={errors.addOnPayment?.paymentDetails?.bankId?.message}
                placeholder={isBanksLoading ? 'جارٍ تحميل البنوك...' : 'اختر البنك'}
                searchPlaceholder="ابحث عن بنك..."
              />
              <TextField
                label="الرقم المرجعي"
                registration={register('addOnPayment.paymentDetails.referenceNumber', {
                  required: 'الرقم المرجعي مطلوب',
                  validate: (value: string) =>
                    /^\d+$/.test(value) || 'الرقم المرجعي يجب أن يحتوي على أرقام فقط',
                })}
                error={errors.addOnPayment?.paymentDetails?.referenceNumber?.message}
                placeholder="الرقم المرجعي"
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(event: React.FormEvent<HTMLInputElement>) => {
                  event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
                }}
              />
            </div>
          )}

          {(paymentMethodCode === 'INSTAPAY' || paymentMethodCode === 'PAYSKY') && (
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-2">
              <TextField
                label="الرقم المرجعي"
                registration={register('addOnPayment.paymentDetails.referenceNumber', {
                  required: 'الرقم المرجعي مطلوب',
                  validate: (value: string) =>
                    /^\d+$/.test(value) || 'الرقم المرجعي يجب أن يحتوي على أرقام فقط',
                })}
                error={errors.addOnPayment?.paymentDetails?.referenceNumber?.message}
                placeholder="الرقم المرجعي"
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(event: React.FormEvent<HTMLInputElement>) => {
                  event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
                }}
              />
              <TextField
                label="تاريخ العملية"
                type="date"
                registration={register('addOnPayment.paymentDetails.transactionDate', {
                  required: 'تاريخ العملية مطلوب',
                })}
                error={errors.addOnPayment?.paymentDetails?.transactionDate?.message}
              />
            </div>
          )}

          {paymentMethodCode === 'CHEQUE' && (
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-3">
              <SelectField
                label="البنك"
                registration={register('addOnPayment.paymentDetails.bankId', {
                  required: 'البنك مطلوب',
                  valueAsNumber: true,
                })}
                options={bankOptions}
                control={control}
                disabled={isBanksLoading}
                error={errors.addOnPayment?.paymentDetails?.bankId?.message}
                placeholder={isBanksLoading ? 'جارٍ تحميل البنوك...' : 'اختر البنك'}
                searchPlaceholder="ابحث عن بنك..."
              />
              <TextField
                label="رقم الشيك"
                registration={register('addOnPayment.paymentDetails.chequeNumber', {
                  required: 'رقم الشيك مطلوب',
                  validate: (value: string) =>
                    /^\d+$/.test(value) || 'رقم الشيك يجب أن يحتوي على أرقام فقط',
                })}
                error={errors.addOnPayment?.paymentDetails?.chequeNumber?.message}
                placeholder="رقم الشيك"
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(event: React.FormEvent<HTMLInputElement>) => {
                  event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
                }}
              />
              <TextField
                label="تاريخ استحقاق الشيك"
                type="date"
                registration={register('addOnPayment.paymentDetails.chequeDueDate', {
                  required: 'تاريخ استحقاق الشيك مطلوب',
                })}
                error={errors.addOnPayment?.paymentDetails?.chequeDueDate?.message}
              />
            </div>
          )}

          {paymentMethodCode === 'CASH' && (
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <TextField
                label="رقم إيصال الإضافات"
                registration={register('addOnPayment.paymentDetails.receiptNumber', {
                  required: 'رقم إيصال الإضافات مطلوب',
                  validate: (value) =>
                    String(value ?? '').trim().length > 0 || 'رقم إيصال الإضافات مطلوب',
                })}
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(event: React.FormEvent<HTMLInputElement>) => {
                  event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
                }}
                error={errors.addOnPayment?.paymentDetails?.receiptNumber?.message}
                placeholder="رقم الإيصال"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* <TextField
              label="سبب تحصيل الإضافات"
              registration={register('addOnPayment.collectionReason', {
                required: 'سبب تحصيل الإضافات مطلوب',
              })}
              error={errors.addOnPayment?.collectionReason?.message}
              placeholder="إضافات العقد"
            /> */}
            <TextField
              label="ملاحظات إيصال الإضافات"
              registration={register('addOnPayment.notes')}
              error={errors.addOnPayment?.notes?.message}
              placeholder="ملاحظات اختيارية"
            />
          </div>

          <div className="rounded-2xl bg-muted p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">نسبة سداد الإضافات</span>
              <span className="font-bold">{paidPercentage.toFixed(0)}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${paidPercentage}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span>المحصل: {amount.toLocaleString('ar-EG')} جنيه</span>
              <span>المتبقي: {remainingAmount.toLocaleString('ar-EG')} جنيه</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            مراجعة إيصال الإضافات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReviewRow label="الخدمات الإضافية" value={`${additionalServices.length} عناصر`} />
          <Separator />
          <ReviewRow
            label="إجمالي إيصال الإضافات"
            value={`${total.toLocaleString('ar-EG')} جنيه`}
          />
          <ReviewRow label="المحصل" value={`${amount.toLocaleString('ar-EG')} جنيه`} />
          <ReviewRow label="المتبقي" value={`${remainingAmount.toLocaleString('ar-EG')} جنيه`} />
          <ReviewRow label="طريقة الدفع" value={paymentMethodLabel} />
        </CardContent>
      </Card>
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

function TextField({
  label,
  registration,
  error,
  type = 'text',
  placeholder = '',
  ...inputProps
}: any) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type={type}
        {...registration}
        {...inputProps}
        placeholder={placeholder}
        variant={error ? 'failure' : 'default'}
        aria-invalid={Boolean(error)}
        className="mt-2 h-11 rounded-xl"
      />
      {error && <ErrorText>{String(error)}</ErrorText>}
    </div>
  );
}
function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = 'اختر من القائمة',
  searchPlaceholder = 'ابحث في الخيارات...',
  emptyMessage = 'لا توجد نتائج مطابقة',
  disabled = false,
  error = false,
  className,
}: any) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find(
    ([optionValue]: any) =>
      String(optionValue) === String(value ?? '') && String(optionValue) !== '',
  );
  const availableOptions = options.filter(([optionValue]: any) => String(optionValue) !== '');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={error}
          disabled={disabled}
          className={cn(
            'relative mt-2 h-11 w-full justify-start rounded-xl bg-background py-0 pl-10 pr-3 text-right font-normal hover:bg-background',
            !selectedOption && 'text-muted-foreground',
            error && 'border-error bg-error/10 text-error hover:bg-error/10 hover:text-error',
            className,
          )}
        >
          <span className="truncate">{selectedOption?.[1] ?? placeholder}</span>
          <ChevronsUpDown className="absolute left-3 h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent dir="rtl" align="start" className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {availableOptions.map(([optionValue, optionLabel]: any) => (
                <CommandItem
                  key={String(optionValue)}
                  value={`${optionLabel} ${optionValue}`}
                  onSelect={() => {
                    onValueChange(String(optionValue));
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'ml-2 h-4 w-4',
                      String(value ?? '') === String(optionValue) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">{optionLabel}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SelectField({
  label,
  registration,
  options,
  error,
  control,
  placeholder,
  searchPlaceholder,
  disabled = false,
}: any) {
  const value = useWatch({ control, name: registration.name });

  return (
    <div>
      <Label>{label}</Label>
      <SearchableSelect
        value={value}
        options={options}
        error={Boolean(error)}
        disabled={disabled}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        onValueChange={(nextValue: string) => {
          const event = {
            target: { name: registration.name, value: nextValue },
            type: 'change',
          };
          registration.onChange(event);
          registration.onBlur({
            target: { name: registration.name, value: nextValue },
            type: 'blur',
          });
        }}
      />
      {error && <ErrorText>{String(error)}</ErrorText>}
    </div>
  );
}
/* =========================================================
   FINANCIAL SUMMARY CARD
========================================================= */

function FinancialSummaryCard({
  title,
  description,
  unitPrice,
  quantity,
  quantityLabel = 'الكمية',
  discountAmount,
  discountPercentage,
  totalBeforeDiscount,
  totalAfterDiscount,
}: any) {
  const formatNumber = (value: number) =>
    Number(value || 0).toLocaleString('ar-EG', { maximumFractionDigits: 2 });

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="min-h-10">
        <h3 className="text-sm font-bold">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <SummaryDetail label="سعر الوحدة" value={formatNumber(unitPrice)} suffix="جنيه" />
        <SummaryDetail label={quantityLabel} value={formatNumber(quantity)} />
        <SummaryDetail label="قيمة الخصم" value={formatNumber(discountAmount)} suffix="جنيه" />
        <SummaryDetail label="نسبة الخصم" value={formatNumber(discountPercentage)} />
      </div>

      <div className="mt-4 space-y-2 border-t border-border pt-3">
        <SummaryTotal label="الإجمالي قبل الخصم" value={formatNumber(totalBeforeDiscount)} />
        <SummaryTotal
          label="الإجمالي بعد الخصم"
          value={formatNumber(totalAfterDiscount)}
          emphasized
        />
      </div>
    </div>
  );
}

function SummaryDetail({ label, value, suffix }: any) {
  return (
    <div className="rounded-xl bg-muted/45 px-3 py-2.5">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">
        {value}{' '}
        {suffix ? (
          <span className="text-xs font-normal text-muted-foreground">{suffix}</span>
        ) : null}
      </div>
    </div>
  );
}

function SummaryTotal({ label, value, emphasized = false }: any) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className={emphasized ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
      <span className={emphasized ? 'text-base font-bold' : 'font-semibold'}>{value} جنيه</span>
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

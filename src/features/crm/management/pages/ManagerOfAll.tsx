import * as React from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Check,
  X,
  Calendar,
  Phone,
  MapPin,
  User,
  Building2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  MessageSquare,
} from 'lucide-react';

import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';

import { Textarea } from 'src/components/ui/textarea';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';

const mockCustomers = [
  {
    id: 1,

    manager: 'أحمد محمد',
    supervisor: 'محمد السيد',
    senior: 'علي حسن',
    representative: 'حسن أحمد',

    customerName: 'صيدليات الشفاء',
    customerCode: '686492',

    customerType: 'Single',
    customerStatus: 'PENDING_APPROVAL',

    contractDate: '10/09/2026',
    installationDate: '29/09/2026',
    zoneName: 'Zone A',

    address: 'شارع فيصل - الجيزة',

    contacts: [
      {
        type: 'OWNER',
        name: 'محمد عبدالله',
        phones: ['01012345678', '01123456789'],
      },
      {
        type: 'MANAGER',
        name: 'أحمد علي',
        phones: ['01234567890'],
      },
    ],

    contractType: 'اشتراك شهري',
    saleType: 'جديد',
    previousProgram: 'لا يوجد',

    program: 'E-Plus',
    subscription: 600,
    discountAmount: 284,
    remainingContract: 499,

    joiningFee: 10000,
    advancePayment: 9491,

    additionalUnits: 3,

    mainPharmacy: 'صيدلية الشفاء الرئيسية',

    managerNotes: '',
    notes: 'تم الاتفاق على موعد التركيب',
  },

  {
    id: 2,

    manager: 'أحمد محمد',
    supervisor: 'عمر محمود',
    senior: 'يوسف خالد',
    representative: 'كريم حسن',

    customerName: 'صيدليات النور',
    customerCode: '687231',

    customerType: 'Chain',
    customerStatus: 'PENDING_APPROVAL',

    contractDate: '22/09/2026',
    installationDate: '02/10/2026',
    zoneName: 'Zone B',

    address: 'مدينة نصر - القاهرة',

    contacts: [
      {
        type: 'OWNER',
        name: 'محمود حسن',
        phones: ['01098765432', '01198765432'],
      },
      {
        type: 'MANAGER',
        name: 'خالد محمد',
        phones: ['01298765432', '01087654321'],
      },
    ],

    contractType: 'اشتراك شهري',
    saleType: 'جديد',
    previousProgram: 'E-Plus',

    program: 'E-Chain',
    subscription: 500,
    discountAmount: 0,
    remainingContract: 500,

    joiningFee: 10000,
    advancePayment: 10000,

    additionalUnits: 5,

    mainPharmacy: 'صيدلية النور الرئيسية',

    managerNotes: '',
    notes: '',
  },
];

const formatMoney = (value: number) => `${value.toLocaleString('en-US')} ج.م`;

const getContact = (customer: any, type: string) => {
  return customer.contacts?.find((contact: any) => contact.type === type);
};

export default function ManagerOfAll() {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('PENDING_APPROVAL');
  const [program, setProgram] = React.useState('all');

  const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null);

  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const [expandedRows, setExpandedRows] = React.useState<number[]>([]);

  /* Reject */
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');

  /* Manager Notes */
  const [managerNotesOpen, setManagerNotesOpen] = React.useState(false);

  const [managerNote, setManagerNote] = React.useState('');

  const [actionCustomer, setActionCustomer] = React.useState<any>(null);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const handleApprove = (customer: any) => {
    console.log('Approve contract:', customer.id);

    // Later:
    // await approveContract(customer.id)
  };

  /* -------------------------------- */
  /* Reject */
  /* -------------------------------- */

  const openRejectDialog = (customer: any) => {
    setActionCustomer(customer);
    setRejectReason('');
    setRejectOpen(true);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;

    console.log('Reject contract:', {
      customerId: actionCustomer?.id,
      reason: rejectReason,
    });

    setRejectOpen(false);
    setRejectReason('');
    setActionCustomer(null);

    // Later:
    // await rejectContract(actionCustomer.id, rejectReason)
  };

  /* -------------------------------- */
  /* Manager Notes */
  /* -------------------------------- */

  const openManagerNotesDialog = (customer: any) => {
    setActionCustomer(customer);
    setManagerNote(customer?.managerNotes || '');
    setManagerNotesOpen(true);
  };

  const handleSaveManagerNote = () => {
    if (!managerNote.trim()) return;

    console.log('Add manager note:', {
      customerId: actionCustomer?.id,
      note: managerNote,
    });

    setManagerNotesOpen(false);
    setManagerNote('');
    setActionCustomer(null);

    // Later:
    // await addManagerNote(actionCustomer.id, managerNote)
  };

  const filteredCustomers = mockCustomers.filter((customer) => {
    const searchTerm = search.toLowerCase();

    const owner = getContact(customer, 'OWNER');
    const managerContact = getContact(customer, 'MANAGER');

    const matchesContacts =
      owner?.name?.toLowerCase().includes(searchTerm) ||
      owner?.phones?.some((phone: string) => phone.includes(search)) ||
      managerContact?.name?.toLowerCase().includes(searchTerm) ||
      managerContact?.phones?.some((phone: string) => phone.includes(search));

    const matchesSearch =
      customer.customerName.toLowerCase().includes(searchTerm) ||
      customer.customerCode.includes(search) ||
      customer.representative.toLowerCase().includes(searchTerm) ||
      customer.manager.toLowerCase().includes(searchTerm) ||
      customer.supervisor.toLowerCase().includes(searchTerm) ||
      customer.subscription.toLocaleString().includes(search) ||
      customer.program.toLowerCase().includes(searchTerm) ||
      customer.advancePayment.toLocaleString().includes(search) ||
      matchesContacts;

    const matchesStatus = status === 'all' || customer.customerStatus === status;

    const matchesProgram = program === 'all' || customer.program === program;

    return matchesSearch && matchesStatus && matchesProgram;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-[1800px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">عملاء تحت الانضمام</h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  مراجعة العقود الجديدة والموافقة عليها
                </p>
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={() => console.log('Refresh')}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_200px_200px_auto]">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث باسم العميل، الكود، المندوب أو جهة الاتصال..."
                  className="pr-10"
                />
              </div>

              {/* Program */}
              <Select value={program} onValueChange={setProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="البرنامج" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">كل البرامج</SelectItem>

                  <SelectItem value="E-Plus">E-Plus</SelectItem>

                  <SelectItem value="E-Chain">E-Chain</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setStatus('PENDING_APPROVAL');
                  setProgram('all');
                }}
              >
                <Filter className="ml-2 h-4 w-4" />
                إعادة ضبط
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>العقود في انتظار المراجعة</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">{filteredCustomers.length} عقد</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {/* Header */}
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="w-12 px-4 py-4"></th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      اسم المدير
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      اسم المشرف
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      اسم المندوب
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      نوع الصيدلية
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      اسم المنشأة
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      اسم صاحب المنشأة
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      هاتف صاحب المنشأة
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      اسم مدير المنشأة
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      هاتف مدير المنشأة
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      تاريخ التعاقد
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      تاريخ التركيب
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      البرنامج
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      فرع المتحدة
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      رسم الانضمام
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      الدفعة المقدمة
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      باقي التعاقد
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      الاشتراك
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">قيمة الخصم</th>

                    <th className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      الإجراءات
                    </th>
                  </tr>
                </thead>

                {/* Body */}
                <tbody>
                  {filteredCustomers.map((customer) => {
                    const expanded = expandedRows.includes(customer.id);

                    const isPending = customer.customerStatus === 'PENDING_APPROVAL';

                    const owner = getContact(customer, 'OWNER');

                    const managerContact = getContact(customer, 'MANAGER');

                    return (
                      <React.Fragment key={customer.id}>
                        {/* Main Row */}
                        <tr className="border-b transition-colors hover:bg-muted/30">
                          {/* Expand */}
                          <td className="px-4 py-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleRow(customer.id)}
                            >
                              {expanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </td>

                          {/* Sales Manager */}
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {customer.manager}
                            </div>
                          </td>

                          {/* Supervisor */}
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {customer.supervisor}
                            </div>
                          </td>

                          {/* Representative */}
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {customer.representative}
                            </div>
                          </td>

                          {/* Customer Type */}
                          <td className="whitespace-nowrap px-4 py-4">{customer.customerType}</td>

                          {/* Customer Name */}
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="font-medium">{customer.customerName}</div>

                            <div className="mt-1 text-xs text-muted-foreground">
                              كود: {customer.customerCode}
                            </div>
                          </td>

                          {/* Owner Name */}
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />

                              <span className="font-medium">{owner?.name || '-'}</span>
                            </div>
                          </td>

                          {/* Owner Phones */}
                          <td className="px-4 py-4">
                            <div className="min-w-[150px] space-y-1">
                              {owner?.phones?.length ? (
                                owner.phones.map((phone: string) => (
                                  <div
                                    key={phone}
                                    className="flex items-center gap-2 whitespace-nowrap"
                                  >
                                    <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                                    <span>{phone}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </td>

                          {/* Manager Contact Name */}
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />

                              <span className="font-medium">{managerContact?.name || '-'}</span>
                            </div>
                          </td>

                          {/* Manager Contact Phones */}
                          <td className="px-4 py-4">
                            <div className="min-w-[150px] space-y-1">
                              {managerContact?.phones?.length ? (
                                managerContact.phones.map((phone: string) => (
                                  <div
                                    key={phone}
                                    className="flex items-center gap-2 whitespace-nowrap"
                                  >
                                    <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                                    <span>{phone}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </td>

                          {/* Contract Date */}
                          <td className="whitespace-nowrap px-4 py-4">{customer.contractDate}</td>

                          {/* Installation Date */}
                          <td className="whitespace-nowrap px-4 py-4">
                            <span className="inline-flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />

                              {customer.installationDate}
                            </span>
                          </td>

                          {/* Program */}
                          <td className="whitespace-nowrap px-4 py-4">
                            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                              {customer.program}
                            </span>
                          </td>

                          {/* Zone Name */}
                          <td className="whitespace-nowrap px-4 py-4">{customer.zoneName}</td>

                          {/* Joining Fee */}
                          <td className="whitespace-nowrap px-4 py-4">{customer.joiningFee}</td>

                          {/* Advance Payment */}
                          <td className="whitespace-nowrap px-4 py-4">{customer.advancePayment}</td>

                          {/* Remaining */}
                          <td className="whitespace-nowrap px-4 py-4">
                            {customer.remainingContract}
                          </td>

                          {/* Subscription */}
                          <td className="whitespace-nowrap px-4 py-4 font-medium">
                            {formatMoney(customer.subscription)}
                          </td>

                          {/* Discount */}
                          <td className="whitespace-nowrap px-4 py-4">{formatMoney(customer.discountAmount)}</td>

                          {/* Actions */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1">
                              {isPending && (
                                <>
                                  {/* Approve */}
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(customer)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="ml-1.5 h-4 w-4" />
                                    موافقة
                                  </Button>

                                  {/* Add Manager Note */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openManagerNotesDialog(customer)}
                                  >
                                    <MessageSquare className="ml-1.5 h-4 w-4" />
                                    إضافة ملاحظات مدير البيع
                                  </Button>

                                  {/* Reject */}
                                  <Button size="sm" variant="destructive" onClick={() => {}}>
                                    <X className="ml-1.5 h-4 w-4" />
                                    رفض
                                  </Button>
                                </>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedCustomer(customer);

                                      setDetailsOpen(true);
                                    }}
                                  >
                                    <Eye className="ml-2 h-4 w-4" />
                                    عرض التفاصيل
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Details */}
                        {expanded && (
                          <tr className="border-b bg-muted/20">
                            <td colSpan={19} className="p-6">
                              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                                {/* Customer Data */}
                                <InfoBlock
                                  title="بيانات العميل"
                                  items={[
                                    ['اسم المنشأة', customer.customerName],
                                    ['كود العميل', customer.customerCode],
                                    ['نوع الصيدلية', customer.customerType],
                                  ]}
                                />

                                {/* Address */}
                                <InfoBlock
                                  title="بيانات العنوان"
                                  items={[
                                    ['العنوان', customer.address],
                                    ['الفرع الرئيسي', customer.mainPharmacy],
                                    ['وحدات إضافية', String(customer.additionalUnits)],
                                  ]}
                                />

                                {/* Contacts */}
                                <div className="rounded-xl border bg-background p-4">
                                  <h3 className="mb-4 font-semibold">جهات الاتصال</h3>

                                  <div className="space-y-4">
                                    {/* Owner */}
                                    <div className="rounded-lg border bg-muted/20 p-3">
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />

                                        <div>
                                          <p className="text-xs text-muted-foreground">
                                            صاحب المنشأة
                                          </p>

                                          <p className="font-medium">{owner?.name || '-'}</p>
                                        </div>
                                      </div>

                                      <div className="mt-3 space-y-1">
                                        {owner?.phones?.map((phone: string) => (
                                          <div
                                            key={phone}
                                            className="flex items-center gap-2 text-sm"
                                          >
                                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />

                                            {phone}
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Manager */}
                                    <div className="rounded-lg border bg-muted/20 p-3">
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />

                                        <div>
                                          <p className="text-xs text-muted-foreground">
                                            مدير المنشأة
                                          </p>

                                          <p className="font-medium">
                                            {managerContact?.name || '-'}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="mt-3 space-y-1">
                                        {managerContact?.phones?.map((phone: string) => (
                                          <div
                                            key={phone}
                                            className="flex items-center gap-2 text-sm"
                                          >
                                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />

                                            {phone}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Contract Data */}
                                <InfoBlock
                                  title="بيانات التعاقد"
                                  items={[
                                    ['نوع التعاقد', customer.contractType],
                                    ['نوع البيع', customer.saleType],
                                    ['البرنامج', customer.program],
                                    ['البرنامج السابق', customer.previousProgram],
                                  ]}
                                />

                                {/* Financial Data */}
                                <InfoBlock
                                  title="البيانات المالية"
                                  items={[
                                    ['رسم الانضمام', formatMoney(customer.joiningFee)],
                                    ['الدفعة المقدمة', formatMoney(customer.advancePayment)],
                                    ['الاشتراك', formatMoney(customer.subscription)],
                                    ['الخصم', `${customer.discount}%`],
                                    ['باقي التعاقد', formatMoney(customer.remainingContract)],
                                  ]}
                                />
                              </div>

                              {/* Notes */}
                              <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <NoteBox title="ملاحظات مدير البيع" value={customer.managerNotes} />

                                <NoteBox
                                  title="الملاحظات"
                                  value={customer.notes || 'لا توجد ملاحظات'}
                                />
                              </div>

                              {/* Actions */}
                              {isPending && (
                                <div className="mt-6 flex flex-wrap justify-end gap-2 border-t pt-5">
                                  {/* Approve */}
                                  <Button
                                    onClick={() => handleApprove(customer)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="ml-2 h-4 w-4" />
                                    الموافقة على العقد
                                  </Button>

                                  {/* Add Manager Note */}
                                  <Button
                                    variant="outline"
                                    onClick={() => openManagerNotesDialog(customer)}
                                  >
                                    <MessageSquare className="ml-2 h-4 w-4" />
                                    إضافة ملاحظات مدير البيع
                                  </Button>

                                  {/* Reject */}
                                  <Button
                                    variant="destructive"
                                    onClick={() => openRejectDialog(customer)}
                                  >
                                    <X className="ml-2 h-4 w-4" />
                                    رفض العقد
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              {/* Empty State */}
              {filteredCustomers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Building2 className="mb-4 h-10 w-10 text-muted-foreground" />

                  <h3 className="font-semibold">لا توجد نتائج</h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    لا توجد عقود مطابقة للبحث الحالي
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* -------------------------------- */}
      {/* Customer Details Dialog */}
      {/* -------------------------------- */}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent dir="rtl" className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل العقد</DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Header */}
              <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-7 w-7" />
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-bold">{selectedCustomer.customerName}</h2>

                  <p className="text-sm text-muted-foreground">
                    كود العميل: {selectedCustomer.customerCode}
                  </p>
                </div>

                {selectedCustomer.customerStatus === 'PENDING_APPROVAL' ? (
                  <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-600">
                    في انتظار الموافقة
                  </span>
                ) : selectedCustomer.customerStatus === 'APPROVED' ? (
                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                    تمت الموافقة
                  </span>
                ) : (
                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600">
                    مرفوض
                  </span>
                )}
              </div>

              {/* Basic Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem
                  icon={<User />}
                  label="اسم صاحب المنشأة"
                  value={getContact(selectedCustomer, 'OWNER')?.name || '-'}
                />

                <DetailItem
                  icon={<Phone />}
                  label="هواتف صاحب المنشأة"
                  value={getContact(selectedCustomer, 'OWNER')?.phones?.join(' - ') || '-'}
                />

                <DetailItem
                  icon={<User />}
                  label="اسم مدير المنشأة"
                  value={getContact(selectedCustomer, 'MANAGER')?.name || '-'}
                />

                <DetailItem
                  icon={<Phone />}
                  label="هواتف مدير المنشأة"
                  value={getContact(selectedCustomer, 'MANAGER')?.phones?.join(' - ') || '-'}
                />

                <DetailItem icon={<MapPin />} label="العنوان" value={selectedCustomer.address} />

                <DetailItem
                  icon={<Building2 />}
                  label="نوع الصيدلية"
                  value={selectedCustomer.customerType}
                />

                <DetailItem
                  icon={<Calendar />}
                  label="تاريخ التعاقد"
                  value={selectedCustomer.contractDate}
                />

                <DetailItem
                  icon={<Calendar />}
                  label="تاريخ التركيب"
                  value={selectedCustomer.installationDate}
                />
              </div>

              {/* Financial Metrics */}
              <div className="grid gap-4 md:grid-cols-3">
                <Metric label="رسم الانضمام" value={formatMoney(selectedCustomer.joiningFee)} />

                <Metric
                  label="الدفعة المقدمة"
                  value={formatMoney(selectedCustomer.advancePayment)}
                />

                <Metric label="الاشتراك" value={formatMoney(selectedCustomer.subscription)} />
              </div>

              {/* Contract Information */}
              <InfoBlock
                title="بيانات التعاقد"
                items={[
                  ['نوع التعاقد', selectedCustomer.contractType],
                  ['نوع البيع', selectedCustomer.saleType],
                  ['البرنامج', selectedCustomer.program],
                  ['البرنامج السابق', selectedCustomer.previousProgram],
                  ['الخصم', `${selectedCustomer.discount}%`],
                  ['باقي التعاقد', formatMoney(selectedCustomer.remainingContract)],
                  ['الوحدات الإضافية', String(selectedCustomer.additionalUnits)],
                ]}
              />

              {/* Notes */}
              <NoteBox title="ملاحظات مدير البيع" value={selectedCustomer.managerNotes} />

              <NoteBox title="الملاحظات" value={selectedCustomer.notes || 'لا توجد ملاحظات'} />

              {/* Actions */}
              {selectedCustomer.customerStatus === 'PENDING_APPROVAL' && (
                <div className="flex flex-wrap justify-end gap-2 border-t pt-5">
                  {/* Approve */}
                  <Button
                    onClick={() => {
                      handleApprove(selectedCustomer);

                      setDetailsOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="ml-2 h-4 w-4" />
                    الموافقة على العقد
                  </Button>

                  {/* Add Manager Note */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDetailsOpen(false);

                      openManagerNotesDialog(selectedCustomer);
                    }}
                  >
                    <MessageSquare className="ml-2 h-4 w-4" />
                    إضافة ملاحظات مدير البيع
                  </Button>

                  {/* Reject */}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDetailsOpen(false);

                      openRejectDialog(selectedCustomer);
                    }}
                  >
                    <X className="ml-2 h-4 w-4" />
                    رفض العقد
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* -------------------------------- */}
      {/* Manager Notes Dialog */}
      {/* -------------------------------- */}

      <Dialog open={managerNotesOpen} onOpenChange={setManagerNotesOpen}>
        <DialogContent dir="rtl" className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              إضافة ملاحظات مدير البيع
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Customer */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">العميل</p>

              <p className="mt-1 font-semibold">{actionCustomer?.customerName}</p>

              <p className="mt-1 text-xs text-muted-foreground">
                كود العميل: {actionCustomer?.customerCode}
              </p>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                ملاحظات مدير البيع
                <span className="mr-1 text-red-500">*</span>
              </label>

              <Textarea
                value={managerNote}
                onChange={(e) => setManagerNote(e.target.value)}
                placeholder="اكتب ملاحظات مدير البيع..."
                rows={5}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-start">
            <Button onClick={handleSaveManagerNote} disabled={!managerNote.trim()}>
              <Check className="ml-2 h-4 w-4" />
              حفظ الملاحظة
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setManagerNotesOpen(false);
                setManagerNote('');
                setActionCustomer(null);
              }}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -------------------------------- */}
      {/* Reject Dialog */}
      {/* -------------------------------- */}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent dir="rtl" className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>رفض العقد</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm leading-6 text-muted-foreground">
                سيتم رفض عقد العميل{' '}
                <span className="font-semibold text-foreground">
                  {actionCustomer?.customerName}
                </span>
                . يجب إدخال سبب الرفض قبل المتابعة.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                سبب الرفض
                <span className="mr-1 text-red-500">*</span>
              </label>

              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="اكتب سبب رفض العقد..."
                rows={5}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-start">
            <Button variant="destructive" disabled={!rejectReason.trim()} onClick={handleReject}>
              <X className="ml-2 h-4 w-4" />
              تأكيد الرفض
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setRejectOpen(false);
                setRejectReason('');
                setActionCustomer(null);
              }}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------- */
/* Components */
/* -------------------------------- */

function InfoBlock({ title, items }: any) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <h3 className="mb-4 font-semibold">{title}</h3>

      <div className="space-y-3">
        {items.map(([label, value]: [string, string]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">{label}</span>

            <span className="text-left text-sm font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoteBox({ title, value }: any) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <h3 className="mb-2 font-semibold">{title}</h3>

      <p className="text-sm leading-7 text-muted-foreground">{value}</p>
    </div>
  );
}

function DetailItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        {React.cloneElement(icon, {
          className: 'h-4 w-4',
        })}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>

        <p className="mt-1 break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Metric({ label, value }: any) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

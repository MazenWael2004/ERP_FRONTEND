import * as React from 'react';
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Building2,
  MapPin,
  Receipt,
  Banknote,
  WalletCards,
  ChevronDown,
} from 'lucide-react';

import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';

import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';

import { Badge } from 'src/components/ui/badge';
import { Separator } from 'src/components/ui/separator';

// ============================================================
// MOCK DATA
// ============================================================

const mockContracts = [
  {
    id: 101,
    contractNumber: 'CNT-2026-00125',
    pharmacyName: 'صيدلية العزبي - فرع الدقي',
    zoneName: 'منطقة الجيزة',
    branchName: 'فرع الدقي',
  },
  {
    id: 102,
    contractNumber: 'CNT-2026-00131',
    pharmacyName: 'صيدليات سيف - فرع المهندسين',
    zoneName: 'منطقة شمال الجيزة',
    branchName: 'فرع المهندسين',
  },
  {
    id: 103,
    contractNumber: 'CNT-2026-00142',
    pharmacyName: 'صيدلية مصر الجديدة',
    zoneName: 'منطقة القاهرة',
    branchName: 'فرع مصر الجديدة',
  },
];

const mockAdditionalUnitRequests = [
  {
    id: 501,
    contractId: 101,
    requestNumber: 'AUR-2026-00031',
    requestedAt: '2026-10-02',
    approvedAt: '2026-10-04',
    quantity: 2,
    unitPrice: 4000,
    totalAmount: 8000,
    status: 'APPROVED',
  },
  {
    id: 502,
    contractId: 101,
    requestNumber: 'AUR-2026-00035',
    requestedAt: '2026-10-03',
    approvedAt: '2026-10-05',
    quantity: 1,
    unitPrice: 4000,
    totalAmount: 4000,
    status: 'APPROVED',
  },
  {
    id: 503,
    contractId: 102,
    requestNumber: 'AUR-2026-00038',
    requestedAt: '2026-10-04',
    approvedAt: '2026-10-05',
    quantity: 3,
    unitPrice: 4000,
    totalAmount: 12000,
    status: 'APPROVED',
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function CollectAdditionalUnits() {
  const [selectedContractId, setSelectedContractId] = React.useState<string>('101');

  const [selectedRequestIds, setSelectedRequestIds] = React.useState<number[]>([]);

  const [paymentMethod, setPaymentMethod] = React.useState<string>('');

  const selectedContract = mockContracts.find(
    (contract) => contract.id === Number(selectedContractId),
  );

  const approvedRequests = mockAdditionalUnitRequests.filter(
    (request) => request.contractId === Number(selectedContractId) && request.status === 'APPROVED',
  );

  const selectedRequests = approvedRequests.filter((request) =>
    selectedRequestIds.includes(request.id),
  );

  const totalUnits = selectedRequests.reduce((sum, request) => sum + request.quantity, 0);

  const totalAmount = selectedRequests.reduce((sum, request) => sum + request.totalAmount, 0);

  const today = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleContractChange = (value: string) => {
    setSelectedContractId(value);
    setSelectedRequestIds([]);
  };

  const toggleRequest = (requestId: number) => {
    setSelectedRequestIds((current) => {
      if (current.includes(requestId)) {
        return current.filter((id) => id !== requestId);
      }

      return [...current, requestId];
    });
  };

  const handleSubmit = () => {
    if (!selectedContract) {
      alert('برجاء اختيار العقد');
      return;
    }

    if (selectedRequests.length === 0) {
      alert('برجاء اختيار طلب إضافي واحد على الأقل');
      return;
    }

    if (!paymentMethod) {
      alert('برجاء اختيار طريقة الدفع');
      return;
    }

    const payload = {
      contractId: selectedContract.id,
      collectedAt: new Date(),
      collectionType: 'ADDITIONAL_UNIT',
      paymentMethod,
      amount: totalAmount,

      additionalUnits: selectedRequests.map((request) => ({
        requestId: request.id,
        quantity: request.quantity,
        unitPrice: request.unitPrice,
        totalAmount: request.totalAmount,
      })),
    };

    console.log('Additional Unit Collection:', payload);

    alert('تم تسجيل التحصيل بنجاح');
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div dir="rtl" className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">تحصيل الوحدات الإضافية</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              تسجيل تحصيل قيمة طلبات الوحدات الإضافية المعتمدة
            </p>
          </div>

          <Badge variant="outline" className="flex w-fit items-center gap-2 px-3 py-2">
            <Receipt className="h-4 w-4" />
            تحصيل وحدات إضافية
          </Badge>
        </div>

        {/* =====================================================
            BASIC COLLECTION INFORMATION
        ====================================================== */}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-5 w-5" />
              بيانات التحصيل
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {/* Visit Date */}

              <div className="space-y-2">
                <Label>تاريخ الزيارة</Label>

                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input value={today} readOnly className="bg-muted pr-10" />
                </div>

                <p className="text-xs text-muted-foreground">يتم تسجيل تاريخ الزيارة تلقائياً</p>
              </div>

              {/* Contract */}

              <div className="space-y-2">
                <Label>العقد / الصيدلية</Label>

                <Select value={selectedContractId} onValueChange={handleContractChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العقد" />
                  </SelectTrigger>

                  <SelectContent>
                    {mockContracts.map((contract) => (
                      <SelectItem key={contract.id} value={String(contract.id)}>
                        {contract.pharmacyName}
                        {' - '}
                        {contract.contractNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Zone */}

              <div className="space-y-2">
                <Label>المنطقة</Label>

                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={selectedContract?.zoneName || ''}
                    readOnly
                    className="bg-muted pr-10"
                  />
                </div>
              </div>
            </div>

            {/* Contract Information */}

            {selectedContract && (
              <div className="mt-5 rounded-lg border bg-muted/40 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-background p-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">الصيدلية</p>

                      <p className="font-medium">{selectedContract.pharmacyName}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">رقم العقد</p>

                    <p className="font-medium">{selectedContract.contractNumber}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">الفرع</p>

                    <p className="font-medium">{selectedContract.branchName}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* =====================================================
            APPROVED REQUESTS
        ====================================================== */}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-5 w-5" />
                  طلبات الوحدات الإضافية المعتمدة
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  اختر الطلبات التي سيتم تحصيل قيمتها
                </p>
              </div>

              <Badge variant="secondary">{approvedRequests.length} طلب معتمد</Badge>
            </div>
          </CardHeader>

          <CardContent>
            {approvedRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                <CheckCircle2 className="mb-3 h-10 w-10 text-muted-foreground" />

                <p className="font-medium">لا توجد طلبات وحدات إضافية معتمدة</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  لا يوجد مبلغ مستحق للتحصيل لهذا العقد
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvedRequests.map((request) => {
                  const isSelected = selectedRequestIds.includes(request.id);

                  return (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => toggleRequest(request.id)}
                      className={`w-full rounded-lg border p-4 text-right transition ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Checkbox */}

                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-4 w-4" />}
                        </div>

                        {/* Request */}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">{request.requestNumber}</span>

                            <Badge variant="outline" className="border-green-500 text-green-600">
                              معتمد
                            </Badge>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <span>تاريخ الطلب: {request.requestedAt}</span>

                            <span>تاريخ الاعتماد: {request.approvedAt}</span>
                          </div>
                        </div>

                        {/* Quantity */}

                        <div className="hidden text-center sm:block">
                          <p className="text-xs text-muted-foreground">عدد الوحدات</p>

                          <p className="mt-1 text-lg font-bold">{request.quantity}</p>
                        </div>

                        {/* Unit Price */}

                        <div className="hidden text-center md:block">
                          <p className="text-xs text-muted-foreground">سعر الوحدة</p>

                          <p className="mt-1 font-semibold">
                            {request.unitPrice.toLocaleString()} ج.م
                          </p>
                        </div>

                        {/* Total */}

                        <div className="text-left">
                          <p className="text-xs text-muted-foreground">الإجمالي</p>

                          <p className="mt-1 text-lg font-bold">
                            {request.totalAmount.toLocaleString()} ج.م
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* =====================================================
            PAYMENT SECTION
        ====================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Payment Method */}

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-5 w-5" />
                بيانات الدفع
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Payment Method */}

                <div className="space-y-2">
                  <Label>طريقة الدفع</Label>

                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طريقة الدفع" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="CASH">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          نقدي
                        </div>
                      </SelectItem>

                      <SelectItem value="BANK_TRANSFER">
                        <div className="flex items-center gap-2">
                          <WalletCards className="h-4 w-4" />
                          تحويل بنكي
                        </div>
                      </SelectItem>

                      <SelectItem value="CHEQUE">شيك</SelectItem>

                      <SelectItem value="CREDIT_CARD">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          بطاقة ائتمان
                        </div>
                      </SelectItem>

                      <SelectItem value="ONLINE_PAYMENT">دفع إلكتروني</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}

                <div className="space-y-2">
                  <Label>المبلغ المحصل</Label>

                  <div className="relative">
                    <Input
                      value={totalAmount.toLocaleString()}
                      readOnly
                      className="bg-muted pl-16 text-lg font-bold"
                    />

                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ج.م
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    المبلغ يتم حسابه تلقائياً حسب الطلبات المختارة
                  </p>
                </div>
              </div>

              {/* Important Rule */}

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                  <div>
                    <p className="font-medium">قيمة التحصيل ثابتة</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      لا يمكن تعديل مبلغ التحصيل يدوياً. يجب أن يساوي المبلغ إجمالي قيمة الوحدات
                      الإضافية المعتمدة والمختارة.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ===================================================
              SUMMARY
          ==================================================== */}

          <Card className="h-fit lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="text-base">ملخص التحصيل</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">عدد الطلبات</span>

                <span className="font-semibold">{selectedRequests.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">عدد الوحدات</span>

                <span className="font-semibold">{totalUnits}</span>
              </div>

              <Separator />

              {/* Selected Requests */}

              <div className="space-y-3">
                {selectedRequests.map((request) => (
                  <div key={request.id} className="rounded-lg bg-muted/50 p-3">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{request.requestNumber}</p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {request.quantity} وحدة × {request.unitPrice.toLocaleString()} ج.م
                        </p>
                      </div>

                      <p className="font-semibold">{request.totalAmount.toLocaleString()} ج.م</p>
                    </div>
                  </div>
                ))}

                {selectedRequests.length === 0 && (
                  <p className="py-3 text-center text-sm text-muted-foreground">
                    لم يتم اختيار أي طلب
                  </p>
                )}
              </div>

              <Separator />

              {/* Total */}

              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبلغ المطلوب تحصيله</p>

                <p className="mt-2 text-3xl font-bold">
                  {totalAmount.toLocaleString()}
                  <span className="mr-2 text-base font-normal">ج.م</span>
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={selectedRequests.length === 0 || !paymentMethod}
                onClick={handleSubmit}
              >
                <CheckCircle2 className="ml-2 h-5 w-5" />
                تسجيل التحصيل
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

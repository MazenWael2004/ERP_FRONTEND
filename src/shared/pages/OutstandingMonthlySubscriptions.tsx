import * as React from 'react'

import {
  Search,
  AlertCircle,
  ChevronDown,
  Save,
  RotateCcw,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card'

import { Button } from 'src/components/ui/button'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select'

import { Badge } from 'src/components/ui/badge'

const unpaidReasons = [
  {
    value: 'CUSTOMER_REFUSED',
    label: 'العميل رفض السداد',
  },
  {
    value: 'CUSTOMER_UNAVAILABLE',
    label: 'العميل غير متاح',
  },
  {
    value: 'FINANCIAL_DIFFICULTY',
    label: 'ظروف مالية',
  },
  {
    value: 'DELAYED_PAYMENT',
    label: 'تأجيل السداد',
  },
  {
    value: 'DISPUTE',
    label: 'يوجد خلاف / اعتراض على المبلغ',
  },
  {
    value: 'NO_CONTACT',
    label: 'تعذر التواصل مع العميل',
  },
  {
    value: 'OTHER',
    label: 'أخرى',
  },
]

const mockData = [
  {
    id: 1,
    customerName: '19011 Pharmacies',
    customerNameAr: 'صيدليات 19011',
    branch: 'فرع المهندسين',
    representative: 'أحمد محمد',
    subscriptionAmount: 600,
    collectedAmount: 0,
    outstandingAmount: 600,
    dueDate: '2026-10-01',
    daysLate: 4,
    reason: null,
  },
  {
    id: 2,
    customerName: 'Seif Pharmacies',
    customerNameAr: 'صيدليات سيف',
    branch: 'فرع مدينة نصر',
    representative: 'محمد علي',
    subscriptionAmount: 600,
    collectedAmount: 0,
    outstandingAmount: 600,
    dueDate: '2026-10-01',
    daysLate: 4,
    reason: null,
  },
  {
    id: 3,
    customerName: 'El Ezaby Pharmacy',
    customerNameAr: 'صيدليات العزبي',
    branch: 'فرع الدقي',
    representative: 'عمر حسن',
    subscriptionAmount: 500,
    collectedAmount: 200,
    outstandingAmount: 300,
    dueDate: '2026-10-01',
    daysLate: 4,
    reason: null,
  },
  {
    id: 4,
    customerName: 'Mira Pharmacy',
    customerNameAr: 'صيدلية ميرا',
    branch: 'فرع الزمالك',
    representative: 'كريم محمود',
    subscriptionAmount: 600,
    collectedAmount: 0,
    outstandingAmount: 600,
    dueDate: '2026-10-01',
    daysLate: 4,
    reason: null,
  },
  {
    id: 5,
    customerName: 'Stephenson Pharmacy',
    customerNameAr: 'صيدلية ستيفنسون',
    branch: 'فرع وسط البلد',
    representative: 'يوسف أحمد',
    subscriptionAmount: 500,
    collectedAmount: 0,
    outstandingAmount: 500,
    dueDate: '2026-10-01',
    daysLate: 4,
    reason: null,
  },
  {
    id: 6,
    customerName: 'Misr Pharmacies',
    customerNameAr: 'صيدليات مصر',
    branch: 'فرع الهرم',
    representative: 'حسن محمود',
    subscriptionAmount: 600,
    collectedAmount: 600,
    outstandingAmount: 0,
    dueDate: '2026-10-01',
    daysLate: 0,
    reason: null,
  },
]

const months = [
  { value: '1', label: 'يناير' },
  { value: '2', label: 'فبراير' },
  { value: '3', label: 'مارس' },
  { value: '4', label: 'أبريل' },
  { value: '5', label: 'مايو' },
  { value: '6', label: 'يونيو' },
  { value: '7', label: 'يوليو' },
  { value: '8', label: 'أغسطس' },
  { value: '9', label: 'سبتمبر' },
  { value: '10', label: 'أكتوبر' },
  { value: '11', label: 'نوفمبر' },
  { value: '12', label: 'ديسمبر' },
]

export default function UncollectedTargets() {
  const [month, setMonth] = React.useState('10')

  const [year, setYear] = React.useState('2026')

  const [paymentStatus, setPaymentStatus] =
    React.useState('ALL')

  const [results, setResults] = React.useState<any[]>([])

  const [searched, setSearched] = React.useState(false)

  const [selectedRow, setSelectedRow] =
    React.useState<number | null>(null)

  const [reasons, setReasons] = React.useState<
    Record<number, string>
  >({})

  const getPaymentStatus = (item: any) => {
    if (item.collectedAmount === 0) {
      return 'NOT_PAID'
    }

    if (
      item.collectedAmount > 0 &&
      item.collectedAmount < item.subscriptionAmount
    ) {
      return 'PARTIALLY_PAID'
    }

    return 'PAID'
  }

  const getPaymentStatusLabel = (item: any) => {
    const status = getPaymentStatus(item)

    switch (status) {
      case 'NOT_PAID':
        return 'غير مدفوع'

      case 'PARTIALLY_PAID':
        return 'مدفوع جزئياً'

      case 'PAID':
        return 'مدفوع'

      default:
        return '-'
    }
  }

  const getMonthLabel = () => {
    return (
      months.find((item) => item.value === month)
        ?.label || ''
    )
  }

  const handleSearch = () => {
    let filtered = [...mockData]

    /*
     * This report is specifically for uncollected
     * subscriptions.
     *
     * Therefore fully paid subscriptions are always
     * excluded.
     */
    filtered = filtered.filter(
      (item) =>
        item.collectedAmount <
        item.subscriptionAmount,
    )

    /*
     * Payment status filter
     */
    if (paymentStatus === 'NOT_PAID') {
      filtered = filtered.filter(
        (item) => item.collectedAmount === 0,
      )
    }

    if (paymentStatus === 'PARTIALLY_PAID') {
      filtered = filtered.filter(
        (item) =>
          item.collectedAmount > 0 &&
          item.collectedAmount <
            item.subscriptionAmount,
      )
    }

    setResults(filtered)

    setSearched(true)

    setSelectedRow(null)
  }

  const handleReset = () => {
    setMonth('10')

    setYear('2026')

    setPaymentStatus('ALL')

    setResults([])

    setSearched(false)

    setSelectedRow(null)

    setReasons({})
  }

  const handleReasonChange = (
    id: number,
    value: string,
  ) => {
    setReasons((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSaveReason = (id: number) => {
    console.log('Save reason:', {
      collectionTargetId: id,
      reason: reasons[id],
    })

    setSelectedRow(null)
  }

  const totalExpected = results.reduce(
    (sum, item) =>
      sum + item.subscriptionAmount,
    0,
  )

  const totalCollected = results.reduce(
    (sum, item) =>
      sum + item.collectedAmount,
    0,
  )

  const totalOutstanding = results.reduce(
    (sum, item) =>
      sum + item.outstandingAmount,
    0,
  )

  const notPaidCount = results.filter(
    (item) =>
      getPaymentStatus(item) === 'NOT_PAID',
  ).length

  const partiallyPaidCount = results.filter(
    (item) =>
      getPaymentStatus(item) ===
      'PARTIALLY_PAID',
  ).length

  return (
    <div
      className="space-y-6"
      dir="rtl"
    >
      {/* ================================================== */}
      {/* Header */}
      {/* ================================================== */}

      <div>
        <h1 className="text-2xl font-bold">
          غير المحصل من الأهداف
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          الصيدليات التي لم يتم تحصيل الاشتراك
          الشهري لها
        </p>
      </div>

      {/* ================================================== */}
      {/* Search Filters */}
      {/* ================================================== */}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            البحث
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Month */}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                الشهر
              </label>

              <Select
                value={month}
                onValueChange={setMonth}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الشهر" />
                </SelectTrigger>

                <SelectContent>
                  {months.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                السنة
              </label>

              <Select
                value={year}
                onValueChange={setYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="2026">
                    2026
                  </SelectItem>

                  <SelectItem value="2027">
                    2027
                  </SelectItem>

                  <SelectItem value="2028">
                    2028
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status */}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                حالة السداد
              </label>

              <Select
                value={paymentStatus}
                onValueChange={setPaymentStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر حالة السداد" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">
                    الكل
                  </SelectItem>

                  <SelectItem value="NOT_PAID">
                    غير مدفوع
                  </SelectItem>

                  <SelectItem value="PARTIALLY_PAID">
                    مدفوع جزئياً
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search / Reset */}

            <div className="flex items-end gap-2">
              <Button
                className="flex-1"
                onClick={handleSearch}
              >
                <Search className="ml-2 h-4 w-4" />
                بحث
              </Button>

              <Button
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

     

      {/* ================================================== */}
      {/* Results */}
      {/* ================================================== */}

      {searched && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">
                  الصيدليات غير المحصلة
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  {getMonthLabel()} {year}
                </p>
              </div>

              <Badge variant="secondary">
                {results.length} صيدلية
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {results.length === 0 ? (
              /* ============================================ */
              /* No Results */
              /* ============================================ */

              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <AlertCircle className="mb-4 h-10 w-10 text-muted-foreground" />

                <h3 className="text-lg font-semibold">
                  لا توجد نتائج
                </h3>

                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  لا توجد صيدليات مطابقة لحالة
                  السداد المحددة.
                </p>
              </div>
            ) : (
              /* ============================================ */
              /* Table */
              /* ============================================ */

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                        #
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                        الصيدلية
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                        الفرع
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                        المندوب
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                        الاشتراك
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                        المحصل
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                        غير المحصل
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                        حالة السداد
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                        تاريخ الاستحقاق
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                        الإجراء
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {results.map((item, index) => {
                      const isSelected =
                        selectedRow === item.id

                      const status =
                        getPaymentStatus(item)

                      return (
                        <React.Fragment
                          key={item.id}
                        >
                          {/* ================================= */}
                          {/* Main Row */}
                          {/* ================================= */}

                          <tr
                            className={`border-b transition-colors ${
                              isSelected
                                ? 'bg-muted/40'
                                : 'hover:bg-muted/30'
                            }`}
                          >
                            {/* Number */}

                            <td className="px-4 py-4">
                              {index + 1}
                            </td>

                            {/* Pharmacy */}

                            <td className="px-4 py-4">
                              <div className="font-medium">
                                {item.customerNameAr}
                              </div>

                              <div className="text-xs text-muted-foreground">
                                {item.customerName}
                              </div>
                            </td>

                            {/* Branch */}

                            <td className="px-4 py-4">
                              {item.branch}
                            </td>

                            {/* Representative */}

                            <td className="px-4 py-4">
                              {item.representative}
                            </td>

                            {/* Subscription */}

                            <td className="whitespace-nowrap px-4 py-4 font-medium">
                              {item.subscriptionAmount.toLocaleString()}{' '}
                              جنيه
                            </td>

                            {/* Collected */}

                            <td className="whitespace-nowrap px-4 py-4 text-green-600">
                              {item.collectedAmount.toLocaleString()}{' '}
                              جنيه
                            </td>

                            {/* Outstanding */}

                            <td className="whitespace-nowrap px-4 py-4 font-bold text-red-600">
                              {item.outstandingAmount.toLocaleString()}{' '}
                              جنيه
                            </td>

                            {/* Payment Status */}

                            <td className="px-4 py-4">
                              {status ===
                                'NOT_PAID' && (
                                <Badge variant="destructive">
                                  غير مدفوع
                                </Badge>
                              )}

                              {status ===
                                'PARTIALLY_PAID' && (
                                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                  مدفوع جزئياً
                                </Badge>
                              )}

                              {status === 'PAID' && (
                                <Badge variant="secondary">
                                  مدفوع
                                </Badge>
                              )}
                            </td>

                            {/* Due Date */}

                            <td className="whitespace-nowrap px-4 py-4">
                              {item.dueDate}
                            </td>

                            {/* Action */}

                            <td className="px-4 py-4">
                              <Button
                                variant={
                                  isSelected
                                    ? 'secondary'
                                    : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                  setSelectedRow(
                                    isSelected
                                      ? null
                                      : item.id,
                                  )
                                }
                              >
                                <AlertCircle className="ml-2 h-4 w-4" />

                                سبب عدم السداد

                                <ChevronDown
                                  className={`mr-2 h-4 w-4 transition-transform ${
                                    isSelected
                                      ? 'rotate-180'
                                      : ''
                                  }`}
                                />
                              </Button>
                            </td>
                          </tr>

                          {/* ================================= */}
                          {/* Reason Panel */}
                          {/* ================================= */}

                          {isSelected && (
                            <tr>
                              <td
                                colSpan={10}
                                className="bg-muted/20 px-4 py-5"
                              >
                                <div className="rounded-lg border bg-background p-5">
                                  {/* Reason Header */}

                                  <div className="mb-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h3 className="font-semibold">
                                        سبب عدم سداد
                                        الاشتراك
                                      </h3>

                                      {status ===
                                        'NOT_PAID' && (
                                        <Badge variant="destructive">
                                          غير مدفوع
                                        </Badge>
                                      )}

                                      {status ===
                                        'PARTIALLY_PAID' && (
                                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                          مدفوع جزئياً
                                        </Badge>
                                      )}
                                    </div>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                      اختر سبب عدم سداد{' '}
                                      {
                                        item.customerNameAr
                                      }
                                    </p>
                                  </div>

                                  {/* Reason Select + Save */}

                                  <div className="flex flex-col gap-3 md:flex-row md:items-end">
                                    <div className="flex-1 space-y-2">
                                      <label className="text-sm font-medium">
                                        سبب عدم السداد
                                      </label>

                                      <Select
                                        value={
                                          reasons[
                                            item.id
                                          ] || ''
                                        }
                                        onValueChange={(
                                          value,
                                        ) =>
                                          handleReasonChange(
                                            item.id,
                                            value,
                                          )
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="اختر سبب عدم السداد" />
                                        </SelectTrigger>

                                        <SelectContent>
                                          {unpaidReasons.map(
                                            (
                                              reason,
                                            ) => (
                                              <SelectItem
                                                key={
                                                  reason.value
                                                }
                                                value={
                                                  reason.value
                                                }
                                              >
                                                {
                                                  reason.label
                                                }
                                              </SelectItem>
                                            ),
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <Button
                                      disabled={
                                        !reasons[
                                          item.id
                                        ]
                                      }
                                      onClick={() =>
                                        handleSaveReason(
                                          item.id,
                                        )
                                      }
                                    >
                                      <Save className="ml-2 h-4 w-4" />

                                      حفظ
                                    </Button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================================================== */}
      {/* Empty State Before Search */}
      {/* ================================================== */}

      {!searched && (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <Search className="mb-4 h-10 w-10 text-muted-foreground" />

            <h3 className="text-lg font-semibold">
              ابحث عن الصيدليات غير المحصلة
            </h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              حدد الشهر والسنة وحالة السداد ثم اضغط
              على بحث لعرض الصيدليات التي لم يتم
              تحصيل الاشتراك الشهري الخاص بها.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
import * as React from 'react'
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  Search,
  X,
  XCircle,
} from 'lucide-react'

import { Button } from 'src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog'

import { Input } from 'src/components/ui/input'
import { Badge } from 'src/components/ui/badge'
import { Textarea } from 'src/components/ui/textarea'

const mockTasks = [
  {
    id: 101,
    taskTypeId: 1,
    taskTypeCode: 'CONTRACT_APPROVAL',
    taskTypeName: 'اعتماد عقد',
    title: 'مراجعة واعتماد عقد عميل',
    description: 'مراجعة بيانات العقد والمستندات واعتماد أو رفض العقد.',
    status: 'PENDING',

    assignedTo: 12,
    assignedToName: 'أحمد محمد',

    assignedBy: 7,
    assignedByName: 'محمد حسن',

    contractId: 501,
    contractNumber: 'CNT-2026-001',

    customer: {
      id: 201,
      name: 'NileCare Pharmaceutical Services',
      nameAr: 'نايل كير للخدمات الدوائية',
      code: 'NC-PS-20261004-017',
    },

    representative: 'علي أحمد',

    program: 'E-Plus',
    plan: 'Silver',
    subscriptionPrice: 600,
    discountPercentage: 0,

    contractDate: '2026-10-05',
    dueAt: '2026-10-06 12:00',
    createdAt: '2026-10-05 09:30',
  },

  {
    id: 102,
    taskTypeId: 1,
    taskTypeCode: 'CONTRACT_APPROVAL',
    taskTypeName: 'اعتماد عقد',
    title: 'مراجعة واعتماد عقد عميل',
    description: 'مراجعة العقد الجديد قبل إرساله إلى مرحلة التفعيل.',
    status: 'PENDING',

    assignedTo: 12,
    assignedToName: 'أحمد محمد',

    assignedBy: 8,
    assignedByName: 'حسن علي',

    contractId: 502,
    contractNumber: 'CNT-2026-002',

    customer: {
      id: 202,
      name: 'ABC Pharmacy Chain',
      nameAr: 'صيدليات ABC',
      code: 'ABC-20261005-002',
    },

    representative: 'حسن محمود',

    program: 'E-Chain',
    plan: 'Gold',
    subscriptionPrice: 500,
    discountPercentage: 10,

    contractDate: '2026-10-05',
    dueAt: '2026-10-06 14:00',
    createdAt: '2026-10-05 10:15',
  },

  {
    id: 103,
    taskTypeId: 2,
    taskTypeCode: 'MAIN_UNIT_INSTALLATION',
    taskTypeName: 'تركيب الوحدة الرئيسية',
    title: 'تركيب الوحدة الرئيسية',
    description: 'تنفيذ مهمة تركيب الوحدة الرئيسية لدى العميل.',
    status: 'IN_PROGRESS',

    assignedTo: 12,
    assignedToName: 'أحمد محمد',

    assignedBy: 9,
    assignedByName: 'محمد علي',

    contractId: 498,
    contractNumber: 'CNT-2026-098',

    customer: {
      id: 203,
      name: 'Future Pharmacy',
      nameAr: 'صيدلية المستقبل',
      code: 'FP-202609-001',
    },

    representative: 'يوسف سامي',

    program: 'E-Plus',
    plan: 'Silver',
    subscriptionPrice: 600,
    discountPercentage: 0,

    contractDate: '2026-09-29',
    dueAt: '2026-10-05 16:00',
    createdAt: '2026-10-04 11:20',
  },

  {
    id: 104,
    taskTypeId: 1,
    taskTypeCode: 'CONTRACT_APPROVAL',
    taskTypeName: 'اعتماد عقد',
    title: 'مراجعة واعتماد عقد عميل',
    description: 'تم اعتماد العقد بنجاح.',
    status: 'COMPLETED',

    assignedTo: 12,
    assignedToName: 'أحمد محمد',

    assignedBy: 7,
    assignedByName: 'محمد حسن',

    contractId: 490,
    contractNumber: 'CNT-2026-090',

    customer: {
      id: 204,
      name: 'Care Plus Pharmacy',
      nameAr: 'صيدلية كير بلس',
      code: 'CP-202609-010',
    },

    representative: 'كريم أحمد',

    program: 'E-Plus',
    plan: 'Silver',
    subscriptionPrice: 600,
    discountPercentage: 0,

    contractDate: '2026-09-30',
    dueAt: null,
    createdAt: '2026-09-30 09:10',
  },
]

const statusConfig: any = {
  PENDING: {
    label: 'معلقة',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock3,
  },

  IN_PROGRESS: {
    label: 'قيد التنفيذ',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Clock3,
  },

  COMPLETED: {
    label: 'مكتملة',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle2,
  },

  CANCELLED: {
    label: 'ملغاة',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
  },
}

const Tasks = () => {
  const [selectedTask, setSelectedTask] = React.useState<any>(null)

  const [statusFilter, setStatusFilter] = React.useState('ALL')

  const [search, setSearch] = React.useState('')

  const [rejectMode, setRejectMode] = React.useState(false)

  const [rejectReason, setRejectReason] = React.useState('')

  const filteredTasks = React.useMemo(() => {
    return mockTasks.filter((task: any) => {
      const matchesStatus =
        statusFilter === 'ALL' || task.status === statusFilter

      const searchValue = search.toLowerCase()

      const matchesSearch =
        task.title.toLowerCase().includes(searchValue) ||
        task.contractNumber.toLowerCase().includes(searchValue) ||
        task.customer.name.toLowerCase().includes(searchValue) ||
        task.customer.nameAr.includes(search)

      return matchesStatus && matchesSearch
    })
  }, [statusFilter, search])

  const handleApprove = () => {
    if (!selectedTask) return

    console.log('APPROVE TASK', {
      taskId: selectedTask.id,
      contractId: selectedTask.contractId,
    })

    setSelectedTask(null)
  }

  const handleReject = () => {
    if (!selectedTask || !rejectReason.trim()) return

    console.log('REJECT TASK', {
      taskId: selectedTask.id,
      contractId: selectedTask.contractId,
      reason: rejectReason,
    })

    setRejectMode(false)
    setRejectReason('')
    setSelectedTask(null)
  }

  const openTask = (task: any) => {
    setSelectedTask(task)
    setRejectMode(false)
    setRejectReason('')
  }

  return (
    <div
      dir="rtl"
      className="space-y-6"
    >
      {/* -------------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------------- */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            المهام
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            المهام المسندة إليك ومتابعة حالة تنفيذها
          </p>
        </div>

        <div className="rounded-lg border bg-card px-4 py-3">
          <div className="text-xs text-muted-foreground">
            المهام المعلقة
          </div>

          <div className="mt-1 text-2xl font-bold">
            {
              mockTasks.filter(
                (task: any) => task.status === 'PENDING'
              ).length
            }
          </div>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* FILTERS */}
      {/* -------------------------------------------------- */}

      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="بحث عن مهمة، عميل أو رقم عقد..."
              className="pr-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ['ALL', 'الكل'],
              ['PENDING', 'معلقة'],
              ['IN_PROGRESS', 'قيد التنفيذ'],
              ['COMPLETED', 'مكتملة'],
            ].map(([value, label]) => (
              <Button
                key={value}
                type="button"
                variant={
                  statusFilter === value
                    ? 'default'
                    : 'outline'
                }
                onClick={() => setStatusFilter(value)}
                size="sm"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* TASK TABLE */}
      {/* -------------------------------------------------- */}

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-right font-medium">
                  المهمة
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  النوع
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  العميل
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  رقم العقد
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  الحالة
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  تاريخ الإنشاء
                </th>

                <th className="px-4 py-3 text-center font-medium">
                  إجراء
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    لا توجد مهام
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task: any) => {
                  const status = statusConfig[task.status]
                  const StatusIcon = status.icon

                  return (
                    <tr
                      key={task.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium">
                          {task.title}
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          #{task.id}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <FileCheck2 className="h-4 w-4 text-muted-foreground" />

                          {task.taskTypeName}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium">
                          {task.customer.nameAr}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {task.customer.code}
                        </div>
                      </td>

                      <td className="px-4 py-4 font-medium">
                        {task.contractNumber}
                      </td>

                      <td className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className={status.className}
                        >
                          <StatusIcon className="ml-1 h-3.5 w-3.5" />

                          {status.label}
                        </Badge>
                      </td>

                      <td className="px-4 py-4 text-muted-foreground">
                        {task.createdAt}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openTask(task)}
                        >
                          <Eye className="ml-2 h-4 w-4" />

                          عرض
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* TASK DETAILS POPUP */}
      {/* -------------------------------------------------- */}

      <Dialog
        open={!!selectedTask}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTask(null)
            setRejectMode(false)
            setRejectReason('')
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5" />

                  {selectedTask.taskTypeName}
                </DialogTitle>

                <DialogDescription>
                  {selectedTask.title}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {/* TASK INFO */}

                <div className="rounded-lg border p-4">
                  <h3 className="mb-4 font-semibold">
                    بيانات المهمة
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        رقم المهمة
                      </div>

                      <div className="mt-1 font-medium">
                        #{selectedTask.id}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        الحالة
                      </div>

                      <div className="mt-1">
                        <Badge
                          variant="outline"
                          className={
                            statusConfig[selectedTask.status]
                              .className
                          }
                        >
                          {
                            statusConfig[selectedTask.status]
                              .label
                          }
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        مسندة بواسطة
                      </div>

                      <div className="mt-1 font-medium">
                        {selectedTask.assignedByName}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        تاريخ الإنشاء
                      </div>

                      <div className="mt-1 font-medium">
                        {selectedTask.createdAt}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CONTRACT INFO */}

                <div className="rounded-lg border p-4">
                  <h3 className="mb-4 font-semibold">
                    بيانات العقد
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        العميل
                      </div>

                      <div className="mt-1 font-medium">
                        {selectedTask.customer.nameAr}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {selectedTask.customer.name}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        كود العميل
                      </div>

                      <div className="mt-1 font-medium">
                        {selectedTask.customer.code}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        رقم العقد
                      </div>

                      <div className="mt-1 font-medium">
                        {selectedTask.contractNumber}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        المندوب
                      </div>

                      <div className="mt-1 font-medium">
                        {selectedTask.representative}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        البرنامج
                      </div>

                      <div className="mt-1 font-medium">
                        {selectedTask.program}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        الباقة
                      </div>

                      <div className="mt-1 font-medium">
                        {selectedTask.plan}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        الاشتراك الشهري
                      </div>

                      <div className="mt-1 font-medium">
                        {selectedTask.subscriptionPrice.toLocaleString()} جنيه
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        نسبة الخصم
                      </div>

                      <div className="mt-1 font-medium">
                        {selectedTask.discountPercentage}%
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        تاريخ العقد
                      </div>

                      <div className="mt-1 font-medium">
                        {selectedTask.contractDate}
                      </div>
                    </div>

                    {selectedTask.dueAt && (
                      <div>
                        <div className="text-xs text-muted-foreground">
                          موعد الاستحقاق
                        </div>

                        <div className="mt-1 font-medium">
                          {selectedTask.dueAt}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* DESCRIPTION */}

                {selectedTask.description && (
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold">
                      وصف المهمة
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {selectedTask.description}
                    </p>
                  </div>
                )}

                {/* REJECTION */}

                {rejectMode && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <div className="mb-3 font-semibold">
                      سبب رفض العقد
                    </div>

                    <Textarea
                      value={rejectReason}
                      onChange={(event) =>
                        setRejectReason(event.target.value)
                      }
                      placeholder="اكتب سبب رفض العقد..."
                      rows={4}
                    />
                  </div>
                )}
              </div>

              {/* ACTIONS */}

              {selectedTask.status === 'PENDING' && (
                <DialogFooter className="gap-2 sm:justify-start">
                  {rejectMode ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setRejectMode(false)
                          setRejectReason('')
                        }}
                      >
                        إلغاء
                      </Button>

                      <Button
                        variant="destructive"
                        disabled={!rejectReason.trim()}
                        onClick={handleReject}
                      >
                        <XCircle className="ml-2 h-4 w-4" />

                        تأكيد الرفض
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => setRejectMode(true)}
                      >
                        <X className="ml-2 h-4 w-4" />

                        رفض العقد
                      </Button>

                      <Button
                        onClick={handleApprove}
                      >
                        <CheckCircle2 className="ml-2 h-4 w-4" />

                        اعتماد العقد
                      </Button>
                    </>
                  )}
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Tasks
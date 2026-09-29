import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  FileText,
  MapPin,
  UserRound,
  Wrench,
  Upload,
  X,
  XCircle,
  Play,
  KeyRound,
} from 'lucide-react';

export default function TaskDetails({ isRtl = true, task = null, onAction }) {
  /*
    Example task structure:

    {
      id: 124,
      type: "INSTALLATION",
      title: {
        ar: "تركيب النظام",
        en: "System Installation"
      },

      status: "PENDING",
      priority: "HIGH",

      assignedTo: "Ali Hassan",

      customer: "صيدلية النور",
      branch: "فرع مدينة نصر",
      contract: "CNT-2026-00124",

      dueDate: "24 Sep 2026 - 10:00 AM",

      actions: [
        "START",
        "COMPLETE",
        "COMPLETE_WITH_ISSUES",
        "UNABLE_TO_COMPLETE"
      ]
    }

    Another example:

    {
      type: "CONTRACT_APPROVAL",
      actions: ["APPROVE", "REJECT"]
    }

    Another example:

    {
      type: "LICENSE_CREATION",
      actions: ["CREATE_LICENSE", "COMPLETE"]
    }
  */

  const [result, setResult] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([]);

  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseKey, setLicenseKey] = useState('');

  const [rejectReason, setRejectReason] = useState('');

  const t = {
    title: isRtl ? 'تفاصيل المهمة' : 'Task Details',

    subtitle: isRtl
      ? 'عرض تفاصيل المهمة وتنفيذ الإجراءات المطلوبة'
      : 'View task details and perform the required actions',

    back: isRtl ? 'العودة للمهام' : 'Back to Tasks',

    taskInformation: isRtl ? 'معلومات المهمة' : 'Task Information',

    customer: isRtl ? 'العميل' : 'Customer',

    branch: isRtl ? 'الفرع' : 'Branch',

    contract: isRtl ? 'العقد' : 'Contract',

    assignedTo: isRtl ? 'المسؤول' : 'Assigned To',

    dueDate: isRtl ? 'موعد الاستحقاق' : 'Due Date',

    taskType: isRtl ? 'نوع المهمة' : 'Task Type',

    priority: isRtl ? 'الأولوية' : 'Priority',

    high: isRtl ? 'عالية' : 'High',

    normal: isRtl ? 'عادية' : 'Normal',

    low: isRtl ? 'منخفضة' : 'Low',

    pending: isRtl ? 'قيد الانتظار' : 'Pending',

    inProgress: isRtl ? 'قيد التنفيذ' : 'In Progress',

    completed: isRtl ? 'مكتملة' : 'Completed',

    taskActions: isRtl ? 'إجراءات المهمة' : 'Task Actions',

    taskResult: isRtl ? 'نتيجة المهمة' : 'Task Result',

    notes: isRtl ? 'ملاحظات' : 'Notes',

    reason: isRtl ? 'السبب' : 'Reason',

    reasonRequired: isRtl ? 'السبب *' : 'Reason *',

    attachments: isRtl ? 'المرفقات' : 'Attachments',

    addAttachment: isRtl ? 'إضافة صورة / مستند' : 'Add Photo / Document',

    save: isRtl ? 'حفظ النتيجة' : 'Save Result',

    approve: isRtl ? 'اعتماد' : 'Approve',

    reject: isRtl ? 'رفض' : 'Reject',

    start: isRtl ? 'بدء المهمة' : 'Start Task',

    complete: isRtl ? 'إتمام المهمة' : 'Complete Task',

    completeWithIssues: isRtl ? 'إتمام مع وجود مشاكل' : 'Complete With Issues',

    unableToComplete: isRtl ? 'تعذر إتمام المهمة' : 'Unable To Complete',

    createLicense: isRtl ? 'إنشاء الترخيص' : 'Create License',

    licenseNumber: isRtl ? 'رقم الترخيص' : 'License Number',

    licenseKey: isRtl ? 'مفتاح الترخيص' : 'License Key',

    rejectionReason: isRtl ? 'سبب الرفض' : 'Rejection Reason',

    installation: isRtl ? 'تركيب' : 'Installation',

    contractApproval: isRtl ? 'اعتماد عقد' : 'Contract Approval',

    licenseCreation: isRtl ? 'إنشاء ترخيص' : 'License Creation',

    monthlyVisit: isRtl ? 'زيارة شهرية' : 'Monthly Visit',

    hardwareChange: isRtl ? 'تغيير أجهزة' : 'Hardware Change',

    softwareUpdate: isRtl ? 'تحديث برنامج' : 'Software Update',

    followUp: isRtl ? 'متابعة' : 'Follow Up',

    customerUnavailable: isRtl ? 'العميل غير متاح' : 'Customer unavailable',

    hardwareUnavailable: isRtl ? 'الأجهزة غير متوفرة' : 'Hardware unavailable',

    networkProblem: isRtl ? 'مشكلة في الشبكة' : 'Network problem',

    incorrectInformation: isRtl ? 'بيانات العميل غير صحيحة' : 'Incorrect customer information',

    postponement: isRtl ? 'العميل طلب التأجيل' : 'Customer requested postponement',

    requirementsNotReady: isRtl ? 'المتطلبات غير جاهزة' : 'Requirements not ready',

    other: isRtl ? 'أخرى' : 'Other',
  };

  const currentTask = task || {
    id: 124,
    type: 'INSTALLATION',

    title: {
      ar: 'تركيب النظام',
      en: 'System Installation',
    },

    status: 'PENDING',
    priority: 'HIGH',

    assignedTo: 'Ali Hassan',

    customer: 'صيدلية النور',
    branch: 'فرع مدينة نصر',
    contract: 'CNT-2026-00124',

    dueDate: '24 Sep 2026 - 10:00 AM',

    actions: ['START', 'COMPLETE', 'COMPLETE_WITH_ISSUES', 'UNABLE_TO_COMPLETE'],
  };

  const taskTitle =
    currentTask.title?.[isRtl ? 'ar' : 'en'] || getTaskTypeLabel(currentTask.type, t);

  const reasons = [
    {
      value: 'CUSTOMER_UNAVAILABLE',
      label: t.customerUnavailable,
    },
    {
      value: 'HARDWARE_UNAVAILABLE',
      label: t.hardwareUnavailable,
    },
    {
      value: 'NETWORK_PROBLEM',
      label: t.networkProblem,
    },
    {
      value: 'INCORRECT_INFORMATION',
      label: t.incorrectInformation,
    },
    {
      value: 'CUSTOMER_POSTPONEMENT',
      label: t.postponement,
    },
    {
      value: 'REQUIREMENTS_NOT_READY',
      label: t.requirementsNotReady,
    },
    {
      value: 'OTHER',
      label: t.other,
    },
  ];

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAction = (action) => {
    /*
      Later:

      POST /tasks/:id/actions

      {
        action: "APPROVE"
      }

      or

      {
        action: "COMPLETE",
        result: ...
      }
    */

    if (onAction) {
      onAction({
        taskId: currentTask.id,
        action,
      });
    }
  };

  const showExecutionResult = currentTask.actions?.some((action) =>
    ['COMPLETE', 'COMPLETE_WITH_ISSUES', 'UNABLE_TO_COMPLETE'].includes(action),
  );

  const showLicenseForm = currentTask.type === 'LICENSE_CREATION';

  const showApproval = currentTask.type === 'CONTRACT_APPROVAL';

  const showInstallationResult = currentTask.type === 'INSTALLATION';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50 p-4 font-cairo md:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="mb-4 flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
        >
          {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}

          {t.back}
        </button>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{t.title}</h1>

            <p className="mt-1 text-sm text-gray-500">{t.subtitle}</p>
          </div>

          <TaskStatus status={currentTask.status} t={t} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-5">
        {/* Task Information */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">{t.taskInformation}</h2>
          </div>

          <div className="p-5">
            {/* Task Header */}
            <div className="mb-5 flex items-center gap-4 rounded-lg bg-gray-50 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {getTaskIcon(currentTask.type)}
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">{taskTitle}</h3>

                <p className="mt-1 text-xs text-gray-500">
                  #TASK-{String(currentTask.id).padStart(5, '0')}
                </p>
              </div>

              <div className="ms-auto">
                <PriorityBadge priority={currentTask.priority} t={t} />
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <InfoItem
                icon={Wrench}
                label={t.taskType}
                value={getTaskTypeLabel(currentTask.type, t)}
              />

              {currentTask.customer && (
                <InfoItem icon={UserRound} label={t.customer} value={currentTask.customer} />
              )}

              {currentTask.branch && (
                <InfoItem icon={MapPin} label={t.branch} value={currentTask.branch} />
              )}

              {currentTask.contract && (
                <InfoItem icon={FileText} label={t.contract} value={currentTask.contract} />
              )}

              {currentTask.assignedTo && (
                <InfoItem icon={UserRound} label={t.assignedTo} value={currentTask.assignedTo} />
              )}

              {currentTask.dueDate && (
                <InfoItem icon={CalendarDays} label={t.dueDate} value={currentTask.dueDate} />
              )}
            </div>
          </div>
        </div>

        {/* Approval Task */}
        {showApproval && (
          <ApprovalSection
            t={t}
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            onAction={handleAction}
          />
        )}

        {/* License Creation */}
        {showLicenseForm && (
          <LicenseCreationSection
            t={t}
            licenseNumber={licenseNumber}
            setLicenseNumber={setLicenseNumber}
            licenseKey={licenseKey}
            setLicenseKey={setLicenseKey}
            currentTask={currentTask}
            onAction={handleAction}
          />
        )}

        {/* Generic Execution Result */}
        {showExecutionResult && !showApproval && !showLicenseForm && (
          <TaskExecutionResult
            t={t}
            result={result}
            setResult={setResult}
            reason={reason}
            setReason={setReason}
            notes={notes}
            setNotes={setNotes}
            files={files}
            handleFiles={handleFiles}
            removeFile={removeFile}
            showInstallationResult={showInstallationResult}
            currentTask={currentTask}
            onAction={handleAction}
          />
        )}

        {/* Task Actions */}
        {!showApproval && !showLicenseForm && !showExecutionResult && (
          <GenericActions actions={currentTask.actions || []} t={t} onAction={handleAction} />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Approval
========================================================= */

function ApprovalSection({ t, rejectReason, setRejectReason, onAction }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">{t.taskActions}</h2>
      </div>

      <div className="space-y-5 p-5">
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">{t.contractApproval}</div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onAction('REJECT')}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <XCircle className="h-4 w-4" />

            {t.reject}
          </button>

          <button
            type="button"
            onClick={() => onAction('APPROVE')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            <Check className="h-4 w-4" />

            {t.approve}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   License Creation
========================================================= */

function LicenseCreationSection({
  t,
  licenseNumber,
  setLicenseNumber,
  licenseKey,
  setLicenseKey,
  currentTask,
  onAction,
}) {
  const canCreateLicense = currentTask.actions?.includes('CREATE_LICENSE');

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">{t.taskActions}</h2>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900">{t.licenseCreation}</p>

            <p className="mt-1 text-xs text-gray-500">
              {isArabicText(t.licenseNumber)
                ? 'أدخل بيانات الترخيص المطلوبة'
                : 'Enter the required license information'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label={t.licenseNumber} value={licenseNumber} onChange={setLicenseNumber} />

          <FormField label={t.licenseKey} value={licenseKey} onChange={setLicenseKey} />
        </div>

        <div className="flex justify-end">
          {canCreateLicense && (
            <button
              type="button"
              onClick={() => onAction('CREATE_LICENSE')}
              disabled={!licenseNumber || !licenseKey}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <KeyRound className="h-4 w-4" />

              {t.createLicense}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Generic Task Execution Result
========================================================= */

function TaskExecutionResult({
  t,
  result,
  setResult,
  reason,
  setReason,
  notes,
  setNotes,
  files,
  handleFiles,
  removeFile,
  showInstallationResult,
  currentTask,
  onAction,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">{t.taskResult}</h2>
      </div>

      <div className="p-5">
        {/* Start */}
        {currentTask.actions?.includes('START') && (
          <div className="mb-5 flex justify-end">
            <button
              type="button"
              onClick={() => onAction('START')}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <Play className="h-4 w-4" />

              {t.start}
            </button>
          </div>
        )}

        {/* Result options */}
        <div className="space-y-3">
          {currentTask.actions?.includes('COMPLETE') && (
            <ResultOption
              value="COMPLETED"
              selected={result === 'COMPLETED'}
              onChange={setResult}
              title={t.complete}
              description={
                showInstallationResult
                  ? 'تم تنفيذ المهمة بالكامل'
                  : 'The task was completed successfully'
              }
            />
          )}

          {currentTask.actions?.includes('COMPLETE_WITH_ISSUES') && (
            <ResultOption
              value="COMPLETED_WITH_ISSUES"
              selected={result === 'COMPLETED_WITH_ISSUES'}
              onChange={setResult}
              title={t.completeWithIssues}
              description={
                showInstallationResult
                  ? 'تم التنفيذ ولكن توجد بعض المشاكل'
                  : 'The task was completed with issues'
              }
            />
          )}

          {currentTask.actions?.includes('UNABLE_TO_COMPLETE') && (
            <ResultOption
              value="UNABLE_TO_COMPLETE"
              selected={result === 'UNABLE_TO_COMPLETE'}
              onChange={setResult}
              title={t.unableToComplete}
              description={
                showInstallationResult
                  ? 'لم يتمكن المستخدم من إتمام المهمة'
                  : 'The task could not be completed'
              }
            />
          )}
        </div>

        {/* Conditional Details */}
        {result === 'UNABLE_TO_COMPLETE' && (
          <div className="mt-5 space-y-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t.reasonRequired}
              </label>

              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">اختر السبب</option>

                {[
                  {
                    value: 'CUSTOMER_UNAVAILABLE',
                    label: t.customerUnavailable,
                  },
                  {
                    value: 'HARDWARE_UNAVAILABLE',
                    label: t.hardwareUnavailable,
                  },
                  {
                    value: 'NETWORK_PROBLEM',
                    label: t.networkProblem,
                  },
                  {
                    value: 'INCORRECT_INFORMATION',
                    label: t.incorrectInformation,
                  },
                  {
                    value: 'CUSTOMER_POSTPONEMENT',
                    label: t.postponement,
                  },
                  {
                    value: 'REQUIREMENTS_NOT_READY',
                    label: t.requirementsNotReady,
                  },
                  {
                    value: 'OTHER',
                    label: t.other,
                  },
                ].map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <NotesField t={t} notes={notes} setNotes={setNotes} />

            <Attachments t={t} files={files} handleFiles={handleFiles} removeFile={removeFile} />
          </div>
        )}

        {result === 'COMPLETED_WITH_ISSUES' && (
          <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <NotesField t={t} notes={notes} setNotes={setNotes} />
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-5 py-4">
        <button
          type="button"
          disabled={!result}
          onClick={() => {
            onAction(result);
          }}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t.save}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   Generic Actions
========================================================= */

function GenericActions({ actions, t, onAction }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">{t.taskActions}</h2>
      </div>

      <div className="flex flex-wrap justify-end gap-3 p-5">
        {actions.map((action) => (
          <ActionButton key={action} action={action} t={t} onClick={() => onAction(action)} />
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   Reusable Components
========================================================= */

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Icon className="h-3.5 w-3.5" />

        {label}
      </div>

      <p className="mt-1.5 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function ResultOption({ value, selected, onChange, title, description }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
        selected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      <input
        type="radio"
        name="task-result"
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="mt-0.5 h-4 w-4 accent-primary"
      />

      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>

        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
    </label>
  );
}

function ActionButton({ action, t, onClick }) {
  const config = {
    APPROVE: {
      label: t.approve,
      icon: Check,
      className: 'bg-primary text-white hover:bg-primary/90',
    },

    REJECT: {
      label: t.reject,
      icon: XCircle,
      className: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
    },

    START: {
      label: t.start,
      icon: Play,
      className: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    },

    CREATE_LICENSE: {
      label: t.createLicense,
      icon: KeyRound,
      className: 'bg-primary text-white hover:bg-primary/90',
    },

    COMPLETE: {
      label: t.complete,
      icon: Check,
      className: 'bg-primary text-white hover:bg-primary/90',
    },
  };

  const item = config[action];

  const Icon = item?.icon || Wrench;

  const label = item?.label || action.replaceAll('_', ' ').toLowerCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition ${
        item?.className || 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-4 w-4" />

      {label}
    </button>
  );
}

function PriorityBadge({ priority, t }) {
  const config = {
    HIGH: {
      label: t.high,
      className: 'border-red-100 bg-red-50 text-red-600',
    },

    NORMAL: {
      label: t.normal,
      className: 'border-gray-200 bg-gray-50 text-gray-600',
    },

    LOW: {
      label: t.low,
      className: 'border-blue-100 bg-blue-50 text-blue-600',
    },
  };

  const item = config[priority] || config.NORMAL;

  return (
    <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${item.className}`}>
      {item.label}
    </span>
  );
}

function TaskStatus({ status, t }) {
  const config = {
    PENDING: {
      label: t.pending,
      className: 'border-amber-100 bg-amber-50 text-amber-600',
    },

    IN_PROGRESS: {
      label: t.inProgress,
      className: 'border-blue-100 bg-blue-50 text-blue-600',
    },

    COMPLETED: {
      label: t.completed,
      className: 'border-green-100 bg-green-50 text-green-600',
    },
  };

  const item = config[status] || config.PENDING;

  return (
    <span className={`w-fit rounded-md border px-3 py-1.5 text-xs font-medium ${item.className}`}>
      {item.label}
    </span>
  );
}

function FormField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function NotesField({ t, notes, setNotes }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{t.notes}</label>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="اكتب ملاحظاتك هنا..."
        className="w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function Attachments({ t, files, handleFiles, removeFile }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{t.attachments}</label>

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-500 transition hover:border-primary hover:bg-gray-50">
        <Upload className="h-4 w-4" />

        {t.addAttachment}

        <input type="file" multiple className="hidden" onChange={handleFiles} />
      </label>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />

                <span className="max-w-[250px] truncate text-xs text-gray-700">{file.name}</span>
              </div>

              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   Helpers
========================================================= */

function getTaskTypeLabel(type, t) {
  const labels = {
    INSTALLATION: t.installation,
    CONTRACT_APPROVAL: t.contractApproval,
    LICENSE_CREATION: t.licenseCreation,
    MONTHLY_VISIT: t.monthlyVisit,
    HARDWARE_CHANGE: t.hardwareChange,
    SOFTWARE_UPDATE: t.softwareUpdate,
    FOLLOW_UP: t.followUp,
  };

  return labels[type] || type;
}

function getTaskIcon(type) {
  switch (type) {
    case 'LICENSE_CREATION':
      return <KeyRound className="h-5 w-5" />;

    case 'CONTRACT_APPROVAL':
      return <Check className="h-5 w-5" />;

    case 'INSTALLATION':
      return <Wrench className="h-5 w-5" />;

    default:
      return <FileText className="h-5 w-5" />;
  }
}

function isArabicText(text) {
  return /[\u0600-\u06FF]/.test(text);
}

import { useState } from "react";
import {
  X,
  Wrench,
  CalendarDays,
  MapPin,
  UserRound,
  FileText,
  Clock3,
  AlertCircle,
} from "lucide-react";

export default function ToDoList({ isRtl = false }) {
  const [selectedTask, setSelectedTask] = useState(null);

  const t = {
    title: isRtl ? "قائمة المهام" : "To-Do List",
    subtitle: isRtl ? "المهام المطلوبة منك" : "Tasks assigned to you",

    openTask: isRtl ? "فتح المهمة" : "Open Task",
    taskDetails: isRtl ? "تفاصيل المهمة" : "Task Details",

    customer: isRtl ? "العميل" : "Customer",
    branch: isRtl ? "الفرع" : "Branch",
    assignedTo: isRtl ? "المسؤول" : "Assigned To",
    dueDate: isRtl ? "موعد الاستحقاق" : "Due Date",
    contract: isRtl ? "العقد" : "Contract",
    priority: isRtl ? "الأولوية" : "Priority",
    status: isRtl ? "الحالة" : "Status",

    installation: isRtl ? "تركيب" : "Installation",
    visit: isRtl ? "زيارة" : "Visit",
    hardware: isRtl ? "تغيير جهاز" : "Hardware Change",
    update: isRtl ? "تحديث" : "Update",

    high: isRtl ? "عالية" : "High",
    medium: isRtl ? "متوسطة" : "Medium",
    pending: isRtl ? "قيد الانتظار" : "Pending",
    overdue: isRtl ? "متأخرة" : "Overdue",

    close: isRtl ? "إغلاق" : "Close",
    startTask: isRtl ? "بدء المهمة" : "Start Task",
  };

  const tasks = [
    {
      id: 1,
      title: t.installation,
      customer: "صيدلية النور",
      branch: "فرع مدينة نصر",
      type: "INSTALLATION",
      priority: "HIGH",
      due: "Today, 10:00 AM",
      status: "PENDING",
      assignedTo: "Ali Hassan",
      contract: "CNT-2026-00124",
    },
    {
      id: 2,
      title: t.visit,
      customer: "صيدليات الشفاء",
      branch: "فرع مصر الجديدة",
      type: "VISIT",
      priority: "MEDIUM",
      due: "Today, 01:30 PM",
      status: "PENDING",
      assignedTo: "Ali Hassan",
      contract: "CNT-2026-00118",
    },
  ];

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-gray-50 p-4 md:p-6 font-cairo"
    >
      {/* Page */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {t.title}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {t.subtitle}
        </p>
      </div>

      {/* Tasks */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900">
            {isRtl ? "المهام الخاصة بي" : "My Tasks"}
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 p-5 hover:bg-gray-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wrench className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {task.title}
                  </h3>

                  <span className="rounded-md border border-red-100 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                    {t.high}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-700">
                  {task.customer}
                </p>

                <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {task.branch}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {task.due}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedTask(task)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {t.openTask}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          isRtl={isRtl}
          t={t}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

function TaskDetailsModal({ task, isRtl, t, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        dir={isRtl ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {t.taskDetails}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              #{task.id} · {task.title}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {/* Task Status */}
          <div className="mb-5 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wrench className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {task.title}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {task.customer}
                </p>
              </div>
            </div>

            <span className="rounded-md border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
              {t.pending}
            </span>
          </div>

          {/* Information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem
              icon={UserRound}
              label={t.customer}
              value={task.customer}
            />

            <InfoItem
              icon={MapPin}
              label={t.branch}
              value={task.branch}
            />

            <InfoItem
              icon={FileText}
              label={t.contract}
              value={task.contract}
            />

            <InfoItem
              icon={UserRound}
              label={t.assignedTo}
              value={task.assignedTo}
            />

            <InfoItem
              icon={CalendarDays}
              label={t.dueDate}
              value={task.due}
            />

            <InfoItem
              icon={AlertCircle}
              label={t.priority}
              value={task.priority === "HIGH" ? t.high : t.medium}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t.close}
          </button>

          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            {t.startTask}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>

      <p className="mt-1.5 text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}
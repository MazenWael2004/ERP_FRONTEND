import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  FileText,
  Megaphone,
  Pin,
  Search,
  Users,
} from "lucide-react";
import { useTranslation } from 'react-i18next';

type AnnouncementType =
  | "ANNOUNCEMENT"
  | "MEETING"
  | "MEMO"
  | "HR";

type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

interface Announcement {
  id: number;
  title: string;
  description: string;
  type: AnnouncementType;
  priority: Priority;
  date: string;
  time: string;
  author: string;
  isPinned: boolean;
  isRead: boolean;
  attachments: number;
}

const announcements: Announcement[] = [
  {
    id: 1,
    title: "Annual Company Meeting",
    description:
      "The annual company meeting will be held on Thursday, September 10th. All department heads are requested to attend.",
    type: "MEETING",
    priority: "HIGH",
    date: "Sep 3, 2026",
    time: "10:00 AM",
    author: "Administration",
    isPinned: true,
    isRead: false,
    attachments: 2,
  },
  {
    id: 2,
    title: "New Attendance Policy",
    description:
      "Please review the updated attendance and working hours policy effective from October 1st, 2026.",
    type: "HR",
    priority: "NORMAL",
    date: "Sep 2, 2026",
    time: "09:30 AM",
    author: "Human Resources",
    isPinned: false,
    isRead: false,
    attachments: 1,
  },
  {
    id: 3,
    title: "System Maintenance Notice",
    description:
      "The ERP system will undergo scheduled maintenance on Friday from 11:00 PM until 2:00 AM.",
    type: "ANNOUNCEMENT",
    priority: "URGENT",
    date: "Sep 1, 2026",
    time: "02:15 PM",
    author: "IT Department",
    isPinned: false,
    isRead: true,
    attachments: 0,
  },
  {
    id: 4,
    title: "Management Meeting Memo",
    description:
      "Meeting memo containing the decisions and action items discussed during the management meeting.",
    type: "MEMO",
    priority: "NORMAL",
    date: "Aug 30, 2026",
    time: "01:00 PM",
    author: "Management",
    isPinned: false,
    isRead: true,
    attachments: 1,
  },
  {
    id: 5,
    title: "Office Holiday Announcement",
    description:
      "The company offices will be closed on Sunday, September 20th due to the official holiday.",
    type: "ANNOUNCEMENT",
    priority: "LOW",
    date: "Aug 28, 2026",
    time: "11:20 AM",
    author: "Administration",
    isPinned: false,
    isRead: true,
    attachments: 0,
  },
];

const typeConfig: Record<
  AnnouncementType,
  {
    label: string;
    icon: typeof Bell;
    light: string;
    dark: string;
  }
> = {
  ANNOUNCEMENT: {
    label: "Announcement",
    icon: Megaphone,
    light: "bg-blue-50 text-blue-600",
    dark: "dark:bg-blue-500/10 dark:text-blue-400",
  },
  MEETING: {
    label: "Meeting",
    icon: Users,
    light: "bg-purple-50 text-purple-600",
    dark: "dark:bg-purple-500/10 dark:text-purple-400",
  },
  MEMO: {
    label: "Memo",
    icon: FileText,
    light: "bg-amber-50 text-amber-600",
    dark: "dark:bg-amber-500/10 dark:text-amber-400",
  },
  HR: {
    label: "HR Notice",
    icon: Bell,
    light: "bg-emerald-50 text-emerald-600",
    dark: "dark:bg-emerald-500/10 dark:text-emerald-400",
  },
};

const priorityConfig: Record<
  Priority,
  {
    label: string;
    className: string;
  }
> = {
  LOW: {
    label: "Low",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  NORMAL: {
    label: "Normal",
    className:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  HIGH: {
    label: "High",
    className:
      "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  },
  URGENT: {
    label: "Urgent",
    className:
      "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
};

export default function Announcements() {
  const [activeType, setActiveType] = useState<
    "ALL" | AnnouncementType
  >("ALL");

  const {t} = useTranslation();

  const [search, setSearch] = useState("");

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const matchesType =
        activeType === "ALL" ||
        announcement.type === activeType;

      const searchValue = search.toLowerCase();

      const matchesSearch =
        announcement.title.toLowerCase().includes(searchValue) ||
        announcement.description
          .toLowerCase()
          .includes(searchValue);

      return matchesType && matchesSearch;
    });
  }, [activeType, search]);

  const pinnedAnnouncement = announcements.find(
    (announcement) => announcement.isPinned
  );

  const unreadCount = announcements.filter(
    (announcement) => !announcement.isRead
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            {/* <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <span>Home</span>
              <ChevronRight size={15} />
              <span className="text-slate-600 dark:text-slate-300">
                Announcements
              </span>
            </div> */}

            <h1 className="text-3xl font-bold tracking-tight">
              {t("ANNOUNCEMENTS")}
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("STAY_UPDATED")}
            </p>
          </div>

          {/* Unread */}
          <div className="flex h-10 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Bell
              size={17}
              className="text-slate-500 dark:text-slate-400"
            />

            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {unreadCount} unread
            </span>
          </div>
        </div>

        {/* Featured */}
        {pinnedAnnouncement && (
          <div className="mb-8 overflow-hidden rounded-2xl bg-slate-900 shadow-sm dark:bg-slate-800">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-7 lg:p-8">

                <div className="mb-4 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                    <Pin size={12} />
                    Pinned
                  </span>

                  <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-medium text-orange-300">
                    High Priority
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white">
                  {pinnedAnnouncement.title}
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  {pinnedAnnouncement.description}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    {pinnedAnnouncement.date}
                  </div>

                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    {pinnedAnnouncement.author}
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSelectedAnnouncement(pinnedAnnouncement)
                  }
                  className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  View announcement
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="hidden w-72 items-center justify-center bg-white/5 lg:flex">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10">
                  <Megaphone
                    size={42}
                    className="text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex flex-wrap gap-1">
              {[
                { value: "ALL", label: "All" },
                {
                  value: "ANNOUNCEMENT",
                  label: "Announcements",
                },
                {
                  value: "MEETING",
                  label: "Meetings",
                },
                {
                  value: "MEMO",
                  label: "Memos",
                },
                {
                  value: "HR",
                  label: "HR Notices",
                },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() =>
                    setActiveType(
                      tab.value as "ALL" | AnnouncementType
                    )
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    activeType === tab.value
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-72">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search announcements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Cards */}
          <div className="space-y-4 lg:col-span-2">
            {filteredAnnouncements.map((announcement) => {
              const type = typeConfig[announcement.type];
              const priority =
                priorityConfig[announcement.priority];

              const Icon = type.icon;

              return (
                <div
                  key={announcement.id}
                  className={`group rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${
                    announcement.isRead
                      ? "border-slate-200 dark:border-slate-800"
                      : "border-blue-200 dark:border-blue-900/60"
                  }`}
                >
                  <div className="flex gap-4">

                    {/* Icon */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${type.light} ${type.dark}`}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${type.light} ${type.dark}`}
                        >
                          {type.label}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${priority.className}`}
                        >
                          {priority.label}
                        </span>

                        {!announcement.isRead && (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                            New
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {announcement.title}
                      </h3>

                      {/* Description */}
                      <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {announcement.description}
                      </p>

                      {/* Footer */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            {announcement.date}
                          </span>

                          <span>
                            {announcement.time}
                          </span>

                          <span>
                            {announcement.author}
                          </span>

                          {announcement.attachments > 0 && (
                            <span className="flex items-center gap-1.5">
                              <FileText size={14} />
                              {announcement.attachments} attachment
                              {announcement.attachments > 1
                                ? "s"
                                : ""}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() =>
                            setSelectedAnnouncement(
                              announcement
                            )
                          }
                          className="flex items-center gap-1 text-sm font-semibold text-slate-700 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                        >
                          Read more
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty */}
            {filteredAnnouncements.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
                <Megaphone
                  size={35}
                  className="mx-auto text-slate-300 dark:text-slate-600"
                />

                <h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-200">
                  No announcements found
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Try changing your search or filter.
                </p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">

            {/* Overview */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Overview
              </h3>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {announcements.length}
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-500/10">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Unread
                  </p>

                  <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {unreadCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Categories
              </h3>

              <div className="mt-4 space-y-2">
                {(
                  Object.entries(typeConfig) as [
                    AnnouncementType,
                    (typeof typeConfig)[AnnouncementType]
                  ][]
                ).map(([key, value]) => {
                  const Icon = value.icon;

                  const count = announcements.filter(
                    (a) => a.type === key
                  ).length;

                  return (
                    <button
                      key={key}
                      onClick={() => setActiveType(key)}
                      className="flex w-full items-center justify-between rounded-lg p-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${value.light} ${value.dark}`}
                        >
                          <Icon size={16} />
                        </div>

                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {value.label}
                        </span>
                      </div>

                      <span className="text-xs font-medium text-slate-400">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/60"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="border-b border-slate-200 p-6 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        typeConfig[
                          selectedAnnouncement.type
                        ].light
                      } ${
                        typeConfig[
                          selectedAnnouncement.type
                        ].dark
                      }`}
                    >
                      {
                        typeConfig[
                          selectedAnnouncement.type
                        ].label
                      }
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        priorityConfig[
                          selectedAnnouncement.priority
                        ].className
                      }`}
                    >
                      {
                        priorityConfig[
                          selectedAnnouncement.priority
                        ].label
                      }
                    </span>
                  </div>

                  <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {selectedAnnouncement.title}
                  </h2>
                </div>

                <button
                  onClick={() =>
                    setSelectedAnnouncement(null)
                  }
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-6">
              <div className="flex flex-wrap gap-5 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  {selectedAnnouncement.date}
                </span>

                <span>
                  {selectedAnnouncement.time}
                </span>

                <span className="flex items-center gap-2">
                  <Users size={16} />
                  {selectedAnnouncement.author}
                </span>
              </div>

              <p className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {selectedAnnouncement.description}
              </p>

              {selectedAnnouncement.attachments > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Attachments
                  </h4>

                  <div className="mt-3 space-y-2">
                    {Array.from({
                      length: selectedAnnouncement.attachments,
                    }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10">
                          <FileText
                            size={17}
                            className="text-red-500"
                          />
                        </div>

                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Document_{index + 1}.pdf
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex justify-end border-t border-slate-200 p-4 dark:border-slate-800">
              <button
                onClick={() =>
                  setSelectedAnnouncement(null)
                }
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
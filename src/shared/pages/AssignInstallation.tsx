import { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  CalendarDays,
  MapPin,
  UserRound,
  Building2,
  FileText,
  ChevronDown,
  X,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Wrench,
  Users,
} from 'lucide-react';

const mockInstallations: any[] = [
  {
    id: 1,
    contractNumber: 'CNT-2026-00125',
    customerName: 'صيدليات العزبي',
    branchName: 'فرع الدقي',
    address: 'شارع محيي الدين أبو العز - الدقي',
    plan: 'Gold',
    program: 'B-Connect ERP',
    representative: 'غير معين',
    status: 'WAITING_ASSIGNMENT',
    priority: 'HIGH',
    approvedAt: '2026-09-26',
    dueDate: '2026-09-28',
    units: 3,
    estimatedDuration: '3 ساعات',
    notes: 'العميل يحتاج التركيب قبل نهاية الأسبوع',
  },
  {
    id: 2,
    contractNumber: 'CNT-2026-00126',
    customerName: 'صيدليات رشدي',
    branchName: 'فرع المهندسين',
    address: 'شارع جامعة الدول العربية - المهندسين',
    plan: 'Silver',
    program: 'B-Connect ERP',
    representative: 'غير معين',
    status: 'WAITING_ASSIGNMENT',
    priority: 'MEDIUM',
    approvedAt: '2026-09-25',
    dueDate: '2026-09-29',
    units: 1,
    estimatedDuration: '2 ساعة',
  },
  {
    id: 3,
    contractNumber: 'CNT-2026-00127',
    customerName: 'Pharma Plus',
    branchName: 'Nasr City Branch',
    address: 'Makram Ebeid, Nasr City',
    plan: 'Gold',
    program: 'B-Connect ERP',
    representative: 'Ali Hassan',
    status: 'ASSIGNED',
    priority: 'HIGH',
    approvedAt: '2026-09-24',
    dueDate: '2026-09-28',
    units: 2,
    estimatedDuration: '3 ساعات',
  },
  {
    id: 4,
    contractNumber: 'CNT-2026-00128',
    customerName: 'صيدليات سيف',
    branchName: 'فرع أكتوبر',
    address: 'المحور المركزي - 6 أكتوبر',
    plan: 'Silver',
    program: 'B-Connect ERP',
    representative: 'غير معين',
    status: 'WAITING_ASSIGNMENT',
    priority: 'LOW',
    approvedAt: '2026-09-23',
    dueDate: '2026-10-01',
    units: 1,
    estimatedDuration: '2 ساعة',
  },
  {
    id: 5,
    contractNumber: 'CNT-2026-00129',
    customerName: 'Care Pharmacy',
    branchName: 'Zamalek Branch',
    address: '26th July Street, Zamalek',
    plan: 'Gold',
    program: 'B-Connect ERP',
    representative: 'Mohamed Ahmed',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    approvedAt: '2026-09-22',
    dueDate: '2026-09-27',
    units: 4,
    estimatedDuration: '4 ساعات',
  },
];

const mockRepresentatives: any[] = [
  {
    id: 1,
    name: 'Ali Hassan',
    phone: '01012345678',
    activeTasks: 3,
    capacity: 5,
    area: 'الدقي / المهندسين',
  },
  {
    id: 2,
    name: 'Mohamed Ahmed',
    phone: '01098765432',
    activeTasks: 2,
    capacity: 5,
    area: 'مدينة نصر / مصر الجديدة',
  },
  {
    id: 3,
    name: 'Omar Khaled',
    phone: '01123456789',
    activeTasks: 4,
    capacity: 6,
    area: 'أكتوبر / الشيخ زايد',
  },
  {
    id: 4,
    name: 'Hassan Mahmoud',
    phone: '01234567890',
    activeTasks: 1,
    capacity: 5,
    area: 'الجيزة / الهرم',
  },
];

const statusConfig: any = {
  WAITING_ASSIGNMENT: {
    label: 'في انتظار التعيين',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: Clock3,
  },
  ASSIGNED: {
    label: 'تم التعيين',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: UserRound,
  },
  IN_PROGRESS: {
    label: 'جاري التركيب',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Wrench,
  },
  COMPLETED: {
    label: 'مكتمل',
    className: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle2,
  },
};

const priorityConfig: any = {
  HIGH: {
    label: 'عالية',
    className: 'text-red-600 bg-red-50',
  },
  MEDIUM: {
    label: 'متوسطة',
    className: 'text-orange-600 bg-orange-50',
  },
  LOW: {
    label: 'منخفضة',
    className: 'text-gray-600 bg-gray-100',
  },
};

export default function InstallationAssignment() {
  const [installations, setInstallations] = useState<any[]>(mockInstallations);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [selectedInstallation, setSelectedInstallation] = useState<any>(null);

  const [selectedRep, setSelectedRep] = useState('');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filteredInstallations = useMemo(() => {
    return installations.filter((item: any) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        item.customerName.toLowerCase().includes(searchValue) ||
        item.contractNumber.toLowerCase().includes(searchValue) ||
        item.branchName.toLowerCase().includes(searchValue);

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [installations, search, statusFilter, priorityFilter]);

  const waitingCount = installations.filter((x: any) => x.status === 'WAITING_ASSIGNMENT').length;

  const assignedCount = installations.filter((x: any) => x.status === 'ASSIGNED').length;

  const inProgressCount = installations.filter((x: any) => x.status === 'IN_PROGRESS').length;

  const handleAssign = () => {
    if (!selectedInstallation || !selectedRep) return;

    const rep = mockRepresentatives.find((x: any) => String(x.id) === selectedRep);

    if (!rep) return;

    setInstallations((prev: any[]) =>
      prev.map((item: any) =>
        item.id === selectedInstallation.id
          ? {
              ...item,
              representative: rep.name,
              status: 'ASSIGNED',
            }
          : item,
      ),
    );

    setSelectedInstallation(null);
    setSelectedRep('');
  };

  const toggleSelection = (id: number) => {
    setSelectedIds((prev: number[]) =>
      prev.includes(id) ? prev.filter((x: number) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredInstallations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInstallations.map((x: any) => x.id));
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <span>العمليات</span>
              <span>/</span>
              <span className="text-gray-900">تعيين التركيبات</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">تعيين التركيبات</h1>

            <p className="mt-1 text-sm text-gray-500">
              تعيين عقود التركيب المعتمدة إلى مندوبي الدعم الفني
            </p>
          </div>

          <button
            onClick={() => {
              setStatusFilter('WAITING_ASSIGNMENT');
              setPriorityFilter('ALL');
            }}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Wrench size={17} />
            التركيبات التي تحتاج تعيين
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="في انتظار التعيين"
          value={waitingCount}
          icon={<Clock3 size={20} />}
          iconClass="bg-orange-100 text-orange-600"
        />

        <StatCard
          title="تم التعيين"
          value={assignedCount}
          icon={<UserRound size={20} />}
          iconClass="bg-blue-100 text-blue-600"
        />

        <StatCard
          title="جاري التركيب"
          value={inProgressCount}
          icon={<Wrench size={20} />}
          iconClass="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث برقم العقد أو اسم العميل أو الفرع..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-10 pl-4 text-sm outline-none focus:border-gray-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none"
            >
              <option value="ALL">كل الحالات</option>
              <option value="WAITING_ASSIGNMENT">في انتظار التعيين</option>
              <option value="ASSIGNED">تم التعيين</option>
              <option value="IN_PROGRESS">جاري التركيب</option>
              <option value="COMPLETED">مكتمل</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none"
            >
              <option value="ALL">كل الأولويات</option>
              <option value="HIGH">عالية</option>
              <option value="MEDIUM">متوسطة</option>
              <option value="LOW">منخفضة</option>
            </select>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Users size={18} />
              تم تحديد {selectedIds.length} عقد
            </div>

            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => {
                const first = installations.find((x: any) => selectedIds.includes(x.id));

                if (first) {
                  setSelectedInstallation(first);
                }
              }}
            >
              تعيين المندوب
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      filteredInstallations.length > 0 &&
                      selectedIds.length === filteredInstallations.length
                    }
                    onChange={toggleAll}
                  />
                </th>

                <th className="px-4 py-3 text-xs font-semibold text-gray-500">العقد</th>

                <th className="px-4 py-3 text-xs font-semibold text-gray-500">العميل / الفرع</th>

                <th className="px-4 py-3 text-xs font-semibold text-gray-500">الخطة</th>

                <th className="px-4 py-3 text-xs font-semibold text-gray-500">الأولوية</th>

                <th className="px-4 py-3 text-xs font-semibold text-gray-500">موعد التركيب</th>

                <th className="px-4 py-3 text-xs font-semibold text-gray-500">المندوب</th>

                <th className="px-4 py-3 text-xs font-semibold text-gray-500">الحالة</th>

                <th className="px-4 py-3 text-xs font-semibold text-gray-500">الإجراء</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredInstallations.map((item: any) => {
                const status = statusConfig[item.status];
                const priority = priorityConfig[item.priority];

                const StatusIcon = status.icon;

                return (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={17} className="text-gray-400" />

                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.contractNumber}
                          </p>

                          <p className="text-xs text-gray-400">{item.approvedAt}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.customerName}</p>

                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          <Building2 size={13} />
                          {item.branchName}
                        </div>

                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                          <MapPin size={12} />
                          {item.address}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div>
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                          {item.plan}
                        </span>

                        <p className="mt-2 text-xs text-gray-500">{item.units} وحدة</p>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${priority.className}`}
                      >
                        {priority.label}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDays size={16} className="text-gray-400" />

                        <div>
                          <p className="font-medium text-gray-800">{item.dueDate}</p>

                          <p className="text-xs text-gray-400">{item.estimatedDuration}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {item.representative === 'غير معين' ? (
                        <span className="text-sm text-gray-400">غير معين</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                            <UserRound size={15} />
                          </div>

                          <span className="text-sm font-medium text-gray-800">
                            {item.representative}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
                      >
                        <StatusIcon size={13} />
                        {status.label}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => {
                          setSelectedInstallation(item);

                          const rep = mockRepresentatives.find(
                            (x: any) => x.name === item.representative,
                          );

                          setSelectedRep(rep ? String(rep.id) : '');
                        }}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {item.status === 'WAITING_ASSIGNMENT' ? 'تعيين' : 'تعديل التعيين'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInstallations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle size={32} className="mb-3 text-gray-300" />

            <p className="font-medium text-gray-700">لا توجد نتائج</p>

            <p className="mt-1 text-sm text-gray-400">حاول تغيير البحث أو الفلاتر</p>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {selectedInstallation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl" dir="rtl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">تعيين مندوب للتركيب</h2>

                <p className="mt-1 text-sm text-gray-500">{selectedInstallation.contractNumber}</p>
              </div>

              <button
                onClick={() => setSelectedInstallation(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              {/* Contract Summary */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={<Building2 size={16} />}
                    label="العميل"
                    value={selectedInstallation.customerName}
                  />

                  <InfoItem
                    icon={<MapPin size={16} />}
                    label="الفرع"
                    value={selectedInstallation.branchName}
                  />

                  <InfoItem
                    icon={<CalendarDays size={16} />}
                    label="موعد التركيب"
                    value={selectedInstallation.dueDate}
                  />

                  <InfoItem
                    icon={<Wrench size={16} />}
                    label="عدد الوحدات"
                    value={`${selectedInstallation.units} وحدة`}
                  />
                </div>
              </div>

              {/* Representative */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  اختر مندوب الدعم الفني
                </label>

                <div className="relative">
                  <select
                    value={selectedRep}
                    onChange={(e) => setSelectedRep(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 pl-10 text-sm outline-none focus:border-gray-400"
                  >
                    <option value="">اختر المندوب...</option>

                    {mockRepresentatives.map((rep: any) => (
                      <option key={rep.id} value={rep.id}>
                        {rep.name} — {rep.area} — {rep.activeTasks}/{rep.capacity} مهام
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              {/* Representatives */}
              <div className="mt-4 space-y-2">
                {mockRepresentatives.map((rep: any) => {
                  const percentage = (rep.activeTasks / rep.capacity) * 100;

                  return (
                    <button
                      key={rep.id}
                      onClick={() => setSelectedRep(String(rep.id))}
                      className={`w-full rounded-xl border p-3 text-right transition ${
                        selectedRep === String(rep.id)
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                            <UserRound size={17} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900">{rep.name}</p>

                            <p className="text-xs text-gray-500">{rep.area}</p>
                          </div>
                        </div>

                        <div className="text-left">
                          <p className="text-xs text-gray-500">المهام الحالية</p>

                          <p className="text-sm font-semibold">
                            {rep.activeTasks}/{rep.capacity}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-gray-800"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedInstallation.notes && (
                <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                  <span className="font-semibold">ملاحظات:</span> {selectedInstallation.notes}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 p-5">
              <button
                onClick={() => setSelectedInstallation(null)}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                إلغاء
              </button>

              <button
                disabled={!selectedRep}
                onClick={handleAssign}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                تأكيد التعيين
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, iconClass }: any) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: any) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
        {icon}
        {label}
      </div>

      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

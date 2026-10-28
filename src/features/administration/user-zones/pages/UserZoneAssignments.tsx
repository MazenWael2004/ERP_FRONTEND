import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { Button } from 'src/components/ui/button';
import { Checkbox } from 'src/components/ui/checkbox';
import { Label } from 'src/components/ui/label';
import { fetchZones } from 'src/features/zones/api/zoneService';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import userIcon from 'src/assets/images/logos/working.png';
import {
  fetchUserZoneAssignments,
  replaceUserZones,
  type AssignedZone,
  type UserZoneAssignment,
} from '../api/userZoneService';

interface Zone extends AssignedZone {}

export default function UserZoneAssignments() {
  const { i18n, t } = useTranslation();
  const { hasPermission } = useAuth();
  const [assignments, setAssignments] = useState<UserZoneAssignment[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isArabic = i18n.language.startsWith('ar');
  const canWrite = hasPermission('/user-zone-assignments', 'WRITE');

  const selectedUser = useMemo(
    () => assignments.find((assignment) => assignment.user_id === selectedUserId) ?? null,
    [assignments, selectedUserId],
  );

  const availableRoles = useMemo(() => {
    const roles = new Map<string, { name_en: string; name_ar: string }>();
    assignments.forEach((assignment) => {
      assignment.roles.forEach((role) => roles.set(role.code, role));
    });
    return [...roles.entries()].sort(([, first], [, second]) =>
      (isArabic ? first.name_ar : first.name_en).localeCompare(isArabic ? second.name_ar : second.name_en),
    );
  }, [assignments, isArabic]);

  const filteredAssignments = useMemo(
    () =>
      roleFilter === 'ALL'
        ? assignments
        : assignments.filter((assignment) => assignment.roles.some((role) => role.code === roleFilter)),
    [assignments, roleFilter],
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [users, zoneResponse] = await Promise.all([
          fetchUserZoneAssignments(),
          fetchZones(),
        ]);

        const availableZones = zoneResponse.data ?? [];
        setAssignments(users);
        setZones(availableZones);

        if (users[0]) {
          setSelectedUserId(users[0].user_id);
          setSelectedZoneIds(users[0].zones.map((zone) => zone.id));
        }
      } catch (error) {
        console.error('Failed to load zone assignments:', error);
        toast.error(t('USER_ZONE_ASSIGNMENTS_LOAD_FAILED'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [t]);

  const handleUserChange = (userId: number) => {
    const user = assignments.find((assignment) => assignment.user_id === userId);
    setSelectedUserId(userId);
    setSelectedZoneIds(user?.zones.map((zone) => zone.id) ?? []);
  };

  const handleRoleFilterChange = (nextRoleFilter: string) => {
    setRoleFilter(nextRoleFilter);
    const nextAssignments =
      nextRoleFilter === 'ALL'
        ? assignments
        : assignments.filter((assignment) => assignment.roles.some((role) => role.code === nextRoleFilter));
    const nextUser = nextAssignments[0] ?? null;
    setSelectedUserId(nextUser?.user_id ?? null);
    setSelectedZoneIds(nextUser?.zones.map((zone) => zone.id) ?? []);
  };

  const getRoleLabel = (assignment: UserZoneAssignment) =>
    assignment.roles
      .map((role) => (isArabic ? role.name_ar : role.name_en))
      .filter(Boolean)
      .join(isArabic ? '، ' : ', ');

  const toggleZone = (zoneId: number, checked: boolean) => {
    setSelectedZoneIds((current) =>
      checked ? [...new Set([...current, zoneId])] : current.filter((id) => id !== zoneId),
    );
  };

  const saveAssignments = async () => {
    if (!selectedUserId) return;

    try {
      setIsSaving(true);
      const savedZones = await replaceUserZones(selectedUserId, selectedZoneIds);
      setAssignments((current) =>
        current.map((assignment) =>
          assignment.user_id === selectedUserId
            ? { ...assignment, zones: savedZones }
            : assignment,
        ),
      );
      toast.success(t('USER_ZONE_ASSIGNMENTS_SAVED'));
    } catch (error) {
      console.error('Failed to save zone assignments:', error);
      toast.error(t('USER_ZONE_ASSIGNMENTS_SAVE_FAILED'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <BreadcrumbComp title={t('USER_ZONE_ASSIGNMENTS')} breadCrumbBg={userIcon} />

      <section className="rounded-lg border border-border bg-card p-5 shadow-sm" dir={isArabic ? 'rtl' : 'ltr'}>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('NO_USERS_AVAILABLE')}</p>
        ) : (
          <div className="space-y-6">
            <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="zone-assignment-role">{isArabic ? 'تصفية حسب الدور' : 'Filter by role'}</Label>
                <select
                  id="zone-assignment-role"
                  value={roleFilter}
                  onChange={(event) => handleRoleFilterChange(event.target.value)}
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="ALL">{isArabic ? 'كل المستخدمين' : 'All users'}</option>
                  {availableRoles.map(([code, role]) => (
                    <option key={code} value={code}>
                      {isArabic ? role.name_ar : role.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="zone-assignment-user">{t('SELECT_USER')}</Label>
                <select
                  id="zone-assignment-user"
                  value={selectedUserId ?? ''}
                  onChange={(event) => handleUserChange(Number(event.target.value))}
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {filteredAssignments.map((assignment) => (
                    <option key={assignment.user_id} value={assignment.user_id}>
                      {assignment.username} — {isArabic ? assignment.name_ar : assignment.name_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="mb-3">
                <h2 className="font-semibold">{t('ASSIGNED_ZONES')}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedUser
                    ? `${t('MANAGE_ZONES_FOR')} ${selectedUser.username}`
                    : t('SELECT_USER')}
                </p>
                {selectedUser && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isArabic ? 'الدور:' : 'Role:'} {getRoleLabel(selectedUser) || '—'}
                    {(selectedUser.manager_username || selectedUser.manager_name_en || selectedUser.manager_name_ar) && (
                      <>
                        {' · '}
                        {isArabic ? 'المدير المباشر:' : 'Direct manager:'}{' '}
                        {selectedUser.manager_username} —{' '}
                        {isArabic ? selectedUser.manager_name_ar : selectedUser.manager_name_en}
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {zones.map((zone) => {
                  const zoneName = isArabic ? zone.name_ar : zone.name_en;
                  const isChecked = selectedZoneIds.includes(zone.id);

                  return (
                    <label
                      key={zone.id}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 transition hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={isChecked}
                        disabled={!canWrite || isSaving}
                        onCheckedChange={(checked) => toggleZone(zone.id, checked === true)}
                        aria-label={zoneName}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{zoneName}</span>
                        {zone.code && <span className="block text-xs text-muted-foreground">{zone.code}</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {canWrite && (
              <div className={isArabic ? 'flex justify-start' : 'flex justify-end'}>
                <Button type="button" onClick={saveAssignments} disabled={!selectedUser || isSaving}>
                  {isSaving ? t('SAVING') : t('SAVE_ZONE_ASSIGNMENTS')}
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}

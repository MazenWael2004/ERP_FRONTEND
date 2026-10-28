import { api } from 'src/shared/api/axios';

export interface AssignedZone {
  id: number;
  name_en: string;
  name_ar: string;
  code?: string | null;
}

export interface UserZoneAssignment {
  user_id: number;
  username: string;
  name_en: string;
  name_ar: string;
  manager_username?: string | null;
  manager_name_en?: string | null;
  manager_name_ar?: string | null;
  roles: Array<{
    code: string;
    name_en: string;
    name_ar: string;
  }>;
  zones: AssignedZone[];
}

export const fetchUserZoneAssignments = async (): Promise<UserZoneAssignment[]> => {
  const response = await api.get('/user-zones');
  return response.data.data ?? [];
};

export const replaceUserZones = async (userId: number, zoneIds: number[]) => {
  const response = await api.put(`/user-zones/${userId}`, { zoneIds });
  return response.data.data as AssignedZone[];
};

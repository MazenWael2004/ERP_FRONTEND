import { api } from '../../../../shared/api/axios';

export type WorkflowContract = {
  id: number;
  contract_date: string;
  workflow_status: string;
  sales_responsible_id?: number | null;
  created_by_username?: string | null;
  created_by_name_ar?: string | null;
  created_by_name_en?: string | null;
  customer_name_ar?: string | null;
  customer_name_en?: string | null;
  customer_code?: string | null;
  contact_name_ar?: string | null;
  contact_name_en?: string | null;
  contact_type?: string | null;
  contact_national_id?: string | null;
  zone_name_ar?: string | null;
  zone_name_en?: string | null;
  total_after_discount?: number | null;
  checked_at?: string | null;
  checked_by?: number | null;
  checked_by_username?: string | null;
  checked_by_name_ar?: string | null;
  checked_by_name_en?: string | null;
  assigned_technician_id?: number | null;
  technician_assigned_at?: string | null;
  actual_installation_date?: string | null;
  activation_code_issued_at?: string | null;
  activated_at?: string | null;
  technician_name_ar?: string | null;
  technician_name_en?: string | null;
  implemented_by?: number | null;
  implemented_by_username?: string | null;
  implemented_by_name_ar?: string | null;
  implemented_by_name_en?: string | null;
  rejection_reason?: string | null;
  activation_code?: string | null;
  availableActions: string[];
};

export type WorkflowHistory = {
  id: number;
  action_code: string;
  description?: string | null;
  from_status?: string | null;
  to_status?: string | null;
  metadata?: string | null;
  created_at: string;
  performed_by_name_ar?: string | null;
  performed_by_name_en?: string | null;
};

export type WorkflowDateFilters = {
  startDate?: string;
  endDate?: string;
};

export const fetchContractWorkflow = async (filters: WorkflowDateFilters = {}) =>
  (await api.get('/contract-workflow', { params: filters })).data.data as WorkflowContract[];
export const fetchContractHistory = async (contractId: number) => (await api.get(`/contract-workflow/${contractId}/history`)).data.data as WorkflowHistory[];
export type HierarchyAssignmentOptions = {
  supervisors: Array<{ id: number; name_ar?: string; name_en?: string; username?: string }>;
  technicians: Array<{ id: number; supervisor_id: number; name_ar?: string; name_en?: string; username?: string }>;
};
export const fetchHierarchyAssignmentOptions = async (contractId: number) => (await api.get(`/contract-workflow/${contractId}/technicians`)).data.data as HierarchyAssignmentOptions;
export const checkContract = (contractId: number, note?: string) => api.post(`/contract-workflow/${contractId}/check`, { note });
export const approveContract = (contractId: number, note?: string) => api.post(`/contract-workflow/${contractId}/approve`, { note });
export const assignContractTechnician = (contractId: number, supervisorId: number, technicianId: number, note?: string) => api.post(`/contract-workflow/${contractId}/assign-technician`, { supervisorId, technicianId, note });
export const rejectContract = (contractId: number, reason: string) => api.post(`/contract-workflow/${contractId}/reject`, { reason });
export const installContract = (contractId: number, activationCode: string, note?: string) => api.post(`/contract-workflow/${contractId}/install`, { activationCode, note });
export const activateContract = (contractId: number, note?: string) => api.post(`/contract-workflow/${contractId}/activate`, { note });
export const returnContractToManager = (contractId: number, reason: string) => api.post(`/contract-workflow/${contractId}/return-to-manager`, { reason });
export const addContractNote = (contractId: number, note: string) => api.post(`/contract-workflow/${contractId}/notes`, { note });
export const updatePendingCustomer = (contractId: number, payload: Record<string, unknown>) => api.patch(`/contract-workflow/${contractId}/customer`, payload);

import { api } from '../../../../shared/api/axios';

export type WorkflowContract = {
  id: number;
  contract_date: string;
  workflow_status: string;
  customer_name_ar?: string | null;
  customer_name_en?: string | null;
  customer_code?: string | null;
  zone_name_ar?: string | null;
  zone_name_en?: string | null;
  total_after_discount?: number | null;
  assigned_technician_id?: number | null;
  technician_name_ar?: string | null;
  technician_name_en?: string | null;
  rejection_reason?: string | null;
  availableActions: string[];
};

export type WorkflowHistory = {
  id: number;
  action_code: string;
  description?: string | null;
  created_at: string;
  performed_by_name_ar?: string | null;
  performed_by_name_en?: string | null;
};

export const fetchContractWorkflow = async () => (await api.get('/contract-workflow')).data.data as WorkflowContract[];
export const fetchContractHistory = async (contractId: number) => (await api.get(`/contract-workflow/${contractId}/history`)).data.data as WorkflowHistory[];
export const fetchZoneTechnicians = async (contractId: number) => (await api.get(`/contract-workflow/${contractId}/technicians`)).data.data as Array<{ id: number; name_ar?: string; name_en?: string }>;
export const approveContract = (contractId: number, note?: string) => api.post(`/contract-workflow/${contractId}/approve`, { note });
export const rejectContract = (contractId: number, reason: string) => api.post(`/contract-workflow/${contractId}/reject`, { reason });
export const activateContract = (contractId: number, technicianId: number, note?: string) => api.post(`/contract-workflow/${contractId}/activate`, { technicianId, note });
export const implementContract = (contractId: number, note?: string) => api.post(`/contract-workflow/${contractId}/implement`, { note });

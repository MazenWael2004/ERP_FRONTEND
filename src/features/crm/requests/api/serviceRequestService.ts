import { api } from 'src/shared/api/axios';

export type ServiceRequestItemPayload = { serviceId: number; quantity: number };

export const fetchRequestZones = async () => (await api.get('/service-requests/zones')).data;
export const fetchZoneContracts = async (zoneId: number) => (await api.get('/service-requests/contracts', { params: { zoneId } })).data;
export const fetchRequestCatalog = async () => (await api.get('/service-requests/catalog')).data;
export const createServiceRequest = async (payload: { zoneId: number; contractId: number; notes: string; items: ServiceRequestItemPayload[] }) =>
  (await api.post('/service-requests', payload)).data;
export const fetchPendingServiceRequests = async () => (await api.get('/service-requests/pending')).data;
export const approveServiceRequest = async (id: number, managerNotes: string) => (await api.post(`/service-requests/${id}/approve`, { managerNotes })).data;
export const rejectServiceRequest = async (id: number, rejectionReason: string, managerNotes: string) =>
  (await api.post(`/service-requests/${id}/reject`, { rejectionReason, managerNotes })).data;

import { api } from '../../../../shared/api/axios';

export const fetchContracts = async () => (await api.get('/customers/')).data.data;

const report = async (path: string, startDate?: string, endDate?: string) => {
  const response = await api.get(path, { params: { startDate: startDate || undefined, endDate: endDate || undefined } });
  return response.data.data;
};

export const fetchCollectionsReport = (startDate?: string, endDate?: string) => report('/reports/collections', startDate, endDate);
export const fetchAdditionalUnitsReport = (startDate?: string, endDate?: string) => report('/reports/additional-units', startDate, endDate);
export const fetchReplicationServicesReport = (startDate?: string, endDate?: string) => report('/reports/replication-services', startDate, endDate);
export const fetchSalesReport = (startDate?: string, endDate?: string) => report('/reports/sales', startDate, endDate);

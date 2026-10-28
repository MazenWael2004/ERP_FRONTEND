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

export const fetchMasterfileReport = async (filters: {
  search?: string;
  zoneId?: string;
  programId?: string;
  workflowStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) => {
  const response = await api.get('/reports/masterfile', {
    params: Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''),
    ),
  });
  return response.data.data;
};

export const fetchContractContactsReport = async (filters: {
  search?: string;
  zoneId?: string;
  contactType?: string;
  workflowStatus?: string;
  page?: number;
  pageSize?: number;
}) => {
  const response = await api.get('/reports/contract-contacts', {
    params: Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''),
    ),
  });
  return response.data.data;
};
export const fetchActionHistoryReport = async (filters: {
  startDate?: string;
  endDate?: string;
  userId?: string;
  contractId?: string;
  actionCode?: string;
  limit?: number;
}) => {
  const response = await api.get('/reports/action-history', {
    params: {
      ...filters,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      userId: filters.userId || undefined,
      contractId: filters.contractId || undefined,
      actionCode: filters.actionCode || undefined,
    },
  });
  return response.data.data;
};

export const fetchRejectedContractsReport = async (filters: {
  search?: string;
  zoneId?: string;
  managerId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get('/reports/rejected-contracts', {
    params: Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''),
    ),
  });
  return response.data.data;
};

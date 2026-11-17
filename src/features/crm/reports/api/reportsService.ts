import { api } from '../../../../shared/api/axios';

export const fetchContracts = async () => (await api.get('/customers/')).data.data;

const report = async (path: string, startDate?: string, endDate?: string) => {
  const response = await api.get(path, { params: { startDate: startDate || undefined, endDate: endDate || undefined } });
  return response.data.data;
};

export const fetchCollectionsReport = (startDate?: string, endDate?: string) => report('/reports/collections', startDate, endDate);
export const fetchAdditionalUnitsReport = async (startDate?: string, endDate?: string, requestWorkflowStatus?: string) =>
  (await api.get('/reports/additional-units', { params: { startDate: startDate || undefined, endDate: endDate || undefined, requestWorkflowStatus: requestWorkflowStatus || undefined } })).data.data;
export const fetchReplicationServicesReport = async (startDate?: string, endDate?: string, requestWorkflowStatus?: string) =>
  (await api.get('/reports/replication-services', { params: { startDate: startDate || undefined, endDate: endDate || undefined, requestWorkflowStatus: requestWorkflowStatus || undefined } })).data.data;
export const fetchSubscriptionDuesReport = (startDate?: string, endDate?: string) => report('/reports/subscription-dues', startDate, endDate);
export const fetchRefundedCollectionsReport = (startDate?: string, endDate?: string) => report('/reports/refunded-collections', startDate, endDate);
export const fetchSalesReport = async (startDate?: string, endDate?: string, workflowStatus?: string) => {
  const response = await api.get('/reports/sales', {
    params: {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      workflowStatus: workflowStatus || undefined,
    },
  });
  return response.data.data;
};

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

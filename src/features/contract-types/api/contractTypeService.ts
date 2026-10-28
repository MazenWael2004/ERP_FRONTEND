import { api } from 'src/shared/api/axios';

export type ContractTypePayload = {
  code: string;
  nameEn: string;
  nameAr: string;
  maxMonths: number;
  subscriptionDiscountPercentage: number;
  joiningFeeDiscountPercentage: number;
  requiresSelectedMonths: boolean;
  autoSelectConsecutive: boolean;
  displayOrder: number;
};

export const fetchManagedContractTypes = async () => {
  const response = await api.get('/contract-types/management');
  return response.data;
};

export const createContractType = async (payload: ContractTypePayload) => {
  const response = await api.post('/contract-types/management', payload);
  return response.data;
};

export const updateContractType = async (id: number, payload: ContractTypePayload) => {
  const response = await api.patch(`/contract-types/management/${id}`, payload);
  return response.data;
};

export const setContractTypeStatus = async (id: number, isActive: boolean) => {
  const response = await api.patch(`/contract-types/management/${id}/status`, { isActive });
  return response.data;
};

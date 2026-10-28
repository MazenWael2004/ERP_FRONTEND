import { api } from 'src/shared/api/axios';

export type BankPayload = {
  code: string;
  nameEn: string;
  nameAr: string;
};

export type ManagedBank = BankPayload & {
  id: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string | null;
};

export const fetchManagedBanks = () => api.get('/banks/management');
export const createBank = (payload: BankPayload) => api.post('/banks/management', payload);
export const updateBank = (id: number, payload: BankPayload) => api.patch(`/banks/management/${id}`, payload);
export const setBankStatus = (id: number, isActive: boolean) =>
  api.patch(`/banks/management/${id}/status`, { isActive });

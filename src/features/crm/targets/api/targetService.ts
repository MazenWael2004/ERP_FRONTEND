import { api } from 'src/shared/api/axios';

export async function fetchPaidMonths(contractId: any) {
  const response = await api.get(`/customers/${contractId}/paid-months`);

  return (response.data.data ?? [])
    .map((item: any) => item.paid_month?.slice(0, 7))
    .filter(Boolean);
}

export type ScopedContract = {
  id: number;
  contract_number?: string | null;
  next_subscription_due_date?: string | null;
  last_paid_month?: string | null;
  zone_name_ar?: string | null;
  zone_name_en?: string | null;
  customer_name_ar?: string | null;
  customer_name_en?: string | null;
  customer_code?: string | null;
  representative_name_ar?: string | null;
  representative_name_en?: string | null;
  subscription_price?: number | string | null;
  discount_percentage?: number | string | null;
};

type ScopedContractsResponse = {
  data?: ScopedContract[];
};

export async function getScopedContracts(): Promise<ScopedContract[]> {
  const response = await api.get<ScopedContractsResponse>('/customers/scoped-contracts');
  return response.data.data ?? [];
}

export async function paySelectedMonths(payload: unknown) {
  const response = await api.post('/collections/pay-selected-months', payload);
  return response.data;
}


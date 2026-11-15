import { api } from 'src/shared/api/axios';

export type DashboardSummary = {
  activated_contracts: number;
  total_collected_this_month: number;
  total_invoiced: number;
  total_collected: number;
  collection_rate: number;
  total_debt: number;
  monthly_billed_vs_collected: Array<{
    month_key: string;
    month_start: string;
    invoiced_amount: number;
    collected_amount: number;
  }>;
  collections_by_payment_method: Array<{
    label: string;
    amount: number;
    collection_count: number;
  }>;
  collections_by_status: Array<{
    status: string;
    amount: number;
    collection_count: number;
  }>;
};

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await api.get('/dashboard/summary');
  return response.data.data;
};

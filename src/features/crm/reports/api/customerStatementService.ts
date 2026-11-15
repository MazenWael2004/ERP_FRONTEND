import { api } from '../../../../shared/api/axios';

export type CustomerStatementCustomer = {
  contract_id: number;
  customer_id: number;
  customer_code: string;
  customer_name_ar: string | null;
  customer_name_en: string | null;
};

export type StatementTransaction = {
  transaction_date: string;
  transaction_time: string | null;
  transaction_type: 'INVOICE' | 'COLLECTION';
  transaction_id: number;
  receipt_number: string | null;
  payment_method: string | null;
  request_id: number | null;
  reference_number: string | null;
  transfer_date: string | null;
  description: string;
  debit: number;
  credit: number;
  running_balance: number;
};

export type CustomerStatement = {
  customer: CustomerStatementCustomer;
  summary: {
    openingBalance: number;
    totalDebit: number;
    totalCredit: number;
    closingBalance: number;
  };
  transactions: StatementTransaction[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
};

type CustomerSearchResponse = {
  rows: CustomerStatementCustomer[];
  pagination: CustomerStatement['pagination'];
};

type StatementFilters = {
  contractId: number;
  startDate?: string;
  endDate?: string;
  transactionType?: 'INVOICE' | 'COLLECTION' | '';
  page?: number;
  pageSize?: number;
};

const definedParams = (params: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''));

export const searchStatementCustomers = async (params: {
  search?: string;
  contractId?: string;
  page?: number;
  pageSize?: number;
}): Promise<CustomerSearchResponse> => {
  const response = await api.get('/customer-statements/customers', {
    params: definedParams(params),
  });
  return response.data.data;
};

export const fetchCustomerStatement = async (filters: StatementFilters): Promise<CustomerStatement> => {
  const response = await api.get('/customer-statements', {
    params: definedParams(filters),
  });
  return response.data.data;
};

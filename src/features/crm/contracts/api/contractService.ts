import { api } from "../../../../shared/api/axios";




export const fetchPaymentMethods = async () => {
  const response =  await api.get('/payment-methods');
  return response.data.data;
};

export const fetchBanks = async () => {
  const response = await api.get('/banks');
  return response.data.data;
};

export const fetchNextCustomerCode = async () => {
  const response = await api.get('/customers/next-code');
  return String(response.data?.data?.code ?? '');
};

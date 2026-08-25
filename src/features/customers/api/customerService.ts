import { api } from "../../../shared/api/axios";


export const fetchCustomers = async ()=>{
    const response = await api.get("/customers");
    return response.data;
};


export const deleteCustomer = async (id:any)=>{
  return api.delete(`/customers/${id}`)
};

export const createCustomer = async (customerData:any)=>{
        const response = await api.post("/customers",customerData);
        return response.data;
};

export const checkCustomerExists = async (field:any,value:any,excludeId:any) => {
  const response = await api.get("/customers/check", {
    params: {
      field,
      value,
      excludeId
    },
  });

  return response.data;
};

export const getCustomerById = async(id:any)=>{
    const response = await api.get(`/customers/${id}`);
    return response.data;
};

export const updateCustomer = async (id:any, data:any) => {
  return api.patch(`/customers/${id}`, data);
};

export const fetchGovernorates = async ()=>{
  const response = await api.get("/governorates");
  return response.data;

}

export const fetchCitiesOfGovernorate = async (governorateId:any)=>{
  const response = await api.get(`/cities/${governorateId}`);
  return response.data;
}





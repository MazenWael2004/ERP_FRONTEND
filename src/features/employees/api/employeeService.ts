import { api } from "../../../shared/api/axios";


// export const fetchEmployees = async ()=>{
//     const response = await api.get("/employees");
//     return response.data;
// };

export const fetchEmployees = async (filters = {}) => {
  const response =  await api.get('/employees/filter', {
    params: filters,
  });

  return response.data;
};



export const deleteEmployee = async (id:any)=>{
  return api.delete(`/employees/${id}`)
};

export const createEmployee = async (employeeData: any) => {
   console.log("========== CREATE EMPLOYEE ==========");
  console.log("employeeData:", employeeData);
  console.log("zoneId:", employeeData.zoneId);
  console.log("zoneId type:", typeof employeeData.zoneId);
  const formData = new FormData();

  Object.entries(employeeData).forEach(([key, value]) => {
    if (key === 'documents') return;
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value)); // zones etc.
    } else {
      formData.append(key, String(value ?? ''));
    }
  });

  const files = employeeData.documents;
  if (files) {
    Array.from(files as FileList).forEach((file) => {
      formData.append('documents', file as File);
    });
  }

  const response = await api.post('/employees', formData);
  return response.data;
};

export const getEmployeeById = async(id:any)=>{
    const response = await api.get(`/employees/${id}`);
    return response.data;
};

export const updateEmployee = async (id:any, employeeData:any) => {
  const response = await api.patch(`/employees/${id}`, employeeData);
  return response.data;
};


export const checkEmployeeExists = async (field:any,value:any,excludeId:any) => {
  const response = await api.get("/employees/check", {
    params: {
      field,
      value,
      excludeId
    },
  });

  return response.data;
};

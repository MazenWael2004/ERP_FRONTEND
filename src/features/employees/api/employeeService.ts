import { api } from "../../../shared/api/axios";


export const fetchEmployees = async ()=>{
    const response = await api.get("/employees");
    return response.data;
};

export const deleteEmployee = async (id:any)=>{
  return api.delete(`/employees/${id}`)
};

export const createEmployee = async(employeeData:any)=>{
    const response = await api.post("/employees",{
        nameAr: employeeData.employeeNameAr,
        nameEn: employeeData.employeeNameEn,
        email: employeeData.email,
        employeeNum: employeeData.employeeNum,
        street: employeeData.street,
        city: employeeData.city,
        governorate: employeeData.governorate,
        telephoneNum: employeeData.telephoneNum,
        birthDate: employeeData.birthDate,
        jobId: employeeData.jobId,
        zones: employeeData.zones,
    });
    return response.data;
};


export const getEmployeeById = async(id:any)=>{
    const response = await api.get(`/employees/${id}`);
    return response.data;
};

export const updateEmployee = async (id:any, employeeData:any) => {
  const response = await api.patch(`/employees/${id}`, {
    nameAr: employeeData.employeeNameAr,
    nameEn: employeeData.employeeNameEn,
    email: employeeData.email,
    employeeNum: employeeData.employeeNum,
    street: employeeData.street,
    city: employeeData.city,
    governorate: employeeData.governorate,
    telephoneNum: employeeData.telephoneNum,
    birthDate: employeeData.birthDate,
    jobId: employeeData.jobId,
    zones: employeeData.zones,
    isTerminated: employeeData.isTerminated,
  });
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

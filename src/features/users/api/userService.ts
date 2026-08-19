import { api } from "../../../shared/api/axios";


export const fetchUsers = async ()=>{
    const response = await api.get("/users");
    return response.data;
};




export const createUser = async(userData:any)=>{
    const response = await api.post("/users",{
        userName: userData.userName,
        password: userData.password,
        employeeId: userData.employeeId,
        roles: userData.roles,
    });
    return response.data;
};

export const getUserById = async(id:any)=>{
    const response = await api.get(`/users/${id}`);
    return response.data;
};


export const updateUser = async (userId:any, userData:any) => {
  const response = await api.patch(`/users/${userId}`, {
    userName: userData.userName,
    employeeId: userData.employeeId,
    roles: userData.roles,
  });
  return response.data;
};


export const deleteUser = async (id:any)=>{
    return api.delete(`/users/${id}`)
};


export const checkUserExists = async (field:any,value:any,excludeId:any) => {
  const response = await api.get("/users/check", {
    params: {
      field,
      value,
      excludeId
    },
  });

  return response.data;
};


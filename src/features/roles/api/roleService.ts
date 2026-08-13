import { api } from "../../../shared/api/axios";


export const fetchRoles = async ()=>{
        const response = await api.get("/roles");
        return response.data;
};


export const createRole = async (roleData:any)=>{
        const response = await api.post("/roles",roleData);
        return response.data;
};


export const deleteRole = async (roleId:any)=>{
   const response = await api.delete(`roles/${roleId}`);
   return response.data;
};

export const editRole = async (roleId:any,data:any)=>{
        const response = await api.patch(`roles/${roleId}`,data);
        return response.data;
};


export const getRoleById = async (roleId:any)=>{
        const response  = await api.get(`roles/${roleId}`);
        return response.data;
};


export const fetchPages = async()=>{
        const response = await api.get("pages");
        return response.data;
}




// but we have serveral problems.. what if several users has this role??
// and also what if this is the only role user has....



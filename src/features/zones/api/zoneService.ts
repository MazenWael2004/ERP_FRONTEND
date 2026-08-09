import { api } from "../../../shared/api/axios";


export const fetchZones = async ()=>{
      const response = await api.get("/zones");
      return response.data;
};


export const createZone = async(zoneData:any)=>{
    const response = await api.post("/zones",zoneData);
    return response.data;
};


export const getZoneById = async(id:any)=>{
    const response = await api.get(`/zones/${id}`);
    return response.data;
};

export const updateZone = async (id:any, data:any) => {
  return api.patch(`/zones/${id}`, data);
};

export const checkZoneExists = async (field:any,value:any) => {
  const response = await api.get("/zones/check", {
    params: {
      field,
      value,
    },
  });

  return response.data;
};

export const deleteZone = async (id:any)=>{
  return api.delete(`/zones/${id}`);
};

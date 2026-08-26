import { api } from "../../../shared/api/axios";


export const fetchPrograms = async ()=>{
        const response = await api.get("/programs");
        return response.data;
};


export const createProgram = async(programData:any)=>{
    const response = await api.post("/programs",programData);
    return response.data;
};


export const deleteProgram = async (programId:any)=>{
   const response = await api.delete(`programs/${programId}`);
   return response.data;
};

export const updateProgram = async (id:any, data:any) => {
  return api.patch(`/programs/${id}`, data);
};

export const getProgramById = async(id:any)=>{
       const response = await api.get(`/programs/${id}`);
    return response.data;
}

export const checkProgramExists = async (field:any,value:any,excludeId:any) => {
  const response = await api.get("/programs/check", {
    params: {
      field,
      value,
      excludeId
    },
  });

  return response.data;
};

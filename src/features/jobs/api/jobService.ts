import { api } from "../../../shared/api/axios"




export const fetchJobs = async ()=>{
      const response = await api.get("/jobs");
      return response.data;
};

// ANY TYPE: FIX LATERR..
export const createJob = async (job:any)=>{
     const response = await api.post("/jobs",
        job
     );
};


export const getJobById = async (id:any) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
};

export const updateJob = async (id:any, data:any) => {
  return api.patch(`/jobs/${id}`, data);
};

export const deleteJob = async (id:any)=>{
  return api.delete(`/jobs/${id}`)
};

// jobService.ts

export const checkJobExists = async (field:any,value:any) => {
  const response = await api.get("/jobs/check", {
    params: {
      field,
      value,
    },
  });

  return response.data;
};
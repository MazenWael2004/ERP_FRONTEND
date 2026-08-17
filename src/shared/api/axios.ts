import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});


export const fetchApps = async ()=>{
  const response = await api.get("/apps");
  return response.data;
};




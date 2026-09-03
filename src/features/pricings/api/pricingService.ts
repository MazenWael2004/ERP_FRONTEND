import { api } from "src/shared/api/axios";


export const fetchPricings = async ()=>{
    const response = await api.get("/pricings");
    return response.data;
};


export const createPricing = async(data:any)=>{
    const response = await api.post("/pricings",data);
    return response.data;
};



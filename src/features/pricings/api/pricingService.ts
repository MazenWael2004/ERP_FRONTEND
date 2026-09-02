import { api } from "src/shared/api/axios";


export const fetchPricings = async ()=>{
    const response = await api.get("/pricings");
    return response.data;
};

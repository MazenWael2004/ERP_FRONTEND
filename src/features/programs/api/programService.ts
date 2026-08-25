import { api } from "../../../shared/api/axios";


export const fetchPrograms = async ()=>{
        const response = await api.get("/programs");
        return response.data;
};

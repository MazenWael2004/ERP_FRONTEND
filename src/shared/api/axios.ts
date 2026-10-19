import axios from "axios";
import type { WorkspaceApp } from 'src/features/launcher/appNavigation';

export const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
});


export const fetchApps = async (): Promise<WorkspaceApp[]> => {
  const response = await api.get("/apps");
  return response.data.data ?? [];
};




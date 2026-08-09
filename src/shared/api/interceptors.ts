// Request interceptor to add access token to every request
import i18n from "../../config/i18n";
import { api } from "./axios";

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Accept-Language"] = i18n.language;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const newToken = response.headers["x-access-token"];

    if (newToken) {
      localStorage.setItem("access", newToken);
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 403) {
      localStorage.removeItem("access");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
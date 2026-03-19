<<<<<<< HEAD
import API from './axios';
=======
import axios from "axios";

const defaultBaseUrl = "http://127.0.0.1:8000/api/";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
>>>>>>> d8b7f9f32ff6e12b09a03669c97672a07fff7509

export function getApiErrorMessage(error) {
  if (error.code === "ERR_NETWORK") {
    return `Unable to reach the API at ${API.defaults.baseURL}. Start the backend server or update VITE_API_BASE_URL.`;
  }

  if (typeof error.response?.data === "string" && error.response.data.trim()) {
    return error.response.data;
  }

  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }

  return error.message || "Something went wrong while contacting the API.";
}

export default API;
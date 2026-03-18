import API from './axios';

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
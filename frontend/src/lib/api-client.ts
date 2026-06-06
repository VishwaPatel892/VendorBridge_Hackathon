import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: add auth token if needed
apiClient.interceptors.request.use(
  (config) => {
    // You can attach tokens from localStorage here if your backend uses Bearer tokens
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle global errors like 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Usually we only care about the response data
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (e.g., redirect to login or clear state)
      console.error("Unauthorized: Please log in again.");
      // Optional: window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

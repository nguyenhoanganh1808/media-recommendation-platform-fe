// lib/services/apiClient.ts
import axios from "axios";

// Create basic axios instance without interceptors
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

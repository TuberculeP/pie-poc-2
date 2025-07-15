import axios from "axios";
import type { AxiosError } from "axios";

const axiosClient = axios.create({
  baseURL: "/api",
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

const dataMethods = ["post", "put", "patch", "delete"] as const;

const apiClient = {
  get: async <T>(url: string, params?: any) => {
    try {
      const result = await axiosClient.get<T>(url, { params });
      return {
        status: result.status,
        data: result.data,
        error: null,
      };
    } catch (error) {
      return {
        status: (error as AxiosError).response?.status || 500,
        data: null,
        error: (error as AxiosError).message || "An error occurred",
      };
    }
  },

  ...dataMethods.reduce(
    (acc, method) => {
      acc[method] = async <T>(url: string, data?: any) => {
        try {
          const result = await axiosClient[method]<T>(url, data);
          return {
            status: result.status,
            data: result.data,
            error: null,
          };
        } catch (error) {
          return {
            status: (error as AxiosError).response?.status || 500,
            data: null,
            error: (error as AxiosError).message || "An error occurred",
          };
        }
      };
      return acc;
    },
    {} as Record<
      "post" | "put" | "patch" | "delete",
      <T>(
        ...args: any[]
      ) => Promise<{ status: number; data: T | null; error: string | null }>
    >,
  ),
};

export default apiClient;

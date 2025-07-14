import axios from "axios";

const postRequest = async <T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T> => {
  // post request with cookie credentials
  const { data, status } = await axios.post<T>(url, params || {}, {
    withCredentials: true,
  });
  if (status !== 200) {
    throw new Error("Request failed");
  }
  return data;
};

const getRequest = async <T>(url: string): Promise<T> => {
  // get request with cookie credentials
  const { data, status } = await axios.get<T>(url, {
    withCredentials: true,
  });
  if (status !== 200) {
    throw new Error("Request failed");
  }
  return data;
};

const apiClient = { postRequest, getRequest };

export default apiClient;

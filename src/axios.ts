import axios from "axios";
import { API_V1 } from "./consts";
import { notification } from "antd";

export const apiInstance = axios.create({
  baseURL: `${API_V1}/`,
  withCredentials: true,
});

apiInstance.interceptors.request.use((config) => {
  // localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsImlkIjoiNjgxYzhjN2RiNmQ3ZWQ1YmYyNmRkOTA5IiwiaWF0IjoxNzQ2NzAyODk0LCJleHAiOjE3NDY4NzU2OTR9.UI4WtDm4WVmHLNOnJtdWNE9HeRkcPtb_8nrtbWxsSxA");
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle errors and show notifications
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error?.message || "Something went wrong";

    if (status === 401) {
      localStorage.clear();
      notification.error({
        message: "Unauthorized",
        description: message,
      });
      !window.location.pathname.includes("/articles/app") &&
        window.location.reload();
      return Promise.reject(error);
    }

    if (status === 403) {
      notification.warning({
        message: "Forbidden",
        description: message,
      });
      return Promise.reject(error);
    }

    // notification.error({
    //     message: `Error ${status || ""}`,
    //     description: message,
    // });

    return Promise.reject(error);
  }
);

export const api = apiInstance;

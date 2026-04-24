import {api} from "../axios";
import {useQuery} from "@tanstack/react-query";

const injectToken = (user: any) => {
  const token = localStorage.getItem("token");

  if (user && token) {
    user.token = token;
    user.isLoggedIn = true;
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};
export const useCurrentUser = () => {
  const {data, refetch} = useQuery({
    queryKey: ["currentUser"],
    retry: false,
    refetchOnWindowFocus: false,
    meta: {
      onError(error: any) {
        // console.log(error)
        if (error.response?.status === 401 || error.response?.status === 404) {
          localStorage.clear();
          window.location.reload();
        }
      },
    },
    initialData: () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        injectToken(user);
        return user;
      } catch (error) {
        return {error};
      }
    },
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return {};
      const response = (await api.get("/auth/profile"));
      const user = response?.data?.data || response?.data || response || {};
      injectToken(user);
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    },
  });
  data.refetch = refetch;

  return data;
};

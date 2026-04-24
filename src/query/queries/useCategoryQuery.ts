import {api} from "../../axios";
import {useQuery} from "@tanstack/react-query";

export const useGetCategories = () => {
  const {isLoading, data, refetch} = useQuery({
    queryKey: ["get-categories"],
    queryFn: async () => {
      const response = await api.get(`/categories`);
      return response.data;
    },
    enabled: true, // only run if type is not null
  });

  return {
    data: data?.data?.data || data?.data || data || [],
    refetch,
    isLoading,
  };
};

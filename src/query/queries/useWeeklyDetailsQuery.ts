import { api } from "../../axios";
import { useQuery } from "@tanstack/react-query";

export const useGetWeeklyDetails = (params: {
  page: number;
  limit: number;
  sortField: any;
  sortOrder: string | null;
  pregnancy_weeks?: number[];
  search?: string;
}) => {
  const { isLoading, data, refetch } = useQuery({
    queryKey: [
      "get-weekly-details",
      params.page,
      params.limit,
      params.sortField,
      params.sortOrder,
    ],
    queryFn: async () => {
      return (
        await api.get(`/weekly-details`, {
          params,
        })
      ).data;
    },
  });

  const _data = data?.data?.data || data?.data || data || [];
  const { pagination } = data?.data ||
    data || {
      pagination: {
        page: 1,
        total: _data.length,
        limit: 10,
      },
    };
  // const total = pagination?.total || _data.length;
  return {
    data: _data,
    pagination,
    refetch,
    isLoading,
  };
};

export const useGetWeeklyDetail = (
  slug: string | null,
  mode: string = "get"
) => {
  const { isLoading, data, error, refetch } = useQuery({
    queryKey: ["get-weekly-detail", slug, mode],
    queryFn: async () => {
      try {
        return (await api.get(`/weekly-details/${slug}`)).data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          throw new Error("STORE_NOT_FOUND");
        }
        throw err;
      }
    },
    enabled: !!slug && slug.trim().length > 0,
    staleTime: 0,
    refetchOnMount: true,
  });

  return {
    data: data?.data || data || {},
    refetch,
    isLoading,
    error,
  };
};

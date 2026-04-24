import { api } from "../../axios";
import { useQuery } from "@tanstack/react-query";
import { defaultPaginate } from "../../consts.ts";

interface QueryOptions {
  enabled?: boolean;

  [key: string]: any;
}

export const useGetQuery = (
  url: string | null,
  params: {
    page: number;
    limit: number;
    sortField?: any | null;
    sortOrder?: string | null;
    [key: string]: any; // Allow additional properties with any type
  } | null,
  options?: QueryOptions
) => {
  const { isLoading, data, isRefetchError, isError, refetch } = useQuery({
    queryKey: [`get-${url}`, params],
    queryFn: async () => {
      if (!url) return null;
      return (
        await api.get(url, {
          params,
        })
      ).data;
    },
    enabled:
      url !== null && (options?.enabled !== undefined ? options.enabled : true),
    ...options,
  });

  const _data = data?.data?.data || data?.data || data || [];
  const { pagination } = data?.data ||
    data || {
      pagination: { ...defaultPaginate, total: _data.length },
    };

  return {
    data: _data,
    pagination,
    refetch,
    isLoading,
    isError,
    isRefetchError,
  };
};

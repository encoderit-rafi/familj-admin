import { api } from "../../axios";
import { useQuery } from "@tanstack/react-query";

export const useGetArticles = (params: {
  page: number;
  limit: number;
  sortField: any;
  sortOrder: string | null;
  pregnancy_weeks?: number[];
  search?: string;
}) => {
  const { isLoading, data, refetch } = useQuery({
    queryKey: [
      "get-articles",
      params.page,
      params.limit,
      params.sortField,
      params.sortOrder,
    ],
    queryFn: async () => {
      return (
        await api.get(`/articles`, {
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

export const useGetArticle = (
  slug: string | null,
  mode: string = "get",
  token: string = ""
) => {
  const { isLoading, data, error, refetch } = useQuery({
    queryKey: ["get-article", slug, mode],
    queryFn: async () => {
      try {
        return (
          await api.get(`/articles/${slug}?lang=all`, {
            params: {
              token,
            },
          })
        ).data;
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

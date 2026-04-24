import {api} from "../../../axios.ts";
import {useQuery} from "@tanstack/react-query";

export const useGetStores = (
  params: {
    page: number,
    limit: number,
    sortField: any,
    sortOrder: string | null,
  }
) => {
  const {isLoading, data, refetch} = useQuery({
    queryKey: ["get-stores", params.page, params.limit, params.sortField, params.sortOrder],
    queryFn: async () => {
      return (
        await api.get(`/stores`, {
          params
        })
      ).data;
    },
  });
  const _data = data?.data || data || []
  const {pagination} = data?.data || data || {
    pagination: {
      page: 1,
      total: _data.length,
      limit: 10,
    }
  };
  return {
    data: _data,
    pagination,
    refetch,
    isLoading,
  };
};

export const useGetStoreBySlug = (slug: string | null) => {
  const {isLoading, data, error, refetch} = useQuery({
    queryKey: ["get-store", slug],
    queryFn: async () => {
      try {
        return (await api.get(`/stores/${slug}`)).data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          throw new Error("STORE_NOT_FOUND");
        }
        throw err;
      }
    },
    enabled: !!slug && slug.trim().length > 0,
  });

  const _data = data?.data || data || [];
  const {store, products} = _data || {store: {}, products: []};

  return {
    store,
    products,
    refetch,
    isLoading,
    error,
  };
};

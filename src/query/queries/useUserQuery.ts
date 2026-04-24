import {api} from "../../axios";
import {useQuery} from "@tanstack/react-query";

export const useGetUsers = (
  params: {
    page: number,
    limit: number,
    sortField?: any,
    sortOrder?: string | null,
    [key: string]: any, // Allow additional properties with any type
  }
) => {
  const {isLoading, data, refetch} = useQuery({
    queryKey: ["get-users", params.page, params.limit, params.sortField, params.sortOrder],
    queryFn: async () => {
      // const {page, limit} = params;
      return (
        await api.get(`/users`, {
          params
        })
      ).data;
    },
  });
  const _data = data?.data?.data || data?.data || data || []
  const {pagination} = data?.data || data || {
    pagination: {
      page: 1,
      total: _data.length,
      limit: 10,
    }
  };
  // const total = pagination?.total || _data.length;
  return {
    data: _data,
    pagination,
    refetch,
    isLoading,
  };
};

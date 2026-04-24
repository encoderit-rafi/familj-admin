import {api} from "../../axios";
import {useQuery} from "@tanstack/react-query";

export const useGetRoles = (
  params: {
    page: number,
    limit: number,
    sortField: any,
    sortOrder: string | null,
    [key: string]: any, // Allow additional properties with any type
  }
) => {
  const {isLoading, data, refetch} = useQuery({
    queryKey: ["get-roles", params.page, params.limit, params.sortField, params.sortOrder],
    queryFn: async () => {
      return (
        await api.get(`/roles`, {params})
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
export const useGetRole = (slug: string | null = null,) => {
  const {isLoading, data, refetch} = useQuery({
    queryKey: ["get-role", slug,],
    queryFn: async () => {
      return (
        await api.get(`/roles/${slug}`)
      ).data;
    },
    enabled: !!slug && slug.trim().length > 0,
  });
  const _data = data?.data || data || {}
  // console.log(_data)
  return {
    data: _data,
    refetch,
    isLoading,
  };
};

export const useGetPermissions = () => {
  const {isLoading, data, refetch} = useQuery({
    queryKey: ["get-permissions"],
    queryFn: async () => {
      return (
        await api.get(`/permissions`)
      ).data;
    },
  });
  const _data = data?.data || data || []
  return {
    data: _data,
    refetch,
    isLoading,
  };
};

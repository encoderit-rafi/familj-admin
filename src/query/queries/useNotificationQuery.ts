import {api} from "../../axios";
import {useQuery} from "@tanstack/react-query";

export const useGetNotification = (
    params: {
        page: number,
        limit: number,
    } | null
) => {
    const {isLoading, data, refetch} = useQuery({
        queryKey: ["get-notifications", params?.page, params?.limit],
        queryFn: async () => {
            // const {page, limit} = params;
            return (await api.get(`/notifications`, {
                params
            })).data;
        },
    });

    const unreadCount = data?.unread_count || 0
    const _data = data?.data?.data || data?.data || data || []

    const pagination = data?.data?.pagination || data?.pagination || {
        page: 1,
        total: _data.length,
        limit: 11,
    };
    // const total = pagination?.total || _data.length;
    return {
        data: _data,
        unreadCount,
        pagination,
        refetch,
        isLoading,
    };
};

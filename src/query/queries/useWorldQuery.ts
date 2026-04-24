import {api} from "../../axios";
import {useQuery} from "@tanstack/react-query";

export const useGetCountries = () => {
    const {isLoading, data, refetch} = useQuery({
        queryKey: ["get-countries"],
        queryFn: async () => {
            return (await api.get(`/countries`)).data;
        },
    });
    return {
        data,
        refetch,
        isLoading,
    };
};
export const useGetStates = (countryId: string) => {
    const {isLoading, data, refetch} = useQuery({
        queryKey: ["get-states", countryId],
        queryFn: async () => {
            return (await api.get(`/states/${countryId}`)).data;
        },
        enabled: !!countryId, // ❗ Don't fetch until countryId is truthy
    });
    return {data, refetch, isLoading};
};

export const useGetCities = (stateId: string) => {
    const {isLoading, data, refetch} = useQuery({
        queryKey: ["get-cities", stateId],
        queryFn: async () => {
            return (await api.get(`/cities/${stateId}`)).data;
        },
        enabled: !!stateId, // ❗ Don't fetch until stateId is truthy
    });
    return {data, refetch, isLoading};
};
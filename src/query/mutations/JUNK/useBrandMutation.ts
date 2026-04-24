import {api} from "../../../axios.ts";
import {useMutation, type MutationKey} from "@tanstack/react-query";

const moduleName = "articles";

type articlePayload = {
    _id?: string,
    name: string,
    parent_id?: string[],
    description?: string,
    icon?: string,
    image?: string,
    featured: boolean,
    status: boolean,
}

export const useCreateBrandMutation = () => {
    const mutationKey: MutationKey = [`/create-${moduleName}`];
    return useMutation({
        mutationKey,
        mutationFn: (body: articlePayload) => api.post(`/${moduleName}`, body),
    });
};

export const useUpdateBrandMutation = () => {
    const mutationKey: MutationKey = [`/update-${moduleName}`];
    return useMutation({
        mutationKey,
        mutationFn: (body: articlePayload) => api.put(`/${moduleName}/${body._id}`, body),
    });
};

export const useDeleteBrandMutation = () => {
    const mutationKey: MutationKey = [`/delete-${moduleName}`];
    return useMutation({
        mutationKey,
        mutationFn: (body: { _id: string }) => api.delete(`/${moduleName}/${body?._id}`),
    });
};

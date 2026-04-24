import {api} from "../../../axios.ts";
import {useMutation, type MutationKey} from "@tanstack/react-query";

const moduleName = "categories";

type categoryPayload = {
    _id?: string,
    name: string,
    type: string,
    parent_id?: string[],
    description?: string,
    icon?: string,
    image?: string,
    featured: boolean,
    status: boolean,
}

export const useCreateCategoryMutation = () => {
    const mutationKey: MutationKey = [`/create-${moduleName}`];
    return useMutation({
        mutationKey,
        mutationFn: (body: categoryPayload) => api.post(`/${moduleName}`, body),
    });
};

export const useUpdateCategoryMutation = () => {
    const mutationKey: MutationKey = [`/update-${moduleName}`];
    return useMutation({
        mutationKey,
        mutationFn: (body: categoryPayload) => api.put(`/${moduleName}/${body._id}`, body),
    });
};

export const useDeleteCategoryMutation = () => {
    const mutationKey: MutationKey = [`/delete-${moduleName}`];
    return useMutation({
        mutationKey,
        mutationFn: (body: { _id: string }) => api.delete(`/${moduleName}/${body?._id}`),
    });
};
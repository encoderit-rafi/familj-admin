import { api } from "../../axios";
import { useMutation, type MutationKey } from "@tanstack/react-query";

type OPTIONS = {
  createUrl?: string;
  updateUrl?: string;
  deleteUrl?: string;
  method?: "POST" | "PUT" | "PATCH";
};

export function useCommonMutations<TPayload extends { _id?: string }>(
  moduleName: string,
  options: OPTIONS = {},
) {
  return {
    usePostMutation: () => {
      const mutationKey: MutationKey = [`/post-${moduleName}`];
      return useMutation({
        mutationKey,
        mutationFn: (body: TPayload) => {
          const URL = options.createUrl || `/${moduleName}`;
          if (options?.method === "PUT") {
            return api.put(URL, body);
          }
          if (options?.method === "PATCH") {
            return api.patch(URL, body);
          }
          return api.post(URL, body);
        },
      });
    },
    useCreateMutation: () => {
      const mutationKey: MutationKey = [`/create-${moduleName}`];
      return useMutation({
        mutationKey,
        mutationFn: (body: TPayload) => {
          const URL = options.createUrl || `/${moduleName}`;
          return api.post(URL, body);
        },
      });
    },
    useUpdateMutation: () => {
      const mutationKey: MutationKey = [`/update-${moduleName}`];
      return useMutation({
        mutationKey,
        mutationFn: (body: TPayload) => {
          // const {_id, ...payload} = body;
          const _id = body._id ?? "";
          const URL = replaceParams(
            options.updateUrl || `/${moduleName}/${_id}`,
            _id,
          );
          return api.patch(URL, body);
          // return api.patch(URL, payload)
        },
      });
    },
    useDeleteMutation: () => {
      const mutationKey: MutationKey = [`/delete-${moduleName}`];
      return useMutation({
        mutationKey,
        mutationFn: (body: { _id: string }) => {
          const URL = replaceParams(
            options.deleteUrl || `/${moduleName}/${body._id}`,
            body._id,
          );
          return api.delete(URL);
        },
      });
    },
    useBulkDeleteMutation: () => {
      const mutationKey: MutationKey = [`/bulk-delete-${moduleName}`];
      return useMutation({
        mutationKey,
        mutationFn: (body: string[]) => {
          const URL = options.deleteUrl || `/${moduleName}`;
          return api.delete(URL, { data: body });
        },
      });
    },
  };

  function replaceParams(
    urlString: string,
    params: string | number | undefined,
  ) {
    // Replace {id} placeholder if present
    let URL = urlString;
    if (URL && URL?.includes("{id}") && params) {
      URL = URL.replace("{id}", params.toString());
    }
    return URL;
  }
}

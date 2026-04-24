import { useState } from "react";
import { message } from "antd";
import { useCommonMutations } from "../query/mutations/useCommonMutations";

type OPTIONS = {
  createUrl?: string;
  updateUrl?: string;
  deleteUrl?: string;
};

type UseDeleteHandlerProps = {
  moduleName: string;
  options?: OPTIONS;
  refetch: () => void;
  successMessage?: string;
};

export function useDeleteHandler<T extends { _id: string }>({
  moduleName,
  options,
  refetch,
  successMessage = "Deleted successfully",
}: UseDeleteHandlerProps) {
  const [deleting, setDeleting] = useState<string>("");
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const { useDeleteMutation, useBulkDeleteMutation } = useCommonMutations<T>(
    moduleName,
    options,
  );
  const deleteMutation = useDeleteMutation();
  const bulkDeleteMutation = useBulkDeleteMutation();

  const onDelete = (id: string) => {
    setDeleting(id);
    deleteMutation.mutate(
      { _id: id },
      {
        onError(error: any) {
          const errorMessage = error?.response?.data?.message;
          message.error(errorMessage || "Something went wrong");
          setDeleting("");
        },
        onSuccess: async () => {
          setDeleting("");
          message.success(successMessage);
          refetch();
        },
      },
    );
  };

  const onBulkDelete = (ids: string[]) => {
    setBulkDeleting(true);
    bulkDeleteMutation.mutate(ids, {
      onError(error: any) {
        const errorMessage = error?.response?.data?.message;
        message.error(
          errorMessage || "Something went wrong during bulk delete",
        );
        setBulkDeleting(false);
      },
      onSuccess: async () => {
        setBulkDeleting(false);
        message.success("Selected items deleted successfully");
        refetch();
      },
    });
  };

  return { onDelete, deleting, onBulkDelete, bulkDeleting };
}

import {api} from "../../../axios.ts";
import {useMutation, type MutationKey} from "@tanstack/react-query";
import register from "../../../pages/auth/register.tsx";

type register = {
  name: string;
  email: string;
  mobile?: string;
  password: string;
  confirm_password: string;
  dob: string;
};

export const useCreateStoreMutation = () => {
  const mutationKey: MutationKey = ["/register"];
  return useMutation({
    mutationKey,
    mutationFn: (body: register) => api.post("/auth/register", {...body}),
  });
};

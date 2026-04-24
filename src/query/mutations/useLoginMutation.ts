import {api} from "../../axios";
import {useMutation, type MutationKey} from "@tanstack/react-query";

type loginData = {
    email: string,
    password: string
}
export const useLoginMutation = () => {
    const mutationKey: MutationKey = ["/login"];
    return useMutation({
        mutationKey,
        mutationFn: (body: loginData) => api.post("/auth/login", {...body}),
    });
};
import {api} from "../../axios";
import {useMutation, type MutationKey} from "@tanstack/react-query";

type verifyEmailData = {
    email: string,
    token: string
}
export const useVerifyEmailMutation = () => {
    const mutationKey: MutationKey = ["/verify-email"];
    return useMutation({
        mutationKey,
        mutationFn: (body: verifyEmailData) => api.post("/auth/verify-email", {...body}),
    });
};
import {Card, message, Spin} from "antd";
import {useEffect, useState, useCallback} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useVerifyEmailMutation} from "../../query/mutations/useVerifyEmailMutation.ts";
import mapErrors from "../../utils/mapErrors.ts";

const contentStyle: React.CSSProperties = {
    padding: 50,
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
};

const content = <div style={contentStyle}/>;

export default function VerifyEmail() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const verifyEmailMutation = useVerifyEmailMutation();

    const verifyEmail = useCallback(() => {
        const email = searchParams.get("email");
        const token = searchParams.get("token");
        const redirectTo = searchParams.get("redirectTo");

        if (!email || !token) {
            message.error("Invalid verification link.");
            setIsLoading(false);
            return;
        }

        verifyEmailMutation.mutate({email, token}, {
            onSuccess: () => {
                message.success("Email verified successfully.");
                setIsLoading(false);
                navigate('/' + (redirectTo || ''));
            },
            onError: (error) => {
                const {message: errorMessage} = mapErrors(error);
                message.error(errorMessage);
                setIsLoading(false);
            },
        });
    }, [searchParams, navigate, verifyEmailMutation]);

    useEffect(() => {
        verifyEmail();
    }, []);

    return (
        <Card className="!my-4 p-4 max-w-[400px] flex-1">
            <div className="text-center font-bold text-2xl text-gray-500">
                <div>Please wait...</div>
                <div>Verifying your email address.</div>
            </div>
            {isLoading &&
                <Spin tip="Loading" size="large">
                    {content}
                </Spin>
            }
        </Card>
    );
}

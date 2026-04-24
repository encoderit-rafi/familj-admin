import {useEffect, useState} from 'react';
import {useParams, useSearchParams, useNavigate} from 'react-router-dom';
import useCookie from "../../../hooks/useCookie.tsx";
import {useCurrentUser} from "../../../hooks/useCurrentUser.tsx";
import {api} from "../../../axios.ts";
import {useMessageApi} from "../../../components/providers/MessageProvider.tsx";
import {Card, Spin} from "antd";

// Success Component
export default function OAuthSuccess() {
    const currentUser = useCurrentUser();
    const [, setCookie] = useCookie('access_token');

    const {provider} = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);
    const messageApi = useMessageApi();

    const handleStorage = (token: string) => {
        localStorage.setItem('token', token);
    };

    const setApiHeaders = (token: string) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            setCookie(token);
            handleStorage(token);
            setApiHeaders(token);
            currentUser.refetch();
            messageApi.success('Login successful');

            // Simulate processing
            setTimeout(() => {
                setIsProcessing(false);

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            }, 1000);
        } else {
            setIsProcessing(false);
        }
    }, [searchParams, provider, navigate]);

    return (
        <>
            <Card className="!my-4 p-4 max-w-[500px] flex-1">
                <div className="text-center font-bold text-xl text-gray-500">
                    <div>Please wait...</div>
                    <div>Completing your {provider} authentication</div>
                </div>
                {isProcessing &&
                    <Spin tip="Loading" size="large" style={{position: "relative", margin: "20px auto"}}>
                        {''}
                    </Spin>
                }
            </Card>
        </>
    );
};
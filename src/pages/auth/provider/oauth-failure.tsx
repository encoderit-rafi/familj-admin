import {useParams, useSearchParams, useNavigate} from 'react-router-dom';
import {Button, Card} from "antd";

export default function OauthFailure() {
    const {provider} = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const errorType = searchParams.get('error') || 'auth_failed';
    const errorMessage = searchParams.get('message') || 'Authentication failed';

    const getErrorMessage = (error: any) => {
        const errors = {
            auth_failed: 'Authentication was not completed successfully',
            access_denied: 'You denied access to your account',
            server_error: 'A server error occurred during authentication',
            invalid_token: 'The authentication token is invalid',
        };
        // @ts-ignore
        return errors[error] || errorMessage;
    };

    return (
        <>
            <Card className="!my-4 p-4 max-w-[500px] flex-1">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Authentication Failed
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Failed to sign in with{' '}
                        <span className="font-semibold capitalize text-red-600">{provider}</span>
                    </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800">
                        {getErrorMessage(errorType)}
                    </p>
                </div>
                <Button
                    block
                    type="primary"
                    htmlType="button"
                    size="large"
                    onClick={() => navigate('/auth/login')}
                >
                    Try Again
                </Button>
            </Card>
        </>
    )
        ;
};

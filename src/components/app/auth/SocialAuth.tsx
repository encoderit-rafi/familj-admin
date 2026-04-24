import {Button, Space} from "antd";
import {FacebookFilled, GithubOutlined, GoogleOutlined} from "@ant-design/icons";

export const SocialAuth = () => {
    const handleSocialLogin = async (provider: string) => {
        try {
            // http://localhost:3000/api/auth/social/google/login
            window.location.href = `http://localhost:3000/api/v1/auth/social/${provider}/login`;
        } catch (error) {
            console.error('Login failed', error);
        }
    };
    const providers = [
        {name: 'google', icon: <GoogleOutlined/>, color: '#db4437'},
        {name: 'facebook', icon: <FacebookFilled/>, color: '#3b5998'},
        {name: 'github', icon: <GithubOutlined/>, color: '#333'},
    ];

    return (
        <div style={{maxWidth: '100%', margin: '0 auto', textAlign: 'center', padding: '20px'}}>
            <h2>Continue with:</h2>
            <Space direction="horizontal" style={{width: '100%'}}>
                {providers.map((provider) => (
                    <Button
                        key={provider.name}
                        type="primary"
                        icon={provider.icon}
                        size="large"
                        onClick={() => handleSocialLogin(provider.name)} // Pass the provider name
                        style={{marginBottom: '6px', backgroundColor: provider.color, borderColor: provider.color}}
                    >
                        {provider.name.charAt(0).toUpperCase() + provider.name.slice(1)}
                    </Button>
                ))}
            </Space>
        </div>
    )
}

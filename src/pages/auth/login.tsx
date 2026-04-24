import React, {useState} from 'react';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {Button, Checkbox, Form, Input, Flex, Typography, Card} from 'antd';
import {useCurrentUser} from "../../hooks/useCurrentUser.tsx";
import {useLoginMutation} from "../../query/mutations/useLoginMutation.ts";
import useCookie from "../../hooks/useCookie.tsx";
import {api} from "../../axios.ts";
import mapErrors from "../../utils/mapErrors.ts";
import {Link} from "react-router-dom";
import {useMessageApi} from "../../components/providers/MessageProvider.tsx";
import {Logo} from "../../components/ui/Logo.tsx";
// import {SocialAuth} from "../../components/app/auth/SocialAuth.tsx";

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const currentUser = useCurrentUser();
  const loginMutation = useLoginMutation();
  // const navigate = useNavigate();
  const [, setCookie] = useCookie('access_token');
  const [loading, setLoading] = useState<boolean>(false);
  const messageApi = useMessageApi();

  const handleStorage = (token: string) => {
    localStorage.setItem('token', token);
  };

  const setApiHeaders = (token: string) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };


  const onFinish = (values: any) => {
    setLoading(true);
    loginMutation.mutate(values, {
      onSuccess: (response) => {
        const data = response?.data?.data || response?.data || response || {};
        setCookie(data.access_token);
        handleStorage(data.access_token);
        setApiHeaders(data.access_token);
        currentUser.refetch();
        messageApi.success('Login successful');
      },
      onError: (error: any) => {
        console.error("Login error:", error); // Log it fully
        const {errors, message: errorMessage} = mapErrors(error);
        if (errors) form.setFields(errors);
        messageApi.error(errorMessage);
      },
      onSettled: () => setLoading(false),
    })
  };

  return (
    <Card className="!my-4 p-4 max-w-[460px] flex-1 fade-in-up">
      <Logo/>
      <Form
        form={form}
        name="login"
        layout="vertical"
        autoComplete="off"
        validateTrigger="onBlur"
        initialValues={{remember: true}}
        onFinish={onFinish}
      >
        <div className="text-center mb-4 flex items-end justify-center">
          <Typography.Title level={2}>Login</Typography.Title>
        </div>
        <Form.Item
          name="email"
          rules={[{required: true, message: 'Email is required!'}]}
        >
          <Input prefix={<UserOutlined/>} placeholder="Email" size="large" autoComplete="off"/>
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{required: true, message: 'Password is required!'}]}
        >
          <Input.Password prefix={<LockOutlined/>} type="password" placeholder="Password" size="large" autoComplete="off"/>
        </Form.Item>
        <Form.Item>
          <Flex justify="space-between" align="center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link to="/auth/forgot-password">Forgot password</Link>
          </Flex>
        </Form.Item>

        <Form.Item>
          <Button
            block
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
            size="large"
          >Log in</Button>
        </Form.Item>

        {/*<SocialAuth/>*/}

        {/*<Flex justify="center" align="center" gap="small">*/}
        {/*  <span>Don't have an account? </span>*/}
        {/*  <Link to="/auth/register">Register</Link>*/}
        {/*</Flex>*/}
      </Form>
    </Card>
  );
};

export default Login;

import React, {useState} from 'react';
import {UserOutlined} from '@ant-design/icons';
import {Button, Card, Flex, Form, Input, message, Typography} from 'antd';
import {Link} from "react-router-dom";
import {useCommonMutations} from "../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../utils/mapErrors.ts";
import {useModalApi} from "../../components/providers/ModalProvider.tsx";

const ForgetPassword: React.FC = () => {
  const modalApi = useModalApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const {usePostMutation} = useCommonMutations('auth/forgot-password');
  const postMutation = usePostMutation();

  const onFinish = (values: any) => {
    setLoading(true);

    postMutation.mutate(values, {
      onSuccess: (response) => {
        const data = response?.data?.data || response?.data || response || {};
        modalApi.success({
          title: 'Password Reset Link Sent',
          content: data.message || 'Please check your email for the password reset link.',
          centered: true,
        });
      },
      onError: (error: any) => {
        const {errors, message: errorMessage} = mapErrors(error);
        if (errors) form.setFields(errors);
        message.error(errorMessage || `Sending Reset Link Failed. Please try again.`);
      },
      onSettled: () => setLoading(false),
    });
  };

  return (
    <Card className="!my-4 p-4 max-w-[420px] flex-1">
      <Form
        form={form}
        name="forget-password"
        layout="vertical"
        autoComplete="off"
        validateTrigger="onBlur"
        initialValues={{remember: true}}
        onFinish={onFinish}
      >
        <div className="text-center mb-4 flex flex-col items-center justify-center">
          <Typography.Title level={2}>Forget Password</Typography.Title>
          <div>
            <Typography.Text>
              Please enter your email address to receive a password reset link.
            </Typography.Text>
          </div>
        </div>
        <Form.Item
          name="email"
          rules={[{required: true, message: 'Email is required!'}]}
        >
          <Input type="email" prefix={<UserOutlined/>} placeholder="Email Address" size="large" autoComplete="off"/>
        </Form.Item>

        <Form.Item>
          <Button
            block
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
            size="large"
          >Send Reset Link</Button>
        </Form.Item>

        <Flex justify="center" align="center" gap="small">
          <span>Go back to <Link to="/auth/login">Login</Link>! </span>
        </Flex>
      </Form>
    </Card>
  );
};

export default ForgetPassword;

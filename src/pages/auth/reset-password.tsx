import React, {useState} from 'react';
import {Button, Form, Input, Flex, Typography, Card, message} from 'antd';
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {useCommonMutations} from "../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../utils/mapErrors.ts";
import {useMessageApi} from "../../components/providers/MessageProvider.tsx";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const messageApi = useMessageApi();


  const {usePostMutation} = useCommonMutations('auth/reset-password');
  const postMutation = usePostMutation();

  const onFinish = (values: any) => {
    setLoading(true);
    postMutation.mutate({
      ...values,
      token: searchParams.get('token')
    }, {
      onSuccess: (response) => {
        const data = response?.data?.data || response?.data || response || {};
        messageApi.success(data.message || 'Password Reset Successful. Please login with your new password.');
        navigate('/auth/login');
      },
      onError: (error: any) => {
        const {errors, message: errorMessage} = mapErrors(error);
        if (errors) form.setFields(errors);
        message.error(errorMessage || `Password Reset Failed. Please try again.`);
      },
      onSettled: () => setLoading(false),
    });
  };


  return (
    <Card className="!my-4 p-4 max-w-[420px] flex-1">
      <Form
        form={form}
        name="reset-password"
        layout="vertical"
        autoComplete="off"
        validateTrigger="onBlur"
        initialValues={{remember: true}}
        onFinish={onFinish}
      >
        <div className="text-center mb-4 flex flex-col items-center justify-center">
          <Typography.Title level={2}>Reset Password</Typography.Title>
          <div>
            <Typography.Text>
              Please enter your new password before the password reset link expires.
            </Typography.Text>
          </div>
        </div>
        <Form.Item
          className="flex-1/2"
          label="New Password"
          name="password"
          rules={[{required: true, message: 'Password is required!'}]}
        >
          <Input.Password autoComplete="off" size="large"/>
        </Form.Item>
        <Form.Item
          className="flex-1/2"
          label="Confirm Password"
          name="confirm_password"
          dependencies={['password']}
          rules={[
            {required: true, message: 'Confirm Password is required!'},
            ({getFieldValue}) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password autoComplete="off" size="large"/>
        </Form.Item>

        <Form.Item>
          <Button
            block
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
            size="large"
          >Reset Password</Button>
        </Form.Item>

        <Flex justify="center" align="center" gap="small">
          <span>Go back to <Link to="/auth/login">Login</Link>! </span>
        </Flex>
      </Form>
    </Card>
  );
};

export default ResetPassword;

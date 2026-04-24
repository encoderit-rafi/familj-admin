import React, {useState} from 'react';
import {
  Button,
  Form,
  Input,
  Flex,
  Typography,
  Checkbox, Card,
  DatePicker
} from 'antd';
import {mapErrorsInObject} from '../../utils/mapErrors.ts';
import {Link, useNavigate} from 'react-router-dom';
import {useCreateStoreMutation} from '../../query/mutations/JUNK/useCreateStoreMutation.ts';
import createStoreFieldKeyMap from "../../utils/keyMaps/createStoreForm.ts";
import {useMessageApi} from "../../components/providers/MessageProvider.tsx";
import {useModalApi} from "../../components/providers/ModalProvider.tsx";
import {Logo} from "../../components/ui/Logo.tsx";
import dayjs from "dayjs";

const Register: React.FC = () => {
  const navigate = useNavigate();
  // const currentUser = useCurrentUser();
  const createStoreMutation = useCreateStoreMutation();
  // const [, setCookie] = useCookie(TOKEN_KEY);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const messageApi = useMessageApi();
  const modalApi = useModalApi();
  const onSubmit = (values: any) => {
    setLoading(true);
    const payload = {
      name: `${values.first_name} ${values.last_name}`,
      email: values.email,
      // mobile: values.mobile,
      password: values.password,
      confirm_password: values.confirm_password,
      dob: values.dob,
    }

    // console.log(payload)
    createStoreMutation.mutate(payload, {
      onSuccess: () => {
        //const data = response?.data?.data || response?.data || response || {};
        //console.log(data)
        form.resetFields();
        messageApi.success('Registration successful!');
        modalApi.success({
          title: 'Registration successful!',
          content: 'Please check your email for verification link. If you do not receive an email, please check your spam folder. Verification link will expire in 2 hours.',
          centered: true,
          onOk: () => {
            navigate('/auth/login'); // ✅ Proper programmatic navigation
          },
        });
      },
      onError: (error: any) => {
        const {errors, message: errorMessage} = mapErrorsInObject(error, createStoreFieldKeyMap);
        if (errors) form.setFields(errors);
        messageApi?.error(errorMessage);
      },
      onSettled: () => setLoading(false),
    });
  };

  return (
    <Card className="!my-4 p-4 max-w-[460px] flex-1 fade-in-up">
      <Logo/>
      <Form
        form={form}
        name="register"
        layout="vertical"
        autoComplete="off"
        validateTrigger="onBlur"
        initialValues={{remember: true}}
        onFinish={onSubmit}
      >
        <div className="text-center mb-4 flex items-end justify-center">
          <Typography.Title level={2}>Register</Typography.Title>
        </div>

        <Flex gap="small">
          <Form.Item
            name="first_name"
            rules={[{required: true, message: 'First Name is required!'}]}
          >
            <Input placeholder="First Name" size="large" autoComplete="off"/>
          </Form.Item>
          <Form.Item
            name="last_name"
            rules={[{required: true, message: 'Last Name is required!'}]}
          >
            <Input placeholder="Last Name" size="large" autoComplete="off"/>
          </Form.Item>
        </Flex>

        <Form.Item
          label="Email:"
          name="email"
          rules={[
            {required: true, message: 'Email is required!'},
            {type: 'email', message: 'Please enter a valid email!'}
          ]}
        >
          <Input type="email" placeholder="johndoe@gmail.com" size="large" autoComplete="off"/>
        </Form.Item>

        <Form.Item
          name="dob"
          initialValue={dayjs('2000/01/01',)}
          rules={[{required: true, message: 'DOB is required!'}]}
        >
          <DatePicker size="large" style={{width: '100%'}}/>
        </Form.Item>

        <Flex gap="small">
          <Form.Item
            className="flex-1/2"
            label="Password" name="password"
            rules={[{required: true}, {min: 6}, {max: 60},]}
          >
            <Input.Password size="large" autoComplete="off"/>
          </Form.Item>
          <Form.Item
            className="flex-1/2"
            label="Confirm Password" name="confirm_password"
            dependencies={['password']}
            rules={[
              {required: true},
              ({getFieldValue}) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password size="large" autoComplete="off"/>
          </Form.Item>
        </Flex>

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
          >Register</Button>
        </Form.Item>

        <Flex justify="center" align="center" gap="small">
          <span>Already have an account? </span>
          <Link to="/auth/login">Login</Link>
        </Flex>
      </Form>
    </Card>
  );
};

export default Register;

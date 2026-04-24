import {useState} from "react";
import {Button, Form, Input, message, Typography} from "antd";

import {useCurrentUser} from "../../../hooks/useCurrentUser.tsx";
import {useCommonMutations} from "../../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../../utils/mapErrors.ts";
import {useMessageApi} from "../../../components/providers/MessageProvider.tsx";
import {useNavigate} from "react-router-dom";


export default function Profile() {
  const currentUser = useCurrentUser();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const messageApi = useMessageApi();

  const {useUpdateMutation} = useCommonMutations('user/profile/change-password');
  const postMutation = useUpdateMutation();

  const onsubmit = (values: any) => {
    console.log(values)
    setLoading(true);
    const payload = {
      ...values
    }
    delete payload.confirmPassword;

    postMutation.mutate(payload, {
      onSuccess: (response) => {
        currentUser.refetch()
        const data = response?.data?.data || response?.data || response || {};
        messageApi.success(data.message || 'Change Password updated successfully.').then(() => {
        });
        form.resetFields();
        navigate('/profile')
      },
      onError: (error: any) => {
        const {errors, message: errorMessage} = mapErrors(error);
        if (errors) form.setFields(errors);
        message.error(errorMessage || `Change Password update failed. Please try again.`).then(() => {
        });
      },
      onSettled: () => setLoading(false),
    });
  }

  return (
    <div>
      <Typography.Title level={2}>Change Password</Typography.Title>
      <div className="flex items-center justify-between mb-6 md:float-end">

      </div>
      <Form
        name="changePasswordForm"
        layout="vertical"
        autoComplete="off"
        validateTrigger="onBlur"
        form={form}
        onFinish={onsubmit}
      >
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{required: true, message: 'Current Password Field is required!'}]}
          style={{flexGrow: 1}}
        >
          <Input.Password placeholder="Current Password" size="large"/>
        </Form.Item>
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            {required: true, message: 'New Password Field is required!'},
            {min: 8, message: 'Password must be at least 8 characters long!'}
          ]}
          style={{flexGrow: 1}}
        >
          <Input.Password placeholder="New Password" size="large"/>
        </Form.Item>
        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            {required: true, message: 'Please confirm your new password!'},
            ({getFieldValue}) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The passwords do not match!'));
              },
            }),
          ]}
          style={{flexGrow: 1}}
        >
          <Input.Password placeholder="Confirm New Password" size="large"/>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>Submit</Button>
        </Form.Item>
      </Form>
    </div>
  );
}

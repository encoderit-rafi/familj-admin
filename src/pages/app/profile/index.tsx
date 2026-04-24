import ImageUploader from "../../../components/app/ImageUploader.tsx";
import {useEffect, useState} from "react";
import {Button, Col, DatePicker, Form, Input, message, Radio, Row, Typography, type UploadFile} from "antd";
import dayjs from "dayjs";
import type {CheckboxGroupProps} from "antd/es/checkbox";
import {useCurrentUser} from "../../../hooks/useCurrentUser.tsx";
import {useCommonMutations} from "../../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../../utils/mapErrors.ts";
import {useMessageApi} from "../../../components/providers/MessageProvider.tsx";
import {imageLinkGenerator} from "../../../helpers/imageLinkGenerator.ts";
import {useNavigate} from "react-router-dom";

export default function Profile() {
  const currentUser = useCurrentUser();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const messageApi = useMessageApi();

  const genderOptions: CheckboxGroupProps<string>['options'] = [
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
    {label: 'Others', value: 'others'},
  ];

  useEffect(() => {
    form.setFieldsValue({
      name: currentUser.name,
      mobile: currentUser.mobile,
      dob: dayjs(currentUser.dob),
      gender: currentUser.gender,
    });
    if (currentUser.avatar) setFileList([{uid: '-1', name: 'image.png', status: 'done', url: imageLinkGenerator(currentUser.avatar, null) ?? ''}]);
  }, [currentUser]);

  const {useUpdateMutation} = useCommonMutations('user/profile');
  const postMutation = useUpdateMutation();

  const onsubmit = (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
      // dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null,
    }
    if (fileList[0]?.response?.file) {
      payload.avatar = fileList[0]?.response?.file;
    }
    postMutation.mutate(payload, {
      onSuccess: (response) => {
        currentUser.refetch()
        const data = response?.data?.data || response?.data || response || {};
        messageApi.success(data.message || 'Profile updated successfully.').then(() => {
        });
      },
      onError: (error: any) => {
        const {errors, message: errorMessage} = mapErrors(error);
        if (errors) form.setFields(errors);
        message.error(errorMessage || `Profile update failed. Please try again.`).then(() => {
        });
      },
      onSettled: () => setLoading(false),
    });
  }

  return (
    <div>
      <Typography.Title level={2}>Profile Settings</Typography.Title>
      <div className="flex items-center justify-between mb-6 md:float-end">
        <Button onClick={() => navigate('/profile/change-password')}>Change Password</Button>
      </div>
      <Form
        name="profileForm"
        layout="vertical"
        autoComplete="off"
        validateTrigger="onBlur"
        form={form}
        onFinish={onsubmit}
        encType={'multipart/form-data'}
      >
        <Form.Item>
          <ImageUploader
            label="Profile Picture"
            multiple={false}
            maxCount={1}
            allowedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/svg', 'image/webp']}
            maxSizeMB={2}
            fileList={fileList}
            setFileList={setFileList}
          />
        </Form.Item>

        <Row gutter={[24, 24]} className="mb-4">
          <Col span={12}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{required: true, message: 'Name Field is required!'}]}
              style={{flexGrow: 1}}
            >
              <Input placeholder="name" size="large"/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Mobile:"
              name="mobile"
              rules={[
                {required: true, message: 'Mobile is required!'},
              ]}
            >
              <Input type="text" size="large" autoComplete="off"/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="DOB"
              name="dob"
              initialValue={dayjs('2000/01/01',)}
              rules={[{required: true, message: 'DOB is required!'}]}
            >
              <DatePicker size="large" style={{width: '100%'}}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Gender"
              style={{flexGrow: 1}}
              name="gender"
              rules={[{required: true, message: 'Gender is required!'}]}
            >
              <Radio.Group
                options={genderOptions}
                optionType="button"
                buttonStyle="solid"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>Submit</Button>
        </Form.Item>
      </Form>
    </div>
  );
}

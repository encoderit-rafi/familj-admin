import {useEffect, useState} from "react";
import {PlusOutlined} from '@ant-design/icons';
import {Button, Modal, Form, Input, Switch, Radio, Flex, message, Row, Col} from "antd";
import type {CheckboxGroupProps} from "antd/es/checkbox";
import {useCommonMutations} from "../../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../../utils/mapErrors.ts";
import {useMessageApi} from "../../providers/MessageProvider.tsx";

type tagPayload = {
  _id?: string,
  name: string,
  featured: boolean,
  status: string,
}

const statusOptions: CheckboxGroupProps<string>['options'] = [
  {label: 'Active', value: 'active'},
  {label: 'Inactive', value: 'inactive'},
  {label: 'Reviewing', value: 'review', disabled: true},
];

export default function TagForm({data = {}, onClose, refetch}: { data?: any, onClose?: () => void, refetch?: () => void }) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'Create' | 'Edit'>('Create');
  const messageApi = useMessageApi();

  useEffect(() => {
    if (Object.keys(data).length) {
      setMode('Edit');
      form.setFieldsValue(data);

      setOpen(true);
    } else {
      setMode('Create');
    }
  }, [data]);

  useEffect(() => {
    if (!open) {
      resetForm();
      onClose?.();
      setMode('Create');
    }
  }, [open])

  const {useCreateMutation, useUpdateMutation} = useCommonMutations<tagPayload>('tags');
  const createMutation = useCreateMutation();
  const updateMutation = useUpdateMutation();

  const onsubmit = (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
    };
    if (data._id) payload._id = data._id;

    const mutation = mode === 'Edit' ? updateMutation : createMutation;

    mutation.mutate(payload, {
      onSuccess: () => {
        messageApi.success('Tag saved successfully');
        setOpen(false);
        refetch?.()
      },
      onError: (error: any) => {
        const {errors, message: errorMessage} = mapErrors(error);
        if (errors) form.setFields(errors);
        message.error(errorMessage || `Tag ${mode} Failed. Please try again.`);
      },
      onSettled: () => setLoading(false),
    });
  };

  const resetForm = () => {
    form?.resetFields();
  };

  return (
    <>
      <Button
        color="primary"
        variant="outlined"
        size="large"
        icon={<PlusOutlined/>}
        onClick={() => setOpen(true)}
      >
        Create
      </Button>

      <Modal
        title={<p>{mode} Tag</p>}
        footer={null}
        open={open}
        confirmLoading={loading}
        onCancel={() => {
          setOpen(false)
          onClose?.()
        }}
        width={600}
      >
        <Form
          name="tag"
          layout="vertical"
          autoComplete="off"
          validateTrigger="onBlur"
          form={form}
          style={{maxWidth: 640}}
          onFinish={onsubmit}
          encType={'multipart/form-data'}
        >
          <Flex gap="middle">
            <Form.Item
              label="Name:"
              name="name"
              rules={[{required: true, message: 'Tag Name Field is required!'}]}
              style={{flexGrow: 1}}
            >
              <Input placeholder="name" size="large"/>
            </Form.Item>
          </Flex>

          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="Status:"
                name="status"
                initialValue="active"
                style={{flexGrow: 1}}
              >
                <Radio.Group
                  options={statusOptions}
                  optionType="button"
                  buttonStyle="solid"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="Featured:"
                name="featured"
                valuePropName="checked"
                initialValue={true}
                style={{flexGrow: 1}}
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No"/>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Submit</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

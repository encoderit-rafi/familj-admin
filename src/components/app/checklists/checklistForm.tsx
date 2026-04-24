import {useEffect, useState} from "react";
import {PlusOutlined, MinusCircleOutlined} from '@ant-design/icons';
import {Button, Modal, Form, Input, Switch, Flex, message, Space, Divider, Select} from "antd";
import {useCommonMutations} from "../../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../../utils/mapErrors.ts";
import {useMessageApi} from "../../providers/MessageProvider.tsx";

type ChecklistItem = {
  title: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
}

type ChecklistPayload = {
  _id?: string,
  title: string,
  description?: string,
  pregnancy_weeks: number[],
  items: ChecklistItem[],
  // category?: 'general' | 'medical' | 'nutrition' | 'exercise' | 'preparation',
  is_active?: boolean,
}

export default function ChecklistForm({data = {}, onClose, refetch}: { data?: any, onClose?: () => void, refetch?: () => void }) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'Create' | 'Edit'>('Create');
  const messageApi = useMessageApi();

  const priorityOptions = [
    {label: 'High', value: 'high'},
    {label: 'Medium', value: 'medium'},
    {label: 'Low', value: 'low'},
  ];

  // const categoryOptions = [
  //   {label: 'General', value: 'general'},
  //   {label: 'Medical', value: 'medical'},
  //   {label: 'Nutrition', value: 'nutrition'},
  //   {label: 'Exercise', value: 'exercise'},
  //   {label: 'Preparation', value: 'preparation'},
  // ];

  useEffect(() => {
    if (Object.keys(data).length) {
      setMode('Edit');

      form.setFieldsValue({
        title: data.title,
        description: data.description,
        pregnancy_weeks: data.pregnancy_weeks,
        items: data.items?.length
            ? data.items.map((item: any) => ({
              _id: item._id,
              title: item.title || '',
              description: item.description || '',
              priority: item.priority || 'medium',
            }))
            : [{ title: '', description: '', priority: 'medium' }],
        category: data.category,
        is_active: data.is_active ?? true,
      });

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

  const {useCreateMutation, useUpdateMutation} = useCommonMutations<ChecklistPayload>('checklist-templates');
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
        messageApi.success('Checklist Template saved successfully');
        setOpen(false);
        refetch?.()
      },
      onError: (error: any) => {
        const {errors, message: errorMessage} = mapErrors(error);
        if (errors) form.setFields(errors);
        message.error(errorMessage || `Checklist Template ${mode} Failed. Please try again.`);
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
            title={<p>{mode} Checklist Template</p>}
            footer={null}
            open={open}
            width={800}
            confirmLoading={loading}
            onCancel={() => {
              setOpen(false)
              onClose?.()
            }}
        >
          <Form
              name="checklists"
              layout="vertical"
              autoComplete="off"
              validateTrigger="onBlur"
              form={form}
              onFinish={onsubmit}
              initialValues={{
                is_active: true,
                items: [{title: '', description: '', priority: 'medium'}]
              }}
          >
            <Form.Item
                label="Title"
                name="title"
                rules={[{required: true, message: 'Title is required!'}]}
            >
              <Input
                  placeholder="Enter checklist title"
                  size="large"
              />
            </Form.Item>

            <Form.Item
                label="Description"
                name="description"
            >
              <Input.TextArea
                  placeholder="Enter checklist description (optional)"
                  rows={3}
                  size="large"
                  maxLength={150}
              />
            </Form.Item>

            {/*<Row gutter={16}>*/}
            {/*  <Col span={12}>*/}
            {/*    <Form.Item*/}
            {/*        label="Category"*/}
            {/*        name="category"*/}
            {/*    >*/}
            {/*      <Select*/}
            {/*          placeholder="Select a category (optional)"*/}
            {/*          options={categoryOptions}*/}
            {/*          size="large"*/}
            {/*          allowClear*/}
            {/*      />*/}
            {/*    </Form.Item>*/}
            {/*  </Col>*/}
            {/*</Row>*/}

            <Divider orientation="left" className="mt-4">Checklist Items</Divider>

            <Form.List
                name="items"
                rules={[
                  {
                    validator: async (_, items) => {
                      if (!items || items.length < 1) {
                        return Promise.reject(new Error('At least one item is required'));
                      }
                    },
                  },
                ]}
            >
              {(fields, {add, remove}, {errors}) => (
                  <>
                    {fields.map((field, index) => (
                        <Space key={field.key} style={{display: 'flex', marginBottom: 8}} align="baseline">
                          <Form.Item
                              {...field}
                              label={`Item ${index + 1} Title`}
                              name={[field.name, 'title']}
                              rules={[{required: true, message: 'Item title is required'}]}
                              style={{marginBottom: 8, width: 200}}
                          >
                            <Input placeholder="Item title" size="large"/>
                          </Form.Item>

                          <Form.Item
                              {...field}
                              label="Description"
                              name={[field.name, 'description']}
                              style={{marginBottom: 8, width: 200}}
                          >
                            <Input placeholder="Description (optional)" size="large"/>
                          </Form.Item>

                          <Form.Item
                              {...field}
                              label="Priority"
                              name={[field.name, 'priority']}
                              style={{marginBottom: 8, width: 120}}
                          >
                            <Select
                                placeholder="Priority"
                                options={priorityOptions}
                                size="large"
                            />
                          </Form.Item>

                          {fields.length > 1 && (
                              <MinusCircleOutlined
                                  style={{marginTop: 30, fontSize: '16px', color: '#ec0606'}}
                                  onClick={() => remove(field.name)}
                              />
                          )}
                        </Space>
                    ))}
                    <Form.Item>
                      <Button
                          type="dashed"
                          onClick={() => add({title: '', description: ''})}
                          icon={<PlusOutlined/>}
                          block
                      >
                        Add Item
                      </Button>
                      <Form.ErrorList errors={errors}/>
                    </Form.Item>
                  </>
              )}
            </Form.List>

            <Form.Item
                label="Status"
                name="is_active"
                valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" size="default"/>
            </Form.Item>

            <Form.Item>
              <Flex gap="small">
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit
                </Button>
                <Button onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        </Modal>
      </>
  );
}

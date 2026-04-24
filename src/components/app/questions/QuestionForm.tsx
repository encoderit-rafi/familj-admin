import { useEffect, useState } from "react";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Flex,
  message,
  Row,
  Col,
  Space,
} from "antd";
import { useCommonMutations } from "../../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../../utils/mapErrors.ts";
import { useMessageApi } from "../../providers/MessageProvider.tsx";
import PregnancyWeekSelect from "../PregnancyWeekSelect.tsx";

type AnswerOption = {
  _id?: string;
  content?: string;
};

type QuestionPayload = {
  _id?: string;
  title: string;
  content: string;
  pregnancy_weeks: number[];
  answer_options?: AnswerOption[];
  is_active: boolean;
};

export default function QuestionForm({
  data = {},
  onClose,
  refetch,
  omittedWeeks,
}: {
  data?: any;
  onClose?: () => void;
  refetch?: () => void;
  omittedWeeks: number[];
}) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"Create" | "Edit">("Create");
  const messageApi = useMessageApi();

  useEffect(() => {
    if (Object.keys(data).length) {
      // remove vote_count from answer_options if exists
      if (data.answer_options) {
        data.answer_options = data.answer_options.map((option: any) => {
          const { _id, content } = option;
          return { _id, content };
        });
      }

      setMode("Edit");
      form.setFieldsValue({
        title: data.title,
        content: data.content,
        pregnancy_weeks: data.pregnancy_weeks,
        answer_options: data.answer_options || [],
        is_active: data.is_active ?? true,
      });
      setOpen(true);
    } else {
      setMode("Create");
    }
  }, [data]);

  useEffect(() => {
    if (!open) {
      resetForm();
      onClose?.();
      setMode("Create");
    }
  }, [open]);

  const { useCreateMutation, useUpdateMutation } =
    useCommonMutations<QuestionPayload>("questions");
  const createMutation = useCreateMutation();
  const updateMutation = useUpdateMutation();

  const onsubmit = (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
      pregnancy_weeks: Array.isArray(values?.pregnancy_weeks)
        ? values.pregnancy_weeks
        : values?.pregnancy_weeks !== undefined
        ? [values.pregnancy_weeks]
        : [],
    };
    if (data._id) payload._id = data._id;

    const mutation = mode === "Edit" ? updateMutation : createMutation;

    mutation.mutate(payload, {
      onSuccess: () => {
        messageApi.success("Question saved successfully");
        setOpen(false);
        refetch?.();
      },
      onError: (error: any) => {
        const { errors, message: errorMessage } = mapErrors(error);
        if (errors) form.setFields(errors);
        message.error(
          errorMessage || `Question ${mode} Failed. Please try again.`
        );
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
        icon={<PlusOutlined />}
        onClick={() => setOpen(true)}
      >
        Create
      </Button>

      <Modal
        title={<p>{mode} Question</p>}
        footer={null}
        open={open}
        width={800}
        confirmLoading={loading}
        onCancel={() => {
          resetForm();
          setOpen(false);
          onClose?.();
        }}
      >
        <Form
          name="Questions"
          layout="vertical"
          autoComplete="off"
          validateTrigger="onBlur"
          form={form}
          onFinish={onsubmit}
          initialValues={{
            is_active: true,
            answer_options: [{ content: "" }],
          }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required!" }]}
          >
            <Input placeholder="Enter Question" size="large" />
          </Form.Item>

          <Form.Item
            label="Content"
            name="content"
            rules={[{ required: true, message: "Content is required!" }]}
          >
            <Input.TextArea
              placeholder="Enter Question content"
              rows={3}
              size="large"
              maxLength={150}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Pregnancy Weeks"
                name="pregnancy_weeks"
                rules={[
                  {
                    required: true,
                    message: "Please select at least one pregnancy week!",
                  },
                  {
                    validator: (_, value) => {
                      if (value && value.length > 0) {
                        const invalidWeeks = value.filter(
                          (week: number) => week < 1 || week > 42
                        );
                        if (invalidWeeks.length > 0) {
                          return Promise.reject(
                            "Weeks must be between 1 and 42"
                          );
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <PregnancyWeekSelect
                  omittedWeeks={
                    mode === "Edit" && data?.pregnancy_weeks
                      ? omittedWeeks.filter(
                          (w) => !data.pregnancy_weeks.includes(w)
                        )
                      : omittedWeeks
                  }
                  size="large"
                />
                {/*<Select*/}
                {/*  mode="multiple"*/}
                {/*  placeholder="Select applicable pregnancy weeks"*/}
                {/*  options={weekOptions}*/}
                {/*  size="large"*/}
                {/*  maxTagCount="responsive"*/}
                {/*  allowClear*/}
                {/*/>*/}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Answer Options">
            <Form.List
              name="answer_options"
              rules={[
                {
                  validator: async (_, items) => {
                    if (!items || items.length < 1) {
                      return Promise.reject(
                        new Error("At least one answer option is required")
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                      className="w-full"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "content"]}
                        rules={[
                          {
                            required: true,
                            message: "Answer option content is required",
                          },
                        ]}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Input placeholder="Enter answer option" size="large" />
                      </Form.Item>

                      {fields.length > 1 && (
                        <MinusCircleOutlined
                          style={{
                            marginTop: 30,
                            fontSize: "16px",
                            color: "#ec0606",
                          }}
                          onClick={() => remove(name)}
                        />
                      )}
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      size="large"
                    >
                      Add Answer Option
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="is_active"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  size="default"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Flex gap="small">
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

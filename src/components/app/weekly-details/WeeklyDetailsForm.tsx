import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal, Form, Flex, message, Input } from "antd";
import { useCommonMutations } from "../../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../../utils/mapErrors.ts";
import { useMessageApi } from "../../providers/MessageProvider.tsx";
import PregnancyWeekSelect from "../PregnancyWeekSelect.tsx";
// import TextEditorCustomButtons from "../TextEditorCustomButtons.tsx";
// import TextEditorCustomGrid from "../TextEditorCustomGrid.tsx";
import { ReactTextEditor } from "../ReactTextEditor.tsx";

type weeklyDetailsPayload = {
  _id?: string;
  title: string;
  week: number;
  description: string;
};

export default function WeeklyDetailsForm({
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
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"Create" | "Edit">("Create");
  const messageApi = useMessageApi();

  useEffect(() => {
    if (Object.keys(data).length) {
      setMode("Edit");
      form.setFieldsValue(data);

      setOpen(true);

      setDescription(data.description || "");
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
    useCommonMutations<weeklyDetailsPayload>("weekly-details");
  const createMutation = useCreateMutation();
  const updateMutation = useUpdateMutation();

  const onsubmit = (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
    };
    if (data._id) payload._id = data._id;

    const mutation = mode === "Edit" ? updateMutation : createMutation;

    mutation.mutate(payload, {
      onSuccess: () => {
        messageApi.success("Weekly details saved successfully");
        setOpen(false);
        refetch?.();
      },
      onError: (error: any) => {
        const { errors, message: errorMessage } = mapErrors(error);
        if (errors) form.setFields(errors);
        message.error(
          errorMessage || `Weekly details ${mode} Failed. Please try again.`
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
        title={<p>{mode} Weekly details</p>}
        footer={null}
        open={open}
        confirmLoading={loading}
        onCancel={() => {
          setOpen(false);
          onClose?.();
        }}
        width={800}
      >
        <Form
          name="weeklydetails"
          layout="vertical"
          autoComplete="off"
          validateTrigger="onBlur"
          form={form}
          style={{ maxWidth: 1000 }}
          onFinish={onsubmit}
          encType={"multipart/form-data"}
        >
          <Flex gap="middle">
            <Form.Item
              label="Title:"
              name="title"
              rules={[{ required: true, message: "Title field is required!" }]}
              style={{ flexGrow: 1 }}
            >
              <Input placeholder="Enter title" size="large" />
            </Form.Item>
            <Form.Item
              label="Week:"
              name="week"
              rules={[{ required: true, message: "Week Field is required!" }]}
              style={{ flexGrow: 1 }}
            >
              <PregnancyWeekSelect
                omittedWeeks={
                  mode === "Edit" && data?.week
                    ? omittedWeeks.filter((w) => w !== data.week)
                    : omittedWeeks
                }
                size="large"
              />
            </Form.Item>
          </Flex>

          {/*<Form.Item*/}
          {/*  label="Description:"*/}
          {/*  name="description"*/}
          {/*  rules={[{required: true, message: 'Description field is required!'}]}*/}
          {/*  style={{flexGrow: 1}}*/}
          {/*>*/}
          {/*  <Input.TextArea*/}
          {/*    placeholder="description"*/}
          {/*    showCount*/}
          {/*    maxLength={300}*/}
          {/*    rows={3}*/}
          {/*    size="large"*/}
          {/*  />*/}
          {/*</Form.Item>*/}

          <Form.Item
            label="Description:"
            name="description"
            rules={[
              { required: true, message: "Description field is required!" },
            ]}
            style={{ flexGrow: 1 }}
          >
            <ReactTextEditor
              content={description}
              setContent={(rawContent) =>
                form.setFieldsValue({ description: rawContent })
              }
            />
            {/* <TextEditorCustomGrid
              initialContent={description}
              handleChange={(rawContent) =>
                form.setFieldsValue({ description: rawContent })
              }
            /> */}
            {/* <TextEditorCustomButtons
              initialContent={description}
              handleChange={(rawContent) =>
                form.setFieldsValue({description: rawContent})
              }
            /> */}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

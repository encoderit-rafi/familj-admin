import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal, Form, Input, message } from "antd";
import type { UploadFile } from "antd";
import ImageUploader from "../ImageUploader.tsx";
import { useCommonMutations } from "../../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../../utils/mapErrors.ts";
import { useMessageApi } from "../../providers/MessageProvider.tsx";
import { imageLinkGenerator } from "../../../helpers/imageLinkGenerator.ts";

type TinderNameCategoryPayload = {
  _id?: string;
  name: string;
  description?: string;
  image?: string;
};

export default function TinderNameCategoryForm({
  data = {},
  onClose,
  refetch,
}: {
  data?: any;
  onClose?: () => void;
  refetch?: () => void;
}) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [mode, setMode] = useState<"Create" | "Edit">("Create");
  const messageApi = useMessageApi();

  useEffect(() => {
    if (Object.keys(data).length) {
      setMode("Edit");
      form.setFieldsValue(data);
      if (data.image) {
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: imageLinkGenerator(data.image, null) ?? "",
          },
        ]);
      }
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
    useCommonMutations<TinderNameCategoryPayload>("tinder-name-categories");
  const createMutation = useCreateMutation();
  const updateMutation = useUpdateMutation();

  const onsubmit = (values: any) => {
    setLoading(true);
    const payload: TinderNameCategoryPayload = { ...values };
    if (fileList[0]?.response?.file) {
      payload.image = fileList[0]?.response?.file;
    }
    if (data._id) payload._id = data._id;

    const mutation = mode === "Edit" ? updateMutation : createMutation;

    mutation.mutate(payload, {
      onSuccess: () => {
        messageApi.success(
          `Category ${mode === "Edit" ? "updated" : "created"} successfully`,
        );
        setOpen(false);
        refetch?.();
      },
      onError: (error: any) => {
        const { errors, message: errorMessage } = mapErrors(error);
        if (errors) form.setFields(errors);
        message.error(
          errorMessage || `Category ${mode} failed. Please try again.`,
        );
      },
      onSettled: () => setLoading(false),
    });
  };

  const resetForm = () => {
    form.resetFields();
    setFileList([]);
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
        title={<p>{mode} Tinder Name Category</p>}
        footer={null}
        open={open}
        confirmLoading={loading}
        onCancel={() => {
          setOpen(false);
          onClose?.();
        }}
        width={600}
      >
        <Form
          name="tinder-name-category"
          layout="vertical"
          autoComplete="off"
          validateTrigger="onBlur"
          form={form}
          style={{ maxWidth: 560 }}
          onFinish={onsubmit}
          encType="multipart/form-data"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Name is required!" }]}
          >
            <Input placeholder="Category name" size="large" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              placeholder="Category description"
              showCount
              maxLength={500}
              rows={3}
              size="large"
            />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <ImageUploader
              label="Category Image"
              multiple={false}
              maxCount={1}
              allowedTypes={[
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/svg",
                "image/webp",
              ]}
              maxSizeMB={5}
              fileList={fileList}
              setFileList={setFileList}
            />
          </div>

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

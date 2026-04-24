import { useEffect, useMemo, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Modal,
  Form,
  Input,
  Flex,
  message,
  Select,
} from "antd";
import { useCommonMutations } from "../../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../../utils/mapErrors.ts";
import { useMessageApi } from "../../providers/MessageProvider.tsx";
import { useGetQuery } from "../../../query/queries/useGetQuery.ts";
import {ReactTextEditor} from "../ReactTextEditor.tsx";

type TinderNamePayload = {
  _id?: string;
  name: string;
  gender: string;
  description: string;
  category_id: string;
  is_active: boolean;
};

export default function TinderForm({
  data = {},
  onClose,
  refetch,
}: {
  data?: any;
  onClose?: () => void;
  refetch?: () => void;
}) {
  const [form] = Form.useForm();
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"Create" | "Edit">("Create");
  const messageApi = useMessageApi();
  const [page, setPage] = useState(1);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);

  const {
    data: categoryData = [],
    isLoading: loadingCategories,
    pagination: categoriesPagination,
  } = useGetQuery("tinder-name-categories", {
    page,
    limit: 10,
    sortField: null,
    sortOrder: null,
  });

  useEffect(() => {
    console.log("👉 ~ TinderForm ~ data:", data);
    if (Object.keys(data).length) {
      setMode("Edit");
      form.setFieldsValue({
        ...data,
        category_id: data.category_id?._id,
      });
      setDescription(data.description || "");
      setOpen(true);
    } else {
      setMode("Create");
    }
  }, [data, form]);

  const finalCategoryOptions = useMemo(() => {
    if (mode === "Edit" && data?.category?._id) {
      const exists = categoryOptions.some(
        (opt) => opt._id === data.category._id,
      );
      if (!exists) {
        return [data.category, ...categoryOptions];
      }
    }
    return categoryOptions;
  }, [categoryOptions, data, mode]);

  useEffect(() => {
    if (Array.isArray(categoryData) && categoryData.length > 0) {
      setCategoryOptions((prev) => {
        if (page === 1) {
          return categoryData;
        } else {
          const ids = new Set(prev.map((t) => t._id));
          const newOnes = categoryData.filter(
            (t: { _id: string; name: string }) => !ids.has(t._id),
          );
          return [...prev, ...newOnes];
        }
      });
    }
  }, [categoryData, page]);

  useEffect(() => {
    if (!open) {
      resetForm();
      onClose?.();
      setMode("Create");
    }
  }, [open]);

  const { useCreateMutation, useUpdateMutation } =
    useCommonMutations<TinderNamePayload>("tinder-names");
  const createMutation = useCreateMutation();
  const updateMutation = useUpdateMutation();

  const onsubmit = (values: any) => {
    setLoading(true);
    const payload: TinderNamePayload = { ...values, is_active: true };
    if (data._id) payload._id = data._id;

    const mutation = mode === "Edit" ? updateMutation : createMutation;

    mutation.mutate(payload, {
      onSuccess: () => {
        messageApi.success(
          `Name ${mode === "Edit" ? "updated" : "created"} successfully`,
        );
        setOpen(false);
        refetch?.();
      },
      onError: (error: any) => {
        const { errors, message: errorMessage } = mapErrors(error);
        if (errors) form.setFields(errors);
        message.error(errorMessage || `Name ${mode} failed. Please try again.`);
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
        title={<p>{mode} Tinder Name</p>}
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
          name="tinder-name"
          layout="vertical"
          autoComplete="off"
          validateTrigger="onBlur"
          form={form}
          style={{ maxWidth: 560 }}
          onFinish={onsubmit}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Name is required!" }]}
          >
            <Input placeholder="e.g. Rifat" size="large" />
          </Form.Item>

          <Flex gap="middle">
            <Form.Item
              label="Gender"
              name="gender"
              initialValue="male"
              rules={[{ required: true, message: "Gender is required!" }]}
              style={{ flexGrow: 1 }}
            >
              <Select
                placeholder="Select gender"
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Unisex", value: "unisex" },
                ]}
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Category"
              name="category_id"
              rules={[{ required: true, message: "Category is required!" }]}
              style={{ flexGrow: 1 }}
            >
              <Select
                placeholder="Select category"
                options={finalCategoryOptions}
                fieldNames={{ label: "name", value: "_id" }}
                loading={loadingCategories}
                disabled={loadingCategories}
                onPopupScroll={(e) => {
                  const target = e.target as HTMLElement;
                  if (
                    target.scrollTop + target.offsetHeight >=
                    target.scrollHeight
                  ) {
                    if (
                      categoriesPagination &&
                      page < categoriesPagination.last_page
                    ) {
                      setPage((prev) => prev + 1);
                    }
                  }
                }}
                size="large"
              />
            </Form.Item>
          </Flex>

          {/* <Form.Item
            label="Active"
            name="is_active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item> */}



          <Form.Item
            label="Description:"
            name="description"
            style={{ flexGrow: 1 }}
          >
            <ReactTextEditor
              content={description}
              setContent={(rawContent) =>
                form.setFieldsValue({ description: rawContent })
              }
            />
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

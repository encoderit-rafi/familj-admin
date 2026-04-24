import { useEffect, useState } from "react";
import { UploadOutlined, FileExcelOutlined } from "@ant-design/icons";
import {
  Button,
  Modal,
  Form,
  Input,
  Flex,
  message,
  Select,
  Upload,
  Typography,
} from "antd";
import { api } from "../../../axios";
import { useMutation } from "@tanstack/react-query";
import mapErrors from "../../../utils/mapErrors.ts";
import { useMessageApi } from "../../providers/MessageProvider.tsx";
import { useGetQuery } from "../../../query/queries/useGetQuery.ts";

const { Text } = Typography;

export default function TinderBulkForm({
  onClose,
  refetch,
}: {
  onClose?: () => void;
  refetch?: () => void;
}) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
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

  const bulkCreateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post("/tinder-names/bulk", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });

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
    }
  }, [open]);

  const onsubmit = (values: any) => {
    if (!values.names_text && fileList.length === 0) {
      message.error("Please provide names via textarea or upload a file");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    if (values.names_text) {
      formData.append("names_text", values.names_text);
    }
    formData.append("gender", values.gender);
    if (values.category_id) {
      formData.append("category_id", values.category_id);
    }

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("names_file", fileList[0].originFileObj);
    }

    bulkCreateMutation.mutate(formData, {
      onSuccess: (response) => {
        messageApi.success(
          `Created ${response?.data?.created || 0} names successfully`,
        );
        setOpen(false);
        setFileList([]);
        refetch?.();
      },
      onError: (error: any) => {
        const { errors, message: errorMessage } = mapErrors(error);
        if (errors) form.setFields(errors);
        message.error(errorMessage || "Bulk create failed. Please try again.");
      },
      onSettled: () => setLoading(false),
    });
  };

  const resetForm = () => {
    form?.resetFields();
    setFileList([]);
  };

  const handleFileChange = ({ fileList: newFileList }: any) => {
    const filtered = newFileList.filter((file: any) => {
      const isExcel = file.name?.endsWith(".xlsx") || file.name?.endsWith(".xls");
      if (!isExcel) {
        message.error("Only Excel files (.xlsx, .xls) are allowed");
        return false;
      }
      return true;
    });
    setFileList(filtered.slice(-1));
  };

  return (
    <>
      <Button
        color="primary"
        variant="solid"
        size="large"
        icon={<UploadOutlined />}
        onClick={() => setOpen(true)}
      >
        Bulk Create
      </Button>

      <Modal
        title={<p>Bulk Create Tinder Names</p>}
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
          name="tinder-name-bulk"
          layout="vertical"
          autoComplete="off"
          validateTrigger="onBlur"
          form={form}
          style={{ maxWidth: 560 }}
          onFinish={onsubmit}
        >
          <Form.Item
            label="Names (one per line)"
            name="names_text"
          >
            <Input.TextArea
              placeholder="John&#10;Jane&#10;Bob"
              rows={6}
              size="large"
            />
          </Form.Item>

          <Flex gap="middle" align="center" style={{ marginBottom: 24 }}>
            <div style={{ flex: 1, borderTop: "1px dashed #d9d9d9" }} />
            <Text type="secondary">OR</Text>
            <div style={{ flex: 1, borderTop: "1px dashed #d9d9d9" }} />
          </Flex>

          <Form.Item
            label="Upload Excel File"
            name="names_file"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
          >
            <Upload
              accept=".xlsx,.xls"
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false}
              maxCount={1}
              listType="text"
            >
              <Button icon={<FileExcelOutlined />}>Select Excel File</Button>
            </Upload>
          </Form.Item>
          <Text type="secondary" style={{ display: "block", marginTop: -16, marginBottom: 24 }}>
            Excel columns: name (required), description (optional)
          </Text>

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
              style={{ flexGrow: 1 }}
            >
              <Select
                placeholder="Select category (optional)"
                options={categoryOptions}
                fieldNames={{ label: "name", value: "_id" }}
                loading={loadingCategories}
                disabled={loadingCategories}
                allowClear
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

import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
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
  Select,
  Space,
  Rate,
  type UploadFile,
} from "antd";
import { useCommonMutations } from "../../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../../utils/mapErrors.ts";
import { useMessageApi } from "../../providers/MessageProvider.tsx";
import { useGetUsers } from "../../../query/queries/useUserQuery.ts";
import ImageUploader from "../ImageUploader.tsx";
import { imageLinkGenerator } from "../../../helpers/imageLinkGenerator.ts";

type testimonialPayload = {
  _id?: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  content: string;
  location: string;
  rating: number;
  approved: boolean;
};

export default function TestimonialForm({
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
  // const [selectOpen, setSelectOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUserSelectOption, setShowUserSelectOption] = useState(true);
  const [mode, setMode] = useState<"Create" | "Edit">("Create");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const messageApi = useMessageApi();

  const [page, setPage] = useState(1);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const {
    data: userData = [],
    isLoading: loadingUsers,
    pagination: usersPagination,
  } = useGetUsers({
    page,
    limit: 10,
    sortField: null,
    sortOrder: null,
  });
  // useEffect(() => {
  //   if (loadingUsers) {
  //     setSelectOpen(true);
  //   }
  // }, [loadingUsers]);
  useEffect(() => {
    if (Array.isArray(userData) && userData.length > 0) {
      setUserOptions((prev) => {
        if (page === 1) {
          return userData;
        } else {
          const ids = new Set(prev.map((t) => t._id));
          const newOnes = userData.filter(
            (t: { _id: string; name: string }) => !ids.has(t._id)
          );
          return [...prev, ...newOnes];
        }
      });
    }
  }, [userData, page]); // Add 'page' to dependencies

  useEffect(() => {
    if (Object.keys(data).length) {
      setMode("Edit");
      if (data.userId) {
        form.setFieldsValue({
          userId: data.userId,
          content: data.content,
          location: data.location,
          rating: data.rating,
          approved: data.approved,
        });
      } else {
        form.setFieldsValue({
          name: data.user?.name,
          email: data.user?.email,
          avatar: data.user?.avatar,
          content: data.content,
          location: data.location,
          rating: data.rating,
          approved: data.approved,
        });
      }
      setShowUserSelectOption(data.userId);
      if (data.user?.avatar)
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: imageLinkGenerator(data.user?.avatar) ?? "",
          },
        ]);

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
    useCommonMutations<testimonialPayload>("testimonials");
  const createMutation = useCreateMutation();
  const updateMutation = useUpdateMutation();

  const onsubmit = (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
      avatar:
        fileList[0]?.response?.file ||
        imageLinkGenerator(data?.user?.avatar, null) ||
        null,
      // avatar: fileList[0]?.response?.file || imageLinkGenerator(data?.user?.avatar, null) || null
    };
    if (fileList[0]?.response?.file) {
      payload.avatar = fileList[0]?.response?.file;
    }
    if (data._id) payload._id = data._id;

    const mutation = mode === "Edit" ? updateMutation : createMutation;

    mutation.mutate(payload, {
      onSuccess: () => {
        messageApi.success("Testimonial saved successfully");
        setOpen(false);
        refetch?.();
      },
      onError: (error: any) => {
        const { errors, message: errorMessage } = mapErrors(error);
        if (errors) form.setFields(errors);
        message.error(
          errorMessage || `Testimonial ${mode} Failed. Please try again.`
        );
      },
      onSettled: () => setLoading(false),
    });
  };

  const resetForm = () => {
    form?.resetFields();
    setShowUserSelectOption(true);
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
        title={<p>{mode} Testimonial</p>}
        footer={null}
        open={open}
        confirmLoading={loading}
        onCancel={() => {
          setOpen(false);
          onClose?.();
        }}
      >
        <Form
          name="testimonials"
          layout="vertical"
          autoComplete="off"
          validateTrigger="onBlur"
          form={form}
          style={{ maxWidth: 640 }}
          onFinish={onsubmit}
          encType={"multipart/form-data"}
        >
          <Flex gap="middle">
            <Form.Item
              label="Content:"
              name="content"
              rules={[
                { required: true, message: "Content Field is required!" },
              ]}
              style={{ flexGrow: 1 }}
            >
              <Input.TextArea
                placeholder="content ..."
                showCount
                maxLength={300}
                rows={4}
                size="large"
              />
            </Form.Item>
          </Flex>

          <Flex gap="middle">
            <Row gutter={16} style={{ flexGrow: 1 }}>
              {showUserSelectOption ? (
                <Col span={24}>
                  <Form.Item
                    label="User"
                    name="userId"
                    style={{ flexGrow: 1 }}
                    rules={[
                      { required: true, message: "User Field is required!" },
                    ]}
                  >
                    <Select
                      className="w-full"
                      placeholder="user"
                      options={userOptions}
                      fieldNames={{ label: "name", value: "_id" }}
                      loading={loadingUsers}
                      // disabled={loadingUsers} //! IF DISABLED THEN IT AUTO CLOSE
                      // open={selectOpen || loadingUsers}
                      // onDropdownVisibleChange={setSelectOpen}
                      onPopupScroll={(e) => {
                        // setSelectOpen(true);
                        const target = e.target as HTMLElement;
                        if (
                          target.scrollTop + target.offsetHeight ===
                          target.scrollHeight
                        ) {
                          if (
                            usersPagination &&
                            page < usersPagination.last_page
                          ) {
                            setPage((prev) => prev + 1);
                          }
                        }
                      }}
                      optionRender={(option) => (
                        <Space>
                          <span role="img" aria-label={option.data.name}>
                            {option.data.name}
                          </span>
                          <span className="text-gray-400">
                            {" "}
                            - ( {option.data.email} )
                          </span>
                        </Space>
                      )}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              ) : (
                <>
                  <Col span={12}>
                    <Form.Item
                      label="Name:"
                      name="name"
                      rules={[
                        { required: true, message: "User name is required!" },
                      ]}
                      style={{ flexGrow: 1 }}
                    >
                      <Input placeholder="name" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Email:"
                      name="email"
                      rules={[
                        { required: true, message: "Email is required!" },
                        {
                          type: "email",
                          message: "Please enter a valid email!",
                        },
                      ]}
                    >
                      <Input
                        type="email"
                        placeholder="johndoe@gmail.com"
                        size="large"
                        autoComplete="off"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <ImageUploader
                        label="Avatar"
                        multiple={false}
                        maxCount={1}
                        allowedTypes={[
                          "image/jpeg",
                          "image/jpg",
                          "image/png",
                          "image/svg",
                          "image/webp",
                        ]}
                        maxSizeMB={2}
                        fileList={fileList}
                        setFileList={setFileList}
                      />
                    </div>
                  </Col>
                </>
              )}
            </Row>
            <Button
              type="primary"
              className="mt-8"
              onClick={() => setShowUserSelectOption(!showUserSelectOption)}
            >
              <PlusOutlined />
            </Button>
          </Flex>

          <Form.Item label="Rating:" style={{ flexGrow: 1 }} name="rating">
            <Rate />
          </Form.Item>

          <Form.Item label="Location:" name="location">
            <Input size="large" autoComplete="off" />
          </Form.Item>

          <Form.Item
            label="Approved:"
            style={{ flexGrow: 1 }}
            name="approved"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
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

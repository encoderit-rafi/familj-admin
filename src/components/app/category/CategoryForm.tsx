import { useEffect, useState } from "react";
import { PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Switch, Radio, message, Row, Col } from "antd";
import type { CheckboxGroupProps } from "antd/es/checkbox";
import type { UploadFile } from 'antd';
import ImageUploader from "../ImageUploader.tsx";
// import {useGetCategories} from "../../../query/queries/useCategoryQuery.ts";
import { useCommonMutations } from "../../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../../utils/mapErrors.ts";
import { useMessageApi } from "../../providers/MessageProvider.tsx";
import { imageLinkGenerator } from "../../../helpers/imageLinkGenerator.ts";

type categoryPayload = {
  _id?: string,
  name: string,
  title: string,
  parent_id?: string[],
  description?: string,
  icon?: string,
  image?: string,
  image_url?: string,
  featured: boolean,
  status: string,
}

const statusOptions: CheckboxGroupProps<string>['options'] = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Reviewing', value: 'review', disabled: true },
];

export default function CategoryForm({ data = {}, onClose, refetch }: { data?: any, onClose?: () => void, refetch?: () => void }) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  // const [categoryValue, setCategoryValue] = useState<string[]>([]);
  const messageApi = useMessageApi();

  // const {data: categoryOptions = [], isLoading: loadingCategory} = useGetCategories();
  const [mode, setMode] = useState<'Create' | 'Edit'>('Create');

  useEffect(() => {
    if (!open) {
      resetForm();
      onClose?.();
      setMode('Create');
    }
  }, [open])

  useEffect(() => {
    if (Object.keys(data).length) {
      setMode('Edit');
      form.setFieldsValue(data);
      if (data.image) setFileList([{ uid: '-1', name: 'image.png', status: 'done', url: imageLinkGenerator(data.image, null) ?? '' }]);

      // Set previously selected parent if exists
      // if (data.parent_id) setCategoryValue(Array.isArray(data.parent_id) ? data.parent_id : [data.parent_id]);
      // else setCategoryValue([]);
      setOpen(true);
    } else {
      setMode('Create');
    }
  }, [data]);

  useEffect(() => {
    if (mode === 'Create') {
      // setCategoryValue([]);
      form.setFieldsValue({ parent_id: undefined });
    }
  }, [mode]);

  // const onCategoryChange = (value: string[]) => setCategoryValue(value);

  // Start Self Disable child categories on edit mode...
  // const getAllDescendantIds = (node: any): string[] => {
  //   let ids: string[] = [];
  //   if (node.children && node.children.length > 0) {
  //     for (const child of node.children) {
  //       ids.push(child._id);
  //       ids = ids.concat(getAllDescendantIds(child));
  //     }
  //   }
  //   return ids;
  // };
  // const disableSelfAndDescendants = (tree: any[], selfId: string): any[] => {
  //   const idsToDisable = new Set<string>();
  //
  //   // Step 1: Find the node by ID and get its descendants
  //   const findNodeById = (nodes: any[]): any => {
  //     for (const node of nodes) {
  //       if (node._id === selfId) return node;
  //       if (node.children) {
  //         const found = findNodeById(node.children);
  //         if (found) return found;
  //       }
  //     }
  //     return null;
  //   };
  //
  //   const selfNode = findNodeById(tree);
  //   if (selfNode) {
  //     idsToDisable.add(selfId);
  //     getAllDescendantIds(selfNode).forEach(id => idsToDisable.add(id));
  //   }
  //
  //   // Step 2: Mark disabled
  //   const markDisabled = (nodes: any[]): any[] => {
  //     return nodes.map(node => {
  //       const newNode = {...node};
  //       if (idsToDisable.has(node._id)) {
  //         newNode.disabled = true;
  //       }
  //       if (newNode.children) {
  //         newNode.children = markDisabled(newNode.children);
  //       }
  //       return newNode;
  //     });
  //   };
  //
  //   return markDisabled(tree);
  // };
  // *** End Self Disable child categories on edit mode...

  const { useCreateMutation, useUpdateMutation } = useCommonMutations<categoryPayload>('categories');
  const createMutation = useCreateMutation();
  const updateMutation = useUpdateMutation();

  const onsubmit = (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
      parent_id: values.parent_id || null,
      // image: fileList[0]?.response?.file || data?.image_url || null,
      // image: fileList[0]?.response?.file || imageLinkGenerator(data?.image, null) || null
    };
    if (fileList[0]?.response?.file) {
      payload.image = fileList[0]?.response?.file;
    }
    if (data._id) payload._id = data._id;

    const mutation = mode === 'Edit' ? updateMutation : createMutation;

    mutation.mutate(payload, {
      onSuccess: () => {
        messageApi.success('Tag saved successfully');
        setOpen(false);
        refetch?.()
      },
      onError: (error: any) => {
        const { errors, message: errorMessage } = mapErrors(error);
        if (errors) form.setFields(errors);
        message.error(errorMessage || `Category ${mode} Failed. Please try again.`);
      },
      onSettled: () => setLoading(false),
    });
  };

  const resetForm = () => {
    form.resetFields();
    setFileList([]);
    // setCategoryValue([]);
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
        title={<p>{mode} Category</p>}
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
          name="category"
          layout="vertical"
          autoComplete="off"
          validateTrigger="onBlur"
          form={form}
          style={{ maxWidth: 600 }}
          onFinish={onsubmit}
          encType={'multipart/form-data'}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Category Name Field is required!' }]}
            style={{ flexGrow: 1 }}
          >
            <Input placeholder="name" size="large" />
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            style={{ flexGrow: 1 }}
          >
            <Input placeholder="title" size="large" />
          </Form.Item>

          {/*<Form.Item label="Parent Category" name="parent_id">*/}
          {/*  <TreeSelect*/}
          {/*    showSearch*/}
          {/*    style={{width: '100%'}}*/}
          {/*    value={categoryValue}*/}
          {/*    placeholder="Select a category"*/}
          {/*    allowClear*/}
          {/*    onChange={onCategoryChange}*/}
          {/*    // treeData={categoryOptions}*/}
          {/*    treeData={*/}
          {/*      mode === 'Edit' && data?._id*/}
          {/*        ? disableSelfAndDescendants(categoryOptions, data._id)*/}
          {/*        : categoryOptions*/}
          {/*    }*/}
          {/*    fieldNames={{label: 'name', value: '_id', children: 'children'}}*/}
          {/*    loading={loadingCategory}*/}
          {/*    disabled={loadingCategory}*/}
          {/*    size="large"*/}
          {/*  />*/}
          {/*</Form.Item>*/}

          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="description"
              showCount
              maxLength={150}
              rows={3}
              size="large"
            />
          </Form.Item>

          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item label="Status" style={{ flexGrow: 1 }} name="status" initialValue={'active'}>
                <Radio.Group
                  options={statusOptions}
                  optionType="button"
                  buttonStyle="solid"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item label="Featured" style={{ flexGrow: 1 }} name="featured" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginBottom: 16 }}>
            <ImageUploader
              label="Category Image"
              multiple={false}
              maxCount={1}
              allowedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/svg', 'image/webp']}
              maxSizeMB={5}
              fileList={fileList}
              setFileList={setFileList}
            />
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Submit</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

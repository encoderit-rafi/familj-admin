import {useEffect, useState} from "react";
import {PlusOutlined} from '@ant-design/icons';
import {Button, Modal, Form, Input, message, Spin, Checkbox, Divider} from "antd";
import {useCommonMutations} from "../../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../../utils/mapErrors.ts";
import {useGetPermissions} from "../../../query/queries/useAccessControlQuery.ts";

type rolePayload = {
    _id?: string,
    name: string,
    permissions?: string,
}

export default function RoleForm({data = {}, onClose, refetch}: { data?: any, onClose?: () => void, refetch?: () => void }) {
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'Create' | 'Edit'>('Create');

    const {data: permissions = [], isLoading} = useGetPermissions();

    useEffect(() => {
        if (Object.keys(data).length) {
            setMode('Edit');
            form.setFieldsValue(data)
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

    const {useCreateMutation, useUpdateMutation} = useCommonMutations<rolePayload>('roles');
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

                setOpen(false);
                refetch?.()
            },
            onError: (error: any) => {
                const {errors, message: errorMessage} = mapErrors(error);
                if (errors) form.setFields(errors);
                message.error(errorMessage || `Role ${mode} Failed. Please try again.`);
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
                title={<p>{mode} Role</p>}
                footer={null}
                open={open}
                confirmLoading={loading}
                onCancel={() => {
                    setOpen(false)
                    onClose?.()
                }}
                centered
                width={600}
            >
                <Form
                    name="role"
                    layout="vertical"
                    autoComplete="off"
                    validateTrigger="onBlur"
                    form={form}
                    style={{maxWidth: 640}}
                    onFinish={onsubmit}
                >
                    <Form.Item
                        label="Name:"
                        name="name"
                        rules={[{required: true, message: 'Role Name Field is required!'}]}
                        style={{flexGrow: 1}}
                    >
                        <Input placeholder="name" disabled={mode === 'Edit' && !(data?.deletable && data?.deletable)} size="large"/>
                    </Form.Item>

                    {/*Permissions*/}
                    <Form.Item
                        label="Select Permissions"
                        name="permissions"
                    >
                        {isLoading ? (
                            <Spin size="large"/>
                        ) : (
                            <Checkbox.Group style={{width: '100%'}}>
                                <div className="overflow-auto max-h-[80vh] h-[400px] pb-4">
                                    {permissions.map((group: any) => (
                                        <div key={group.subject} style={{marginBottom: 16}}>
                                            <p className="capitalize">{group.subject}:</p>
                                            <Divider style={{margin: '8px 0'}}/>
                                            {group.permissions.map((p: any) => (
                                                <Checkbox key={p._id} value={p._id} style={{marginRight: 8}}>
                                                    {p.action}
                                                </Checkbox>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </Checkbox.Group>
                        )}
                    </Form.Item>


                    {/*<Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>*/}
                    {/*    Check all*/}
                    {/*</Checkbox>*/}
                    {/*<Divider />*/}
                    {/*<CheckboxGroup options={plainOptions} value={checkedList} onChange={onChange} />*/}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>Submit</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

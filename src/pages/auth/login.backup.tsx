import React, {useState} from 'react';
import {Card, type FormProps, Tag} from 'antd';
import {Button, Checkbox, Form, Input} from 'antd';

type FieldType = {
    username?: string;
    password?: string;
    remember?: string;
};

const customizeRequiredMark = (label: React.ReactNode, {required}: { required: boolean }) => (
    <>
        {required ? <Tag color="error">Required</Tag> : <Tag color="warning">optional</Tag>}
        {label}
    </>
);

const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
};
type RequiredMark = boolean | 'optional' | 'customize';

const Login: React.FC = () => {
    const [form] = Form.useForm();

    const [requiredMark, setRequiredMarkType] = useState<RequiredMark>('optional');

    const onRequiredTypeChange = ({requiredMarkValue}: { requiredMarkValue: RequiredMark }) => {
        setRequiredMarkType(requiredMarkValue);
    };

    return (
        <Card className="!my-4 p-4 max-w-[400px] flex-1">
            <Form
                name="login"
                form={form}
                layout="vertical"
                // labelCol={{span: 8}}
                // wrapperCol={{span: 16}}
                // style={{maxWidth: 600}}
                // initialValues={{remember: true}}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                initialValues={{requiredMarkValue: requiredMark}}
                onValuesChange={onRequiredTypeChange}
                requiredMark={requiredMark === 'customize' ? customizeRequiredMark : requiredMark}
            >
                <Form.Item<FieldType>
                    label="Username"
                    name="username"
                    rules={[{required: true, message: 'Please input your username!'}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item<FieldType>
                    label="Password"
                    name="password"
                    rules={[{required: true, message: 'Please input your password!'}]}
                >
                    <Input.Password/>
                </Form.Item>

                <Form.Item<FieldType> name="remember" valuePropName="checked" label={null}>
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}

export default Login;
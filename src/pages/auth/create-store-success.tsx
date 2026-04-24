import React from "react";
import {Link} from "react-router-dom";
import {Button, Result} from "antd";

const CreateStoreSuccess: React.FC = () => {
    return (
        <Result
            status="success"
            title="Your Familj app has been created successfully!"
            subTitle="Please wait for the admin to verify and 'approve' your store."
            extra={[
                <Link to="/auth/login">
                    <Button type="primary" key="login" size="large">
                        Login
                    </Button>
                </Link>
                // <Button key="buy">Buy Again</Button>,
            ]}
        />
    );
}

export default CreateStoreSuccess;

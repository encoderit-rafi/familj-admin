import {Button, Result} from "antd";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {useNavigate, useLocation} from "react-router-dom";

export default function Forbidden() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        if (location.key === "default") {
            navigate("/", {replace: true});
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center">
            <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
                extra={
                    <Button icon={<ArrowLeftOutlined/>} type="primary" onClick={handleBack}>
                        Back
                    </Button>
                }
            />
        </div>
    );
}

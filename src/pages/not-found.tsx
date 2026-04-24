import {Button, Result} from "antd";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {useNavigate, useLocation} from "react-router-dom";

export default function NotFound() {
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
                status="404"
                title="404"
                subTitle="Sorry, the page you are looking for does not exist."
                extra={
                    <Button icon={<ArrowLeftOutlined/>} type="primary" onClick={handleBack}>
                        Back
                    </Button>
                }
            />
        </div>
    );
}

// import {Button, Result} from "antd";
// import {ArrowLeftOutlined} from "@ant-design/icons";
//
// export default function NotFound() {
//     const redirectTo = (path: string) => {
//         window.location.href = path;
//     }
//     return (
//         <>
//             <div className="h-screen flex items-center justify-center">
//                 <Result
//                     status="404"
//                     title="404"
//                     subTitle="Sorry, the page you visited does not exist."
//                     extra={<Button icon={<ArrowLeftOutlined/>} type="primary" onClick={() => redirectTo('/')}>Back Home</Button>}
//                 />
//             </div>
//         </>
//     )
// }
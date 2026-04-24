import {ArrowLeftOutlined} from "@ant-design/icons";
import {Button, Result} from "antd";
import {useNavigate} from "react-router-dom";

export const DataNotFound = ({
                           module,
                           url
                         }: { module: string, url: string }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center">
      <Result
        status="404"
        title="404"
        subTitle={`Sorry, the "${module}" you are looking for does not exist.`}
        extra={
          <Button icon={<ArrowLeftOutlined/>} size="large" type="primary"
                  onClick={() => navigate(url)}>
            Back To {module} List
          </Button>
        }
      />
    </div>
  )
}

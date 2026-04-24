import { useGetArticle } from "../../../../query/queries/useArticleQuery.ts";
import { useNavigate, useParams } from "react-router-dom";
import { useCanModule } from "../../../../utils/can.ts";
import { Button, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { DataNotFound } from "../../../../components/ui/DataNotFound.tsx";
import ArticleWithTOC from "../../../../components/ui/ArticleWithTOC.tsx";

export default function ArticleDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: article = {}, isLoading, error } = useGetArticle(slug || "");

  const { canUpdate } = useCanModule("articles");
  // const _CAN = useCan()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Spin />
      </div>
    );
  }
  if (error?.message === "STORE_NOT_FOUND") {
    return <DataNotFound module="Article" url="/articles" />;
  }

  return (
    <>
      {article && Object.keys(article).length && (
        <>
          <div className="mb-4 flex items-center justify-end">
            <div className="flex items-center gap-2">
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                Back
              </Button>
              {canUpdate && (
                <Button
                  type="primary"
                  onClick={() => navigate(`/articles/${article.slug}/edit`)}
                >
                  Edit Article
                </Button>
              )}
            </div>
          </div>
          <div className=" bg-white p-3">
            <h1 className="text-3xl my-4 font-bold text-center">
              {article.title}
            </h1>
          </div>
          <div className="m-auto max-w-6xl">
            <ArticleWithTOC article={article} />
          </div>
        </>
      )}
    </>
  );
}

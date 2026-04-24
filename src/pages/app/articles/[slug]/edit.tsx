import { useGetArticle } from "../../../../query/queries/useArticleQuery.ts";
import { useParams } from "react-router-dom";
import { useCanModule } from "../../../../utils/can.ts";
import { Spin } from "antd";
import { DataNotFound } from "../../../../components/ui/DataNotFound.tsx";
import ArticleForm from "../../../../components/app/article/ArticleForm.tsx";

export default function EditArticle() {
  const { slug } = useParams();
  // const navigate = useNavigate();

  const {
    data: article = {},
    isLoading,
    error,
  } = useGetArticle(slug || "", "edit");

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
      {canUpdate && article && Object.keys(article).length && (
        <>
          <ArticleForm
            data={article}
            // refetch={() => navigate('/articles')}
            refetch={() => {}}
          />
        </>
      )}
    </>
  );
}

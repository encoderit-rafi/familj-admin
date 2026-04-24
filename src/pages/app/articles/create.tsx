import ArticleForm from "../../../components/app/article/ArticleForm.tsx";
import { useNavigate } from "react-router-dom";

export default function CreateArticle() {
  const navigate = useNavigate();

  return (
    <>
      <ArticleForm
        data={null}
        refetch={(data) => {
          console.log("👉 ~ CreateArticle ~ data:", data);
          navigate(`/articles/${data.slug}/edit`);
        }}
      />
    </>
  );
}

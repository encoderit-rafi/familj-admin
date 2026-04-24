import { useParams, useSearchParams } from "react-router-dom";
import { Spin } from "antd";
import ArticleWithTOC from "../../../../components/ui/ArticleWithTOC.tsx";
import axios from "axios";
import { API_V1 } from "../../../../consts.ts";
import { useQuery } from "@tanstack/react-query";

export default function ArticleDetails() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const lang = searchParams.get("lang") || "sv";
  const api = axios.create({
    baseURL: `${API_V1}/`,
    withCredentials: true,
  });
  api.interceptors.request.use((config) => {
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  });
  const { isLoading, data: article = {} } = useQuery({
    queryKey: ["get-article-app", slug, "get"],
    queryFn: async () => {
      try {
        return (await api.get(`/articles/${slug}?lang=${lang}`)).data.data;
      } catch (err: any) {
        throw err;
      }
    },
    enabled: !!slug && slug.trim().length > 0,
    staleTime: 0,
    refetchOnMount: true,
  });
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#faf7f2]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="editorial-layout">
      {article && Object.keys(article).length > 0 && (
        <>
          <div className="editorial-header">
            <h1 className="editorial-title">{article.title}</h1>
          </div>
          <div className="editorial-container">
            <ArticleWithTOC article={article} />
          </div>
        </>
      )}
    </div>
  );
}

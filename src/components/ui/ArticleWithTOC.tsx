import { useEffect, useState } from "react";
import { imageLinkGenerator } from "../../helpers/imageLinkGenerator.ts";
import { ViewReactTextEditor } from "../app/ViewReactTextEditor.tsx";
import TableOfContents from "../app/TableOfContents.tsx";

export default function ArticleWithTOC({
  article,
}: {
  article: {
    show_table_of_content: boolean;
    title: string;
    content: string;
    cover_image?: string;
    excerpt?: string;
  };
}) {
  console.log("👉 ~ ArticleWithTOC ~ article:", article);

  const [headings, setHeadings] = useState<
    { id: string; text: string; level: number }[]
  >([]);
  const [processedContent, setProcessedContent] = useState(article.content);

  useEffect(() => {
    // Parse HTML and extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(article.content, "text/html");

    const extracted: { id: string; text: string; level: number }[] = [];
    doc.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el, i) => {
      const id = el.id || `heading-${i}`;
      el.id = id; // inject id into heading
      extracted.push({
        id,
        text: el.textContent || "",
        level: parseInt(el.tagName[1]), // "H2" → 2
      });
    });

    setHeadings(extracted);
    setProcessedContent(doc.body.innerHTML);
  }, [article.content]);

  return (
    <div className="p-0 font-lora">
      {article.cover_image && (
        <img
          src={imageLinkGenerator(article.cover_image) ?? ""}
          alt={article.title}
          className="w-auto max-h-[600px] h-auto mb-10 rounded-xl text-center m-auto"
        />
      )}
      {/* {article.excerpt && (
        <p className="mb-6 text-[#2a2a2a] opacity-80 italic text-lg">
          {article.excerpt}
        </p>
      )} */}

      {/* <div className="flex gap-6"> */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar TOC */}
        {headings && headings.length > 0 && article.show_table_of_content && (
          <TableOfContents headings={headings} />
        )}

        <div className="flex-1 min-w-0">
          <ViewReactTextEditor content={processedContent} />
        </div>
      </div>
    </div>
  );
}

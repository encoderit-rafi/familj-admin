"use client";

import { useState, useEffect } from "react";

type Heading = {
  id: string;
  text: string;
  level: number;
};

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <aside className="w-full md:w-1/3 lg:w-1/4 md:mr-8 p-4 rounded-lg md:sticky md:top-20 h-fit self-start bg-purple-50 border border-purple-200">
      <h3 className="font-bold mb-3 pb-2 border-b-2 border-purple-300 text-[#300043]">
        Table of Contents
      </h3>
      <ul className="space-y-2">
        {headings.map((h) => (
          <li
            key={h.id}
            className={`cursor-pointer font-medium transition-colors ${
              activeId === h.id
                ? "text-soft font-semibold"
                : "text-gray-700 hover:text-soft"
            }`}
            style={{ marginLeft: `${(h.level - 1) * 1}rem` }}
            onClick={() => scrollToHeading(h.id)}
          >
            {h.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}

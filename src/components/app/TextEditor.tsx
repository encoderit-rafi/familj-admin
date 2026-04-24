import { useState, useRef, useMemo, useEffect } from "react";
import JoditEditor from "jodit-react";

interface TextEditorProps {
  initialContent?: string | null | undefined;
  handleChange: (content: string) => void;
  themeMode?: "dark" | "light"; // 👈 new
}

export default function TextEditor({
  initialContent,
  handleChange,
  themeMode = "light",
}: TextEditorProps) {
  const editor = useRef(null);
  const [content, setContent] = useState("");

  // Sync initial content
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // 💡 Configure Jodit theme dynamically
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Start typing...",
      style: {
        background: themeMode === "dark" ? "#1f2327" : "#dde2fd",
        color: themeMode === "dark" ? "#dde2fd" : "#000000",
        border: "1px solid",
        borderColor: themeMode === "dark" ? "#333" : "#b0bbf3",
      },
    }),
    [themeMode]
  );

  // Also update content color on theme change
  useEffect(() => {
    const iframe = document.querySelector(".jodit-wysiwyg") as HTMLElement;
    if (iframe) {
      iframe.style.background = themeMode === "dark" ? "#1f2327" : "#dde2fd";
      // iframe.style.color = themeMode === "dark" ? "#dde2fd" : "#000000";
    }
  }, [themeMode]);

  return (
    <div style={{ maxHeight: 600, overflow: "auto" }} className="no-tailwind">
      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        tabIndex={1}
        onBlur={(newContent) => {
          setContent(newContent);
          handleChange(newContent);
        }}
        // onChange={(newContent) => {
        //   setContent(newContent);
        //   handleChange(newContent);
        // }}
      />
    </div>
  );
}

import {useState, useRef, useMemo, useEffect} from "react";
import JoditEditor from "jodit-react";

interface TextEditorProps {
  initialContent?: string | null | undefined;
  handleChange: (content: string) => void;
  themeMode?: "dark" | "light";
}

export default function TextEditor({
                                     initialContent,
                                     handleChange,
                                     themeMode = "light",
                                   }: TextEditorProps) {
  const editor = useRef(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // Predefined button class names (styles defined in your CSS)
  const buttonClasses = [
    "btn-theme-primary",
    "btn-dark",
    "btn-light",
  ];

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
      controls: {
        checkbox: {
          name: "☑",
          icon: "☑",
          tooltip: "Insert Checkbox",
          exec: (editor: any) => {
            editor.s.insertHTML(
              '<input type="checkbox" style="background:white; margin-right: 8px; padding-top: 8px;" /> '
            );
          },
        },
        linkButton: {
          name: "🔘",
          icon: "🔘",
          tooltip: "Insert Button Link",
          popup: (editor: any, _current: any, close: any) => {
            const form = editor.create.element("form", {
              style: "padding: 20px; background: white; border-radius: 5px;",
            });

            // Button Text Input
            const textLabel = editor.create.element("label", {
              style: "display: block; margin-bottom: 5px; font-weight: bold;",
            });
            textLabel.textContent = "Button Text:";
            const textInput = editor.create.element("input", {
              type: "text",
              placeholder: "Click Here",
              style:
                "width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 3px;",
            });

            // URL Input
            const urlLabel = editor.create.element("label", {
              style: "display: block; margin-bottom: 5px; font-weight: bold;",
            });
            urlLabel.textContent = "URL:";
            const urlInput = editor.create.element("input", {
              type: "text",
              placeholder: "https://",
              style:
                "width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 3px;",
            });

            // Button Style Selector
            const styleLabel = editor.create.element("label", {
              style: "display: block; margin-bottom: 5px; font-weight: bold;",
            });
            styleLabel.textContent = "Button Style:";
            const styleSelect = editor.create.element("select", {
              style:
                "width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 3px;",
            });

            // Add options for each button class
            buttonClasses.forEach((className) => {
              const option = editor.create.element("option", {
                value: className,
              });
              option.textContent = className
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
              styleSelect.appendChild(option);
            });

            // Submit Button
            const submitBtn = editor.create.element("button", {
              type: "button",
              style:
                "padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; margin-right: 10px;",
            });
            submitBtn.textContent = "Insert Button";

            // Cancel Button
            const cancelBtn = editor.create.element("button", {
              type: "button",
              style:
                "padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 3px; cursor: pointer;",
            });
            cancelBtn.textContent = "Cancel";

            submitBtn.addEventListener("click", () => {
              const buttonText = textInput.value || "Click Here";
              const buttonUrl = urlInput.value || "#";
              const className = styleSelect.value + ' articleBtn';

              const buttonHTML = `
                <a href="${buttonUrl}"
                   class="${className}"
                   target="_blank"
                   rel="noopener noreferrer">
                  ${buttonText}
                </a>
              `;
              editor.s.insertHTML(buttonHTML);
              close();
            });

            cancelBtn.addEventListener("click", () => {
              close();
            });

            form.appendChild(textLabel);
            form.appendChild(textInput);
            form.appendChild(urlLabel);
            form.appendChild(urlInput);
            form.appendChild(styleLabel);
            form.appendChild(styleSelect);
            form.appendChild(submitBtn);
            form.appendChild(cancelBtn);

            return form;
          },
        },
      },
      extraButtons: ["checkbox", "linkButton"],
    }),
    [themeMode]
  );

  useEffect(() => {
    const iframe = document.querySelector(".jodit-wysiwyg") as HTMLElement;
    if (iframe) {
      iframe.style.background = themeMode === "dark" ? "#1f2327" : "#dde2fd";
    }
  }, [themeMode]);

  return (
    <div style={{maxHeight: 600, overflow: "auto"}} className="no-tailwind">
      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        tabIndex={1}
        onBlur={(newContent) => {
          setContent(newContent);
          handleChange(newContent);
        }}
      />
    </div>
  );
}

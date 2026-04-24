import { useState, useRef, useMemo, useEffect } from "react";
import JoditEditor from "jodit-react";
import "../../assets/styles/no-tailwind-editor.css";
import {API_BASE_URL, API_V1} from "../../consts";
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
  const buttonClasses = ["btn-theme-primary", "btn-dark", "btn-light"];

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
            editor.s.insertHTML('<input type="checkbox"/> ');
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
              const className = styleSelect.value + " articleBtn";

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
        gridBlock: {
          name: "▦",
          icon: "▦",
          tooltip: "Insert Grid Layout",
          popup: (editor: any, _current: any, close: any) => {
            const form = editor.create.element("form", {
              style:
                "padding: 20px; background: white; border-radius: 5px; width: 300px;",
            });

            const colLabel = editor.create.element("label", {
              style: "display: block; margin-bottom: 5px; font-weight: bold;",
            });
            colLabel.textContent = "Select Columns:";

            const colSelect = editor.create.element("select", {
              style:
                "width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 3px;",
            });

            [2, 3, 4].forEach((num) => {
              const option = editor.create.element("option", { value: num });
              option.textContent = `${num} Columns`;
              colSelect.appendChild(option);
            });

            const submitBtn = editor.create.element("button", {
              type: "button",
              style:
                "padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; margin-right: 10px;",
            });
            submitBtn.textContent = "Insert Grid";

            const cancelBtn = editor.create.element("button", {
              type: "button",
              style:
                "padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 3px; cursor: pointer;",
            });
            cancelBtn.textContent = "Cancel";

            submitBtn.addEventListener("click", () => {
              const cols = parseInt(colSelect.value, 10);
              // const uniqueId = "grid_" + Date.now();

              let columnsHTML = "";
              for (let i = 1; i <= cols; i++) {
                columnsHTML += `
<!--    <div class="article-grid-item" contenteditable="true">-->
    <div class="article-grid-item" data-jodit-temp="true">
      Column ${i}
    </div>
  `;
              }

              const gridHTML = `
  <div style="
    display: grid;
    gap: 16px;
    width: 100%;
    margin: 20px 0;
  "
    class="responsive-grid-${cols}"
  >
    ${columnsHTML}
  </div>

  <style>
    .responsive-grid-${cols} {
      grid-template-columns: repeat(1, 1fr);
    }

    @media (min-width: 600px) {
      .responsive-grid-${cols} {
        grid-template-columns: repeat(${cols > 1 ? 2 : 1}, 1fr);
      }
    }

    @media (min-width: 900px) {
      .responsive-grid-${cols} {
        grid-template-columns: repeat(${cols}, 1fr);
      }
    }
  </style>
`;

              editor.s.insertHTML(gridHTML);
              close();
            });

            cancelBtn.addEventListener("click", () => close());

            form.appendChild(colLabel);
            form.appendChild(colSelect);
            form.appendChild(submitBtn);
            form.appendChild(cancelBtn);

            return form;
          },
        },
        imageUploaderButton: {
          name: "🖼",
          icon: "🖼",
          tooltip: "Upload Image",
          exec: async (editor: any) => {
            // create hidden input
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.style.display = "none";

            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;

              try {
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch(
                  `${API_V1}/file-upload/single`,
                  {
                    method: "POST",
                    body: formData,
                  }
                );

                const data = await res.json();

                if (data?.file) {
                  editor.s.insertHTML(
                    `<img src="${API_BASE_URL}${data.file}" style="max-width:100%;"/>`
                  );
                } else {
                  alert("Upload failed");
                }
              } catch (error) {
                console.error(error);
                alert("Upload error");
              }
            };

            document.body.appendChild(input);
            input.click();
            input.remove();
          },
        },
      },
      // extraButtons: ["checkbox", "linkButton", "gridBlock"],
      extraButtons: [
        "checkbox",
        "linkButton",
        "gridBlock",
        "imageUploaderButton",
      ],
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
    <div
      style={{ maxHeight: 600, overflow: "auto" }}
      className="no-tailwind-editor"
    >
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

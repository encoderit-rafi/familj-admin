import { useEffect } from "react";

import { RichTextProvider } from "reactjs-tiptap-editor";

// Base Kit
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { ListItem } from "@tiptap/extension-list";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  Dropcursor,
  Gapcursor,
  // Placeholder,
  TrailingNode,
} from "@tiptap/extensions";

// build extensions
import { Attachment } from "reactjs-tiptap-editor/attachment";
import { Blockquote } from "reactjs-tiptap-editor/blockquote";
import { Bold } from "reactjs-tiptap-editor/bold";
import { BulletList } from "reactjs-tiptap-editor/bulletlist";
import { Clear } from "reactjs-tiptap-editor/clear";
import { Code } from "reactjs-tiptap-editor/code";
import { CodeBlock } from "reactjs-tiptap-editor/codeblock";
import { CodeView } from "reactjs-tiptap-editor/codeview";
import { Color } from "reactjs-tiptap-editor/color";
import {
  Column,
  ColumnNode,
  MultipleColumnNode,
} from "reactjs-tiptap-editor/column";
import { Drawer } from "reactjs-tiptap-editor/drawer";
import { Emoji } from "reactjs-tiptap-editor/emoji";
import { Excalidraw } from "reactjs-tiptap-editor/excalidraw";
import { ExportPdf } from "reactjs-tiptap-editor/exportpdf";
import { ExportWord } from "reactjs-tiptap-editor/exportword";
import { FontFamily } from "reactjs-tiptap-editor/fontfamily";
import { FontSize } from "reactjs-tiptap-editor/fontsize";
import { Heading } from "reactjs-tiptap-editor/heading";
import { Highlight } from "reactjs-tiptap-editor/highlight";
import { History } from "reactjs-tiptap-editor/history";
import { HorizontalRule } from "reactjs-tiptap-editor/horizontalrule";
import { Iframe } from "reactjs-tiptap-editor/iframe";
import { Image } from "reactjs-tiptap-editor/image";
// import { ImageGif, RichTextImageGif } from "reactjs-tiptap-editor/imagegif";
import { ImportWord } from "reactjs-tiptap-editor/importword";
import { Indent } from "reactjs-tiptap-editor/indent";
import { Italic } from "reactjs-tiptap-editor/italic";
import { Katex } from "reactjs-tiptap-editor/katex";
import { LineHeight } from "reactjs-tiptap-editor/lineheight";
import { Link } from "reactjs-tiptap-editor/link";
import { Mention } from "reactjs-tiptap-editor/mention";
import { Mermaid } from "reactjs-tiptap-editor/mermaid";
import { MoreMark } from "reactjs-tiptap-editor/moremark";
import { OrderedList } from "reactjs-tiptap-editor/orderedlist";
import { SearchAndReplace } from "reactjs-tiptap-editor/searchandreplace";
import { Strike } from "reactjs-tiptap-editor/strike";
import { Table } from "reactjs-tiptap-editor/table";
import { TaskList } from "reactjs-tiptap-editor/tasklist";
import { TextAlign } from "reactjs-tiptap-editor/textalign";
import { TextDirection } from "reactjs-tiptap-editor/textdirection";
import { TextUnderline } from "reactjs-tiptap-editor/textunderline";
import { Twitter } from "reactjs-tiptap-editor/twitter";
import { Video } from "reactjs-tiptap-editor/video";
import "@excalidraw/excalidraw/index.css";
import "easydrawer/styles.css";
import "katex/dist/katex.min.css";
import "prism-code-editor-lightweight/layout.css";
import "prism-code-editor-lightweight/themes/github-dark.css";
import "reactjs-tiptap-editor/style.css";

import { Editor, EditorContent, useEditor } from "@tiptap/react";

function convertBase64ToBlob(base64: string) {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

const DocumentColumn = /* @__PURE__ */ Document.extend({
  content: "(block|columns)+",
});

const BaseKit = [
  DocumentColumn,
  Text,
  Dropcursor,
  Gapcursor,
  HardBreak,
  Paragraph,
  TrailingNode,
  ListItem,
  TextStyle,
];

type TextEditorProps = {
  content: string;
};

export const ViewReactTextEditor = ({ content }: TextEditorProps) => {
  const extensions = [
    ...BaseKit,
    History,
    SearchAndReplace,
    Clear,
    FontFamily,
    // Heading,
    Heading.configure({
      levels: [1, 2, 3, 4, 5, 6],
    }).extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          id: {
            default: null,
            parseHTML: (element) => element.getAttribute("id"),
            renderHTML: (attributes) => {
              if (!attributes.id) {
                return {};
              }
              return {
                id: attributes.id,
              };
            },
          },
        };
      },
    }),
    FontSize,
    Bold,
    Italic,
    TextUnderline,
    Strike,
    MoreMark,
    Emoji,
    Color,
    Highlight,
    BulletList,
    OrderedList,
    TextAlign,
    Indent,
    LineHeight,
    TaskList,
    Link,
    Image,
    Video.configure({
      upload: (files: File) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(URL.createObjectURL(files));
          }, 300);
        });
      },
    }),
    Blockquote,
    HorizontalRule,
    Code,
    CodeBlock,
    Column,
    ColumnNode,
    MultipleColumnNode,
    Table,
    Iframe,
    ExportPdf,
    ImportWord,
    ExportWord,
    TextDirection,
    Attachment.configure({
      upload: (file: any) => {
        // fake upload return base 64
        const reader = new FileReader();
        reader.readAsDataURL(file);

        return new Promise((resolve) => {
          setTimeout(() => {
            const blob = convertBase64ToBlob(reader.result as string);
            resolve(URL.createObjectURL(blob));
          }, 300);
        });
      },
    }),
    Katex,
    Excalidraw,
    Mermaid.configure({
      upload: (file: any) => {
        // fake upload return base 64
        const reader = new FileReader();
        reader.readAsDataURL(file);

        return new Promise((resolve) => {
          setTimeout(() => {
            const blob = convertBase64ToBlob(reader.result as string);
            resolve(URL.createObjectURL(blob));
          }, 300);
        });
      },
    }),
    Drawer.configure({
      upload: (file: any) => {
        // fake upload return base 64
        const reader = new FileReader();
        reader.readAsDataURL(file);

        return new Promise((resolve) => {
          setTimeout(() => {
            const blob = convertBase64ToBlob(reader.result as string);
            resolve(URL.createObjectURL(blob));
          }, 300);
        });
      },
    }),
    Twitter,
    Mention,
    CodeView,
  ];

  const editor = useEditor({
    textDirection: "auto",
    content,
    extensions,
    immediatelyRender: false,
    editable: false,
  });

  useEffect(() => {
    (window as Window & { editor?: typeof editor }).editor = editor;
  }, [editor]);
  // import { useEffect } from "react";

  useEffect(() => {
    const root = document.querySelector(".view-editor-content");
    if (!root) return;

    const wrapTables = () => {
      const tables = root.querySelectorAll("table");
      tables.forEach((table) => {
        const parent = table.parentElement;
        if (!parent || parent.classList.contains("tableWrapper")) return; // already wrapped
        const wrapper = document.createElement("div");
        wrapper.className = "tableWrapper";
        parent.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      });
    };

    // Initial wrap (if already rendered)
    wrapTables();

    // Observe future changes
    const observer = new MutationObserver(() => {
      wrapTables();
    });

    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [editor]);

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);
  return (
    <div className="overflow-hidden! view-editor-content ">
      <RichTextProvider editor={editor as Editor}>
        <div className="flex max-h-full w-full flex-col bg-transparent">
          <EditorContent editor={editor} className="font-lora bg-[#FAF7F2]" />
        </div>
      </RichTextProvider>
    </div>
  );
};

import { useCallback, useEffect, useMemo, useState } from "react";

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
  Placeholder,
  TrailingNode,
} from "@tiptap/extensions";

// build extensions
import {
  Attachment,
  RichTextAttachment,
} from "reactjs-tiptap-editor/attachment";
import {
  Blockquote,
  RichTextBlockquote,
} from "reactjs-tiptap-editor/blockquote";
import { Bold, RichTextBold } from "reactjs-tiptap-editor/bold";
import {
  BulletList,
  RichTextBulletList,
} from "reactjs-tiptap-editor/bulletlist";
import { Clear, RichTextClear } from "reactjs-tiptap-editor/clear";
import { Code, RichTextCode } from "reactjs-tiptap-editor/code";
import { CodeBlock, RichTextCodeBlock } from "reactjs-tiptap-editor/codeblock";
import {
  CodeView,
  RichTextCodeView,
  // RichTextCustomButton,
} from "reactjs-tiptap-editor/codeview";
import { Color, RichTextColor } from "reactjs-tiptap-editor/color";
import {
  Column,
  ColumnNode,
  MultipleColumnNode,
  RichTextColumn,
} from "reactjs-tiptap-editor/column";
import { Drawer, RichTextDrawer } from "reactjs-tiptap-editor/drawer";
import { Emoji, RichTextEmoji } from "reactjs-tiptap-editor/emoji";
import {
  Excalidraw,
  RichTextExcalidraw,
} from "reactjs-tiptap-editor/excalidraw";
import { ExportPdf, RichTextExportPdf } from "reactjs-tiptap-editor/exportpdf";
import {
  ExportWord,
  RichTextExportWord,
} from "reactjs-tiptap-editor/exportword";
import {
  FontFamily,
  RichTextFontFamily,
} from "reactjs-tiptap-editor/fontfamily";
import { FontSize, RichTextFontSize } from "reactjs-tiptap-editor/fontsize";
import { Heading, RichTextHeading } from "reactjs-tiptap-editor/heading";
import { Highlight, RichTextHighlight } from "reactjs-tiptap-editor/highlight";
import {
  History,
  RichTextRedo,
  RichTextUndo,
} from "reactjs-tiptap-editor/history";
import {
  HorizontalRule,
  RichTextHorizontalRule,
} from "reactjs-tiptap-editor/horizontalrule";
import { Iframe, RichTextIframe } from "reactjs-tiptap-editor/iframe";
import { Image, RichTextImage } from "reactjs-tiptap-editor/image";
// import { ImageGif, RichTextImageGif } from "reactjs-tiptap-editor/imagegif";
import {
  ImportWord,
  RichTextImportWord,
} from "reactjs-tiptap-editor/importword";
import { Indent, RichTextIndent } from "reactjs-tiptap-editor/indent";
import { Italic, RichTextItalic } from "reactjs-tiptap-editor/italic";
import { Katex, RichTextKatex } from "reactjs-tiptap-editor/katex";
import {
  LineHeight,
  RichTextLineHeight,
} from "reactjs-tiptap-editor/lineheight";
import { Link, RichTextLink } from "reactjs-tiptap-editor/link";
import { Mention } from "reactjs-tiptap-editor/mention";
import { Mermaid, RichTextMermaid } from "reactjs-tiptap-editor/mermaid";
import { MoreMark, RichTextMoreMark } from "reactjs-tiptap-editor/moremark";
import {
  OrderedList,
  RichTextOrderedList,
} from "reactjs-tiptap-editor/orderedlist";
import {
  RichTextSearchAndReplace,
  SearchAndReplace,
} from "reactjs-tiptap-editor/searchandreplace";
import { RichTextStrike, Strike } from "reactjs-tiptap-editor/strike";
import { RichTextTable, Table } from "reactjs-tiptap-editor/table";
import { RichTextTaskList, TaskList } from "reactjs-tiptap-editor/tasklist";
import { RichTextAlign, TextAlign } from "reactjs-tiptap-editor/textalign";
import {
  RichTextTextDirection,
  TextDirection,
} from "reactjs-tiptap-editor/textdirection";
import {
  RichTextUnderline,
  TextUnderline,
} from "reactjs-tiptap-editor/textunderline";
import { RichTextTwitter, Twitter } from "reactjs-tiptap-editor/twitter";
import { RichTextVideo, Video } from "reactjs-tiptap-editor/video";

// Slash Command
import {
  SlashCommand,
  SlashCommandList,
} from "reactjs-tiptap-editor/slashcommand";

// Bubble
import {
  RichTextBubbleColumns,
  RichTextBubbleDrawer,
  RichTextBubbleExcalidraw,
  RichTextBubbleIframe,
  RichTextBubbleImage,
  RichTextBubbleKatex,
  RichTextBubbleLink,
  RichTextBubbleMermaid,
  RichTextBubbleTable,
  RichTextBubbleText,
  RichTextBubbleTwitter,
  RichTextBubbleVideo,
} from "reactjs-tiptap-editor/bubble";

import "@excalidraw/excalidraw/index.css";
import "easydrawer/styles.css";
import "katex/dist/katex.min.css";
import "prism-code-editor-lightweight/layout.css";
import "prism-code-editor-lightweight/themes/github-dark.css";
import "reactjs-tiptap-editor/style.css";

// import { Editor, EditorContent, Extension, useEditor } from "@tiptap/react";
import {
  Editor,
  EditorContent,
  // useCurrentEditor,
  useEditor,
} from "@tiptap/react";

import { Button, Form, Input, message, Modal, Tooltip } from "antd";
import { useCommonMutations } from "../../query/mutations/useCommonMutations";
import mapErrors from "../../utils/mapErrors";
import { toFormData } from "../../utils/toFormData";
import { API_BASE_URL } from "../../consts";
import { PlusOutlined } from "@ant-design/icons";
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

// custom document to support columns
const DocumentColumn = /* @__PURE__ */ Document.extend({
  content: "(block|columns)+",
  // echo editor is a block editor
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

function debounce(func: any, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    // @ts-ignore
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

type TextEditorProps = {
  content: string;
  setContent: (content: string) => void;
  placeholder?: string;
};

export const ReactTextEditor = ({
  content,
  setContent,
  placeholder = "Press '/' for commands",
}: TextEditorProps) => {
  const { usePostMutation } = useCommonMutations<any>(`file-upload/single`, {
    method: "POST",
  });
  const postMutation = usePostMutation();

  async function uploadImage(file: File): Promise<string> {
    console.log("👉 ~ uploadImage ~ file:", file);
    return new Promise((resolve, reject) => {
      postMutation.mutate(toFormData({ file: file }), {
        onSuccess: (response) => {
          const data = response?.data?.data || response?.data || response || {};
          if (!data?.file) {
            reject("Image URL not found");
            return;
          }

          message.success("Image uploaded");
          resolve(`${API_BASE_URL}${data.file}`); // ✅ RETURN STRING URL
        },
        onError: (error: any) => {
          const { message: errorMessage } = mapErrors(error);
          message.error(errorMessage || "Image upload failed");
          reject(errorMessage);
        },
      });
    });
  }
  const extensions = useMemo(
    () => [
      ...BaseKit,
      Placeholder.configure({
        placeholder: placeholder,
      }),
      History,
      SearchAndReplace,
      Clear,
      FontFamily,
      Heading,
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
      // Link,
      Link,

      Image.configure({
        upload: async (file: File) => {
          return await uploadImage(file); // ✅ returns string URL
        },
      }),
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
      SlashCommand,
      CodeView,
    ],
    [placeholder],
  );
  const RichTextToolbar = ({ editor }: { editor: Editor | null }) => {
    // const { editor } = useCurrentEditor();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const showModal = () => {
      setIsModalOpen(true);
    };

    const handleOk = () => {
      form.validateFields().then(({ text, href }) => {
        console.log("👉 ~ handleOk ~ text, href:", text, href);
        console.log("👉 ~ handleOk ~ editor:", editor);
        if (!editor) return;

        // Insert the styled button link
        editor.commands.insertContent(
          `<a href="${href}" class="btn-theme-primary articleBtn">${text}</a>`,
        );

        setIsModalOpen(false);
        form.resetFields();
      });
      setIsModalOpen(false);
    };

    const handleCancel = () => {
      setIsModalOpen(false);
    };
    return (
      <div className="flex items-center !p-1 gap-2 flex-wrap !border-b !border-solid !border-[#b0bbf3]">
        <RichTextUndo />
        <RichTextRedo />
        <RichTextSearchAndReplace />
        <RichTextClear />
        <RichTextFontFamily />
        <RichTextHeading />
        <RichTextFontSize />
        <RichTextBold />
        <RichTextItalic />
        <RichTextUnderline />
        <RichTextStrike />
        <RichTextMoreMark />
        <RichTextEmoji />
        <RichTextColor />
        <RichTextHighlight />
        <RichTextBulletList />
        <RichTextOrderedList />
        <RichTextAlign />
        <RichTextIndent />
        <RichTextLineHeight />
        <RichTextTaskList />
        <RichTextLink />
        <RichTextImage />
        <RichTextVideo />
        {/* <RichTextImageGif /> */}
        <RichTextBlockquote />
        <RichTextHorizontalRule />
        <RichTextCode />
        <RichTextCodeBlock />
        <RichTextColumn />
        <RichTextTable />
        <RichTextIframe />
        <RichTextExportPdf />
        <RichTextImportWord />
        <RichTextExportWord />
        <RichTextTextDirection />
        <RichTextAttachment />
        <RichTextKatex />
        <RichTextExcalidraw />
        <RichTextMermaid />
        <RichTextDrawer />
        <RichTextTwitter />
        <RichTextCodeView />
        <Tooltip title="Add Button">
          <Button
            onClick={showModal}
            icon={<PlusOutlined />}
            className="hover:!bg-transparent hover:!text-black"
          />
        </Tooltip>

        <Modal
          title="Add button"
          closable={{ "aria-label": "Custom Close Button" }}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          centered
          okText="Apply" // change OK button text
          cancelButtonProps={{ style: { display: "none" } }} // hide Cancel button
          // className="z-50 bg-white"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Button Text"
              name="text"
              rules={[{ required: true, message: "Please enter button text" }]}
            >
              <Input placeholder="Enter button text" />
            </Form.Item>
            <Form.Item
              label="URL"
              name="href"
              rules={[{ required: true, message: "Please enter URL" }]}
            >
              <Input placeholder="Enter URL" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };
  const onValueChange = useCallback(
    debounce((value: any) => {
      setContent(value);
    }, 300),
    [],
  );

  const editor = useEditor({
    // shouldRerenderOnTransaction:  false,
    textDirection: "auto", // global text direction
    content,
    extensions,
    // content,
    immediatelyRender: false, // error duplicate plugin key
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onValueChange(html);
    },
  });

  useEffect(() => {
    (window as Window & { editor?: typeof editor }).editor = editor;
  }, [editor]);
  // useEffect(() => {
  //   window["editor"] = editor;
  // }, [editor]);
  // ✅ THIS IS THE FIX
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);
  // const {token} = theme.useToken(); // 👈 access Ant Design color tokens
  return (
    <div className="overflow-hidden! rounded-xl outline-1! outline-[#b0bbf3]!">
      <RichTextProvider editor={editor as Editor}>
        <div className="flex max-h-full w-full flex-col">
          {/* <RichTextToolbar editor={editor} /> */}
          <RichTextToolbar editor={editor} />
          <EditorContent editor={editor} />

          {/* Bubble */}
          <RichTextBubbleColumns />
          <RichTextBubbleDrawer />
          <RichTextBubbleExcalidraw />
          <RichTextBubbleIframe />
          <RichTextBubbleKatex />
          <RichTextBubbleLink />

          <RichTextBubbleImage />
          <RichTextBubbleVideo />
          {/* <RichTextBubbleImageGif /> */}

          <RichTextBubbleMermaid />
          <RichTextBubbleTable />
          <RichTextBubbleText />
          <RichTextBubbleTwitter />

          {/* Command List */}
          <SlashCommandList />
        </div>
      </RichTextProvider>
    </div>
  );
};

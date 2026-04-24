import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Switch,
  Radio,
  Flex,
  message,
  Row,
  Col,
  TreeSelect,
  Select,
  theme,
  Space,
} from "antd";

// Language options for the dropdown
const LANGUAGES = [
  { value: "en", label: "🇺🇸 English", name: "English" },
  { value: "sv", label: "🇸🇪 Swedish", name: "Swedish" },
];

// Helper to get language name by value
const getLanguageName = (value: string) =>
  LANGUAGES.find((lang) => lang.value === value)?.name || "English";
import type { CheckboxGroupProps } from "antd/es/checkbox";
import type { UploadFile } from "antd";
import ImageUploader from "../ImageUploader.tsx";
import { useCommonMutations } from "../../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../../utils/mapErrors.ts";
import { useGetCategories } from "../../../query/queries/useCategoryQuery.ts";
import { imageLinkGenerator } from "../../../helpers/imageLinkGenerator.ts";
import { useGetQuery } from "../../../query/queries/useGetQuery.ts";
import { useMessageApi } from "../../providers/MessageProvider.tsx";
import { ReactTextEditor } from "../ReactTextEditor.tsx";

type articlePayload = {
  _id?: string;
  translations: {
    language: string;
    title: string;
    slug?: string;
    excerpt?: string;
    content?: string;
  }[];
  categories?: string[];
  tags?: string[];
  author_id?: string;
  status?: string;
  featured?: boolean;
  show_table_of_content?: boolean;
  pregnancy_weeks?: number[];
  thumbnail_image?: string;
  cover_image?: string;
};

const statusOptions: CheckboxGroupProps<string>["options"] = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

export default function ArticleForm({
  data,
  refetch,
}: {
  data?: any;
  refetch?: (data: any) => void;
}) {
  const [form] = Form.useForm();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState<UploadFile[]>([]);
  const [coverImage, setCoverImage] = useState<UploadFile[]>([]);
  const [categoriesValue, setCategoriesValue] = useState<string[]>([]);
  const [mode, setMode] = useState<"Create" | "Edit">("Create");
  const [language, setLanguage] = useState<string>("en");

  // Store translations for each language
  const [translations, setTranslations] = useState<{
    [lang: string]: { title: string; excerpt: string; content: string };
  }>({
    en: { title: "", excerpt: "", content: "" },
    sv: { title: "", excerpt: "", content: "" },
  });
  const { data: categoryOptions = [], isLoading: loadingCategory } =
    useGetCategories();
  const messageApi = useMessageApi();
  const { token } = theme.useToken();
  const [page, setPage] = useState(1);
  const [tagOptions, setTagOptions] = useState<any[]>([]);
  const {
    data: tagData = [],
    isLoading: loadingTags,
    pagination: tagsPagination,
  } = useGetQuery("/tags", {
    page,
    limit: 10,
    sortField: null,
    sortOrder: null,
  });

  const weekOptions = Array.from({ length: 42 }, (_, i) => ({
    label: `Week ${i + 1}`,
    value: i + 1,
  }));

  useEffect(() => {
    if (Array.isArray(tagData) && tagData.length > 0) {
      setTagOptions((prev) => {
        if (page === 1) {
          return tagData;
        } else {
          const ids = new Set(prev.map((t) => t._id));
          const newOnes = tagData.filter(
            (t: { _id: string; name: string }) => !ids.has(t._id),
          );
          return [...prev, ...newOnes];
        }
      });
    }
  }, [tagData, page]);

  useEffect(() => {
    if (data && Object.keys(data).length) {
      setMode("Edit");

      // Set non-translation fields
      form.setFieldsValue({
        status: data.status,
        featured: data.featured,
        show_table_of_content: data.show_table_of_content,
        pregnancy_weeks: data.pregnancy_weeks,
      });

      // Extract translations from the backend format
      if (data.translations && Array.isArray(data.translations)) {
        const loadedTranslations: {
          [lang: string]: { title: string; excerpt: string; content: string };
        } = {
          en: { title: "", excerpt: "", content: "" },
          sv: { title: "", excerpt: "", content: "" },
        };

        data.translations.forEach((t: any) => {
          if (t.language) {
            loadedTranslations[t.language] = {
              title: t.title || "",
              excerpt: t.excerpt || "",
              content: t.content || "",
            };
          }
        });

        setTranslations(loadedTranslations);

        // Set form fields for the currently selected language
        const currentLangData = loadedTranslations[language] || {
          title: "",
          excerpt: "",
          content: "",
        };
        form.setFieldsValue({
          title: currentLangData.title,
          excerpt: currentLangData.excerpt,
        });
        setContent(currentLangData.content || "");
      }

      // Handle images
      if (data.cover_image) {
        setCoverImage([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: imageLinkGenerator(data.cover_image) ?? "",
          },
        ]);
      }
      if (data.thumbnail_image) {
        setThumbnailImage([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: imageLinkGenerator(data.thumbnail_image) ?? "",
          },
        ]);
      }
    } else {
      setMode("Create");
    }
  }, [data, language]);

  useEffect(() => {
    if (
      mode === "Edit" &&
      data &&
      categoryOptions.length > 0 &&
      tagOptions.length > 0
    ) {
      // Set categories and tags - backend expects array of IDs
      const categoryIds = Array.isArray(data.categories)
        ? data.categories.map((c: any) => (typeof c === "string" ? c : c._id))
        : [];

      const tagIds = Array.isArray(data.tags)
        ? data.tags.map((t: any) => (typeof t === "string" ? t : t._id))
        : [];

      form.setFieldsValue({
        categories: categoryIds,
        tags: tagIds,
      });

      setCategoriesValue(categoryIds);
    }
  }, [data, categoryOptions, tagOptions, mode]);

  const onCategoryChange = (value: string[]) => setCategoriesValue(value);

  // Handle language change - save current values and load new language values
  const handleLanguageChange = (newLanguage: string) => {
    // Save current form values to translations state
    const currentValues = form.getFieldsValue();
    setTranslations((prev) => ({
      ...prev,
      [language]: {
        title: currentValues.title || "",
        excerpt: currentValues.excerpt || "",
        content: content || "",
      },
    }));

    // Switch language
    setLanguage(newLanguage);

    // Load the new language's values into the form
    const newLangData = translations[newLanguage] || {
      title: "",
      excerpt: "",
      content: "",
    };
    form.setFieldsValue({
      title: newLangData.title,
      excerpt: newLangData.excerpt,
    });
    setContent(newLangData.content);
  };

  const { useCreateMutation, useUpdateMutation } =
    useCommonMutations<articlePayload>("articles");
  const createMutation = useCreateMutation();
  const updateMutation = useUpdateMutation();

  const onsubmit = (values: any) => {
    setLoading(true);

    // Save current language values to translations before submitting
    const currentTranslations = {
      ...translations,
      [language]: {
        title: values.title || "",
        excerpt: values.excerpt || "",
        content: content || "",
      },
    };

    // Build translations array payload matching backend DTO
    const translationsPayload = Object.entries(currentTranslations)
      .filter(([_, data]) => data.title) // Backend requires title to be NotEmpty
      .map(([lang, data]) => ({
        language: lang,
        title: data.title,
        excerpt: data.excerpt || "",
        content: data.content || "",
        // slug will be auto-generated by backend if not provided
      }));

    // Validate that at least one translation exists
    if (translationsPayload.length === 0) {
      message.error(
        "At least one language translation with a title is required!",
      );
      setLoading(false);
      return;
    }

    // Build payload matching CreateArticleDto structure
    const payload: any = {
      translations: translationsPayload,
      categories: values.categories || [],
      tags: values.tags || [],
      pregnancy_weeks: values.pregnancy_weeks || [],
      status: values.status || "draft",
      featured: values.featured ?? false,
      show_table_of_content: values.show_table_of_content ?? false,
    };

    // Add images if uploaded
    if (thumbnailImage[0]?.response?.file) {
      payload.thumbnail_image = thumbnailImage[0].response.file;
    }
    if (coverImage[0]?.response?.file) {
      payload.cover_image = coverImage[0].response.file;
    }

    // Add ID for edit mode
    if (data?._id) {
      payload._id = data._id;
    }

    const mutation = mode === "Edit" ? updateMutation : createMutation;

    mutation.mutate(payload, {
      onSuccess: (response) => {
        const responseData =
          response?.data?.data || response?.data || response || {};
        messageApi
          .success(responseData.message || "Article saved successfully.")
          .then(() => {});
        mode !== "Edit" && resetForm();
        refetch?.(responseData);
      },
      onError: (error: any) => {
        const { errors, message: errorMessage } = mapErrors(error);
        if (errors) form.setFields(errors);
        message.error(
          errorMessage || `Article ${mode} failed. Please try again.`,
        );
      },
      onSettled: () => setLoading(false),
    });
  };

  const resetForm = () => {
    form?.resetFields();
    setCoverImage([]);
    setThumbnailImage([]);
    setContent("");
    setTranslations({
      en: { title: "", excerpt: "", content: "" },
      sv: { title: "", excerpt: "", content: "" },
    });
    setLanguage("en");
  };

  return (
    <>
      <Form
        name="article"
        layout="vertical"
        autoComplete="off"
        validateTrigger="onBlur"
        form={form}
        style={{ maxWidth: "100%" }}
        onFinish={onsubmit}
        encType={"multipart/form-data"}
      >
        <div>
          {/* Language Dropdown */}
          <Row className="mb-4">
            <Col span={6}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <label style={{ fontWeight: 500 }}>Language:</label>
                <Select
                  value={language}
                  onChange={handleLanguageChange}
                  options={LANGUAGES}
                  size="large"
                  style={{ width: "100%" }}
                />
              </Space>
            </Col>
          </Row>

          <Flex gap="middle">
            <Form.Item
              label="Title:"
              name="title"
              rules={[
                { required: true, message: "Article Title is required!" },
              ]}
              style={{ flexGrow: 1 }}
            >
              <Input
                placeholder={`Enter title in ${getLanguageName(language)}`}
                size="large"
              />
            </Form.Item>
          </Flex>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Category"
                name="categories"
                // rules={[
                //   { required: true, message: "At least one category is required!" }
                // ]}
              >
                <TreeSelect
                  className="w-full"
                  showSearch
                  value={categoriesValue}
                  placeholder="Select categories"
                  allowClear
                  onChange={onCategoryChange}
                  treeData={categoryOptions}
                  multiple={true}
                  fieldNames={{
                    label: "name",
                    value: "_id",
                    children: "children",
                  }}
                  loading={loadingCategory}
                  disabled={loadingCategory}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Tag" name="tags">
                <Select
                  mode={"multiple"}
                  className="w-full"
                  placeholder="Tags"
                  options={tagOptions}
                  fieldNames={{ label: "name", value: "_id" }}
                  loading={loadingTags}
                  disabled={loadingTags}
                  onPopupScroll={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.scrollTop + target.offsetHeight ===
                      target.scrollHeight
                    ) {
                      if (tagsPagination && page < tagsPagination.last_page) {
                        setPage((prev) => prev + 1);
                      }
                    }
                  }}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Pregnancy Weeks"
                name="pregnancy_weeks"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && value.length > 0) {
                        const invalidWeeks = value.filter(
                          (week: number) => week < 1 || week > 42,
                        );
                        if (invalidWeeks.length > 0) {
                          return Promise.reject(
                            "Weeks must be between 1 and 42",
                          );
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select applicable pregnancy weeks"
                  options={weekOptions}
                  size="large"
                  maxTagCount="responsive"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Excerpt:" name="excerpt">
            <Input.TextArea
              placeholder={`Enter excerpt in ${getLanguageName(language)}`}
              showCount
              maxLength={300}
              rows={3}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Content:"
            name="content"
            style={{ background: token.colorBgContainer }}
          >
            <ReactTextEditor
              content={content}
              setContent={(rawContent) => {
                setContent(rawContent);
                form.setFieldsValue({ content: rawContent });
              }}
              placeholder={`Enter content in ${getLanguageName(language)}`}
            />
          </Form.Item>

          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="Show Table of Content:"
                style={{ flexGrow: 1 }}
                name="show_table_of_content"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="Status:"
                style={{ flexGrow: 1 }}
                name="status"
                initialValue={"draft"}
              >
                <Radio.Group
                  options={statusOptions}
                  optionType="button"
                  buttonStyle="solid"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="Featured:"
                style={{ flexGrow: 1 }}
                name="featured"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col span={12}>
              <ImageUploader
                label="Thumbnail Image:"
                help="Recommended size: 1200x630"
                multiple={false}
                maxCount={1}
                maxSizeMB={4}
                fileList={thumbnailImage}
                setFileList={(d) => {
                  console.log(d);
                  setThumbnailImage(d);
                }}
              />
            </Col>

            <Col span={12}>
              <ImageUploader
                label="Cover Image:"
                help="Recommended size: 1920x1080"
                multiple={false}
                maxCount={1}
                maxSizeMB={10}
                fileList={coverImage}
                setFileList={(d) => {
                  console.log(d);
                  setCoverImage(d);
                }}
              />
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </div>
      </Form>
    </>
  );
}

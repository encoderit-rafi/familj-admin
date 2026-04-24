import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Upload, Image, Typography, message } from "antd";
import type { UploadProps, UploadFile, GetProp } from "antd";
import { API_V1} from "../../consts.ts";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

interface ImageUploaderProps {
  label?: string;
  help?: string;
  multiple?: boolean;
  maxCount?: number;
  allowedTypes?: string[]; // optional
  maxSizeMB?: number;
  fileList: UploadFile[];
  setFileList: (files: UploadFile[]) => void;
}

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

const defaultImageTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
  "image/avif",
  "image/svg",
];

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label = "Upload Image",
  help = "",
  multiple = false,
  maxCount = 1,
  allowedTypes = defaultImageTypes,
  maxSizeMB = 5,
  fileList,
  setFileList,
}) => {
  // const URL = `${API_BASE_URL}/file-upload/${multiple ? 'multiple' : 'single'}`;
  const URL = `${API_V1}/file-upload/single`;

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const beforeUpload = (file: FileType) => {
    const isAllowedType = (allowedTypes ?? defaultImageTypes).includes(
      file.type
    );
    if (!isAllowedType) {
      message.error(`File type ${file.type} is not supported.`);
    }

    const isSizeValid = file.size / 1024 / 1024 < (maxSizeMB ?? 5);
    if (!isSizeValid) {
      message.error(`Image must be smaller than ${maxSizeMB}MB.`);
    }

    return isAllowedType && isSizeValid;
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    if (newFileList.length > maxCount) {
      message.error(`You can only upload up to ${maxCount} image(s).`);
      return;
    }
    setFileList(newFileList);
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <div style={{ marginBottom: 16 }}>
      <Typography.Text>
        {label} {previewImage}
      </Typography.Text>
      <Upload
        action={URL}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        beforeUpload={beforeUpload}
        multiple={multiple}
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>
      <div>
        <small className="text-xs leading-0">{help}</small>
      </div>

      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </div>
  );
};

export default ImageUploader;

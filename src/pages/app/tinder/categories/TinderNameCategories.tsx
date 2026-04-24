import React, { useEffect, useRef, useState } from "react";
import {
  Popconfirm,
  type GetProp,
  type TableProps,
  Tooltip,
  Tag,
  Flex,
  Input,
  message,
} from "antd";
import type { SorterResult } from "antd/es/table/interface";
import type { InputRef } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { useDeleteHandler } from "../../../../helpers/useDeleteHandler.ts";
import { useCanModule } from "../../../../utils/can.ts";
import { useCommonMutations } from "../../../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../../../utils/mapErrors.ts";
import { useGetQuery } from "../../../../query/queries/useGetQuery.ts";

type TablePaginationConfig = Exclude<
  GetProp<TableProps, "pagination">,
  boolean
>;

interface DataType {
  _id: string;
  name: string;
  status: string;
  featured: boolean;
  description?: string;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult["field"];
  sortOrder?: SorterResult["order"];
  filters?: Parameters<GetProp<TableProps, "onChange">>[1];
}

const tagInputStyle: React.CSSProperties = {
  width: 120,
  height: 22,
  marginInlineEnd: 8,
  verticalAlign: "top",
};

const tagPlusStyle: React.CSSProperties = {
  height: 22,
  borderStyle: "dashed",
};

const TinderNameCategories: React.FC = () => {
  const { canCreate, canUpdate, canDelete } = useCanModule(
    "tinder_name_category",
  );

  const [tableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 50,
    },
  });

  const {
    data: categories = [],
    isLoading,
    refetch,
  } = useGetQuery("/tinder-name-categories", {
    page: tableParams.pagination?.current || 1,
    limit: tableParams.pagination?.pageSize || 50,
    sortField: tableParams.sortField || null,
    sortOrder: tableParams.sortOrder || null,
  });

  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState("");
  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);

  const { onDelete, deleting } = useDeleteHandler({
    moduleName: "tinder-name-categories",
    refetch,
    successMessage: "Category deleted successfully",
  });

  const { useCreateMutation, useUpdateMutation } = useCommonMutations<any>(
    "tinder-name-categories",
  );
  const createMutation = useCreateMutation();
  const updateMutation = useUpdateMutation();

  useEffect(() => {
    refetch();
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams.sortField,
    tableParams.sortOrder,
    JSON.stringify(tableParams.filters),
  ]);

  useEffect(() => {
    if (inputVisible) inputRef.current?.focus();
  }, [inputVisible]);

  useEffect(() => {
    if (editInputIndex !== -1) editInputRef.current?.focus();
  }, [editInputIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (!inputValue.trim()) return;
    createMutation.mutate(
      {
        name: inputValue.trim(),
        status: "active",
        featured: false,
      },
      {
        onSuccess: () => {
          refetch?.();
          setInputVisible(false);
          setInputValue("");
        },
        onError: (error: any) => {
          const { message: errorMessage } = mapErrors(error);
          message.error(errorMessage);
        },
      },
    );
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value);
  };

  const handleEditInputConfirm = (_id: string) => {
    if (!editInputValue.trim()) {
      setEditInputIndex(-1);
      return;
    }
    updateMutation.mutate(
      {
        _id,
        name: editInputValue.trim(),
        status: "active",
        featured: false,
      },
      {
        onSuccess: () => {
          refetch?.();
          setEditInputIndex(-1);
          setEditInputValue("");
        },
        onError: (error: any) => {
          const { message: errorMessage } = mapErrors(error);
          message.error(errorMessage);
        },
      },
    );
  };

  const showInput = () => setInputVisible(true);

  return (
    <Flex gap="4px 0" wrap>
      {isLoading ? <div>Loading...</div> : null}
      {categories.map((category: DataType, index: number) => {
        const isEditing = index === editInputIndex;
        const isLongName = category.name.length > 20;

        if (isEditing) {
          return (
            <Input
              ref={editInputRef}
              key={category._id}
              size="large"
              style={tagInputStyle}
              value={editInputValue}
              onChange={handleEditInputChange}
              onBlur={() => handleEditInputConfirm(category._id)}
              onPressEnter={() => handleEditInputConfirm(category._id)}
            />
          );
        }

        const tagElement = (
          <Popconfirm
            key={category._id}
            title="Are you sure to delete this category?"
            onConfirm={() => onDelete(category._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tag
              key={category._id}
              closable={canDelete && deleting !== category._id}
              style={{
                userSelect: "none",
                position: "relative",
                opacity: deleting === category._id ? 0.5 : 1,
              }}
              color={category.status === "active" ? "green" : "red"}
              onClose={(e) => {
                e.preventDefault();
                onDelete(category._id);
              }}
              className="flex items-center justify-center"
            >
              <span
                onDoubleClick={(e) => {
                  if (canUpdate) {
                    setEditInputIndex(index);
                    setEditInputValue(category.name);
                    e.preventDefault();
                  }
                }}
              >
                {isLongName
                  ? `${category.name.slice(0, 20)}...`
                  : category.name}
              </span>
            </Tag>
          </Popconfirm>
        );

        return isLongName ? (
          <Tooltip title={category.name} key={category._id}>
            {tagElement}
          </Tooltip>
        ) : (
          tagElement
        );
      })}

      {canCreate && inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="large"
          style={tagInputStyle}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        canCreate && (
          <Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}>
            New Category
          </Tag>
        )
      )}
    </Flex>
  );
};

export default TinderNameCategories;

import React, { useState, useEffect } from "react";
import {
  Button,
  Popconfirm,
  Tag,
  Avatar,
  Select,
  Tooltip,
  Flex,
  type TableProps,
  type GetProp,
  message,
} from "antd";
import type { SorterResult } from "antd/es/table/interface";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import TableWrapper from "../../../components/ui/TableWrapper.tsx";
import { useGetQuery } from "../../../query/queries/useGetQuery.ts";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../axios.ts";
import dayjs from "dayjs";

type TablePaginationConfig = Exclude<
  GetProp<TableProps, "pagination">,
  boolean
>;

interface FlaggedUser {
  _id: string;
  name: string;
  avatar: string;
}

interface FlaggedItem {
  id: string;
  section: "discussion" | "comment";
  content: string;
  flagged_user: FlaggedUser;
  item_id: string;
  thread_id: string;
  createdAt: string;
  flags_count: number;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult["field"];
  sortOrder?: SorterResult["order"];
  section?: string;
}

const FlaggedContent: React.FC = () => {
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    section: undefined,
  });

  const {
    data: flaggedItems = [],
    pagination,
    isLoading,
    refetch,
  } = useGetQuery("/threads/admin/flags", {
    page: tableParams.pagination?.current || 1,
    limit: tableParams.pagination?.pageSize || 10,
    sortOrder: tableParams.sortOrder === "ascend" ? "ascend" : "descend",
    section: tableParams.section,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ section, id }: { section: string; id: string }) =>
      api.delete(`/threads/admin/flags/${section}/${id}`),
    onSuccess: () => {
      message.success("Item deleted successfully");
      refetch();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to delete item";
      message.error(errorMessage);
    },
  });

  const handleTableChange: TableProps<FlaggedItem>["onChange"] = (
    pagination,
    _filters,
    sorter,
  ) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    }));
  };

  const handleSectionChange = (value: string) => {
    setTableParams((prev) => ({
      ...prev,
      section: value === "all" ? undefined : value,
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  const columns: TableProps<FlaggedItem>["columns"] = [
    {
      title: "Section",
      dataIndex: "section",
      key: "section",
      width: "120px",
      render: (section) => (
        <Tag color={section === "discussion" ? "blue" : "orange"} className="capitalize">
          {section}
        </Tag>
      ),
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      render: (content) => (
        <div style={{ maxWidth: "400px" }}>
          <Tooltip title={content}>
            <span style={{ 
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {content || "—"}
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Flagged User",
      dataIndex: "flagged_user",
      key: "flagged_user",
      render: (user: FlaggedUser) => (
        <Flex align="center" gap={8}>
          <Avatar src={user?.avatar} size="small" />
          <span>{user?.name || "Unknown"}</span>
        </Flex>
      ),
    },
    {
      title: "Flags",
      dataIndex: "flags_count",
      key: "flags_count",
      align: "center",
      width: "80px",
      render: (count) => <Tag color={count > 5 ? "red" : "default"}>{count}</Tag>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      width: "80px",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete this content?"
          description="This action will soft-delete the item and cannot be easily undone."
          onConfirm={() => deleteMutation.mutate({ section: record.section, id: record.item_id })}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true, loading: deleteMutation.isPending && deleteMutation.variables?.id === record.item_id }}
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            loading={deleteMutation.isPending && deleteMutation.variables?.id === record.item_id}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <TableWrapper<FlaggedItem>
      title="Flagged Content"
      columns={columns}
      data={flaggedItems}
      loading={isLoading}
      pagination={{
        current: tableParams.pagination?.current,
        pageSize: tableParams.pagination?.pageSize,
        total: pagination?.total || 0,
        showTotal: (total) => `Total ${total} items`,
        showSizeChanger: true,
      }}
      onChange={handleTableChange}
      rowKey="id"
      actions={
        <Flex gap="middle" align="center">
          <Select
            defaultValue="all"
            style={{ width: 150 }}
            onChange={handleSectionChange}
            options={[
              { value: "all", label: "All Sections" },
              { value: "discussion", label: "Discussions" },
              { value: "comment", label: "Comments" },
            ]}
          />
          <Tooltip title="Reload">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
            />
          </Tooltip>
        </Flex>
      }
    />
  );
};

export default FlaggedContent;

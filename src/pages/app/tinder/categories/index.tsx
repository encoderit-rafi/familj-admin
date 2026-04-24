import React, { useEffect, useState } from "react";
import {
  Button,
  Popconfirm,
  type GetProp,
  type TableProps,
  Flex,
  Tooltip,
  Tag,
} from "antd";
import type { SorterResult } from "antd/es/table/interface";
import TableWrapper from "../../../../components/ui/TableWrapper.tsx";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useDeleteHandler } from "../../../../helpers/useDeleteHandler.ts";
// import { useCanModule } from "../../../../utils/can.ts";
import TinderNameCategoryForm from "../../../../components/app/tinder/TinderNameCategoryForm.tsx";
import StatusTag from "../../../../components/ui/StatusTag.tsx";
import { useGetQuery } from "../../../../query/queries/useGetQuery.ts";
import useDebounce from "../../../../hooks/useDebounce.tsx";
import { useMessageApi } from "../../../../components/providers/MessageProvider.tsx";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];
type TablePaginationConfig = Exclude<
  GetProp<TableProps, "pagination">,
  boolean
>;

interface DataType {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  status: string;
  featured: boolean;
  order: number;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult["field"];
  sortOrder?: SorterResult["order"];
  filters?: Parameters<GetProp<TableProps, "onChange">>[1];
}

const TinderNameCategories: React.FC = () => {
  // const { canCreate, canUpdate, canDelete } = useCanModule(
  //   "tinder_name_category",
  // );
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 20,
    },
  });

  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const {
    data: categories = [],
    pagination,
    isLoading,
    refetch,
  } = useGetQuery("/tinder-name-categories", {
    page: tableParams.pagination?.current || 1,
    limit: tableParams.pagination?.pageSize || 20,
    sortField: tableParams.sortField || null,
    sortOrder: tableParams.sortOrder || null,
    search: debouncedSearch,
  });

  const [selectedRecord, setSelectedRecord] = useState({});

  useEffect(() => {
    refetch();
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.sortOrder,
    tableParams?.sortField,
    debouncedSearch,
    JSON.stringify(tableParams.filters),
    refetch,
  ]);

  const messageApi = useMessageApi();
  const reloadData = async () => {
    await refetch();
    messageApi.success("Categories refetched successfully");
  };

  const { onDelete, deleting } = useDeleteHandler({
    moduleName: "tinder-name-categories",
    refetch,
    successMessage: "Category deleted successfully",
  });

  const handleTableChange: TableProps<DataType>["onChange"] = (
    pagination,
    filters,
    sorter,
  ) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: true,
      width: "30%",
      render: (name) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <strong className="capitalize">{name}</strong>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      width: "30%",
      render: (desc) => (
        <span style={{ color: "#888" }}>
          {desc ? (desc.length > 60 ? desc.slice(0, 60) + "…" : desc) : "—"}
        </span>
      ),
    },
    {
      title: "Featured",
      dataIndex: "featured",
      render: (featured) => (
        <>
          {featured ? (
            <Tag color="green">
              <CheckCircleOutlined />
            </Tag>
          ) : (
            <Tag color="red">
              <CloseCircleOutlined />
            </Tag>
          )}
        </>
      ),
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (_, { status }) => <StatusTag status={status} />,
    },
    {
      title: "Actions",
      key: "actions",
      width: "15%",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          {/* {canUpdate && (
            <Tooltip title="Edit">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                disabled={deleting === record._id}
                onClick={() => setSelectedRecord(record)}
              ></Button>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure to delete this category?"
                onConfirm={() => onDelete(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleting === record._id}
                  disabled={deleting === record._id}
                ></Button>
              </Popconfirm>
            </Tooltip>
          )} */}
          {
            <Tooltip title="Edit">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                disabled={deleting === record._id}
                onClick={() => setSelectedRecord(record)}
              ></Button>
            </Tooltip>
          }
          {
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure to delete this category?"
                onConfirm={() => onDelete(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleting === record._id}
                  disabled={deleting === record._id}
                ></Button>
              </Popconfirm>
            </Tooltip>
          }
        </div>
      ),
    },
  ];

  return (
    <TableWrapper<DataType>
      title="Tinder Name Categories"
      columns={columns}
      data={categories}
      loading={isLoading}
      pagination={{
        current: tableParams.pagination?.current,
        pageSize: tableParams.pagination?.pageSize,
        total: pagination?.total || 0,
        showTotal: (total) => `Total ${total} items`,
        showSizeChanger: true,
      }}
      onChange={handleTableChange}
      rowKey="_id"
      onSearch={(value) => setSearch(value)}
      actions={
        <Flex wrap gap="middle" justify="center" align="center">
          <Tooltip title="Reload">
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={() => reloadData()}
              loading={isLoading}
            />
          </Tooltip>
          {/* {canCreate && (
            <TinderNameCategoryForm
              data={selectedRecord}
              onClose={() => setSelectedRecord({})}
              refetch={() => refetch()}
            />
          )} */}
          <TinderNameCategoryForm
            data={selectedRecord}
            onClose={() => setSelectedRecord({})}
            refetch={() => refetch()}
          />
        </Flex>
      }
    />
  );
};

export default TinderNameCategories;

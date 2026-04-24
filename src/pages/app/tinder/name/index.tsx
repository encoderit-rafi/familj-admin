import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  Popconfirm,
  type GetProp,
  type TableProps,
  Flex,
  Tooltip,
  Tag,
  Select,
} from "antd";
import type { SorterResult } from "antd/es/table/interface";
import TableWrapper from "../../../../components/ui/TableWrapper.tsx";
// import type {SearchProps} from "antd/es/input";
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useDeleteHandler } from "../../../../helpers/useDeleteHandler.ts";
// import { useCanModule } from "../../../../utils/can.ts";
import TinderForm from "../../../../components/app/tinder/tinderForm.tsx";
import TinderBulkForm from "../../../../components/app/tinder/tinderBulkForm.tsx";
// import StatusTag from "../../../../components/ui/StatusTag.tsx";
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
  gender: string;
  category_id: string;
  category: {
    name: string;
    description: string;
  };
  is_active: boolean;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult["field"];
  sortOrder?: SorterResult["order"];
  filters?: Parameters<GetProp<TableProps, "onChange">>[1];
}

const TinderNames: React.FC = () => {
  // canCreate
  // const { canUpdate, canDelete } = useCanModule("tinder_names");
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 20,
    },
  });

  const [search, setSearch] = useState<string>("");
  const [genderFilter, setGenderFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const debouncedSearch = useDebounce(search, 500);

  const {
    data: categories = [],
  } = useGetQuery("tinder-name-categories", {
    page: 1,
    limit: 100,
    sortField: null,
    sortOrder: null,
  });

  const categoryOptions = useMemo(() => {
    return categories.map((c: { _id: string; name: string }) => ({
      label: c.name,
      value: c._id,
    }));
  }, [categories]);

  const handleGenderChange = (value: string | undefined) => {
    setGenderFilter(value || undefined);
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  const handleCategoryChange = (value: string | undefined) => {
    setCategoryFilter(value || undefined);
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  // Fetch Tags ...
  const {
    data: names = [],
    pagination,
    isLoading,
    refetch,
  } = useGetQuery("/tinder-names", {
    page: tableParams.pagination?.current || 1,
    limit: tableParams.pagination?.pageSize || 20,
    sortField: tableParams.sortField || null,
    sortOrder: tableParams.sortOrder || null,
    search: debouncedSearch,
    gender: genderFilter,
    category_id: categoryFilter,
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
    genderFilter,
    categoryFilter,
    JSON.stringify(tableParams.filters),
    refetch,
  ]);

  const messageApi = useMessageApi();
  const reloadData = async () => {
    await refetch();
    messageApi.success("Names refetched successfully");
  };

  const { onDelete, deleting, onBulkDelete, bulkDeleting } = useDeleteHandler({
    moduleName: "tinder-names",
    refetch: () => {
        refetch();
        setSelectedRowKeys([]);
    },
    successMessage: "Name deleted successfully",
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

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

  // const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
  //   console.log(info?.source, value);
  // };

  const columns: ColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: true,
      width: "25%",
      render: (name) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <strong className="capitalize">{name}</strong>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: ["category_id", "name"],
    },
    {
      title: "Gender",
      dataIndex: "gender",
      render: (gender) => <span className="capitalize">{gender}</span>,
    },
    {
      title: "Status",
      dataIndex: "is_active",
      render: (is_active) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "20%",
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
                title="Are you sure to delete this name?"
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
                title="Are you sure to delete this name?"
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
      title="Tinder Name"
      columns={columns}
      data={names}
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
      rowSelection={rowSelection}
      onSearch={(value) => setSearch(value)}
      filters={
        <Flex gap={8}>
          <Select
            placeholder="Filter by gender"
            allowClear
            style={{ width: 150 }}
            value={genderFilter}
            onChange={handleGenderChange}
            options={[
              { label: "All", value: "" },
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Unisex", value: "unisex" },
            ]}
          />
          <Select
            placeholder="Filter by category"
            allowClear
            style={{ width: 180 }}
            value={categoryFilter}
            onChange={handleCategoryChange}
            options={[{ label: "All", value: "" }, ...categoryOptions]}
          />
        </Flex>
      }
      actions={
        <Flex wrap gap="middle" justify="center" align="center">
          {selectedRowKeys.length > 0 && (
              <Popconfirm
                  title={`Are you sure to delete ${selectedRowKeys.length} selected names?`}
                  onConfirm={() => onBulkDelete(selectedRowKeys as string[])}
                  okText="Yes"
                  cancelText="No"
              >
                <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    loading={bulkDeleting}
                    size="large"
                >
                  Delete Selected ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
          )}
          <Tooltip title="Reload">
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={() => reloadData()}
              loading={isLoading}
            />
          </Tooltip>
          {/* {canCreate && (
            <TinderForm
              data={selectedRecord}
              onClose={() => setSelectedRecord({})}
              refetch={() => refetch()}
            />
          )} */}
          <TinderBulkForm refetch={() => refetch()} />
          {
            <TinderForm
              data={selectedRecord}
              onClose={() => setSelectedRecord({})}
              refetch={() => refetch()}
            />
          }
        </Flex>
      }
    />
  );
};
export default TinderNames;

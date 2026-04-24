import React, {useEffect, useState} from "react";
import {Button, Flex, type GetProp, Popconfirm, type TableProps, Tooltip,} from "antd";
import type {SorterResult} from "antd/es/table/interface";
import TableWrapper from "../../../components/ui/TableWrapper.tsx";
import {DeleteOutlined, EditOutlined, ReloadOutlined,} from "@ant-design/icons";
import {useDeleteHandler} from "../../../helpers/useDeleteHandler.ts";
import {useCanModule} from "../../../utils/can.ts";
import {useGetQuery} from "../../../query/queries/useGetQuery.ts";
import useDebounce from "../../../hooks/useDebounce.tsx";
import {useMessageApi} from "../../../components/providers/MessageProvider.tsx";
import PregnancyWeekSelect from "../../../components/app/PregnancyWeekSelect.tsx";
import WeeklyDetailsForm from "../../../components/app/weekly-details/WeeklyDetailsForm.tsx";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];
type TablePaginationConfig = Exclude<
  GetProp<TableProps, "pagination">,
  boolean
>;

interface DataType {
  _id: string;
  title: string;
  week: number;
  description: string;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult["field"];
  sortOrder?: SorterResult["order"];
  filters?: Parameters<GetProp<TableProps, "onChange">>[1];
}

const WeeklyDetails: React.FC = () => {
  const {canCreate, canUpdate, canDelete} = useCanModule("weeklydetails");

  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 20,
    },
  });

  const [search, setSearch] = useState<string>("");
  // Debounce search and pregnancy weeks with custom hook
  const debouncedSearch = useDebounce(search, 500);
  const debouncedWeeks = useDebounce(selectedWeeks, 500);

  // Fetch weekly details ...
  const {
    data: details = [],
    pagination,
    isLoading,
    refetch,
    isError,
  } = useGetQuery("/weekly-details", {
    page: tableParams.pagination?.current || 1,
    limit: tableParams.pagination?.pageSize || 20,
    sortField: tableParams.sortField || "week",
    sortOrder: tableParams.sortOrder || "ascend",
    weeks: debouncedWeeks.length > 0 ? debouncedWeeks.join(",") : undefined,
    search: debouncedSearch,
  });

  const [selectedRecord, setSelectedRecord] = useState({});
  const [existingWeeks, setExistingWeeks] = useState<number[]>([]);

  useEffect(() => {
    const weeks = (details?.data || details || []).map(
      (item: DataType) => item.week
    );
    setExistingWeeks(weeks);
  }, [details]);

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
    if (isError) {
      messageApi.error("Weekly details refetched failed");
    } else {
      messageApi.success("Weekly details refetched successfully");
    }
  };

  const {onDelete, deleting} = useDeleteHandler({
    moduleName: "weekly-details",
    refetch,
    successMessage: "Weekly details deleted successfully",
  });

  const handleTableChange: TableProps<DataType>["onChange"] = (
    pagination,
    filters,
    sorter
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
      title: "Title",
      dataIndex: "title",
      width: "15%",
    },
    {
      title: "Pregnancy Week",
      dataIndex: "week",
      width: "5%",
    },
    {
      title: "Description",
      dataIndex: "description",
      width: "25%",
      render: (htmlString) => (
        <div
          className="overflow-hidden whitespace-nowrap text-ellipsis"
          style={{maxWidth: 350}}
        >
          <div dangerouslySetInnerHTML={{__html: htmlString}}/>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "20%",
      render: (_, record) => (
        <div style={{display: "flex", gap: 8}}>
          {canUpdate && (
            <Tooltip title="Edit">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined/>}
                disabled={deleting === record._id}
                onClick={() => setSelectedRecord(record)}
              ></Button>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure to delete this weekly details?"
                onConfirm={() => onDelete(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined/>}
                  loading={deleting === record._id}
                  disabled={deleting === record._id}
                ></Button>
              </Popconfirm>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <TableWrapper<DataType>
      title="Weekly details"
      columns={columns}
      data={details.data || details || []}
      loading={isLoading}
      // pagination={tableParams.pagination}
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
      filters={
        <PregnancyWeekSelect
          mode="multiple"
          value={selectedWeeks}
          onChange={(value) => setSelectedWeeks(value)}
        />
      }
      actions={
        <Flex wrap gap="middle" justify="center" align="center">
          <Tooltip title="Reload">
            <Button
              type="default"
              icon={<ReloadOutlined/>}
              onClick={() => reloadData()}
              loading={isLoading}
            />
          </Tooltip>
          {canCreate && (
            <WeeklyDetailsForm
              data={selectedRecord}
              omittedWeeks={existingWeeks}
              onClose={() => setSelectedRecord({})}
              refetch={() => refetch()}
            />
          )}
        </Flex>
      }
    />
  );
};
export default WeeklyDetails;

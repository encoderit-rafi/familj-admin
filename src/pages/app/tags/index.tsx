import React, {useEffect, useState} from 'react';
import {Button, Popconfirm, type GetProp, type TableProps, Flex, Tooltip, Tag} from 'antd';
import type {SorterResult} from 'antd/es/table/interface';
import TableWrapper from "../../../components/ui/TableWrapper.tsx";
// import type {SearchProps} from "antd/es/input";
import {CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, ReloadOutlined} from "@ant-design/icons";
import {useDeleteHandler} from "../../../helpers/useDeleteHandler.ts";
import {useCanModule} from "../../../utils/can.ts";
import TagForm from "../../../components/app/tag/tagForm.tsx";
import StatusTag from "../../../components/ui/StatusTag.tsx";
import {useGetQuery} from "../../../query/queries/useGetQuery.ts";
import useDebounce from '../../../hooks/useDebounce.tsx';
import {useMessageApi} from "../../../components/providers/MessageProvider.tsx";

type ColumnsType<T extends object = object> = TableProps<T>['columns'];
type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;

interface DataType {
  _id: string;
  name: string;
  status: string;
  featured: string;
  deletable: boolean
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult['field'];
  sortOrder?: SorterResult['order'];
  filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

const Tags: React.FC = () => {
    const {canCreate, canUpdate, canDelete} = useCanModule('tags');
    const [tableParams, setTableParams] = useState<TableParams>({
      pagination: {
        current: 1,
        pageSize: 20,
      },
    });

    const [search, setSearch] = useState<string>("");
    // Debounce search and pregnancy weeks with custom hook
    const debouncedSearch = useDebounce(search, 500);

    // Fetch Tags ...
    const {
      data: tags = [],
      pagination,
      isLoading,
      refetch,
    } = useGetQuery('/tags', {
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
      messageApi.success('Tags refetched successfully');
    }

    const {onDelete, deleting} = useDeleteHandler({
      moduleName: "tags",
      refetch,
      successMessage: "Tag deleted successfully",
    });

    const handleTableChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter) => {
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
        title: 'Name',
        dataIndex: 'name',
        sorter: true,
        width: '25%',
        render: (name) => (
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <strong className="capitalize">{name}</strong>
          </div>
        )
      },
      {
        title: 'Featured',
        dataIndex: 'featured',
        render: (featured) => (
          <>
            {featured ? <Tag color="green"><CheckCircleOutlined color="green"/></Tag> : <Tag color="red"><CloseCircleOutlined/></Tag>}
          </>
        )
      },
      {
        title: 'Status',
        key: 'status',
        dataIndex: 'status',
        render: (_, {status}) => <StatusTag status={status}/>
      },
      {
        title: 'Actions',
        key: 'actions',
        width: '20%',
        render: (_, record) => (
          <div style={{display: 'flex', gap: 8}}>
            {canUpdate &&
                <Tooltip title="Edit">
                  <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined/>}
                      disabled={deleting === record._id}
                      onClick={() => setSelectedRecord(record)}
                  ></Button>
                </Tooltip>
            }
            {canDelete && record?.deletable &&
                <Tooltip title="Delete">
                  <Popconfirm
                      title="Are you sure to delete this tag?"
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
            }
          </div>
        ),
      },
    ];

    return (
      <TableWrapper<DataType>
        title="Tags"
        columns={columns}
        data={tags}
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
            {canCreate &&
                <TagForm
                    data={selectedRecord}
                    onClose={() => setSelectedRecord({})}
                    refetch={() => refetch()}
                />
            }
          </Flex>
        }
      />
    );
  }
;

export default Tags;

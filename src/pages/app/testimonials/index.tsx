import React, {useEffect, useState} from 'react';
import {Button, Popconfirm, type GetProp, type TableProps, Flex, Tooltip, Tag, Rate, Select} from 'antd';
import type {SorterResult} from 'antd/es/table/interface';
import TableWrapper from "../../../components/ui/TableWrapper.tsx";
import {CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, ReloadOutlined} from "@ant-design/icons";
import {useDeleteHandler} from "../../../helpers/useDeleteHandler.ts";
import {useCanModule} from "../../../utils/can.ts";
import TestimonialForm from "../../../components/app/testimonial/testimonialForm.tsx";
import {imageLinkGenerator} from "../../../helpers/imageLinkGenerator.ts";
import {useGetQuery} from "../../../query/queries/useGetQuery.ts";
import {useMessageApi} from "../../../components/providers/MessageProvider.tsx";
import useDebounce from "../../../hooks/useDebounce.tsx";


type ColumnsType<T extends object = object> = TableProps<T>['columns'];
type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;

interface DataType {
  _id: string;
  content: string;
  location: string;
  userId: string;
  user: {
    name: string;
    email: string;
    avatar?: string | null;
  };
  rating: number;
  approved: boolean;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult['field'];
  sortOrder?: SorterResult['order'];
  filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

const Testimonials: React.FC = () => {
    const {canCreate, canUpdate, canDelete} = useCanModule('testimonials');
    const [approved, setApproved] = useState<boolean | null>(null);
    const [tableParams, setTableParams] = useState<TableParams>({
      pagination: {
        current: 1,
        pageSize: 20,
      },
    });

    const [search, setSearch] = useState<string>("");
    // Debounce search and pregnancy weeks with custom hook
    const debouncedSearch = useDebounce(search, 500);

    const {
      data: testimonials = [],
      pagination,
      isLoading,
      refetch,
    } = useGetQuery('/testimonials', {
      page: tableParams.pagination?.current || 1,
      limit: tableParams.pagination?.pageSize || 20,
      sortField: tableParams.sortField || null,
      sortOrder: tableParams.sortOrder || null,
      search: debouncedSearch,
      approved: approved,
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
      messageApi.success('Testimonial refetched successfully');
    }

    const {onDelete, deleting} = useDeleteHandler({
      moduleName: "testimonials",
      refetch,
      successMessage: "Testimonial deleted successfully",
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
        title: 'Content',
        dataIndex: 'content',
        sorter: true,
        width: 200,
        render: (content) => (
          <Tooltip placement="topLeft" title={content}>
            <div
              className="overflow-hidden whitespace-nowrap text-ellipsis ..."
              style={{maxWidth: 200}}
            >
              {content}
            </div>
          </Tooltip>
        )
      },
      {
        title: 'location',
        dataIndex: 'location',
        sorter: true,
      },
      {
        title: 'User',
        dataIndex: 'user',
        sorter: true,
        render: (user) => (
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <img
              src={imageLinkGenerator(user?.avatar, 'female.jpg') ?? ''}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="capitalize">{user?.name}</div>
              <div className="text-gray-400">({user?.email})</div>
            </div>
          </div>
        )
      },
      {
        title: 'Rating',
        dataIndex: 'rating',
        sorter: true,
        render: (rating) => (
          <>
            <div className="">
              <Rate value={rating} disabled/>
            </div>
          </>
        )
      },
      {
        title: 'Approved',
        dataIndex: 'approved',
        render: (approved) => (
          <>
            {approved ? <Tag color="green"><CheckCircleOutlined color="green"/></Tag> : <Tag color="red"><CloseCircleOutlined/></Tag>}
          </>
        )
      },
      {
        title: 'Actions',
        key: 'actions',
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
            {canDelete &&
                <Tooltip title="Delete">
                  <Popconfirm
                      title="Are you sure to delete this testimonial?"
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
        title="Testimonials"
        columns={columns}
        data={testimonials}
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
          <Select
            style={{width: 200}}
            placeholder="Status"
            onChange={(value) => setApproved(value)}
            value={approved}
            options={[
              {
                value: null,
                label: 'All',
              },
              {
                value: true,
                label: 'Approved',
              },
              {
                value: false,
                label: 'Un Approved',
              }
            ]}
          >
          </Select>
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
            {canCreate &&
                <TestimonialForm
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

export default Testimonials;

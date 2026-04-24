import React, {useEffect, useState} from 'react';
import {Button, Popconfirm, type GetProp, type TableProps, Flex, Tooltip, Tag, Space, Badge, List, Modal} from 'antd';
import type {SorterResult} from 'antd/es/table/interface';
import TableWrapper from "../../../components/ui/TableWrapper.tsx";
import {CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, EyeOutlined, ReloadOutlined} from "@ant-design/icons";
import {useDeleteHandler} from "../../../helpers/useDeleteHandler.ts";
import {useCanModule} from "../../../utils/can.ts";
import ChecklistForm from "../../../components/app/checklists/checklistForm.tsx";
import {useGetQuery} from "../../../query/queries/useGetQuery.ts";
import {useMessageApi} from "../../../components/providers/MessageProvider.tsx";
// import PregnancyWeekSelect from "../../../components/app/PregnancyWeekSelect.tsx";
import useDebounce from "../../../hooks/useDebounce.tsx";
import {useCurrentUser} from "../../../hooks/useCurrentUser.tsx";

type ColumnsType<T extends object = object> = TableProps<T>['columns'];
type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;

interface ChecklistItem {
  title: string;
  description?: string;
  is_optional?: boolean;
  order: number;
}

interface DataType {
  _id: string;
  title: string;
  description?: string;
  pregnancy_weeks: number[];
  items: ChecklistItem[];
  // category?: 'general' | 'medical' | 'nutrition' | 'exercise' | 'preparation';
  is_active?: boolean;
  created_by: {
    _id: string;
  },
  userId: string
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult['field'];
  sortOrder?: SorterResult['order'];
  filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

// const categoryColors: Record<string, string> = {
//   general: 'blue',
//   medical: 'red',
//   nutrition: 'green',
//   exercise: 'orange',
//   preparation: 'purple',
// };

const Checklists: React.FC = () => {
  const currentUser = useCurrentUser();
  const {canCreate, canUpdate, canDelete} = useCanModule('checklist-templates');
  // const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 20,
    },
  });
  const [itemsModalOpen, setItemsModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{ title: string, items: ChecklistItem[] }>({title: '', items: []});

  const [search, setSearch] = useState<string>("");
  // Debounce search and pregnancy weeks with custom hook
  const debouncedSearch = useDebounce(search, 500);
  // const debouncedWeeks = useDebounce(selectedWeeks, 500);

  const {
    data: checklists = [],
    pagination,
    isLoading,
    refetch,
  } = useGetQuery('/checklist-templates', {
    page: tableParams.pagination?.current || 1,
    limit: tableParams.pagination?.pageSize || 20,
    sortField: tableParams.sortField || null,
    sortOrder: tableParams.sortOrder || null,
    // pregnancy_weeks: debouncedWeeks.length > 0 ? debouncedWeeks.join(',') : undefined,
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
    // debouncedWeeks,
    debouncedSearch,
    JSON.stringify(tableParams.filters),
    refetch,
  ]);

  const messageApi = useMessageApi();
  const reloadData = async () => {
    await refetch();
    messageApi.success('Checklist refetched successfully');
  }

  const {onDelete, deleting} = useDeleteHandler({
    moduleName: "checklist-templates",
    refetch,
    successMessage: "Checklist deleted successfully",
  });

  const handleTableChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: 'Title',
      dataIndex: 'title',
      sorter: true,
      width: '20%',
      render: (title) => <strong>{title}</strong>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: '25%',
      ellipsis: true,
      render: (description) => description || <span style={{color: '#999'}}>No description</span>
    },
    // {
    //   title: 'Category',
    //   dataIndex: 'category',
    //   sorter: true,
    //   width: '12%',
    //   render: (category) => category ? (
    //       <Tag color={categoryColors[category]}>
    //         {category.charAt(0).toUpperCase() + category.slice(1)}
    //       </Tag>
    //   ) : <span style={{color: '#999'}}>-</span>
    // },
    {
      title: 'Items',
      dataIndex: 'items',
      width: '10%',
      align: 'center',
      render: (items: ChecklistItem[], record: DataType) => (
          <Button
              type="link"
              icon={<EyeOutlined/>}
              onClick={() => {
                setSelectedItems({title: record.title, items: items || []});
                setItemsModalOpen(true);
              }}
          >
            <Badge count={items?.length || 0} showZero color="blue"/>
          </Button>
      )
    },
    // {
    //   title: 'Created By',
    //   dataIndex: 'created_by',
    //   width: '15%',
    //   render: (created_by) => (
    //       created_by && (
    //           <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
    //             <img
    //                 src={imageLinkGenerator(created_by?.avatar, 'female.jpg') ?? ''}
    //                 alt={created_by?.name}
    //                 className="w-10 h-10 rounded-full object-cover"
    //             />
    //             <div>
    //               <div className="capitalize">{created_by?.name}</div>
    //               <small className="!text-xs text-gray-400">({created_by?.email})</small>
    //             </div>
    //           </div>
    //       )
    //   )
    // },
    {
      title: 'Status',
      dataIndex: 'is_active',
      width: '10%',
      align: 'center',
      render: (is_active) => (
          <>
            {is_active !== false ? (
                <Tag color="green" icon={<CheckCircleOutlined/>}>Active</Tag>
            ) : (
                <Tag color="red" icon={<CloseCircleOutlined/>}>Inactive</Tag>
            )}
          </>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      align: 'center',
      render: (_, record) => (
          <div style={{display: 'flex', gap: 8, justifyContent: 'center'}}>
            {canUpdate && (record?.userId == null || record.userId == currentUser._id) &&
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
            {canDelete && (record?.userId == null || record.userId == currentUser._id) &&
                <Tooltip title="Delete">
                  <Popconfirm
                      title="Are you sure to delete this checklist?"
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
      <>
        <TableWrapper<DataType>
            title="Checklists Template"
            columns={columns}
            data={checklists}
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
            // filters={
            //   <PregnancyWeekSelect
            //       value={selectedWeeks}
            //       onChange={(value) => setSelectedWeeks(value)}
            //   />
            // }
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
                    <ChecklistForm
                        data={selectedRecord}
                        onClose={() => setSelectedRecord({})}
                        refetch={() => refetch()}
                    />
                }
              </Flex>
            }
        />
        <Modal
            title={`Checklist Items - ${selectedItems.title}`}
            open={itemsModalOpen}
            onCancel={() => setItemsModalOpen(false)}
            footer={[
              <Button key="close" onClick={() => setItemsModalOpen(false)}>
                Close
              </Button>
            ]}
            width={600}
        >
          <List
              dataSource={selectedItems.items}
              renderItem={(item, index) => (
                  <List.Item key={index}>
                    <List.Item.Meta
                        title={
                          <Space>
                            <span style={{fontWeight: 'bold'}}>#{item.order}</span>
                            <span>{item.title}</span>
                            {item.is_optional && <Tag color="orange">Optional</Tag>}
                          </Space>
                        }
                        description={item.description || <span style={{color: '#999', fontStyle: 'italic'}}>No description</span>}
                    />
                  </List.Item>
              )}
              locale={{emptyText: 'No items found'}}
          />
        </Modal>
      </>
  );
};

export default Checklists;

import React, {useEffect, useState} from 'react';
import {Button, Popconfirm, type GetProp, type TableProps, Flex, Tooltip, Tag, Select} from 'antd';
import type {SorterResult} from 'antd/es/table/interface';
import TableWrapper from "../../../components/ui/TableWrapper.tsx";
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import {useGetUsers} from "../../../query/queries/useUserQuery.ts";
import {useDeleteHandler} from "../../../helpers/useDeleteHandler.ts";
import {useCanModule} from "../../../utils/can.ts";
import useDebounce from '../../../hooks/useDebounce.tsx';
import {useGetQuery} from "../../../query/queries/useGetQuery.ts";
import {useMessageApi} from "../../../components/providers/MessageProvider.tsx";

type ColumnsType<T extends object = object> = TableProps<T>['columns'];
type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;

interface DataType {
  _id: string;
  name: string;
  gender: string;
  email: string;
  roles: { _id: string; name: string }[];
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult['field'];
  sortOrder?: SorterResult['order'];
  filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

const Users: React.FC = () => {
  const {canCreate, canUpdate, canDelete} = useCanModule('users');
  const [roleValues, setRoleValues] = useState<string[]>([]);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const {data: roles = [], isLoading: loadingRoles} = useGetQuery('/roles', {
    page: 1,
    limit: 30
  })

  const [search, setSearch] = useState<string>("");
  // Debounce search and pregnancy weeks with custom hook
  const debouncedSearch = useDebounce(search, 500);

  const {data: users = [], pagination, isLoading, refetch} = useGetUsers({
    page: tableParams.pagination?.current || 1,
    limit: tableParams.pagination?.pageSize || 10,
    sortField: tableParams.sortField || null,
    sortOrder: tableParams.sortOrder || null,
    roles: roleValues && roleValues.length > 0 ? roleValues.join(',') : null,
    search: debouncedSearch,
  });

  useEffect(() => {
    refetch();
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.sortField,
    tableParams?.sortOrder,
    JSON.stringify(tableParams.filters),
    roleValues,
    debouncedSearch,
    refetch,
  ]);

  const handleEdit = (record: DataType) => {
    console.log("Edit:", record);
  };

  const {onDelete, deleting} = useDeleteHandler({
    moduleName: "users",
    refetch,
    successMessage: "User deleted successfully",
  });

  const handleTableChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });
  };

  const messageApi = useMessageApi();
  const reloadData = async () => {
    await refetch();
    messageApi.success('Users refetched successfully');
  }

  // const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
  //     console.log(info?.source, value);
  // };

  const columns: ColumnsType<DataType> = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      width: '20%',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      filters: [
        {text: 'Male', value: 'male'},
        {text: 'Female', value: 'female'},
      ],
      width: '20%',
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      render: (roles) => (
        <>
          {roles && roles.length > 0 &&
            roles.map((role: { _id: string, name: string }, index: number) => (
              <Tag key={role._id + index}>
                {role.name.toUpperCase()}
              </Tag>
              // <span key={role._id}>{role.name}{index < roles.length - 1 && ', '}</span>
            ))}
        </>
      )
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
                    disabled={true}
                    type="link"
                    size="small"
                    icon={<EditOutlined/>}
                    onClick={() => handleEdit(record)}
                ></Button>
              </Tooltip>
          }
          {canDelete &&
              <Tooltip title="Delete">
                <Popconfirm
                    title="Are you sure to delete this user?"
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
      title="Users"
      columns={columns}
      data={users.data || users || []}
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
          mode="multiple"
          style={{width: 200}}
          placeholder="Role"
          onChange={setRoleValues}
          value={roleValues}
          options={roles}
          fieldNames={{label: 'name', value: 'slug'}}
          loading={loadingRoles}
          disabled={loadingRoles}
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
              <Button
                  disabled={true}
                  color="primary"
                  variant="outlined"
                  size="large"
                  icon={<PlusOutlined/>}
              >Create</Button>
          }
        </Flex>
      }
    />
  );
};

export default Users;

import React, {useEffect, useState} from 'react';
import {Button, Popconfirm, type GetProp, type TableProps, Flex, Tooltip} from 'antd';
import type {SorterResult} from 'antd/es/table/interface';
import TableWrapper from "../../../components/ui/TableWrapper.tsx";
import {DeleteOutlined, EditOutlined, ReloadOutlined} from "@ant-design/icons";
import {useDeleteHandler} from "../../../helpers/useDeleteHandler.ts";
import {useCanModule} from "../../../utils/can.ts";
import {useGetRole, useGetRoles} from "../../../query/queries/useAccessControlQuery.ts";
import RoleForm from "../../../components/app/access-control/roleForm.tsx";
import useDebounce from '../../../hooks/useDebounce.tsx';

type ColumnsType<T extends object = object> = TableProps<T>['columns'];
type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;

interface DataType {
    _id: string;
    name: string;
    slug: string;
    deletable: boolean;
}

interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: SorterResult['field'];
    sortOrder?: SorterResult['order'];
    filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

const AccessControl: React.FC = () => {
    const {canCreate, canUpdate, canDelete} = useCanModule('roles');
    const [selectedRecord, setSelectedRecord] = useState({});
    const [selectedRoleSlug, setSelectedRoleSlug] = useState<string | null>(null);
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    
      const [search, setSearch] = useState<string>("");
      // Debounce search and pregnancy weeks with custom hook
      const debouncedSearch = useDebounce(search, 500);

    const {data: roles = [], pagination, isLoading, refetch} = useGetRoles({
        page: tableParams.pagination?.current || 1,
        limit: tableParams.pagination?.pageSize || 10,
        sortField: tableParams.sortField || null,
        sortOrder: tableParams.sortOrder || null,
        search: debouncedSearch,
    });
    const {data: role = {}, isLoading: roleLoading} = useGetRole(selectedRoleSlug ?? null);

    useEffect(() => {
        refetch();
        setSelectedRecord({});
        setSelectedRoleSlug(null);
    }, [
        tableParams.pagination?.current,
        tableParams.pagination?.pageSize,
        tableParams?.sortField,
        tableParams?.sortOrder,
        debouncedSearch,
        JSON.stringify(tableParams.filters),
    ]);

    useEffect(() => {
        if (role && Object.keys(role).length) {
            setSelectedRecord(role);
        }
    }, [role]);

    const handleEdit = (record: DataType) => {
        setSelectedRoleSlug(record?.slug ?? null);
        // setSelectedRecord(record);
    };

    const {onDelete, deleting} = useDeleteHandler({
        moduleName: "roles",
        refetch,
        successMessage: "Role deleted successfully",
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
    //     console.log(info?.source, value);
    // };

    const columns: ColumnsType<DataType> = [
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: true,
            render: (name) => (
                <strong className="capitalize">{name}</strong>
            ),
        },
        {
            title: 'Users',
            dataIndex: 'userCount',
            width: '20%',
        },
        {
            title: 'Permissions',
            dataIndex: 'permissionCount',
            width: '20%',
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
                                loading={roleLoading && selectedRoleSlug === record.slug}
                                disabled={deleting === record._id}
                                onClick={() => handleEdit(record)}
                            ></Button>
                        </Tooltip>
                    }
                    {canDelete && record.deletable &&
                        <Tooltip title="Delete">
                            <Popconfirm
                                title="Are you sure to delete this role?"
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
            title="Roles"
            columns={columns}
            data={roles.data || roles || []}
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
                            onClick={() => refetch()}
                            loading={isLoading}
                        />
                    </Tooltip>
                    {canCreate &&
                        <RoleForm
                            data={selectedRecord}
                            onClose={() => {
                                setSelectedRecord({});
                                setSelectedRoleSlug(null)
                            }}
                            refetch={() => {
                                refetch?.()
                                setSelectedRecord({});
                                setSelectedRoleSlug(null);
                            }}
                        />
                    }
                </Flex>
            }
        />
    );
};

export default AccessControl;

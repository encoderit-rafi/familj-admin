import React, {useEffect, useState} from 'react';
import {Button, Popconfirm, type GetProp, type TableProps, Flex, Tooltip, Tag, Image, Space} from 'antd';
import type {SorterResult} from 'antd/es/table/interface';
import TableWrapper from "../../../components/ui/TableWrapper.tsx";
// import type {SearchProps} from "antd/es/input";
import {CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import {useDeleteHandler} from "../../../helpers/useDeleteHandler.ts";
import {useCanModule} from "../../../utils/can.ts";
// import {useGetArticles} from "../../../query/queries/useArticleQuery.ts";
import StatusTag from "../../../components/ui/StatusTag.tsx";
import {Link, useNavigate} from "react-router-dom";
import {imageLinkGenerator} from "../../../helpers/imageLinkGenerator.ts";
import {useMessageApi} from "../../../components/providers/MessageProvider.tsx";
import PregnancyWeekSelect from "../../../components/app/PregnancyWeekSelect.tsx";
import useDebounce from "../../../hooks/useDebounce.tsx";
import {useGetQuery} from "../../../query/queries/useGetQuery.ts";

type ColumnsType<T extends object = object> = TableProps<T>['columns'];
type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;

interface DataType {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  cover_image_url?: string;
  categories: [];
  tags: [];
  status: string;
  featured: string;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult['field'];
  sortOrder?: SorterResult['order'];
  filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

const Articles: React.FC = () => {
      const navigate = useNavigate();
      const {canCreate, canUpdate, canDelete} = useCanModule('articles');
      const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);
      const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
          current: 1,
          pageSize: 50,
        },
      });

      const [search, setSearch] = useState<string>("");
      // Debounce search and pregnancy weeks with custom hook
      const debouncedSearch = useDebounce(search, 500);
      const debouncedWeeks = useDebounce(selectedWeeks, 500);

      const {
        data: articles = [],
        pagination,
        isLoading,
        refetch
      } = useGetQuery('/articles', {
        page: tableParams.pagination?.current || 1,
        limit: tableParams.pagination?.pageSize || 50,
        sortField: tableParams.sortField || null,
        sortOrder: tableParams.sortOrder || null,
        pregnancy_weeks:
            debouncedWeeks.length > 0 ? debouncedWeeks.join(',') : undefined,
        search: debouncedSearch,
      });

      useEffect(() => {
        refetch();
      }, [
        tableParams.pagination?.current,
        tableParams.pagination?.pageSize,
        tableParams?.sortField,
        tableParams?.sortOrder,
        debouncedWeeks,
        debouncedSearch,
        JSON.stringify(tableParams.filters),
        refetch,
      ]);

      const messageApi = useMessageApi();
      const reloadData = async () => {
        await refetch();
        messageApi.success('Articles refetched successfully');
      }

      const {onDelete, deleting} = useDeleteHandler({
        moduleName: "articles",
        refetch,
        successMessage: "Article deleted successfully",
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
          title: 'Title',
          dataIndex: 'title',
          sorter: true,
          width: '25%',
          render: (name, record) => (
              <Link
                  to={`/articles/${record.slug}`}
                  style={{display: 'flex', alignItems: 'center', gap: 10}}
              >
                {record.cover_image && (
                    <Image
                        src={imageLinkGenerator(record.cover_image) ?? ''}
                        alt={name}
                        width={100}
                        height={100}
                        style={{borderRadius: 4, objectFit: 'contain'}}
                        sizes="small"
                        className="p-0"
                    />
                )}
                <Tooltip placement="topLeft" title={name}>
                  <div
                      className="overflow-hidden whitespace-nowrap text-ellipsis ..."
                      style={{maxWidth: 150}}
                  >
                    <strong className="capitalize">{name}</strong>
                  </div>
                </Tooltip>
              </Link>
          ),
        },
        {
          title: 'Pregnancy Weeks',
          dataIndex: 'pregnancy_weeks',
          width: '15%',
          render: (weeks: number[]) => {
            if (!weeks || weeks.length === 0) return '-';

            const sortedWeeks = [...weeks].sort((a, b) => a - b);

            if (sortedWeeks.length <= 3) {
              return (
                  <Space size={4} wrap>
                    {sortedWeeks.map(week => (
                        <Tag key={week} color="cyan" style={{margin: 2}}>
                          W{week}
                        </Tag>
                    ))}
                  </Space>
              );
            }

            return (
                <Tooltip title={sortedWeeks.map(w => `Week ${w}`).join(', ')}>
                  <Space size={4}>
                    <Tag color="cyan">W{sortedWeeks[0]}</Tag>
                    <Tag color="cyan">W{sortedWeeks[1]}</Tag>
                    <span>+{sortedWeeks.length - 2} more</span>
                  </Space>
                </Tooltip>
            );
          }
        },
        {
          title: 'Categories',
          dataIndex: 'categories',
          width: '15%',
          render: (categories: { id: number; name: string; slug: string }[]) => {
            if (!categories || categories.length === 0) return '-';

            const sortedCategories = [...categories].sort((a, b) =>
                a.name.localeCompare(b.name)
            );

            if (sortedCategories.length <= 1) {
              return (
                  <Space size={4} wrap>
                    {sortedCategories.map(category => (
                        <Tag key={category.id} color="blue" style={{margin: 2}}>
                          {category.name}
                        </Tag>
                    ))}
                  </Space>
              );
            }

            return (
                <Tooltip title={sortedCategories.map(t => t.name).join(', ')}>
                  <Space size={4}>
                    <Tag color="blue">{sortedCategories[0].name}</Tag>
                    {/*<Tag color="blue">{sortedCategories[1].name}</Tag>*/}
                    <span>+{sortedCategories.length - 1} more</span>
                  </Space>
                </Tooltip>
            );
          }
        },
        {
          title: 'Tags',
          dataIndex: 'tags',
          width: '15%',
          render: (tags: { id: number; name: string; slug: string }[]) => {
            if (!tags || tags.length === 0) return '-';

            const sortedTags = [...tags].sort((a, b) =>
                a.name.localeCompare(b.name)
            );

            if (sortedTags.length <= 2) {
              return (
                  <Space size={4} wrap>
                    {sortedTags.map(tag => (
                        <Tag key={tag.id} color="blue" style={{margin: 2}}>
                          {tag.name}
                        </Tag>
                    ))}
                  </Space>
              );
            }

            return (
                <Tooltip title={sortedTags.map(t => t.name).join(', ')}>
                  <Space size={4}>
                    <Tag color="blue">{sortedTags[0].name}</Tag>
                    {/*<Tag color="blue">{sortedTags[1].name}</Tag>*/}
                    <span>+{sortedTags.length - 1} more</span>
                  </Space>
                </Tooltip>
            );
          }
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
                          onClick={() => navigate(`/articles/${record.slug}/edit`)}
                      ></Button>
                    </Tooltip>
                }
                {canDelete &&
                    <Tooltip title="Delete">
                      <Popconfirm
                          title="Are you sure to delete this article?"
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
              title="Articles"
              columns={columns}
              data={articles.data || articles || []}
              loading={isLoading}
              // pagination={tableParams.pagination}
              pagination={{
                current: tableParams.pagination?.current,
                pageSize: tableParams.pagination?.pageSize,
                total: pagination?.total || 0,
                showTotal: (total) => `Total ${total} items`,
                showSizeChanger: true,
                pageSizeOptions: ['50', '100', '150', '200'],
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
                  {canCreate &&
                      <Link to="/articles/create">
                        <Button
                            color="primary"
                            variant="outlined"
                            size="large"
                            icon={<PlusOutlined/>}
                        >
                          Create
                        </Button>
                      </Link>
                  }
                </Flex>
              }
          />
      );
    }
;

export default Articles;

import React, {useEffect, useState} from 'react';
import {Button, Popconfirm, type GetProp, type TableProps, Flex, Tooltip, Tag, Space} from 'antd';
import type {SorterResult} from 'antd/es/table/interface';
import TableWrapper from "../../../components/ui/TableWrapper.tsx";
// import type {SearchProps} from "antd/es/input";
import {CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, ReloadOutlined, EyeOutlined} from "@ant-design/icons";
import {useDeleteHandler} from "../../../helpers/useDeleteHandler.ts";
import {useCanModule} from "../../../utils/can.ts";
import {useGetQuery} from "../../../query/queries/useGetQuery.ts";
import {imageLinkGenerator} from "../../../helpers/imageLinkGenerator.ts";
import QuestionForm from "../../../components/app/questions/QuestionForm.tsx";
import AnswersModal from "../../../components/app/questions/AnswersModal.tsx";
import useDebounce from '../../../hooks/useDebounce.tsx';
import {useMessageApi} from "../../../components/providers/MessageProvider.tsx";

type ColumnsType<T extends object = object> = TableProps<T>['columns'];
type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;

interface DataType {
  _id: string;
  title: string;
  content: string;
  pregnancy_weeks: number[],
  approved: boolean;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult['field'];
  sortOrder?: SorterResult['order'];
  filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

const Questions: React.FC = () => {
    const {canCreate, canUpdate, canDelete} = useCanModule('questions');
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
      data: questions = [],
      pagination,
      isLoading,
      refetch,
    } = useGetQuery('/questions', {
      page: tableParams.pagination?.current || 1,
      limit: tableParams.pagination?.pageSize || 20,
      sortField: tableParams.sortField || null,
      sortOrder: tableParams.sortOrder || null,
      search: debouncedSearch,
    });

    const [selectedRecord, setSelectedRecord] = useState({});
    const [selectedQuestionForAnswers, setSelectedQuestionForAnswers] = useState<{
      id: string;
      title: string;
      answerOptions?: {
        _id?: string;
        content?: string;
      }[];
    } | null>(null);
    const [existingWeeks, setExistingWeeks] = useState<number[]>([]);

    useEffect(() => {
      const weeks = (questions?.data || questions || [])
        .flatMap((item: DataType) => item.pregnancy_weeks || []);
      setExistingWeeks(weeks);
    }, [questions]);

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
      messageApi.success('Questions refetched successfully');
    }

    const {onDelete, deleting} = useDeleteHandler({
      moduleName: "questions",
      refetch,
      successMessage: "Questions deleted successfully",
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

    const handleViewAnswers = (questionId: string, questionTitle: string) => {
      setSelectedQuestionForAnswers({
        id: questionId,
        title: questionTitle,
      });
    };

    const handleCloseAnswersModal = () => {
      setSelectedQuestionForAnswers(null);
    };

    const columns: ColumnsType<DataType> = [
      {
        title: 'Title',
        dataIndex: 'title',
        sorter: true,
        width: '20%',
      },
      {
        title: 'Content',
        dataIndex: 'content',
        width: '20%',
        render: (content) => (
          content && (
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <div dangerouslySetInnerHTML={{__html: content.length > 80 ? content.substring(0, 80) + '...' : content}}/>
            </div>
          )
        )
      },
      {
        title: 'Created By',
        dataIndex: 'created_by',
        render: (created_by) => (
          created_by && (
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <img
                src={imageLinkGenerator(created_by?.avatar, 'female.jpg') ?? ''}
                alt={created_by?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="capitalize">{created_by?.name}</div>
                <div className="text-gray-400">({created_by?.email})</div>
              </div>
            </div>
          )
        )
      },
      {
        title: 'Pregnancy Weeks',
        dataIndex: 'pregnancy_weeks',
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
        title: 'Approved',
        dataIndex: 'is_active',
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
            <Tooltip title="View Answers">
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined/>}
                onClick={() => handleViewAnswers(record._id, record.title)}
              />
            </Tooltip>
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
                      title="Are you sure to delete this questions?"
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
          title="Questions"
          columns={columns}
          data={questions}
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
          //       mode="multiple"
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
                  <QuestionForm
                      data={selectedRecord}
                      omittedWeeks={existingWeeks}
                      onClose={() => setSelectedRecord({})}
                      refetch={() => refetch()}
                  />
              }
            </Flex>
          }
        />

        <AnswersModal
          questionId={selectedQuestionForAnswers?.id || null}
          questionTitle={selectedQuestionForAnswers?.title || ''}
          answerOptions={selectedQuestionForAnswers?.answerOptions || []}
          open={!!selectedQuestionForAnswers}
          onClose={handleCloseAnswersModal}
        />
      </>
    );
  }
;

export default Questions;

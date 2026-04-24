import React, { useEffect, useState } from "react";
import {
  Button,
  Popconfirm,
  type GetProp,
  type TableProps,
  Flex,
  Tooltip,
  Select,
  Space,
} from "antd";
import type { SorterResult } from "antd/es/table/interface";
import TableWrapper from "../../../components/ui/TableWrapper.tsx";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { useDeleteHandler } from "../../../helpers/useDeleteHandler.ts";
import { useCanModule } from "../../../utils/can.ts";
import { imageLinkGenerator } from "../../../helpers/imageLinkGenerator.ts";
import { useGetQuery } from "../../../query/queries/useGetQuery.ts";
import { useMessageApi } from "../../../components/providers/MessageProvider.tsx";
import useDebounce from "../../../hooks/useDebounce.tsx";
import { useGetUsers } from "../../../query/queries/useUserQuery.ts";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];
type TablePaginationConfig = Exclude<
  GetProp<TableProps, "pagination">,
  boolean
>;

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
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult["field"];
  sortOrder?: SorterResult["order"];
  filters?: Parameters<GetProp<TableProps, "onChange">>[1];
}

const QuestionComments: React.FC = () => {
  const { canDelete } = useCanModule("questioncomment");
  const [user, setUser] = useState<boolean | null>(null);
  const [question, setQuestion] = useState<boolean | null>(null);
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
    data: questioncomments = [],
    pagination,
    isLoading,
    refetch,
  } = useGetQuery("/questioncomments", {
    page: tableParams.pagination?.current || 1,
    limit: tableParams.pagination?.pageSize || 20,
    sortField: tableParams.sortField || null,
    sortOrder: tableParams.sortOrder || null,
    search: debouncedSearch,
    userId: user,
    questionId: question,
  });

  const [questionPage, setQuestionPage] = useState(1);
  const [questionOptions, setQuestionOptions] = useState<any[]>([]);
  const {
    data: questions = [],
    pagination: questionsPagination,
    isLoading: questionsLoading,
  } = useGetQuery("/questions", {
    page: questionPage,
    limit: 10,
    sortField: null,
    sortOrder: null,
  });

  const [page, setPage] = useState(1);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const {
    data: userData = [],
    isLoading: loadingUsers,
    pagination: usersPagination,
  } = useGetUsers({
    page,
    limit: 10,
    sortField: null,
    sortOrder: null,
  });
  // useEffect(() => {
  //   if (loadingUsers) {
  //     setSelectOpen(true);
  //   }
  // }, [loadingUsers]);
  useEffect(() => {
    if (Array.isArray(userData) && userData.length > 0) {
      setUserOptions((prev) => {
        if (page === 1) {
          return userData;
        } else {
          const ids = new Set(prev.map((t) => t._id));
          const newOnes = userData.filter(
            (t: { _id: string; name: string }) => !ids.has(t._id)
          );
          return [...prev, ...newOnes];
        }
      });
    }
    // quetioncomments
  }, [userData, page]);

  // questions
  useEffect(() => {
    if (Array.isArray(questions) && questions.length > 0) {
      setQuestionOptions((prev) => {
        if (questionPage === 1) {
          return questions;
        } else {
          const ids = new Set(prev.map((t) => t._id));
          const newOnes = questions.filter(
            (t: { _id: string; title: string }) => !ids.has(t._id)
          );
          return [...prev, ...newOnes];
        }
      });
    }
    // quetioncomments
  }, [questions, questionPage]);

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
    messageApi.success("Question comments refetched successfully");
  };

  const { onDelete, deleting } = useDeleteHandler({
    moduleName: "questioncomments",
    refetch,
    successMessage: "Question comment deleted successfully",
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
      title: "Comment",
      dataIndex: "description",
      width: 200,
      render: (content) => (
        <Tooltip placement="topLeft" title={content}>
          <div
            className="overflow-hidden whitespace-nowrap text-ellipsis ..."
            style={{ maxWidth: 200 }}
          >
            {content}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Question",
      dataIndex: "question",
      render: (question) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <div className="capitalize">{question?.title}</div>
          </div>
        </div>
      ),
    },
    {
      title: "User",
      dataIndex: "user",
      sorter: true,
      render: (user) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={imageLinkGenerator(user?.avatar, "female.jpg") ?? ""}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="capitalize">{user?.name}</div>
            <div className="text-gray-400">({user?.email})</div>
          </div>
        </div>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          {canDelete && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure to delete this question comment?"
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
          )}
        </div>
      ),
    },
  ];

  return (
    <TableWrapper<DataType>
      title="Question Comments"
      columns={columns}
      data={questioncomments}
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
        <div className="flex gap-2">
          <Select
          className="w-48"
          placeholder="user"
          options={userOptions}
          fieldNames={{ label: "name", value: "_id" }}
          loading={loadingUsers}
          onChange={(value) => setUser(value)}
          onPopupScroll={(e) => {
            // setSelectOpen(true);
            const target = e.target as HTMLElement;
            if (
              target.scrollTop + target.offsetHeight ===
              target.scrollHeight
            ) {
              if (usersPagination && page < usersPagination.last_page) {
                setPage((prev) => prev + 1);
              }
            }
          }}
          optionRender={(option) => (
            <Space>
              <span role="img" aria-label={option.data.name}>
                {option.data.name}
              </span>
              <span className="text-gray-400"> - ( {option.data.email} )</span>
            </Space>
          )}
        />  

          <Select
          className="w-48"
          placeholder="question"
          options={questionOptions}
          fieldNames={{ label: "title", value: "_id" }}
          loading={questionsLoading}
          onChange={(value) => setQuestion(value)}
          onPopupScroll={(e) => {
            // setSelectOpen(true);
            const target = e.target as HTMLElement;
            if (
              target.scrollTop + target.offsetHeight ===
              target.scrollHeight
            ) {
              if (questionsPagination && questionPage < questionsPagination.last_page) {
                setQuestionPage((prev) => prev + 1);
              }
            }
          }}
          optionRender={(option) => (
            <Space>
              <span role="img" aria-label={option.data.title}>
                {option.data.title}
              </span>
            </Space>
          )}
        />  
        </div>
              

        
      }
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
        </Flex>
      }
    />
  );
};
export default QuestionComments;

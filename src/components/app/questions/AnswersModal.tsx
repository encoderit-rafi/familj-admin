import React, {useState} from 'react';
import {
  Modal,
  List,
  Button,
  Tag,
  Input,
  Form,
  message,
  Divider, Flex, Radio,
} from 'antd';
import {useGetQuery} from "../../../query/queries/useGetQuery.ts";
import {imageLinkGenerator} from "../../../helpers/imageLinkGenerator.ts";
import {useCommonMutations} from "../../../query/mutations/useCommonMutations.ts";
import mapErrors from "../../../utils/mapErrors.ts";
import {PlusOutlined} from "@ant-design/icons";

interface Answer {
  _id: string;
  created_by: {
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  is_active: boolean;
  answer_option_id: string;
  comment: string;
}

interface AnswersModalProps {
  questionId: string | null;
  questionTitle: string;
  answerOptions?: {
    _id?: string;
    content?: string;
  }[];
  open: boolean;
  onClose: () => void;
}

const AnswersModal: React.FC<AnswersModalProps> = ({
                                                     questionId,
                                                     questionTitle,
                                                     open,
                                                     onClose,
                                                   }) => {
  const [form] = Form.useForm();
  // const [tableParams, setTableParams] = useState<TableParams>({
  //   pagination: {
  //     current: 1,
  //     pageSize: 20,
  //   },
  // });
  const [adding, setAdding] = useState(false);

  const {
    data,
    isLoading: loadingAnswers,
    refetch: refetchAnswers,
  } = useGetQuery(
    questionId ? `/questions/${questionId}?with_answers=true` : null,
    // questionId ? `/questions/${questionId}/answers` : null,
    {
      page: 1,
      limit: 20,
    },
    {enabled: !!questionId,}
  );

  const answers = data?.answers?.data || [];
  const answerOptions = data?.answer_options || [];

  const {usePostMutation} = useCommonMutations<any>(`questions/${questionId}/answer-options`, {
    method: 'PATCH',
  });
  const postMutation = usePostMutation();

  const handleAddOption = async (values: { content: string }) => {
    if (!questionId) return;
    const payload = {
      _id: questionId,
      content: values.content,
    };
    setAdding(true);
    postMutation.mutate({
      ...payload,
    }, {
      onSuccess: (response) => {
        const data = response?.data?.data || response?.data || response || {};
        message.success(data.message || 'Answer option added!');
        form.resetFields();
        refetchAnswers();
      },
      onError: (error: any) => {
        const {errors, message: errorMessage} = mapErrors(error);
        console.log(errors);
        message.error(errorMessage || `Adding answer option failed. Please try again.`);
      },
      onSettled: () => setAdding(false),
    });
  };

  const findAnswerOption = (id: string) => {
    if (!answerOptions) return null;
    return answerOptions.find((option: any) => option._id === id)?.content || null;
  }

  return (
    <Modal
      title={`Answers for: ${questionTitle}`}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={800}
      destroyOnClose
    >
      {/* Add new option */}
      <Divider orientation="left">Answer Options</Divider>
      <List
        dataSource={answerOptions}
        locale={{emptyText: 'No answer options yet.'}}
        renderItem={(option: any) => (
          <List.Item key={option._id}>
            <Flex>
              <Radio disabled={true}>
                <Tag color="blue">{option.content}</Tag>
              </Radio>
            </Flex>
          </List.Item>
        )}
      />


      <Form
        layout="inline"
        form={form}
        onFinish={handleAddOption}
        style={{marginTop: 16}}
      >
        <Form.Item
          name="content"
          rules={[{required: true, message: 'Please enter an answer option'}]}
          style={{flex: 1}}
        >
          <Input placeholder="Enter new answer option" size="large"/>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusOutlined/>}
            loading={adding}
          >
            Add Option
          </Button>
        </Form.Item>
      </Form>

      <Divider orientation="left">User Answers</Divider>

      <List
        loading={loadingAnswers}
        itemLayout="vertical"
        dataSource={answers}
        locale={{
          emptyText: 'No answers available for this question.',
        }}
        renderItem={(answer: Answer) => (
          <>
            {findAnswerOption(answer.answer_option_id) &&
                <List.Item
                    key={answer._id}
                  // extra={
                  //   answer.is_active ? (
                  //     <Tag color="green">Active</Tag>
                  //   ) : (
                  //     <Tag color="red">Inactive</Tag>
                  //   )
                  // }
                >
                  <List.Item.Meta
                      avatar={
                        <img
                          src={imageLinkGenerator(answer.created_by?.avatar, 'female.jpg') ?? ''}
                          alt={answer.created_by?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      }
                      title={<div>
                        <div>
                          <span className="capitalize">{answer.created_by?.name}</span>
                          <span style={{marginLeft: '12px', fontSize: '12px'}} className="text-gray-500">{answer.created_by?.email}</span>
                        </div>
                        {answer.createdAt &&
                            <div className="text-gray-500">
                              <small>{new Date(answer.createdAt).toLocaleString()}</small>
                            </div>
                        }
                      </div>
                      }
                      description={
                        <div>
                          <p className="text-black">Ans: {findAnswerOption(answer.answer_option_id) ?? 0}</p>
                          {answer.comment && <span>Comment: <span className="text-gray-600" dangerouslySetInnerHTML={{__html: answer.comment}}/></span>}
                        </div>
                      }
                  />
                </List.Item>
            }
          </>
        )}
      />
    </Modal>
  );
};

export default AnswersModal;

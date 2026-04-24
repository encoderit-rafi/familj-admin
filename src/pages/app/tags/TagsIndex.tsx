import React, {useEffect, useRef, useState} from 'react';
import {
  Popconfirm,
  type GetProp,
  type TableProps,
  Tooltip,
  Tag,
  Flex,
  Input,
  // theme,
  message
} from 'antd';
import type {SorterResult} from 'antd/es/table/interface';
import type {InputRef} from 'antd';
import {PlusOutlined} from '@ant-design/icons';

import {useDeleteHandler} from '../../../helpers/useDeleteHandler.ts';
import {useCanModule} from '../../../utils/can.ts';
import {useCommonMutations} from '../../../query/mutations/useCommonMutations.ts';
import mapErrors from '../../../utils/mapErrors.ts';
import {useGetQuery} from "../../../query/queries/useGetQuery.ts";

type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;

interface DataType {
  _id: string;
  name: string;
  status: string;
  featured: string;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult['field'];
  sortOrder?: SorterResult['order'];
  filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

const tagInputStyle: React.CSSProperties = {
  width: 64,
  height: 22,
  marginInlineEnd: 8,
  verticalAlign: 'top',
};

const tagPlusStyle: React.CSSProperties = {
  height: 22,
  // background: theme.useToken().token.colorBgContainer,
  borderStyle: 'dashed',
};

const Tags: React.FC = () => {
  const {canCreate, canUpdate, canDelete} = useCanModule('tags');

  // const [tableParams, setTableParams] = useState<TableParams>({
  const [tableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 50,
    },
  });

  const {
    data: tags = [],
    isLoading,
    refetch,
  } = useGetQuery('/tags', {
    page: tableParams.pagination?.current || 1,
    limit: tableParams.pagination?.pageSize || 50,
    sortField: tableParams.sortField || null,
    sortOrder: tableParams.sortOrder || null,
  });

  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);

  // const {token} = theme.useToken();

  const {onDelete, deleting} = useDeleteHandler({
    moduleName: 'tags',
    refetch,
    successMessage: 'Tag deleted successfully',
  });

  const {useCreateMutation, useUpdateMutation} = useCommonMutations<any>('tags');
  const createMutation = useCreateMutation();
  const updateMutation = useUpdateMutation();

  useEffect(() => {
    refetch();
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams.sortField,
    tableParams.sortOrder,
    JSON.stringify(tableParams.filters),
  ]);

  useEffect(() => {
    if (inputVisible) inputRef.current?.focus();
  }, [inputVisible]);

  useEffect(() => {
    if (editInputIndex !== -1) editInputRef.current?.focus();
  }, [editInputIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (!inputValue.trim()) return;
    createMutation.mutate(
      {
        name: inputValue.trim(),
        status: 'active',
        featured: false,
      },
      {
        onSuccess: () => {
          refetch?.();
          setInputVisible(false);
          setInputValue('');
        },
        onError: (error: any) => {
          const {message: errorMessage} = mapErrors(error);
          message.error(errorMessage);
        },
      }
    );
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value);
  };

  const handleEditInputConfirm = (_id: string) => {
    if (!editInputValue.trim()) {
      setEditInputIndex(-1);
      return;
    }
    updateMutation.mutate(
      {
        _id,
        name: editInputValue.trim(),
        status: 'active',
        featured: false,
      },
      {
        onSuccess: () => {
          refetch?.();
          setEditInputIndex(-1);
          setEditInputValue('');
        },
        onError: (error: any) => {
          const {message: errorMessage} = mapErrors(error);
          message.error(errorMessage);
        },
      }
    );
  };

  const showInput = () => setInputVisible(true);

  return (
    <Flex gap="4px 0" wrap>
      {isLoading ? <div>Loading...</div> : null}
      {tags.map((tag: DataType, index: number) => {
        const isEditing = index === editInputIndex;
        const isLongTag = tag.name.length > 20;

        if (isEditing) {
          return (
            <Input
              ref={editInputRef}
              key={tag._id}
              size="large"
              style={tagInputStyle}
              value={editInputValue}
              onChange={handleEditInputChange}
              onBlur={() => handleEditInputConfirm(tag._id)}
              onPressEnter={() => handleEditInputConfirm(tag._id)}
            />
          );
        }

        const tagElement = (
          <Popconfirm
            title="Are you sure to delete this tag?"
            // onConfirm={() => onDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tag
              key={tag._id}
              closable={canDelete && deleting !== tag._id}
              style={{userSelect: 'none', position: 'relative', opacity: deleting === tag._id ? 0.5 : 1}}
              color={tag.status === 'active' ? 'green' : 'red'}
              onClose={() => onDelete(tag._id)}
              className="flex items-center justify-center"
            >
                        <span
                          onDoubleClick={(e) => {
                            if (canUpdate) {
                              setEditInputIndex(index);
                              setEditInputValue(tag.name);
                              e.preventDefault();
                            }
                          }}
                        >
                            {isLongTag ? `${tag.name.slice(0, 20)}...` : tag.name}
                        </span>
            </Tag>
          </Popconfirm>
        );

        return isLongTag ? (
          <Tooltip title={tag.name} key={tag._id}>
            {tagElement}
          </Tooltip>
        ) : (
          tagElement
        );
      })}

      {canCreate && inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="large"
          style={tagInputStyle}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        canCreate && (
          <Tag style={tagPlusStyle} icon={<PlusOutlined/>} onClick={showInput}>
            New Tag
          </Tag>
        )
      )}
    </Flex>
  );
};

export default Tags;

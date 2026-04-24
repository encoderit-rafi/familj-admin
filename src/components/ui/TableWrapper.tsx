import React from 'react';
import {Table, Typography, Divider, Flex, Input} from 'antd';
import type {TableProps} from 'antd';
import type {ColumnsType} from 'antd/es/table';

const {Title} = Typography;
const {Search} = Input;

type TableWrapperProps<T> = {
  title?: string;
  columns: ColumnsType<T>;
  data: T[];
  loading: boolean;
  pagination?: TableProps<T>['pagination'];
  onChange?: TableProps<T>['onChange'];
  rowKey: string | ((record: T) => string);
  actions?: React.ReactNode;
  onSearch?: (value: string) => void;
  filters?: React.ReactNode; // NEW: Add filters prop
  rowSelection?: TableProps<T>['rowSelection'];
};

function TableWrapper<T extends object>({
                                          title,
                                          columns,
                                          data,
                                          loading,
                                          pagination,
                                          onChange,
                                          rowKey,
                                          actions,
                                          onSearch,
                                          filters, // NEW
                                          rowSelection,
                                        }: TableWrapperProps<T>) {
  return (
      <div>
        {title && <Title level={4}>{title}</Title>}
        <Flex justify="space-between" align="start" style={{marginBottom: 16, flexWrap: 'wrap', columnGap: 100, rowGap: 10}}>
          <Flex gap={8} style={{flexGrow: 1, flexWrap: 'wrap'}}>
            {onSearch && (
                <Search
                    placeholder="Search here..."
                    allowClear
                    onChange={(e) => onSearch(e.target.value)}
                    onSearch={onSearch}
                    style={{minWidth: 100, width: 250}}
                />
            )}
            {filters && filters}
          </Flex>
          {actions && <div>{actions}</div>}
        </Flex>
        <Divider plain/>
        <Table<T>
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={pagination}
            onChange={onChange}
            rowKey={rowKey}
            rowSelection={rowSelection}
            scroll={{x: 'max-content'}}
        />
      </div>
  );
}

export default TableWrapper;

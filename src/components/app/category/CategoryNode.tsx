import React, { useRef, useState } from 'react';
import { Button, Popconfirm, Tooltip, theme } from 'antd';
import { DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';

interface Category {
  _id: string;
  name: string;
  children?: Category[];
}

interface CategoryNodeProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  deleting: string | null;
  canUpdate: boolean;
  canDelete: boolean;
  onDragStart?: (id: string) => void;
  onDrop?: (draggedId: string, targetId: string) => void;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  category,
  onEdit,
  onDelete,
  deleting,
  canUpdate,
  canDelete,
  onDragStart,
  onDrop,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const { token } = theme.useToken();
  const dragRef = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', category._id);
    dragRef.current = category._id;
    onDragStart?.(category._id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== category._id) {
      onDrop?.(draggedId, category._id);
    }
  };

  const handleDragEnd = () => {
    setIsDragOver(false);
    dragRef.current = null;
  };

  return (
    <div
      style={{
        marginLeft: 20,
        borderLeft: `1px dashed ${token.colorBorderSecondary}`,
        paddingLeft: 10,
      }}
    >
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        style={{
          background: isDragOver ? token.colorPrimaryBg : token.colorBgContainer,
          color: token.colorText,
          margin: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: token.borderRadius,
          transition: 'background 0.2s, border 0.2s',
          cursor: 'grab',
          border: isDragOver
            ? `2px dashed ${token.colorPrimary}`
            : `2px solid transparent`,
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isDragOver)
            (e.currentTarget.style.background = token.colorFillSecondary);
        }}
        onMouseLeave={(e) => {
          if (!isDragOver)
            (e.currentTarget.style.background = token.colorBgContainer);
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Drag handle */}
          <HolderOutlined
            style={{
              fontSize: 14,
              color: token.colorTextTertiary,
              cursor: 'grab',
              flexShrink: 0,
            }}
          />

          {category.children && category.children.length > 0 && (
            <Button
              size="small"
              type="text"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              style={{ color: token.colorText }}
            >
              {expanded ? '-' : '+'}
            </Button>
          )}
          <span style={{ textTransform: 'capitalize' }}>{category.name}</span>
        </div>

        <div>
          {canUpdate && (
            <Tooltip title="Edit">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                disabled={deleting === category._id}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(category);
                }}
              />
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure to delete this category?"
                onConfirm={() => onDelete(category._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleting === category._id}
                  disabled={deleting === category._id}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </div>
      </div>

      {expanded && category.children && category.children.length > 0 && (
        <div style={{ marginTop: 5 }}>
          {category.children.map((child) => (
            <CategoryNode
              key={child._id}
              category={child}
              onEdit={onEdit}
              onDelete={onDelete}
              deleting={deleting}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onDragStart={onDragStart}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryNode;

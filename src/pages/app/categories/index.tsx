import React, { useEffect, useRef, useState } from 'react';
import { Button, Divider, Flex, Skeleton, Tooltip, Typography, message } from 'antd';
import CategoryForm from '../../../components/app/category/CategoryForm.tsx';
import { useGetCategories } from '../../../query/queries/useCategoryQuery.ts';
import { ReloadOutlined } from '@ant-design/icons';
import { useDeleteHandler } from '../../../helpers/useDeleteHandler.ts';
import CategoryNode from '../../../components/app/category/CategoryNode.tsx';
import { useCanModule } from '../../../utils/can.ts';
import { useReorderCategoriesMutation } from '../../../query/mutations/useCategoryReorderMutation.ts';

interface Category {
    _id: string;
    name: string;
    children?: Category[];
}

/** Recursively find which list (root or children) contains the given id */
function findSiblings(tree: Category[], id: string): Category[] | null {
    for (const node of tree) {
        if (node._id === id) return tree;
        if (node.children && node.children.length > 0) {
            const result = findSiblings(node.children, id);
            if (result) return result;
        }
    }
    return null;
}

/** Move `draggedId` just before `targetId` within their shared parent list */
function reorderTree(tree: Category[], draggedId: string, targetId: string): Category[] {
    // Deep clone so we don't mutate state directly
    const cloned: Category[] = JSON.parse(JSON.stringify(tree));

    const siblings = findSiblings(cloned, draggedId);
    const targetSiblings = findSiblings(cloned, targetId);

    // Both must share the same parent list for a valid drop
    if (!siblings || !targetSiblings || siblings !== targetSiblings) return cloned;

    const fromIndex = siblings.findIndex((c) => c._id === draggedId);
    const toIndex = siblings.findIndex((c) => c._id === targetId);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return cloned;

    const [item] = siblings.splice(fromIndex, 1);
    siblings.splice(toIndex, 0, item);

    return cloned;
}

const Categories: React.FC = () => {
    const { canCreate, canUpdate, canDelete } = useCanModule('categories');
    const { data: serverCategories = [], isLoading, refetch } = useGetCategories();
    const { mutate: reorder, isPending: isReordering } = useReorderCategoriesMutation();

    const { onDelete, deleting } = useDeleteHandler({
        moduleName: 'categories',
        refetch,
        successMessage: 'Category deleted successfully',
    });

    const [selectedCategory, setSelectedCategory] = useState({});
    const [categories, setCategories] = useState<Category[]>([]);
    const draggedIdRef = useRef<string | null>(null);

    // Sync local tree whenever server data changes
    useEffect(() => {
        setCategories(serverCategories);
    }, [serverCategories]);

    useEffect(() => {
        refetch();
    }, []);

    const handleDragStart = (id: string) => {
        draggedIdRef.current = id;
    };

    const handleDrop = (draggedId: string, targetId: string) => {
        if (draggedId === targetId) return;

        // Find the shared sibling list before reordering
        const siblings = findSiblings(categories, draggedId);
        const targetSiblings = findSiblings(categories, targetId);

        if (!siblings || !targetSiblings || siblings !== targetSiblings) {
            message.warning('You can only reorder items within the same level.');
            return;
        }

        // Optimistic UI update
        const reordered = reorderTree(categories, draggedId, targetId);
        setCategories(reordered);

        // Build the items payload using the sibling list's new order
        const updatedSiblings = findSiblings(reordered, draggedId) ?? [];
        const items = updatedSiblings.map((cat, index) => ({
            _id: cat._id,
            order: index + 1,
        }));

        reorder(
            { items },
            {
                onSuccess: () => {
                    message.success('Order updated');
                    refetch();
                },
                onError: () => {
                    message.error('Failed to update order. Reverting...');
                    // Roll back to server data
                    setCategories(serverCategories);
                },
            }
        );

        draggedIdRef.current = null;
    };

    return (
        <div>
            <Typography.Title level={4}>Categories</Typography.Title>
            <Flex
                justify="space-between"
                align="start"
                style={{ marginBottom: 16, flexWrap: 'wrap', columnGap: 100, rowGap: 10 }}
            >
                <div className="flex-1 flex flex-wrap gap-2 items-center" />

                <Flex wrap gap="middle" justify="center" align="center">
                    <Tooltip title="Reload">
                        <Button
                            type="default"
                            icon={<ReloadOutlined />}
                            onClick={() => refetch()}
                            loading={isLoading}
                        />
                    </Tooltip>
                    {canCreate && (
                        <CategoryForm
                            data={selectedCategory}
                            onClose={() => setSelectedCategory({})}
                            refetch={() => refetch()}
                        />
                    )}
                </Flex>
            </Flex>

            <Divider plain />

            <Skeleton loading={isLoading} active={true}>
                {isReordering && (
                    <div style={{ marginBottom: 8, color: '#999', fontSize: 12 }} className='text-center'>
                        Saving order...
                    </div>
                )}
                {categories.length > 0 &&
                    categories.map((category: Category) => (
                        <CategoryNode
                            key={category._id}
                            category={category}
                            onEdit={setSelectedCategory}
                            onDelete={onDelete}
                            deleting={deleting}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                        />
                    ))}
            </Skeleton>
        </div>
    );
};

export default Categories;

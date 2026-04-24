import { useMutation } from '@tanstack/react-query';
import { api } from '../../axios.ts';

interface ReorderItem {
    _id: string;
    order: number;
}

interface ReorderPayload {
    items: ReorderItem[];
}

export const useReorderCategoriesMutation = () => {
    return useMutation({
        mutationKey: ['/reorder-categories'],
        mutationFn: (payload: ReorderPayload) => api.post('/categories/reorder', payload),
    });
};

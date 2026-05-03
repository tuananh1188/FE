import { http } from './http';

export type Category = {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type CategoryPayload = {
    name: string;
    description?: string;
    image?: File; // File upload from computer
}

const buildFormData = (payload: CategoryPayload): FormData => {
    const fd = new FormData();
    fd.append('name', payload.name);
    if (payload.description) fd.append('description', payload.description);
    if (payload.image) fd.append('image', payload.image);
    return fd;
};

export const categoryApi = {
    getAll: () =>
        http.get<{ success: boolean; count: number; data: Category[] }>('categories'),

    getById: (id: string) =>
        http.get<{ success: boolean; data: Category }>(`categories/${id}`),

    create: (payload: CategoryPayload) =>
        http.post<{ success: boolean; data: Category }>('categories', buildFormData(payload), {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    update: (id: string, payload: CategoryPayload) =>
        http.put<{ success: boolean; data: Category }>(`categories/${id}`, buildFormData(payload), {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    delete: (id: string) =>
        http.delete<{ success: boolean }>(`categories/${id}`),
};

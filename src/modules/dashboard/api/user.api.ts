import { http } from '@/shared/api/http';

export type UserResponse = {
  _id: string;
  email: string;
  isEmailVerified: boolean;
  displayName?: string;
  phone?: string;
  role: 'user' | 'admin';
  createdAt: string;
};

export const adminUserApi = {
  getAllUsers: () => http.get<{ success: boolean; data: UserResponse[] }>('/users'),
  updateUserRole: (id: string, role: 'user' | 'admin') =>
    http.patch<{ success: boolean; data: UserResponse }>(`/users/${id}/role`, { role }),
};

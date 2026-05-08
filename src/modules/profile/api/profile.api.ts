import { http } from '@/shared/api/http';

export const profileApi = {
  updateProfile: (data: { displayName?: string; bio?: string; phone?: string }) =>
    http.patch('profile', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return http.post('profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Address Book
  addAddress: (data: any) => http.post('profile/addresses', data),
  updateAddress: (id: string, data: any) => http.patch(`profile/addresses/${id}`, data),
  deleteAddress: (id: string) => http.delete(`profile/addresses/${id}`),
  setDefaultAddress: (id: string) => http.patch(`profile/addresses/${id}/default`),
};

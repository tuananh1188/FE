import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Heart, MapPin } from 'lucide-react';
import { authApi } from '@/modules/auth/api/auth.api';
import { tokenStore } from '@/modules/auth/store/token.store';
import { AvatarUpload } from '@/modules/profile/components/AvatarUpload';
import { ProfileEditForm } from '@/modules/profile/components/ProfileEditForm';
import { OrderHistory } from '@/modules/profile/components/OrderHistory';
import { FavoriteList } from '@/modules/profile/components/FavoriteList';
import { AddressBook } from '@/modules/profile/components/AddressBook';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { CurrentUser } from '@/modules/auth/types/auth.types';

type ProfileUser = CurrentUser & {
  displayName?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  avatarUrl?: string;
  addresses?: any[];
};

export const ProfilePage = () => {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data.data as ProfileUser);
    } catch {
      tokenStore.clear();
      navigate('/logout');
    }
  };

  useEffect(() => {
    void fetchUser();
  }, []);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Cài đặt Tài khoản</h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý thông tin cá nhân và theo dõi đơn hàng của bạn.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left column — Profile Info & Form */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg font-bold">Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="flex-shrink-0">
                  <AvatarUpload
                    currentAvatarUrl={user?.avatarUrl}
                    userInitials={initials}
                    onUploadSuccess={(newUrl) => setUser((prev) => prev ? { ...prev, avatarUrl: newUrl } : prev)}
                  />
                  <div className="mt-4 text-center">
                    <p className="text-sm font-bold text-gray-900">{user?.displayName || 'Người dùng'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="flex-1 w-full">
                  {user ? (
                    <ProfileEditForm
                      defaultValues={{
                        displayName: user.displayName ?? '',
                        bio: user.bio ?? '',
                        phone: user.phone ?? '',
                      }}
                      onSuccess={fetchUser}
                    />
                  ) : (
                    <div className="flex items-center justify-center py-10">
                      <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — Order History */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="size-5 text-[#C83B1E]" />
              Lịch sử mua hàng
            </h2>
          </div>
          <OrderHistory />
        </div>

        {/* Address Book */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MapPin className="size-5 text-[#C83B1E]" />
                Sổ địa chỉ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {user ? (
                <AddressBook 
                  addresses={user.addresses || []} 
                  onUpdate={fetchUser} 
                />
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* New row or additional column for Favorites */}
        <div className="lg:col-span-12 space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Heart className="size-5 text-[#C83B1E] fill-[#C83B1E]" />
              Sản phẩm yêu thích
            </h2>
          </div>
          <FavoriteList />
        </div>
      </div>
    </div>
  );
};

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { profileApi } from '@/modules/profile/api/profile.api';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const schema = z.object({
  displayName: z.string().max(60, 'Tối đa 60 ký tự').optional(),
  bio: z.string().max(200, 'Tối đa 200 ký tự').optional(),
  phone: z.string().max(20, 'Tối đa 20 ký tự').optional(),
});

type FormValues = z.infer<typeof schema>;

interface ProfileEditFormProps {
  defaultValues: FormValues;
  onSuccess: () => void;
}

export const ProfileEditForm = ({ defaultValues, onSuccess }: ProfileEditFormProps) => {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const bioValue = watch('bio') ?? '';

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await profileApi.updateProfile(values);
      toast.success('Cập nhật hồ sơ thành công.');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Cập nhật hồ sơ thất bại.');
    } finally {
      setSaving(false);
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="displayName">Tên hiển thị</Label>
        <Input
          id="displayName"
          placeholder="Tên của bạn"
          {...register('displayName')}
        />
        {errors.displayName && (
          <p className="text-xs text-destructive">{errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio">Giới thiệu</Label>
          <span className="text-xs text-muted-foreground">{bioValue.length}/200</span>
        </div>
        <textarea
          id="bio"
          rows={3}
          placeholder="Chia sẻ một chút về bản thân bạn..."
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register('bio')}
        />
        {errors.bio && (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input
          id="phone"
          placeholder="09xx xxx xxx"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
      </Button>
    </form>
  );
};

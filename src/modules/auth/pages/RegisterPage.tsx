import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../api/auth.api';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { OtpInput } from '@/shared/components/ui/otp-input';

const registerSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập Email').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type FormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
  });
  const navigate = useNavigate();

  const onRegisterSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      await authApi.register({ email: values.email, password: values.password });
      setEmail(values.email);
      setStep('verify');
      toast.success('Mã OTP đã được gửi đến email của bạn.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  });

  const onVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      await authApi.verifyRegisterOtp(email, otp);
      toast.success('Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Mã OTP không hợp lệ');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Xác nhận OTP</CardTitle>
          <CardDescription>
            Nhập mã 6 chữ số đã được gửi đến <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onVerifySubmit}>
            <OtpInput value={otp} onChange={setOtp} />
            <Button className="w-full" type="submit" disabled={otp.length !== 6 || loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Xác thực OTP
            </Button>
            <button
              type="button"
              onClick={() => { setStep('register'); setOtp(''); }}
              className="block w-full text-center text-sm text-muted-foreground transition hover:text-foreground"
            >
              Quay lại đăng ký
            </button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo tài khoản</CardTitle>
        <CardDescription>Đăng ký bằng email và mật khẩu của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onRegisterSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" className="pl-9" placeholder="ten@vidu.com" autoComplete="email" {...register('email')} />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" className="pl-9" type="password" placeholder="Ít nhất 6 ký tự" autoComplete="new-password" {...register('password')} />
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Đăng ký và Gửi mã OTP
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

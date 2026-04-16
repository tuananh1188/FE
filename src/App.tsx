import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { RegisterPage } from '@/modules/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage';
import { LogoutPage } from '@/modules/auth/pages/LogoutPage';
import { HomePage } from '@/modules/home/pages/HomePage';
import { ProfilePage } from '@/modules/profile/pages/ProfilePage';
import DashboardPage from './modules/dashboard/DashboardPage';
import DashboardLayout from './modules/dashboard/components/DashboardLayout';
import AdminProductsPage from './modules/dashboard/AdminProductsPage';
import ProductPage from './modules/products/ProductPage';

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route path="/logout" element={<LogoutPage />} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
      </Route>


      {/* Protected routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/me" element={<Navigate to="/profile" replace />} />
        {/* Category routes */}
        <Route path="/categories" element={<ProductPage />} />
        <Route path="/categories/:slug" element={<ProductPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, LogOut, Search, ShoppingCart, Bell, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';
import { authApi } from '@/modules/auth/api/auth.api';
import { tokenStore } from '@/modules/auth/store/token.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';
import type { CurrentUser } from '@/modules/auth/types/auth.types';
import { useCart } from '@/shared/context/CartContext';

export const AppLayout = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartTotalCount } = useCart();

  useEffect(() => {
    const token = tokenStore.get();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.role === 'admin');
      } catch (e) {
        // ignore
      }
    }
    authApi.getMe()
      .then((res) => setUser(res.data as CurrentUser))
      .catch(() => {
        tokenStore.clear();
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    tokenStore.clear();
    navigate('/login');
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-[#C83B1E] font-bold text-xl leading-none">
              The Editorial<br /><span className="text-sm font-light">Marketplace</span>
            </h1>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className="pl-10 bg-muted/50 border-none rounded-full h-9" placeholder="Search curated collections..." />
          </div>

          {/* Home Link */}
          <Link
            to="/"
            className={cn(
              'hidden sm:inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
              location.pathname === '/'
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Home className="size-4" />
            <span className="hidden lg:inline">Home</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-muted-foreground">
            <a href="#" className="text-[#C83B1E]">Flash Sales</a>
            <Link to="/categories" className={cn('hover:text-foreground', location.pathname.startsWith('/categories') && 'text-foreground font-semibold')}>Categories</Link>
            <a href="#" className="hover:text-foreground">Brands</a>
            <a href="#" className="hover:text-foreground">Vouchers</a>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Shopping & Notifications */}
            <div className="flex items-center gap-3 mr-2">
              <Link to="/cart" className="relative cursor-pointer text-muted-foreground hover:text-foreground">
                <ShoppingCart className="size-5" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#C83B1E] text-white text-[10px] rounded-full size-4 flex items-center justify-center">
                    {cartTotalCount}
                  </span>
                )}
              </Link>
              <Bell className="size-5 cursor-pointer text-muted-foreground hover:text-foreground" />
            </div>

            {/* User actions */}
            <div className="flex items-center gap-1 sm:gap-2 pl-2 border-l border-border">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors border border-orange-200 shadow-sm"
                >
                  <LayoutDashboard className="size-4" />
                  <span>Dashboard</span>
                </Link>
              )}
              <ThemeToggle />
              <Link
                to="/profile"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                  location.pathname === '/profile'
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <User className="size-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <Avatar className="size-8">
                <AvatarImage src={user?.avatarUrl} alt={user?.email} referrerPolicy="no-referrer" crossOrigin="anonymous" />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground hover:text-foreground px-2">
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 w-full flex-1">
        <Outlet />
      </main>
    </div>
  );
};

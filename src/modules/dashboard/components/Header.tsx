import { useLocation } from 'react-router-dom';
import { Bell, HelpCircle } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/products': 'Product Management',
    '/admin/orders': 'Orders',
    '/admin/users': 'Users',
    '/admin/reports': 'Reports',
    '/admin/settings': 'Settings',
};

const Header: React.FC = () => {
    const { pathname } = useLocation();
    const title = PAGE_TITLES[pathname] ?? 'Admin';

    return (
        <header className="flex items-center justify-between mb-8">
            {/* Page title */}
            <div>
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-5 text-gray-500">
                <span className="text-xs font-bold tracking-widest cursor-pointer hover:text-gray-800 transition-colors">
                    SUPPORT
                </span>

                <div className="relative cursor-pointer hover:text-gray-800 transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-600 rounded-full border-2 border-white" />
                </div>

                <HelpCircle size={20} className="cursor-pointer hover:text-gray-800 transition-colors" />

                {/* User profile */}
                <div className="flex items-center gap-2 cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm">
                        A
                    </div>
                    <span className="text-sm font-medium text-gray-700">Admin</span>
                </div>
            </div>
        </header>
    );
};

export default Header;

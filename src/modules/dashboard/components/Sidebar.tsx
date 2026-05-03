import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ShoppingBag, ShoppingCart, User,
    BarChart3, Settings, Zap, LogOut, ExternalLink, LayoutGrid
} from 'lucide-react';

const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', to: '/admin' },
    { icon: <ShoppingBag size={20} />, label: 'Products', to: '/admin/products' },
    { icon: <LayoutGrid size={20} />, label: 'Categories', to: '/admin/categories' },
    { icon: <ShoppingCart size={20} />, label: 'Orders', to: '/admin/orders' },
    { icon: <User size={20} />, label: 'Users', to: '/admin/users' },
    { icon: <BarChart3 size={20} />, label: 'Reports', to: '/admin/reports' },
    { icon: <Settings size={20} />, label: 'Settings', to: '/admin/settings' },
];

export default function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col p-6 fixed left-0 top-0">
            {/* Brand */}
            <div className="flex items-center gap-2 mb-10">
                <div className="w-10 h-10 bg-orange-600 rounded-lg p-1.5 flex items-center justify-center">
                    <Zap size={20} color="white" fill="white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-800 leading-none">Vitality Admin</h1>
                    <span className="text-xs text-gray-400">Manage your store</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/admin'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-sm ${isActive
                                ? 'bg-orange-50 text-orange-600 font-semibold'
                                : 'text-gray-600 hover:bg-gray-50 font-medium'
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-1">
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 text-orange-600 hover:bg-orange-50 rounded-xl cursor-pointer transition-colors text-sm font-medium"
                >
                    <ExternalLink size={20} />
                    <span>View Store</span>
                </a>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors text-sm font-medium w-full"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
import { LayoutDashboard, ShoppingBag, User, ShoppingCart, Settings, BarChart3, Zap, LogOut, ExternalLink } from "lucide-react";

const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", active: true },
    { icon: <ShoppingBag size={20} />, label: "Products" },
    { icon: <ShoppingCart size={20} />, label: "Orders" },
    { icon: <User size={20} />, label: "Users" },
    { icon: <BarChart3 size={20} />, label: "Reports" },
    { icon: <Settings size={20} />, label: "Settings" },
]

export default function Sidebar() {
    return (
        <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col p-6 fixed left-0 top-0">
            <div className="flex items-center gap-2 mb-10">
                <div className="w-10 h-10 bg-orange-600 rounded-lg p-1.5">
                    <Zap size={20} color="white" fill="white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-800 leading-none">Vitality Admin</h1>
                    <span className="text-xs text-gray-400">Manage your store</span>
                </div>
            </div>
            <nav className="flex-1 space-y-2">
                {menuItems.map((item, index) => (
                    <div key={index} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${item.active ? "bg-orange-50 text-orange-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                    </div>
                ))}
            </nav>
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-1">
                <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 text-orange-600 hover:bg-orange-50 rounded-lg cursor-pointer transition-colors">
                    <ExternalLink size={20} />
                    <span className="font-medium">View Store</span>
                </a>
                <div className="flex items-center gap-3 p-3 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors ">
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </div>
            </div>
        </div>
    );
}
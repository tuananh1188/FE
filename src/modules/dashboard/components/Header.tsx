import { Input } from "antd";
import { Search, Bell, HelpCircle } from "lucide-react";

const Header: React.FC = () => {
    return (
        <header className="flex items-center justify-between mb-8">
            {/* Search bar */}
            <div className="w-1/2">
                <Input prefix={<Search size={18} className="text-gray-400" mr-2 />} placeholder="Search insights, orders, or data..." className="rounded-xl h-11 border-none bg-white shadow-sm hover:shadow-md transition-shadow" />
            </div>

            {/*Right Actions */}
            <div className="flex items-center gap-6 text-gray-500">
                <span className="text-xs font-bold tracking-widest cursor-pointer hover:text-gray-800 transition-colors">SUPPORT</span>
                <div className="relative cursor-pointer hover: text-gray-800 transition-colors">
                    <Bell size={20} />
                    {/* Notification dot */}
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-600 rounded-full border-2 border-white"></span>
                </div>
                <HelpCircle size={20} className="cursor-pointer hover: text-gray-800 transition-colors" />
                {/* User profile */}
                <div className="flex items-center gap-2 cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                        <img src="" alt="User Avatar" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium">Admin</span>
                </div>
            </div>
        </header>
    )
}

export default Header;

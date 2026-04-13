import { Layout, Menu } from "antd";
import { LayoutDashboard } from "lucide-react";

const {Sider} = Layout;
export const Sidebar = () => (
    <Sider width={260} theme="light" className="border-r hidden lg:block h-screen sticky top-0">
        <div className="p-6 flex items-center gap-2 mb-4">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white flex items-center justify-center">
                <LayoutDashboard size={20}/>
            </div>
            <span className="font-bold text-lg tracking-tight">Vitality Admin</span>
        </div>
        <Menu/>
    </Sider>
)
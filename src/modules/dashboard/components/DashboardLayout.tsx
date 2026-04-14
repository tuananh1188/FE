import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const DashboardLayout: React.FC = () => {
    return (
        <div className='flex bg-[#f9fafb] min-h-screen'>
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <Header />
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;

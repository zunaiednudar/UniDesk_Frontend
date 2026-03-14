import React from 'react';
import DashboardLayout from '../../Layouts/DashboardLayout/DashboardLayout.jsx';
import {
    BookSearch,
    ChartPie,
    UserCog
} from "lucide-react";

const AdminDashboard = () => {
    const adminMenuItems = [
        {
            id: 'overview',
            icon: <ChartPie className="w-5 h-5" />,
            label: 'Overview',
            path: '/dashboard/admin/overview'
        },
        {
            id: 'users',
            icon: <UserCog className="w-5 h-5" />,
            label: 'Manage Users',
            path: '/dashboard/admin/users'
        },
        {
            id: 'mentorship',
            icon: <BookSearch className="w-5 h-5" />,
            label: 'Manage Mentorship',
            path: '/dashboard/admin/mentorship'
        },
    ];

    return <DashboardLayout menuItems={adminMenuItems} role="admin" />
};

export default AdminDashboard;

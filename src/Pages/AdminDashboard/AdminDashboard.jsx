import React from 'react';
import DashboardLayout from '../../Layouts/DashboardLayout/DashboardLayout.jsx';
import {
    ChartPie,
    UserCog,
    BookOpen
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
            id: 'courses',
            icon: <BookOpen className="w-5 h-5" />,
            label: 'Manage Courses',
            path: '/dashboard/admin/courses'
        },
    ];

    return <DashboardLayout menuItems={adminMenuItems} role="admin" />
};

export default AdminDashboard;

import React from 'react';
import DashboardLayout from '../../Layouts/DashboardLayout/DashboardLayout.jsx';
import {
    Activity,
    BookOpen,
    FolderKanban,
    ClipboardCheck,
    MessageCircleQuestion
} from "lucide-react";

const StudentDashboard = () => {
    const studentMenuItems = [
        {
            id: 'activity',
            icon: <Activity className="w-5 h-5" />,
            label: 'My Activity',
            path: '/dashboard/activity'
        },
        {
            id: 'courses',
            icon: <BookOpen className="w-5 h-5" />,
            label: 'My Courses',
            path: '/dashboard/courses'
        },
        {
            id: 'projects',
            icon: <FolderKanban className="w-5 h-5" />,
            label: 'My Projects',
            path: '/dashboard/projects'
        },
        {
            id: 'assignments',
            icon: <ClipboardCheck className="w-5 h-5" />,
            label: 'My Assignments',
            path: '/dashboard/assignments'
        },
        {
            id: 'mentor',
            icon: <MessageCircleQuestion className="w-5 h-5" />,
            label: 'Ask Mentor',
            path: '/dashboard/mentor'
        }
    ];

    return <DashboardLayout menuItems={studentMenuItems} userRole="student" />
};

export default StudentDashboard;
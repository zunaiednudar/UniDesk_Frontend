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
            label: 'Activity',
            path: '/dashboard/student/activity'
        },
        {
            id: 'courses',
            icon: <BookOpen className="w-5 h-5" />,
            label: 'Courses',
            path: '/dashboard/student/courses'
        },
        // {
        //     id: 'projects',
        //     icon: <FolderKanban className="w-5 h-5" />,
        //     label: 'Projects',
        //     path: '/dashboard/student/projects'
        // },
        {
            id: 'assessments',
            icon: <ClipboardCheck className="w-5 h-5" />,
            label: 'Assessments',
            path: '/dashboard/student/assessments'
        },
        {
            id: 'mentor',
            icon: <MessageCircleQuestion className="w-5 h-5" />,
            label: 'Ask Mentor',
            path: '/dashboard/student/ask-mentor'
        }
    ];

    return <DashboardLayout menuItems={studentMenuItems} role="student" />
};

export default StudentDashboard;

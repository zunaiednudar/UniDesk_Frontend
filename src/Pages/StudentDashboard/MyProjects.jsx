import React, { useState } from 'react';
import { FolderKanban, Search, Users, Calendar, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

const MyProjects = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const stats = {
        totalProjects: 6,
        inProgress: 3,
        completed: 1,
        avgProgress: 63
    };

    const projects = [
        {
            id: 1,
            title: 'E-Commerce Platform Development',
            course: 'CSE 3220',
            courseName: 'Software Engineering',
            description: 'Build a full-stack e-commerce platform with user authentication, product catalog and payment integration',
            dueDate: 'Jun 25, 2026',
            teamSize: 4,
            tasks: { completed: 13, total: 20 },
            progress: 65,
            priority: 'high',
            status: 'in-progress',
            team: [
                { id: 1, name: 'John Doe', avatar: 'JD' },
                { id: 2, name: 'Jane Smith', avatar: 'JS' },
                { id: 3, name: 'Mike Johnson', avatar: 'MJ' },
                { id: 4, name: 'Sarah Williams', avatar: 'SW' }
            ]
        },
        {
            id: 2,
            title: 'University Database Management System',
            course: 'CSE 3210',
            courseName: 'Database Systems',
            description: 'Design and implement a comprehensive database system for university student and course management',
            dueDate: 'Jun 20, 2026',
            teamSize: 3,
            tasks: { completed: 12, total: 15 },
            progress: 78,
            priority: 'high',
            status: 'in-progress',
            team: [
                { id: 1, name: 'Alice Brown', avatar: 'AB' },
                { id: 2, name: 'Bob Wilson', avatar: 'BW' },
                { id: 3, name: 'Carol Davis', avatar: 'CD' }
            ]
        },
        {
            id: 3,
            title: 'Network Traffic Analyzer',
            course: 'CSE 3230',
            courseName: 'Computer Networks',
            description: 'Develop a tool to capture and analyze network packets with visualization of traffic patterns',
            dueDate: 'Feb 5, 2026',
            teamSize: 3,
            tasks: { completed: 5, total: 12 },
            progress: 42,
            priority: 'medium',
            status: 'in-progress',
            team: [
                { id: 1, name: 'David Lee', avatar: 'DL' },
                { id: 2, name: 'Emma White', avatar: 'EW' },
                { id: 3, name: 'Frank Miller', avatar: 'FM' }
            ]
        },
        {
            id: 4,
            title: 'Custom Shell Implementation',
            course: 'CSE 3240',
            courseName: 'Operating Systems',
            description: 'Create a custom Unix shell with process management and file system operations',
            dueDate: 'Jun 15, 2026',
            teamSize: 2,
            tasks: { completed: 10, total: 10 },
            progress: 85,
            priority: 'medium',
            status: 'review',
            team: [
                { id: 1, name: 'George Taylor', avatar: 'GT' },
                { id: 2, name: 'Hannah Moore', avatar: 'HM' }
            ]
        },
        {
            id: 5,
            title: 'Sorting Algorithm Visualizer',
            course: 'CSE 3250',
            courseName: 'Algorithm Analysis',
            description: 'Interactive web application to visualize different sorting algorithms with performance metrics',
            dueDate: 'Dec 20, 2025',
            teamSize: 3,
            tasks: { completed: 8, total: 8 },
            progress: 100,
            priority: 'low',
            status: 'completed',
            team: [
                { id: 1, name: 'Ian Clark', avatar: 'IC' },
                { id: 2, name: 'Julia King', avatar: 'JK' },
                { id: 3, name: 'Kevin Scott', avatar: 'KS' }
            ]
        },
        {
            id: 6,
            title: 'AI Chatbot with NLP',
            course: 'CSE 3260',
            courseName: 'Artificial Intelligence',
            description: 'Build an intelligent chatbot using natural language processing and machine learning techniques',
            dueDate: 'Feb 28, 2026',
            teamSize: 4,
            tasks: { completed: 0, total: 18 },
            progress: 0,
            priority: 'high',
            status: 'not-started',
            team: [
                { id: 1, name: 'Laura Adams', avatar: 'LA' },
                { id: 2, name: 'Mark Baker', avatar: 'MB' },
                { id: 3, name: 'Nina Carter', avatar: 'NC' },
                { id: 4, name: 'Oscar Evans', avatar: 'OE' }
            ]
        }
    ];

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.courseName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadgeClass = (status) => {
        const classes = {
            'in-progress': 'bg-blue-100 text-blue-700',
            'completed': 'bg-green-100 text-green-700',
            'review': 'bg-purple-100 text-purple-700',
            'not-started': 'bg-gray-100 text-gray-700'
        };
        return classes[status] || 'bg-gray-100 text-gray-700';
    };

    const getPriorityBadgeClass = (priority) => {
        const classes = {
            high: 'bg-red-100 text-red-700',
            medium: 'bg-orange-100 text-orange-700',
            low: 'bg-green-100 text-green-700'
        };
        return classes[priority] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FolderKanban className="w-8 h-8 text-blue-600" />
                        My Projects
                    </h1>
                    <p className="text-gray-600 mt-1">Track and manage your course projects</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-sm font-medium text-gray-600 mb-2">Total Projects</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalProjects}</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-sm font-medium text-gray-600 mb-2">In Progress</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-sm font-medium text-gray-600 mb-2">Completed</div>
                    <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-sm font-medium text-gray-600 mb-2">Avg Progress</div>
                    <div className="text-3xl font-bold text-purple-600">{stats.avgProgress}%</div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="review">Review</option>
                        <option value="not-started">Not Started</option>
                    </select>
                </div>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
                {filteredProjects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-start gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getPriorityBadgeClass(project.priority)}`}>
                    {project.priority} priority
                  </span>
                                </div>
                                <p className="text-sm text-blue-600 font-medium mb-2">
                                    {project.course} - {project.courseName}
                                </p>
                                <p className="text-sm text-gray-600">{project.description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div>
                                    <div className="text-xs text-gray-500">Due Date</div>
                                    <div className="font-medium text-gray-900">{project.dueDate}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-gray-400" />
                                <div>
                                    <div className="text-xs text-gray-500">Team Size</div>
                                    <div className="font-medium text-gray-900">{project.teamSize} members</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-gray-400" />
                                <div>
                                    <div className="text-xs text-gray-500">Tasks</div>
                                    <div className="font-medium text-gray-900">
                                        {project.tasks.completed}/{project.tasks.total}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Progress
                </span>
                                <span className="text-sm font-bold text-gray-900">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Team:</span>
                                <div className="flex -space-x-2">
                                    {project.team.map((member) => (
                                        <div
                                            key={member.id}
                                            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold border-2 border-white"
                                            title={member.name}
                                        >
                                            {member.avatar}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyProjects;

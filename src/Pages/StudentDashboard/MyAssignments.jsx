import React, { useState } from 'react';
import { ClipboardCheck, Search, Upload, Download, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const MyAssignments = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const stats = {
        total: 8,
        pending: 3,
        submitted: 1,
        graded: 2,
        avgGrade: 86
    };

    const assignments = [
        {
            id: 1,
            title: 'UML Class Diagram Design',
            course: 'CSE 3220',
            courseName: 'Software Engineering',
            description: 'Create a comprehensive UML class diagram for an online library management system',
            dueDate: 'Jun 10, 2026',
            grade: null,
            maxGrade: 100,
            status: 'pending'
        },
        {
            id: 2,
            title: 'Database Normalization Exercise',
            course: 'CSE 3210',
            courseName: 'Database Systems',
            description: 'Normalize the given database schema up to 3NF and explain each step',
            dueDate: 'Jun 9, 2026',
            submitted: 'Jun 8, 2026',
            grade: 90,
            maxGrade: 100,
            attachments: 2,
            status: 'submitted'
        },
        {
            id: 3,
            title: 'TCP/IP Protocol Analysis',
            course: 'CSE 3230',
            courseName: 'Computer Networks',
            description: 'Analyze and document the TCP/IP handshake process with packet captures',
            dueDate: 'Jun 12, 2026',
            grade: null,
            maxGrade: 100,
            status: 'pending'
        },
        {
            id: 4,
            title: 'Process Scheduling Algorithms',
            course: 'CSE 3240',
            courseName: 'Operating Systems',
            description: 'Implement and compare FCFS, SJF, and Round Robin scheduling algorithms',
            dueDate: 'Jun 7, 2026',
            submitted: 'Jun 6, 2026',
            grade: 92,
            maxGrade: 100,
            attachments: 2,
            status: 'graded'
        },
        {
            id: 5,
            title: 'Big-O Notation Analysis',
            course: 'CSE 3250',
            courseName: 'Algorithm Analysis',
            description: 'Analyze the time complexity of provided algorithms and prove using Big-O notation',
            dueDate: 'Dec 28, 2025',
            submitted: 'Dec 29, 2025',
            grade: 78,
            maxGrade: 100,
            attachments: 1,
            status: 'graded'
        },
        {
            id: 6,
            title: 'Search Algorithm Implementation',
            course: 'CSE 3260',
            courseName: 'Artificial Intelligence',
            description: 'Implement A* and Dijkstra\'s pathfinding algorithms with visualization',
            dueDate: 'Jun 15, 2026',
            grade: null,
            maxGrade: 100,
            status: 'pending'
        },
        {
            id: 7,
            title: 'SQL Query Optimization',
            course: 'CSE 3210',
            courseName: 'Database Systems',
            description: 'Optimize given SQL queries and explain the performance improvements',
            dueDate: 'Dec 20, 2025',
            submitted: null,
            grade: null,
            maxGrade: 100,
            status: 'missed'
        },
        {
            id: 8,
            title: 'Software Testing Report',
            course: 'CSE 3220',
            courseName: 'Software Engineering',
            description: 'Create comprehensive test cases for the provided application',
            dueDate: 'Jun 6, 2026',
            submitted: 'Jun 6, 2026',
            grade: 88,
            maxGrade: 100,
            attachments: 1,
            status: 'graded'
        }
    ];

    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.courseName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadgeClass = (status) => {
        const classes = {
            pending: 'bg-yellow-100 text-yellow-700',
            submitted: 'bg-blue-100 text-blue-700',
            graded: 'bg-green-100 text-green-700',
            missed: 'bg-red-100 text-red-700'
        };
        return classes[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Clock className="w-4 h-4" />,
            submitted: <Upload className="w-4 h-4" />,
            graded: <CheckCircle2 className="w-4 h-4" />,
            missed: <AlertCircle className="w-4 h-4" />
        };
        return icons[status];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ClipboardCheck className="w-8 h-8 text-blue-600" />
                        My Assignments
                    </h1>
                    <p className="text-gray-600 mt-1">Track and submit your course assignments</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-sm font-medium text-gray-600 mb-2">Total</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-sm font-medium text-gray-600 mb-2">Pending</div>
                    <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-sm font-medium text-gray-600 mb-2">Submitted</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.submitted}</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-sm font-medium text-gray-600 mb-2">Graded</div>
                    <div className="text-3xl font-bold text-green-600">{stats.graded}</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-sm font-medium text-gray-600 mb-2">Avg Grade</div>
                    <div className="text-3xl font-bold text-purple-600">{stats.avgGrade}%</div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search assignments..."
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
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="graded">Graded</option>
                        <option value="missed">Missed</option>
                    </select>
                </div>
            </div>

            {/* Assignments List */}
            <div className="space-y-4">
                {filteredAssignments.map((assignment) => (
                    <div
                        key={assignment.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-start gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadgeClass(assignment.status)}`}>
                    {getStatusIcon(assignment.status)}
                                        {assignment.status}
                  </span>
                                </div>
                                <p className="text-sm text-blue-600 font-medium mb-2">
                                    {assignment.course} - {assignment.courseName}
                                </p>
                                <p className="text-sm text-gray-600">{assignment.description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div>
                                    <div className="text-xs text-gray-500">Due Date</div>
                                    <div className="font-medium text-gray-900">{assignment.dueDate}</div>
                                </div>
                            </div>

                            {assignment.submitted && (
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Submitted</div>
                                        <div className="font-medium text-gray-900">{assignment.submitted}</div>
                                    </div>
                                </div>
                            )}

                            {assignment.grade !== null && (
                                <div className="flex items-center gap-2 text-sm">
                                    <ClipboardCheck className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Grade</div>
                                        <div className="font-medium text-gray-900">{assignment.grade}/{assignment.maxGrade}</div>
                                    </div>
                                </div>
                            )}

                            {assignment.attachments && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Download className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Attachments</div>
                                        <div className="font-medium text-gray-900">{assignment.attachments} file(s)</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {assignment.status === 'pending' && (
                            <button className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                <Upload className="w-4 h-4" />
                                Submit
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyAssignments;

import React, { useState } from 'react';
import { BookOpen, Search, Clock, Users, Award, TrendingUp } from 'lucide-react';

const MyCourses = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const stats = {
        totalCourses: 8,
        active: 6,
        completed: 1,
        avgProgress: 57
    };

    const courses = [
        {
            id: 1,
            code: 'CSE 3220',
            name: 'Software Engineering',
            instructor: 'Dr. Rahman',
            schedule: 'Sun, Tue 10:00 AM',
            students: 120,
            credits: 3,
            progress: 65,
            status: 'active'
        },
        {
            id: 2,
            code: 'CSE 3210',
            name: 'Database Systems',
            instructor: 'Prof. Ahmed',
            schedule: 'Mon, Wed 2:00 PM',
            students: 115,
            credits: 3,
            progress: 72,
            status: 'active'
        },
        {
            id: 3,
            code: 'CSE 3230',
            name: 'Computer Networks',
            instructor: 'Dr. Khan',
            schedule: 'Sun, Tue 1:00 PM',
            students: 110,
            credits: 3,
            progress: 58,
            status: 'active'
        },
        {
            id: 4,
            code: 'CSE 3240',
            name: 'Operating Systems',
            instructor: 'Prof. Islam',
            schedule: 'Mon, Wed 10:00 AM',
            students: 105,
            credits: 3,
            progress: 80,
            status: 'active'
        },
        {
            id: 5,
            code: 'CSE 3250',
            name: 'Algorithm Analysis',
            instructor: 'Dr. Hassan',
            schedule: 'Tue, Thu 11:00 AM',
            students: 125,
            credits: 3,
            progress: 45,
            status: 'active'
        },
        {
            id: 6,
            code: 'CSE 3260',
            name: 'Artificial Intelligence',
            instructor: 'Prof. Karim',
            schedule: 'Sun, Tue 3:00 PM',
            students: 98,
            credits: 3,
            progress: 38,
            status: 'active'
        },
        {
            id: 7,
            code: 'CSE 2210',
            name: 'Data Structures',
            instructor: 'Dr. Ali',
            schedule: 'Mon, Wed 9:00 AM',
            students: 130,
            credits: 3,
            progress: 100,
            status: 'completed'
        },
        {
            id: 8,
            code: 'CSE 3270',
            name: 'Machine Learning',
            instructor: 'Prof. Noor',
            schedule: 'Sun, Tue 2:00 PM',
            students: 95,
            credits: 3,
            progress: 0,
            status: 'upcoming'
        }
    ];

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadgeClass = (status) => {
        const classes = {
            active: 'bg-green-100 text-green-700',
            completed: 'bg-blue-100 text-blue-700',
            upcoming: 'bg-orange-100 text-orange-700'
        };
        return classes[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                        My Courses
                    </h1>
                    <p className="text-gray-600 mt-1">Manage and track your enrolled courses</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-600">Total Courses</div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalCourses}</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-600">Active</div>
                    </div>
                    <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Award className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-600">Completed</div>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">{stats.completed}</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-600">Avg Progress</div>
                    </div>
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
                            placeholder="Search courses..."
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
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="upcoming">Upcoming</option>
                    </select>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <div
                        key={course.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{course.code}</h3>
                                <p className="text-sm text-gray-600 mt-1">{course.name}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(course.status)}`}>
                {course.status}
              </span>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>{course.instructor}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{course.schedule}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{course.students} students</span>
                                <span className="text-gray-600">{course.credits} credits</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Progress</span>
                                <span className="text-sm font-bold text-gray-900">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${course.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyCourses;

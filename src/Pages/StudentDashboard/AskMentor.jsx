import React, { useState } from 'react';
import { MessageCircleQuestion, Search, Mail, Calendar, Phone, MapPin, Award, BookOpen } from 'lucide-react';

const AskMentor = () => {
    const [searchQuery, setSearchQuery] = useState('');

    // Teachers from enrolled courses
    const enrolledCourseTeachers = [
        {
            id: 1,
            name: 'Dr. Abdul Rahman',
            title: 'Associate Professor',
            department: 'Computer Science & Engineering',
            avatar: 'AR',
            courseCode: 'CSE 3220',
            courseName: 'Software Engineering',
            email: 'rahman@cse.kuet.ac.bd',
            phone: '+880 1712-345678',
            office: 'Room 302, ECE Building',
            officeHours: 'Sun, Tue: 2:00 PM - 4:00 PM',
            expertise: ['Software Engineering', 'System Design', 'Agile Methodology'],
            availability: 'Available',
            rating: 4.8,
            totalStudents: 120,
            nextSlot: 'Tomorrow 10:00 AM'
        },
        {
            id: 2,
            name: 'Prof. Mahmuda Ahmed',
            title: 'Professor',
            department: 'Computer Science & Engineering',
            avatar: 'MA',
            courseCode: 'CSE 3210',
            courseName: 'Database Systems',
            email: 'ahmed@cse.kuet.ac.bd',
            phone: '+880 1723-456789',
            office: 'Room 205, ECE Building',
            officeHours: 'Mon, Wed: 3:00 PM - 5:00 PM',
            expertise: ['Database Systems', 'Big Data', 'Cloud Computing'],
            availability: 'Busy',
            rating: 4.9,
            totalStudents: 115,
            nextSlot: 'Friday 2:00 PM'
        },
        {
            id: 3,
            name: 'Dr. Kamal Khan',
            title: 'Assistant Professor',
            department: 'Computer Science & Engineering',
            avatar: 'KK',
            courseCode: 'CSE 3230',
            courseName: 'Computer Networks',
            email: 'khan@cse.kuet.ac.bd',
            phone: '+880 1734-567890',
            office: 'Room 401, ECE Building',
            officeHours: 'Sun, Thu: 11:00 AM - 1:00 PM',
            expertise: ['Computer Networks', 'Network Security', 'IoT'],
            availability: 'Available',
            rating: 4.7,
            totalStudents: 110,
            nextSlot: 'Today 3:00 PM'
        },
        {
            id: 4,
            name: 'Prof. Farhan Islam',
            title: 'Associate Professor',
            department: 'Computer Science & Engineering',
            avatar: 'FI',
            courseCode: 'CSE 3240',
            courseName: 'Operating Systems',
            email: 'islam@cse.kuet.ac.bd',
            phone: '+880 1745-678901',
            office: 'Room 303, ECE Building',
            officeHours: 'Mon, Wed: 10:00 AM - 12:00 PM',
            expertise: ['Operating Systems', 'Embedded Systems', 'Real-time Systems'],
            availability: 'Available',
            rating: 4.6,
            totalStudents: 105,
            nextSlot: 'Tomorrow 11:00 AM'
        },
        {
            id: 5,
            name: 'Dr. Nusrat Hassan',
            title: 'Assistant Professor',
            department: 'Computer Science & Engineering',
            avatar: 'NH',
            courseCode: 'CSE 3250',
            courseName: 'Algorithm Analysis',
            email: 'hassan@cse.kuet.ac.bd',
            phone: '+880 1756-789012',
            office: 'Room 208, ECE Building',
            officeHours: 'Tue, Thu: 2:00 PM - 4:00 PM',
            expertise: ['Algorithms', 'Data Structures', 'Competitive Programming'],
            availability: 'Available',
            rating: 4.8,
            totalStudents: 125,
            nextSlot: 'Tomorrow 2:00 PM'
        },
        {
            id: 6,
            name: 'Prof. Tahmid Karim',
            title: 'Professor',
            department: 'Computer Science & Engineering',
            avatar: 'TK',
            courseCode: 'CSE 3260',
            courseName: 'Artificial Intelligence',
            email: 'karim@cse.kuet.ac.bd',
            phone: '+880 1767-890123',
            office: 'Room 410, ECE Building',
            officeHours: 'Sun, Tue: 1:00 PM - 3:00 PM',
            expertise: ['Artificial Intelligence', 'Machine Learning', 'Deep Learning'],
            availability: 'Busy',
            rating: 4.9,
            totalStudents: 98,
            nextSlot: 'Thursday 10:00 AM'
        }
    ];

    const filteredTeachers = enrolledCourseTeachers.filter(teacher => {
        const searchLower = searchQuery.toLowerCase();
        return (
            teacher.name.toLowerCase().includes(searchLower) ||
            teacher.courseCode.toLowerCase().includes(searchLower) ||
            teacher.courseName.toLowerCase().includes(searchLower) ||
            teacher.expertise.some(exp => exp.toLowerCase().includes(searchLower))
        );
    });

    const getAvailabilityClass = (availability) => {
        return availability === 'Available'
            ? 'bg-green-100 text-green-700'
            : 'bg-orange-100 text-orange-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <MessageCircleQuestion className="w-8 h-8 text-blue-600" />
                        My Course Instructors
                    </h1>
                    <p className="text-gray-600 mt-1">Connect with your course teachers</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by teacher name, course, or expertise..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> These are the instructors for your currently enrolled courses.
                    You can message them directly or book an appointment during their office hours.
                </p>
            </div>

            {/* Teachers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTeachers.map((teacher) => (
                    <div
                        key={teacher.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition"
                    >
                        {/* Header Section */}
                        <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-100">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                                {teacher.avatar}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900">{teacher.name}</h3>
                                <p className="text-sm text-gray-600">{teacher.title}</p>
                                <p className="text-sm text-gray-500">{teacher.department}</p>
                                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityClass(teacher.availability)}`}>
                    {teacher.availability}
                  </span>
                                    <div className="flex items-center gap-1 text-sm">
                                        <span className="text-yellow-500">★</span>
                                        <span className="font-semibold text-gray-700">{teacher.rating}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Course Info */}
                        <div className="mb-4 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-gray-700">Teaching Course:</span>
                            </div>
                            <div className="ml-6">
                                <p className="font-bold text-gray-900">{teacher.courseCode}</p>
                                <p className="text-sm text-gray-600">{teacher.courseName}</p>
                                <p className="text-xs text-gray-500 mt-1">{teacher.totalStudents} students enrolled</p>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Contact Information:</h4>

                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <a href={`mailto:${teacher.email}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                                    {teacher.email}
                                </a>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <a href={`tel:${teacher.phone}`} className="text-gray-700 hover:text-blue-600">
                                    {teacher.phone}
                                </a>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-700">{teacher.office}</span>
                            </div>

                            <div className="flex items-start gap-3 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-700">Office Hours:</p>
                                    <p className="text-gray-600">{teacher.officeHours}</p>
                                    <p className="text-xs text-blue-600 mt-1">Next available: {teacher.nextSlot}</p>
                                </div>
                            </div>
                        </div>

                        {/* Expertise */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Award className="w-4 h-4 text-purple-600" />
                                <h4 className="text-sm font-semibold text-gray-700">Expertise:</h4>
                            </div>
                            <div className="flex flex-wrap gap-2 ml-6">
                                {teacher.expertise.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                                    >
                    {skill}
                  </span>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-4">
                            <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium">
                                <Mail className="w-4 h-4" />
                                Message
                            </button>
                            <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium">
                                <Calendar className="w-4 h-4" />
                                Book Appointment
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Results Message */}
            {filteredTeachers.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No instructors found</h3>
                    <p className="text-gray-600">
                        Try adjusting your search query or clear the search to see all instructors.
                    </p>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Clear Search
                    </button>
                </div>
            )}
        </div>
    );
};

export default AskMentor;

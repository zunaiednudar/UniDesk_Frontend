import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider';
import axiosSecure from '../../utils/axiosSecure.js';
import { GraduationCap } from 'lucide-react';
import { MdOutlineCalendarToday, MdOutlineUpcoming, MdPeopleOutline } from 'react-icons/md';
import { VscLayersActive } from 'react-icons/vsc';
import { SiGoogleclassroom } from 'react-icons/si';
import { formatAppointmentDate } from '../../utils/formatAppointmentDate.js';
import CardSkeleton from '../../Components/CardSkeleton/CardSkeleton.jsx';
import { Link, NavLink } from 'react-router';
import { toast } from 'sonner';

const FacultyDashboard = () => {
    const { userData } = useContext(AuthContext);

    // Loading states

    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [loadingAssignments, setLoadingAssignments] = useState(true);

    const dashboardLoading = loadingCourses || loadingAppointments || loadingAssignments;

    // Data collection

    const [activeCourses, setActiveCourses] = useState([]);
    const [completedCourses, setCompletedCourses] = useState({});
    const [totalStudents, setTotalStudents] = useState(0);
    const [appointments, setAppointments] = useState([]);
    const [assignments, setAssignments] = useState([]);

    // Courses fetch

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoadingCourses(true);
                const res = await axiosSecure.get("/courses/my-courses");
                // console.log(data);
                setActiveCourses(res.data.activeCourses);
                setCompletedCourses(res.data.completedCourses);

            } catch (error) {
                // console.log(error);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

    // Students fetch

    useEffect(() => {
        const fetchStudents = () => {
            if (!activeCourses.length && !completedCourses.length)
                return;
            const total = new Set();
            activeCourses.map(course => {
                course.students?.map(student => {
                    total.add(student._id);
                });
            });
            completedCourses.map(course => {
                course.students?.map(student => {
                    total.add(student._id);
                });
            });
            setTotalStudents(total.size);
        }
        fetchStudents();
    }, [activeCourses, completedCourses]);

    // Appointments fetch

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoadingAppointments(true);
                const res = await axiosSecure.get(`/appointment/faculty/${userData._id}`);
                const appointments = res.data.appointments;

                const now = new Date();

                const upcomingAppointments = appointments.filter(appointment => new Date(appointment.startTime) > now);

                setAppointments(upcomingAppointments);
            } catch (error) {
                // console.log(error);
            } finally {
                setLoadingAppointments(false);
            }

        }
        if (userData?._id)
            fetchAppointments();
    }, [userData?._id]);

    // Assignments fetch

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                setLoadingAssignments(true);

                const res = await axiosSecure.get("/submission/faculty/pending");

                console.log(res.data.assignments);

                setAssignments(res.data.assignments);
            } catch (error) {
                console.log(error);
                toast.error("Assignments fetch failed")
            } finally {
                setLoadingAssignments(false);
            }
        };

        fetchAssignments();
    }, []);

    // Stats card info

    const stats = [
        {
            title: "Total Courses",
            info: (activeCourses.length + completedCourses.length >= 0) ? activeCourses.length + completedCourses.length : "0",
            logo: GraduationCap
        },
        {
            title: "Total Students",
            info: totalStudents,
            logo: MdPeopleOutline
        },
        {
            title: "Active Courses",
            info: activeCourses.length,
            logo: VscLayersActive
        },
        {
            title: "Upcoming Appointments",
            info: appointments.length,
            logo: MdOutlineUpcoming
        },
    ];

    // console.log(activeCourses.length+completedCourses.length);
    // console.log(assignments);
    return (
        <div className='w-full max-w-full p-5 flex flex-col gap-10 gilroy'>

            {/* Welcome texts */}

            <div className='w-full max-w-full'>
                <p className='text-3xl graphik font-bold text-black'>Dashboard</p>
                <p className='text-gray-500'>Welcome back, {userData.name.split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}</p>
            </div>

            {/* Stats Card */}

            <div className='w-full max-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-items-center gap-3'>
                {
                    dashboardLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <CardSkeleton key={i} variant="stat" />
                        )
                        )
                    ) :
                        (
                            stats.map(stat =>
                                <div key={stat.title} className='w-full p-5 rounded-lg shadow-lg flex flex-col gap-2 box-border border border-gray-100 hover:-translate-y-1 transition-all duration-300'>
                                    <div className='flex gap-2 items-center'>
                                        <stat.logo className='w-5 h-5 text-gray-500' />
                                        <p className='text-gray-500 text-xs'>{stat.title}</p>

                                    </div>
                                    <p className='graphik text-sm font-medium'>{stat.info}</p>
                                </div>
                            )
                        )
                }
            </div>

            <div className='w-full max-w-full flex flex-col md:flex-row justify-items-center gap-10'>
                {/* Recent Courses */}
                <div className='w-full md:flex-2 shadow-xl p-5 flex flex-col gap-5'>
                    <p className='text-lg md:text-xl font-bold graphik'>Recent Courses</p>
                    <div className='flex flex-col gap-3'>
                        {
                            dashboardLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <CardSkeleton key={i} lines={3} />
                                ))
                            ) : activeCourses.length === 0 ?
                                (
                                    <p className='text-gray-400 text-sm text-center py-10'>
                                        No active courses
                                    </p>
                                ) :
                                (
                                    activeCourses.map((course) => (
                                        <Link to={`/dashboard/faculty/courses/${course._id}`}
                                            key={course._id}
                                            className="w-full p-6 rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col gap-4"
                                        >
                                            {/* Course Code */}
                                            <p className="text-lg graphik font-bold text-[#1E40AF] tracking-wide">
                                                {course.courseCode}
                                            </p>

                                            {/* Course Name */}
                                            <p className="text-gray-700 text-base font-medium">
                                                {course.courseName}
                                            </p>

                                            {/* Students */}
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <MdPeopleOutline className="text-blue-600" />
                                                    </div>
                                                    <span>
                                                        {course.students.length}{" "}
                                                        {course.students.length > 1 ? "Students" : "Student"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Session */}
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <SiGoogleclassroom className="text-purple-600" />
                                                </div>
                                                <span>{course.session}</span>
                                            </div>
                                        </Link>
                                    )
                                    )
                                )
                        }
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div className='w-full md:flex-1 shadow-xl p-5 flex flex-col gap-5'>
                    <p className='text-lg md:text-xl font-bold graphik'>Upcoming Appointments</p>
                    <div className='flex flex-col gap-3'>
                        {
                            dashboardLoading ? (
                                Array.from({ length: 2 }).map((_, i) => (
                                    <CardSkeleton key={i} lines={3} />
                                ))
                            ) : appointments.length === 0 ? (
                                <p className='text-gray-400 text-sm text-center py-10'>
                                    No upcoming appointments
                                </p>
                            ) : (
                                appointments.map((appointment) => (
                                    <div
                                        key={appointment._id}
                                        className="w-full p-6 rounded-xl bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3"
                                    >
                                        {/* Student Name */}
                                        <p className="graphik font-bold text-[#1E40AF]">
                                            {appointment.student.name
                                                .split(" ")
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(" ")}
                                        </p>

                                        {/* Appointment Time */}
                                        <p className="text-gray-600 text-sm">
                                            {formatAppointmentDate(appointment.startTime)}
                                        </p>

                                        {/* Purpose */}
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            {appointment.purpose}
                                        </p>
                                    </div>
                                ))
                            )
                        }
                    </div>
                    <NavLink to="/dashboard/faculty/appointments" className="bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-blue-600 duration-500">View All Appointments</NavLink>
                </div>
            </div>

            {/* Pending Grading course wise */}

            <div className='w-full shadow-xl p-5 flex flex-col gap-5'>
                <p className='text-lg md:text-xl font-bold graphik'>Pending Grading</p>
                {
                    dashboardLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <CardSkeleton key={i} lines={3} variant="pendingAssignment" />
                        ))
                    ) : assignments.length === 0 ?
                        (
                            <p className='text-gray-400 text-sm text-center py-10'>
                                No active courses with pending grading
                            </p>
                        ) :
                        (
                            assignments.map((assignment) => (
                                <div
                                    key={assignment._id}
                                    className="w-full p-6 rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col gap-4"
                                >

                                    {/* Title */}
                                    <div className="flex items-start justify-between">
                                        <p className="graphik font-bold text-lg text-[#1E40AF]">
                                            {assignment.title}
                                        </p>

                                        <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                            {assignment.courseCode}
                                        </span>
                                    </div>

                                    {/* Course Name */}
                                    <p className="text-sm text-gray-600">
                                        {assignment.courseName}
                                    </p>

                                    {/* Info Section */}
                                    <div className="flex items-center justify-between text-sm text-gray-500">

                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400">Due Date</span>
                                            <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-gray-400">Total Marks</span>
                                            <span>{assignment.totalMarks}</span>
                                        </div>

                                    </div>

                                    {/* Pending grading */}
                                    <div className="flex items-center justify-between mt-2">

                                        <span className="text-sm text-gray-600">
                                            Pending Grading
                                        </span>

                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                                    ${assignment.pendingGrading > 0
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-green-100 text-green-700"}`}>
                                            {assignment.pendingGrading}
                                        </span>

                                    </div>

                                </div>
                            ))
                        )
                }
            </div>
        </div>
    );
};

export default FacultyDashboard;
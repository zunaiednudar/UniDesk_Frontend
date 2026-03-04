import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider';
import axiosSecure from '../../utils/axiosSecure.js';
import { GraduationCap } from 'lucide-react';
import { MdOutlineCalendarToday, MdPeopleOutline } from 'react-icons/md';
import { VscLayersActive } from 'react-icons/vsc';
import { SiGoogleclassroom } from 'react-icons/si';
import { formatAppointmentDate } from '../../utils/formatAppointmentDate.js';
import CardSkeleton from '../../Components/CardSkeleton/CardSkeleton.jsx';
import { NavLink } from 'react-router';

const FacultyDashboard = () => {
    const { userData } = useContext(AuthContext);

    // Loading states

    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingAppointments, setLoadingAppointments] = useState(true);

    // Data collection

    const [courses, setCourses] = useState([]);
    const [activeCourses, setActiveCourses] = useState([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [appointments, setAppointments] = useState([]);

    // Courses fetch

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoadingCourses(true);
                const res = await axiosSecure.get("/courses/my-courses");
                const coursesData = res.data.courses;

                setCourses(coursesData);

                const filteredCourses = coursesData.filter(
                    course => course.status === "active"
                );
                setActiveCourses(filteredCourses);

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
            if (!courses.length)
                return;
            const total = new Set();
            courses.map(course => {
                course.students?.map(student => {
                    total.add(student._id);
                });
            });
            setTotalStudents(total.size);
        }
        fetchStudents();
    }, [courses]);

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

    // console.log(courses, activeCourses, totalStudents,appointments);
    return (
        <div className='w-full max-w-full p-10 flex flex-col gap-10 inter'>

            {/* Welcome texts */}

            <div className='w-full max-w-full'>
                <p className='text-3xl playfair font-bold text-black'>Dashboard</p>
                <p className='text-gray-500'>Welcome back, {userData.name.split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}</p>
            </div>

            {/* Stats Card */}

            <div className='w-full max-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-items-center gap-3'>
                {
                    loadingAppointments && loadingCourses ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <CardSkeleton key={i} variant="stat" />
                        )
                        )
                    ) :
                        (
                            <>
                                <div className='w-full px-5 py-10 rounded-lg shadow-xl flex items-start justify-between box-border'>
                                    <div>
                                        <p className='text-gray-500 text-sm'>Total Courses</p>
                                        <p className='playfair text-5xl font-bold'>{courses.length}</p>
                                    </div>
                                    <div className='w-10 h-10 bg-[#1E40AF] rounded-lg flex justify-center items-center'>
                                        <GraduationCap className='w-5 h-5 text-white' /></div>
                                </div>
                                <div className='w-full px-5 py-10 rounded-lg shadow-xl flex items-start justify-between box-border'>
                                    <div>
                                        <p className='text-gray-500 text-sm'>Total Students</p>
                                        <p className='playfair text-5xl font-bold'>{totalStudents}</p>
                                    </div>
                                    <div className='w-10 h-10 bg-[#1eaf75] rounded-lg flex justify-center items-center box-border'>
                                        <MdPeopleOutline className='w-5 h-5 text-white' /></div>
                                </div>
                                <div className='w-full px-5 py-10 rounded-lg shadow-xl flex items-start justify-between box-border'>
                                    <div>
                                        <p className='text-gray-500 text-sm'>Active Courses</p>
                                        <p className='playfair text-5xl font-bold'>{activeCourses.length}</p>
                                    </div>
                                    <div className='w-10 h-10 bg-[#afad1e] rounded-lg flex justify-center items-center'>
                                        <VscLayersActive className='w-5 h-5 text-white' /></div>
                                </div>
                                <div className='w-full px-5 py-10 rounded-lg shadow-xl flex items-start justify-between'>
                                    <div>
                                        <p className='text-gray-500 text-sm'>Upcoming Appointments</p>
                                        <p className='playfair text-5xl font-bold'>{appointments.length}</p>
                                    </div>
                                    <div className='w-10 h-10 bg-[#af1ea8] rounded-lg flex justify-center items-center'>
                                        <MdOutlineCalendarToday className='w-5 h-5 text-white' /></div>
                                </div>
                            </>
                        )
                }
            </div>

            <div className='w-full max-w-full flex flex-col md:flex-row justify-items-center gap-10'>
                {/* Recent Courses */}
                <div className='w-full md:flex-[2] shadow-xl p-5 flex flex-col gap-5'>
                    <p className='text-3xl font-extrabold playfair'>Recent Courses</p>
                    <div className='flex flex-col gap-3'>
                        {
                            loadingAppointments && loadingCourses ? (
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
                                        <div key={course._id} className='w-full p-5 rounded-lg border border-gray-300 flex flex-col gap-5 box-border'>
                                            <p className='text-xl playfair font-bold'>{course.courseCode}</p>
                                            <p className='text-gray-500 text-md'>{course.courseName}</p>
                                            <div className='text-gray-500 text-sm flex gap-3 items-center'><MdPeopleOutline />
                                                {course.students.length} {course.students.length > 1 ? "students" : "student"}
                                            </div>
                                            <div className='text-gray-500 text-sm flex gap-3 items-center'><SiGoogleclassroom />
                                                {course.session}
                                            </div>
                                        </div>
                                    )
                                    )
                                )
                        }
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div className='w-full md:flex-[1] shadow-xl p-5 flex flex-col gap-5'>
                    <p className='text-3xl font-extrabold playfair'>Upcoming Appointments</p>
                    <div className='flex flex-col gap-3'>
                        {
                            loadingAppointments && loadingCourses ? (
                                Array.from({ length: 2 }).map((_, i) => (
                                    <CardSkeleton key={i} lines={3} />
                                ))
                            ) : appointments.length === 0 ? (
                                <p className='text-gray-400 text-sm text-center py-10'>
                                    No upcoming appointments
                                </p>
                            ) : (
                                appointments.map((appointment) => (
                                    <div key={appointment._id} className='w-full p-5 rounded-lg border border-gray-300 flex flex-col gap-3 box-border'>
                                        <p className='text-xl playfair font-bold'>{appointment.student.name.split(" ")
                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(" ")}</p>
                                        <p className='text-gray-500 text-md'>{formatAppointmentDate(appointment.startTime)}</p>
                                        <p className='text-gray-500 text-md'>{appointment.purpose}</p>
                                    </div>
                                ))
                            )
                        }
                    </div>
                    <NavLink to="/dashboard/faculty/my-appointments" className="bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-blue-600 duration-500">View All Appointments</NavLink>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
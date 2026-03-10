import React, { useContext, useEffect, useState } from 'react';
import axiosSecure from '../../utils/axiosSecure.js';
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider.jsx';
import { toast } from 'sonner';
import PaginationTemplate from '../../Components/PaginationTemplate/PaginationTemplate.jsx';
import formatName from '../../utils/formatName.js';
import timeAgo from '../../utils/timeAgo.js';
import { formatAppointmentDate, formatAppointmentTime } from '../../utils/formatAppointmentDate.js';
import { CalendarClock, Clock3, Eye, Globe, MapPin, UserRound } from 'lucide-react';
import CardSkeleton from '../../Components/CardSkeleton/CardSkeleton.jsx';

const FacultyMyAppointments = () => {
    const { userData } = useContext(AuthContext);

    // Filtering

    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Appointments data

    const [appointments, setAppointments] = useState([]);

    // Loading states

    const [loadingAppointments, setLoadingAppointments] = useState(true);

    // Appointments fetch

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoadingAppointments(true);
                const res = await axiosSecure.get(`/appointment/faculty/${userData?._id}`, {
                    params: {
                        page,
                        status
                    }
                });

                if (!res?.data?.success) {
                    toast.error(res?.data?.success);
                    return;
                }

                const data = res?.data?.appointments;

                setTotalPages(res?.data?.pagination?.totalPages);

                setAppointments(data);

            } catch (error) {
                toast.error("Appointments fetch failed");
            } finally {
                setLoadingAppointments(false);
            }
        };

        if (userData?._id)
            fetchAppointments();
    }, [userData?._id, page, status]);


    return (
        <div className='w-full max-w-full p-5 flex flex-col gap-10 gilroy'>
            <div className='w-full max-w-full'>
                <p className='text-3xl graphik font-bold text-black'>My Appointments</p>
                <p className='text-gray-500'>Manage your student appointments</p>
            </div>
            <select
                value={status}
                onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                }}
                className="select select-bordered w-25 outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Upcoming</option>
                <option value="completed">Completed</option>
            </select>

            <div className='w-full flex flex-col p-5 rounded-lg shadow-lg gap-5 box-border border border-gray-100'>
                {
                    loadingAppointments
                        ?
                        Array.from({ length: 6 }).map((_, i) => (
                            <CardSkeleton key={i} lines={4} />
                        ))
                        :
                        appointments.length === 0
                            ?
                            <p className='col-span-full text-gray-500 text-sm md:text- md lg:text-lg text-center py-10'>
                                No appointment found
                            </p>
                            :
                            appointments.map(appointment =>
                                <div
                                    key={appointment?._id}
                                    className="group flex flex-col gap-4 p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                >
                                    {/* Header */}

                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
                                                {formatName(appointment?.student?.name)}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {appointment?.student?.email}
                                            </p>
                                        </div>

                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {timeAgo(appointment?.updatedAt)}
                                        </span>
                                    </div>

                                    {/* Status and type */}

                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${appointment?.status === "pending"
                                                ? "bg-amber-100 text-amber-700"
                                                : appointment?.status === "approved"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-blue-100 text-blue-700"
                                                } capitalize`}
                                        >
                                            <span
                                                className={`w-2 h-2 rounded-full ${appointment?.status === "pending"
                                                    ? "bg-amber-500"
                                                    : appointment?.status === "approved"
                                                        ? "bg-green-500"
                                                        : "bg-blue-500"
                                                    }`}
                                            ></span>
                                            {appointment?.status}
                                        </span>

                                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full capitalize">
                                            {appointment?.meetingType}
                                        </span>
                                    </div>

                                    {/* Purpose */}

                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {appointment?.purpose}
                                    </p>

                                    <div className="border-t border-gray-100"></div>

                                    {/* Date and time */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
                                                <CalendarClock className="w-4 h-4" />
                                            </div>

                                            <span className="text-gray-700 truncate">
                                                {formatAppointmentDate(appointment?.startTime)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-600">
                                                <Clock3 className="w-4 h-4" />
                                            </div>

                                            <span className="text-gray-700 truncate">
                                                {formatAppointmentTime(appointment?.startTime, appointment?.endTime)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mode and cancel request */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-md bg-violet-100 text-violet-600">
                                                {
                                                    appointment?.mode === "online" ? (
                                                        <Globe className="w-4 h-4" />
                                                    ) : (
                                                        <MapPin className="w-4 h-4" />
                                                    )
                                                }
                                            </div>

                                            <span className="text-gray-700 capitalize">
                                                {appointment?.mode}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-md bg-sky-100 text-sky-600">
                                                <UserRound className="w-4 h-4" />
                                            </div>

                                            <span className="text-gray-700">
                                                {
                                                    appointment?.cancelRequestedByStudent
                                                        ? "Cancel requested"
                                                        : "Normal"
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <button
                                        type="button"
                                        className='mt-1 btn btn-sm bg-[#1E40AF] text-white hover:bg-blue-600 border-none'
                                    >
                                        <Eye className='w-4 h-4' />
                                        View
                                    </button>
                                </div>
                            )
                }

            </div>
            <div className='mx-auto'>
                <PaginationTemplate
                    page={page}
                    totalPages={totalPages}
                    onChange={setPage}></PaginationTemplate>
            </div>
        </div>
    );
};

export default FacultyMyAppointments;
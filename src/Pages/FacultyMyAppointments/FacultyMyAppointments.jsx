import React, { useContext, useEffect, useRef, useState } from 'react';
import axiosSecure from '../../utils/axiosSecure.js';
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider.jsx';
import { toast } from 'sonner';
import PaginationTemplate from '../../Components/PaginationTemplate/PaginationTemplate.jsx';
import formatName from '../../utils/formatName.js';
import timeAgo from '../../utils/timeAgo.js';
import { formatAppointmentDate, formatAppointmentTime } from '../../utils/formatAppointmentDate.js';
import { CalendarClock, Clock3, Eye, Globe, MapPin, UserRound } from 'lucide-react';
import CardSkeleton from '../../Components/CardSkeleton/CardSkeleton.jsx';
import { MdOutlineUpcoming, MdPendingActions } from 'react-icons/md';
import { GrCompliance } from "react-icons/gr";
import { FaPeopleGroup } from "react-icons/fa6";

const FacultyMyAppointments = () => {
    const { userData } = useContext(AuthContext);

    // Filtering

    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Appointments data

    const [appointments, setAppointments] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState(0);
    const [pendingAppointments, setPendingAppointments] = useState(0);
    const [completedAppointments, setCompletedAppointments] = useState(0);
    const [students, setStudents] = useState(0);

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
                    toast.error(res?.data?.message);
                    return;
                }

                const data = res?.data?.appointments || [];

                setTotalPages(res?.data?.pagination?.totalPages || 1);

                setCompletedAppointments(res?.data?.stats?.completed);
                setUpcomingAppointments(res?.data?.stats?.approved);
                setPendingAppointments(res?.data?.stats?.pending);
                setStudents(res?.data?.stats?.students);

                setAppointments(data);
            } catch (error) {
                toast.error("Appointments fetch failed");
            } finally {
                setLoadingAppointments(false);
            }
        };

        if (userData?._id)
            fetchAppointments();
    }, [userData?._id, page, status, completedAppointments, upcomingAppointments, pendingAppointments]);

    // UI helper function for modal

    const getStatusBadgeClass = (status) => {
        if (status === 'pending')
            return 'bg-amber-100 text-amber-700';

        if (status === 'approved')
            return 'bg-green-100 text-green-700';

        if (status === 'completed')
            return 'bg-blue-100 text-blue-700';

        if (status === 'cancelled')
            return 'bg-red-100 text-red-700';

        if (status === 'rejected')
            return 'bg-gray-200 text-gray-700';

        return 'bg-gray-100 text-gray-700';
    };

    // Appointment action related

    const detailsModalRef = useRef(null);

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [loadingAppointmentDetails, setLoadingAppointmentDetails] = useState(false);
    const [loadingAppointmentAction, setLoadingAppointmentAction] = useState(false);

    const [facultyActionReason, setFacultyActionReason] = useState('');

    // Appointment details modal opening function

    const handleOpenDetailsModal = async (appointment) => {
        try {
            setSelectedAppointment(appointment);
            setFacultyActionReason('');
            detailsModalRef.current?.showModal();

            setLoadingAppointmentDetails(true);

            const res = await axiosSecure.get(`/appointment/${appointment?._id}`);

            if (!res?.data?.success) {
                toast.error(res?.data?.message || 'Failed to load appointment details');
                return;
            }

            setSelectedAppointment(res?.data?.appointment);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to load appointment details');
        } finally {
            setLoadingAppointmentDetails(false);
        }
    };

    // Appointment details modal closing function

    const handleCloseDetailsModal = () => {
        detailsModalRef.current?.close();

        setTimeout(() => {
            setSelectedAppointment(null);
            setFacultyActionReason('');
        }, 500);
    };

    // Appointment update in list helper function

    const updateAppointmentInList = (updatedAppointment) => {
        setAppointments((prev) =>
            prev.map((appointment) =>
                appointment?._id === updatedAppointment?._id ? updatedAppointment : appointment
            )
        );

        setSelectedAppointment(updatedAppointment);
    };

    // Appointment approval function

    const handleApproveAppointment = async () => {
        if (!selectedAppointment?._id)
            return;

        try {
            setLoadingAppointmentAction(true);

            const res = await axiosSecure.patch(`/appointment/${selectedAppointment._id}`, {
                status: 'approved'
            });

            if (!res?.data?.success) {
                toast.error(res?.data?.message || 'Failed to approve appointment');
                return;
            }

            updateAppointmentInList(res?.data?.appointment);

            handleCloseDetailsModal();

            toast.success('Appointment approved successfully');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to approve appointment');
        } finally {
            setLoadingAppointmentAction(false);
        }
    };

    // Assignment cancel function

    const handleCancelAppointment = async () => {
        if (!selectedAppointment?._id)
            return;

        if (!facultyActionReason.trim()) {
            toast.error('Cancellation reason is required');
            return;
        }

        try {
            setLoadingAppointmentAction(true);

            const res = await axiosSecure.patch(`/appointment/${selectedAppointment._id}`, {
                status: 'cancelled',
                reason: facultyActionReason.trim()
            });

            if (!res?.data?.success) {
                toast.error(res?.data?.message || 'Failed to cancel appointment');
                return;
            }

            const updatedAppointment = {
                ...selectedAppointment,
                status: 'cancelled',
                facultyCancelReason: facultyActionReason.trim(),
                cancelRequestedByStudent: false
            };

            updateAppointmentInList(updatedAppointment);

            handleCloseDetailsModal();

            toast.success('Appointment cancelled successfully');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to cancel appointment');
        } finally {
            setLoadingAppointmentAction(false);
        }
    };

    // Student cancel request approval function

    const handleApproveStudentCancellation = async () => {
        if (!selectedAppointment?._id)
            return;

        const reason = selectedAppointment?.studentCancelReason?.trim();

        if (!reason) {
            toast.error('Student cancellation reason not found');
            return;
        }

        try {
            setLoadingAppointmentAction(true);

            const res = await axiosSecure.patch(`/appointment/${selectedAppointment._id}`, {
                status: 'cancelled',
                reason
            });

            if (!res?.data?.success) {
                toast.error(res?.data?.message || 'Failed to approve cancellation request');
                return;
            }

            const updatedAppointment = {
                ...selectedAppointment,
                status: 'cancelled',
                facultyCancelReason: reason,
                cancelRequestedByStudent: false
            };

            updateAppointmentInList(updatedAppointment);

            handleCloseDetailsModal();

            toast.success('Student cancellation request approved');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to approve cancellation request');
        } finally {
            setLoadingAppointmentAction(false);
        }
    };

    // Appointment complete handle function

    const handleCompleteAppointment = async () => {
        if (!selectedAppointment?._id)
            return;

        try {
            setLoadingAppointmentAction(true);

            const res = await axiosSecure.patch(`/appointment/${selectedAppointment._id}`, {
                status: 'completed'
            });

            if (!res?.data?.success) {
                toast.error(res?.data?.message || 'Failed to complete appointment');
                return;
            }

            updateAppointmentInList(res?.data?.appointment);

            handleCloseDetailsModal();

            toast.success('Appointment marked as completed');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to complete appointment');
        } finally {
            setLoadingAppointmentAction(false);
        }
    };


    // Online join related

    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const canJoinAppointment = (appointment, currentTime) => {
        if (appointment?.status !== 'approved' || appointment?.mode !== 'online' || !appointment?.meetLink)
            return false;

        const now = new Date(currentTime);
        const startTime = new Date(appointment.startTime);
        const endTime = new Date(appointment.endTime);
        const joinWindowStart = new Date(startTime.getTime() - 15 * 60 * 1000);

        return now >= joinWindowStart && now <= endTime;
    };

    const canJoin = canJoinAppointment(selectedAppointment, currentTime);


    // Stats card information

    const stats = [
        {
            logo: MdOutlineUpcoming,
            title: "Upcoming Appointments",
            info: `${upcomingAppointments}`
        },
        {
            logo: MdPendingActions,
            title: "Pending Appointments",
            info: `${pendingAppointments}`
        },
        {
            logo: GrCompliance,
            title: "Completed Appointments",
            info: `${completedAppointments}`
        },
        {
            logo: FaPeopleGroup,
            title: "Connected with",
            info: `${students} ${students > 1 ? "students" : "student"}`
        }
    ];

    return (
        <div className='w-full max-w-full p-5 flex flex-col gap-10 gilroy'>
            <div className='w-full max-w-full'>
                <p className='text-3xl graphik font-bold text-black'>My Appointments</p>
                <p className='text-gray-500'>Manage your student appointments</p>
            </div>

            {/* Stats card */}

            <div className='w-full max-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-items-center gap-3'>
                {
                    loadingAppointments ? (
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

            <select
                value={status}
                onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                }}
                className="select select-bordered w-30 outline-none focus:ring-2 focus:ring-blue-500"
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
                            <CardSkeleton key={i} lines={4} variant="appointmentCard" />
                        ))
                        :
                        appointments.length === 0
                            ?
                            <p className='col-span-full text-gray-500 text-sm lg:text-lg text-center py-10'>
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
                                        onClick={() => handleOpenDetailsModal(appointment)}
                                    >
                                        <Eye className='w-4 h-4' />
                                        View
                                    </button>
                                </div>
                            )
                }

            </div>

            {/* Pagination template */}

            <div className='mx-auto'>
                <PaginationTemplate
                    page={page}
                    totalPages={totalPages}
                    onChange={setPage}></PaginationTemplate>
            </div>

            {/* Appointment details modal */}

            <dialog ref={detailsModalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-2xl p-6">
                    {
                        loadingAppointmentDetails ? (
                            <div className="flex justify-center py-10">
                                <span className="loading loading-dots loading-lg"></span>
                            </div>
                        ) : selectedAppointment && (
                            <div className="flex flex-col gap-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xl font-bold graphik">Appointment Details</p>
                                    <button
                                        className="btn btn-sm btn-circle btn-ghost"
                                        onClick={handleCloseDetailsModal}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div className="min-w-0">
                                        <p className="font-bold text-lg text-black">
                                            {formatName(selectedAppointment?.student?.name)}
                                        </p>
                                        <p className="text-sm text-gray-500 break-all">
                                            {selectedAppointment?.student?.email}
                                        </p>
                                    </div>

                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadgeClass(selectedAppointment?.status)}`}>
                                        {selectedAppointment?.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-500 font-medium">Meeting Type</span>
                                        <span className="font-semibold text-gray-900 capitalize">
                                            {selectedAppointment?.meetingType}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-500 font-medium">Mode</span>
                                        <span className="font-semibold text-gray-900 capitalize">
                                            {selectedAppointment?.mode}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-500 font-medium">Date</span>
                                        <span className="font-semibold text-gray-900">
                                            {formatAppointmentDate(selectedAppointment?.startTime)}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-500 font-medium">Time</span>
                                        <span className="font-semibold text-gray-900">
                                            {formatAppointmentTime(selectedAppointment?.startTime, selectedAppointment?.endTime)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-700">Purpose</span>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {selectedAppointment?.purpose || 'No purpose provided'}
                                    </p>
                                </div>

                                {
                                    selectedAppointment?.status === 'approved' &&
                                    selectedAppointment?.mode === 'online' &&
                                    selectedAppointment?.meetLink && (
                                        <a
                                            href={canJoin ? selectedAppointment?.meetLink : undefined}
                                            target={canJoin ? "_blank" : undefined}
                                            rel={canJoin ? "noreferrer" : undefined}
                                            onClick={(e) => {
                                                if (!canJoin) {
                                                    e.preventDefault();
                                                    toast.info('Join button will be enabled 15 minutes before the meeting starts');
                                                }
                                            }}
                                            className={`btn border-none ${canJoin
                                                ? 'bg-[#1E40AF] text-white hover:bg-blue-600 cursor-pointer'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-auto'
                                                }`}
                                        >
                                            {canJoin ? 'Join Meeting' : 'Join available 15 min before'}
                                        </a>
                                    )
                                }

                                {
                                    selectedAppointment?.studentCancelReason && (
                                        <div className="flex flex-col gap-1 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                            <span className="text-sm font-semibold text-amber-700">
                                                Student Cancellation Reason
                                            </span>
                                            <p className="text-sm text-amber-700">
                                                {selectedAppointment?.studentCancelReason}
                                            </p>
                                        </div>
                                    )
                                }

                                {
                                    selectedAppointment?.facultyCancelReason && (
                                        <div className="flex flex-col gap-1 rounded-lg border border-red-200 bg-red-50 p-4">
                                            <span className="text-sm font-semibold text-red-700">
                                                Faculty Cancellation Reason
                                            </span>
                                            <p className="text-sm text-red-700">
                                                {selectedAppointment?.facultyCancelReason}
                                            </p>
                                        </div>
                                    )
                                }

                                {
                                    selectedAppointment?.rejectionReason && (
                                        <div className="flex flex-col gap-1 rounded-lg border border-gray-300 bg-gray-50 p-4">
                                            <span className="text-sm font-semibold text-gray-700">
                                                Rejection Reason
                                            </span>
                                            <p className="text-sm text-gray-700">
                                                {selectedAppointment?.rejectionReason}
                                            </p>
                                        </div>
                                    )
                                }

                                {
                                    selectedAppointment?.status === 'pending' && (
                                        <button
                                            onClick={handleApproveAppointment}
                                            disabled={loadingAppointmentAction}
                                            className="btn bg-[#1E40AF] text-white hover:bg-blue-600 border-none"
                                        >
                                            {
                                                loadingAppointmentAction ? (
                                                    <span className="loading loading-dots loading-md"></span>
                                                ) : (
                                                    'Approve Appointment'
                                                )
                                            }
                                        </button>
                                    )
                                }



                                {
                                    selectedAppointment?.status === 'approved' && selectedAppointment?.cancelRequestedByStudent && (
                                        <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                            <p className="text-sm font-semibold text-amber-700">
                                                Student requested cancellation for this appointment.
                                            </p>

                                            <button
                                                onClick={handleApproveStudentCancellation}
                                                disabled={loadingAppointmentAction}
                                                className="btn btn-error text-white border-none"
                                            >
                                                {
                                                    loadingAppointmentAction ? (
                                                        <span className="loading loading-dots loading-md"></span>
                                                    ) : (
                                                        'Approve Cancellation Request'
                                                    )
                                                }
                                            </button>
                                        </div>
                                    )
                                }

                                {
                                    selectedAppointment?.status === 'approved' && !selectedAppointment?.cancelRequestedByStudent && (
                                        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4">
                                            <button
                                                onClick={handleCompleteAppointment}
                                                disabled={loadingAppointmentAction}
                                                className="btn bg-green-600 text-white hover:bg-green-700 border-none"
                                            >
                                                {
                                                    loadingAppointmentAction ? (
                                                        <span className="loading loading-dots loading-md"></span>
                                                    ) : (
                                                        'Mark as Completed'
                                                    )
                                                }
                                            </button>

                                            <div className="flex flex-col gap-1">
                                                <label className="text-sm font-semibold text-gray-700">
                                                    Cancellation Reason
                                                </label>
                                                <textarea
                                                    rows="4"
                                                    className="textarea textarea-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                    placeholder="Write reason for cancelling this appointment"
                                                    value={facultyActionReason}
                                                    onChange={(e) => setFacultyActionReason(e.target.value)}
                                                />
                                            </div>

                                            <button
                                                onClick={handleCancelAppointment}
                                                disabled={loadingAppointmentAction}
                                                className="btn btn-error text-white border-none"
                                            >
                                                {
                                                    loadingAppointmentAction ? (
                                                        <span className="loading loading-dots loading-md"></span>
                                                    ) : (
                                                        'Cancel Appointment'
                                                    )
                                                }
                                            </button>
                                        </div>
                                    )
                                }

                            </div>
                        )
                    }
                </div>
            </dialog>
        </div>
    );
};

export default FacultyMyAppointments;
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { startOfWeek, addDays, format } from "date-fns";
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider.jsx';
import { toast } from 'sonner';
import axiosSecure from '../../utils/axiosSecure.js';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import CardSkeleton from '../../Components/CardSkeleton/CardSkeleton.jsx';
import "./calendar.css";
import CalendarEventContent from '../../Components/CalendarEventContent/CalendarEventContent.jsx';
import formatName from '../../utils/formatName.js';
import { CalendarDays, Clock3, Presentation } from 'lucide-react';
import { MdOutlineUpcoming } from 'react-icons/md';
import { IoMdCreate } from 'react-icons/io';
import { buildEditableSchedule, handleAddClass, handleAddFreeSlot, handleClassChange, handleFreeSlotChange, handleRemoveClass, handleRemoveFreeSlot } from '../../utils/facultyScheduleUpdateHelper.js';

const FacultyMySchedule = () => {
    const { userData } = useContext(AuthContext);

    // Schedule fetch

    const [schedule, setSchedule] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loadingSchedule, setLoadingSchedule] = useState(true);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [scheduleReminder, setScheduleReminder] = useState("");

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                setLoadingSchedule(true);

                const res = await axiosSecure.get(`/schedule/${userData?._id}`);

                console.log(res);

                if (!res?.data?.success) {
                    toast.error(res?.data?.message);
                    return;
                }

                setSchedule(res?.data?.schedule);
                setScheduleReminder("");

            } catch (error) {
                setSchedule(null);
                setScheduleReminder("Your schedule is not set yet. Set or contact Admin to add your weekly schedule to show classes and available slots here.");
            } finally {
                setLoadingSchedule(false);
            }
        };

        const fetchAppointments = async () => {
            try {
                setLoadingAppointments(true);

                const res = await axiosSecure.get(`/appointment/faculty/${userData?._id}/week`);

                if (!res?.data?.success) {
                    toast.error(res?.data?.message);
                    return;
                }

                setAppointments(res?.data?.appointments);

            } catch (error) {
                toast.error("Appointments fetch failed");
            } finally {
                setLoadingAppointments(false);
            }
        };

        if (userData?._id) {
            fetchSchedule();
            fetchAppointments();
        }
    }, [userData?._id]);

    const loading = loadingAppointments || loadingSchedule;

    // Schedule week retrieval

    const currentDate = new Date();

    // Sunday

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });

    // Thursday

    const weekEnd = addDays(weekStart, 4);

    // Class events mapping

    const classEvents = useMemo(() => {
        if (!schedule?.weeklySchedule)
            return [];

        const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });

        const dayIndexMap = {
            Sunday: 0,
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6
        };

        return schedule.weeklySchedule.flatMap((dayItem) => {
            const dayOffset = dayIndexMap[dayItem.day];
            if (dayOffset === undefined)
                return [];

            const baseDate = addDays(weekStart, dayOffset);

            return (dayItem.classes || []).map((classItem, index) => {
                const start = new Date(baseDate);
                const end = new Date(baseDate);

                const [startHour, startMinute] = classItem.startTime.split(":").map(Number);
                const [endHour, endMinute] = classItem.endTime.split(":").map(Number);

                start.setHours(startHour, startMinute, 0, 0);
                end.setHours(endHour, endMinute, 0, 0);

                return {
                    id: `class-${dayItem.day}-${index}`,
                    title: "Class",
                    start,
                    end,
                    classNames: ["schedule-event", "schedule-event-class"],
                    extendedProps: {
                        type: "class",
                        courseName: classItem.courseName,
                        day: dayItem.day,
                        startTime: classItem.startTime,
                        endTime: classItem.endTime
                    }
                };
            });
        });
    }, [schedule]);


    // Appointment events mapping

    const appointmentEvents = useMemo(() => {
        return appointments.map((appointment) => ({
            id: `appointment-${appointment._id}`,
            title: "Appointment",
            start: new Date(appointment.startTime),
            end: new Date(appointment.endTime),
            classNames: ["schedule-event", "schedule-event-appointment"],
            extendedProps: {
                type: "appointment",
                studentName: appointment?.student?.name,
                studentEmail: appointment?.student?.email,
                purpose: appointment?.purpose,
                mode: appointment?.mode,
                meetingType: appointment?.meetingType,
                meetLink: appointment?.meetLink,
                startTime: appointment?.startTime,
                endTime: appointment?.endTime
            }
        }));
    }, [appointments]);


    const calendarEvents = useMemo(() => {
        return [...classEvents, ...appointmentEvents];
    }, [classEvents, appointmentEvents]);

    // Event details modal

    const [selectedEvent, setSelectedEvent] = useState(null);
    const detailsModalRef = useRef(null);

    // Modal opening function

    const openDetailsModal = (eventInfo) => {
        setSelectedEvent({
            title: eventInfo.event.title,
            start: eventInfo.event.start,
            end: eventInfo.event.end,
            ...eventInfo.event.extendedProps
        });

        detailsModalRef.current?.showModal();
    };

    // Modal closing function

    const closeDetailsModal = () => {
        detailsModalRef.current?.close();
        setTimeout(() => {
            setSelectedEvent(null);
        }, 500);
    };

    // Stats card related

    const statsInfo = useMemo(() => {
        const totalClasses = classEvents.length;
        const totalAppointments = appointmentEvents.length;

        const busyDaysSet = new Set();
        let totalMinutes = 0;

        [...classEvents, ...appointmentEvents].forEach((event) => {
            const start = new Date(event.start);
            const end = new Date(event.end);

            busyDaysSet.add(start.getDay());
            totalMinutes += (end - start) / (1000 * 60);
        });

        return {
            totalClasses,
            totalAppointments,
            busyDays: busyDaysSet.size,
            totalHours: (totalMinutes / 60).toFixed(1)
        };
    }, [classEvents, appointmentEvents]);

    // Stats info

    const stats = [
        {
            title: "Classes This Week",
            info: statsInfo.totalClasses,
            logo: Presentation,
            iconBg: "bg-orange-100",
            icon: "text-orange-700"
        },
        {
            title: "Appointments",
            info: statsInfo.totalAppointments,
            logo: MdOutlineUpcoming,
            iconBg: "bg-blue-100",
            icon: "text-blue-700"
        },
        {
            title: "Busy Days",
            info: statsInfo.busyDays,
            logo: CalendarDays,
            iconBg: "bg-green-100",
            icon: "text-green-700"
        },
        {
            title: "Total Hours",
            info: `${statsInfo.totalHours} h`,
            logo: Clock3,
            iconBg: "bg-purple-100",
            icon: "text-purple-700"
        }
    ];

    // Schedule update related

    const scheduleModalRef = useRef(null);

    const [updateWeeklySchedule, setUpdateWeeklySchedule] = useState([]);
    const [loadingUpdateSchedule, setLoadingUpdateSchedule] = useState(false);

    // Schedule update model opening function

    const openScheduleUpdateModal = () => {
        setUpdateWeeklySchedule(buildEditableSchedule(schedule?.weeklySchedule || []));
        scheduleModalRef.current?.showModal();
    };

    // Schedule update modal closing function

    const closeScheduleUpdateModal = () => {
        scheduleModalRef.current?.close();
        setTimeout(() => {
            setUpdateWeeklySchedule([]);
        }, 500);
    };

    const hasSchedule = !!schedule?._id;

    // Schedule update function

    const handleUpdateSchedule = async (e) => {
        e.preventDefault();

        if (!userData?._id)
            return;

        const cleanedWeeklySchedule = updateWeeklySchedule.map((dayItem) => ({
            day: dayItem.day,
            classes: (dayItem.classes || []).filter(
                (item) => item.courseName?.trim() && item.startTime && item.endTime
            ),
            freeSlots: (dayItem.freeSlots || []).filter(
                (item) => item.startTime && item.endTime
            )
        }));

        const hasAnyEntry = cleanedWeeklySchedule.some(
            (dayItem) => dayItem.classes.length > 0 || dayItem.freeSlots.length > 0
        );

        if (!hasAnyEntry) {
            toast.error("Add at least one class or free slot");
            return;
        }

        try {
            setLoadingUpdateSchedule(true);

            let res;

            if (hasSchedule)
                res = await axiosSecure.patch("/schedule", {
                    facultyID: userData._id,
                    weeklySchedule: cleanedWeeklySchedule
                });
            else
                res = await axiosSecure.post("/schedule", {
                    facultyID: userData._id,
                    weeklySchedule: cleanedWeeklySchedule
                });

            if (!res?.data?.success) {
                closeScheduleUpdateModal();
                toast.error(res?.data?.message || "Schedule save failed");
                return;
            }

            if (res?.data?.schedule)
                setSchedule(res?.data?.schedule);
            else
                setSchedule((prev) => ({
                    ...prev,
                    weeklySchedule: cleanedWeeklySchedule
                }));

            setScheduleReminder("");

            closeScheduleUpdateModal();
            toast.success(hasSchedule ? "Schedule updated successfully" : "Schedule created successfully");
        } catch (error) {
            closeScheduleUpdateModal();
            toast.error(error?.response?.data?.message || "Schedule save failed");
        } finally {
            setLoadingUpdateSchedule(false);
        }
    };

    return (
        <div className='w-full max-w-full p-5 flex flex-col gap-10 gilroy'>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                    <p className='text-3xl graphik font-semibold text-gray-900'>My Schedule</p>
                    <p className='text-gray-500'>Sunday to Thursday schedule</p>
                </div>

                <div className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                    {`Week of ${format(weekStart, "MMMM d")} - ${format(weekEnd, "d, yyyy")}`}
                </div>
            </div>

            {/* Stats card */}

            <div className='w-full max-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-items-center gap-3'>
                {
                    loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <CardSkeleton key={i} variant="stat" />
                        )
                        )
                    ) :
                        (
                            stats.map(stat =>
                                <div key={stat.title} className='w-full min-w-0 p-5 rounded-lg shadow-lg flex flex-col gap-2 box-border border border-gray-100 hover:-translate-y-1 transition-all duration-300'>
                                    <div className='flex gap-3 items-center'>
                                        <div className={`w-10 h-10 rounded-xl flex justify-center items-center ${stat.iconBg}`}>
                                            <stat.logo className={`w-5 h-5 ${stat.icon} shrink-0`} />
                                        </div>

                                        <p className='text-gray-500 text-sm font-medium min-w-0 break-words'>{stat.title}</p>

                                    </div>
                                    <p className='text-3xl font-bold'>{stat.info}</p>
                                </div>
                            )
                        )
                }
            </div>

            {/* Filter and update button */}

            <div className="rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm p-4 md:p-6">
                <div className='flex justify-between items-center mb-5'>
                    <div className="flex flex-wrap items-center gap-3 ">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="text-sm font-medium text-blue-700">Appointment</span>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5">
                            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                            <span className="text-sm font-medium text-orange-700">Class</span>
                        </div>
                    </div>
                    <button className="w-30 flex gap-2 items-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-blue-600 duration-500 text-xs md:text-sm lg:text-md" onClick={openScheduleUpdateModal}><IoMdCreate />{
                        hasSchedule ? "Update" : "Create"
                    }</button>
                </div>
                {
                    !loading && scheduleReminder && (
                        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            <span className="font-semibold">Reminder:</span> {scheduleReminder}
                        </div>
                    )
                }
                {
                    loading
                        ?
                        <CardSkeleton variant="weeklyCalendar" />
                        :
                        <div className="w-full overflow-x-auto calendar-scroll">
                            <div className="min-w-[1000px]">
                                <FullCalendar
                                    plugins={[timeGridPlugin, interactionPlugin]}
                                    initialView="timeGridWeek"
                                    events={calendarEvents}
                                    firstDay={0}
                                    hiddenDays={[5, 6]}
                                    allDaySlot={false}
                                    headerToolbar={false}
                                    slotMinTime="08:00:00"
                                    slotMaxTime="18:00:00"
                                    slotDuration="00:30:00"
                                    dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'short' }}
                                    eventDisplay="block"
                                    height="auto"
                                    eventContent={(arg) => (
                                        <CalendarEventContent event={arg.event} timeText={arg.timeText} />
                                    )}
                                    eventClick={openDetailsModal}
                                />
                            </div>
                        </div>
                }
            </div>

            {/* Event details modal */}

            <dialog ref={detailsModalRef} className="modal modal-middle">
                <div className="modal-box max-w-md">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-lg font-bold text-gray-900">
                            {selectedEvent?.type === "appointment" ? "Appointment Details" : "Class Details"}
                        </p>
                        <button
                            type="button"
                            className="btn btn-sm btn-circle btn-ghost"
                            onClick={closeDetailsModal}
                        >
                            ✕
                        </button>
                    </div>

                    {
                        selectedEvent?.type === "appointment" ? (
                            <div className="flex flex-col gap-3 text-sm text-gray-700">
                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                    <p className="text-xs font-semibold text-gray-500 mb-1">Student</p>
                                    <p className="font-medium text-gray-900">{formatName(selectedEvent?.studentName)}</p>
                                    <p className="text-xs text-gray-500">{selectedEvent?.studentEmail || "No email"}</p>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                    <p><span className="font-semibold">Time:</span> {format(selectedEvent?.start, "hh:mm a")} - {format(selectedEvent?.end, "hh:mm a")}</p>
                                    <p><span className="font-semibold">Mode:</span> {formatName(selectedEvent?.mode)}</p>
                                    <p><span className="font-semibold">Type:</span> {formatName(selectedEvent?.meetingType)}</p>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                    <p className="text-xs font-semibold text-gray-500 mb-1">Purpose</p>
                                    <p>{selectedEvent?.purpose || "No purpose provided"}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 text-sm text-gray-700">
                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                    <p className="text-xs font-semibold text-gray-500 mb-1">Course</p>
                                    <p className="font-medium text-gray-900">{formatName(selectedEvent?.courseName) || "Unknown course"}</p>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                    <p><span className="font-semibold">Day:</span> {selectedEvent?.day}</p>
                                    <p><span className="font-semibold">Time:</span> {selectedEvent?.startTime} - {selectedEvent?.endTime}</p>
                                </div>
                            </div>
                        )
                    }
                </div>
            </dialog>

            {/* Schedule update modal */}

            <dialog ref={scheduleModalRef} className="modal modal-middle">
                <form onSubmit={handleUpdateSchedule} className="modal-box max-w-5xl">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xl font-bold text-gray-900">{hasSchedule ? "Update Schedule" : "Create Schedule"}
                        </p>
                        <button
                            type="button"
                            className="btn btn-sm btn-circle btn-ghost"
                            onClick={closeScheduleUpdateModal}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto pr-1 flex flex-col gap-5">
                        {
                            updateWeeklySchedule.map((dayItem, dayIndex) => (
                                <div key={dayItem.day} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-lg font-semibold text-gray-900">{dayItem.day}</p>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="w-30 btn btn-sm border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white"
                                                onClick={() => handleAddClass(dayIndex, setUpdateWeeklySchedule)}
                                            >
                                                Add Class
                                            </button>

                                            <button
                                                type="button"
                                                className="w-30 btn btn-sm border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white"
                                                onClick={() => handleAddFreeSlot(dayIndex, setUpdateWeeklySchedule)}
                                            >
                                                Add Free Slot
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-orange-600 mb-2">Classes</p>

                                            {
                                                dayItem.classes.length === 0 ? (
                                                    <p className="text-sm text-gray-400">No classes added</p>
                                                ) : (
                                                    <div className="flex flex-col gap-3">
                                                        {
                                                            dayItem.classes.map((classItem, classIndex) => (
                                                                <div key={classIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                                                    <input
                                                                        type="text"
                                                                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        placeholder="Course name"
                                                                        value={classItem.courseName}
                                                                        onChange={(e) =>
                                                                            handleClassChange(dayIndex, classIndex, "courseName", e.target.value, setUpdateWeeklySchedule)
                                                                        }
                                                                    />

                                                                    <input
                                                                        type="time"
                                                                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        value={classItem.startTime}
                                                                        onChange={(e) =>
                                                                            handleClassChange(dayIndex, classIndex, "startTime", e.target.value, setUpdateWeeklySchedule)
                                                                        }
                                                                    />

                                                                    <input
                                                                        type="time"
                                                                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        value={classItem.endTime}
                                                                        onChange={(e) =>
                                                                            handleClassChange(dayIndex, classIndex, "endTime", e.target.value, setUpdateWeeklySchedule)
                                                                        }
                                                                    />

                                                                    <button
                                                                        type="button"
                                                                        className="w-30 btn btn-sm border-red-200 text-red-600 hover:bg-red-600 hover:text-white"
                                                                        onClick={() => handleRemoveClass(dayIndex, classIndex, setUpdateWeeklySchedule)}
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            )
                                                            )
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-blue-600 mb-2">Free Slots</p>

                                            {
                                                dayItem.freeSlots.length === 0 ? (
                                                    <p className="text-sm text-gray-400">No free slots added</p>
                                                ) : (
                                                    <div className="flex flex-col gap-3">
                                                        {
                                                            dayItem.freeSlots.map((slot, slotIndex) => (
                                                                <div key={slotIndex} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                                                                    <input
                                                                        type="time"
                                                                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        value={slot.startTime}
                                                                        onChange={(e) =>
                                                                            handleFreeSlotChange(dayIndex, slotIndex, "startTime", e.target.value, setUpdateWeeklySchedule)
                                                                        }
                                                                    />

                                                                    <input
                                                                        type="time"
                                                                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        value={slot.endTime}
                                                                        onChange={(e) =>
                                                                            handleFreeSlotChange(dayIndex, slotIndex, "endTime", e.target.value, setUpdateWeeklySchedule)
                                                                        }
                                                                    />

                                                                    <button
                                                                        type="button"
                                                                        className="w-30 btn btn-sm border-red-200 text-red-600 hover:bg-red-600 hover:text-white"
                                                                        onClick={() => handleRemoveFreeSlot(dayIndex, slotIndex, setUpdateWeeklySchedule)}
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            )
                                                            )
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                    <div className="flex justify-end gap-2 mt-5">
                        <button type="button" className="btn btn-soft" onClick={closeScheduleUpdateModal}>
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="w-40 btn bg-[#1E40AF] text-white hover:bg-blue-600 border-none"
                            disabled={loadingUpdateSchedule}
                        >
                            {
                                loadingUpdateSchedule ? (
                                    <span className="loading loading-dots loading-md"></span>
                                ) : (
                                    hasSchedule ? "Update Schedule" : "Create Schedule"
                                )
                            }
                        </button>
                    </div>
                </form>
            </dialog>
        </div>
    );
};

export default FacultyMySchedule;

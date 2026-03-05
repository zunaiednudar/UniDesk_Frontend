import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRef, useState, useEffect, useContext } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axiosSecure from "../../utils/axiosSecure.js";
import { AuthContext } from "../../Providers/AuthProvider/AuthProvider.jsx";

const EVENT_TYPES = {
    appointment:  { bg: "#10b981", border: "#059669", light: "#f0fdf4", text: "#065f46" },
    announcement: { bg: "#3b82f6", border: "#2563eb", light: "#eff6ff", text: "#1d4ed8" },
    assignment:   { bg: "#f97316", border: "#ea580c", light: "#fff7ed", text: "#c2410c" }
};

const TYPE_LABELS = {
    appointment:  "Appointment",
    announcement: "Announcement",
    assignment:   "Assignment"
};

const Calendar = () => {
    const { userData } = useContext(AuthContext);
    const calendarRef = useRef(null);
    const [title, setTitle] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const getApi = () => calendarRef.current?.getApi();
    const prev    = () => { getApi()?.prev();  setTitle(getApi()?.view.title); };
    const next    = () => { getApi()?.next();  setTitle(getApi()?.view.title); };
    const goToday = () => { getApi()?.today(); setTitle(getApi()?.view.title); };

    useEffect(() => {
        const fetchAll = async () => {
            if (!userData?._id) return;
            setLoading(true);

            try {
                const mapped = [];

                // Appointments — use .appointments (plural) to match MyActivity.jsx
                const appointmentRes = await axiosSecure.get(`/appointment/student/${userData._id}`);
                (appointmentRes.data.appointments || []).forEach((a) => {
                    const cfg = EVENT_TYPES.appointment;
                    // Use date-only so it renders as a solid pill in month view
                    const startDate = new Date(a.startTime).toISOString().split("T")[0];
                    mapped.push({
                        id: `appointment-${a._id}`,
                        title: `Appointment — ${
                            a.faculty?.name
                                ? a.faculty.name.charAt(0).toUpperCase() + a.faculty.name.slice(1)
                                : "Faculty"
                        }`,
                        start: startDate,
                        allDay: true,
                        backgroundColor: cfg.bg,
                        borderColor:     cfg.border,
                        textColor:       "#ffffff",
                        extendedProps: {
                            type:      "appointment",
                            course:    a.faculty?.room ? `Room ${a.faculty.room}` : "",
                            status:    a.status,
                            startTime: a.startTime,
                            endTime:   a.endTime,
                        }
                    });
                });

                // Courses
                const coursesRes = await axiosSecure.get("/courses/my-courses");
                const activeCourses = coursesRes.data.activeCourses || [];
                const allCourses = [
                    ...activeCourses,
                    ...(coursesRes.data.completedCourses || [])
                ];

                // Announcements
                const announcementRequests = activeCourses.map(c =>
                    axiosSecure.get(`/course/${c._id}/announcements`)
                );
                const announcementResponses = await Promise.all(announcementRequests);
                announcementResponses.forEach((res, ci) => {
                    (res.data.announcements || []).forEach((a, idx) => {
                        const cfg = EVENT_TYPES.announcement;
                        mapped.push({
                            id: `announcement-${ci}-${idx}`,
                            title: a.title,
                            start: a.createdAt,
                            allDay: true,
                            backgroundColor: cfg.bg,
                            borderColor:     cfg.border,
                            textColor:       "#ffffff",
                            extendedProps: {
                                type:    "announcement",
                                course:  activeCourses[ci]?.courseName || "",
                                faculty: a.faculty?.name || "",
                                message: a.description,
                            }
                        });
                    });
                });

                // Assignments
                const assignmentRequests = allCourses.map(c =>
                    axiosSecure.get(`/course/${c._id}/assignments`)
                );
                const assignmentResponses = await Promise.all(assignmentRequests);
                assignmentResponses.forEach((res, ci) => {
                    (res.data.assignments || []).forEach((a, idx) => {
                        const cfg = EVENT_TYPES.assignment;
                        mapped.push({
                            id: `assignment-${ci}-${idx}`,
                            title: a.title,
                            start: a.dueDate,
                            allDay: true,
                            backgroundColor: cfg.bg,
                            borderColor:     cfg.border,
                            textColor:       "#ffffff",
                            extendedProps: {
                                type:   "assignment",
                                course: allCourses[ci]?.courseName || "",
                                message: a.description,
                            }
                        });
                    });
                });

                setEvents(mapped);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchAll();
    }, [userData]);

    return (
        <div className="gilroy space-y-6 rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Page title */}
            <div className="border-b border-gray-200 py-4">
                <h1 className="text-base font-bold text-gray-900">Calendar</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Track your appointments, announcements, and assignment deadlines
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 items-start">

                {/* FullCalendar */}
                <div className="bg-white border-b border-gray-200 overflow-hidden">

                    {/* Custom toolbar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <h2 className="text-base font-bold text-gray-900">
                                {title || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </h2>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={prev} className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={next} className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 fc-custom">
                        {loading ? (
                            <div className="h-[500px] flex items-center justify-center text-gray-400 text-sm">
                                Loading calendar...
                            </div>
                        ) : (
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={false}
                                weekends={true}
                                height="auto"
                                dayMaxEvents={3}
                                events={events}
                                datesSet={(info) => setTitle(info.view.title)}
                                eventClick={(info) => setSelectedEvent(info.event)}
                                eventContent={(info) => (
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 w-full overflow-hidden">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
                                        <span className="text-[11px] font-medium text-white truncate leading-tight">
                                            {info.event.title}
                                        </span>
                                    </div>
                                )}
                            />
                        )}
                    </div>
                </div>

                {/* Right panel */}
                <div className="flex flex-col gap-4">

                    {/* Selected event detail */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Event Detail
                        </p>
                        {!selectedEvent ? (
                            <div className="flex flex-col items-center py-6 text-gray-400">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2 text-lg">
                                    📅
                                </div>
                                <p className="text-xs font-medium text-center">Click an event to see details</p>
                            </div>
                        ) : (() => {
                            const type = selectedEvent.extendedProps?.type || "assignment";
                            const cfg  = EVENT_TYPES[type];
                            const isAppointment = type === "appointment";
                            return (
                                <div className="p-4 rounded-xl border" style={{ backgroundColor: cfg.light, borderColor: cfg.border }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.bg }} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.text }}>
                                            {TYPE_LABELS[type]}
                                        </span>
                                        {isAppointment && selectedEvent.extendedProps?.status && (
                                            <span className="ml-auto text-[10px] font-semibold capitalize text-gray-500">
                                                {selectedEvent.extendedProps.status}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm font-semibold text-gray-800">{selectedEvent.title}</p>

                                    {selectedEvent.extendedProps?.course && (
                                        <p className="text-xs text-gray-400 mt-1">{selectedEvent.extendedProps.course}</p>
                                    )}

                                    {selectedEvent.extendedProps?.faculty && (
                                        <p className="text-xs text-gray-400 mt-0.5">By {selectedEvent.extendedProps.faculty}</p>
                                    )}

                                    {selectedEvent.extendedProps?.message && (
                                        <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">
                                            {selectedEvent.extendedProps.message}
                                        </p>
                                    )}

                                    <p className="text-xs text-gray-400 mt-2">
                                        {isAppointment
                                            ? (() => {
                                                const s = selectedEvent.extendedProps?.startTime || selectedEvent.start;
                                                const e = selectedEvent.extendedProps?.endTime;
                                                return `${new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}${e ? " – " + new Date(e).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}, ${new Date(s).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
                                            })()
                                            : new Date(selectedEvent.start).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                                        }
                                    </p>

                                    <button
                                        onClick={() => setSelectedEvent(null)}
                                        className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition">
                                        Dismiss
                                    </button>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Legend */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Legend</p>
                        <div className="space-y-2.5">
                            {Object.entries(EVENT_TYPES).map(([key, cfg]) => (
                                <div key={key} className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.bg }} />
                                    <span className="text-sm text-gray-600 font-medium">{TYPE_LABELS[key]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .fc-custom .fc-theme-standard td,
                .fc-custom .fc-theme-standard th,
                .fc-custom .fc-theme-standard .fc-scrollgrid { border-color: #f3f4f6; }
                .fc-custom .fc-col-header-cell-cushion {
                    font-size: 11px; font-weight: 600; color: #9ca3af;
                    text-transform: uppercase; letter-spacing: 0.05em;
                    padding: 8px 4px; text-decoration: none;
                }
                .fc-custom .fc-daygrid-day-number {
                    font-size: 12px; font-weight: 600; color: #374151;
                    text-decoration: none; padding: 4px 6px;
                }
                .fc-custom .fc-day-today { background-color: #eff6ff !important; }
                .fc-custom .fc-day-today .fc-daygrid-day-number {
                    background-color: #2563eb; color: white; border-radius: 50%;
                    width: 24px; height: 24px; display: flex;
                    align-items: center; justify-content: center; padding: 0; margin: 4px;
                }
                .fc-custom .fc-daygrid-event { border-radius: 4px; margin: 1px 2px; cursor: pointer; }
                .fc-custom .fc-daygrid-event:hover { opacity: 0.85; }
                .fc-custom .fc-more-link { font-size: 10px; font-weight: 600; color: #6b7280; padding: 0 4px; }
            `}</style>
        </div>
    );
};

export default Calendar;
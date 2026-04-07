import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosSecure from "../../utils/axiosSecure.js";
import {
    CalendarDays, Plus, Trash2, Loader2,
    BookOpen, Clock, ChevronDown, ChevronUp, Save
} from "lucide-react";
import SectionHeader from "../../Components/SectionHeader/SectionHeader.jsx";
import SkeletonBlock from "../../Components/SkeletonBlock/SkeletonBlock.jsx";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DAY_COLORS = {
    Sunday:    { header: "bg-rose-50 text-rose-700 border-rose-100",    dot: "bg-rose-400"    },
    Monday:    { header: "bg-red-50 text-red-700 border-red-100",       dot: "bg-red-400"     },
    Tuesday:   { header: "bg-yellow-50 text-yellow-700 border-yellow-100", dot: "bg-yellow-400" },
    Wednesday: { header: "bg-green-50 text-green-700 border-green-100", dot: "bg-green-400"   },
    Thursday:  { header: "bg-pink-50 text-pink-700 border-pink-100",    dot: "bg-pink-400"    },
    Friday:    { header: "bg-purple-50 text-purple-700 border-purple-100", dot: "bg-purple-400" },
    Saturday:  { header: "bg-blue-50 text-blue-700 border-blue-100",    dot: "bg-blue-400"    },
};

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition bg-white";

const buildEditable = (weeklySchedule = []) =>
    DAYS.map((day) => {
        const existing = weeklySchedule.find((d) => d.day === day);
        return {
            day,
            classes:   (existing?.classes   || []).map((c) => ({ ...c })),
            freeSlots: (existing?.freeSlots || []).map((s) => ({ ...s })),
        };
    });

const findOverlap = (dayItem) => {
    const toMinutes = (t) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
    };

    const allSlots = [
        ...dayItem.classes.map((c) => ({ start: c.startTime, end: c.endTime, label: `Class "${c.courseName || "unnamed"}"` })),
        ...dayItem.freeSlots.map((s) => ({ start: s.startTime, end: s.endTime, label: "Free slot" })),
    ].filter((s) => s.start && s.end);

    for (let i = 0; i < allSlots.length; i++) {
        for (let j = i + 1; j < allSlots.length; j++) {
            const aStart = toMinutes(allSlots[i].start);
            const aEnd   = toMinutes(allSlots[i].end);
            const bStart = toMinutes(allSlots[j].start);
            const bEnd   = toMinutes(allSlots[j].end);
            if (aStart < bEnd && bStart < aEnd)
                return `${dayItem.day}: ${allSlots[i].label} overlaps with ${allSlots[j].label}`;
        }
    }
    return null;
};

const DayEditor = ({ dayItem, dayIndex, onChange }) => {
    const [open, setOpen] = useState(false);
    const colors = DAY_COLORS[dayItem.day];
    const totalEntries = dayItem.classes.length + dayItem.freeSlots.length;

    const setClasses   = (fn) => onChange(dayIndex, "classes",   fn(dayItem.classes));
    const setFreeSlots = (fn) => onChange(dayIndex, "freeSlots", fn(dayItem.freeSlots));

    const addClass = () =>
        setClasses((prev) => [...prev, { courseName: "", startTime: "", endTime: "" }]);

    const editClass = (idx, field, value) =>
        setClasses((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));

    const removeClass = (idx) =>
        setClasses((prev) => prev.filter((_, i) => i !== idx));

    const addSlot = () =>
        setFreeSlots((prev) => [...prev, { startTime: "", endTime: "" }]);

    const editSlot = (idx, field, value) =>
        setFreeSlots((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));

    const removeSlot = (idx) =>
        setFreeSlots((prev) => prev.filter((_, i) => i !== idx));

    return (
        <div className={`rounded-xl border ${colors.header.split(" ").find(c => c.startsWith("border-"))} overflow-hidden`}>
            {/* Day header */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`w-full flex items-center justify-between px-4 py-3 ${colors.header} transition-colors`}
            >
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <span className="text-sm font-bold">{dayItem.day}</span>
                    {totalEntries > 0 && (
                        <span className="text-[10px] font-semibold bg-white/60 rounded-full px-2 py-0.5">
                            {dayItem.classes.length} class{dayItem.classes.length !== 1 ? "es" : ""} · {dayItem.freeSlots.length} free slot{dayItem.freeSlots.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>
                {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {open && (
                <div className="bg-white px-4 py-4 space-y-5">
                    {/* Classes */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Classes</p>
                            <button
                                type="button"
                                onClick={addClass}
                                className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-700 transition"
                            >
                                <Plus size={12} /> Add Class
                            </button>
                        </div>

                        {dayItem.classes.length === 0 ? (
                            <p className="text-xs text-gray-300 italic">No classes for this day</p>
                        ) : (
                            <div className="space-y-2">
                                {dayItem.classes.map((cls, idx) => (
                                    <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="Course name"
                                            value={cls.courseName}
                                            onChange={(e) => editClass(idx, "courseName", e.target.value)}
                                            className={inputCls}
                                        />
                                        <input
                                            type="time"
                                            value={cls.startTime}
                                            onChange={(e) => editClass(idx, "startTime", e.target.value)}
                                            className={inputCls}
                                        />
                                        <input
                                            type="time"
                                            value={cls.endTime}
                                            onChange={(e) => editClass(idx, "endTime", e.target.value)}
                                            className={inputCls}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeClass(idx)}
                                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 transition"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Free slots */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Free Slots</p>
                            <button
                                type="button"
                                onClick={addSlot}
                                className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700 transition"
                            >
                                <Plus size={12} /> Add Slot
                            </button>
                        </div>

                        {dayItem.freeSlots.length === 0 ? (
                            <p className="text-xs text-gray-300 italic">No free slots for this day</p>
                        ) : (
                            <div className="space-y-2">
                                {dayItem.freeSlots.map((slot, idx) => (
                                    <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                        <input
                                            type="time"
                                            value={slot.startTime}
                                            onChange={(e) => editSlot(idx, "startTime", e.target.value)}
                                            className={inputCls}
                                        />
                                        <input
                                            type="time"
                                            value={slot.endTime}
                                            onChange={(e) => editSlot(idx, "endTime", e.target.value)}
                                            className={inputCls}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSlot(idx)}
                                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 transition"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const DayView = ({ dayItem }) => {
    const [open, setOpen] = useState(false);
    const colors = DAY_COLORS[dayItem.day];
    const totalEntries = (dayItem.classes?.length || 0) + (dayItem.freeSlots?.length || 0);

    if (totalEntries === 0) return null;

    return (
        <div className={`rounded-xl border ${colors.header.split(" ").find(c => c.startsWith("border-"))} overflow-hidden`}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`w-full flex items-center justify-between px-4 py-3 ${colors.header}`}
            >
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <span className="text-sm font-bold">{dayItem.day}</span>
                    <span className="text-[10px] font-semibold bg-white/60 rounded-full px-2 py-0.5">
                        {dayItem.classes?.length || 0} class{(dayItem.classes?.length || 0) !== 1 ? "es" : ""} · {dayItem.freeSlots?.length || 0} free slot{(dayItem.freeSlots?.length || 0) !== 1 ? "s" : ""}
                    </span>
                </div>
                {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {open && (
                <div className="bg-white px-4 py-4 space-y-4">
                    {dayItem.classes?.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">Classes</p>
                            <div className="space-y-1.5">
                                {dayItem.classes.map((cls, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                                        <BookOpen size={13} className="text-orange-400 shrink-0" />
                                        <span className="text-sm font-medium text-gray-700 flex-1 truncate">{cls.courseName || "—"}</span>
                                        <span className="text-xs text-gray-500 shrink-0">{cls.startTime} – {cls.endTime}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {dayItem.freeSlots?.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Free Slots</p>
                            <div className="space-y-1.5">
                                {dayItem.freeSlots.map((slot, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                                        <Clock size={13} className="text-blue-400 shrink-0" />
                                        <span className="text-xs text-gray-500">{slot.startTime} – {slot.endTime}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ScheduleSection = ({ faculty, facultyLoading }) => {
    const [schedule, setSchedule]         = useState(null);
    const [scheduleLoading, setScheduleLoading] = useState(true);
    const [saving, setSaving]             = useState(false);

    // edit mode state
    const [editing, setEditing]           = useState(false);
    const [editableSchedule, setEditable] = useState([]);

    const hasSchedule = !!schedule?._id;

    // Fetch schedule
    const fetchSchedule = async (id) => {
        setScheduleLoading(true);
        try {
            const res = await axiosSecure.get(`/schedule/${id}`);
            if (res.data.success) setSchedule(res.data.schedule);
            else setSchedule(null);
        } catch {
            setSchedule(null);
        } finally {
            setScheduleLoading(false);
        }
    };

    useEffect(() => {
        if (faculty?.id) fetchSchedule(faculty.id);
    }, [faculty]);

    const openEdit = () => {
        setEditable(buildEditable(schedule?.weeklySchedule || []));
        setEditing(true);
    };

    const cancelEdit = () => {
        setEditing(false);
        setEditable([]);
    };

    const handleDayChange = (dayIndex, field, value) => {
        setEditable((prev) =>
            prev.map((d, i) => i === dayIndex ? { ...d, [field]: value } : d)
        );
    };

    const handleSave = async () => {
        for (const dayItem of editableSchedule) {
            const conflict = findOverlap(dayItem);
            if (conflict) {
                toast.error(conflict);
                return;
            }
        }

        // Clean empty entries
        const cleanedSchedule = editableSchedule.map((d) => ({
            day: d.day,
            classes:   (d.classes   || []).filter((c) => c.courseName?.trim() && c.startTime && c.endTime),
            freeSlots: (d.freeSlots || []).filter((s) => s.startTime && s.endTime),
        }));

        const hasAny = cleanedSchedule.some((d) => d.classes.length > 0 || d.freeSlots.length > 0);
        if (!hasAny) {
            toast.error("Add at least one class or free slot before saving.");
            return;
        }

        setSaving(true);
        try {
            let res;
            if (hasSchedule) {
                res = await axiosSecure.patch("/schedule", {
                    facultyID: faculty.id,
                    weeklySchedule: cleanedSchedule,
                });
            } else {
                res = await axiosSecure.post("/schedule", {
                    facultyID: faculty.id,
                    weeklySchedule: cleanedSchedule,
                });
            }

            if (!res.data.success) {
                toast.error(res.data.message || "Save failed");
                return;
            }

            if (res.data.schedule) setSchedule(res.data.schedule);
            else setSchedule((prev) => ({ ...prev, weeklySchedule: cleanedSchedule }));

            toast.success(hasSchedule ? "Schedule updated successfully" : "Schedule created successfully");
            setEditing(false);
            setEditable([]);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    // Summary counts for the header badge
    const totalClasses   = schedule?.weeklySchedule?.reduce((acc, d) => acc + (d.classes?.length   || 0), 0) ?? 0;
    const totalFreeSlots = schedule?.weeklySchedule?.reduce((acc, d) => acc + (d.freeSlots?.length || 0), 0) ?? 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <SectionHeader
                        icon={CalendarDays}
                        title="Weekly Schedule"
                        iconBg="bg-orange-50"
                        iconColor="text-orange-500"
                        navigate={false}
                    />
                    {!scheduleLoading && hasSchedule && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {totalClasses} class{totalClasses !== 1 ? "es" : ""} · {totalFreeSlots} free slot{totalFreeSlots !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {!facultyLoading && !scheduleLoading && (
                    editing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={cancelEdit}
                                className="px-3.5 py-2 text-xs font-semibold border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-60 transition"
                            >
                                {saving
                                    ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                                    : <><Save size={13} /> {hasSchedule ? "Save Changes" : "Create Schedule"}</>
                                }
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={openEdit}
                            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-600 active:scale-95 transition-all"
                        >
                            <CalendarDays size={13} />
                            {hasSchedule ? "Edit Schedule" : "Create Schedule"}
                        </button>
                    )
                )}
            </div>

            {/* Body */}
            {scheduleLoading || facultyLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-12" />)}
                </div>
            ) : editing ? (
                <div className="space-y-3">
                    {editableSchedule.map((dayItem, dayIndex) => (
                        <DayEditor
                            key={dayItem.day}
                            dayItem={dayItem}
                            dayIndex={dayIndex}
                            onChange={handleDayChange}
                        />
                    ))}
                </div>
            ) : !hasSchedule ? (
                <div className="flex flex-col items-center py-10 text-center">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                        <CalendarDays size={18} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">No schedule has been set for this faculty.</p>
                    <p className="text-xs text-gray-300 mt-1">Use the "Create Schedule" button to add one.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {(schedule.weeklySchedule || []).map((dayItem) => (
                        <DayView key={dayItem.day} dayItem={dayItem} />
                    ))}
                    {schedule.weeklySchedule?.every(
                        (d) => (d.classes?.length || 0) + (d.freeSlots?.length || 0) === 0
                    ) && (
                        <p className="text-xs text-gray-300 italic text-center py-6">
                            Schedule exists but has no entries.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScheduleSection;
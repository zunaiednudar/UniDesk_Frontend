import {useContext, useEffect, useState} from 'react';
import {
    Search, Mail, Calendar, MapPin, BookOpen,
    AlertCircle, Users, Clock, CheckCircle2,
    XCircle, X, Loader2
} from 'lucide-react';
// Note: Mail is kept for the "Message" mailto link on instructor cards
import axiosSecure from "../../utils/axiosSecure.js";
import formatName from "../../utils/formatName.js";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider.jsx";

const availabilityConfig = {
    verified: {dot: 'bg-green-400', badge: 'bg-green-100 text-green-700', label: 'Available'},
    pending: {dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700', label: 'Pending'},
    suspended: {dot: 'bg-red-400', badge: 'bg-red-100 text-red-700', label: 'Unavailable'},
};

const appointmentStatusConfig = {
    pending: {
        badge: 'bg-yellow-50 border border-yellow-200',
        dot: 'bg-yellow-400',
        text: 'text-yellow-700',
        label: 'Pending',
        icon: Clock
    },
    approved: {
        badge: 'bg-green-50 border border-green-200',
        dot: 'bg-green-500',
        text: 'text-green-700',
        label: 'Approved',
        icon: CheckCircle2
    },
    rejected: {
        badge: 'bg-red-50 border border-red-200',
        dot: 'bg-red-400',
        text: 'text-red-600',
        label: 'Rejected',
        icon: XCircle
    },
    cancelled: {
        badge: 'bg-gray-50 border border-gray-200',
        dot: 'bg-gray-400',
        text: 'text-gray-600',
        label: 'Cancelled',
        icon: X
    },
};

const getInitials = (name = '') =>
    name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);

const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
};

// Converts "HH:MM" (24hr) to "hh:MM AM/PM" (12hr) for display
const to12hr = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const Avatar = ({photoURL, name, size = 'lg'}) => {
    const sz = size === 'lg' ? 'w-16 h-16 text-lg' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
    return photoURL ? (
        <img src={photoURL} alt={name}
             className={`${sz} rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm`}/>
    ) : (
        <div
            className={`${sz} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold flex-shrink-0 ring-2 ring-white shadow-sm`}>
            {getInitials(name)}
        </div>
    );
};

const MetaRow = ({icon: Icon, children, href, linkClass = ''}) => (
    <div className="flex items-start gap-2.5 text-sm text-gray-600">
        <Icon size={14} className="text-gray-400 flex-shrink-0 mt-0.5"/>
        {href ? (
            <a href={href} className={`hover:underline truncate ${linkClass}`}>{children}</a>
        ) : (
            <span className="truncate">{children}</span>
        )}
    </div>
);

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
        <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0"/>
            <div className="flex-1 space-y-2">
                <div className="h-4 w-36 bg-gray-200 rounded"/>
                <div className="h-3 w-28 bg-gray-100 rounded"/>
                <div className="h-5 w-20 bg-gray-100 rounded-full mt-2"/>
            </div>
        </div>
        <div className="space-y-2 mb-4">
            <div className="h-3 w-48 bg-gray-100 rounded"/>
            <div className="h-3 w-36 bg-gray-100 rounded"/>
        </div>
        <div className="flex gap-3">
            <div className="flex-1 h-10 bg-gray-100 rounded-xl"/>
            <div className="flex-1 h-10 bg-gray-100 rounded-xl"/>
        </div>
    </div>
);

const EmptyState = ({message, onClear}) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center col-span-full">
        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-300"/>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">{message ?? 'No instructors found'}</h3>
        {onClear && (
            <>
                <p className="text-sm text-gray-400 mb-4">Try adjusting your search or clear it to see all
                    instructors.</p>
                <button onClick={onClear}
                        className="px-5 py-2 text-sm font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition">
                    Clear Search
                </button>
            </>
        )}
    </div>
);

const MEETING_TYPES = [
    {value: 'general', label: 'General (default)'},
    {value: 'thesis', label: 'Thesis'},
    {value: 'project', label: 'Project'},
];

// Maps JS getDay() index to schedule day names
const JS_DAY_TO_SCHEDULE = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Returns true if time HH:MM falls within any busy slot on that day's schedule
const isTimeBusy = (schedule, dayName, time) => {
    if (!schedule) return false;
    const dayEntry = schedule.weeklySchedule?.find(d => d.day === dayName);
    if (!dayEntry) return false;
    const allSlots = [...(dayEntry.classes || []), ...(dayEntry.freeSlots || [])];
    // Mark class slots as busy; freeSlots are actually free so only block classes
    const busySlots = dayEntry.classes || [];
    return busySlots.some(slot => {
        const slotStart = slot.startTime ?? slot.from;
        const slotEnd = slot.endTime ?? slot.to;
        if (!slotStart || !slotEnd) return false;
        return time >= slotStart && time < slotEnd;
    });
};

// Returns true if the chosen [from, to] range overlaps any busy class slot
const rangeOverlapsBusy = (schedule, dayName, from, to) => {
    if (!schedule || !from || !to) return false;
    const dayEntry = schedule.weeklySchedule?.find(d => d.day === dayName);
    if (!dayEntry) return false;
    const busySlots = dayEntry.classes || [];
    return busySlots.some(slot => {
        const slotStart = slot.startTime ?? slot.from;
        const slotEnd = slot.endTime ?? slot.to;
        if (!slotStart || !slotEnd) return false;
        // overlap: from < slotEnd AND to > slotStart
        return from < slotEnd && to > slotStart;
    });
};

const BookingModal = ({instructor, onClose, onBooked}) => {
    const emptyForm = {
        date: '',
        from: '',
        to: '',
        topic: '',
        format: '',
        meetingType: 'general',
    };

    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState(false);

    // Faculty schedule state
    const [schedule, setSchedule] = useState(null);
    const [scheduleLoading, setScheduleLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            setScheduleLoading(true);
            try {
                const r = await axiosSecure.get(`/schedule/${instructor.id}`);
                // Backend may return { schedule: {...} } or the object directly
                const raw = r.data?.schedule ?? r.data ?? null;
                // Validate it actually has weeklySchedule before storing
                const parsed = raw?.weeklySchedule ? raw : null;
                console.log('[Schedule] raw:', raw, '→ parsed:', parsed);
                setSchedule(parsed);
            } catch (err) {
                console.warn('[Schedule] fetch failed:', err?.response?.status, err?.response?.data);
                setSchedule(null);
            } finally {
                setScheduleLoading(false);
            }
        };
        fetchSchedule();
    }, [instructor.id]);

    // Derived: which day of week is the selected date?
    const selectedDayName = (() => {
        if (!form.date) return null;
        // Parse yyyy-mm-dd directly to avoid any timezone shifting
        const [y, m, d] = form.date.split('-').map(Number);
        return JS_DAY_TO_SCHEDULE[new Date(y, m - 1, d).getDay()];
    })();

    // Busy class slots for the selected day (to render hint list)
    const busySlotsForDay = (() => {
        if (!schedule || !selectedDayName) return [];
        const dayEntry = schedule.weeklySchedule?.find(d => d.day === selectedDayName);
        return dayEntry?.classes || [];
    })();

    // Free slots for selected day — used for min/max on time inputs
    const freeSlotsForDay = (() => {
        if (!schedule || !selectedDayName) return [];
        const dayEntry = schedule.weeklySchedule?.find(d => d.day === selectedDayName);
        return dayEntry?.freeSlots || [];
    })();

    // If a from time is picked, find which free slot it belongs to (to set max on "to")
    const activeFreeSlot = (() => {
        if (!form.from || freeSlotsForDay.length === 0) return null;
        return freeSlotsForDay.find(slot =>
            form.from >= slot.startTime && form.from < slot.endTime
        ) || null;
    })();

    // Frontend guard: check if from/to is strictly inside any free slot
    const isInsideFreeSlot = (from, to) => {
        if (!from || !to || freeSlotsForDay.length === 0) return false;
        return freeSlotsForDay.some(slot =>
            from >= slot.startTime && to <= slot.endTime
        );
    };

    const handleChange = (e) => {
        setSuccess(false);
        setFormError('');
        setForm(f => ({...f, [e.target.name]: e.target.value}));
    };

    const handleSubmit = async () => {
        const {date, from, to, topic, format} = form;

        if (!date || !from || !to || !topic.trim()) {
            setFormError('Please fill in all fields.');
            return;
        }
        if (!format) {
            setFormError('Please select an appointment format.');
            return;
        }
        if (from >= to) {
            setFormError('End time must be after start time.');
            return;
        }

        // Check time is inside a free slot (backend enforces this strictly)
        if (schedule && freeSlotsForDay.length > 0 && !isInsideFreeSlot(from, to)) {
            setFormError("Please choose a time within the available slots shown above.");
            return;
        }

        // Check against faculty schedule class conflicts
        if (schedule && selectedDayName && rangeOverlapsBusy(schedule, selectedDayName, from, to)) {
            setFormError("This time slot overlaps with the faculty's class schedule. Please choose a different time.");
            return;
        }

        setFormError('');
        setSubmitting(true);
        try {
            const payload = {
                facultyID: instructor.id,
                // Send as plain yyyy-mm-dd — backend concatenates date + startTime itself
                // e.g. new Date(`${date}T${startTime}:00`) so date must stay bare
                date,
                startTime: from,
                endTime: to,
                purpose: topic.trim(),
                mode: format,
                meetingType: form.meetingType || 'general',
            };

            const res = await axiosSecure.post('/appointment', payload);
            console.log('Appointment booked:', res);

            onBooked();
            setSuccess(true);
            setForm(emptyForm);
        } catch (err) {
            console.error('Booking error:', err);
            setFormError(err?.response?.data?.message ?? 'Booking failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const inputCls = 'w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition bg-white';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                    <div className="flex items-center gap-3">
                        <Avatar photoURL={instructor.photoURL} name={instructor.name} size="md"/>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">{instructor.name}</h3>
                            {instructor.designation && (
                                <p className="text-xs text-gray-400">{instructor.designation}</p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={18}/>
                    </button>
                </div>

                {/* Form body */}
                <div className="px-6 py-5 space-y-4">
                    <div>
                        <h4 className="text-base font-semibold text-gray-900">Book an Appointment</h4>
                        <p className="text-xs text-gray-400 mt-1">
                            Your request will be <span className="font-semibold text-yellow-600">pending</span> until
                            the faculty approves it.
                        </p>
                    </div>

                    {/* Success banner */}
                    {success && (
                        <div
                            className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                            <CheckCircle2 size={15} className="text-green-500 flex-shrink-0"/>
                            <p className="text-xs font-medium text-green-700">
                                Appointment requested! Pending approval by {instructor.name}.
                            </p>
                        </div>
                    )}

                    {/* Date */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Date <span className="text-red-400">*</span>
                        </label>
                        <input type="date" name="date" min={today}
                               value={form.date} onChange={handleChange}
                               className={inputCls}/>
                        {/* Show busy class slots for selected day */}
                        {scheduleLoading && (
                            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                <Loader2 size={11} className="animate-spin"/> Loading schedule…
                            </p>
                        )}
                        {!scheduleLoading && form.date && busySlotsForDay.length > 0 && (
                            <div className="mt-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 space-y-1">
                                <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                                    <AlertCircle size={11}/> Busy on {selectedDayName}
                                </p>
                                {busySlotsForDay.map((slot, i) => {
                                    const s = slot.startTime ?? slot.from ?? '';
                                    const e = slot.endTime ?? slot.to ?? '';
                                    return (
                                        <p key={i} className="text-xs text-red-500 pl-4">
                                            {slot.courseName || slot.subject || 'Class'}: {to12hr(s)} – {to12hr(e)}
                                        </p>
                                    );
                                })}
                            </div>
                        )}
                        {/* Free slots hint */}
                        {!scheduleLoading && form.date && selectedDayName && (() => {
                            const dayEntry = schedule?.weeklySchedule?.find(d => d.day === selectedDayName);
                            const freeSlots = dayEntry?.freeSlots || [];
                            if (!schedule) return null;
                            if (!dayEntry) return (
                                <p className="text-xs text-orange-500 mt-1.5 flex items-center gap-1">
                                    <AlertCircle size={11}/> Faculty has no schedule for {selectedDayName}
                                </p>
                            );
                            return freeSlots.length > 0 ? (
                                <div
                                    className="mt-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 space-y-1">
                                    <p className="text-xs font-semibold text-green-700 flex items-center gap-1.5">
                                        <CheckCircle2 size={11}/> Available slots on {selectedDayName}
                                    </p>
                                    {freeSlots.map((slot, i) => (
                                        <p key={i} className="text-xs text-green-600 pl-4">
                                            {to12hr(slot.startTime)} – {to12hr(slot.endTime)}
                                        </p>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-orange-500 mt-1.5 flex items-center gap-1">
                                    <AlertCircle size={11}/> No free slots on {selectedDayName}
                                </p>
                            );
                        })()}
                    </div>

                    {/* From / To */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                From <span className="text-red-400">*</span>
                            </label>
                            <input type="time" name="from"
                                   value={form.from} onChange={handleChange}
                                   min={freeSlotsForDay.length === 1 ? freeSlotsForDay[0].startTime : undefined}
                                   max={freeSlotsForDay.length === 1 ? freeSlotsForDay[0].endTime : undefined}
                                   className={`${inputCls} ${
                                       form.from && selectedDayName && rangeOverlapsBusy(schedule, selectedDayName, form.from, form.to || form.from)
                                           ? 'border-red-400 ring-2 ring-red-100'
                                           : ''
                                   }`}/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                To <span className="text-red-400">*</span>
                            </label>
                            <input type="time" name="to"
                                   value={form.to} onChange={handleChange}
                                   min={activeFreeSlot ? activeFreeSlot.startTime : (freeSlotsForDay.length === 1 ? freeSlotsForDay[0].startTime : undefined)}
                                   max={activeFreeSlot ? activeFreeSlot.endTime : (freeSlotsForDay.length === 1 ? freeSlotsForDay[0].endTime : undefined)}
                                   className={`${inputCls} ${
                                       form.to && selectedDayName && rangeOverlapsBusy(schedule, selectedDayName, form.from || form.to, form.to)
                                           ? 'border-red-400 ring-2 ring-red-100'
                                           : ''
                                   }`}/>
                        </div>
                    </div>
                    {/* Real-time overlap warning */}
                    {form.from && form.to && selectedDayName && rangeOverlapsBusy(schedule, selectedDayName, form.from, form.to) && (
                        <div
                            className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 -mt-2">
                            <AlertCircle size={13} className="flex-shrink-0"/>
                            This time overlaps with the faculty's class. Please pick a different slot.
                        </div>
                    )}

                    {/* Topic */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Topic / Purpose <span className="text-red-400">*</span>
                        </label>
                        <textarea name="topic" rows={3}
                                  placeholder="e.g. Assignment clarification, project discussion…"
                                  value={form.topic} onChange={handleChange}
                                  className={`${inputCls} resize-none`}/>
                    </div>

                    {/* Format */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Format <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                {value: 'online', label: '🎥 Online'},
                                {value: 'in-person', label: '🏢 In-Person'},
                            ].map(opt => (
                                <button key={opt.value} type="button"
                                        onClick={() => {
                                            setSuccess(false);
                                            setFormError('');
                                            setForm(f => ({...f, format: opt.value}));
                                        }}
                                        className={`py-2.5 text-sm font-semibold rounded-xl border transition
                                        ${form.format === opt.value
                                            ? 'bg-orange-500 border-orange-500 text-white'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Meeting type */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Meeting Type <span className="text-gray-300 font-normal">(optional)</span>
                        </label>
                        <select name="meetingType" value={form.meetingType} onChange={handleChange}
                                className={inputCls}>
                            {MEETING_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Error */}
                    {formError && (
                        <div
                            className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                            <AlertCircle size={13} className="flex-shrink-0"/>
                            {formError}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onClose}
                            className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition">
                        {success ? 'Close' : 'Cancel'}
                    </button>
                    <button onClick={handleSubmit} disabled={submitting}
                            className="flex-1 py-2.5 text-sm font-semibold bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
                        {submitting
                            ? <><Loader2 size={14} className="animate-spin"/> Booking…</>
                            : <><Calendar size={14}/> {success ? 'Book Another' : 'Confirm Booking'}</>}
                    </button>
                </div>
            </div>
        </div>
    );
};


const InstructorCard = ({instructor, onBookClick}) => {
    const avail = availabilityConfig[instructor.status] ?? availabilityConfig.verified;

    return (
        <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-orange-100 transition-all duration-200 flex flex-col">

            {/* Header */}
            <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-100">
                <Avatar photoURL={instructor.photoURL} name={instructor.name}/>
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 truncate">{instructor.name}</h3>
                    {instructor.designation && (
                        <p className="text-sm text-gray-500 truncate">{instructor.designation}</p>
                    )}
                    {instructor.department && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{instructor.department}</p>
                    )}
                    <div className="mt-2">
                        <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${avail.badge}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${avail.dot}`}/>
                            {avail.label}
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses */}
            <div className="mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-1.5 mb-2">
                    <BookOpen size={13} className="text-orange-400"/>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teaching</span>
                </div>
                <div className="space-y-1.5">
                    {instructor.courses.map(c => (
                        <div key={c.id} className="flex items-start gap-2">
                            <span
                                className="text-xs font-bold text-orange-600 bg-orange-50 rounded px-1.5 py-0.5 flex-shrink-0">
                                {c.courseCode}
                            </span>
                            <span className="text-sm text-gray-700">{c.courseName}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                    <Users size={11}/>
                    <span>{instructor.totalStudents} students across enrolled courses</span>
                </div>
            </div>

            {/* Contact */}
            <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                <MetaRow icon={Mail} href={`mailto:${instructor.email}`} linkClass="text-blue-500">
                    {instructor.email}
                </MetaRow>
                {instructor.room && (
                    <MetaRow icon={MapPin}>Room {instructor.room}</MetaRow>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col lg:flex-row gap-2.5 mt-auto">
                <a href={`mailto:${instructor.email}`}
                   className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-blue-500 text-white rounded-xl hover:bg-blue-600 active:scale-95 transition-all duration-150">
                    <Mail size={14}/>
                    Message
                </a>
                <button
                    onClick={() => onBookClick(instructor)}
                    disabled={instructor.status === 'suspended'}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-150">
                    <Calendar size={14}/>
                    Book Slot
                </button>
            </div>
        </div>
    );
};

const AppointmentRow = ({appointment}) => {
    const cfg = appointmentStatusConfig[appointment.status?.toLowerCase()] ?? appointmentStatusConfig.pending;
    const Icon = cfg.icon;
    const isPast = new Date(appointment.startTime) < new Date();

    return (
        <div
            className={`flex items-center gap-3 px-2 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-md transition-colors ${isPast && appointment.status === 'pending' ? 'opacity-60' : ''}`}>
            {/* Status dot */}
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`}/>

            {/* Faculty + purpose */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{appointment.facultyName}</p>
                {appointment.purpose && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{appointment.purpose}</p>
                )}
            </div>

            {/* Mode pill */}
            {appointment.mode && (
                <span
                    className="hidden sm:inline-flex flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                    {appointment.mode === 'online' ? '🎥 Online' : '🏢 In-Person'}
                </span>
            )}

            {/* Date + time */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                <Calendar size={11}/>
                <span>{formatDateTime(appointment.startTime)}</span>
                <span className="text-gray-300">–</span>
                <span>{formatTime(appointment.endTime)}</span>
            </div>

            {/* Status badge */}
            <div
                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
                <Icon size={11} className={cfg.text} strokeWidth={2.5}/>
                <span className={cfg.text}>{cfg.label}</span>
            </div>
        </div>
    );
};

const AskMentor = () => {
    const {userData} = useContext(AuthContext);

    const [instructors, setInstructors] = useState([]);
    const [loadingInst, setLoadingInst] = useState(true);
    const [instError, setInstError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [appointments, setAppointments] = useState([]);
    const [loadingAppt, setLoadingAppt] = useState(true);
    const [apptFilter, setApptFilter] = useState('all');

    const [bookingFor, setBookingFor] = useState(null); // instructor object or null

    useEffect(() => {
        const fetchInstructors = async () => {
            if (!userData?._id) return;
            setLoadingInst(true);
            setInstError(null);
            try {
                // /courses/my-courses already populates faculties with _id, name, email
                // (and photoURL if backend includes it). No need for per-course fetches —
                // singleCourse has no .populate() so it returns raw ObjectIds, useless here.
                const coursesRes = await axiosSecure.get('/courses/my-courses');
                const activeCourses = coursesRes.data.activeCourses || [];
                const completedCourses = coursesRes.data.completedCourses || [];
                const allCourses = [...activeCourses, ...completedCourses];

                // Build one entry per unique faculty across all courses
                const facultyMap = new Map();

                for (const course of allCourses) {
                    const faculties = Array.isArray(course.faculties) ? course.faculties : [];
                    const studentCount = Array.isArray(course.students) ? course.students.length : 0;

                    for (const faculty of faculties) {
                        const id = faculty._id?.toString();
                        if (!id) continue;

                        if (!facultyMap.has(id)) {
                            facultyMap.set(id, {
                                id,
                                name: formatName(faculty.name) ?? 'Unknown Faculty',
                                email: faculty.email ?? '',
                                designation: faculty.designation ?? '',
                                department: faculty.department ?? '',
                                room: faculty.room ?? '',
                                photoURL: faculty.photoURL ?? null,
                                status: faculty.status ?? 'verified',
                                courses: [],
                                totalStudents: 0,
                            });
                        }

                        facultyMap.get(id).courses.push({
                            id: course._id,
                            courseCode: course.courseCode,
                            courseName: course.courseName,
                            students: studentCount,
                        });
                        facultyMap.get(id).totalStudents += studentCount;
                    }
                }

                const enriched = [...facultyMap.values()].sort((a, b) => {
                    if (a.status === 'verified' && b.status !== 'verified') return -1;
                    if (a.status !== 'verified' && b.status === 'verified') return 1;
                    return a.name.localeCompare(b.name);
                });

                setInstructors(enriched);
            } catch (err) {
                console.error('Failed to fetch faculties:', err);
                setInstError('Failed to load faculties. Please try again.');
            } finally {
                setLoadingInst(false);
            }
        };
        fetchInstructors();
    }, [userData]);

    const fetchAppointments = async () => {
        if (!userData?._id) return;
        setLoadingAppt(true);
        try {
            const res = await axiosSecure.get(`/appointment/student/${userData._id}`);
            console.log('Appointments:', res);
            const raw = res.data.appointments || [];

            const mapped = raw.map(a => ({
                id: a._id,
                facultyName: formatName(a.faculty?.name) ?? 'Unknown Faculty',
                facultyId: a.faculty?._id ?? a.faculty,
                startTime: a.startTime,
                endTime: a.endTime,
                purpose: a.purpose ?? '',
                mode: a.mode ?? '',
                meetingType: a.meetingType ?? '',
                status: a.status ?? 'pending',
            }));

            mapped.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

            setAppointments(mapped);
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
        } finally {
            setLoadingAppt(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [userData]);

    const filteredInst = instructors.filter(inst => {
        const q = searchQuery.toLowerCase();
        return (
            inst.name?.toLowerCase().includes(q) ||
            inst.department?.toLowerCase().includes(q) ||
            inst.designation?.toLowerCase().includes(q) ||
            inst.courses.some(c =>
                c.courseCode?.toLowerCase().includes(q) ||
                c.courseName?.toLowerCase().includes(q)
            )
        );
    });

    const filteredAppt = apptFilter === 'all'
        ? appointments
        : appointments.filter(a => a.status === apptFilter);

    // Appointment counts
    const apptCounts = appointments.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="graphik text-3xl font-semibold text-gray-900">My Mentors</h1>
                <p className="text-sm text-gray-400 mt-1">Stay connected with instructors and mentors across your
                    courses and activities</p>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                <AlertCircle size={15} className="text-blue-400 flex-shrink-0 mt-0.5"/>
                <p className="text-sm text-blue-700">
                    Showing instructors from your currently enrolled courses. Booked appointments
                    remain <strong>pending</strong> until approved by the faculty.
                </p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="relative">
                    <Search size={15} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                    <input
                        type="text"
                        placeholder="Search by name, course, department or designation…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                    />
                </div>
            </div>

            {/* Error */}
            {instError && (
                <div
                    className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={15} className="flex-shrink-0"/>
                    {instError}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {loadingInst ? (
                    [1, 2, 3, 4].map(i => <SkeletonCard key={i}/>)
                ) : filteredInst.length === 0 ? (
                    <EmptyState onClear={() => setSearchQuery('')}/>
                ) : (
                    filteredInst.map(inst => (
                        <InstructorCard
                            key={inst.id}
                            instructor={inst}
                            onBookClick={setBookingFor}
                        />
                    ))
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Calendar size={14} className="text-purple-500" strokeWidth={2}/>
                        </div>
                        <h2 className="text-sm font-bold text-gray-900">My Appointments</h2>
                        {!loadingAppt && (
                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                                {appointments.length}
                            </span>
                        )}
                    </div>

                    {/* Filter pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(s => {
                            const isActive = apptFilter === s;
                            const count = s === 'all' ? appointments.length : (apptCounts[s] ?? 0);
                            return (
                                <button key={s}
                                        onClick={() => setApptFilter(s)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition capitalize
                                        ${isActive
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                    {s === 'all' ? 'All' : s} {count > 0 &&
                                    <span className="ml-0.5 opacity-70">({count})</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Rows */}
                <div className="px-3">
                    {loadingAppt ? (
                        <div className="space-y-0">
                            {[1, 2, 3].map(i => (
                                <div key={i}
                                     className="flex items-center gap-3 px-2 py-3 border-b border-gray-100 animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-gray-200"/>
                                    <div className="flex-1 h-3 bg-gray-200 rounded"/>
                                    <div className="w-32 h-3 bg-gray-100 rounded hidden sm:block"/>
                                    <div className="w-20 h-6 bg-gray-100 rounded-full"/>
                                </div>
                            ))}
                        </div>
                    ) : filteredAppt.length === 0 ? (
                        <div className="flex flex-col items-center py-10 text-gray-400 text-sm">
                            <Calendar size={28} className="text-gray-200 mb-2"/>
                            {apptFilter === 'all' ? 'No appointments booked yet.' : `No ${apptFilter} appointments.`}
                        </div>
                    ) : (
                        filteredAppt.map(a => <AppointmentRow key={a.id} appointment={a}/>)
                    )}
                </div>
            </div>

            {bookingFor && (
                <BookingModal
                    instructor={bookingFor}
                    onClose={() => setBookingFor(null)}
                    onBooked={fetchAppointments}
                />
            )}
        </div>
    );
};

export default AskMentor;
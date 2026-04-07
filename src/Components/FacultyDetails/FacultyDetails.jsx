import {useNavigate, useParams} from "react-router";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Providers/AuthProvider/AuthProvider.jsx";
import axiosSecure from "../../utils/axiosSecure.js";
import { toast } from "sonner";
import {
    ArrowLeft, Mail, Phone, MapPin,
    Users, UserPlus, ChevronRight, X,
    Clock, Search, Loader2, UserCheck,
    AlertCircle, Calendar, Trash2, CheckCircle2
} from "lucide-react";
import SectionHeader from "../../Components/SectionHeader/SectionHeader.jsx";
import SkeletonBlock from "../../Components/SkeletonBlock/SkeletonBlock.jsx";
import EmptyState from "../../Components/EmptyState/EmptyState.jsx";
import ScheduleSection from "../../Components/ScheduleSection/ScheduleSection.jsx";

const readOnly =
    "w-full px-3 py-2 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-500 select-all";

const superviseeStatusConfig = {
    active: {
        badge: "bg-green-50 border border-green-200",
        dot: "bg-green-500",
        label: "Active",
        text: "text-green-600",
    },
    completed: {
        badge: "bg-blue-50 border border-blue-200",
        dot: "bg-blue-400",
        label: "Completed",
        text: "text-blue-600",
    },
};

const relTypeConfig = {
    thesis: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", label: "Thesis" },
    project: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", label: "Project" },
};

const formatDate = (dateStr) =>
    dateStr
        ? new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : null;

const ProfileCard = ({ faculty, loading }) => {
    if (loading) return <SkeletonBlock className="h-48" />;
    if (!faculty) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row gap-5 items-start">

                {/* Avatar */}
                <div className="shrink-0">
                    {faculty.photoURL ? (
                        <img
                            src={faculty.photoURL}
                            alt={faculty.name}
                            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-gray-100"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <span className="text-2xl font-bold text-orange-600">
                                {faculty.name?.[0]?.toUpperCase() || "?"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Core info */}
                <div className="flex-1 min-w-0 space-y-1">
                    <h2 className="text-xl font-bold text-gray-900 capitalize">{faculty.name}</h2>
                    <p className="text-sm text-gray-500 capitalize">{faculty.designation || "—"}</p>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{faculty.department || "—"}</p>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Mail size={12} className="text-gray-400" />
                            {faculty.email}
                        </div>
                        {faculty.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Phone size={12} className="text-gray-400" />
                                {faculty.phone}
                            </div>
                        )}
                        {faculty.room && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <MapPin size={12} className="text-gray-400" />
                                {faculty.room}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status */}
                <div className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold
                    ${faculty.status === "verified"
                    ? "bg-green-50 border border-green-200 text-green-600"
                    : faculty.status === "suspended"
                        ? "bg-red-50 border border-red-200 text-red-500"
                        : "bg-gray-50 border border-gray-200 text-gray-500"
                }`}>
                    <span className={`w-1.5 h-1.5 rounded-full
                        ${faculty.status === "verified" ? "bg-green-500"
                        : faculty.status === "suspended" ? "bg-red-500" : "bg-gray-400"}`} />
                    <span className="capitalize">{faculty.status}</span>
                </div>
            </div>

            {/* Bio */}
            {faculty.biography && (
                <p className="mt-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                    {faculty.biography}
                </p>
            )}

            {/* Research interests */}
            {faculty.researchInterests?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Research Interests
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {faculty.researchInterests.map((r, i) => (
                            <span key={i} className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">
                                {r}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Read-only fields grid */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Role</p>
                    <div className={readOnly}>Faculty</div>
                </div>
                <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Department</p>
                    <div className={`${readOnly} uppercase`}>{faculty.department || "—"}</div>
                </div>
                <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Joined</p>
                    <div className={readOnly}>{faculty.createdAt || "—"}</div>
                </div>
            </div>
        </div>
    );
};

const SuperviseeCard = ({ supervisee, facultyId, onDeleted, onStatusChanged }) => {
    const [deleting, setDeleting] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const statusCfg = superviseeStatusConfig[supervisee.status] ?? superviseeStatusConfig.active;
    const relCfg = relTypeConfig[supervisee.relationshipType] ?? relTypeConfig.project;

    const handleDelete = async () => {
        setDeleting(true);

        const data = {
            studentID: supervisee.student._id,
            relationshipType: supervisee.relationshipType
        }

        try {
            await axiosSecure.delete(`/supervisor/${facultyId}`, {data});
            toast.success("Supervisee deleted permanently");
            document.getElementById(`delete_modal_${supervisee.student._id}_${supervisee.relationshipType}`).close();
            onDeleted(supervisee.student._id, supervisee.relationshipType);
        } catch {
            toast.error("Error deleting supervisee!");
        } finally {
            setDeleting(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            await axiosSecure.patch(`/supervisor/${facultyId}`, {
                studentID: supervisee.student._id,
                relationshipType: supervisee.relationshipType,
                status: newStatus,
            });
            toast.success("Status updated successfully");
            onStatusChanged(supervisee.student._id, supervisee.relationshipType, newStatus);
        } catch {
            toast.error("Failed to update status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-start gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm transition-all duration-200">

            {/* Avatar */}
            <div className="shrink-0">
                {supervisee.student?.photoURL ? (
                    <img src={supervisee.student.photoURL} alt={supervisee.student.name}
                         className="w-9 h-9 rounded-full object-cover" />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                            {supervisee.student?.name?.[0]?.toUpperCase() || "?"}
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-800 capitalize">{supervisee.student?.name}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${relCfg.bg} ${relCfg.text} ${relCfg.border}`}>
                        {relCfg.label}
                    </span>
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ${statusCfg.badge}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        <span className={`text-[10px] font-semibold ${statusCfg.text}`}>{statusCfg.label}</span>
                    </div>
                </div>
                <p className="text-xs text-gray-400">{supervisee.student?.email}</p>
                {supervisee.student?.studentID && (
                    <p className="text-xs text-gray-400 mt-0.5">ID: {supervisee.student.studentID}</p>
                )}
                {supervisee.topic && (
                    <p className="text-xs text-gray-600 mt-1.5 font-medium">{supervisee.topic}</p>
                )}
            </div>

            {/* Meetings */}
            <div className="shrink-0 flex flex-col gap-1 text-right">
                {supervisee.lastMeetingAt && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock size={10} />
                        Last: {formatDate(supervisee.lastMeetingAt)}
                    </div>
                )}
                {supervisee.nextMeetingAt && (
                    <div className="flex items-center gap-1 text-[10px] text-orange-500 font-medium">
                        <Calendar size={10} />
                        Next: {formatDate(supervisee.nextMeetingAt)}
                    </div>
                )}
            </div>

            {/* Actions */}
            {deleting || updatingStatus ? (
                <svg className="animate-spin w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
            ) : (
                <div className="flex items-center gap-1">
                    {/* Status changer — only show if not already completed */}
                    {supervisee.status !== "completed" && (
                        <button
                            onClick={() => handleStatusChange("completed")}
                            title="Mark as completed"
                            className="cursor-pointer p-1.5 rounded-lg text-gray-400 hover:text-blue-500 transition"
                        >
                            <CheckCircle2 size={18}/>
                        </button>
                    )}
                    <button
                        onClick={() => document.getElementById(`delete_modal_${supervisee.student._id}_${supervisee.relationshipType}`).showModal()}
                        className="cursor-pointer p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition"
                    >
                        <Trash2 size={18}/>
                    </button>
                </div>
            )}

            {/* Deletion confirmation modal */}
            <dialog id={`delete_modal_${supervisee.student._id}_${supervisee.relationshipType}`} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <p className="text-sm text-gray-500">Are you sure you want to remove this supervisee permanently?</p>

                    <div className="modal-action">
                        <button className="btn btn-ghost btn-sm" onClick={() => document.getElementById(`delete_modal_${supervisee.student._id}_${supervisee.relationshipType}`).close()}>Keep Supervisee</button>
                        <button className="btn btn-error btn-sm text-white" onClick={handleDelete}>Remove Supervisee</button>
                    </div>
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
};

const StudentPicker = ({ students, loadingStudents, selected, onToggle, onNext, onCancel }) => {
    const [search, setSearch] = useState("");

    const filtered = students.filter((s) => {
        const q = search.toLowerCase();
        return (
            s.name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.studentID?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, email or ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                />
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto space-y-1 pr-1">
                {loadingStudents ? (
                    [1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-12" />)
                ) : filtered.length === 0 ? (
                    <EmptyState message="No students found." />
                ) : (
                    filtered.map((s) => {
                        const checked = selected.includes(s.id);
                        return (
                            <div
                                key={s.id}
                                onClick={() => onToggle(s.id)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150
                                    ${checked ? "bg-orange-50 border border-orange-200" : "bg-gray-50 border border-transparent hover:bg-gray-100"}`}
                            >
                                {/* Avatar */}
                                <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden">
                                    {s.photoURL ? (
                                        <img src={s.photoURL} alt={s.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                            <span className="text-xs font-bold text-blue-600">
                                                {s.name?.[0]?.toUpperCase() || "?"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 capitalize truncate">{s.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{s.email}</p>
                                </div>

                                {s.studentID && (
                                    <span className="text-xs text-gray-400 shrink-0">{s.studentID}</span>
                                )}

                                {/* Checkbox */}
                                <div className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                    ${checked ? "bg-orange-500 border-orange-500" : "border-gray-300"}`}>
                                    {checked && (
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8"
                                                  strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer actions */}
            <div className="flex flex-col lg:flex-row items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                    {selected.length > 0 ? `${selected.length} student${selected.length > 1 ? "s" : ""} selected` : "Select students to continue"}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-xs font-semibold border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onNext}
                        disabled={selected.length === 0}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Next <ChevronRight size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Supervisee assignment form
const AssignmentForm = ({ selectedStudents, students, facultyId, onSuccess, onCancel }) => {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        relationshipType: "thesis",
        topic: "",
        description: "",
    });

    const selectedStudentObjs = students.filter((s) => selectedStudents.includes(s.id));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.topic.trim() || !form.description.trim()) {
            toast.error("Topic and description are required.");
            return;
        }

        setSubmitting(true);

        try {
            const results = await Promise.allSettled(
                selectedStudents.map((studentID) =>
                    axiosSecure.post("/supervisor", {
                        supervisorID: facultyId,
                        studentID,
                        relationshipType: form.relationshipType,
                        topic: form.topic.trim(),
                        description: form.description.trim(),
                    })
                )
            );

            const succeeded = results.filter((r) => r.status === "fulfilled").length;
            const failed = results.filter((r) => r.status === "rejected").length;

            if (succeeded > 0)
                toast.success(`${succeeded} supervisee${succeeded > 1 ? "s" : ""} assigned successfully.`);
            if (failed > 0)
                toast.error(`${failed} assignment${failed > 1 ? "s" : ""} failed.`);

            onSuccess();
        } catch {
            toast.error("Assignment failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            {/* Selected students preview */}
            <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Assigning to {selectedStudentObjs.length} student{selectedStudentObjs.length > 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                    {selectedStudentObjs.map((s) => (
                        <div key={s.id} className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1">
                            <div className="w-4 h-4 rounded-full overflow-hidden">
                                {s.photoURL ? (
                                    <img src={s.photoURL} alt={s.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-orange-200 flex items-center justify-center">
                                        <span className="text-[8px] font-bold text-orange-600">{s.name?.[0]?.toUpperCase()}</span>
                                    </div>
                                )}
                            </div>
                            <span className="text-xs font-medium text-orange-700 capitalize">{s.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Relationship type */}
            <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Relationship Type <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                    {["thesis", "project"].map((type) => {
                        const cfg = relTypeConfig[type];
                        const active = form.relationshipType === type;
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setForm((p) => ({ ...p, relationshipType: type }))}
                                className={`flex-1 py-2 text-xs font-semibold rounded-xl border capitalize transition-all ${
                                    active
                                        ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm`
                                        : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                                }`}
                            >
                                {cfg.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Topic */}
            <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Topic <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={form.topic}
                    onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                    placeholder="e.g. Deep Learning for Medical Imaging"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                    required
                />
            </div>

            {/* Description */}
            <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Description <span className="text-red-400">*</span>
                </label>
                <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description of the project or thesis topic…"
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition resize-none"
                    required
                />
            </div>

            {/* Footer */}
            <div className="flex flex-col lg:flex-row gap-2 pt-2 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-2.5 text-xs font-semibold border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 text-xs font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-60 transition flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <><Loader2 size={13} className="animate-spin" /> Assigning…</>
                    ) : (
                        <><UserCheck size={13} /> Assign Supervisee{selectedStudents.length > 1 ? "s" : ""}</>
                    )}
                </button>
            </div>
        </form>
    );
};

const SupervisesSection = ({ faculty, facultyLoading }) => {
    const [activeSupervises, setActiveSupervises] = useState([]);
    const [completedSupervises, setCompletedSupervises] = useState([]);
    const [supervisesLoading, setSupervisesLoading] = useState(true);

    // students for picker
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);

    const [mode, setMode] = useState("list");
    const [selectedStudents, setSelectedStudents] = useState([]);

    const fetchSupervises = async (id) => {
        setSupervisesLoading(true);
        try {
            const res = await axiosSecure.get(`/supervisor/${id}`);
            setActiveSupervises(res.data.activeSupervises || []);
            setCompletedSupervises(res.data.completedSupervises || []);
        } catch {
            toast.error("Error fetching supervises");
        } finally {
            setSupervisesLoading(false);
        }
    };

    useEffect(() => {
        if (faculty?.id) fetchSupervises(faculty.id);
    }, [faculty]);

    const handleAddClick = async () => {
        setMode("pick");
        setSelectedStudents([]);
        if (students.length === 0) {
            setStudentsLoading(true);
            try {
                const res = await axiosSecure.get("/admin/users", { params: { limit: 200 } });
                const allStudents = (res.data.users || [])
                    .filter((u) => u.role === "student")
                    .map((u) => ({
                        id: u._id,
                        name: u.name,
                        email: u.email,
                        studentID: u.studentID,
                        photoURL: u.photoURL ?? null,
                    }));
                setStudents(allStudents);
            } catch {
                toast.error("Failed to load students");
            } finally {
                setStudentsLoading(false);
            }
        }
    };

    const toggleStudent = (id) =>
        setSelectedStudents((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );

    const handleAssignSuccess = () => {
        setMode("list");
        setSelectedStudents([]);
        if (faculty?.id) fetchSupervises(faculty.id);
    };

    const isSupervisor =
        !supervisesLoading &&
        (activeSupervises.length > 0 || completedSupervises.length > 0);

    const totalCount = activeSupervises.length + completedSupervises.length;

    const handleDeleted = (studentId, relType) => {
        setActiveSupervises(prev =>
            prev.filter(x => !(x.student._id === studentId && x.relationshipType === relType))
        );
        setCompletedSupervises(prev =>
            prev.filter(x => !(x.student._id === studentId && x.relationshipType === relType))
        );
    };

    const handleStatusChanged = (studentId, relType, newStatus) => {
        if (newStatus === "completed") {
            const item = activeSupervises.find(
                x => x.student._id === studentId && x.relationshipType === relType
            );
            if (item) {
                setActiveSupervises(prev =>
                    prev.filter(x => !(x.student._id === studentId && x.relationshipType === relType))
                );
                setCompletedSupervises(prev => [...prev, { ...item, status: "completed" }]);
            }
        } else {
            const update = (list) => list.map(x =>
                x.student._id === studentId && x.relationshipType === relType
                    ? { ...x, status: newStatus }
                    : x
            );
            setActiveSupervises(update);
            setCompletedSupervises(update);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-5">
                <SectionHeader
                    icon={Users}
                    title="Supervises"
                    iconBg="bg-purple-50"
                    iconColor="text-purple-500"
                    count={supervisesLoading ? undefined : totalCount}
                    navigate={false}
                />

                {mode === "list" && !facultyLoading && (
                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-600 active:scale-95 transition-all"
                    >
                        <UserPlus size={13} />
                        Add Supervisee
                    </button>
                )}

                {mode !== "list" && (
                    <button
                        onClick={() => setMode("list")}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={14} /> Close
                    </button>
                )}
            </div>

            {/* Student picker */}
            {mode === "pick" && (
                <div>
                    <p className="text-xs text-gray-500 mb-3">
                        Select one or more students to assign as supervisees.
                    </p>
                    <StudentPicker
                        students={students}
                        loadingStudents={studentsLoading}
                        selected={selectedStudents}
                        onToggle={toggleStudent}
                        onNext={() => setMode("form")}
                        onCancel={() => setMode("list")}
                    />
                </div>
            )}

            {/* Assignment form */}
            {mode === "form" && (
                <AssignmentForm
                    selectedStudents={selectedStudents}
                    students={students}
                    facultyId={faculty?.id}
                    onSuccess={handleAssignSuccess}
                    onCancel={() => setMode("pick")}
                />
            )}

            {/* Supervises list */}
            {mode === "list" && (
                <>
                    {supervisesLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-16" />)}
                        </div>
                    ) : !isSupervisor ? (
                        <div className="flex flex-col items-center py-10 text-center">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                                <AlertCircle size={18} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-400">
                                This faculty is currently not a supervisor.
                            </p>
                            <p className="text-xs text-gray-300 mt-1">
                                Use the "Add Supervisee" button to assign one.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Active */}
                            {activeSupervises.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-semibold text-gray-600">Active</span>
                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {activeSupervises.length}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {activeSupervises.map((s, i) => (
                                            <SuperviseeCard
                                                key={i}
                                                supervisee={s}
                                                facultyId = {faculty.id}
                                                onDeleted={handleDeleted}
                                                onStatusChanged={handleStatusChanged}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            {activeSupervises.length > 0 && completedSupervises.length > 0 && (
                                <div className="border-t border-gray-100" />
                            )}

                            {/* Completed */}
                            {completedSupervises.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-semibold text-gray-600">Completed</span>
                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {completedSupervises.length}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {completedSupervises.map((s, i) => (
                                            <SuperviseeCard
                                                key={i}
                                                supervisee={s}
                                                facultyId = {faculty.id}
                                                onDeleted={handleDeleted}
                                                onStatusChanged={handleStatusChanged}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const FacultyDetails = () => {
    const { email } = useParams();

    const { userData } = useContext(AuthContext);
    const navigate = useNavigate();

    const [faculty, setFaculty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaculty = async () => {
            if (!userData?._id) return;
            setLoading(true);
            try {
                // Fetch by email — adjust endpoint to match your backend
                const res = await axiosSecure.get(`/users/${email}`);
                const u = res.data.user;
                setFaculty({
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    photoURL: u.photoURL ?? null,
                    department: u.department,
                    designation: u.designation,
                    biography: u.biography,
                    researchInterests: u.researchInterests || [],
                    phone: u.phone,
                    room: u.room,
                    status: u.status,
                    role: u.role,
                    createdAt: new Date(u.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                    }),
                });
            } catch {
                toast.error("Error fetching faculty data");
            } finally {
                setLoading(false);
            }
        };

        fetchFaculty();
    }, [userData, email]);

    return (
        <div className="gilroy space-y-6">

            {/* Top bar */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/dashboard/admin/mentorship")}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
                >
                    <ArrowLeft size={15} />
                    Back to Mentorship
                </button>

                {!loading && faculty && (
                    <button
                        onClick={() => navigate(`/dashboard/admin/users/${faculty.email}/details`)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-700 transition"
                    >
                        Manage User <ChevronRight size={13} />
                    </button>
                )}
            </div>

            {/* Page title */}
            <div>
                <h1 className="graphik text-3xl font-semibold text-gray-900">Faculty Details</h1>
                <p className="text-sm text-gray-400 mt-1">
                    View profile information and manage supervision relationships
                </p>
            </div>

            {/* Profile */}
            <ProfileCard faculty={faculty} loading={loading}/>

            {/* Schedule */}
            <ScheduleSection faculty={faculty} facultyLoading={loading}/>

            {/* Supervises */}
            <SupervisesSection faculty={faculty} facultyLoading={loading}/>
        </div>
    );
};

export default FacultyDetails;
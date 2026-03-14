import { AuthContext } from "../../Providers/AuthProvider/AuthProvider.jsx";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import axiosSecure from "../../utils/axiosSecure.js";
import {
    GraduationCap, Search, ChevronRight, BookOpen,
    Users, UserCheck, UserX, ChevronUp, ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router";
import { Pagination } from "@mui/material";
import StatCard from "../../Components/StatCard/StatCard.jsx";
import SectionHeader from "../../Components/SectionHeader/SectionHeader.jsx";
import EmptyState from "../../Components/EmptyState/EmptyState.jsx";

// Supervisor indicator config
const supervisorConfig = {
    true: {
        badge: "bg-purple-50 border border-purple-200",
        dot: "bg-purple-500",
        label: "Supervisor",
        text: "text-purple-600",
    },
    false: {
        badge: "bg-gray-50 border border-gray-200",
        dot: "bg-gray-300",
        label: "Not Supervisor",
        text: "text-gray-400",
    },
};

// Sort header
const SortHeader = ({ label, field, sortField, sortDir, onSort }) => {
    const active = sortField === field;
    return (
        <th
            className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap group"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-1.5">
                {label}
                <span className={`flex flex-col transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}>
                    <ChevronUp size={10} className={active && sortDir === "asc" ? "text-blue-500" : "text-gray-400"} />
                    <ChevronDown size={10} className={active && sortDir === "desc" ? "text-blue-500" : "text-gray-400"} />
                </span>
            </div>
        </th>
    );
};

// Skeleton row during loading
const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-50">
        {[40, 200, 180, 140, 120, 100, 40].map((w, i) => (
            <td key={i} className="px-5 py-4">
                <div className="h-3 bg-gray-100 rounded" style={{ width: w }} />
            </td>
        ))}
    </tr>
);

// Single faculty row
const FacultyItem = ({ faculty, navigate }) => {
    const cfg = supervisorConfig[String(faculty.isSupervisor)];

    return (
        <tr
            onClick={() => navigate(`/dashboard/admin/mentorship/faculties/${faculty.email}/details`)}
            className="border-b border-gray-50 hover:bg-orange-50/40 transition-colors duration-100 group cursor-pointer"
        >
            {/* Avatar */}
            <td className="px-5 py-3.5">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    {faculty.photoURL ? (
                        <img src={faculty.photoURL} alt={faculty.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <span className="text-xs font-bold text-orange-600">
                                {faculty.name?.[0]?.toUpperCase() || "?"}
                            </span>
                        </div>
                    )}
                </div>
            </td>

            {/* Name + Email */}
            <td className="px-5 py-3.5">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 transition-colors truncate">
                    {faculty.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{faculty.email}</p>
            </td>

            {/* Department */}
            <td className="px-5 py-3.5">
                <span className="text-sm text-gray-500 uppercase">{faculty.department || "—"}</span>
            </td>

            {/* Designation */}
            <td className="px-5 py-3.5">
                <span className="text-sm text-gray-500 capitalize">{faculty.designation || "—"}</span>
            </td>

            {/* Research interests */}
            <td className="px-5 py-3.5 max-w-[180px]">
                {faculty.researchInterests?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {faculty.researchInterests.slice(0, 2).map((r, i) => (
                            <span key={i} className="text-[10px] font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full truncate max-w-[80px]">
                                {r}
                            </span>
                        ))}
                        {faculty.researchInterests.length > 2 && (
                            <span className="text-[10px] text-gray-400 font-medium">
                                +{faculty.researchInterests.length - 2}
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="text-xs text-gray-300 italic">—</span>
                )}
            </td>

            {/* Supervisor indicator */}
            <td className="px-5 py-3.5">
                <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${cfg.badge}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                </div>
            </td>

            {/* Arrow */}
            <td className="px-5 py-3.5 text-right">
                <ChevronRight
                    size={15}
                    className="text-gray-300 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all duration-150 inline-block"
                />
            </td>
        </tr>
    );
};

const ManageMentorship = () => {
    const {userData} = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [faculties, setFaculties] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [supervisorFilter, setSupervisorFilter] = useState("all");
    const [sortField, setSortField] = useState("name");
    const [sortDir, setSortDir] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchData = async () => {
            if (!userData?._id) return;
            setLoading(true);

            try {
                // Fetch all users
                const usersRes = await axiosSecure.get(`/admin/users`, { params: { limit: 50 } });

                const users = usersRes.data.users.map((user) => {
                    return {
                        batch: user.batch,
                        biography: user.biography,
                        createdAt: new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                        }),
                        createdAtRaw: user.createdAt,
                        department: user.department,
                        designation: user.designation,
                        email: user.email,
                        name: user.name,
                        photoURL: user.photoURL ?? null,
                        researchInterests: user.researchInterests || [],
                        role: user.role,
                        status: user.status,
                        studentID: user.studentID,
                        id: user._id
                    }
                });

                const students = users.filter(user => user.role === "student");
                const faculties = users.filter(user => user.role === "faculty");

                // Fetch all supervisors relationships
                const allSupervisorRels = await Promise.all(
                    students.map(async (student) => {
                        const supervisorRelsRes = await axiosSecure.get(`/supervisor/student/${student.id}`, { params: { limit: 1000 } });

                        return supervisorRelsRes.data.supervisors.map((supervisorRel) => ({
                            ...student,
                            description: supervisorRel.description,
                            lastMeetingAt: new Date(supervisorRel.lastMeetingAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                            }),
                            nextMeetingAt: new Date(supervisorRel.nextMeetingAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                            }),
                            relationshipType: supervisorRel.relationshipType,
                            status: supervisorRel.status,
                            supervisor: supervisorRel.supervisor || {},
                            topic: supervisorRel.topic
                        }));
                    })
                );

                // Get unique supervisors
                const supervisorsRaw = [...new Map(
                    allSupervisorRels.flat().map((supervisorRel) => [
                        supervisorRel.supervisor?._id,
                        {
                            supervisorId: supervisorRel.supervisor?._id,
                            supervisorName: supervisorRel.supervisor?.name,
                            supervisorEmail: supervisorRel.supervisor?.email,
                            supervisorPhotoURL: supervisorRel.supervisor?.photoURL,
                        }
                    ])
                ).values()];

                // Set boolean value isSupervisor to each faculty to differentiate between faculties and faculties who are also supervisors
                const supervisorIds = new Set(supervisorsRaw.map(s => s.supervisorId));

                const modifiedFaculties = faculties.map((f) => ({
                    ...f,
                    isSupervisor: supervisorIds.has(f.id)
                }));

                setFaculties(modifiedFaculties);
            } catch {
                toast.error("Error fetching data");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [userData]);

    // Stats
    const totalFaculties = faculties.length;
    const supervisorCount = faculties.filter((f) => f.isSupervisor).length;
    const nonSupervisorCount = totalFaculties - supervisorCount;

    // Sort handler
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
        setCurrentPage(1);
    };

    // Filter + sort
    const q = searchQuery.toLowerCase();
    const filtered = faculties
        .filter((f) => {
            if (supervisorFilter === "supervisor" && !f.isSupervisor) return false;
            if (supervisorFilter === "non-supervisor" && f.isSupervisor) return false;
            return (
                f.name?.toLowerCase().includes(q) ||
                f.email?.toLowerCase().includes(q) ||
                f.department?.toLowerCase().includes(q) ||
                f.designation?.toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            const valA = (a[sortField] ?? "").toString().toLowerCase();
            const valB = (b[sortField] ?? "").toString().toLowerCase();
            return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="gilroy space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="graphik text-3xl font-semibold text-gray-900">Manage Mentorship</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Overview of faculty members and their supervision roles
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                <StatCard
                    icon={GraduationCap}
                    value={loading ? "—" : totalFaculties}
                    label="Total Faculties"
                    iconBg="bg-orange-50"
                    iconColor="text-orange-500"
                />
                <StatCard
                    icon={UserCheck}
                    value={loading ? "—" : supervisorCount}
                    label="Supervisors"
                    iconBg="bg-purple-50"
                    iconColor="text-purple-500"
                    valueColor="text-purple-600"
                />
                <StatCard
                    icon={UserX}
                    value={loading ? "—" : nonSupervisorCount}
                    label="Non-Supervisors"
                    iconBg="bg-gray-50"
                    iconColor="text-gray-400"
                />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={15} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by name, email, department or designation…"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                    />
                </div>

                {/* Supervisor filter pills */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: "all", label: "All" },
                        { key: "supervisor", label: "Supervisors" },
                        { key: "non-supervisor", label: "Non-Supervisors" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => { setSupervisorFilter(key); setCurrentPage(1); }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                                supervisorFilter === key
                                    ? "bg-orange-500 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 pt-5 pb-3">
                    <SectionHeader
                        icon={Users}
                        title="Faculty List"
                        iconBg="bg-orange-50"
                        iconColor="text-orange-500"
                        count={loading ? undefined : filtered.length}
                        navigate={false}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {/* Avatar col — no sort */}
                            <th className="px-5 py-3.5 w-12" />
                            <SortHeader label="Name" field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                            <SortHeader label="Department" field="department" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                            <SortHeader label="Designation" field="designation" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                                Research Interests
                            </th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                                Supervisor Status
                            </th>
                            {/* Arrow col */}
                            <th className="px-5 py-3.5 w-10" />
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={7}>
                                    <EmptyState message="No faculty members match your search." />
                                </td>
                            </tr>
                        ) : (
                            paginated.map((faculty) => (
                                <FacultyItem
                                    key={faculty.id}
                                    faculty={faculty}
                                    navigate={navigate}
                                />
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center my-5">
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, value) => setCurrentPage(value)}
                        color="primary"
                        siblingCount={1}
                        boundaryCount={1}
                    />
                </div>
            </div>
        </div>
    );
};

export default ManageMentorship;
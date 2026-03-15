import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {
    ChartNoAxesCombined,
    Trophy,
    Upload,
    CheckCircle,
    CloudUpload,
    Search,
    File,
    FileImage, FileText,
    Calendar, Download, UsersRound, BookCheck, Trash2, Check, X
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import {Line} from "react-chartjs-2"
import {useParams} from "react-router";
import axiosSecure from "../../utils/axiosSecure.js";
import formatName from "../../utils/formatName.js";
import {toast} from "sonner";
import {uploadFileToCloudinary} from "../../utils/uploadToCloudinary.js";
import { Pagination } from '@mui/material';
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider.jsx";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const rankStyles = {
    1: {bg: "bg-gray-50", border: "border-gray-300", badge: "bg-gray-200 text-gray-600", trophy: "text-gray-500"},
    2: {bg: "bg-white", border: "border-gray-200", badge: "bg-gray-100 text-gray-500", trophy: "text-gray-400"},
    3: {bg: "bg-white", border: "border-gray-200", badge: "bg-gray-100 text-gray-400", trophy: "text-gray-300"},
};

const defaultStyle = {
    bg: "bg-white", border: "border-gray-200", badge: "bg-gray-100 text-gray-500", trophy: "text-gray-300"
};

const StatCard = ({icon: Icon, value, label, iconBg, iconColor}) => (
    <div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow duration-200">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon size={22} className={iconColor} strokeWidth={1.75}/>
        </div>
        <div>
            <div className="text-3xl font-bold text-gray-900 leading-tight">{value ?? '—'}</div>
            <div className="text-sm text-gray-400 mt-0.5 font-medium">{label}</div>
        </div>
    </div>
);

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

// File helper designs

const fileTypeConfig = {
    pdf: {icon: FileText, bg: "bg-red-50", text: "text-red-500", label: "PDF"},
    doc: {icon: FileText, bg: "bg-blue-50", text: "text-blue-500", label: "Document"},
    jpg: {icon: FileImage, bg: "bg-green-50", text: "text-green-500", label: "Image"},
    jpeg: {icon: FileImage, bg: "bg-green-50", text: "text-green-500", label: "Image"},
    png: {icon: FileImage, bg: "bg-green-50", text: "text-green-500", label: "Image"},
    zip: {icon: File, bg: "bg-gray-100", text: "text-gray-500", label: "Archive"}
};

const defaultFileType = {icon: File, bg: "bg-gray-100", text: "text-gray-500", label: "File"};

const ItemCard = ({id, item, onDownload, onDelete, onApprove, onReject, isAdmin = false}) => {
    const extension = item.url?.split(".").pop().split("?")[0].toLowerCase() ?? "";
    const fileConfig = fileTypeConfig[extension] ?? defaultFileType;
    const FileIcon = fileConfig.icon;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow duration-200">
            {/* File icon + Category + Title */}
            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
                <FileIcon className={`w-5 h-5 ${fileConfig.text}`} strokeWidth={1.75}/>
            </div>

            <div className="flex-1 min-w-0">
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${fileConfig.text}`}>
                    {item.itemType ?? fileConfig.label}
                </span>
                <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mt-0.5">
                    {item.title}
                </p>
            </div>

            {/* Description */}
            {item.description && (
                <p className="h-full max-h-[200px] text-xs text-gray-400 overflow-y-auto">
                    {item.description}
                </p>
            )}

            {/* Course Code + Course Name */}
            <div className="flex flex-col items-start justify-between text-xs text-gray-400">
                <span className="font-semibold text-gray-900">{item?.courseCode}</span>
                <span className="text-xs font-medium text-gray-500 capitalize">{item?.courseName}</span>
            </div>

            {/* Tags */}
            {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 rounded-full border border-blue-100"
                        >
                {tag}
            </span>
                    ))}
                </div>
            )}

            {/* Uploader + Date */}
            <div className="flex flex-col items-start justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold shrink-0 uppercase overflow-hidden">
                        {item.uploader?.photoURL
                            ? <img src={item.uploader?.photoURL} alt={item.uploader?.name} className="w-full h-full object-cover" />
                            : item.uploader?.name?.[0] ?? "?"
                        }
                    </div>
                    <span className="font-medium text-gray-500">
                        {formatName(item.uploader?.name) ?? "Unknown"}
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.approvedAt)}</span>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Stats + actions */}
            <div className="flex flex-col items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Download className="w-3.5 h-3.5" />
                        <span className="font-medium text-gray-600">{item.downloadCount ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <ChartNoAxesCombined className="w-3.5 h-3.5" />
                        <span className="font-medium text-blue-600">{item.contributionPoints ?? 0}</span>
                        <span>pts</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                    <div className="flex flex-col lg:flex-row items-center gap-1">
                        <button
                            onClick={() => {
                                onDownload?.(item);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition">
                            <Download className="w-3.5 h-3.5" />
                            Download
                        </button>

                        {((id && item.uploader?._id === id) || isAdmin) && (
                            <button
                                onClick={() => {
                                    onDelete?.(item);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-orange-700 rounded-lg hover:bg-orange-800 transition">
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-1">
                        {isAdmin && item.status !== "approved" && item.status !== "rejected" && (
                            <button
                                onClick={() => {
                                    onApprove?.(item);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-400 rounded-lg hover:bg-emerald-500 transition">
                                <Check className="w-3.5 h-3.5" />
                                Approve
                            </button>
                        )}

                        {isAdmin && item.status !== "rejected" && (
                            <button
                                onClick={() => {
                                    onReject?.(item);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-400 rounded-lg hover:bg-red-500 transition">
                                <X className="w-3.5 h-3.5" />
                                Reject
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Graph UI options
const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "top",
        },
        title: {
            display: true,
            text: `Contribution Activity (${new Date().getFullYear()})`,
            font: {
                size: 16
            },
            color: "#111827"
        }
    }
};

// Helper for month mapping
const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const Repository = () => {
    const {userData} = useContext(AuthContext);

    const {id} = useParams();
    const [contributionPoints, setContributionPoints] = useState(0);
    const [repositoryItems, setRepositoryItems] = useState([]);
    const [totalApproved, setTotalApproved] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [graphData, setGraphData] = useState();
    const [searchQuery, setSearchQuery] = useState('');

    const [totalContributorsCount, setTotalContributorsCount] = useState(0);
    const [totalUploadCount, setTotalUploadCount] = useState(0);
    const [totalDownloadCount, setTotalDownloadCount] = useState(0);

    const [statusFilter, setStatusFilter] = useState(userData?.role === "admin" ? "pending" : "all");
    const [itemType, setItemType] = useState('notes');

    const [uploadStatus, setUploadStatus] = useState("idle");

    const [material, setMaterial] = useState(null);
    const fileInputRef = useRef(null);

    const [itemToDeleteId, setItemToDeleteId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);

    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    const [itemToRejectId, setItemToRejectId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase();
            if (newTag && !tags.includes(newTag)) {
                setTags(prev => [...prev, newTag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(prev => prev.filter(t => t !== tagToRemove));
    };

    const handleDownload = async (url, title) => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const ext = url.split('?')[0].split('.').pop().toLowerCase();
            const fileName = `${title.replace(/\s+/g, '_')}.${ext}`;
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleDelete = async (itemId) => {
        try {
            const res = await axiosSecure.delete(`/repository/${itemId}`);

            if (res.status === 200) {
                toast.success("Item permanently deleted");
                setRepositoryItems(prev => prev.filter(item => item._id !== itemId));
                // window.location.reload();
            }
        } catch {
            toast.error("Item deletion failed");
        }
    }

    const handleApprove = async (item) => {
         try {
             const data = {
                 status: "approved",
             };

             const approveRes = await axiosSecure.patch(`/repository/${item._id}`, data);

             if (approveRes.status === 200) {
                toast.success("Item approved successfully");

                 setRepositoryItems(prev =>
                     prev.map(i => i._id === item._id ? { ...i, status: "approved" } : i)
                 );
                 setStatusFilter("approved");
             }
         } catch {
             toast.error("Item approval failed!");
         }
    }

    const handleReject = async (reason) => {
        try {
            const res = await axiosSecure.patch(`/repository/${itemToRejectId}`, {
                status: "rejected",
                rejectedReason: reason
            });

            if (res.status === 200) {
                toast.success("Item rejected");
                setRepositoryItems(prev =>
                    prev.map(i => i._id === itemToRejectId ? { ...i, status: "rejected" } : i)
                );
                setStatusFilter("rejected");
                document.getElementById("reject_modal").close();
                setItemToRejectId(null);
                setRejectionReason('');
            }
        } catch {
            toast.error("Rejection failed");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [repositoryRes, leaderboardRes] = await Promise.all([
                    axiosSecure.get('/repository', { params: { limit: 1000 } }),
                    axiosSecure.get('/repository/leaderboard'),
                ]);

                const repositoryItems = repositoryRes.data.items;

                const totalContributionPoints = repositoryItems.reduce((sum, item) => {
                    if (item.uploader?._id === id) return sum + item.contributionPoints;
                    return sum;
                }, 0);

                const totalApproved = repositoryItems.reduce((sum, item) => {
                    if (item.uploader?._id === id && item.status === "approved") return sum + 1;
                    return sum;
                }, 0);

                const totalContributors = new Set(
                    repositoryItems
                        .filter(item => item.contributionPoints > 0)
                        .map(item => item.uploader?._id)
                ).size;

                const totalUploaded = repositoryItems.length;

                const totalDownloaded = repositoryItems.reduce((sum, item) => {
                    return sum + item.downloadCount;
                }, 0);

                const allPersonalNotes = repositoryItems
                    .filter(item => {
                        return (item.uploader?._id === id) && (item.itemType.toLowerCase() === "notes");
                    });

                const allQuestionBanksAnswers = repositoryItems
                    .filter(item => {
                        return (item.uploader?._id === id) && ((item.itemType.toLowerCase() === "question bank") || (item.itemType.toLowerCase() === "solved questions"));
                    });

                const allAssessments = repositoryItems
                    .filter(item => {
                        return (item.uploader?._id === id) && ((item.itemType.toLowerCase() === "project_report") || (item.itemType.toLowerCase() === "lab_report") || (item.itemType.toLowerCase() === "assignment"));
                    });

                const otherMaterials = repositoryItems
                    .filter(item => {
                        return (item.uploader?._id === id)
                            && (item.itemType.toLowerCase() !== "notes")
                            && (item.itemType.toLowerCase() !== "question bank")
                            && (item.itemType.toLowerCase() !== "solved questions")
                            && (item.itemType.toLowerCase() !== "project_report")
                            && (item.itemType.toLowerCase() !== "lab_report")
                            && (item.itemType.toLowerCase() !== "assignment");
                    });

                // Month mapping

                const filteredPersonalNotes = allPersonalNotes
                    .reduce((acc, item) => {
                        const month = new Date(item.approvedAt).getMonth();
                        if (new Date(item.approvedAt).getFullYear() === new Date().getFullYear())
                            acc[month] = (acc[month] || 0) + item.contributionPoints;
                        return acc;
                    }, Array(12).fill(0));

                const filteredQuestionBanksAnswers = allQuestionBanksAnswers
                    .reduce((acc, item) => {
                        const month = new Date(item.approvedAt).getMonth();
                        if (new Date(item.approvedAt).getFullYear() === new Date().getFullYear())
                            acc[month] = (acc[month] || 0) + item.contributionPoints;
                        return acc;
                    }, Array(12).fill(0));

                const filteredAssessments = allAssessments
                    .reduce((acc, item) => {
                        const month = new Date(item.approvedAt).getMonth();
                        if (new Date(item.approvedAt).getFullYear() === new Date().getFullYear())
                            acc[month] = (acc[month] || 0) + item.contributionPoints;
                        return acc;
                    }, Array(12).fill(0));

                const filteredOtherMaterials = otherMaterials
                    .reduce((acc, item) => {
                        const month = new Date(item.approvedAt).getMonth();
                        if (new Date(item.approvedAt).getFullYear() === new Date().getFullYear())
                            acc[month] = (acc[month] || 0) + item.contributionPoints;
                        return acc;
                    }, Array(12).fill(0));

                // Build graph datasets
                const data = {
                    labels: months,
                    datasets: [
                        {
                            label: "Personal Notes",
                            data: filteredPersonalNotes,
                            borderColor: "#6366F1",
                            backgroundColor: "#6366F1",
                            tension: 0.4
                        },
                        {
                            label: "Question Banks & Answers",
                            data: filteredQuestionBanksAnswers,
                            borderColor: "#22C55E",
                            backgroundColor: "#22C55E",
                            tension: 0.4
                        },
                        {
                            label: "Assessments",
                            data: filteredAssessments,
                            borderColor: "#F59E0B",
                            backgroundColor: "#F59E0B",
                            tension: 0.4
                        },
                        {
                            label: "Others",
                            data: filteredOtherMaterials,
                            borderColor: "#EC4899",
                            backgroundColor: "#EC4899",
                            tension: 0.4
                        }
                    ]
                }

                const leaderboard = leaderboardRes.data.top10;
                // leaderboard.sort((a, b) => a.rank - b.rank)

                setContributionPoints(totalContributionPoints);
                setRepositoryItems(repositoryItems);
                setTotalApproved(totalApproved);

                setTotalContributorsCount(totalContributors);
                setTotalUploadCount(totalUploaded);
                setTotalDownloadCount(totalDownloaded);

                setLeaderboard(leaderboard);
                setGraphData(data);
            } catch {
                toast.error("Error with fetching data");
            }
        };

        fetchData();
    }, [id]);

    // Optimize repository items loading with cache (useMemo)
    const filteredMaterials = useMemo(() => {
        const q = searchQuery.toLowerCase();

        return repositoryItems.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(q) ||
                item.courseCode.toLowerCase().includes(q) ||
                item.courseName.toLowerCase().includes(q) ||
                item.tags?.some(tag => tag.toLowerCase().includes(q)) ||
                item.uploader?.name?.toLowerCase().includes(q);

            const matchesStatus =
                (statusFilter === "all" && item.status === "approved") ||
                (statusFilter === "pending" && item.uploader?._id === id && item.status === "pending") ||
                (statusFilter === "personal" && item.uploader?._id === id && item.status === "approved") ||
                (statusFilter === item.status && userData.role === "admin");

            return matchesSearch && matchesStatus;
        });

    }, [repositoryItems, searchQuery, statusFilter, id, userData]);

    // Pagination setup

    const itemsPerPage = 9;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMaterials = filteredMaterials.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / itemsPerPage));

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        let data = {
            title: formData.get("title")?.trim(),
            description: formData.get("description")?.trim(),
            courseCode: formData.get("course-code")?.trim(),
            courseName: formData.get("course-name")?.trim(),
            year: formData.get("year")?.trim(),
            semester: formData.get("semester")?.trim(),
            itemType: itemType,
            tags: tags
        };

        if (!material) {
            toast.error("You must provide study material!");
            return;
        }

        if (!data.title) {
            toast.error("You must give a title of the study material!");
            return;
        }

        if (!data.description) {
            toast.error("You must give a valid description of the study material!");
            return;
        }

        if (!data.courseCode || !data.courseName) {
            toast.error("You must give valid course details related to the study material!");
            return;
        }

        if (!data.year || !data.semester) {
            toast.error("You must give valid session details related to the study material!");
            return;
        }

        if (!data.itemType) {
            toast.error("Please select a valid type for the study material!");
            return;
        }

        if (tags.length === 0) {
            toast.error("Please add at least one tag!");
            return;
        }

        const fileData = await uploadFileToCloudinary(material);

        if (!fileData?.url) {
            toast.error("File upload failed. Please try again.");
            return;
        }

        data = {
            ...data,
            url: fileData.url,
            cloudinaryId: fileData.public_id,
            resourceType: fileData.resource_type
        };

        try {
            const submissionRes = await axiosSecure.post(`/repository`, data);

            if (submissionRes.status === 201) {
                setUploadStatus("success");
                document.getElementById("my_modal_1").close();
                e.target.reset();
                setItemType("notes");
                setTags([]);
                setTagInput('');

                setMaterial(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

                setRepositoryItems(prev => [
                    {
                        ...submissionRes.data.item,
                        uploader: {
                            _id: userData._id,
                            name: userData.name,
                            email: userData.email,
                            photoURL: userData.photoURL ?? null,
                        }
                    },
                    ...prev
                ]);
                setStatusFilter("pending");
            }
        } catch {
            toast.error("Failed to submit material");
            setUploadStatus("error");
        }
    }

    // Design for form fields
    const labelCls = "block text-sm font-semibold text-gray-600 mb-1.5";
    const inputCls = "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition bg-white mb-3";
    const optionCls = "text-sm px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none";

    return (
        <div className={`gilroy space-y-6 ${!id ? "mx-15 mb-5 mt-10" : "m-0"}`}>
            {/* Header */}
            <div>
                <h1 className="graphik text-3xl font-semibold text-gray-900">Repository</h1>
                <p className="text-sm text-gray-400 mt-1">A collaborative platform for students and instructors to
                    exchange study materials, participate in discussions, and contribute valuable academic resources</p>
            </div>

            {/* Unregistered Users - Stats */}
            {!id && (
                <div className={`grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4`}>
                    <StatCard
                        icon={UsersRound}
                        value={totalContributorsCount}
                        label="Total Contributors"
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-500"/>

                    <StatCard
                        icon={CloudUpload}
                        value={totalUploadCount}
                        label="Total Uploaded"
                        iconBg="bg-blue-50"
                        iconColor="text-blue-500"/>

                    <StatCard
                        icon={Download}
                        value={totalDownloadCount}
                        label="Total Downloaded"
                        iconBg="bg-orange-50"
                        iconColor="text-orange-500"/>
                </div>
            )}


            {/* Contribution graph + Leaderboard */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                {/* Registered Users */}
                {id && (
                    <div className="flex flex-col gap-4">
                        {/* Stats */}
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                            <StatCard
                                icon={ChartNoAxesCombined}
                                value={contributionPoints}
                                label="Contribution Points"
                                iconBg="bg-emerald-50"
                                iconColor="text-emerald-500"/>

                            <StatCard
                                icon={BookCheck}
                                value={totalApproved}
                                label="Total Approved"
                                iconBg="bg-blue-50"
                                iconColor="text-blue-500"/>
                        </div>

                        {/* Contribution graph */}
                        {graphData && (
                            <div className="flex-1">
                                <Line data={graphData} options={options}/>
                            </div>
                        )}
                    </div>
                )}

                <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-5`}>
                    <h2 className="graphik text-2xl font-semibold text-gray-900">Top Contributors</h2>

                    {/* Leaderboard */}
                    {leaderboard?.length > 0 ? (
                        <div className="lg:p-5 space-y-2.5">
                            {leaderboard.map((person) => {
                                const style = rankStyles[person.rank] ?? defaultStyle;
                                return (

                                    <div
                                        key={person.user?._id ?? person.rank}
                                        className={`${style.bg} ${style.border} border rounded-2xl px-5 py-4 flex items-center gap-4 overflow-x-auto`}
                                    >
                                        {/* Rank badge */}
                                        <div
                                            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${style.badge}`}>
                                            {person.rank <= 3
                                                ? <Trophy className={`w-4 h-4 ${style.trophy}`}/>
                                                : <span># {person.rank}</span>
                                            }
                                        </div>

                                        {/* Avatar + Name */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div
                                                className="overflow-hidden w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold shrink-0 uppercase">
                                                {person.user?.photoURL
                                                    ? <img src={person.user?.photoURL} alt={person.user?.name}
                                                           className="w-full h-full object-cover"/>
                                                    : person.user?.name?.[0] ?? "?"
                                                }
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900">{formatName(person.user?.name)}</p>
                                                <p className="text-xs text-gray-400">{person.user?.studentID ?? ""}</p>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex flex-1 justify-end items-center gap-1.5 text-xs text-gray-500">
                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400"/>
                                            <span
                                                className="font-medium text-gray-700">{person.itemsApproved}</span>
                                            <span>approved</span>
                                        </div>

                                        {/* Points */}
                                        <div className="shrink-0 text-right">
                                            <p className="text-base font-bold text-green-700">{person.totalPoints.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">pts</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div
                            className="bg-white border border-gray-200 rounded-2xl py-14 flex flex-col items-center justify-center text-center">
                            <Trophy className="w-8 h-8 text-gray-200 mb-3"/>
                            <p className="text-sm font-medium text-gray-400">No leaderboard data yet</p>
                            <p className="text-xs text-gray-300 mt-1">Start uploading to earn points</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Materials section */}
            <div>
                {/* Search */}
                <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100`}>
                    <div className="relative">
                        <Search size={15} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                        <input
                            type="text"
                            placeholder="Search by course title, course code, course name, material type, tags or uploader name…"
                            value={searchQuery}
                            onChange={e => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                    {id && (
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className={optionCls}
                        >
                            {userData.role !== "admin" && (
                                <>
                                    <option value="all">All</option>
                                    <option value="pending">Pending</option>
                                </>
                            )}
                            {userData.role === "admin" && (
                                <>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </>
                            )}
                            <option value="personal">My Uploads</option>
                        </select>
                    )}

                    {id && (
                        <button
                            onClick={() => {
                                setUploadStatus("idle");
                                document.getElementById('my_modal_1').showModal();
                            }}
                            className={`my-5 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-150`}
                        >
                            <Upload size={15} strokeWidth={1.75}/>
                            Upload
                        </button>
                    )}
                </div>

                {(uploadStatus === "success") && (
                    <div role="alert" className="alert alert-success mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Study material uploaded successfully. Please wait for approval!</span>
                    </div>
                )}

                {(uploadStatus === "error") && (
                    <div role="alert" className="alert alert-error mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Study material upload failed!</span>
                    </div>
                )}

                {currentMaterials.length > 0 ? (
                    <div className="max-h-[800px] flex flex-col justify-between gap-6 overflow-y-auto">
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${!id ? "mt-5" : ""}`}>
                            {currentMaterials.map( repoItem => (
                                <ItemCard
                                    id={id}
                                    key={repoItem._id}
                                    isAdmin={userData.role === "admin"}
                                    item={repoItem}
                                    onDownload={(item) => handleDownload(item.url, item.title)}
                                    onDelete={(item) => {
                                        setItemToDeleteId(item._id);
                                        document.getElementById('my_modal_2').showModal();
                                    }}
                                    onApprove={(item) => handleApprove(item)}
                                    onReject={(item) => {
                                        setItemToRejectId(item._id);
                                        document.getElementById('reject_modal').showModal();
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ): (
                    <div
                        className="max-h-[800px] bg-white border border-gray-200 rounded-2xl py-14 flex flex-col items-center justify-center text-center mb-5">
                        <File className="w-8 h-8 text-gray-200 mb-3"/>
                        <p className="text-sm font-medium text-gray-400">No study material found</p>
                    </div>
                )}

                <div className="flex justify-center items-end my-5">
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(event, value) => setCurrentPage(value)}
                        color="primary"
                        siblingCount={1}
                        boundaryCount={1}
                    />
                </div>

                {/* Material Upload Modal */}
                <dialog id="my_modal_1" className="modal">
                    <div className="modal-box">
                        <h4 className="text-xl font-semibold text-gray-900 text-center">Upload Material</h4>

                        <form onSubmit={handleSubmit}>
                            <button
                                type="button"
                                onClick={() => {
                                    document.getElementById("my_modal_1").close();
                                    setMaterial(null);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                    setTags([]);
                                    setTagInput('');
                                }}
                                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>

                            {/* Title */}
                            <div>
                                <label className={labelCls}>Title</label>
                                <input type="text" name="title" className={inputCls} />
                            </div>

                            {/* Description */}
                            <div>
                                <label className={labelCls}>Description</label>
                                <textarea name="description" rows={5} className={inputCls} placeholder="Enter description here..." />
                            </div>

                            {/* Material */}
                            <div>
                                <label className={labelCls}>Upload Material</label>
                                <div className="flex gap-4 items-center mb-3">
                                    <label className="btn">
                                        Choose File
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            name="material"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                                            className="hidden"
                                            onChange={(e) => setMaterial(e.target.files[0] || null)}
                                        />
                                    </label>

                                    <span className="text-sm text-gray-500">
                                        {material?.name || "No file chosen"}
                                    </span>
                                </div>
                            </div>

                            {/* Course Code */}
                            <div>
                                <label className={labelCls}>Course Code</label>
                                <input type="text" name="course-code" className={inputCls}  placeholder="CSE 3200" />
                            </div>

                            {/* Course Name */}
                            <div>
                                <label className={labelCls}>Course Name</label>
                                <input type="text" name="course-name" className={inputCls} placeholder="System Development Project" />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className={labelCls}>Tags</label>
                                <div className={`${inputCls} flex flex-wrap gap-1.5 min-h-[42px] cursor-text`}>
                                    {tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-600 rounded-full border border-blue-100"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="text-blue-400 hover:text-blue-700 leading-none"
                                            >×</button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        placeholder={tags.length === 0 ? "Type a tag and press Enter…" : ""}
                                        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 -mt-2 mb-3">Press Enter or comma to add a tag</p>
                            </div>

                            {/* Year + Semester */}
                            <div className="flex flex-col lg:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <label className={labelCls}>Year</label>
                                    <input type="text" name="year" className={inputCls} placeholder="3rd" />
                                </div>

                                <div className="flex-1">
                                    <label className={labelCls}>Semester</label>
                                    <input type="text" name="semester" className={inputCls} placeholder="2nd" />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                {/* Item Type */}
                                <div>
                                    <label className={labelCls}>Type</label>
                                    <select
                                        name="type"
                                        value={itemType}
                                        onChange={(e) => setItemType(e.target.value)}
                                        className={optionCls}
                                    >
                                        <option value="notes">Notes</option>
                                        <option value="question bank">Question Bank</option>
                                        <option value="solved questions">Answer</option>
                                        <option value="project_report">Project Report</option>
                                        <option value="lab_report">Lab Report</option>
                                        <option value="assignment">Assignment</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Submit */}
                                <div className="modal-action">
                                    <button type="submit" className="btn btn-primary" disabled={!material}>
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => {
                            setMaterial(null);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                            }
                            setTags([]);
                            setTagInput('');
                        }
                    }>close</button>
                    </form>
                </dialog>

                {/* Item deletion modal */}
                <dialog id="my_modal_2" className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box">
                        <p className="text-md text-gray-500">Are you sure you want to delete this item?</p>

                        <div className="modal-action">
                            <button className="btn btn-ghost btn-sm" onClick={() => document.getElementById("my_modal_2").close()}>Cancel</button>
                            <button className="btn btn-error btn-sm text-white" onClick={() => {
                                handleDelete(itemToDeleteId);
                                document.getElementById("my_modal_2").close();
                                setItemToDeleteId(null);
                            }}>Delete</button>
                        </div>
                    </div>

                    <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>

                {/* Rejection Modal */}
                <dialog id="reject_modal" className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Reject Item</h4>
                        <div>
                            <label className={labelCls}>Reason</label>
                            <textarea
                                rows={4}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Provide a reason for rejection..."
                                className={inputCls}
                            />
                        </div>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => {
                                    document.getElementById("reject_modal").close();
                                    setItemToRejectId(null);
                                    setRejectionReason('');
                                }}
                            >Cancel</button>
                            <button
                                className="btn btn-error btn-sm text-white"
                                disabled={!rejectionReason.trim()}
                                onClick={() => handleReject(rejectionReason.trim())}
                            >Reject</button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => {
                            setItemToRejectId(null);
                            setRejectionReason('');
                        }}>close</button>
                    </form>
                </dialog>
            </div>
        </div>
    );
};

export default Repository;
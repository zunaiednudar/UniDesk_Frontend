import { useEffect, useRef, useState } from 'react';
import { X, FolderOpen, FileText, FileImage, FileArchive, Download, UploadCloud, File, ChevronRight } from 'lucide-react';
import axiosSecure from "../../utils/axiosSecure.js";
import timeAgo from "../../utils/timeAgo.js";

const fileIconMap = (url = '') => {
    const ext = url.split('?')[0].split('.').pop().toLowerCase();
    if (['jpg','jpeg','png','gif','webp','svg'].includes(ext))
        return { icon: FileImage, color: 'text-pink-500', bg: 'bg-pink-50'  };
    if (['pdf'].includes(ext))
        return { icon: FileText,  color: 'text-red-500',  bg: 'bg-red-50'   };
    if (['doc','docx'].includes(ext))
        return { icon: FileText,  color: 'text-blue-500', bg: 'bg-blue-50'  };
    return   { icon: File,        color: 'text-gray-500', bg: 'bg-gray-100' };
};

// Force file download + fall back to new tab if CORS blocks blob fetch
const handleDownload = async (url, title) => {
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        const ext = url.split('?')[0].split('.').pop().toLowerCase();
        const fileName = `${title.replace(/\s+/g, '_')}.${ext}`;
        const a        = document.createElement('a');
        a.href         = URL.createObjectURL(blob);
        a.download     = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
    } catch {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
};

const SkeletonItem = () => (
    <div className="flex gap-3 p-4 rounded-xl animate-pulse">
        <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
            <div className="h-3.5 bg-gray-100 rounded w-3/4" />
            <div className="h-2.5 bg-gray-50  rounded w-full" />
            <div className="h-2.5 bg-gray-50  rounded w-1/3" />
        </div>
    </div>
);

const CourseFilesDrawer = ({ isOpen, onClose, course }) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const drawerRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !course?.id) return;
        const fetchMaterials = async () => {
            setLoading(true);
            try {
                const res = await axiosSecure.get(`/course/${course.id}/materials`);
                console.log('Study materials response:', res.data);
                // Handle both { studyMaterials: [] } and { materials: [] } shapes
                setMaterials(res.data.studyMaterials || res.data.materials || []);
            } catch (err) {
                console.error('Failed to fetch study materials:', err);
                setMaterials([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, [isOpen, course?.id]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target)) onClose();
        };
        if (isOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen, onClose]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    return (
        <>
            {/* Backdrop */}
            <div className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={`fixed top-0 right-0 h-full w-[400px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                            <FolderOpen size={16} className="text-orange-500" strokeWidth={1.75} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Study Materials</p>
                            {course?.code && (
                                <p className="text-xs text-gray-400 mt-0.5">{course.code}</p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                        <X size={16} strokeWidth={2} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    {loading ? (
                        <div className="space-y-1">
                            {[1,2,3,4].map(i => <SkeletonItem key={i} />)}
                        </div>

                    ) : materials.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-52 text-gray-400">
                            <FolderOpen size={36} className="text-gray-200 mb-3" strokeWidth={1.5} />
                            <p className="text-sm font-medium">No materials uploaded yet</p>
                            <p className="text-xs text-gray-300 mt-1 text-center px-6">
                                Study materials shared by your instructor will appear here
                            </p>
                        </div>

                    ) : (
                        <div className="space-y-1">
                            {materials.map((material) => {
                                const { icon: Icon, color, bg } = fileIconMap(material.url || '');
                                const uploaderName    = material.uploader?.name || 'Instructor';
                                const uploaderInitial = uploaderName[0]?.toUpperCase() || '?';

                                return (
                                    <div
                                        key={material._id}
                                        onClick={() => handleDownload(material.url, material.title)}
                                        className="group flex gap-3 p-4 rounded-xl hover:bg-orange-50/60 border border-transparent hover:border-orange-100 transition-all duration-150 cursor-pointer"
                                    >
                                        {/* File type icon */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg} group-hover:scale-105 transition-transform duration-150`}>
                                            <Icon size={18} className={color} strokeWidth={1.75} />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-orange-700 transition-colors truncate">
                                                    {material.title}
                                                </p>
                                                <Download
                                                    size={14}
                                                    className="text-gray-300 group-hover:text-orange-500 transition-colors shrink-0 mt-0.5"
                                                    strokeWidth={2}
                                                />
                                            </div>

                                            {material.description && (
                                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                                                    {material.description}
                                                </p>
                                            )}

                                            {/* Uploader + time */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {material.uploader?.photoURL ? (
                                                        <img
                                                            src={material.uploader.photoURL}
                                                            alt={uploaderName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-[8px] font-bold text-purple-600">
                                                            {uploaderInitial}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-gray-400 truncate">{uploaderName}</span>
                                                <span className="text-gray-200">·</span>
                                                <span className="text-[11px] text-gray-400 shrink-0">{timeAgo(material.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center">
                        {loading
                            ? 'Loading materials…'
                            : materials.length > 0
                                ? `${materials.length} material${materials.length !== 1 ? 's' : ''} available`
                                : 'No materials available'
                        }
                    </p>
                </div>
            </div>
        </>
    );
};

export default CourseFilesDrawer;
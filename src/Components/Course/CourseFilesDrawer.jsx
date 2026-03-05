import { useEffect, useRef, useState } from 'react';
import { X, FolderOpen, FileText, FileImage, FileArchive, Download, UploadCloud, File, ChevronRight } from 'lucide-react';
import axiosSecure from "../../utils/axiosSecure.js";

const fileIconMap = (name = '') => {
    const ext = name.split('.').pop().toLowerCase();
    if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return { icon: FileImage, color: 'text-pink-500', bg: 'bg-pink-50' };
    if (['zip','rar','tar','gz'].includes(ext))                 return { icon: FileArchive, color: 'text-yellow-500', bg: 'bg-yellow-50' };
    if (['pdf'].includes(ext))                                  return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' };
    if (['doc','docx'].includes(ext))                           return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' };
    return { icon: File, color: 'text-gray-500', bg: 'bg-gray-50' };
};

const CourseFilesDrawer = ({ isOpen, onClose, course }) => {
    const [files, setFiles]   = useState([]);
    const [loading, setLoading] = useState(false);
    const drawerRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !course?.id) return;
        const fetchFiles = async () => {
            setLoading(true);
            try {
                const res = await axiosSecure.get(`/course/${course.id}/files`);
                setFiles(res.data.files || []);
            } catch {
                setFiles([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFiles();
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
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={`fixed top-0 right-0 h-full w-[360px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                            <FolderOpen size={16} className="text-orange-500" strokeWidth={1.75} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Course Files</p>
                            {course?.code && (
                                <p className="text-xs text-gray-400 mt-0.5">{course.code}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={16} strokeWidth={2} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {loading ? (
                        <div className="space-y-3">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                                    <div className="w-9 h-9 bg-gray-100 rounded-lg shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                                        <div className="h-2.5 bg-gray-50 rounded w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <FolderOpen size={36} className="text-gray-200 mb-3" strokeWidth={1.5} />
                            <p className="text-sm font-medium">No files uploaded yet</p>
                            <p className="text-xs text-gray-300 mt-1">Files shared by your instructor will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {files.map((file, idx) => {
                                const { icon: Icon, color, bg } = fileIconMap(file.name);
                                return (
                                    <a
                                        key={idx}
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 group transition-all duration-150 cursor-pointer"
                                    >
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                                            <Icon size={16} className={color} strokeWidth={1.75} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                            {file.size && (
                                                <p className="text-xs text-gray-400 mt-0.5">{file.size}</p>
                                            )}
                                        </div>
                                        <Download size={14} className="text-gray-300 group-hover:text-orange-500 transition shrink-0" strokeWidth={2} />
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center">
                        {files.length > 0 ? `${files.length} file${files.length !== 1 ? 's' : ''} available` : 'No files available'}
                    </p>
                </div>
            </div>
        </>
    );
};

export default CourseFilesDrawer;
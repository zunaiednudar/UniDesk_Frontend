import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import axiosSecure from '../../utils/axiosSecure.js';
import Loading from '../../Components/Loading/Loading.jsx';
import { ArrowLeft, Building2, CalendarClock, Check, Cog, Copy, FolderOpen, GraduationCap, LogOut, LucideClipboardCheck, Megaphone, UserCheck, UserX, Users, Search, UserMinus, Download, Trash2 } from 'lucide-react';
import PaginationTemplate from '../../Components/PaginationTemplate/PaginationTemplate.jsx';
import { MdManageAccounts, MdOutlineAssignmentTurnedIn } from 'react-icons/md';
import { FiBookOpen } from "react-icons/fi";
import { GiTeacher } from "react-icons/gi";
import { IoMdCreate } from 'react-icons/io';
import timeAgo from '../../utils/timeAgo.js';
import { RxPeople } from "react-icons/rx";
import { formatDueDate } from '../../utils/formatDueDate.js';
import { toast } from 'sonner';
import formatName from '../../utils/formatName.js';

const FacultyCourseDetails = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    /* Course edit related */

    const [loadingEditCourse, setLoadingEditCourse] = useState(false);
    const [loadingGenerateLink, setLoadingGenerateLink] = useState(false);

    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [inviteLink, setInviteLink] = useState("");
    const [copied, setCopied] = useState(false);

    // Edit course modal related

    const editCourseModalRef = useRef(null);

    const handleOpenEditCourseModal = () => {
        if (!course)
            return;

        setDescription(course?.description || "");
        setStatus(course?.status || "");
        setInviteLink(
            course?.invitationCode
                ? `${import.meta.env.VITE_LIVE_LINK}/join-course?code=${course.invitationCode}`
                : ""
        );
        setCopied(false);
        editCourseModalRef.current.showModal();
    };

    const handleCloseEditCourseModal = () => {
        editCourseModalRef.current.close();
        setCopied(false);
    };

    // Code extraction from link

    const extractCodeFromLink = (link) => {
        if (!link)
            return "";
        try {
            const url = new URL(link);
            return url.searchParams.get("code") || "";
        } catch {
            return "";
        }
    };

    // Invitation generation function

    const handleGenerateInvite = async () => {
        try {
            setLoadingGenerateLink(true);

            const res = await axiosSecure.patch(`/courses/${id}`, {
                regenerateInvite: true
            });

            const nextInvitationCode = res?.data?.invitationCode || extractCodeFromLink(res?.data?.newInvitationLink);
            const nextInviteLink = nextInvitationCode ? `${import.meta.env.VITE_LIVE_LINK}/join-course?code=${nextInvitationCode}` : (res?.data?.newInvitationLink || "");

            setInviteLink(nextInviteLink);
            setCourse((prev) => ({
                ...prev,
                invitationCode: nextInvitationCode || prev?.invitationCode
            }));
            handleCloseEditCourseModal();
            toast.success("Invitation Link updated");
        } catch (error) {
            toast.error("Invitation Link update failed");
        } finally {
            setLoadingGenerateLink(false);
        }
    };

    // Copy invitation link function

    const handleCopyInvite = async () => {
        if (!inviteLink)
            return;

        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            console.error(error);
        }
    };

    // Handle Edit course function

    const handleEditCourse = async (e) => {
        e.preventDefault();
        try {
            setLoadingEditCourse(true);

            if (course?.status === "completed") {
                handleCloseEditCourseModal();
                toast.info("Completed course cannot be  updated");
                return;
            }

            let updatedData = {};

            if (description === course.description && status === course.status) {
                handleCloseEditCourseModal();
                toast.info("Nothing to update")
                return;
            }

            if (description !== course.description)
                updatedData.description = description;

            if (status !== course.status)
                updatedData.status = status;

            const res = await axiosSecure.patch(`/courses/${id}`, updatedData);

            if (!res.data.success) {
                handleCloseEditCourseModal();
                toast.info(res.data.message);
                return;
            }

            setCourse((prev) => ({
                ...prev,
                ...updatedData
            }));

            handleCloseEditCourseModal();
            toast.success("Course updated successfully");

        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        } finally {
            setLoadingEditCourse(false);
        }
    };

    // Course, Announcements and Assignments fetch

    useEffect(() => {

        const fetchCourse = async () => {
            try {
                setLoading(true);
                const res = await axiosSecure.get(`/courses/${id}`);
                setCourse(res.data.course);
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                const res = await axiosSecure.get(`/course/${id}/announcements`);
                const resAnnouncements = res?.data?.announcements;
                const sortedAnnouncements = [...resAnnouncements].sort((a, b) =>
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                );
                setAnnouncements(sortedAnnouncements);
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchAssignments = async () => {
            try {
                setLoading(true);
                const res = await axiosSecure.get(`/course/${id}/assignments`);
                const resAssignments = res?.data?.assignments;
                const sortedAssignments = [...resAssignments].sort((a, b) =>
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                );
                setAssignments(sortedAssignments);
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchMaterials = async () => {
            try {
                setLoading(true);
                const res = await axiosSecure.get(`/course/${id}/materials`);
                const resMaterials = res?.data?.materials || [];
                const sortedMaterials = [...resMaterials].sort((a, b) =>
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                );
                setMaterials(sortedMaterials);
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourse();
            fetchAnnouncements();
            fetchAssignments();
            fetchMaterials();
        }
    }, [id]);

    // Course related info for stats card

    const stats = [
        {
            logo: Building2,
            title: "Department",
            info: course?.department.toUpperCase()
        },
        {
            logo: GraduationCap,
            title: "Academic Year & Semester",
            info: `${course?.year} • ${course?.semester} • ${course?.session}`
        },
        {
            logo: Users,
            title: "Students",
            info: `${course?.students?.length} enrolled`
        },
        {
            logo: MdOutlineAssignmentTurnedIn,
            title: "Assignments",
            info: `${assignments.length}`
        }
    ];

    /* Managing students related  */

    const [loadingRemoveStudent, setLoadingRemoveStudent] = useState(false);
    const [confirmStudent, setConfirmStudent] = useState(null);

    // Manage students modal related

    const manageStudentModalRef = useRef(null);
    const confirmRemoveModalRef = useRef(null);

    const handleManageStudentOpenModal = () => {
        setStudentSearch("");
        setStudentPage(1);
        manageStudentModalRef.current.showModal();
    };

    const handleManageStudentCloseModal = () => manageStudentModalRef.current.close();

    const handleOpenConfirmRemove = (student) => {
        setConfirmStudent(student);
        confirmRemoveModalRef.current?.showModal();
    };

    const handleCloseConfirmRemove = () => {
        confirmRemoveModalRef.current?.close();
        setConfirmStudent(null);
    };

    const allStudents = course?.students || [];

    // Pagination

    const [studentSearch, setStudentSearch] = useState("");
    const [studentPage, setStudentPage] = useState(1);

    const studentsPerPage = 10;

    const filteredStudents = allStudents.filter((student) => {
        const query = studentSearch.toLowerCase().trim();
        if (!query)
            return true;

        return (
            student?.name.toLowerCase().includes(query) || student?.studentID.toLowerCase().includes(query)
        );
    });

    const totalStudentPages = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));
    const safeStudentPage = Math.min(studentPage, totalStudentPages);
    const startStudent = (safeStudentPage - 1) * studentsPerPage;
    const paginatedStudents = filteredStudents.slice(startStudent, startStudent + studentsPerPage);

    // Student removal function

    const handleRemoveStudent = async () => {
        if (!confirmStudent?._id)
            return;
        try {
            setLoadingRemoveStudent(true);

            await axiosSecure.delete(`/courses/${id}/students/${confirmStudent._id}`);

            setCourse((prev) => ({
                ...prev,
                students: prev?.students.filter((s) => s._id !== confirmStudent._id),
            }));

            handleCloseConfirmRemove();
            handleManageStudentCloseModal();
            toast.success("Student removed successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to remove student");
        } finally {
            setLoadingRemoveStudent(false);
        }
    };

    /* Course materials */

    const [confirmMaterial, setConfirmMaterial] = useState(null);
    const [loadingRemoveMaterial, setLoadingRemoveMaterial] = useState(false);

    // Course files modal related

    const manageMaterialsModalRef = useRef(null);
    const confirmRemoveMaterialModalRef = useRef(null);

    const handleManageMaterialsOpenModal = () => {
        setMaterialSearch("");
        setMaterialPage(1);
        manageMaterialsModalRef.current?.showModal();
    };

    const handleManageMaterialsCloseModal = () => manageMaterialsModalRef.current?.close();

    const handleOpenConfirmRemoveMaterial = (material) => {
        setConfirmMaterial(material);
        confirmRemoveMaterialModalRef.current?.showModal();
    };

    const handleCloseConfirmRemoveMaterial = () => {
        confirmRemoveMaterialModalRef.current?.close();
        setConfirmMaterial(null);
    };

    // Pagination

    const [materialSearch, setMaterialSearch] = useState("");
    const [materialPage, setMaterialPage] = useState(1);

    const materialsPerPage = 10;

    const filteredMaterials = materials.filter((material) => {
        const query = materialSearch.toLowerCase().trim();
        if (!query)
            return true;
        return material?.title.toLowerCase().includes(query);
    });

    const totalMaterialPages = Math.max(1, Math.ceil(filteredMaterials.length / materialsPerPage));
    const safeMaterialPage = Math.min(materialPage, totalMaterialPages);
    const startMaterial = (safeMaterialPage - 1) * materialsPerPage;
    const paginatedMaterials = filteredMaterials.slice(startMaterial, startMaterial + materialsPerPage);

    // Material deletion function

    const handleRemoveMaterial = async () => {
        if (!confirmMaterial?._id)
            return;

        try {
            setLoadingRemoveMaterial(true);

            await axiosSecure.delete(`/course/material/${confirmMaterial._id}`);

            setMaterials((prev) => prev.filter((m) => m._id !== confirmMaterial._id));

            if (paginatedMaterials.length === 1 && materialPage > 1)
                setMaterialPage((p) => p - 1);

            handleCloseConfirmRemoveMaterial();
            toast.success("Material deleted successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete material");
        } finally {
            setLoadingRemoveMaterial(false);
        }
    };

    if (loading)
        return <Loading></Loading>

    console.log(announcements, assignments, materials);
    return (
        <div className='w-full max-w-full p-5 flex flex-col gap-10 gilroy'>

            {/* First Block */}

            <div className='flex flex-col gap-5'>

                {/* Go back button */}

                <Link to="/dashboard/faculty/my-courses" className='flex items-center gap-1 text-sm text-gray-500'><ArrowLeft className='w-4 h-4' /> <span>Back to Courses</span>
                </Link>

                {/* Course name and code */}

                <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                        <p className='graphik font-semibold text-xl md:text-2xl lg:text-3xl'>{course?.courseCode}</p>
                        {
                            course?.status === "active" ?
                                <span className="badge bg-green-100 border-green-200 text-xs text-green-600 font-semibold rounded-xl"><div className='bg-green-600 w-2 h-2 rounded-full'></div>Active</span>
                                :
                                <span className="badge bg-blue-100 border-blue-200 text-xs text-blue-600 font-semibold rounded-xl"><Check className='text-blue-600 w-3 h-3'></Check>Completed</span>
                        }
                    </div>
                    <p className='text-gray-500'>{course?.courseName}</p>
                </div>
            </div>

            {/* Second Block of stats cards */}

            <div className='w-full max-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-items-center gap-3'>
                {
                    stats.map(stat =>
                        <div key={stat.title} className='w-full p-5 rounded-lg shadow-lg flex flex-col gap-2 box-border border border-gray-100 hover:-translate-y-1 transition-all duration-300'>
                            <div className='flex gap-2 items-center'>
                                <stat.logo className='w-5 h-5 text-gray-500' />
                                <p className='text-gray-500 text-xs'>{stat.title}</p>

                            </div>
                            <p className='graphik text-sm font-medium'>{stat.info}</p>
                        </div>
                    )
                }
            </div>

            {/* Third block of course management buttons */}

            <div className='w-full flex flex-col p-5 rounded-lg shadow-lg gap-5 box-border border border-gray-100'>
                <div className='flex items-center gap-2'>
                    <div className='w-10 h-10 bg-gray-100 rounded-lg flex justify-center items-center'>
                        <MdManageAccounts className='w-5 h-5 text-black' />
                    </div>
                    <p className='font-semibold'>Manage course</p>
                </div>

                <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-4 md:p-5 gap-3'>
                    <button className='w-full min-h-10 justify-center flex items-center gap-2 text-xs md:text-sm text-black border border-black px-3 py-2 rounded-xl whitespace-nowrap transition-colors hover:bg-black hover:text-white duration-500 cursor-pointer' onClick={handleOpenEditCourseModal}><Cog /> Edit </button>

                    <button className='w-full min-h-10 justify-center flex items-center gap-2 text-xs md:text-sm text-blue-600 border border-blue-200 px-3 py-2 rounded-xl whitespace-nowrap transition-colors hover:bg-blue-600 hover:text-white duration-500 cursor-pointer' onClick={handleManageStudentOpenModal}>
                        <RxPeople className='w-4 h-4 shrink-0' /> Manage Students
                    </button>

                    <button className='w-full min-h-10 justify-center flex items-center gap-2 text-xs md:text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-xl whitespace-nowrap transition-colors hover:bg-gray-600 hover:text-white duration-500 cursor-pointer' onClick={handleManageMaterialsOpenModal}><FolderOpen className='w-4 h-4 shrink-0' /> Course Files</button>

                    <button className='w-full min-h-10 justify-center flex items-center gap-2 text-xs md:text-sm text-red-600 border border-red-200 px-3 py-2 rounded-xl whitespace-nowrap transition-colors hover:bg-red-600 hover:text-white duration-500 cursor-pointer'><LogOut className='w-4 h-4 shrink-0' /> Leave Course</button>
                </div>
            </div>

            {/* Fourth block of Announcements */}

            <div className='w-full flex flex-col p-5 rounded-lg shadow-lg gap-5 box-border border border-gray-100'>
                <div className='w-full flex flex-col items-start md:items-center md:justify-between md:flex-row gap-5'>
                    <div className='flex items-center gap-2'>
                        <div className='w-10 h-10 bg-blue-100 rounded-lg flex justify-center items-center'>
                            <Megaphone className='w-5 h-5 text-blue-700' />
                        </div>
                        <p className='font-semibold'>Announcements</p>
                    </div>

                    {/* Announcement creation button */}

                    <button className="flex gap-2 items-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-blue-600 duration-500 text-xs md:text-sm lg:text-md"><IoMdCreate /> Create
                    </button>
                </div>
                <div className='flex flex-col gap-2'>
                    {
                        announcements.length === 0 ?
                            <p className='col-span-full text-gray-500 text-sm md:text- md lg:text-lg text-center py-10'>
                                No announcement found
                            </p>
                            :
                            announcements.map(announcement =>
                                <div className='flex flex-col gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-500 cursor-pointer'>
                                    <div className='flex justify-between'>
                                        <p className='font-semibold text-xs truncate md:text-sm'>{announcement?.title}</p>
                                        <p className='text-xs text-gray-500'>{timeAgo(announcement?.updatedAt)}</p>
                                    </div>
                                    <p className='text-xs text-gray-500 truncate'>{announcement?.description}</p>
                                </div>
                            )
                    }
                </div>
            </div>

            {/* Fifth block of assignments and course's other info */}

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10'>

                {/* Assignments */}

                <div className='col-span-1 md:col-span-2 lg:col-span-3 w-full flex flex-col p-4 md:p-5 rounded-lg shadow-lg gap-5 box-border border border-gray-100'>
                    <div className='w-full flex flex-col items-start md:items-center md:justify-between md:flex-row gap-5'>
                        <div className='flex items-center gap-2'>
                            <div className='w-10 h-10 bg-orange-100 rounded-lg flex justify-center items-center'>
                                <LucideClipboardCheck className='w-5 h-5 text-orange-700' />
                            </div>
                            <p className='font-semibold'>Assignments</p>
                        </div>

                        {/* Assignment creation button */}

                        <button className="flex gap-2 items-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-blue-600 duration-500 text-xs md:text-sm lg:text-md"><IoMdCreate /> Create
                        </button>
                    </div>
                    <div className='flex flex-col gap-2'>
                        {
                            assignments.length === 0 ?
                                <p className='w-full text-gray-500 text-sm md:text- md lg:text-lg text-center py-10'>
                                    No assignment found
                                </p>
                                :
                                assignments.map(assignment =>
                                    <div key={assignment?._id} className='flex flex-col gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-500 cursor-pointer'>
                                        <div className='flex items-start justify-between'>
                                            <p className='font-semibold text-sm md:text-base truncate'>{assignment?.title}</p>
                                            <p className='text-xs text-gray-500 mt-1'>{timeAgo(assignment?.updatedAt)}</p>
                                        </div>

                                        <p className='text-xs md:text-sm text-gray-600 line-clamp-2'>{assignment?.description}</p>

                                        <div className='grid grid-cols-1 md:grid-cols-3 gap-2 text-xs'>
                                            <div className='flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700'>
                                                <CalendarClock className='w-4 h-4 text-blue-600' />
                                                <span className='truncate'>{formatDueDate(assignment?.dueDate)}</span>
                                            </div>
                                            <div className='flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-700'>
                                                <UserCheck className='w-4 h-4' />
                                                <span>{assignment?.submissions?.length || 0} Submitted</span>
                                            </div>
                                            <div className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700'>
                                                <UserX className='w-4 h-4' />
                                                <span>{course?.students?.length - assignment?.submissions?.length < 0 ? "0" : course?.students?.length - assignment?.submissions?.length} Missing</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                        }
                    </div>
                </div>
                {/* Instructors and description */}

                <div className='col-span-1 md:col-span-2 lg:col-span-1 p-0 md:p-1 lg:p-0'>

                    {/* Instructors */}

                    <div className='w-full flex flex-col p-4 md:p-5 rounded-lg shadow-lg gap-5 box-border border border-gray-100'>
                        <div className='flex items-center gap-2'>
                            <div className='w-10 h-10 bg-purple-100 rounded-lg flex justify-center items-center'>
                                <GiTeacher className='w-5 h-5 text-purple-700' />
                            </div>
                            <p className='font-semibold'>Instructors</p>
                        </div>
                        <div className='flex flex-col gap-1'>
                            {
                                course?.faculties.length === 0
                                    ?
                                    <p className='w-full text-gray-500 text-xs text-center py-10'>
                                        No instructor found
                                    </p>
                                    :
                                    course?.faculties.map(faculty =>
                                        <div key={faculty?._id || faculty?.email} className='w-full h-auto flex items-center gap-3 min-w-0'>
                                            <img className='w-10 h-10 rounded-full shrink-0' src={faculty?.photoURL} />
                                            <div className='flex flex-col min-w-0 w-full'>
                                                <p className='text-xs font-bold truncate'>{formatName(faculty?.name)}</p>
                                                <p className='text-xs break-all leading-tight'>{faculty?.email}</p>
                                            </div>
                                        </div>
                                    )
                            }
                        </div>
                    </div>

                    {/* Description */}

                    <div className='w-full flex flex-col p-4 md:p-5 rounded-lg shadow-lg gap-5 box-border border border-gray-100'>
                        <div className='flex items-center gap-2'>
                            <div className='w-10 h-10 bg-gray-100 rounded-lg flex justify-center items-center'>
                                <FiBookOpen className='w-5 h-5 text-gray-700' />
                            </div>
                            <p className='font-semibold'>Description</p>
                        </div>
                        <p className='w-full text-gray-500 text-sm'>
                            {!course?.description ? "No description found" : course?.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit course modal */}

            <dialog ref={editCourseModalRef} className="modal modal-bottom sm:modal-middle">

                <div className="modal-box max-w-xl p-8">

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold graphik">
                            Edit Course
                        </h3>

                        <button
                            onClick={handleCloseEditCourseModal}
                            className="btn btn-sm btn-circle btn-ghost"
                        >
                            ✕
                        </button>
                    </div>

                    {
                        course && (
                            <div className="flex flex-col gap-6">

                                {/* Course Info */}

                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3">

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium">
                                            Course Code
                                        </span>
                                        <span className="font-semibold text-gray-900 text-sm tracking-wide">
                                            {course.courseCode}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium">
                                            Session
                                        </span>
                                        <span className="font-semibold text-gray-900 text-sm">
                                            {course.session}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium">
                                            Year
                                        </span>
                                        <span className="font-semibold text-gray-900 text-sm">
                                            {course.year}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium">
                                            Semester
                                        </span>
                                        <span className="font-semibold text-gray-900 text-sm">
                                            {course.semester}
                                        </span>
                                    </div>
                                </div>

                                {/* Description + Status Form */}

                                <form
                                    onSubmit={handleEditCourse}
                                    className="flex flex-col gap-4"
                                >

                                    {/* Description */}

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Description
                                        </label>

                                        <textarea
                                            rows="3"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="textarea textarea-bordered w-full resize-none"
                                            required
                                        />
                                    </div>

                                    {/* Status */}

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Status
                                        </label>

                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="select select-bordered w-full"
                                        >
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>

                                    {/* Submit Button */}

                                    <button
                                        disabled={loadingEditCourse}
                                        className="bg-[#1E40AF] text-white rounded-lg py-2 transition-colors hover:bg-blue-600 duration-500 cursor-pointer"
                                    >
                                        {
                                            loadingEditCourse
                                                ? <span className="loading loading-dots loading-md"></span>
                                                : "Update Course"
                                        }
                                    </button>

                                </form>

                                {/* Invitation Section */}

                                <div className="border-t pt-4 flex flex-col gap-3">

                                    <h4 className="font-semibold">
                                        Invitation Link
                                    </h4>

                                    <div className="flex gap-2">

                                        <input
                                            readOnly
                                            value={inviteLink}
                                            placeholder="Click generate to create invitation link"
                                            className="input input-bordered w-full"
                                        />

                                        <button
                                            type="button"
                                            disabled={!inviteLink}
                                            onClick={handleCopyInvite}
                                            className={`btn flex items-center gap-2 transition-all duration-200 ${copied
                                                ? "bg-green-600 text-white border-green-600"
                                                : "btn-soft"
                                                }`}
                                        >
                                            {
                                                copied ? <Check size={16} /> : <Copy size={16} />
                                            }
                                            {
                                                copied ? "Copied" : "Copy"
                                            }
                                        </button>

                                    </div>

                                    <button
                                        disabled={loadingGenerateLink}
                                        onClick={handleGenerateInvite}
                                        className="bg-[#1E40AF] text-white rounded-lg py-2 transition-colors hover:bg-blue-600 duration-500 cursor-pointer"
                                    >
                                        {
                                            loadingGenerateLink
                                                ? <span className="loading loading-dots loading-md"></span>
                                                : (inviteLink ? "Regenerate Invitation Link" : "Generate Invitation Link")
                                        }
                                    </button>
                                </div>

                            </div>
                        )
                    }

                </div>
            </dialog>

            {/* Manage student modal */}

            <dialog ref={manageStudentModalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-3xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold graphik">Manage Students</h3>
                        <button
                            className="btn btn-sm btn-circle btn-ghost"
                            onClick={handleManageStudentCloseModal}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Search bar */}

                    <div className="w-full flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all mb-4">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={studentSearch}
                            onChange={(e) => {
                                setStudentSearch(e.target.value);
                                setStudentPage(1);
                            }}
                            placeholder="Search by name or student ID"
                            className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        {
                            filteredStudents.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-10">No student found</p>
                            ) : (
                                paginatedStudents.map((student) => (
                                    <div key={student._id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img src={student?.photoURL} alt={student?.name || "student"} className="w-10 h-10 rounded-full shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate">{formatName(student?.name)}</p>
                                                <p className="text-xs text-gray-500 break-all">{student?.studentID}</p>
                                            </div>
                                        </div>

                                        <button
                                            disabled={course?.status === "completed"}
                                            onClick={() => handleOpenConfirmRemove(student)}
                                            className="btn btn-sm border-red-200 text-red-600 hover:bg-red-600 hover:text-white"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )
                        }
                    </div>

                    {
                        filteredStudents.length > 0 && (
                            <div className="mt-4 flex justify-center">
                                <PaginationTemplate
                                    page={safeStudentPage}
                                    totalPages={totalStudentPages}
                                    onChange={setStudentPage}
                                />
                            </div>
                        )
                    }
                </div>
            </dialog>

            {/* Remove student confirmation from course */}

            <dialog ref={confirmRemoveModalRef} className="modal modal-middle">
                <div className="modal-box max-w-md">
                    <h3 className="font-bold text-lg">Remove Student</h3>
                    <p className="py-3 text-sm text-gray-600">
                        Are you sure you want to remove this student?
                    </p>
                    <div className="flex justify-end gap-2">
                        <button className="btn btn-soft" onClick={handleCloseConfirmRemove}>Cancel</button>
                        <button
                            className="w-25 bg-[#1E40AF] text-white transition-colors hover:bg-blue-600 duration-500 cursor-pointer"
                            disabled={loadingRemoveStudent}
                            onClick={handleRemoveStudent}
                        >
                            {
                                loadingRemoveStudent ? <span className="loading loading-dots loading-md"></span> : "Remove"
                            }
                        </button>
                    </div>
                </div>
            </dialog>

            {/* Managing material modal */}

            <dialog ref={manageMaterialsModalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-3xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold graphik">Course Materials</h3>
                        <button className="btn btn-sm btn-circle btn-ghost" onClick={handleManageMaterialsCloseModal}>✕</button>
                    </div>

                    {/* Search bar */}

                    <div className="w-full flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all mb-4">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={materialSearch}
                            onChange={(e) => {
                                setMaterialSearch(e.target.value);
                                setMaterialPage(1);
                            }}
                            placeholder="Search material by title"
                            className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        {
                            filteredMaterials.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-10">No material found</p>
                            ) : (
                                paginatedMaterials.map((material) => (
                                    <div key={material._id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
                                        <p className="text-sm font-semibold truncate">{material?.title}</p>
                                        <div className='flex items-center gap-2'>
                                            <a
                                                href={material?.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white shrink-0"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => handleOpenConfirmRemoveMaterial(material)}
                                                className="btn btn-sm border-red-200 text-red-600 hover:bg-red-600 hover:text-white"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                    </div>
                                ))
                            )
                        }
                    </div>

                    {
                        filteredMaterials.length > 0 && (
                            <div className="mt-4 flex justify-center">
                                <PaginationTemplate
                                    page={safeMaterialPage}
                                    totalPages={totalMaterialPages}
                                    onChange={setMaterialPage}
                                />
                            </div>
                        )
                    }
                </div>
            </dialog>

            {/* Material deletion modal */}

            <dialog ref={confirmRemoveMaterialModalRef} className="modal modal-middle">
                <div className="modal-box max-w-md">
                    <h3 className="font-bold text-lg">Delete Material</h3>
                    <p className="py-3 text-sm text-gray-600">
                        Are you sure you want to delete this material?
                    </p>

                    <div className="flex justify-end gap-2">
                        <button className="btn btn-soft" onClick={handleCloseConfirmRemoveMaterial}>
                            Cancel
                        </button>

                        <button
                            className="btn bg-[#1E40AF] text-white transition-colors hover:bg-blue-600 duration-500 cursor-pointer"
                            disabled={loadingRemoveMaterial}
                            onClick={handleRemoveMaterial}
                        >
                            {
                                loadingRemoveMaterial ? (
                                    <span className="loading loading-dots loading-md"></span>
                                ) : (
                                    "Delete"
                                )
                            }
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default FacultyCourseDetails;

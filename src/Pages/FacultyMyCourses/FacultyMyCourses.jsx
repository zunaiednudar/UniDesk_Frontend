import { Building2, Cog, Eye, GraduationCap, Search, Users, Copy, Check } from 'lucide-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { IoMdCreate } from 'react-icons/io';
import axiosSecure from '../../utils/axiosSecure.js';
import { toast } from 'sonner';
import { Link } from 'react-router';
import CardSkeleton from '../../Components/CardSkeleton/CardSkeleton.jsx';
import PaginationTemplate from '../../Components/PaginationTemplate/PaginationTemplate.jsx';

const FacultyMyCourses = () => {
    // Filtering
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Loading

    const [loadingEditCourse, setLoadingEditCourse] = useState(false);
    const [loadingGenerateLink, setLoadingGenerateLink] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingCreateCourse, setLoadingCreateCourse] = useState(false);

    // Fetching courses for UI

    const [activeCourses, setActiveCourses] = useState([]);
    const [completedCourses, setCompletedCourses] = useState([]);

    // Modal refs

    const editCourseModalRef = useRef(null);
    const createCourseModalRef = useRef(null);

    // Course creation

    const subjectOptions = [
        { code: "ARCH", name: "Architecture" },
        { code: "BME", name: "Biomedical Engineering" },
        { code: "BECM", name: "Building Engineering and Construction Management" },
        { code: "CHE", name: "Chemical Engineering" },
        { code: "CE", name: "Civil Engineering" },
        { code: "CSE", name: "Computer Science and Engineering" },
        { code: "EEE", name: "Electrical and Electronic Engineering" },
        { code: "ECE", name: "Electronics and Communication Engineering" },
        { code: "ESE", name: "Energy Science and Engineering" },
        { code: "IEM", name: "Industrial Engineering and Management" },
        { code: "LE", name: "Leather Engineering" },
        { code: "MSE", name: "Materials Science and Engineering" },
        { code: "ME", name: "Mechanical Engineering" },
        { code: "MTE", name: "Mechatronics Engineering" },
        { code: "TE", name: "Textile Engineering" },
        { code: "URP", name: "Urban and Regional Planning" },

        { code: "MATH", name: "Mathematics" },
        { code: "PHY", name: "Physics" },
        { code: "CHEM", name: "Chemistry" },
        { code: "HUM", name: "Humanities" }
    ];

    // Course creation form data

    const [subject, setSubject] = useState("");
    const [year, setYear] = useState("");
    const [semester, setSemester] = useState("");
    const [serial, setSerial] = useState("");
    const [description, setDescription] = useState("");
    const [department, setDepartment] = useState("");
    const [session, setSession] = useState("");
    const [courseName, setCourseName] = useState("");

    const yearNumber = year ? year[0] : "";
    const semesterNumber = semester ? semester[0] : "";

    const courseCode = subject && year && semester && serial
        ?
        `${subject} ${yearNumber}${semesterNumber}${serial}`
        :
        "";

    // Course creation modal related 

    const handleOpenCreateCourseModal = () => createCourseModalRef.current.showModal();
    const handleCloseCreateCourseModal = () => createCourseModalRef.current.close();

    // Edit course modal related

    const handleOpenEditCourseModal = async (id) => {
        try {
            setCopied(false);
            const res = await axiosSecure.get(`/courses/${id}`);

            const course = res.data.course;
            setSelectedCourse(course);
            setSelectedCourseDescription(course.description);
            setStatus(course.status);

            if (course.invitationCode) {
                const link = `${import.meta.env.VITE_LIVE_LINK}/join-course?code=${course.invitationCode}`;
                setInviteLink(link);
            }
            else
                setInviteLink("");

            editCourseModalRef.current.showModal();
        } catch (error) {
            console.error(error);
        }

    };

    const handleCloseEditCourseModal = () => {
        editCourseModalRef.current.close();

        setTimeout(() => {
            setSelectedCourse(null);
            setInviteLink("");
            setCopied(false);
        }, 200);
    };

    // Course creation function

    const handleCourseCreate = async (e) => {
        e.preventDefault();

        if (!courseCode) {
            handleCloseCreateCourseModal();
            toast.error("Course code is invalid");
            return;
        }

        const sessionRegex = /^\d{4}-\d{4}$/;

        if (!sessionRegex.test(session)) {
            handleCloseCreateCourseModal();
            toast.error("Session must be in format YYYY-YYYY");
            return;
        }

        try {
            setLoadingCreateCourse(true);
            const data = {
                courseCode,
                courseName,
                description,
                session,
                year,
                semester,
                department
            };

            const res = await axiosSecure.post("/courses", data);

            if (!res.data.success) {
                handleCloseCreateCourseModal();
                toast.error(res.data.message);
                return;
            }

            console.log(res.data);

            toast.success("Course created successfully");

            const newCourse = res.data.course;

            setActiveCourses(prev => [newCourse, ...prev]);

            setSubject("");
            setYear("");
            setSemester("");
            setSerial("");
            setDescription("");
            setDepartment("");
            setSession("");
            setCourseName("");

            handleCloseCreateCourseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Course creation failed");
        } finally {
            setLoadingCreateCourse(false);
        }
    };

    // Fetch user's courses

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoadingCourses(true);
                const res = await axiosSecure.get("/courses/my-courses", {
                    params: {
                        page,
                        search
                    }
                });
                const data = res.data;
                // console.log(data);
                setActiveCourses(data.activeCourses);
                setCompletedCourses(data.completedCourses);
                setTotalPages(data.completedPagination?.totalPages || 1);
            } catch (error) {
                toast.error("Course fetch failed");
            } finally {
                setLoadingCourses(false);
            }
        };

        // To stop spamming by typing

        const timer = setTimeout(() => {
            fetchCourses();
        }, 400);

        return () => clearTimeout(timer);
    }, [page, search]);

    // Course edit related

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedCourseDescription, setSelectedCourseDescription] = useState("");
    const [status, setStatus] = useState("");
    const [inviteLink, setInviteLink] = useState("");
    const [copied, setCopied] = useState(false);

    // Invitation generation function

    const handleGenerateInvite = async () => {
        if (!selectedCourse)
            return;
        try {
            setLoadingGenerateLink(true);

            const res = await axiosSecure.patch(`/courses/${selectedCourse._id}`, {
                regenerateInvite: true
            });

            setInviteLink(res.data.newInvitationLink);
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

            if (selectedCourse.status === "completed") {
                handleCloseEditCourseModal();
                toast.info("Completed course cannot be  updated");
                return;
            }

            let updatedData = {};

            if (selectedCourseDescription === selectedCourse.description && status === selectedCourse.status) {
                handleCloseEditCourseModal();
                toast.info("Nothing to update")
                return;
            }

            if (selectedCourseDescription !== selectedCourse.description)
                updatedData.description = selectedCourseDescription;

            if (status !== selectedCourse.status)
                updatedData.status = status;

            const res = await axiosSecure.patch(`/courses/${selectedCourse._id}`, updatedData);

            if (!res.data.success) {
                handleCloseEditCourseModal();
                toast.info(res.data.message);
                return;
            }

            const updatedCourse = {
                ...selectedCourse,
                ...updatedData
            };

            setActiveCourses(prev =>
                prev.filter(c => c._id !== updatedCourse._id)
            );

            setCompletedCourses(prev =>
                prev.filter(c => c._id !== updatedCourse._id)
            );

            if (updatedCourse.status === "active")
                setActiveCourses(prev => [updatedCourse, ...prev]);

            if (updatedCourse.status === "completed")
                setCompletedCourses(prev => [updatedCourse, ...prev]);

            handleCloseEditCourseModal();
            toast.success("Course updated successfully");

        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        } finally {
            setLoadingEditCourse(false);
        }
    };

    return (
        <div className='w-full max-w-full p-10 flex flex-col gap-10 gilroy'>
            <div className='w-full max-w-full'>
                <p className='text-3xl graphik font-bold text-black'>My Courses</p>
                <p className='text-gray-500'>Manage and track courses</p>
            </div>
            <div className='w-full flex flex-col items-start md:items-center md:flex-row gap-5'>
                <div className="w-full flex flex-2 items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search course"
                        className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
                    />
                </div>
                <button className="flex gap-2 items-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-blue-600 duration-500 text-xs md:text-sm lg:text-md" onClick={handleOpenCreateCourseModal}><IoMdCreate /> Create</button>
            </div>

            <div className='w-full max-w-full flex flex-col justify-items-center gap-10 shadow-xl p-5'>

                {/* Active courses */}

                <div className='w-full flex flex-col gap-5'>
                    <p className=' text-xl md:text-2xl lg:text-3xl font-extrabold graphik'>Active Courses</p>
                    <hr className='border-gray-200' />
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                        {
                            loadingCourses ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <CardSkeleton key={i} variant="courseCard" />
                                )
                                )
                            ) : activeCourses.length === 0 ?
                                (
                                    <p className='col-span-full text-gray-500 md:text-xl lg:text-2xl text-center py-10'>
                                        No active course found
                                    </p>
                                ) :
                                (
                                    activeCourses.map(course =>
                                        <div key={course._id} className='w-full flex flex-col p-6 rounded-xl box-border shadow-md  hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200'>
                                            <div className='mb-6 flex flex-col gap-2'>
                                                <p className='graphik font-bold text-xl md:text-2xl lg:text-3xl'>{course.courseCode}</p>
                                                <p className='text-md md:text-lg font-semibold text-gray-500'>{course.courseName}</p>
                                            </div>
                                            <div className='mb-6'>
                                                <div className='flex items-center gap-2 text-xs md:text-lg font-semibold text-gray-500'>
                                                    <Building2 className='w-4 h-4' /> {course.department.toUpperCase()}</div>
                                                <div className='flex items-center gap-2 text-xs md:text-lg font-semibold text-gray-500'>
                                                    <GraduationCap className='w-4 h-4' /> {course.year} • {course.semester} • {course.session}
                                                </div>
                                                <div className='flex items-center gap-2 text-xs md:text-lg font-semibold text-gray-500'>
                                                    <Users className='w-4 h-4' /> {course.students.length} {course.students.length === 1 ? "student" : "students"}
                                                </div>
                                            </div>
                                            <hr className='border-gray-200 my-4' />
                                            <div className='flex items-center justify-between gap-5 flex-wrap'>
                                                <Link
                                                    to={`/courses/${course._id}`}
                                                    className=' flex flex-1 gap-2 items-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg text-center transition-colors hover:bg-blue-600 duration-500 justify-center'><Eye /> View</Link>
                                                <button className=' flex flex-1 gap-2 items-center bg-black text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-gray-800 duration-500 justify-center' onClick={() => handleOpenEditCourseModal(course._id)}><Cog /> Edit </button>

                                            </div>

                                        </div>
                                    )
                                )
                        }
                    </div>
                </div>

                {/* Completed courses */}

                <div className='w-full md:flex-2  flex flex-col gap-5'>
                    <p className='text-xl md:text-2xl lg:text-3xl font-extrabold graphik'>Completed Courses</p>
                    <hr className='border-gray-200' />
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                        {
                            loadingCourses ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <CardSkeleton key={i} variant="courseCard" />
                                )
                                )
                            ) : completedCourses.length === 0 ?
                                (
                                    <p className='col-span-full text-gray-500 md:text-xl lg:text-2xl text-center py-10'>
                                        No completed course found
                                    </p>
                                ) :
                                (
                                    completedCourses.map(course =>
                                        <div key={course._id} className='w-full flex flex-col p-6 rounded-xl box-border shadow-md  hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-200'>
                                            <div className='mb-6 flex flex-col gap-2'>
                                                <p className='graphik font-bold text-xl md:text-2xl lg:text-3xl'>{course.courseCode}</p>
                                                <p className='text-md md:text-lg font-semibold text-gray-500'>{course.courseName}</p>
                                            </div>
                                            <div className='mb-6'>
                                                <div className='flex items-center gap-2 text-xs md:text-lg font-semibold text-gray-500'>
                                                    <Building2 className='w-4 h-4' /> {course.department.toUpperCase()}</div>
                                                <div className='flex items-center gap-2 text-xs md:text-lg font-semibold text-gray-500'>
                                                    <GraduationCap className='w-4 h-4' /> {course.year} • {course.semester} • {course.session}
                                                </div>
                                                <div className='flex items-center gap-2 text-xs md:text-lg font-semibold text-gray-500'>
                                                    <Users className='w-4 h-4' /> {course.students.length} {course.students.length === 1 ? "student" : "students"}
                                                </div>
                                            </div>
                                            <hr className='border-gray-200 my-4' />
                                            <Link to={`/courses/${course._id}`} className=' flex flex-1 gap-2 items-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg text-center transition-colors hover:bg-blue-600 duration-500 justify-center'><Eye /> View</Link>
                                        </div>
                                    )
                                )
                        }
                    </div>
                    <div className='mx-auto'>
                        <PaginationTemplate
                            page={page}
                            totalPages={totalPages}
                            onChange={setPage}></PaginationTemplate>
                    </div>
                </div>
            </div>

            {/* Create course modal */}

            <dialog ref={createCourseModalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-xl p-8">

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold graphik">Create Course</h3>
                        <button
                            onClick={handleCloseCreateCourseModal}
                            className="btn btn-sm btn-circle btn-ghost"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleCourseCreate} className="flex flex-col gap-4">

                        {/* Subject */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Subject</label>
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="select select-bordered w-full"
                                required
                            >
                                <option value="">Select Subject</option>

                                {
                                    subjectOptions.map((sub) => (
                                        <option key={sub.code} value={sub.code}>
                                            {sub.name} ({sub.code})
                                        </option>
                                    ))
                                }

                            </select>
                        </div>

                        {/* Year + Semester */}
                        <div className="grid grid-cols-2 gap-4">

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">Year</label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="select select-bordered w-full"
                                    required
                                >
                                    <option value="">Select Year</option>
                                    <option value="1st">1st Year</option>
                                    <option value="2nd">2nd Year</option>
                                    <option value="3rd">3rd Year</option>
                                    <option value="4th">4th Year</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">Semester</label>
                                <select
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    className="select select-bordered w-full"
                                    required
                                >
                                    <option value="">Select Semester</option>
                                    <option value="1st">1st Semester</option>
                                    <option value="2nd">2nd Semester</option>
                                </select>
                            </div>

                        </div>

                        {/* Serial */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Course Serial</label>
                            <input
                                type="text"
                                maxLength={2}
                                value={serial}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setSerial(value);
                                }}
                                placeholder="e.g. 09"
                                className="input input-bordered w-full"
                                required
                            />
                        </div>

                        {/* Course Code */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Course Code</label>
                            <input
                                type="text"
                                value={courseCode}
                                readOnly
                                className="input input-bordered w-full bg-gray-100 font-semibold"
                            />
                        </div>

                        {/* Course Name */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Course Name</label>
                            <input
                                name="courseName"
                                value={courseName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setCourseName(value);
                                }}
                                required
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Description</label>
                            <textarea
                                className="textarea textarea-bordered w-full resize-none"
                                name="description"
                                rows="3"
                                value={description}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setDescription(value);
                                }}
                                required
                            />
                        </div>

                        {/* Department */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Department</label>
                            <select
                                value={department}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setDepartment(value);
                                }}
                                className="select select-bordered w-full"
                                name="department"
                                required
                            >
                                <option value="" disabled>Select Department</option>
                                <option value="arch">Architecture</option>
                                <option value="bme">Biomedical Engineering</option>
                                <option value="becm">Building Engineering and Construction Management</option>
                                <option value="che">Chemical Engineering</option>
                                <option value="civil">Civil Engineering</option>
                                <option value="cse">Computer Science and Engineering</option>
                                <option value="eee">Electrical and Electronic Engineering</option>
                                <option value="ece">Electronics and Communication Engineering</option>
                                <option value="ese">Energy Science and Engineering</option>
                                <option value="iem">Industrial Engineering and Management</option>
                                <option value="le">Leather Engineering</option>
                                <option value="mse">Materials Science and Engineering</option>
                                <option value="me">Mechanical Engineering</option>
                                <option value="mte">Mechatronics Engineering</option>
                                <option value="te">Textile Engineering</option>
                                <option value="urp">Urban and Regional Planning</option>
                            </select>
                        </div>

                        {/* Session */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Session</label>
                            <input
                                name="session"
                                className="input input-bordered w-full"
                                type="text"
                                pattern="\d{4}-\d{4}"
                                placeholder="2023-2024"
                                maxLength={9}
                                value={session}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSession(value);
                                }}
                                required
                                title="Session must be in format YYYY-YYYY"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-4">

                            <button
                                type="button"
                                onClick={handleCloseCreateCourseModal}
                                className="btn btn-soft w-32"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={loadingCreateCourse}
                                type="submit"
                                className="w-32 bg-[#1E40AF] text-white rounded-lg py-2 transition-colors hover:bg-blue-600 duration-500 cursor-pointer"
                            >
                                {
                                    loadingCreateCourse
                                        ? <span className="loading loading-dots loading-md"></span>
                                        : "Create"
                                }
                            </button>

                        </div>

                    </form>
                </div>
            </dialog>

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
                        selectedCourse && (
                            <div className="flex flex-col gap-6">

                                {/* Course Info */}

                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3">

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium">
                                            Course Code
                                        </span>
                                        <span className="font-semibold text-gray-900 text-sm tracking-wide">
                                            {selectedCourse.courseCode}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium">
                                            Session
                                        </span>
                                        <span className="font-semibold text-gray-900 text-sm">
                                            {selectedCourse.session}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium">
                                            Year
                                        </span>
                                        <span className="font-semibold text-gray-900 text-sm">
                                            {selectedCourse.year}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium">
                                            Semester
                                        </span>
                                        <span className="font-semibold text-gray-900 text-sm">
                                            {selectedCourse.semester}
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
                                            value={selectedCourseDescription}
                                            onChange={(e) => setSelectedCourseDescription(e.target.value)}
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
        </div>
    );
};

export default FacultyMyCourses;
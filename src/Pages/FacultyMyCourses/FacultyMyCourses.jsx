import { Building2, Cog, Eye, GraduationCap, Search, Users } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { IoMdAdd, IoMdCreate } from 'react-icons/io';
import axiosSecure from '../../utils/axiosSecure.js';
import { toast } from 'sonner';
import { Link } from 'react-router';
import CardSkeleton from '../../Components/CardSkeleton/CardSkeleton.jsx';
import PaginationTemplate from '../../Components/PaginationTemplate/PaginationTemplate.jsx';
import formatName from '../../utils/formatName.js';
import EmptyState from '../../Components/EmptyState/EmptyState.jsx';

const FacultyMyCourses = () => {
    // Filtering
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Loading

    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingCreateCourse, setLoadingCreateCourse] = useState(false);
    const [loadingJoinCourse, setLoadingJoinCourse] = useState(false);

    // Fetching courses for UI

    const [activeCourses, setActiveCourses] = useState([]);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [totalCompleted,setTotalCompleted]=useState(0);

    // Modal refs

    const createCourseModalRef = useRef(null);
    const joinCourseModalRef = useRef(null);

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

    // Join course modal related

    const handleOpenJoinCourseModal = () => joinCourseModalRef.current.showModal();

    const handleCloseJoinCourseModal = () => {
        joinCourseModalRef.current.close();
        setTimeout(() => {
            setInvitationCode("");
        }, 100);
    }

    // Join course data

    const [invitationCode, setInvitationCode] = useState("");

    // Join course function

    const handleJoinCourse = async (e) => {
        e.preventDefault();
        const code = invitationCode.trim();

        if (!code) {
            handleCloseJoinCourseModal();
            toast.info("Course invitation code required");
            return;
        }

        try {
            setLoadingJoinCourse(true);
            const res = await axiosSecure.post(`/courses/faculty/join?code=${code}`);

            if (!res?.data?.success) {
                handleCloseJoinCourseModal()
                toast.error(res?.data?.message);
                return;
            }

            setActiveCourses((prev) => [...prev, res?.data?.course]);

            handleCloseJoinCourseModal();
            toast.success("Joined course successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoadingJoinCourse(false);
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
                setTotalCompleted(data.completedPagination?.totalCompleted || 0);
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

    return (
        <div className='w-full max-w-full p-5 flex flex-col gap-10 gilroy'>
            <div className='w-full max-w-full'>
                <p className='text-3xl graphik font-semibold text-gray-900'>My Courses</p>
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
                <div className='flex gap-2 items-center'>
                    <button className="w-25 flex gap-2 items-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-blue-600 duration-500 text-xs md:text-sm lg:text-md" onClick={handleOpenCreateCourseModal}><IoMdCreate /> Create</button>
                    <button className="w-25 flex gap-2 items-center bg-orange-600 text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-orange-500 duration-500 text-xs md:text-sm lg:text-md" onClick={handleOpenJoinCourseModal}><IoMdAdd /> Join</button>
                </div>
            </div>

            <div className='w-full max-w-full flex flex-col justify-items-center gap-10 shadow-xl p-5'>

                {/* Active courses */}

                <div className='w-full flex flex-col gap-5'>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <p className='font-semibold text-gray-800 graphik'>Active Courses</p>
                        <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">{activeCourses.length}</span>
                    </div>
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
                                    <EmptyState message={"No active course found"}></EmptyState>
                                ) :
                                (
                                    activeCourses.map(course =>
                                        <div key={course._id} className='w-full flex flex-col p-6 rounded-xl box-border shadow-md  hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200'>
                                            <div className='mb-6 flex flex-col gap-2'>
                                                <p className='graphik font-semibold text-lg md:text-xl lg:text-2xl'>{course.courseCode}</p>
                                                <p className='text-sm md:text-md font-semibold text-gray-500 truncate'>{course.courseName}</p>
                                            </div>
                                            <div className='mb-6'>
                                                <div className='flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-500'>
                                                    <Building2 className='w-4 h-4' /> {course.department.toUpperCase()}</div>
                                                <div className='flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-500'>
                                                    <GraduationCap className='w-4 h-4' /> {course.year} • {course.semester} • {course.session}
                                                </div>
                                                <div className='flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-500'>
                                                    <Users className='w-4 h-4' /> {course.students.length} {course.students.length === 1 ? "student" : "students"}
                                                </div>
                                            </div>
                                            {
                                                course.faculties?.length > 0 &&
                                                <div>
                                                    <span className="text-sm text-gray-500 mb-2">Instructors</span>

                                                    {/* Faculty info */}

                                                    <div className="space-y-2">
                                                        {
                                                            course.faculties?.map((faculty) => (
                                                                <div key={faculty.email} className="flex items-center gap-2 text-sm text-gray-500">
                                                                    <img src={faculty?.photoURL} alt={faculty?.name} className="w-5 h-5 rounded-full object-cover mr-2"
                                                                    />
                                                                    <div className="flex flex-col items-start min-w-0">
                                                                        <p className="text-sm text-gray-500 truncate">{formatName(faculty?.name)}</p>
                                                                        <p className="text-xs text-gray-400 break-all">{faculty?.email}</p>
                                                                    </div>
                                                                </div>
                                                            )
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            }

                                            <div className='flex flex-col py-4 mt-auto gap-4'>
                                                <hr className='border-gray-200' />
                                                <Link to={`/dashboard/faculty/courses/${course._id}/details`}
                                                    className=' flex gap-2 items-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg text-center transition-colors hover:bg-blue-600 duration-500 justify-center'><Eye /> View
                                                </Link>
                                            </div>
                                        </div>
                                    )
                                )
                        }
                    </div>
                </div>

                {/* Completed courses */}

                <div className='w-full md:flex-2  flex flex-col gap-5'>
                    <div className="flex items-center gap-2">
                        <p className='font-semibold text-gray-800 graphik'>Completed Courses</p>
                        <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">{totalCompleted}</span>
                    </div>
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
                                    <EmptyState message={"No completed course found"}></EmptyState>
                                ) :
                                (
                                    completedCourses.map(course =>
                                        <div key={course._id} className='w-full flex flex-col p-6 rounded-xl box-border shadow-md  hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-200'>
                                            <div className='mb-6 flex flex-col gap-2'>
                                                <p className='graphik font-semibold text-lg md:text-xl lg:text-2xl'>{course.courseCode}</p>
                                                <p className='text-sm md:text-md font-semibold text-gray-500 truncate'>{course.courseName}</p>
                                            </div>
                                            <div className='mb-6'>
                                                <div className='flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-500'>
                                                    <Building2 className='w-4 h-4' /> {course.department.toUpperCase()}</div>
                                                <div className='flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-500'>
                                                    <GraduationCap className='w-4 h-4' /> {course.year} • {course.semester} • {course.session}
                                                </div>
                                                <div className='flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-500'>
                                                    <Users className='w-4 h-4' /> {course.students.length} {course.students.length === 1 ? "student" : "students"}
                                                </div>
                                            </div>
                                            {
                                                course.faculties?.length > 0 &&
                                                <div>
                                                    <span className="text-sm text-gray-500 mb-2">Instructors</span>

                                                    {/* Faculty info */}

                                                    <div className="space-y-2">
                                                        {
                                                            course.faculties?.map((faculty) => (
                                                                <div key={faculty.email} className="flex items-center gap-2 text-sm text-gray-500">
                                                                    <img src={faculty?.photoURL} alt={faculty?.name} className="w-5 h-5 rounded-full object-cover mr-2"
                                                                    />
                                                                    <div className="flex flex-col items-start min-w-0">
                                                                        <p className="text-sm text-gray-500 truncate">{formatName(faculty?.name)}</p>
                                                                        <p className="text-xs text-gray-400 break-all">{faculty?.email}</p>
                                                                    </div>
                                                                </div>
                                                            )
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            }

                                            <div className='flex flex-col py-4 mt-auto gap-4'>
                                                <hr className='border-gray-200' />
                                                <Link to={`/dashboard/faculty/courses/${course._id}/details`}
                                                    className=' flex gap-2 items-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg text-center transition-colors hover:bg-blue-600 duration-500 justify-center'><Eye /> View
                                                </Link>
                                            </div>
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
                                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="text"
                                maxLength={2}
                                value={serial}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setSerial(value);
                                }}
                                placeholder="e.g. 09"
                                required
                            />
                        </div>

                        {/* Course Code */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Course Code</label>
                            <input
                                className="input input-bordered w-full bg-gray-100 font-semibold"
                                type="text"
                                value={courseCode}
                                readOnly
                            />
                        </div>

                        {/* Course Name */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Course Name</label>
                            <input
                                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="courseName"
                                value={courseName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setCourseName(value);
                                }}
                                required
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
                                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="session"
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

            {/* Join course modal */}

            <dialog ref={joinCourseModalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-xl p-8">

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold graphik">Join Course</h3>
                        <button
                            onClick={handleCloseJoinCourseModal}
                            className="btn btn-sm btn-circle btn-ghost"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleJoinCourse} className="flex flex-col gap-4">
                        {/* Course Name */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Invitation Code</label>
                            <input
                                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="invitationCode"
                                value={invitationCode}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setInvitationCode(value);
                                }}
                                required
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={handleCloseJoinCourseModal}
                                className="btn btn-soft w-32"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={loadingJoinCourse}
                                type="submit"
                                className="w-32 bg-[#1E40AF] text-white rounded-lg py-2 transition-colors hover:bg-blue-600 duration-500 cursor-pointer"
                            >
                                {
                                    loadingJoinCourse
                                        ? <span className="loading loading-dots loading-md"></span>
                                        : "Join"
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </dialog >
        </div >
    );
};

export default FacultyMyCourses;
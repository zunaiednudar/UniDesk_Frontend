import { Building2, Cog, Eye, GraduationCap, Search, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { IoMdCreate } from 'react-icons/io';
import axiosSecure from '../../utils/axiosSecure.js';
import { toast } from 'sonner';
import { Link } from 'react-router';
import CardSkeleton from '../../Components/CardSkeleton/CardSkeleton.jsx';
import PaginationTemplate from '../../Components/PaginationTemplate/PaginationTemplate.jsx';

const FacultyMyCourses = () => {

    // Filtering
    const [search,setSearch]=useState("");
    const [page,setPage]=useState(1);
    const [totalPages,setTotalPages]=useState(1);

    // Loading

    const [loadingCourses, setLoadingCourses] = useState(true);

    // Fetching courses

    const [activeCourses, setActiveCourses] = useState([]);
    const [completedCourses, setCompletedCourses] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoadingCourses(true);
                const res = await axiosSecure.get("/courses/my-courses",{
                    params:{
                        page,
                        search
                    }
                });
                const data = res.data;
                // console.log(data);
                setActiveCourses(data.activeCourses);
                setCompletedCourses(data.completedCourses);
                setTotalPages(data.completedCourses.totalPages);
            } catch (error) {
                toast.error("Course fetch failed");
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [page,search]);

    // console.log(activeCourses, completedCourses);

    return (
        <div className='w-full max-w-full p-10 flex flex-col gap-10 gilroy'>
            <div className='w-full max-w-full'>
                <p className='text-3xl graphik font-bold text-black'>My Courses</p>
                <p className='text-gray-500'>Manage and track courses</p>
            </div>
            <div className='w-full flex flex-col items-start md:items-center md:flex-row gap-5'>
                <div className="flex flex-2 items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e)=>{
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search course"
                        className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
                    />
                </div>
                <button className="flex gap-2 items-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-blue-600 duration-500 text-xs md:text-sm lg:text-md"><IoMdCreate /> Create</button>
            </div>

            <div className='w-full max-w-full flex flex-col justify-items-center gap-10 shadow-xl p-5'>

                {/* Active courses */}

                <div className='w-full flex flex-col gap-5'>
                    <p className=' text-xl md:text-2xl lg:text-3xl font-extrabold graphik'>Active Courses</p>
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
                                        <div className='w-full flex flex-col p-6 rounded-xl box-border shadow-md  hover:shadow-2xl hover:translate-y-1 transition-all duration-300'>
                                            <div className='mb-6 flex flex-col gap-2'>
                                                <p className='graphik font-bold text-xl md:text-2xl lg:text-3xl'>{course.courseCode}</p>
                                                <p className='text-md md:text-lg font-semibold text-gray-500'>{course.courseName}</p>
                                            </div>
                                            <div className='mb-6'>
                                                <div className='flex items-center gap-2 text-xs md:text-lg font-semibold text-gray-500'>
                                                    <Building2 className='w-4 h-4' /> {course.department}</div>
                                                <div className='flex items-center gap-2 text-xs md:text-lg font-semibold text-gray-500'>
                                                    <GraduationCap className='w-4 h-4' /> {course.year} • {course.semester} • {course.session}
                                                </div>
                                                <div className='flex items-center gap-2 text-xs md:text-lg font-semibold text-gray-500'>
                                                    <Users className='w-4 h-4' /> {course.students.length} {course.students.length === 1 ? "student" : "students"}
                                                </div>
                                            </div>
                                            <hr className='border-gray-200 my-4' />
                                            <div className='flex items-center justify-between gap-5 flex-wrap'>
                                                <Link className=' flex flex-1 gap-2 items-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg text-center transition-colors hover:bg-blue-600 duration-500 justify-center'><Eye /> View</Link>
                                                <button className=' flex flex-1 gap-2 items-center bg-black text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-gray-800 duration-500 justify-center'><Cog /> Edit </button>

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
                                        <div className='w-full flex flex-col p-6 rounded-xl box-border shadow-md  hover:shadow-2xl hover:translate-y-1 transition-all duration-300'>
                                            <div className='mb-6 flex flex-col gap-2'>
                                                <p className='graphik font-bold text-xl md:text-2xl lg:text-3xl'>{course.courseCode}</p>
                                                <p className='text-md md:text-lg font-semibold text-gray-500'>{course.courseName}</p>
                                            </div>
                                            <div className='mb-6'>
                                                <div className='flex items-center gap-2 text-xs md:text-lg font-semibold text-gray-500'>
                                                    <Building2 className='w-4 h-4' /> {course.department}</div>
                                                <div className='flex items-center gap-2 text-xs md:text-lg font-semibold text-gray-500'>
                                                    <GraduationCap className='w-4 h-4' /> {course.year} • {course.semester} • {course.session}
                                                </div>
                                                <div className='flex items-center gap-2 text-xs md:text-lg font-semibold text-gray-500'>
                                                    <Users className='w-4 h-4' /> {course.students.length} {course.students.length === 1 ? "student" : "students"}
                                                </div>
                                            </div>
                                            <hr className='border-gray-200 my-4' />
                                            <div className='flex items-center justify-between gap-5 flex-wrap'>
                                                <Link className=' flex flex-1 gap-2 items-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg text-center transition-colors hover:bg-blue-600 duration-500 justify-center'><Eye /> View</Link>
                                                <button className=' flex flex-1 gap-2 items-center bg-black text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-gray-800 duration-500 justify-center'><Cog /> Edit </button>
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

        </div>
    );
};

export default FacultyMyCourses;
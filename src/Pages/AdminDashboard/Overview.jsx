import {toast} from "sonner";
import axiosSecure from "../../utils/axiosSecure.js";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider.jsx";

const Overview = () => {
    const {userData} = useContext(AuthContext);

    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            if (userData?._id == null) return;

            try {
                // Fetch all courses
                const coursesRes = await axiosSecure.get(`/admin/courses`);

                const allCourses = coursesRes.data.courses.map((course) => {
                    return {
                        courseCode: course.courseCode,
                        courseName: course.courseName,
                        createdAt: course.createdAt,
                        department: course.department,
                        description: course.description,
                        facultyIds: course.faculties || [],
                        invitationCode: course.invitationCode,
                        semester: course.semester,
                        session: course.session,
                        status: course.status,
                        studentIds: course.studentIds || [],
                        updatedAt: course.updatedAt,
                        year: course.year,
                        id: course._id
                    }
                });

                setCourses(allCourses);
            } catch {
                toast.error("Error fetching courses");
            }
        }

        fetchCourses();
    }, [userData])

    console.log(courses);

    return (
        <div></div>
    );
};

export default Overview;
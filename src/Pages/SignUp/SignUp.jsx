import React, { useContext, useState } from 'react';
import DotGrid from "../../Components/DotGrid/DotGrid.jsx";
import { Link, useNavigate } from "react-router";
import { uploadToCloudinary } from '../../utils/uploadToCloudinary.js';
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider.jsx';
import { toast } from 'sonner';
import TextType from '../../Components/TextType/TextType.jsx';
import axiosSecure from '../../utils/axiosSecure.js';
import { handleGoogleLogin } from '../../utils/handleGoogleLogin.js';
import { formatErrorMessage } from '../../utils/formatErrorMessages.js';

const SignUp = () => {
    const { signUp, updateUser, setUser, signInWithGoogle, removeUser,logout,setUserData } = useContext(AuthContext);

    const [role, setRole] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const departments = ["mte", "che", "te", "le", "ese", "iem", "me", "mse", "bme", "ece", "eee", "cse", "hum", "chem", "phy", "math", "arch", "becm", "urp", "ce"];

    // Signup

    const handleSignup = async (e) => {
        e.preventDefault();

        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;
        const imageFile = form.photo.files[0];

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;

        if (!passwordRegex.test(password)) {
            setError("Password must be at least 6 characters long, and include at least one uppercase letter, one lowercase letter, one number and one special character.");
            return;
        }
        else
            setError("");

        if (!email.endsWith(".kuet.ac.bd")) {
            toast.error("Please use a valid KUET email.");
            return;
        }

        const roleChecking = email.split("@")[1].split(".")[0];

        if (roleChecking !== "stud" && !departments.includes(roleChecking)) {
            toast.error("Email is not a valid KUET email");
            return;
        }

        if ((role === "faculty" && roleChecking === "stud") || (role === "student" && departments.includes(roleChecking)) || (role === "faculty" && !departments.includes(roleChecking))) {
            toast.error("Selected role does not match with your KUET email");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Your password and confirmation do not match. Please try again.");
            return;
        }

        setLoading(true);
        try {
            const imageData = await uploadToCloudinary(imageFile);
            const data = {
                name: form.name.value,
                email,
                role,
                department: form.department.value,
                studentID: form.studentID?.value || "",
                batch: form.batch?.value || "",
                designation: form.designation?.value || "",
                room: form.room?.value || "",
                photoURL: imageData.url,
                photoId: imageData.public_id,
                method: "email"
            };

            const result = await signUp(data.email, password);
            const user = result.user;

            // Users Information storing in database

            try {
                const res = await axiosSecure.post("/users", data);

                setUserData(res.data.user);

                await updateUser({
                    displayName: data.name,
                    photoURL: data.photoURL
                });

                setUser({ ...user, displayName: data.name, photoURL: data.photoURL });

                toast.success("Signed up successfully");
                if (role === "student")
                    navigate("/dashboard/student");
                else if (role === "faculty")
                    navigate("/dashboard/faculty");
                else
                    navigate("/dashboard/admin");
            } catch (dbError) {
                await removeUser();
                toast.error(
                    dbError.response?.data?.message ||
                    "Signup failed. Please try again."
                );
            }
        } catch (error) {
            toast.error(formatErrorMessage(error));
        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-full flex gilroy">
            {/* Interactive Background */}
            <div
                className="hidden lg:flex lg:w-full lg:max-w-[50%] bg-gradient-to-br from-[#1E40AF] via-[#1E3A8A] to-[#3B82F6]"
                style={{ width: '1080px', minHeight: '100vh', position: 'relative' }}>
                <DotGrid
                    dotSize={10}
                    gap={15}
                    baseColor="#ffffff11"
                    activeColor="#ffffff11"
                    proximity={120}
                    speedTrigger={100}
                    shockRadius={250}
                    shockStrength={5}
                    maxSpeed={5000}
                    resistance={750}
                    returnDuration={1.5}
                />

                <div className="absolute h-auto inset-0 z-50 flex flex-col mt-50 items-center gap-5">
                    <div className="w-[70%] text-5xl font-semibold graphik text-white min-h-15">
                        <TextType
                            text={"Join the Digital Campus"}
                            typingSpeed={100}
                            pauseDuration={1500}
                            showCursor={false}
                            startOnVisible={true}
                            deletingSpeed={0}
                            loop={false}
                        />
                    </div>
                    <p className="w-[70%] text-justify text-gray-300  text-lg">
                        Experience a smarter way to learn. Unified course management, institutional repository access,
                        and real-time collaboration start here. Join thousands of students and faculty members in
                        building a more connected academic community at KUET.
                    </p>
                </div>
            </div>

            {/*Sign Up Form*/}

            <div
                className="w-full max-w-full lg:max-w-[50%] min-h-screen flex flex-col items-center justify-center p-10">
                <p className="graphik font-semibold text-black text-3xl md:text-5xl mb-5">Create Account</p>
                <p className="text-gray-400 mb-10 text-sm md:text-[16px]">Join the UniDesk Community today</p>
                <button onClick={() => handleGoogleLogin(signInWithGoogle, removeUser, logout, navigate,setUserData)}
                    className="w-full max-w-[500px] h-12 btn bg-white text-black border-[#e5e5e5] mb-5 cursor-pointer">
                    <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512">
                        <g>
                            <path d="m0 0H512V512H0" fill="#fff"></path>
                            <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path>
                            <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path>
                            <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path>
                            <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path>
                        </g>
                    </svg>
                    Continue with Google
                </button>
                <div className="w-full max-w-[500px] flex items-center gap-2 text-sm mb-5">
                    <div className="w-full bg-gray-400 h-[1px]"></div>
                    <p className="w-full text-gray-400 font-medium text-[8px] md:text-[12px] text-center">OR SIGNUP
                        MANUALLY</p>
                    <div className="w-full bg-gray-400 h-[1px]"></div>
                </div>

                <form onSubmit={handleSignup} className="w-full max-w-[500px] mb-10">

                    {/* Full Name */}

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Full Name</legend>
                        <input type="text" name="name" className="input w-full" placeholder="Your Name" required />
                    </fieldset>

                    {/* Email Field */}

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">University Email</legend>
                        <input type="email" name="email" className="input w-full" placeholder="email@stud.kuet.ac.bd"
                            required />
                    </fieldset>

                    {/* Photo */}

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Your Photo</legend>
                        <input type="file" name="photo" className="w-full file-input" accept="image/*" required />
                        <label className="label">Max size 2MB</label>
                    </fieldset>

                    {/* Role */}

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Role</legend>
                        <select name="role" value={role} className="w-full select" onChange={(e) => setRole(e.target.value)}
                            required>
                            <option value="" disabled={true}>Select Role</option>
                            <option value="faculty">Faculty</option>
                            <option value="student">Student</option>
                        </select>
                    </fieldset>

                    {/* Student Based Rendering */}

                    {
                        role === "student"
                        &&
                        (
                            <>
                                {/* Student ID */}

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Student ID</legend>
                                    <input type="text" name="studentID" className="input w-full" placeholder="2107001"
                                        required />
                                </fieldset>

                                {/* Batch */}

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Batch</legend>
                                    <input type="text" name="batch" className="input w-full" placeholder="2K21" required />
                                </fieldset>
                            </>
                        )
                    }

                    {/* Faculty Based Rendering */}

                    {
                        role === "faculty" &&
                        (
                            <>
                                {/* Faculty Designation */}

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Designation</legend>
                                    <select defaultValue="" name="designation" className="w-full select" required>
                                        <option value="" disabled>
                                            Select Designation
                                        </option>
                                        <option value="professor">Professor</option>
                                        <option value="associate-professor">Associate Professor</option>
                                        <option value="assistant-professor">Assistant Professor</option>
                                        <option value="lecturer">Lecturer</option>
                                    </select>
                                </fieldset>

                                {/* Faculty Room no */}

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Room No</legend>
                                    <input type="text" name="room" className="input w-full" placeholder="CSE 201, B-Block, Academic Building"
                                        required />
                                </fieldset>
                            </>
                        )
                    }

                    {/* Department */}

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Department</legend>
                        <select defaultValue="" name="department" className="w-full select" required>
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
                    </fieldset>

                    {/* Password Field */}

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Password</legend>
                        <input type="password" name="password" className="input w-full" placeholder="••••••" required />
                    </fieldset>
                    {
                        error && <p className='text-sm text-red-600 mb-1 text-justify'>{error}</p>
                    }

                    {/* Confirm Password Field */}

                    <fieldset className="fieldset mb-5">
                        <legend className="fieldset-legend">Confirm Password</legend>
                        <input type="password" name="confirmPassword" className="input w-full" placeholder="••••••" required />
                    </fieldset>

                    {/* Submit Button */}

                    <button type="submit"
                        className="btn w-full h-12 bg-blue-700 font-medium text-white cursor-pointer text-lg hover:bg-blue-900 ease-in-out duration-600"
                        disabled={loading}
                    >{
                            loading ? "Creating Account..." : "Create Account"
                        }
                    </button>
                </form>
                <div className="text-sm">Already have an account? <Link to="/login"
                    className="text-blue-500 font-medium">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
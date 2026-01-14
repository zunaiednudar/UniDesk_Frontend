import React from 'react';
import DotGrid from "../../Components/DotGrid/DotGrid.jsx";
import {Link} from "react-router";

const SignUp = () => {

    // Signup

    const handleSignup=(e)=>{
        e.preventDefault();
    }

    // Google Login

    const handleGoogleLogin=()=>{

    }

    return (
        <div className="w-full max-w-full flex inter">
            {/* Interactive Background */}
            <div className="hidden lg:flex lg:w-full lg:max-w-[50%] bg-gradient-to-br from-[#1E40AF] via-[#1E3A8A] to-[#3B82F6]" style={{ width: '1080px', minHeight: '100vh', position: 'relative' }}>
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

                <div className="absolute h-auto inset-0 z-50 flex flex-col justify-center items-center gap-5">
                    <p className="w-[70%] text-6xl font-extrabold playfair text-white">Join the Digital Campus</p>
                    <p className="w-[70%] text-justify text-gray-300  text-lg">
                        Experience a smarter way to learn. Unified course management, institutional repository access, and real-time collaboration start here. Join thousands of students and faculty members in building a more connected academic community at KUET.
                    </p>
                </div>
            </div>

            {/*Sign Up Form*/}

            <div className="w-full max-w-full lg:max-w-[50%] min-h-screen border border-solid border-red flex flex-col items-center justify-center p-10">
                <p className="playfair font-extrabold text-black text-3xl md:text-5xl mb-5">Create Account</p>
                <p className="text-gray-400 mb-10 text-sm md:text-[16px]">Join the UniDesk Community today</p>
                <button onClick={handleGoogleLogin} className="w-full max-w-[500px] h-12 btn bg-white text-black border-[#e5e5e5] mb-5 cursor-pointer">
                    <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                    Continue with Google
                </button>
                <div className="w-full max-w-[500px] flex items-center gap-2 text-sm mb-5">
                    <div className="w-full bg-gray-400 h-[1px]"></div>
                    <p className="w-full text-gray-400 font-medium text-[8px] md:text-[16px]">OR SIGNUP MANUALLY</p>
                    <div className="w-full bg-gray-400 h-[1px]"></div>
                </div>

                <form onSumbit={handleSignup} className="w-full max-w-[500px] mb-10">

                    {/*Full Name*/}

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Full Name</legend>
                        <input type="text" name="name" className="input w-full" placeholder="Your Name" required/>
                    </fieldset>

                    {/* Email Field */}

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">University Email</legend>
                        <input type="email" name="email" className="input w-full" placeholder="email@kuet.ac.bd" required/>
                    </fieldset>

                    {/*Photo*/}

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Your Photo</legend>
                        <input type="file" className="w-full file-input" required/>
                        <label className="label">Max size 2MB</label>
                    </fieldset>

                    {/*Role*/}

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Browsers</legend>
                        <select defaultValue="Select Role" className="w-full select" required>
                            <option disabled={true}>Select Role</option>
                            <option>Faculty</option>
                            <option>Student</option>
                        </select>
                    </fieldset>

                    {/* Password Field */}

                    <fieldset className="fieldset mb-5">
                        <legend className="fieldset-legend">Password</legend>
                        <input type="password" name="password" className="input w-full" placeholder="••••••" required/>
                    </fieldset>

                    {/* Submit Button */}

                    <button type="submit" className="btn w-full h-12 bg-blue-700 font-bold text-white cursor-pointer text-lg hover:bg-blue-900 ease-in-out duration-600">Create Account</button>
                </form>
                <div className="text-sm">Already have an account? <Link to="/login" className="text-blue-500 font-medium">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
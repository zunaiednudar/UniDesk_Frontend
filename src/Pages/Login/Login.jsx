import React, { useContext, useState } from 'react';
import DotGrid from "../../Components/DotGrid/DotGrid.jsx";
import { Link, useNavigate } from "react-router";
import { AuthContext } from '../../Providers/AuthProvider.jsx';
import { toast } from 'sonner';
import { deleteUser } from 'firebase/auth';

const Login = () => {
    const { login, signInWithGoogle, setLoading,passwordReset } = useContext(AuthContext);
    const navigate = useNavigate();

    // Email Login

    const handleLogin = (e) => {
        e.preventDefault();
        const form = e.target;

        const email = form.email.value;
        const password = form.password.value;

        login(email, password).then((res) => {
            const user = res.user;
            console.log(user);
            toast.success("Logged In Successfully");
            navigate("/");
        }).catch((error) => {
            toast.error("Wrong Credentials");
            setLoading(false);
        });
    }

    // Google Login

    const handleGoogleLogin = async () => {
        try {
            const res = await signInWithGoogle();

            if (!res)
                return;

            const user = res.user;
            const email = user.email;

            if (!email.endsWith("kuet.ac.bd")) {
                toast.error("Please use a valid KUET email.");

                try {
                    await deleteUser(user);
                } catch (error) {
                    throw new Error(error);
                }
                return;
            }

            const roleChecking = email.split("@")[1].split(".")[0];

            const role = roleChecking === "stud" ? "student" : "faculty";

            const data = {
                name: user.displayName,
                email,
                role,
                department: "",
                studentID: "",
                batch: "",
                designation: "",
                photoURL: user.photoURL,
                photoId: "",
                status: "pending",
                createdAt: new Date().toISOString()
            };

            console.log(data);

            toast.success("Logged in with Google");
            navigate("/");
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Forgot Password

    const passwordResetModalOpen = () => document.getElementById('my_modal_5').showModal();

    const passwordResetModalClose = () => document.getElementById('my_modal_5').close();

    const handleForgotPassword= (e)=>{
        e.preventDefault();
        const form=e.target;
        const email=form.forgotemail.value;
        // console.log(email);
        passwordReset(email).then(()=>{
            form.reset();
            passwordResetModalClose();
            toast.success("If an account exists with this email, a password reset link has been sent.");
        })
        .catch((error)=>{
            form.reset();
            passwordResetModalClose();
            toast.error(error.message);
        })
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
                    <p className="w-[70%] text-6xl font-extrabold playfair text-white">Welcome Back to Your Digital Campus</p>
                    <p className="w-[70%] text-justify text-gray-300  text-lg">
                        Streamline your academic workflow. Access courses, submit assignments, and collaborate with peers in one unified platform.
                    </p>
                </div>
            </div>

            {/*Login Form*/}

            <div className="w-full max-w-full lg:max-w-[50%] min-h-screen flex flex-col items-center justify-center px-10">
                <p className="playfair font-extrabold text-black text-3xl md:text-5xl mb-5">Sign In</p>
                <p className="text-gray-400 mb-10 text-sm md:text-[16px]">Please enter your university credentials</p>
                <button onClick={handleGoogleLogin} className="w-full max-w-[500px] h-12 btn bg-white text-black border-[#e5e5e5] mb-5 cursor-pointer">
                    <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                    Sign In with Google
                </button>
                <div className="w-full max-w-[500px] flex items-center gap-2 text-sm mb-5">
                    <div className="w-full bg-gray-400 h-[1px]"></div>
                    <p className="w-full text-gray-400 font-medium text-[8px] md:text-[12px] text-center">OR LOGIN WITH EMAIL</p>
                    <div className="w-full bg-gray-400 h-[1px]"></div>
                </div>

                <form onSubmit={handleLogin} className="w-full max-w-[500px] mb-10">

                    {/* Email Field */}

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">University Email</legend>
                        <input type="email" name="email" className="input w-full" placeholder="email@kuet.ac.bd" required />
                    </fieldset>

                    {/* Password Field */}

                    <fieldset className="fieldset mb-2">
                        <legend className="fieldset-legend">Password</legend>
                        <input type="password" name="password" className="input w-full" placeholder="••••••" required />
                    </fieldset>
                    <div className="w-full flex justify-end mb-5">
                        <p onClick={passwordResetModalOpen} className="text-sm text-blue-500 font-medium cursor-pointer">Forgot Password?</p>
                    </div>

                    {/* Submit Button */}

                    <button type="submit" className="btn w-full h-12 bg-blue-700 font-bold text-white cursor-pointer text-lg hover:bg-blue-900 ease-in-out duration-600">Sign In</button>
                </form>
                <div className="text-sm">Dont have an account? <Link to="/signup" className="text-blue-500 font-medium">Create Account</Link></div>
            </div>

            {/* Forgot Password Modal */}

            <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Forgot Password</h3>
                    <div className="modal-action">
                        <form onSubmit={handleForgotPassword} className='w-full'>
                            <fieldset className="fieldset mb-5">
                                <legend className="fieldset-legend">Enter your email</legend>
                                <input type="email" name="forgotemail" className="input w-full" placeholder="email@stud.kuet.ac.bd" required/>
                            </fieldset>
                            <div className='flex gap-5 justify-end'>
                                <button type="submit" className='btn'>Submit</button>
                                <button type="button" className="btn" onClick={passwordResetModalClose}>Close</button>
                            </div>

                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default Login;
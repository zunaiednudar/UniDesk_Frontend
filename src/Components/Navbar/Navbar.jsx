import { GraduationCap, Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);
    const navigate = useNavigate();

    const activeClass = "text-[#1E40AF]";
    const normalClass = "text-gray-500 hover:text-[#1E40AF] transitions-colors ease";

    return (
        <div className="w-full max-w-full shadow-2xl bg-white h-25 sticky top-0 z-51 flex items-center">
            <nav className='w-full max-w-360 mx-auto flex justify-between px-5'>

                {/* Logo */}

                <NavLink to="/" className='flex items-center gap-2'>
                    <div className='w-10 h-10 bg-[#1E40AF] rounded-lg flex justify-center items-center'>
                        <GraduationCap className='w-6 h-6 text-white' />
                    </div>
                    <span className='playfair text-2xl font-extrabold'>UniDesk</span>
                </NavLink>

                <div className='hidden lg:flex gap-5 font-bold items-center'>
                    <NavLink to="/home" className={({ isActive }) => `${isActive ? activeClass : normalClass}`}>Home</NavLink>
                    <NavLink to="/repository" className={({ isActive }) => `${isActive ? activeClass : normalClass}`}>Repository</NavLink>
                </div>
                <div className='hidden lg:flex gap-5 items-center font-bold'>
                    <NavLink to="/login" className={({ isActive }) => `${isActive ? activeClass : normalClass}`}>Login</NavLink>
                    <button onClick={() => navigate("/signup")} className="bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer">Sign up</button>
                </div>

                {/* Hamburger menu */}

                <div className='flex items-center lg:hidden'>
                    <button onClick={toggleMenu}>
                        {
                            isOpen
                                ?
                                <X className='text-black' />
                                :
                                <Menu className='text-black' />
                        }
                    </button>
                </div>

                {/* For Small Devices */}

                <div className={`absolute font-bold top-[100px] left-0 w-full bg-white flex flex-col items-center py-[24px] shadow-lg lg:hidden gap-[24px] z-51 transform transition-all duration-300 ease-in-out
                        ${isOpen ? "translate-y-0 opacity-100 max-h-[500px]" : "-translate-y-10 opacity-0 max-h-0 overflow-hidden"}`}>
                    <NavLink onClick={toggleMenu} to="/home" className={({ isActive }) => `${isActive ? activeClass : normalClass}`}>Home</NavLink>
                    <NavLink onClick={toggleMenu} to="/repository"  className={({ isActive }) => `${isActive ? activeClass : normalClass}`}>Repository</NavLink>
                    <NavLink onClick={toggleMenu} to="/login" className={({ isActive }) => `${isActive ? activeClass : normalClass}`}>Login</NavLink>
                    <button onClick={() => {
                        navigate("/signup");
                        toggleMenu();
                    }} className="bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer">Sign up</button>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
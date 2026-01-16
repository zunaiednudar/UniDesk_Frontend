import React from 'react';
import { Link, NavLink } from 'react-router';
import { GraduationCap, MapPin, Mail, Phone, Facebook, Linkedin, Globe } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
    const link_twitter = "https://x.com/kuetbd";
    const link_linkedin = "https://www.linkedin.com/school/khulna-university-of-engineering-and-technology-kuet-/people/";
    const link_facebook = "https://www.facebook.com/KUET.official/";
    const link_website = "https://www.kuet.ac.bd/";

    return (
        <footer className="bg-gray-900 py-12">
            <div className="w-full max-w-360 mx-auto px-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-4">
                    {/*Information Section*/}
                    <div className="flex flex-col gap-3">
                        <NavLink to="/home" className='flex items-center gap-2'>
                            <div className='w-10 h-10 bg-blue-500 rounded-lg flex justify-center items-center'>
                                <GraduationCap className='w-6 h-6 text-white' />
                            </div>
                            <span className='playfair text-2xl font-bold text-white'>UniDesk</span>
                        </NavLink>

                        <p className="text-gray-300 text-sm leading-relaxed cursor-default">
                            Comprehensive Learning Management System for KUET, empowering education through technology.
                        </p>
                    </div>

                    {/*Quick Links Section*/}
                    <div>
                        <h4 className="playfair text-2xl font-semibold mb-4 text-white cursor-default">Quick Links</h4>

                        <ul className="space-y-2 text-gray-300 text-sm leading-relaxed">
                            <li className="hover:text-gray-100"><NavLink to="/home">Home</NavLink></li>
                            <li className="hover:text-gray-100"><NavLink to="/repository">Repository</NavLink></li>
                        </ul>
                    </div>

                    {/*Contact Section*/}
                    <div>
                        <h4 className="playfair text-2xl font-semibold mb-4 text-white cursor-default">Contact</h4>

                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500" />
                                <span className="text-gray-300 text-sm leading-relaxed">KUET, Khulna-9203, Bangladesh</span>
                            </li>

                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 flex-shrink-0 text-blue-500" />
                                <Link to="mailto:info@unidesk.edu.bd" className="text-gray-300 text-sm hover:text-gray-100 transition-colors">
                                    info@unidesk.edu.bd
                                </Link>
                            </li>

                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 flex-shrink-0 text-blue-500" />
                                <Link to="tel:+8801234567890" className="text-gray-300 text-sm hover:text-gray-100 transition-colors">
                                    +880 197 824 3409
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/*Follow Us Section*/}
                    <div>
                        <h4 className="playfair text-2xl font-semibold mb-4 text-white cursor-default">Follow Us</h4>

                        <div className="flex gap-3">
                            {/* Facebook */}
                            <Link to={link_facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
                                <Facebook className="w-5 h-5 text-white" />
                            </Link>

                            {/* Twitter */}
                            <Link to={link_twitter} aria-label="Twitter" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-600 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors">
                                <FaXTwitter className="w-5 h-5 text-white" />
                            </Link>

                            {/* LinkedIn */}
                            <Link to={link_linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
                                <Linkedin className="w-5 h-5 text-white" />
                            </Link>

                            {/* Instagram */}
                            <Link to={link_website} aria-label="Website" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-600 hover:bg-pink-500 rounded-lg flex items-center justify-center transition-colors">
                                <Globe className="w-5 h-5 text-white" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/*Divider*/}
                <div className="w-full border-t border-gray-800 my-8"></div>

                {/* Bottom Section */}
                <div className="text-center cursor-default">
                    <p className="text-gray-300 text-sm">
                        © {new Date().getFullYear()} UniDesk - KUET. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
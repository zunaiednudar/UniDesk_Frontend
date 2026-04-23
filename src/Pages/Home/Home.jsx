import React, { useRef } from 'react';
import DotGrid from "../../Components/DotGrid/DotGrid.jsx";
import TextType from "../../Components/TextType/TextType.jsx";
import { ArrowRight, GraduationCap, MessageSquare, ClipboardCheck, BarChart3, Calendar, Users, CircleCheckBig } from "lucide-react";
import {Link} from "react-router";
import kuet from "../../assets/kuet.jpg";

const Home = () => {
    const stats = [
        { number: '500+', label: 'Active Students' },
        { number: '50+', label: 'Faculties' },
        { number: '100+', label: 'Courses Offered' },
        { number: '1000+', label: 'Study Materials' }
    ];

    const features = [
        {
            icon: <GraduationCap className="w-8 h-8 text-blue-600" />,
            title: 'Course Management',
            description: 'Create and manage courses with ease. Share materials, assignments, and track student progress all in one place.'
        },
        {
            icon: <MessageSquare className="w-8 h-8 text-green-600" />,
            title: 'Real-time Communication',
            description: 'Connect with teachers and supervisors instantly. Chat in real-time with file sharing and read receipts.'
        },
        {
            icon: <ClipboardCheck className="w-8 h-8 text-purple-600" />,
            title: 'Assignment Tracking',
            description: 'Submit assignments, receive grades, and track deadlines. Automated notifications keep you on schedule.'
        },
        {
            icon: <BarChart3 className="w-8 h-8 text-yellow-600" />,
            title: 'Institutional Repository',
            description: 'Access a vast collection of study materials, notes, and question banks contributed by the community.'
        },
        {
            icon: <Calendar className="w-8 h-8 text-red-600" />,
            title: 'Appointment Booking',
            description: 'Schedule meetings with teachers easily. View available time slots and get instant confirmations.'
        },
        {
            icon: <Users className="w-8 h-8 text-teal-600" />,
            title: 'Leaderboards',
            description: 'Track your performance with assignment leaderboards and repository contribution rankings.'
        }
    ];

    const featuresRef = useRef(null);

    const benefits = [
        { title: 'Streamlined Learning', description: 'Access to all courses, materials, and assignments in one place' },
        { title: 'Real-time Collaboration', description: 'Connect with teachers and peers through integrated messaging' },
        { title: 'Knowledge Repository', description: 'Contribute to and benefit from a vast library of study materials' }
    ];

    return (
        <div className="gilroy bg-gray-100">
            {/*Hero Section*/}
            <div className="relative bg-gradient-to-br from-[#1E40AF] via-[#1E3A8A] to-[#3B82F6] text-white">
                <div className="absolute inset-0 z-0">
                    <DotGrid
                        className="w-full h-full"
                        dotSize={5}
                        gap={25}
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
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col justify-center">
                    <div className="text-center">
                        <h1 className="graphik text-5xl md:text-6xl font-extrabold mb-6">
                            <TextType
                                text="Welcome to UniDesk"
                                typingSpeed={100}
                                pauseDuration={1500}
                                showCursor={false}
                                startOnVisible={true}
                                deletingSpeed={0}
                                loop={false}
                            />
                        </h1>

                        <p className="text-2xl text-gray-100 mb-2 max-w-3xl mx-auto leading-relaxed">
                            KUET Learning Management System
                        </p>

                        <p className="text-lg text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
                            Empowering education through seamless course management, real-time collaboration, and comprehensive learning resources.
                        </p>

                        <div className="flex gap-4 justify-center mb-16 mt-8">
                            <Link to="/login" className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition transform hover:scale-105 flex items-center gap-2">
                                Get Started <ArrowRight className="w-5 h-5" />
                            </Link>

                            <button onClick={() => featuresRef.current?.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                    })
                                }
                                className="border-2 border-white text-white px-4 py-2 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition transform hover:scale-105 cursor-pointer">
                                Learn More
                            </button>
                        </div>


                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-10 md:mt-12 cursor-default">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 hover:bg-white/20 transition">
                                    <p className="graphik text-2xl md:text-4xl font-medium mb-1">
                                        {stat.number}
                                    </p>

                                    <p className="text-sm md:text-md text-gray-300">
                                        {stat.label}
                                    </p>
                                </div>

                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/*Features Section*/}
            <div ref={featuresRef} className="max-w-360 mx-auto px-6 py-20 scroll-mt-24">
                <div className="text-center mb-16">
                    <h2 className="graphik text-4xl font-medium text-gray-900 mb-2">Powerful Features</h2>

                    <p className="text-gray-600 text-md">Everything you need for a complete learning management experience</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 transition border border-gray-100">
                            <div className="mb-4">{feature.icon}</div>

                            <h3 className="graphik text-2xl font-medium text-gray-900 mb-3">{feature.title}</h3>

                            <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/*About Section*/}
            <div className="w-full bg-gray-50 py-20">
                <div className="max-w-360 mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="relative w-full">
                            <img
                                src={kuet}
                                alt="Khulna University of Engineering and Technology Campus"
                                className="w-full h-auto max-w-full rounded-2xl shadow-xl object-cover"
                            />
                        </div>

                        <div>
                            <h2 className="graphik text-4xl font-medium text-gray-900 mb-6">About UniDesk</h2>

                            <p className="text-gray-600 mb-6 leading-relaxed text-justify">
                                UniDesk is a comprehensive Learning Management System designed specifically for Khulna University of Engineering & Technology (KUET).
                                Our platform bridges the gap between traditional education and modern technology, providing a seamless experience for students and faculties alike.
                            </p>

                            <div className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <CircleCheckBig className="text-emerald-600" />
                                        </div>

                                        <div>
                                            <h4 className="text-xl font-medium text-gray-900">{benefit.title}</h4>
                                            <p className="text-gray-500">{benefit.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*CTA Section*/}
            <div className="bg-gradient-to-r from-blue-900 via-blue-750 to-blue-500 text-white py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="graphik text-5xl text-white font-regular mb-2">Ready to Get Started?</h2>

                    <p className="text-md text-gray-100 mb-8">
                        Join thousands of students and faculties already using UniDesk
                    </p>

                    <div className="flex gap-4 justify-center mb-8 mt-8">
                        <Link to="/login" className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition transform hover:scale-105 flex items-center gap-2">
                            Register Now <ArrowRight className="w-5 h-5" />
                        </Link>

                        <Link to="/repository" className="border-2 border-white text-white px-4 py-2 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition transform hover:scale-105">
                            Explore Repository
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Home;
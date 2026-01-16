import React from 'react';
import DotGrid from "../../Components/DotGrid/DotGrid.jsx";
import TextType from "../../Components/TextType/TextType.jsx";
import { ArrowRight } from "lucide-react";

const Home = () => {
    const stats = [
        { number: '500+', label: 'Active Students' },
        { number: '50+', label: 'Courses' },
        { number: '100+', label: 'Instructors' },
        { number: '1000+', label: 'Resources' }
    ];

    return (
        <div className="relative bg-gradient-to-br from-[#1E40AF] via-[#1E3A8A] to-[#3B82F6] text-white overflow-hidden h-[85vh]">
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

            {/*Hero Section*/}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col justify-center h-[80vh]">
                <div className="text-center">
                    <h1 className="playfair text-5xl md:text-6xl font-extrabold mb-2">
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
                        <button className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition transform hover:scale-105 flex items-center gap-2 cursor-pointer">
                            Get Started <ArrowRight className="w-5 h-5" />
                        </button>

                        <button className="border-2 border-white text-white px-4 py-2 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition transform hover:scale-105 cursor-pointer">
                            Learn More
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 cursor-default">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition">
                                <p className="text-4xl font-bold mb-1">{stat.number}</p>
                                <p className="text-gray-300 text-md">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
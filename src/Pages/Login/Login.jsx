import React from 'react';
import DotGrid from "../../Components/DotGrid/DotGrid.jsx";

const Login = () => {
    return (
        <div className="w-full max-w-full flex">
            <div className="hidden lg:flex lg:w-full lg:max-w-[50%] bg-gradient-to-br from-[#1E40AF] via-[#1E3A8A] to-[#3B82F6]" style={{ width: '1080px', height: '100vh', position: 'relative' }}>
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
            </div>
        </div>
    );
};

export default Login;
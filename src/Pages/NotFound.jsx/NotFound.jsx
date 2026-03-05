import Lottie from 'lottie-react';
import React from 'react';
import notFound from "../../assets/notFound.json";
import { Link } from 'react-router';

const NotFound = () => {
    return (
        <div className="gilroy w-full min-h-screen flex flex-col justify-center items-center">
            <Lottie
                animationData={notFound}
                loop={true}
                className="w-full max-w-125 h-auto"
            />
            <Link to="/" type="submit"
                className="btn w-full max-w-[200px] h-12 bg-blue-700 font-medium text-white cursor-pointer text-lg hover:bg-blue-900 ease-in-out duration-600"
            >Go to Home</Link>
        </div>
    );
};

export default NotFound;
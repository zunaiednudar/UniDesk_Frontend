import React from 'react';

const CardSkeleton = ({ variant = "list", lines = 3 }) => {

    // For statistics card

    if (variant === "stat")
        return (
            <div className="w-full px-5 py-10 rounded-lg shadow-xl flex justify-between animate-pulse">
                <div className="space-y-3 w-2/3">
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                </div>
                <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
            </div>
        );

    // For cards inside a container

    return (
        <div className="w-full p-5 rounded-lg border border-gray-200 animate-pulse space-y-3">
            <div className="h-5 bg-gray-300 rounded w-1/2"></div>
            {
                Array.from({ length: lines }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))
            }
        </div>
    );
};

export default CardSkeleton;
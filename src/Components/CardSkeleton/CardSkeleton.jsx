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

    if (variant === "pendingAssignment")
        return (
            <div className="w-full p-6 rounded-xl bg-white shadow-md flex flex-col gap-4 animate-pulse">

                <div className="flex justify-between items-center">
                    <div className="h-5 w-40 bg-gray-200 rounded"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                </div>

                <div className="h-4 w-32 bg-gray-200 rounded"></div>

                <div className="flex justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="h-4 w-28 bg-gray-200 rounded"></div>
                    <div className="h-5 w-10 bg-gray-200 rounded-full"></div>
                </div>

            </div>
        )

    if (variant === "courseCard")
        return (
            <div className="w-full flex flex-col p-6 rounded-xl shadow-md animate-pulse">

                <div className="mb-6 flex flex-col gap-3">
                    <div className="h-6 w-32 bg-gray-200 rounded"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>

                <div className="mb-6 flex flex-col gap-3">
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                    <div className="h-4 w-52 bg-gray-200 rounded"></div>
                    <div className="h-4 w-28 bg-gray-200 rounded"></div>
                </div>

                <hr className="border-gray-200 my-4" />

                <div className="w-full h-10 bg-gray-200 rounded-lg"></div>

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
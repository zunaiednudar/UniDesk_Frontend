import React from 'react';

const CardSkeleton = ({ variant = "list", lines = 3 }) => {

    // For statistics card

    if (variant === "stat")
        return (
            <div className="w-full p-5 rounded-lg shadow-lg flex flex-col gap-2 box-border border border-gray-100 animate-pulse">
                <div className="flex gap-2 items-center">
                    <div className="w-5 h-5 rounded bg-gray-200" />
                    <div className="h-3 w-20 rounded bg-gray-200" />
                </div>
                <div className="h-4 w-24 rounded bg-gray-300" />
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

    if (variant === "appointmentCard")
        return (
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-gray-200 shadow-sm animate-pulse">
                <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="h-4 w-32 rounded bg-gray-200 mb-2"></div>
                        <div className="h-3 w-44 rounded bg-gray-200"></div>
                    </div>
                    <div className="h-3 w-16 rounded bg-gray-200"></div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="h-7 w-24 rounded-full bg-gray-200"></div>
                    <div className="h-7 w-20 rounded-full bg-gray-200"></div>
                </div>

                <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-gray-200"></div>
                    <div className="h-3 w-3/4 rounded bg-gray-200"></div>
                </div>

                <div className="border-t border-gray-100"></div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-gray-200"></div>
                        <div className="h-3 w-24 rounded bg-gray-200"></div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-gray-200"></div>
                        <div className="h-3 w-20 rounded bg-gray-200"></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-gray-200"></div>
                        <div className="h-3 w-16 rounded bg-gray-200"></div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-gray-200"></div>
                        <div className="h-3 w-24 rounded bg-gray-200"></div>
                    </div>
                </div>

                <div className="h-8 w-full rounded-md bg-gray-300"></div>
            </div>

        );

    // Weekly calendar schedule

    if (variant === "weeklyCalendar")
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-6 w-32 rounded bg-gray-200"></div>
                    <div className="h-8 w-24 rounded bg-gray-200"></div>
                </div>

                <div className="grid grid-cols-6 border border-gray-100 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 border-r border-gray-100 p-3">
                        <div className="h-4 w-10 rounded bg-gray-200"></div>
                    </div>

                    {
                        [...Array(5)].map((_, index) => (
                            <div key={index} className="bg-gray-50 border-r last:border-r-0 border-gray-100 p-3">
                                <div className="h-4 w-16 rounded bg-gray-200 mx-auto"></div>
                            </div>
                        ))
                    }

                    {
                        [...Array(8)].map((_, row) => (
                            <React.Fragment key={row}>
                                <div className="border-t border-r border-gray-100 p-3 h-20">
                                    <div className="h-3 w-8 rounded bg-gray-200"></div>
                                </div>

                                {
                                    [...Array(5)].map((_, col) => (
                                        <div key={col} className="border-t border-r last:border-r-0 border-gray-100 p-2 h-20 relative">
                                            {(row === 1 && col === 0) && (
                                                <div className="h-10 w-full rounded-lg bg-blue-100"></div>
                                            )}
                                            {(row === 3 && col === 2) && (
                                                <div className="h-12 w-full rounded-lg bg-emerald-100"></div>
                                            )}
                                            {(row === 5 && col === 4) && (
                                                <div className="h-9 w-full rounded-lg bg-amber-100"></div>
                                            )}
                                        </div>
                                    ))
                                }
                            </React.Fragment>
                        ))
                    }
                </div>
            </div>

        );

    if (variant === "chart")
        return (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-5 min-h-[240px] animate-pulse">
                <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>
                <div className="h-[170px] w-full bg-gray-100 rounded-xl"></div>
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
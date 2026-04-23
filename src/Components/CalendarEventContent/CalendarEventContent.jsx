import React from 'react';

const CalendarEventContent = ({ event, timeText }) => {
    return (
        <div className="h-full w-full rounded-sm px-2 py-1 overflow-hidden flex flex-col justify-center cursor-pointer">
            <p className="text-[11px] font-semibold text-white leading-tight truncate">
                {event.title}
            </p>
            <p className="text-[10px] text-white/90 leading-tight truncate">
                {timeText}
            </p>
        </div>
    );
};

export default CalendarEventContent;
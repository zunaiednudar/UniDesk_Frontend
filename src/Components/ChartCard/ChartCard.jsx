import React from "react";

const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-5 flex flex-col gap-4 min-h-[240px]">
      <h3 className="text-sm md:text-md font-bold graphik text-gray-900">{title}</h3>
      <div className="flex-1 min-h-[170px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;

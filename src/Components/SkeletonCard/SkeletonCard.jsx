// Represents loading during data fetch
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
        <div className="flex justify-between mb-4">
            <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"/>
                <div className="h-3 w-36 bg-gray-100 rounded"/>
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full"/>
        </div>
        <div className="space-y-2.5 mb-5">
            <div className="h-3 w-32 bg-gray-100 rounded"/>
            <div className="h-3 w-28 bg-gray-100 rounded"/>
            <div className="h-3 w-40 bg-gray-100 rounded"/>
        </div>
        <div className="h-10 w-full bg-gray-100 rounded-xl"/>
    </div>
);

export default SkeletonCard;
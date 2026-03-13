import {AlertCircle} from "lucide-react";

const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center py-8 text-gray-400 text-sm">
        <AlertCircle size={28} className="text-gray-200 mb-2" />
        {message}
    </div>
);

export default EmptyState;
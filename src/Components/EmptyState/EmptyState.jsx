import { AlertCircle } from 'lucide-react';
import React from 'react';

const EmptyState = ({ message }) => (
    <div className="col-span-full flex flex-col items-center py-12 text-gray-400 text-sm">
        <AlertCircle size={32} className="text-gray-200 mb-3" />
        {message}
    </div>
);

export default EmptyState;
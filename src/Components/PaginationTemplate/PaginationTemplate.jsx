import React from 'react';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';

const PaginationTemplate = ({ page, totalPages, onChange }) => {
    return (
        <Pagination
            page={page}
            count={totalPages}
            onChange={(e, value) => onChange(value)}
            color="primary"
        />
    );
};

export default PaginationTemplate;
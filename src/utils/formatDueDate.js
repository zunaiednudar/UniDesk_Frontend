export const formatDueDate = (dateString) => {
    if (!dateString)
        return 'No due date';

    return new Date(dateString).toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
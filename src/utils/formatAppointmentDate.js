export const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const appointmentDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    // Today
    if (appointmentDay.getTime() === today.getTime())
        return `Today, ${time}`;


    // Tomorrow
    if (appointmentDay.getTime() === tomorrow.getTime())
        return `Tomorrow, ${time}`;

    // Normal date
    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric"
    }) + ` • ${time}`;
};
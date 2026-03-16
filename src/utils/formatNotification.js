export const formatNotificationType = (type) => {
    if (!type) 
        return "";
    return type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
};
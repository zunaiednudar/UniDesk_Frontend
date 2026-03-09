export const getAttachmentURL = (attachment) => {
    if (!attachment) 
        return "";
    if (typeof attachment === "string") 
        return attachment;
    return attachment?.url || "";
};

export const getAttachmentName = (attachment) => {
    if (attachment?.name) 
        return attachment.name;

    const url = getAttachmentURL(attachment);
    if (!url) 
        return "Attachment";

    try {
        return decodeURIComponent(url.split("/").pop() || "Attachment");
    } catch {
        return url.split("/").pop() || "Attachment";
    }
};

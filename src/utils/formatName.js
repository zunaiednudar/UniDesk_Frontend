const formatName = (name) => {
    if (!name) return "";
    return name
        .split(/([ .])/g)
        .map(part => {
            if (part === " " || part === ".") return part;
            return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join("");
};

export default formatName;
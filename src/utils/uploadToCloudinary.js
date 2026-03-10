const cloudName=import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const imageUploadPreset=import.meta.env.VITE_CLOUDINARY_UPLOAD_IMAGE_PRESET;
const fileUploadPreset=import.meta.env.VITE_CLOUDINARY_UPLOAD_RAW_PRESET;

// Image data

export const uploadToCloudinary=async(imageFile)=>{
    const formData=new FormData();
    formData.append("file",imageFile);
    formData.append("upload_preset",imageUploadPreset);

    const res=await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method:"POST",
            body:formData
        }
    );

    const data=await res.json();

    if(!res.ok)
        throw new Error("Cloudinary Image upload failed");

    return {
        url:data.secure_url,
        public_id:data.public_id
    }
};

// Raw data

export const uploadFileToCloudinary=async(file)=>{
    const formData=new FormData();
    formData.append("file",file);
    formData.append("upload_preset",fileUploadPreset);

    const res=await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
            method:"POST",
            body:formData
        }
    );

    const data=await res.json();

    if(!res.ok)
        throw new Error("Cloudinary file upload failed");

    return {
        url:data.secure_url,
        public_id:data.public_id,
        resource_type:data.resource_type,
        format:data.format
    }
};
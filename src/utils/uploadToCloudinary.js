const cloudName=import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset=import.meta.env.VITE_CLOUDINARY_UPLOAD_IMAGE_PRESET;

export const uploadToCloudinary=async(imageFile)=>{
    const formData=new FormData();
    formData.append("file",imageFile);
    formData.append("upload_preset",uploadPreset);

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
}
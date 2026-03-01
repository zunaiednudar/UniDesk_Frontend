import axios from "axios";

const axiosSecure=axios.create({
    baseURL:"http://localhost:3000/api"
});

axiosSecure.interceptors.request.use((config)=>{
    const token=localStorage.getItem("access-token");

    if(token)
        config.headers.authorization=`Bearer ${token}`;

    return config;
});

export default axiosSecure;
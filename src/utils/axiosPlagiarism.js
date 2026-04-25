import axios from "axios";

const axiosPlagiarism = axios.create({
    baseURL: import.meta.env.VITE_PLAGIARISM_URL
});

axiosPlagiarism.interceptors.request.use((config) => {
    const token = localStorage.getItem("access-token");
    if (token)
        config.headers.authorization = `Bearer ${token}`;
    return config;
});

export default axiosPlagiarism;
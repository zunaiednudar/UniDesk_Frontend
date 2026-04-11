import { io } from "socket.io-client";

const baseURL=import.meta.env.VITE_SERVER_URL.replace("/api", "");

const socket = io(baseURL, {
    autoConnect: false  
});

export default socket;
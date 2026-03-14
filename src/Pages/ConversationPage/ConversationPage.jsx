import React, { useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider.jsx';
import axiosSecure from '../../utils/axiosSecure.js';
import socket from '../../utils/socket.js';
import { Send, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import formatName from '../../utils/formatName.js';
import { SiTicktick } from "react-icons/si";
import { TiTickOutline } from "react-icons/ti";

const ConversationPage = () => {

    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const receiverID = searchParams.get("receiverID");

    const { userData } = useContext(AuthContext);

    const scrollRef = useRef();
    const navigate = useNavigate();
    const location = useLocation();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [chatTarget, setChatTarget] = useState(location.state?.receiver || null);
    const [isOnline, setIsOnline] = useState(false);

    const dashboardPath = location.pathname.includes("student") ? "student" : "faculty";

    // For new message

    useEffect(() => {
        if (!id) 
            return;

        const handleNewMessage = (msg) => {
            if (msg.conversation?.toString() === id) {
                setMessages(prev => [...prev, msg]);
                const isReceiver = msg.sender?._id?.toString() !== userData?._id?.toString();
                if (isReceiver)
                    axiosSecure.patch(`/messages/read/${id}`).catch(() => { });
            }
        };

        socket.on("newMessage", handleNewMessage);
        return () => socket.off("newMessage", handleNewMessage);
    }, [id]);

    // For online status

    useEffect(() => {
        if (!chatTarget?._id)
            return;

        const checkStatus = () => {
            socket.emit("checkOnline", chatTarget._id.toString());
        };

        if (socket.connected)
            checkStatus();
        socket.on("connect", checkStatus);

        socket.on("onlineStatus", ({ userID, isOnline }) => {
            if (userID === chatTarget._id.toString())
                setIsOnline(isOnline);
        });

        socket.on("userOnline", (userID) => {
            if (userID === chatTarget._id.toString())
                setIsOnline(true);
        });

        socket.on("userOffline", (userID) => {
            if (userID === chatTarget._id.toString())
                setIsOnline(false);
        });

        return () => {
            socket.off("connect", checkStatus);
            socket.off("onlineStatus");
            socket.off("userOnline");
            socket.off("userOffline");
        };
    }, [chatTarget?._id]);

    // For loading chat content

    useEffect(() => {
        const loadChatContent = async () => {
            if (!userData?._id)
                return;
            try {
                if (id && id !== "new") {
                    const msgRes = await axiosSecure.get(`/conversation/messages/${id}`);
                    setMessages(msgRes.data.messages.reverse());

                    if (!chatTarget) {
                        const conversationRes = await axiosSecure.get(`/conversation/${id}`);
                        const other = conversationRes.data.conversation.participants.find(
                            p => p._id.toString() !== userData._id.toString()
                        );
                        setChatTarget(other);
                    }
                }
                else if (receiverID) {
                    if (!chatTarget) {
                        const userRes = await axiosSecure.get(`/users/id/${receiverID}`);
                        if (userRes.data.success)
                            setChatTarget(userRes.data.user);
                    }
                    setMessages([]);
                }
            } catch (error) {
                console.log("Chat load error", error);
            }
        };
        loadChatContent();
    }, [id, receiverID, userData?._id]);

    // Message sending function

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim())
            return;

        try {
            let workingID = id;

            if (workingID === "new" && receiverID) {
                const res = await axiosSecure.post("/conversation", { receiverID });
                workingID = res.data.conversation._id;
                navigate(`/dashboard/${dashboardPath}/chat/${workingID}`, { replace: true });
            }

            await axiosSecure.post("/messages", {
                conversationID: workingID,
                content: newMessage
            });

            setNewMessage("");

        } catch (error) {
            toast.error("Message send failed");
        }
    };

    // For typing indicator

    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (!id)
            return;

        socket.on("typing", ({ conversationID }) => {
            if (conversationID === id) setIsTyping(true);
        });

        socket.on("stopTyping", ({ conversationID }) => {
            if (conversationID === id) setIsTyping(false);
        });

        return () => {
            socket.off("typing");
            socket.off("stopTyping");
        };
    }, [id]);

    // Typing indicator function

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!chatTarget?._id)
            return;

        socket.emit("typing", {
            conversationID: id,
            receiverID: chatTarget._id.toString()
        });

        clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", {
                conversationID: id,
                receiverID: chatTarget._id.toString()
            });
        }, 1000);
    };

    // Smooth scroll

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // For message seen status

    useEffect(() => {
        if (!id || id === "new" || !userData?._id)
            return;

        const markSeen = async () => {
            try {
                await axiosSecure.patch(`/messages/read/${id}`);
            } catch (error) {
                console.log("Seen error", error);
            }
        };

        markSeen();

        socket.on("messageSeen", ({ conversationID }) => {
            if (conversationID === id) {
                setMessages(prev => prev.map(m => ({
                    ...m,
                    read: true
                })));
            }
        });

        return () => socket.off("messageSeen");
    }, [id, userData?._id]);

    return (
        <div className="flex flex-col h-[85vh] bg-white rounded-3xl gilroy shadow-xl overflow-hidden">

            {/* Receiver info */}

            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-white/80 backdrop-blur-sm">
                <button
                    onClick={() => navigate(`/dashboard/${dashboardPath}/chat`)}
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-[1px] h-6 bg-gray-200"></div>

                <div className="relative">
                    <img
                        src={chatTarget?.photoURL}
                        alt="avatar"
                        className="w-10 h-10 rounded-2xl object-cover ring-2 ring-gray-100"
                    />
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${isOnline ? "bg-green-400" : "bg-gray-300"}`}></span>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 graphik text-sm truncate leading-tight">
                        {chatTarget?.name ? formatName(chatTarget.name) : "Loading..."}
                    </h3>
                    <p className={`text-[11px] font-medium ${isOnline ? "text-green-500" : "text-gray-400"}`}>
                        {isOnline ? "Online" : "Offline"}
                    </p>
                </div>
            </div>

            {/* Conversation body */}

            <div
                className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
                style={{ background: "linear-gradient(180deg, #f8faff 0%, #f3f4f6 100%)" }}
            >
                {
                    messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-10">
                            <div className="w-20 h-20 rounded-3xl overflow-hidden mb-4 shadow-md ring-4 ring-white">
                                <img
                                    src={chatTarget?.photoURL || "/default-avatar.png"}
                                    className="w-full h-full object-cover grayscale opacity-60"
                                />
                            </div>
                            <h4 className="font-semibold text-gray-400 text-base mb-1">No messages yet</h4>
                            <p className="text-xs text-gray-400">
                                Message {chatTarget?.name ? formatName(chatTarget.name).split(" ")[0] : "them"}
                            </p>
                        </div>
                    ) : (
                        messages.map((m, i) => {
                            const isSender = (m.sender?._id || m.sender)?.toString() === userData?._id?.toString();
                            return (
                                <div key={i} className={`flex items-end gap-2 ${isSender ? "flex-row-reverse" : "flex-row"}`}>
                                    {
                                        !isSender && (
                                            <img
                                                src={chatTarget?.photoURL || "/default-avatar.png"}
                                                className="w-7 h-7 rounded-xl object-cover shrink-0 mb-1"
                                            />
                                        )
                                    }
                                    <div className={`flex flex-col gap-1 max-w-[70%] ${isSender ? "items-end" : "items-start"}`}>
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isSender ? "bg-blue-600 text-white rounded-br-md" : "bg-white text-gray-800 rounded-bl-md border border-gray-100"}`}>
                                            {m.content}
                                        </div>
                                        <div className="flex items-center gap-1 px-1">
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                            {
                                                isSender && (
                                                    <span className="text-[10px]">
                                                        {m.read ? (
                                                            <span className="text-blue-500"><SiTicktick /></span>
                                                        ) : (
                                                            <span className="text-gray-400"><TiTickOutline /></span>
                                                        )}
                                                    </span>
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )
                }

                {/* Typing indicator */}

                {
                    isTyping && (
                        <div className="flex items-end gap-2">
                            <img
                                src={chatTarget?.photoURL}
                                className="w-7 h-7 rounded-xl object-cover shrink-0"
                            />
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                            </div>
                        </div>
                    )
                }

                {/* Smooth scroll */}

                <div ref={scrollRef}></div>
            </div>

            {/* Message sending block */}

            <div className="px-4 py-3 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={handleTyping}
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`p-2.5 rounded-2xl transition-all duration-200 ${newMessage.trim() ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 active:scale-95 cursor-pointer" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConversationPage;
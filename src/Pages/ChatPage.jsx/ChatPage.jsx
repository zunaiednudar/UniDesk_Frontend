import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider.jsx'
import { useNavigate, useLocation, useParams } from 'react-router';
import axiosSecure from '../../utils/axiosSecure.js';
import { Search, UserPlus } from 'lucide-react';
import formatName from '../../utils/formatName.js';
import timeAgo from '../../utils/timeAgo.js';
import EmptyState from '../../Components/EmptyState/EmptyState.jsx';
import { toast } from 'sonner';
import CardSkeleton from '../../Components/CardSkeleton/CardSkeleton.jsx';
import socket from '../../utils/socket.js';

const ChatPage = () => {
    const { userData } = useContext(AuthContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [listItems, setListItems] = useState([]);
    const [mode, setMode] = useState("chat");
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    const { conversationID } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Conversation fetch

    useEffect(() => {
        if (!userData?._id)
            return;

        const fetchList = async () => {
            try {
                setLoading(true);
                const res = await axiosSecure.get(`/conversation/user/${userData._id}`, {
                    params: searchTerm ? { search: searchTerm } : {}
                });

                if (res.data.success) {
                    setListItems(res?.data?.users);
                    setMode(res?.data?.mode);
                }
            } catch (error) {
                toast.info("No conversation found");
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchList();
        }, 400);

        return () => clearTimeout(timer);
    }, [searchTerm, userData?._id]);

    // Online status and real time last message

    useEffect(() => {
        socket.on("userOnline", (userID) => {
            setOnlineUsers(prev => new Set([...prev, userID]));
        });

        socket.on("userOffline", (userID) => {
            setOnlineUsers(prev => {
                const next = new Set(prev);
                next.delete(userID);
                return next;
            });
        });

        return () => {
            socket.off("userOnline");
            socket.off("userOffline");
        };
    }, []);

    useEffect(() => {
        if (!userData?._id) 
            return;

        const handleNewMessage = (msg) => {
            setListItems(prev => {
                const exists = prev.some(
                    item => item.conversationID?.toString() === msg.conversation?.toString()
                );

                const isCurrentConversation = window.location.pathname.includes(msg.conversation?.toString());
                const isReceiver = msg.sender?._id?.toString() !== userData?._id?.toString();

                if (exists)
                    return prev.map(item => {
                        if (item.conversationID?.toString() === msg.conversation?.toString()) {
                            return {
                                ...item,
                                lastMessage: msg.content,
                                lastMessageSenderID: msg.sender?._id?.toString(),
                                updatedAt: msg.createdAt,
                                unreadCount: (isReceiver && !isCurrentConversation)
                                    ? (item.unreadCount || 0) + 1
                                    : item.unreadCount
                            };
                        }
                        return item;
                    });
                

                return [{
                    user: isReceiver ? msg.sender : null,
                    conversationID: msg.conversation,
                    lastMessage: msg.content,
                    lastMessageSenderID: msg.sender?._id?.toString(),
                    updatedAt: msg.createdAt,
                    unreadCount: (isReceiver && !isCurrentConversation) ? 1 : 0
                }, ...prev];
            });
        };

        socket.on("newMessage", handleNewMessage);
        return () => socket.off("newMessage", handleNewMessage);

    }, [userData?._id]);

    // Initial online status check when list loads

    useEffect(() => {
        if (listItems.length === 0)
            return;

        listItems.forEach(item => {
            if (item.user?._id)
                socket.emit("checkOnline", item.user._id.toString());
        });

        const handleOnlineStatus = ({ userID, isOnline }) => {
            if (isOnline)
                setOnlineUsers(prev => new Set([...prev, userID]));
        };

        socket.on("onlineStatus", handleOnlineStatus);

        return () => socket.off("onlineStatus", handleOnlineStatus);

    }, [listItems]);

    // New conversation or existing conversation check

    const handleItemClick = (item) => {
        setListItems(prev => prev.map(i =>
            i.conversationID?.toString() === item.conversationID?.toString()
                ? { ...i, unreadCount: 0 }
                : i
        ));
        const dashboardPath = location.pathname.includes("student") ? "student" : "faculty";
        const commonState = { state: { receiver: item.user } };

        if (item.conversationID)
            navigate(`/dashboard/${dashboardPath}/chat/${item.conversationID}`, commonState);
        else
            navigate(`/dashboard/${dashboardPath}/chat/new?receiverID=${item.user._id}`, commonState);
    };

    return (
        <div className='w-full max-w-full p-5 flex flex-col gap-8 gilroy'>
            <div className='w-full max-w-full'>
                <p className='text-3xl graphik font-semibold text-gray-900'>Chat Inbox</p>
                <p className='text-gray-500'>Manage your conversations and start new ones</p>
            </div>

            {/* Search Bar */}

            <div className="w-full flex flex-2 items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search people"
                    className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
                />
            </div>

            {/* Conversation cards */}

            <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-3 h-full overflow-y-auto max-h-[75vh]">
                    {
                        loading ? (
                            [...Array(3)].map((_, i) => <CardSkeleton key={i} variant="inboxCard" />)
                        ) : listItems.length === 0 ? (
                            <EmptyState message={"No conversation found"} />
                        ) : (
                            listItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleItemClick(item)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-500 cursor-pointer ${conversationID === item.conversationID ? 'ring-2 ring-blue-500' : ''}`}
                                >
                                    <div className="relative shrink-0">
                                        <img
                                            src={item.user?.photoURL}
                                            className="w-12 h-12 rounded-full border border-gray-200"
                                        />
                                        {
                                            onlineUsers.has(item.user?._id?.toString()) && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white"></span>
                                            )
                                        }
                                    </div>

                                    <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between items-center gap-2 mb-1">
                                                <h4 className="font-bold text-gray-800 truncate">{formatName(item.user?.name)}</h4>
                                                {
                                                    item.updatedAt && (
                                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                            {timeAgo(item.updatedAt)}
                                                        </span>
                                                    )
                                                }
                                            </div>

                                            {
                                                (mode === "search" && !item.conversationID) ? (
                                                    <p className="text-[10px] md:text-xs text-gray-600 truncate -mt-0.5 lowercase font-medium">
                                                        {item.user?.email}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs md:text-sm text-gray-500 truncate">
                                                        {
                                                            item.lastMessage ? (
                                                                <>
                                                                    <span className="font-medium text-gray-600">
                                                                        {
                                                                            item.lastMessageSenderID === userData?._id?.toString()
                                                                                ? "You: "
                                                                                : `${formatName(item.user?.name).split(' ')[0]}: `
                                                                        }
                                                                    </span>
                                                                    {item.lastMessage}
                                                                </>
                                                            ) : (
                                                                "No messages yet"
                                                            )
                                                        }
                                                    </p>
                                                )
                                            }
                                        </div>

                                        <div className="flex flex-col items-end shrink-0">
                                            {/* Unread count */}

                                            {
                                                item.unreadCount > 0 && (
                                                    <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                        {item.unreadCount > 99 ? "99+" : item.unreadCount}
                                                    </span>
                                                )
                                            }

                                            {
                                                mode === "search" && !item.conversationID && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleItemClick(item);
                                                        }}
                                                        className="px-5 py-2 bg-blue-600 text-white rounded-lg cursor-pointer text-xs font-bold hover:bg-blue-700 transition-all duration-500 hover:shadow-lg flex items-center gap-1.5 active:scale-95"
                                                    >
                                                        <UserPlus className="w-4 h-4" />
                                                        Chat
                                                    </button>
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
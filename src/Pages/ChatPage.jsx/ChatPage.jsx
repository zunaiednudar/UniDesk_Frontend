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

const ChatPage = () => {
    const { userData } = useContext(AuthContext);
    // console.log(userData);

    const [searchTerm, setSearchTerm] = useState("");
    const [listItems, setListItems] = useState([]);
    const [mode, setMode] = useState("chat");
    const { conversationID } = useParams();
    const [loading,setLoading]=useState(true);

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
            }finally{
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchList();
        }, 400); // 400ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm, userData?._id]);

    const handleItemClick = (item) => {
        const dashboardPath = location.pathname.includes("student") ? "student" : "faculty";

        if (item.conversationID)
            navigate(`/dashboard/${dashboardPath}/chat/${item.conversationID}`);
        else
            navigate(`/dashboard/${dashboardPath}/chat/new?receiverID=${item.user._id}`);
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

            <div className="grid grid-cols-1 gap-6">

                {/* Inbox list area */}

                <div className="flex flex-col gap-3 h-full overflow-y-auto max-h-[75vh]">
                    {
                        loading ? (
                            [...Array(3)].map((_, i) => <CardSkeleton key={i} variant="inboxCard" />)
                        )
                        :
                        listItems.length === 0 ? (
                            <EmptyState message={"No conversation found"}></EmptyState>
                        ) : (
                            listItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleItemClick(item)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-500 cursor-pointer ${conversationID === item.conversationID ? 'ring-2 ring-blue-500' : ''}`}
                                >
                                    <img src={item.user?.photoURL || "/default-avatar.png"} className="w-12 h-12 rounded-full border border-gray-200" alt="user" />
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
                                                mode === "search" && !item.conversationID ? (
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
                                                                            item.lastMessage.sender === userData?._id
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
                                            {
                                                mode === "search" && !item.conversationID && (
                                                    <button className="px-5 py-2 bg-blue-600 text-white rounded-lg cursor-pointer text-xs font-bold hover:bg-blue-600 transition-all duration-500 hover:shadow-lg flex items-center gap-1.5 active:scale-95">
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
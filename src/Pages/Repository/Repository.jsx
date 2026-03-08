import React, {useEffect, useState} from 'react';
import {ChartNoAxesCombined, Trophy, Upload, CheckCircle, CloudUpload, Ban} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import {Line} from "react-chartjs-2"
import {useParams} from "react-router";
import axiosSecure from "../../utils/axiosSecure.js";
import formatName from "../../utils/formatName.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const rankStyles = {
    1: {bg: "bg-gray-50", border: "border-gray-300", badge: "bg-gray-200 text-gray-600", trophy: "text-gray-500"},
    2: {bg: "bg-white", border: "border-gray-200", badge: "bg-gray-100 text-gray-500", trophy: "text-gray-400"},
    3: {bg: "bg-white", border: "border-gray-200", badge: "bg-gray-100 text-gray-400", trophy: "text-gray-300"},
};

const defaultStyle = {
    bg: "bg-white", border: "border-gray-200", badge: "bg-gray-100 text-gray-500", trophy: "text-gray-300"
};

const StatCard = ({icon: Icon, value, label, iconBg, iconColor}) => (
    <div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow duration-200">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon size={22} className={iconColor} strokeWidth={1.75}/>
        </div>
        <div>
            <div className="text-3xl font-bold text-gray-900 leading-tight">{value ?? '—'}</div>
            <div className="text-sm text-gray-400 mt-0.5 font-medium">{label}</div>
        </div>
    </div>
);

const Repository = () => {
    const {id} = useParams();
    const [contributionPoints, setContributionPoints] = useState(0);
    const [totalUploaded, setTotalUploaded] = useState(0);
    const [totalRejected, setTotalRejected] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [graphData, setGraphData] = useState();

    // Graph UI options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: `Contribution Activity (${new Date().getFullYear()})`,
                font: {
                    size: 16
                },
                color: "#111827"
            }
        }
    };

    useEffect(() => {
        const months = [
            "Jan","Feb","Mar","Apr","May","Jun",
            "Jul","Aug","Sep","Oct","Nov","Dec"
        ];

        const fetchData = async () => {
            try {
                const [contributionRes, leaderboardRes] = await Promise.all([
                    await axiosSecure.get('/repository'),
                    await axiosSecure.get('/repository/leaderboard')
                ]);

                console.log("Contribution data (Repository.jsx): ", contributionRes.data);
                console.log("Leaderboard data (Repository.jsx): ", leaderboardRes.data);

                const repositoryItems = contributionRes.data.items;

                const totalContributionPoints = repositoryItems.reduce((sum, item) => {
                    if (item.uploader._id === id) return sum + item.contributionPoints;
                    return sum;
                }, 0);

                const totalUploaded = repositoryItems.reduce((sum, item) => {
                    if (item.uploader._id === id) return sum + 1;
                    return sum;
                }, 0);

                const totalRejected = repositoryItems.reduce((sum, item) => {
                    if (item.uploader._id === id && !item.rejectedReason) return sum + 1;
                    return sum;
                }, 0);

                const allPersonalNotes = repositoryItems
                    .filter(item => {
                        return (item.uploader._id === id) && (item.itemType.toLowerCase() === "personal note");
                    });

                const allQuestionBanksAnswers = repositoryItems
                    .filter(item => {
                        return (item.uploader._id === id) && ((item.itemType.toLowerCase() === "question bank") || (item.itemType.toLowerCase() === "answer"));
                    });

                const allEbooks = repositoryItems
                    .filter(item => {
                        return (item.uploader._id === id) && (item.itemType.toLowerCase() === "ebook");
                    });

                const otherMaterials = repositoryItems
                    .filter(item => {
                        return (item.uploader._id === id) && (item.itemType.toLowerCase() !== "personal note")
                            &&  (item.itemType.toLowerCase() !== "question bank")
                            &&  (item.itemType.toLowerCase() !== "answer")
                            &&  (item.itemType.toLowerCase() !== "ebook");
                    });

                console.log("All question banks (Repository.jsx): ", allQuestionBanksAnswers);

                // Month mapping

                const filteredPersonalNotes = allPersonalNotes
                    .reduce((acc, item) => {
                        const month = new Date(item.approvedAt).getMonth();
                        if (new Date(item.approvedAt).getFullYear() === new Date().getFullYear())
                            acc[month] = (acc[month] || 0) + item.contributionPoints;
                        return acc;
                    }, Array(12).fill(0));

                const filteredQuestionBanksAnswers = allQuestionBanksAnswers
                    .reduce((acc, item) => {
                        const month = new Date(item.approvedAt).getMonth();
                        if (new Date(item.approvedAt).getFullYear() === new Date().getFullYear())
                            acc[month] = (acc[month] || 0) + item.contributionPoints;
                        return acc;
                    }, Array(12).fill(0));

                const filteredEbooks = allEbooks
                    .reduce((acc, item) => {
                        const month = new Date(item.approvedAt).getMonth();
                        if (new Date(item.approvedAt).getFullYear() === new Date().getFullYear())
                            acc[month] = (acc[month] || 0) + item.contributionPoints;
                        return acc;
                    }, Array(12).fill(0));

                const filteredOtherMaterials = otherMaterials
                    .reduce((acc, item) => {
                        const month = new Date(item.approvedAt).getMonth();
                        if (new Date(item.approvedAt).getFullYear() === new Date().getFullYear())
                            acc[month] = (acc[month] || 0) + item.contributionPoints;
                        return acc;
                    }, Array(12).fill(0));

                console.log("Filtered other materials (Repository.jsx): ", filteredPersonalNotes);

                // Build graph datasets
                const data = {
                    labels: months,
                    datasets: [
                        {
                            label: "Personal Notes",
                            data: filteredPersonalNotes,
                            borderColor: "#6366F1",
                            backgroundColor: "#6366F1",
                            tension: 0.4
                        },
                        {
                            label: "Question Banks & Answers",
                            data: filteredQuestionBanksAnswers,
                            borderColor: "#22C55E",
                            backgroundColor: "#22C55E",
                            tension: 0.4
                        },
                        {
                            label: "Ebooks",
                            data: filteredEbooks,
                            borderColor: "#F59E0B",
                            backgroundColor: "#F59E0B",
                            tension: 0.4
                        },
                        {
                            label: "Others",
                            data: filteredOtherMaterials,
                            borderColor: "#EC4899",
                            backgroundColor: "#EC4899",
                            tension: 0.4
                        }
                    ]
                }

                const leaderboard = leaderboardRes.data.top10;
                // leaderboard.sort((a, b) => a.rank - b.rank)

                setContributionPoints(totalContributionPoints);
                setTotalUploaded(totalUploaded);
                setTotalRejected(totalRejected);

                setLeaderboard(leaderboard);
                setGraphData(data);
            } catch (error) {
                console.log("Error (Repository.jsx): ", error);
            }
        };

        fetchData();
    }, [id]);

    return (
        <div className="gilroy space-y-6">
            {/* Header */}
            <div>
                <h1 className="graphik text-3xl font-semibold text-gray-900">Repository</h1>
                <p className="text-sm text-gray-400 mt-1">A collaborative platform for students and instructors to
                    exchange study materials, participate in discussions, and contribute valuable academic resources</p>
            </div>

            {/* Stats */}
            {id && (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                    <StatCard
                        icon={ChartNoAxesCombined}
                        value={contributionPoints}
                        label="Contribution Points"
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-500"/>

                    <StatCard
                        icon={CloudUpload}
                        value={totalUploaded}
                        label="Total Uploaded"
                        iconBg="bg-blue-50"
                        iconColor="text-blue-500"/>

                    <StatCard
                        icon={Ban}
                        value={totalRejected}
                        label="Total Rejected"
                        iconBg="bg-red-50"
                        iconColor="text-red-500"/>
                </div>
            )}


            {/* Contribution graph + Leaderboard */}
            <div className="p-5 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                {/* Contribution graph */}
                {graphData && (
                    <div className="h-full">
                        <Line data={graphData} options={options} />
                    </div>
                )}

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-5">
                    <h2 className="graphik text-2xl font-semibold text-gray-900">Top Contributors</h2>

                    {/* Leaderboard */}
                    {leaderboard?.length > 0 ? (
                        <div className="p-5 space-y-2.5">
                            {leaderboard.map((person) => {
                                const style = rankStyles[person.rank] ?? defaultStyle;
                                return (

                                    <div
                                        key={person.user._id ?? person.rank}
                                        className={`${style.bg} ${style.border} border rounded-2xl px-5 py-4 flex items-center gap-4 overflow-x-auto`}
                                    >
                                        {/* Rank badge */}
                                        <div
                                            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${style.badge}`}>
                                            {person.rank <= 3
                                                ? <Trophy className={`w-4 h-4 ${style.trophy}`}/>
                                                : <span># {person.rank}</span>
                                            }
                                        </div>

                                        {/* Avatar + Name */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div
                                                className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold shrink-0 uppercase">
                                                {person.user.photoURL
                                                    ? <img src={person.user.photoURL} alt={person.user.name}
                                                           className="w-full h-full object-cover"/>
                                                    : person.user.name?.[0] ?? "?"
                                                }
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900">{formatName(person.user.name)}</p>
                                                <p className="text-xs text-gray-400">{person.user.studentID ?? ""}</p>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="hidden sm:flex sm:flex-1 sm:justify-end items-center gap-5">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Upload className="w-3.5 h-3.5 text-blue-400"/>
                                                <span className="font-medium text-gray-700">{person.itemsUploaded}</span>
                                                <span>uploads</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400"/>
                                                <span className="font-medium text-gray-700">{person.itemsApproved}</span>
                                                <span>approved</span>
                                            </div>
                                        </div>

                                        {/* Points */}
                                        <div className="shrink-0 text-right sm:min-w-20">
                                            <p className="text-base font-bold text-green-700">{person.totalPoints.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">pts</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div
                            className="bg-white border border-gray-200 rounded-2xl py-14 flex flex-col items-center justify-center text-center">
                            <Trophy className="w-8 h-8 text-gray-200 mb-3"/>
                            <p className="text-sm font-medium text-gray-400">No leaderboard data yet</p>
                            <p className="text-xs text-gray-300 mt-1">Start uploading to earn points</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Repository;
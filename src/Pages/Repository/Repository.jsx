import React, {useEffect, useState} from 'react';
import {ChartNoAxesCombined, Trophy, Upload, CheckCircle, Hash} from 'lucide-react';
import {useParams} from "react-router";
import axiosSecure from "../../utils/axiosSecure.js";
import formatName from "../../utils/formatName.js";

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
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 inline-flex items-center gap-5 hover:shadow-md transition-shadow duration-200">
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
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
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

                const leaderboard = leaderboardRes.data.top10;
                // leaderboard.sort((a, b) => a.rank - b.rank)

                setContributionPoints(totalContributionPoints);
                setLeaderboard(leaderboard);
            } catch (error) {
                console.log("Error (Repository.jsx): ", error);
            }
        };

        fetchData();
    }, []);

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
                <StatCard
                    icon={ChartNoAxesCombined}
                    value={contributionPoints}
                    label="Contribution Points"
                    iconBg="bg-blue-50"
                    iconColor="text-blue-500"/>
            )}

            {/* Leaderboard */}
            {leaderboard?.length > 0 ? (
                <div className="space-y-2.5">
                    {leaderboard.map((person) => {
                        const style = rankStyles[person.rank] ?? defaultStyle;
                        return (
                            <div
                                key={person.user._id ?? person.rank}
                                className={`${style.bg} ${style.border} border rounded-2xl px-5 py-4 flex justify-between items-center gap-4`}
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
                                <div className="flex flex-1 items-center gap-3 min-w-0">
                                    <div
                                        className="w-9 h-9 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-700 text-sm font-bold shrink-0 uppercase">
                                        {person.user.photoURL
                                            ? <img src={person.user.photoURL} alt={person.user.name}
                                                   className="w-full h-full object-cover"/>
                                            : person.user.name?.[0] ?? "?"
                                        }
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{formatName(person.user.name)}</p>
                                        <p className="text-xs text-gray-400 truncate">{person.user.studentID ?? ""}</p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="hidden sm:flex items-center gap-5">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <Upload className="w-3.5 h-3.5 text-gray-400"/>
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
                                <div className="shrink-0 text-right min-w-20">
                                    <p className="text-base font-bold text-blue-700">{person.totalPoints.toLocaleString()}</p>
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
    );
};

export default Repository;
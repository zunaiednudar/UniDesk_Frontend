import { useEffect, useRef } from "react";
import { Megaphone } from "lucide-react";
import EmptyState from "../../Components/EmptyState/EmptyState.jsx";
import SkeletonBlock from "../../Components/SkeletonBlock/SkeletonBlock.jsx";
import SectionHeader from "../../Components/SectionHeader/SectionHeader.jsx";

const RecentNotices = ({ notices = [], loading }) => {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const animationIdRef = useRef(null);
    const positionRef = useRef(0);

    useEffect(() => {
        if (loading || notices.length === 0) return;

        const container = containerRef.current;
        const content = contentRef.current;
        if (!container || !content) return;

        const speed = 0.25;

        const scroll = () => {
            positionRef.current += speed;
            const half = content.scrollHeight / 2;
            if (half > 0 && positionRef.current >= half) {
                positionRef.current = 0;
            }
            container.scrollTop = positionRef.current;
            animationIdRef.current = requestAnimationFrame(scroll);
        };

        const pause = () => {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
        };

        const resume = () => {
            if (!animationIdRef.current) {
                animationIdRef.current = requestAnimationFrame(scroll);
            }
        };

        container.addEventListener('mouseenter', pause);
        container.addEventListener('mouseleave', resume);

        const observer = new ResizeObserver(() => {
            if (content.scrollHeight > 0 && !animationIdRef.current) {
                animationIdRef.current = requestAnimationFrame(scroll);
                observer.disconnect();
            }
        });
        observer.observe(content);

        return () => {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
            observer.disconnect();
            container.removeEventListener('mouseenter', pause);
            container.removeEventListener('mouseleave', resume);
        };
    }, [notices, loading]);

    return (
        <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <SectionHeader
                icon={Megaphone}
                title="Recent Announcements"
                iconBg="bg-red-50"
                iconColor="text-red-500"
                seeAllTo=""
                navigate=""
            />
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <SkeletonBlock key={i} className="h-16" />)}
                </div>
            ) : notices.length === 0 ? (
                <EmptyState message="No notices at the moment." />
            ) : (
                <div
                    ref={containerRef}
                    className="mt-10 h-96 overflow-hidden"
                    style={{ scrollBehavior: 'auto' }}>
                    <div ref={contentRef} className="h-full">
                        {[...notices, ...notices].map((notice, idx) => (
                            <div key={idx} className="py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-1 transition-colors duration-150">
                                <p className="text-xs font-semibold text-gray-800 leading-snug">{notice.title}</p>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{notice.message}</p>
                                <p className="text-[10px] text-gray-300 mt-1">{notice.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentNotices;
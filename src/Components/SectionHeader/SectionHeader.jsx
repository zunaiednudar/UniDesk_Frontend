// General section header template
// Different sections in main body has this header, attached with 'See all' option which routes to specific pages via NavLink
import {NavLink} from "react-router";
import {ChevronRight} from "lucide-react";

const SectionHeader = ({icon: Icon, title, iconBg, iconColor, count, seeAllTo, navigate}) => (
    <>
        <div className="flex flex-col lg:flex-row items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 mb-5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <Icon size={16} className={iconColor} strokeWidth={2}/>
                </div>
                <h2 className="graphik text-md font-semibold text-gray-800">{title}</h2>
                {count !== undefined && (
                    <span className="ml-1 text-xs font-semibold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                {count}
            </span>)
                }
            </div>

            {navigate === true && (
                <NavLink
                    to={seeAllTo}
                    className="flex items-center p-2 gap-1 text-xs font-semibold text-gray-500 border border-gray-500 hover:text-blue-600 hover:border-blue-600 rounded transition-colors"
                >
                    See all
                    <ChevronRight size={13} strokeWidth={2.5}/>
                </NavLink>
            )}
        </div>

        <div className="border-t border-gray-200 my-5 lg:my-0"></div>
    </>
);

export default SectionHeader;
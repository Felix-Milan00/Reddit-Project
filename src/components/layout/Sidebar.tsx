import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Users, Bookmark, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/useAuthStore';

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/popular', label: 'Popular', icon: TrendingUp },
    { to: '/communities', label: 'Communities', icon: Users },
  ];

  if (user) {
    links.push({ to: '/saved', label: 'Saved', icon: Bookmark });
  }

  return (
    <aside className="hidden md:flex flex-col w-64 min-w-[256px] border-r border-gray-200 dark:border-[#343536] bg-white dark:bg-[#1a1a1b] h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto overflow-x-hidden pt-4 pb-10">
      <div className="px-4 mb-4">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Feeds</h3>
        <ul className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-gray-100 text-gray-900 dark:bg-[#272729] dark:text-gray-100" 
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#272729]"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="px-4 mb-4 mt-4 border-t border-gray-100 dark:border-[#343536] pt-4">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Recent Communities</h3>
        <ul className="space-y-1 text-sm">
          {/* Static for now */}
          <li>
            <Link to="/r/reactjs" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#272729]">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white">r/</div>
              r/reactjs
            </Link>
          </li>
          <li>
            <Link to="/r/webdev" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#272729]">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white">r/</div>
              r/webdev
            </Link>
          </li>
        </ul>
      </div>

      <div className="mt-auto px-4 pt-4 border-t border-gray-100 dark:border-[#343536]">
        {user && (
          <Link to="/settings/profile" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#272729] transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        )}
      </div>
    </aside>
  );
}

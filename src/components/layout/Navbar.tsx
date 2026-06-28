import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Search, Plus, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useState } from 'react';
import { NotificationDropdown } from './NotificationDropdown';

export function Navbar() {
  const { user, profile } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 flex h-12 md:h-14 items-center justify-between bg-white px-4 shadow-sm dark:bg-[#1a1a1b] dark:border-b dark:border-[#343536]">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-500 hover:bg-gray-100 p-1 rounded dark:hover:bg-[#272729]">
          <Menu className="w-6 h-6" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-reddit-orange rounded-full flex items-center justify-center text-white font-bold text-xl">
            r
          </div>
          <span className="hidden text-xl font-semibold tracking-tight md:block">reddit</span>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl px-4 hidden sm:block">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const q = formData.get('q');
          if (q) window.location.href = `/search?q=${encodeURIComponent(q.toString())}`;
        }} className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-hover:text-blue-500">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            name="q"
            className="block w-full rounded-full border-none bg-gray-100 py-2 pl-10 pr-3 text-sm outline-none hover:bg-white hover:ring-1 hover:ring-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:bg-[#272729] dark:text-gray-200 dark:hover:bg-[#272729] dark:focus:bg-[#272729] transition-all"
            placeholder="Search Reddit"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {user ? (
          <>
            <Link to="/search" className="sm:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-full dark:hover:bg-[#272729]">
              <Search className="w-5 h-5" />
            </Link>
            <Link to="/create-post" className="text-gray-500 hover:bg-gray-100 p-2 rounded-full dark:hover:bg-[#272729]" title="Create Post">
              <Plus className="w-5 h-5" />
            </Link>
            <NotificationDropdown />
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:border-gray-200 border border-transparent p-1 rounded dark:hover:border-[#343536] transition-colors"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-7 h-7 rounded-md object-cover" />
                ) : (
                  <div className="w-7 h-7 bg-gray-300 rounded-md flex items-center justify-center text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="hidden md:block text-left text-xs">
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{profile?.username || 'User'}</div>
                  <div className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                    <span className="text-reddit-orange text-[10px]">✤</span> {profile?.karma || 1} karma
                  </div>
                </div>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg overflow-hidden dark:bg-[#1a1a1b] dark:border-[#343536]">
                  <Link to={`/user/${profile?.username}`} onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#272729] font-medium flex items-center gap-2">
                    <UserIcon className="w-4 h-4" /> Profile
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#272729] font-medium flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="rounded-full bg-gray-100 px-4 py-1.5 font-semibold text-gray-800 hover:bg-gray-200 dark:bg-[#272729] dark:text-gray-200 dark:hover:bg-[#343536] text-sm transition-colors">
              Log In
            </Link>
            <Link to="/register" className="hidden rounded-full bg-reddit-orange px-4 py-1.5 font-semibold text-white hover:bg-orange-600 sm:block text-sm transition-colors">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

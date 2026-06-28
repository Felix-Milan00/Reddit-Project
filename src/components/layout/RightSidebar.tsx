import { Link } from 'react-router-dom';

export function RightSidebar() {
  return (
    <aside className="hidden lg:block w-[312px] min-w-[312px] pt-4 pb-10">
      <div className="bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536] overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-10"></div>
        <div className="px-3 pb-3 relative">
          <div className="flex items-end gap-2 mt-[-10px] mb-2">
            <div className="w-10 h-10 bg-white dark:bg-[#1a1a1b] rounded-lg p-1">
              <div className="w-full h-full bg-reddit-orange rounded-md flex items-center justify-center text-white font-bold">r</div>
            </div>
            <span className="font-semibold text-sm">Home</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
            Your personal Reddit frontpage. Come here to check in with your favorite communities.
          </p>
          <div className="space-y-2">
            <Link to="/create-post" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 rounded-full text-sm transition-colors">
              Create Post
            </Link>
            <Link to="/communities/create" className="block w-full text-center border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold py-1.5 rounded-full text-sm transition-colors">
              Create Community
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536] p-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-4">
          <a href="#" className="hover:underline">User Agreement</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Content Policy</a>
          <a href="#" className="hover:underline">Moderator Code</a>
        </div>
        <div className="border-t border-gray-200 dark:border-[#343536] pt-3">
          Reddit Clone © {new Date().getFullYear()}. All rights reserved.
        </div>
      </div>
    </aside>
  );
}

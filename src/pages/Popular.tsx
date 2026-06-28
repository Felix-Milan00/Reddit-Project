import { useState } from 'react';
import { Flame, Star, Clock } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from '../components/feed/PostCard';

type SortTab = 'hot' | 'top' | 'new';

export function Popular() {
  const [activeTab, setActiveTab] = useState<SortTab>('hot');
  const { posts, loading, error } = usePosts(undefined, activeTab);

  return (
    <div className="w-full flex justify-center py-6">
      <div className="w-full max-w-[960px] px-4 md:px-6 flex flex-col lg:flex-row gap-6">
        
        {/* Main Feed */}
        <div className="flex-1 max-w-[640px]">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Popular Posts</h1>
          
          {/* Sorting Tabs */}
          <div className="bg-white dark:bg-[#1a1a1b] p-2 mb-4 flex items-center gap-2 border border-gray-200 dark:border-[#343536] rounded-md overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('hot')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                activeTab === 'hot'
                  ? 'bg-gray-200 dark:bg-[#272729] text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272729]'
              }`}
            >
              <Flame className="w-5 h-5" />
              Hot
            </button>
            <button
              onClick={() => setActiveTab('top')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                activeTab === 'top'
                  ? 'bg-gray-200 dark:bg-[#272729] text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272729]'
              }`}
            >
              <Star className="w-5 h-5" />
              Top
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                activeTab === 'new'
                  ? 'bg-gray-200 dark:bg-[#272729] text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272729]'
              }`}
            >
              <Clock className="w-5 h-5" />
              New
            </button>
          </div>

          {/* Feed Content */}
          {loading ? (
             <div className="space-y-4">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="bg-white dark:bg-[#1a1a1b] h-40 rounded-md animate-pulse border border-gray-200 dark:border-[#343536]"></div>
             ))}
           </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 font-bold bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536]">
              Failed to load posts: {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536] text-gray-500">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No posts yet</h2>
              <p>Check back later or start a new community!</p>
            </div>
          ) : (
            <div className="space-y-0">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar (Optional placeholder for Popular communities) */}
        <div className="hidden lg:block w-[312px]">
           <div className="bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] rounded-md p-4 sticky top-[80px]">
             <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Trending Communities</h2>
             <p className="text-sm text-gray-500 mb-4">Discover popular communities matching your interests.</p>
             <a href="/communities" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-full transition-colors text-sm">
               View All Communities
             </a>
           </div>
        </div>

      </div>
    </div>
  );
}

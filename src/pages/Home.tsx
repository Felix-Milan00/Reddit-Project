import { usePosts } from '../hooks/usePosts';
import { PostCard } from '../components/feed/PostCard';
import { RightSidebar } from '../components/layout/RightSidebar';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import { Image, Link as LinkIcon, Edit3 } from 'lucide-react';

export function Home() {
  const { posts, loading, error } = usePosts();
  const { user, profile } = useAuthStore();

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[640px]">
        {/* Create Post Input UI */}
        {user && (
          <div className="bg-white dark:bg-[#1a1a1b] p-2 mb-4 flex items-center gap-2 border border-gray-200 dark:border-[#343536] rounded-md">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                <Edit3 className="w-5 h-5" />
              </div>
            )}
            <Link 
              to="/create-post" 
              className="flex-1 bg-gray-50 hover:bg-white dark:bg-[#272729] dark:hover:bg-[#1a1a1b] border border-gray-200 hover:border-blue-500 dark:border-[#343536] dark:hover:border-gray-200 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-md outline-none transition-all text-sm text-left"
            >
              Create Post
            </Link>
            <Link to="/create-post?type=image" className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272729] rounded hover:text-blue-500 transition-colors">
              <Image className="w-6 h-6" />
            </Link>
            <Link to="/create-post?type=link" className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272729] rounded hover:text-blue-500 transition-colors">
              <LinkIcon className="w-6 h-6" />
            </Link>
          </div>
        )}

        {/* Sort/Filter Bar (Dummy for now) */}
        <div className="bg-white dark:bg-[#1a1a1b] p-2 mb-4 flex items-center gap-2 border border-gray-200 dark:border-[#343536] rounded-md text-sm font-bold text-gray-500 dark:text-gray-400">
          <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-[#272729] text-blue-500 rounded-full">
            Hot
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-full">
            New
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-full">
            Top
          </button>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-[#1a1a1b] h-32 rounded-md animate-pulse border border-gray-200 dark:border-[#343536]"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            Error loading posts: {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536] text-gray-500">
            No posts found.
          </div>
        ) : (
          <div>
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      
      {/* Spacer for Right Sidebar when screen is large enough, or use Outlet layout */}
      <div className="hidden lg:block w-[312px] ml-6">
        <RightSidebar />
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Plus, MessageSquare } from 'lucide-react';
import { useCommunities } from '../hooks/useCommunities';

type SortOption = 'members' | 'newest' | 'posts';

export function Communities() {
  const { communities, loading, error, userJoinedCommunities, toggleJoin } = useCommunities();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('members');

  const filteredAndSortedCommunities = useMemo(() => {
    let result = communities;

    // Search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        c => c.name.toLowerCase().includes(lowerQuery) || 
             c.display_name.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'members') {
        return (b.member_count || 0) - (a.member_count || 0);
      } else if (sortBy === 'posts') {
        return (b.post_count || 0) - (a.post_count || 0);
      } else if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });

    return result;
  }, [communities, searchQuery, sortBy]);

  return (
    <div className="w-full flex justify-center py-8">
      <div className="w-full max-w-[960px] px-4 md:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Communities</h1>
          <Link 
            to="/communities/create" 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-bold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Community
          </Link>
        </div>

        <div className="bg-white dark:bg-[#1a1a1b] p-4 rounded-md border border-gray-200 dark:border-[#343536] mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <button
              onClick={() => setSortBy('members')}
              className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                sortBy === 'members'
                  ? 'bg-gray-200 dark:bg-[#272729] text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272729]'
              }`}
            >
              Most Members
            </button>
            <button
              onClick={() => setSortBy('posts')}
              className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                sortBy === 'posts'
                  ? 'bg-gray-200 dark:bg-[#272729] text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272729]'
              }`}
            >
              Most Posts
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                sortBy === 'newest'
                  ? 'bg-gray-200 dark:bg-[#272729] text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272729]'
              }`}
            >
              Newest
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-[#1a1a1b] h-64 rounded-xl animate-pulse border border-gray-200 dark:border-[#343536]"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 font-bold bg-white dark:bg-[#1a1a1b] rounded-xl border border-gray-200 dark:border-[#343536]">
            Failed to load communities: {error}
          </div>
        ) : filteredAndSortedCommunities.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-[#1a1a1b] rounded-xl border border-gray-200 dark:border-[#343536] text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No communities found</h2>
            <p className="mb-6">We couldn't find any communities matching your criteria.</p>
            <Link 
              to="/communities/create" 
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create the first one!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCommunities.map(community => {
              const isJoined = userJoinedCommunities.has(community.id);
              return (
                <div key={community.id} className="bg-white dark:bg-[#1a1a1b] rounded-xl border border-gray-200 dark:border-[#343536] overflow-hidden hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex flex-col">
                  <div className="h-20 bg-blue-500 w-full relative">
                    {community.banner_url && (
                      <img src={community.banner_url} alt="Banner" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute -bottom-8 left-4">
                      {community.avatar_url ? (
                        <img src={community.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full border-4 border-white dark:border-[#1a1a1b] bg-white object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full border-4 border-white dark:border-[#1a1a1b] bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                          r/
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-10 p-4 flex-1 flex flex-col">
                    <Link to={`/r/${community.name}`} className="hover:underline text-gray-900 dark:text-gray-100">
                      <h2 className="text-lg font-bold truncate">{community.display_name}</h2>
                    </Link>
                    <p className="text-sm font-semibold text-gray-500 mb-3 truncate">r/{community.name}</p>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-1">
                      {community.description || 'No description provided.'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1" title="Members">
                          <Users className="w-4 h-4" />
                          <span>{community.member_count}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Posts">
                          <MessageSquare className="w-4 h-4" />
                          <span>{community.post_count}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          toggleJoin(community.id);
                        }}
                        className={`px-4 py-1.5 rounded-full font-bold text-sm transition-colors ${
                          isJoined 
                            ? 'border border-gray-400 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272729]' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isJoined ? 'Joined' : 'Join'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

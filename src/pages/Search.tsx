import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Post, Community, Profile } from '../types';
import { PostCard } from '../components/feed/PostCard';

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [activeTab, setActiveTab] = useState<'posts' | 'communities' | 'users'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        if (activeTab === 'posts') {
          const { data } = await supabase
            .from('posts')
            .select('*, author:profiles!posts_user_id_fkey(*), community:communities(*)')
            .ilike('title', `%${query}%`)
            .order('created_at', { ascending: false });
          setPosts(data as any[] || []);
        } else if (activeTab === 'communities') {
          const { data } = await supabase
            .from('communities')
            .select('*')
            .or(`name.ilike.%${query}%,display_name.ilike.%${query}%`)
            .order('created_at', { ascending: false });
          setCommunities(data || []);
        } else if (activeTab === 'users') {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', `%${query}%`)
            .order('created_at', { ascending: false });
          setUsers(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, activeTab]);

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-full max-w-[800px]">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Search results for "{query}"</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-[#343536]">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`pb-2 font-bold text-sm ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            Posts
          </button>
          <button 
            onClick={() => setActiveTab('communities')}
            className={`pb-2 font-bold text-sm ${activeTab === 'communities' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            Communities
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`pb-2 font-bold text-sm ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            People
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Searching...</div>
        ) : (
          <div>
            {activeTab === 'posts' && (
              posts.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536] text-gray-500">
                  No posts found
                </div>
              ) : (
                posts.map(post => <PostCard key={post.id} post={post} />)
              )
            )}

            {activeTab === 'communities' && (
              <div className="bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536] overflow-hidden">
                {communities.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No communities found</div>
                ) : (
                  communities.map(community => (
                    <Link key={community.id} to={`/r/${community.name}`} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-[#272729] hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors last:border-0">
                      {community.avatar_url ? (
                        <img src={community.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">r/</div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{community.display_name}</h3>
                        <p className="text-sm text-gray-500">r/{community.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{community.description}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536] overflow-hidden">
                {users.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No users found</div>
                ) : (
                  users.map(profile => (
                    <Link key={profile.id} to={`/user/${profile.username}`} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-[#272729] hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors last:border-0">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold">u/</div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{profile.display_name || profile.username}</h3>
                        <p className="text-sm text-gray-500">u/{profile.username}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1"><span className="text-reddit-orange">✤</span> {profile.karma} karma</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

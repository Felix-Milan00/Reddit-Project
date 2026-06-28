import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Community as CommunityType } from '../types';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from '../components/feed/PostCard';
import { useAuthStore } from '../store/useAuthStore';
import { Edit3, Image, Link as LinkIcon, Users } from 'lucide-react';

export function Community() {
  const { communityName } = useParams<{ communityName: string }>();
  const [community, setCommunity] = useState<CommunityType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);

  const { user, profile } = useAuthStore();
  const { posts, loading: postsLoading } = usePosts(community?.id);

  useEffect(() => {
    const fetchCommunity = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('communities')
          .select('*')
          .eq('name', communityName?.toLowerCase() || '')
          .single();

        if (fetchError) throw fetchError;
        setCommunity(data);

        if (data) {
          // Fetch member count
          const { count } = await supabase
            .from('community_members')
            .select('*', { count: 'exact', head: true })
            .eq('community_id', data.id);
            
          setMemberCount(count || 0);

          // Check if current user is member
          if (user) {
            const { data: memberData } = await supabase
              .from('community_members')
              .select('*')
              .eq('community_id', data.id)
              .eq('user_id', user.id)
              .single();
              
            setIsMember(!!memberData);
          }
        }
      } catch (err: any) {
        setError('Community not found');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [communityName, user]);

  const handleJoinLeave = async () => {
    if (!user || !community) return;

    if (isMember) {
      await supabase
        .from('community_members')
        .delete()
        .eq('community_id', community.id)
        .eq('user_id', user.id);
      setIsMember(false);
      setMemberCount(prev => Math.max(0, prev - 1));
    } else {
      await supabase
        .from('community_members')
        .insert({
          community_id: community.id,
          user_id: user.id
        });
      setIsMember(true);
      setMemberCount(prev => prev + 1);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading community...</div>;
  }

  if (error || !community) {
    return <div className="p-8 text-center text-red-500 font-bold">{error || 'Community not found'}</div>;
  }

  return (
    <div className="w-full flex justify-center flex-col items-center">
      {/* Community Banner */}
      <div className="w-full h-24 sm:h-32 bg-blue-500 w-screen max-w-[1600px] mb-4">
        {community.banner_url && (
          <img src={community.banner_url} alt="Banner" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="w-full max-w-[960px] px-4 md:px-6">
        {/* Community Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6 -mt-8 sm:-mt-12">
          {community.avatar_url ? (
            <img src={community.avatar_url} alt="Avatar" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white dark:border-[#030303] bg-white object-cover" />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white dark:border-[#030303] bg-blue-500 flex items-center justify-center text-white text-3xl font-bold shrink-0">
              r/
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{community.display_name}</h1>
            <p className="text-sm font-semibold text-gray-500">r/{community.name}</p>
          </div>
          <button 
            onClick={handleJoinLeave}
            className={`px-8 py-1.5 rounded-full font-bold text-sm transition-colors ${
              isMember 
                ? 'border border-gray-400 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272729]' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isMember ? 'Joined' : 'Join'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Feed */}
          <div className="flex-1 max-w-[640px]">
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
                  to={`/create-post?community=${community.id}`} 
                  className="flex-1 bg-gray-50 hover:bg-white dark:bg-[#272729] dark:hover:bg-[#1a1a1b] border border-gray-200 hover:border-blue-500 dark:border-[#343536] dark:hover:border-gray-200 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-md outline-none transition-all text-sm text-left"
                >
                  Create Post
                </Link>
                <Link to={`/create-post?type=image&community=${community.id}`} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272729] rounded hover:text-blue-500 transition-colors">
                  <Image className="w-6 h-6" />
                </Link>
                <Link to={`/create-post?type=link&community=${community.id}`} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272729] rounded hover:text-blue-500 transition-colors">
                  <LinkIcon className="w-6 h-6" />
                </Link>
              </div>
            )}

            {postsLoading ? (
               <div className="space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="bg-white dark:bg-[#1a1a1b] h-32 rounded-md animate-pulse border border-gray-200 dark:border-[#343536]"></div>
               ))}
             </div>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536] text-gray-500">
                No posts in this community yet.
              </div>
            ) : (
              <div>
                {posts.map(post => (
                  <PostCard key={post.id} post={post} hideCommunity={true} />
                ))}
              </div>
            )}
          </div>

          {/* About Community Sidebar */}
          <div className="hidden lg:block w-[312px]">
            <div className="bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] rounded-md p-3">
              <h2 className="font-bold text-gray-500 dark:text-gray-400 text-sm mb-3">About Community</h2>
              <p className="text-sm text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">
                {community.description || 'Welcome to ' + community.display_name}
              </p>
              
              <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100 font-semibold">
                <Users className="w-5 h-5 text-gray-500" />
                <span>{memberCount}</span> <span className="font-normal text-sm text-gray-500">Members</span>
              </div>

              <div className="border-t border-gray-200 dark:border-[#343536] pt-4 mb-2 text-sm text-gray-500">
                Created {new Date(community.created_at).toLocaleDateString()}
              </div>

              {community.rules && (
                <div className="mt-4">
                  <h3 className="font-bold text-sm mb-2 text-gray-800 dark:text-gray-200">Rules</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{community.rules}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

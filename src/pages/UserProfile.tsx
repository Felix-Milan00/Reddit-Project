import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Profile, Post, Comment } from '../types';
import { PostCard } from '../components/feed/PostCard';
import { useAuthStore } from '../store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';
import { Settings } from 'lucide-react';

export function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const { user } = useAuthStore();

  const isOwnProfile = user && profile && user.id === profile.id;

  useEffect(() => {
    const fetchUserAndContent = async () => {
      setLoading(true);
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username || '')
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        if (profileData) {
          // Fetch user's posts
          const { data: postsData } = await supabase
            .from('posts')
            .select('*, author:profiles!posts_user_id_fkey(*), community:communities(*)')
            .eq('user_id', profileData.id)
            .order('created_at', { ascending: false });

          if (postsData) {
            let finalPosts = postsData as any[];
            if (user) {
              const { data: voteData } = await supabase
                .from('post_votes')
                .select('post_id, vote_type')
                .eq('user_id', user.id);
                
              if (voteData) {
                const voteMap = new Map(voteData.map(v => [v.post_id, v.vote_type]));
                finalPosts = finalPosts.map(p => ({ ...p, user_vote: voteMap.get(p.id) || 0 }));
              }
            }
            setPosts(finalPosts);
          }

          // Fetch user's comments
          const { data: commentsData } = await supabase
            .from('comments')
            .select('*, author:profiles!comments_user_id_fkey(*)')
            .eq('user_id', profileData.id)
            .order('created_at', { ascending: false });

          if (commentsData) {
            setComments(commentsData as any[]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndContent();
  }, [username, user]);

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center text-red-500 font-bold">User not found</div>;

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-full max-w-[640px]">
        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-[#343536]">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`pb-2 font-bold text-sm ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            POSTS
          </button>
          <button 
            onClick={() => setActiveTab('comments')}
            className={`pb-2 font-bold text-sm ${activeTab === 'comments' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            COMMENTS
          </button>
        </div>

        {/* Content */}
        {activeTab === 'posts' && (
          <div>
            {posts.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536] text-gray-500">
                hmm... u/{profile.username} hasn't posted anything
              </div>
            ) : (
              posts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536] text-gray-500">
                hmm... u/{profile.username} hasn't commented on anything
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536] p-4 text-sm">
                  <div className="text-gray-500 text-xs mb-2">
                    <span className="font-bold">{comment.author?.username}</span> commented {formatDistanceToNow(new Date(comment.created_at))} ago
                  </div>
                  <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{comment.content}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-[312px] ml-6">
        <div className="bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] rounded-md relative overflow-hidden">
          <div className="h-24 bg-blue-500"></div>
          <div className="p-4 pt-0">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-md border-4 border-white dark:border-[#1a1a1b] -mt-10 mb-2 overflow-hidden bg-white">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                  u/
                </div>
              )}
            </div>
            <h2 className="font-bold text-lg">{profile.display_name}</h2>
            <p className="text-sm text-gray-500 mb-4">u/{profile.username}</p>
            
            {profile.bio && <p className="text-sm mb-4">{profile.bio}</p>}

            <div className="flex justify-between text-sm mb-4 font-semibold text-gray-800 dark:text-gray-200">
              <div className="flex flex-col">
                <span>Karma</span>
                <span className="flex items-center gap-1 text-xs text-gray-500 font-normal"><span className="text-reddit-orange">✤</span> {profile.karma}</span>
              </div>
              <div className="flex flex-col">
                <span>Cake day</span>
                <span className="text-xs text-gray-500 font-normal">{new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {isOwnProfile && (
               <Link to="/settings/profile" className="flex items-center justify-center gap-2 w-full py-1.5 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-[#272729] font-bold text-sm transition-colors">
                  <Settings className="w-4 h-4" /> Edit Profile
               </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

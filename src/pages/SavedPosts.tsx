import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Post } from '../types';
import { PostCard } from '../components/feed/PostCard';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export function SavedPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchSavedPosts = async () => {
      setLoading(true);
      try {
        const { data: savedData, error: savedError } = await supabase
          .from('saved_posts')
          .select('post_id')
          .eq('user_id', user.id)
          .order('saved_at', { ascending: false });

        if (savedError) throw savedError;

        if (savedData && savedData.length > 0) {
          const postIds = savedData.map(s => s.post_id);
          
          const { data: postsData } = await supabase
            .from('posts')
            .select('*, author:profiles!posts_user_id_fkey(*), community:communities(*)')
            .in('id', postIds);

          if (postsData) {
            let finalPosts = postsData as any[];
            
            // Get user votes
            const { data: voteData } = await supabase
              .from('post_votes')
              .select('post_id, vote_type')
              .eq('user_id', user.id)
              .in('post_id', postIds);
              
            if (voteData) {
              const voteMap = new Map(voteData.map(v => [v.post_id, v.vote_type]));
              finalPosts = finalPosts.map(p => ({ ...p, user_vote: voteMap.get(p.id) || 0 }));
            }
            
            // Sort to match saved_at order
            const sortedPosts = postIds.map(id => finalPosts.find(p => p.id === id)).filter(Boolean);
            setPosts(sortedPosts);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user, navigate]);

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-full max-w-[640px]">
        <div className="border-b border-gray-200 dark:border-[#343536] pb-4 mb-6">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Saved Posts</h1>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading saved posts...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536] text-gray-500">
            You haven't saved any posts yet.
          </div>
        ) : (
          <div>
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      
      {/* Spacer for Right Sidebar */}
      <div className="hidden lg:block w-[312px] ml-6"></div>
    </div>
  );
}

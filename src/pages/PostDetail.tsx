import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Post } from '../types';
import { PostCard } from '../components/feed/PostCard';
import { CommentSection } from '../components/post/CommentSection';
import { useAuthStore } from '../store/useAuthStore';

export function PostDetail() {
  const { postId } = useParams<{ postId: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles!posts_user_id_fkey(*),
            community:communities(*)
          `)
          .eq('id', postId)
          .single();

        if (fetchError) throw fetchError;

        let finalData = data as any;

        if (user && finalData) {
          const { data: voteData } = await supabase
            .from('post_votes')
            .select('vote_type')
            .eq('user_id', user.id)
            .eq('post_id', postId)
            .single();

          if (voteData) {
            finalData.user_vote = voteData.vote_type;
          }
        }

        setPost(finalData);
      } catch (err: any) {
        setError('Post not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, user]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading post...</div>;
  }

  if (error || !post) {
    return <div className="p-8 text-center text-red-500 font-bold">{error || 'Post not found'}</div>;
  }

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-full max-w-[800px] bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536] p-4">
        {/* We reuse PostCard for the main post content display but with hideCommunity=false so it shows headers. 
            Alternatively, we could build a specific detailed view if we wanted to show more text. */}
        <PostCard post={post} />
        
        <div className="mt-6 border-t border-gray-200 dark:border-[#343536] pt-6">
          <CommentSection postId={post.id} />
        </div>
      </div>
      
      {/* Spacer for Right Sidebar when screen is large enough, or use Outlet layout */}
      <div className="hidden lg:block w-[312px] ml-6">
        <div className="bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] rounded-md p-3">
          <h2 className="font-bold text-gray-500 dark:text-gray-400 text-sm mb-3">About Community</h2>
          <p className="text-sm text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">
            {post.community?.description || `Welcome to r/${post.community?.name}`}
          </p>
        </div>
      </div>
    </div>
  );
}

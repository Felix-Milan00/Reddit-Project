import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import type { Comment } from '../../types';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuthStore();

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!comments_user_id_fkey(*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      let fetchedComments = data as any[];

      if (user && fetchedComments && fetchedComments.length > 0) {
        const commentIds = fetchedComments.map(c => c.id);
        const { data: voteData } = await supabase
          .from('comment_votes')
          .select('comment_id, vote_type')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);

        if (voteData) {
          const voteMap = new Map(voteData.map(v => [v.comment_id, v.vote_type]));
          fetchedComments = fetchedComments.map(c => ({
            ...c,
            user_vote: voteMap.get(c.id) || 0
          }));
        }
      }

      // Build tree
      const commentMap = new Map<string, Comment>();
      const topLevel: Comment[] = [];

      fetchedComments.forEach(c => {
        c.replies = [];
        commentMap.set(c.id, c as Comment);
      });

      fetchedComments.forEach(c => {
        if (c.parent_id && commentMap.has(c.parent_id)) {
          commentMap.get(c.parent_id)!.replies!.push(c as Comment);
        } else {
          topLevel.push(c as Comment);
        }
      });

      setComments(topLevel);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoading(false);
    }
  }, [postId, user]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
      });
      if (error) throw error;
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      {user ? (
        <div className="mb-6">
          <p className="text-sm mb-1 text-gray-800 dark:text-gray-200">Comment as <span className="font-semibold text-blue-500">{user.user_metadata?.username || user.email}</span></p>
          <div className="border border-gray-200 dark:border-[#343536] rounded-md overflow-hidden focus-within:border-gray-400 dark:focus-within:border-gray-500 transition-colors">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts?"
              rows={4}
              className="w-full p-3 bg-gray-50 dark:bg-[#1a1a1b] outline-none resize-y text-sm transition-colors"
            />
            <div className="bg-gray-100 dark:bg-[#272729] px-3 py-2 flex justify-end">
              <button 
                onClick={handleSubmit}
                disabled={!newComment.trim() || submitting}
                className="px-6 py-1 rounded-full text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between border border-gray-200 dark:border-[#343536] rounded-md p-4 mb-6 text-gray-500 dark:text-gray-400 font-semibold">
          <p>Log in or sign up to leave a comment</p>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">Log In</button>
            <button className="px-4 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">Sign Up</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 dark:bg-[#272729] rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-[#272729] rounded"></div>
        </div>
      ) : (
        <div>
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} postId={postId} onReplyAdded={fetchComments} />
          ))}
        </div>
      )}
    </div>
  );
}

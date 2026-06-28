import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { MessageSquare, MoreHorizontal } from 'lucide-react';
import type { Comment } from '../../types';
import { VoteButtons } from '../shared/VoteButtons';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onReplyAdded: () => void;
}

export function CommentItem({ comment, postId, onReplyAdded }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();

  const handleReply = async () => {
    if (!replyContent.trim() || !user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user.id,
        parent_id: comment.id,
        content: replyContent.trim(),
      });
      if (error) throw error;
      setReplyContent('');
      setIsReplying(false);
      onReplyAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col mt-4">
      {/* Comment Header */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
        {comment.author?.avatar_url ? (
           <img src={comment.author.avatar_url} className="w-6 h-6 rounded-full object-cover" />
        ) : (
           <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-white shrink-0">
             {comment.author?.username?.charAt(0).toUpperCase() || 'U'}
           </div>
        )}
        <Link to={`/user/${comment.author?.username}`} className="font-bold text-gray-900 dark:text-gray-100 hover:underline">
          {comment.author?.username || 'deleted'}
        </Link>
        <span>•</span>
        <span>{formatDistanceToNow(new Date(comment.created_at))} ago</span>
        <button onClick={() => setCollapsed(!collapsed)} className="ml-2 hover:bg-gray-200 dark:hover:bg-[#272729] px-1 rounded transition-colors">
          {collapsed ? '[+]' : '[-]'}
        </button>
      </div>

      {!collapsed && (
        <div className="flex">
          {/* Thread Line */}
          <div className="flex flex-col items-center mr-2 w-6">
            <div className="w-0.5 bg-gray-200 dark:bg-[#343536] hover:bg-blue-500 dark:hover:bg-blue-500 cursor-pointer h-full transition-colors mt-2" onClick={() => setCollapsed(true)}></div>
          </div>
          
          <div className="flex-1 pb-2">
            {/* Content */}
            <div className="text-sm text-gray-900 dark:text-gray-100 mb-2 whitespace-pre-wrap">
              {comment.content}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <VoteButtons itemId={comment.id} initialScore={comment.score} initialUserVote={comment.user_vote} type="comment" layout="horizontal" />
              {user && (
                <button 
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272729] px-2 py-1.5 rounded transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> Reply
                </button>
              )}
              <button className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272729] rounded transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Reply Box */}
            {isReplying && (
              <div className="mt-3 pl-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="What are your thoughts?"
                  rows={3}
                  className="w-full p-3 bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] rounded-md outline-none focus:ring-1 focus:ring-blue-500 resize-y text-sm transition-colors"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button 
                    onClick={() => setIsReplying(false)}
                    className="px-4 py-1 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleReply}
                    disabled={!replyContent.trim() || submitting}
                    className="px-4 py-1 rounded-full text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2">
                {comment.replies.map(reply => (
                  <CommentItem key={reply.id} comment={reply} postId={postId} onReplyAdded={onReplyAdded} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

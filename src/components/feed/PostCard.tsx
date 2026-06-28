import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Share, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '../../types';
import { VoteButtons } from '../shared/VoteButtons';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

interface PostCardProps {
  post: Post;
  hideCommunity?: boolean;
}

export function PostCard({ post, hideCommunity = false }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from('saved_posts')
        .select('*')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => setIsSaved(!!data));
    }
  }, [user, post.id]);

  const handleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isSaved) {
      setIsSaved(false);
      await supabase.from('saved_posts').delete().eq('post_id', post.id).eq('user_id', user.id);
    } else {
      setIsSaved(true);
      await supabase.from('saved_posts').insert({ post_id: post.id, user_id: user.id });
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] rounded-md hover:border-gray-300 dark:hover:border-gray-500 transition-colors mb-4 flex cursor-pointer overflow-hidden">
      {/* Vote Area - Left */}
      <div className="hidden sm:flex bg-gray-50 dark:bg-[#1a1a1b] border-r border-transparent">
        <VoteButtons 
          itemId={post.id} 
          initialScore={post.score} 
          initialUserVote={post.user_vote} 
          type="post" 
          layout="vertical" 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-2 sm:p-2 pt-2">
        {/* Header */}
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2 pl-2">
          {!hideCommunity && post.community && (
            <>
              {post.community.avatar_url ? (
                <img src={post.community.avatar_url} alt="" className="w-5 h-5 rounded-full mr-1 object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-500 mr-1 flex items-center justify-center text-white text-[10px]">r/</div>
              )}
              <Link to={`/r/${post.community.name}`} className="font-bold text-gray-900 dark:text-gray-100 hover:underline">
                r/{post.community.name}
              </Link>
              <span className="mx-1">•</span>
            </>
          )}
          <span>Posted by</span>
          <Link to={`/user/${post.author?.username}`} className="hover:underline">
            u/{post.author?.username || 'deleted'}
          </Link>
          <span className="mx-1">{timeAgo}</span>
        </div>

        {/* Title */}
        <div className="pl-2 pr-4 mb-2">
          <Link to={`/r/${post.community?.name || 'unknown'}/comments/${post.id}`}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{post.title}</h2>
          </Link>
        </div>

        {/* Content Area */}
        <div className="mb-2">
          {post.type === 'text' && post.content && (
            <div className="px-2 text-sm text-gray-800 dark:text-gray-200 line-clamp-4 relative">
               {/* Extremely basic markdown/HTML render or just raw text. For this clone we'll just use raw text */}
               <p className="whitespace-pre-wrap">{post.content}</p>
               <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white dark:from-[#1a1a1b] to-transparent"></div>
            </div>
          )}
          {post.type === 'image' && post.image_url && (
            <div className="mt-2 flex justify-center bg-black/5 dark:bg-black/20 max-h-[512px] overflow-hidden">
              <img src={post.image_url} alt={post.title} className="object-contain max-h-[512px]" />
            </div>
          )}
          {post.type === 'link' && post.link_url && (
             <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="block px-2 mt-2 text-blue-500 hover:underline break-all text-sm">
                {post.link_url}
             </a>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-1 mt-2 text-gray-500 dark:text-gray-400 font-bold text-xs">
          <div className="flex sm:hidden mr-2">
             <VoteButtons 
               itemId={post.id} 
               initialScore={post.score} 
               initialUserVote={post.user_vote} 
               type="post" 
               layout="horizontal" 
             />
          </div>
          <Link 
            to={`/r/${post.community?.name || 'unknown'}/comments/${post.id}`}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-[#272729] rounded"
          >
            <MessageSquare className="w-5 h-5" />
            {post.comment_count} Comments
          </Link>
          <button className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-[#272729] rounded">
            <Share className="w-5 h-5" />
            Share
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); handleSave(); }}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-[#272729] rounded"
          >
            <Bookmark className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

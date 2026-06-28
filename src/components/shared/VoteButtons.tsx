import { useState } from 'react';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface VoteButtonsProps {
  itemId: string;
  initialScore: number;
  initialUserVote?: number;
  type: 'post' | 'comment';
  layout?: 'vertical' | 'horizontal';
}

export function VoteButtons({ itemId, initialScore, initialUserVote = 0, type, layout = 'vertical' }: VoteButtonsProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [loading, setLoading] = useState(false);

  const handleVote = async (newVoteValue: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (loading) return;

    // If clicking the same vote, we remove the vote
    const finalVoteValue = userVote === newVoteValue ? 0 : newVoteValue;
    const scoreDiff = finalVoteValue - userVote;

    // Optimistic update
    setScore(score + scoreDiff);
    setUserVote(finalVoteValue);
    setLoading(true);

    try {
      const table = type === 'post' ? 'post_votes' : 'comment_votes';
      const idColumn = type === 'post' ? 'post_id' : 'comment_id';

      if (finalVoteValue === 0) {
        // Remove vote
        await supabase
          .from(table)
          .delete()
          .eq('user_id', user.id)
          .eq(idColumn, itemId);
      } else {
        // Upsert vote
        await supabase
          .from(table)
          .upsert({
            user_id: user.id,
            [idColumn]: itemId,
            vote_type: finalVoteValue,
          }, { onConflict: `user_id,${idColumn}` });
      }
    } catch (error) {
      // Revert on error
      console.error('Vote failed', error);
      setScore(score);
      setUserVote(userVote);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "flex items-center rounded-md",
      layout === 'vertical' ? "flex-col p-2 bg-gray-50 dark:bg-[#1a1a1b] w-10 gap-1" : "flex-row gap-1"
    )}>
      <button 
        onClick={(e) => { e.preventDefault(); handleVote(1); }}
        className={cn(
          "p-1 rounded hover:bg-gray-200 dark:hover:bg-[#272729] transition-colors",
          userVote === 1 ? "text-reddit-orange" : "text-gray-400 hover:text-reddit-orange"
        )}
      >
        <ArrowBigUp className="w-5 h-5 md:w-6 md:h-6" fill={userVote === 1 ? "currentColor" : "none"} />
      </button>
      
      <span className={cn(
        "text-xs md:text-sm font-bold",
        userVote === 1 ? "text-reddit-orange" : userVote === -1 ? "text-blue-500" : "text-gray-800 dark:text-gray-200"
      )}>
        {score}
      </span>
      
      <button 
        onClick={(e) => { e.preventDefault(); handleVote(-1); }}
        className={cn(
          "p-1 rounded hover:bg-gray-200 dark:hover:bg-[#272729] transition-colors",
          userVote === -1 ? "text-blue-500" : "text-gray-400 hover:text-blue-500"
        )}
      >
        <ArrowBigDown className="w-5 h-5 md:w-6 md:h-6" fill={userVote === -1 ? "currentColor" : "none"} />
      </button>
    </div>
  );
}

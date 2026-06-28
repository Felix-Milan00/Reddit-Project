import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Post } from '../types';
import { useAuthStore } from '../store/useAuthStore';

export function usePosts(communityId?: string, sortBy: 'hot' | 'top' | 'new' = 'new') {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_user_id_fkey(*),
          community:communities(*)
        `);

      if (sortBy === 'new') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'top') {
        query = query.order('score', { ascending: false }).order('created_at', { ascending: false });
      }

      if (communityId) {
        query = query.eq('community_id', communityId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      let finalData = data as any[];

      // If user is logged in, fetch their votes for these posts
      if (user && finalData && finalData.length > 0) {
        const postIds = finalData.map(p => p.id);
        const { data: voteData } = await supabase
          .from('post_votes')
          .select('post_id, vote_type')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        if (voteData) {
          const voteMap = new Map(voteData.map(v => [v.post_id, v.vote_type]));
          finalData = finalData.map(p => ({
            ...p,
            user_vote: voteMap.get(p.id) || 0
          }));
        }
      }

      if (sortBy === 'hot') {
        finalData.sort((a, b) => {
          const scoreA = a.score + (a.comment_count * 2);
          const scoreB = b.score + (b.comment_count * 2);
          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      }

      setPosts(finalData || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [communityId, user, sortBy]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}

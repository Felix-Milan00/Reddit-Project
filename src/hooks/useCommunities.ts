import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Community } from '../types';
import { useAuthStore } from '../store/useAuthStore';

export function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const [userJoinedCommunities, setUserJoinedCommunities] = useState<Set<string>>(new Set());

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('communities')
        .select(`
          *,
          members:community_members(count),
          posts(count)
        `);

      if (fetchError) throw fetchError;

      const formattedData = (data || []).map((c: any) => ({
        ...c,
        member_count: c.members?.[0]?.count || 0,
        post_count: c.posts?.[0]?.count || 0
      }));

      setCommunities(formattedData);

      if (user) {
        const { data: memberData } = await supabase
          .from('community_members')
          .select('community_id')
          .eq('user_id', user.id);
        
        if (memberData) {
          setUserJoinedCommunities(new Set(memberData.map(m => m.community_id)));
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const toggleJoin = async (communityId: string) => {
    if (!user) return;
    
    const isJoined = userJoinedCommunities.has(communityId);
    
    try {
      if (isJoined) {
        await supabase
          .from('community_members')
          .delete()
          .eq('community_id', communityId)
          .eq('user_id', user.id);
          
        setUserJoinedCommunities(prev => {
          const next = new Set(prev);
          next.delete(communityId);
          return next;
        });
        
        setCommunities(prev => prev.map(c => 
          c.id === communityId ? { ...c, member_count: Math.max(0, (c.member_count || 0) - 1) } : c
        ));
      } else {
        await supabase
          .from('community_members')
          .insert({ community_id: communityId, user_id: user.id });
          
        setUserJoinedCommunities(prev => {
          const next = new Set(prev);
          next.add(communityId);
          return next;
        });
        
        setCommunities(prev => prev.map(c => 
          c.id === communityId ? { ...c, member_count: (c.member_count || 0) + 1 } : c
        ));
      }
    } catch (err) {
      console.error('Error toggling join status:', err);
    }
  };

  return { communities, loading, error, userJoinedCommunities, toggleJoin, refetch: fetchCommunities };
}

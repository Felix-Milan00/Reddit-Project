import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  content: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  subscribe: (userId: string) => void;
  unsubscribe: () => void;
}

let subscription: any = null;

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      set({
        notifications: data,
        unreadCount: data.filter(n => !n.read).length
      });
    }
  },
  markAsRead: async (notificationId) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
    set((state) => ({
      notifications: state.notifications.map(n => n.id === notificationId ? { ...n, read: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
  },
  markAllAsRead: async (userId) => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }));
  },
  subscribe: (userId) => {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
    
    subscription = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          set((state) => ({
            notifications: [payload.new as Notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
          }));
        }
      )
      .subscribe();
  },
  unsubscribe: () => {
    if (subscription) {
      supabase.removeChannel(subscription);
      subscription = null;
    }
  }
}));

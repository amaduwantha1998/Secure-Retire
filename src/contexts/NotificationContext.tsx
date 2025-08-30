import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationStore, Notification } from '@/stores/notificationStore';
import { logError } from '@/utils/sentry';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    notifications,
    unreadCount,
    setNotifications,
    addNotification,
    markAsRead: markAsReadInStore,
    markAllAsRead: markAllAsReadInStore,
    clearAll: clearAllInStore,
  } = useNotificationStore();

  // Fetch notifications from Supabase
  const refreshNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setNotifications(data as Notification[]);
      }
    } catch (error) {
      logError(error as Error, { context: 'refreshNotifications' });
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      markAsReadInStore(id);
    } catch (error) {
      logError(error as Error, { context: 'markAsRead' });
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      markAllAsReadInStore();
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      logError(error as Error, { context: 'markAllAsRead' });
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      clearAllInStore();
      toast({
        title: 'Success',
        description: 'All notifications cleared',
      });
    } catch (error) {
      logError(error as Error, { context: 'clearAll' });
      toast({
        title: 'Error',
        description: 'Failed to clear notifications',
        variant: 'destructive',
      });
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    refreshNotifications();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New notification received:', payload);
          addNotification(payload.new as Notification);
          toast({
            title: payload.new.title,
            description: payload.new.message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification updated:', payload);
          refreshNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification deleted:', payload);
          refreshNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Polling fallback every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
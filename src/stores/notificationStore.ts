import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  link?: string;
  created_at: string;
  updated_at: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isDropdownOpen: boolean;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  setDropdownOpen: (open: boolean) => void;
  updateUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isDropdownOpen: false,
      setNotifications: (notifications) => {
        set({ notifications });
        get().updateUnreadCount();
      },
      addNotification: (notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
        get().updateUnreadCount();
      },
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          ),
        }));
        get().updateUnreadCount();
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        }));
        get().updateUnreadCount();
      },
      clearAll: () => {
        set({ notifications: [] });
        get().updateUnreadCount();
      },
      setDropdownOpen: (open) => {
        set({ isDropdownOpen: open });
      },
      updateUnreadCount: () => {
        const unreadCount = get().notifications.filter((n) => !n.read).length;
        set({ unreadCount });
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
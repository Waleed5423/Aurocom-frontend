import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api';
import { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: (params?: any) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  
  // Real-time actions
  handleNewNotification: (notification: Notification) => void;
  handleNotificationRead: (notificationId: string) => void;
  
  // Utility
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      fetchNotifications: async (params?: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getNotifications(params);
          if (response.success) {
            set({
              notifications: response.data.notifications,
              unreadCount: response.data.unreadCount,
              isLoading: false,
            });
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch notifications',
          });
        }
      },

      markAsRead: async (notificationId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.markNotificationAsRead(notificationId);
          if (response.success) {
            const { notifications } = get();
            const updatedNotifications = notifications.map(notification =>
              notification._id === notificationId
                ? { ...notification, read: true, readAt: new Date().toISOString() }
                : notification
            );
            
            const unreadCount = updatedNotifications.filter(n => !n.read).length;
            
            set({
              notifications: updatedNotifications,
              unreadCount,
              isLoading: false,
            });
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to mark notification as read',
          });
        }
      },

      markAllAsRead: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.markAllNotificationsAsRead();
          if (response.success) {
            const { notifications } = get();
            const updatedNotifications = notifications.map(notification => ({
              ...notification,
              read: true,
              readAt: new Date().toISOString(),
            }));
            
            set({
              notifications: updatedNotifications,
              unreadCount: 0,
              isLoading: false,
            });
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to mark all notifications as read',
          });
        }
      },

      deleteNotification: async (notificationId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.deleteNotification(notificationId);
          if (response.success) {
            const { notifications } = get();
            const updatedNotifications = notifications.filter(
              notification => notification._id !== notificationId
            );
            
            const unreadCount = updatedNotifications.filter(n => !n.read).length;
            
            set({
              notifications: updatedNotifications,
              unreadCount,
              isLoading: false,
            });
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to delete notification',
          });
        }
      },

      clearAllNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.clearAllNotifications();
          if (response.success) {
            set({
              notifications: [],
              unreadCount: 0,
              isLoading: false,
            });
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to clear notifications',
          });
        }
      },

      addNotification: (notification: Notification) => {
        const { notifications } = get();
        const updatedNotifications = [notification, ...notifications];
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        
        set({
          notifications: updatedNotifications,
          unreadCount,
        });
      },

      // Real-time handlers
      handleNewNotification: (notification: Notification) => {
        get().addNotification(notification);
      },

      handleNotificationRead: (notificationId: string) => {
        const { notifications } = get();
        const updatedNotifications = notifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        );
        
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        
        set({
          notifications: updatedNotifications,
          unreadCount,
        });
      },

      clearError: () => {
        set({ error: null });
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
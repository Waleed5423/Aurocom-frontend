import { useEffect, useRef } from 'react';
import { socketService } from '@/lib/socket';
import { useAuth } from './useAuth';
import { useNotificationStore } from '@/store/useNotificationStore';

export const useSocket = () => {
    const { user, isAuthenticated } = useAuth();
    const notificationStore = useNotificationStore();
    const isInitialized = useRef(false);

    useEffect(() => {
        if (isAuthenticated && user && !isInitialized.current) {
            // Initialize socket connection
            socketService.joinUserRoom(user._id);
            isInitialized.current = true;
        }

        return () => {
            // Don't disconnect on unmount to maintain connection
        };
    }, [isAuthenticated, user]);

    return {
        isConnected: socketService.getConnectionStatus(),
        socket: socketService.getSocket(),
        socketService
    };
};

// Hook for real-time notifications
export const useSocketNotifications = () => {
    const notificationStore = useNotificationStore();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // Handle new notifications
        const handleNewNotification = (notification: any) => {
            notificationStore.handleNewNotification(notification);
        };

        // Handle notification read events
        const handleNotificationRead = (data: any) => {
            notificationStore.handleNotificationRead(data.notificationId);
        };

        // Handle all notifications read
        const handleAllNotificationsRead = () => {
            notificationStore.markAllAsRead();
        };

        // Set up event listeners
        socketService.onNewNotification(handleNewNotification);
        socketService.onNotificationRead(handleNotificationRead);
        socketService.onAllNotificationsRead(handleAllNotificationsRead);

        // Clean up
        return () => {
            socketService.offNewNotification(handleNewNotification);
            socketService.offNotificationRead(handleNotificationRead);
            socketService.offAllNotificationsRead(handleAllNotificationsRead);
        };
    }, [user, notificationStore]);

    return {
        // You can return any notification-related methods if needed
    };
};

// Hook for order updates
export const useSocketOrders = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const handleOrderStatusUpdate = (data: any) => {
            // You can update your local order state here
            console.log('Order status updated:', data);
            // Implement order state update logic based on your needs
        };

        const handleOrderCreated = (data: any) => {
            console.log('New order created:', data);
            // Handle new order creation
        };

        socketService.onOrderStatusUpdate(handleOrderStatusUpdate);
        socketService.onOrderCreated(handleOrderCreated);

        return () => {
            socketService.offOrderStatusUpdate(handleOrderStatusUpdate);
            socketService.offOrderCreated(handleOrderCreated);
        };
    }, [user]);

    return {
        // Order-related methods can be added here
    };
};
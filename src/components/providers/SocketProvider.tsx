'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { socketService } from '@/lib/socket';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/useNotificationStore';

interface SocketContextType {
    isConnected: boolean;
    socket: any;
}

const SocketContext = createContext<SocketContextType>({
    isConnected: false,
    socket: null
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const notificationStore = useNotificationStore();

    useEffect(() => {
        if (isAuthenticated && user) {
            // Socket connection is automatically managed by socketService
            socketService.joinUserRoom(user._id);
        }

        return () => {
            // Don't disconnect on unmount to maintain connection across route changes
        };
    }, [isAuthenticated, user]);

    // Set up notification listeners
    useEffect(() => {
        if (!user) return;

        const handleNewNotification = (notification: any) => {
            notificationStore.handleNewNotification(notification);
        };

        socketService.onNewNotification(handleNewNotification);

        return () => {
            socketService.offNewNotification(handleNewNotification);
        };
    }, [user, notificationStore]);

    const value = {
        isConnected: socketService.getConnectionStatus(),
        socket: socketService.getSocket()
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
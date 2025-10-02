import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth';

class SocketService {
    private socket: Socket | null = null;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    constructor() {
        this.initializeSocket();
    }

    private initializeSocket() {
        if (typeof window === 'undefined') return;

        const token = AuthService.getToken();

        // Use the correct socket.io server URL
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ||
            process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
            'http://localhost:5000';

        console.log('Connecting to socket:', socketUrl);

        this.socket = io(socketUrl, {
            auth: token ? { token } : undefined,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            timeout: 20000,
        });

        this.setupEventListeners();
    }

    private setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;

            // Join user room if authenticated
            const userData = AuthService.getUserData();
            if (userData?.id) {
                this.joinUserRoom(userData.id);
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
        });

        this.socket.on('reconnect_attempt', (attempt) => {
            this.reconnectAttempts = attempt;
            console.log(`Socket reconnection attempt: ${attempt}`);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('Socket reconnection failed');
            this.isConnected = false;
        });
    }

    // Join user-specific room for private notifications
    joinUserRoom(userId: string) {
        if (this.socket && this.isConnected) {
            this.socket.emit('joinUser', userId);
        }
    }

    // Order events
    onOrderStatusUpdate(callback: (data: any) => void) {
        this.socket?.on('orderStatusChanged', callback);
    }

    offOrderStatusUpdate(callback: (data: any) => void) {
        this.socket?.off('orderStatusChanged', callback);
    }

    onOrderCreated(callback: (data: any) => void) {
        this.socket?.on('orderCreated', callback);
    }

    offOrderCreated(callback: (data: any) => void) {
        this.socket?.off('orderCreated', callback);
    }

    // Payment events
    onPaymentConfirmed(callback: (data: any) => void) {
        this.socket?.on('paymentConfirmed', callback);
    }

    offPaymentConfirmed(callback: (data: any) => void) {
        this.socket?.off('paymentConfirmed', callback);
    }

    // Notification events
    onNewNotification(callback: (data: any) => void) {
        this.socket?.on('newNotification', callback);
    }

    offNewNotification(callback: (data: any) => void) {
        this.socket?.off('newNotification', callback);
    }

    onNotificationRead(callback: (data: any) => void) {
        this.socket?.on('notificationRead', callback);
    }

    offNotificationRead(callback: (data: any) => void) {
        this.socket?.off('notificationRead', callback);
    }

    onAllNotificationsRead(callback: () => void) {
        this.socket?.on('allNotificationsRead', callback);
    }

    offAllNotificationsRead(callback: () => void) {
        this.socket?.off('allNotificationsRead', callback);
    }

    // Admin events
    onNewOrder(callback: (data: any) => void) {
        this.socket?.on('newOrder', callback);
    }

    offNewOrder(callback: (data: any) => void) {
        this.socket?.off('newOrder', callback);
    }

    // Mark notification as read via socket
    markNotificationRead(notificationId: string) {
        this.socket?.emit('markNotificationRead', notificationId);
    }

    // Get connection status
    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    // Get socket instance
    getSocket(): Socket | null {
        return this.socket;
    }

    // Disconnect socket
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Reconnect socket
    reconnect() {
        this.disconnect();
        this.initializeSocket();
    }

    // Update auth token and reconnect
    updateAuthToken() {
        const token = AuthService.getToken();
        if (this.socket && token) {
            this.socket.auth = { token };
            this.reconnect();
        }
    }
}

export const socketService = new SocketService();
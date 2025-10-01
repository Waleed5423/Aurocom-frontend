'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const auth = useAuth();

    useEffect(() => {
        // Check authentication status on mount
        auth.checkAuth();
    }, []);

    const value = {
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        user: auth.user,
        login: auth.login,
        register: auth.register,
        logout: auth.logout,
        checkAuth: auth.checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
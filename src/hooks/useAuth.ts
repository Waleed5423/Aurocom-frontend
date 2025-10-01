import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { User, LoginFormData, RegisterFormData } from '@/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginFormData) => Promise<void>;
    register: (userData: RegisterFormData) => Promise<void>;
    logout: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
    updateProfile: (profileData: Partial<User>) => Promise<void>;
    clearError: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials: LoginFormData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await AuthService.login(credentials.email, credentials.password);

                    if (response.success) {
                        const authUser = response.data.user;

                        // Store auth user data
                        AuthService.setUserData(authUser);

                        // Fetch full user profile
                        const profileResponse = await apiClient.getProfile();
                        if (profileResponse.success) {
                            set({
                                user: profileResponse.data.user,
                                isAuthenticated: true,
                                isLoading: false,
                                error: null,
                            });
                        } else {
                            throw new Error('Failed to fetch user profile');
                        }
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Login failed',
                    });
                    throw error;
                }
            },

            register: async (userData: RegisterFormData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await AuthService.register(userData);

                    if (response.success) {
                        const authUser = response.data.user;
                        AuthService.setUserData(authUser);

                        // Fetch full user profile
                        const profileResponse = await apiClient.getProfile();
                        if (profileResponse.success) {
                            set({
                                user: profileResponse.data.user,
                                isAuthenticated: true,
                                isLoading: false,
                                error: null,
                            });
                        } else {
                            throw new Error('Failed to fetch user profile');
                        }
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Registration failed',
                    });
                    throw error;
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await AuthService.logout();
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: any) {
                    // Clear local state even if API call fails
                    AuthService.clearTokens();
                    AuthService.clearUserData();
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                }
            },

            forgotPassword: async (email: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await AuthService.forgotPassword(email);
                    if (!response.success) {
                        throw new Error(response.message);
                    }
                    set({ isLoading: false });
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Password reset failed',
                    });
                    throw error;
                }
            },

            resetPassword: async (token: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await AuthService.resetPassword(token, password);
                    if (!response.success) {
                        throw new Error(response.message);
                    }
                    set({ isLoading: false });
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Password reset failed',
                    });
                    throw error;
                }
            },

            updateProfile: async (profileData: Partial<User>) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.updateProfile(profileData);

                    if (response.success) {
                        const currentUser = get().user;
                        set({
                            user: { ...currentUser, ...profileData } as User,
                            isLoading: false,
                            error: null,
                        });
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Profile update failed',
                    });
                    throw error;
                }
            },

            clearError: () => {
                set({ error: null });
            },

            checkAuth: async () => {
                if (!AuthService.isAuthenticated()) {
                    set({ isAuthenticated: false, user: null });
                    return;
                }

                set({ isLoading: true });
                try {
                    const response = await AuthService.getProfile();

                    if (response.success) {
                        set({
                            user: response.data.user,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    } else {
                        throw new Error('Authentication failed');
                    }
                } catch (error: any) {
                    AuthService.clearTokens();
                    AuthService.clearUserData();
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Authentication check failed',
                    });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// Custom hook for auth status
export const useAuthStatus = () => {
    const { isAuthenticated, isLoading, user } = useAuth();

    return {
        isAuthenticated,
        isLoading,
        user,
        isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
        isSuperAdmin: user?.role === 'super_admin',
    };
};
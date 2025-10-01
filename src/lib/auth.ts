import { apiClient } from './api';

export class AuthService {
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('accessToken');
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  static setTokens(token: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  static async login(email: string, password: string) {
    return await apiClient.login(email, password);
  }

  static async register(userData: any) {
    return await apiClient.register(userData);
  }

  static async logout(): Promise<void> {
    await apiClient.logout();
  }

  static async forgotPassword(email: string) {
    return await apiClient.forgotPassword(email);
  }

  static async resetPassword(token: string, password: string) {
    return await apiClient.resetPassword(token, password);
  }

  static async getProfile() {
    return await apiClient.getProfile();
  }

  static getUserRole(): string | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.role || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  static isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'admin' || role === 'super_admin';
  }

  static isSuperAdmin(): boolean {
    return this.getUserRole() === 'super_admin';
  }

  static setUserData(userData: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  static getUserData(): any {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  static clearUserData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('userData');
  }
}
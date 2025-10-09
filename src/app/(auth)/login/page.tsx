// src/app/(auth)/login/page.tsx - UPDATED
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error, isAuthenticated, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');

    // Redirect based on user role after authentication
    useEffect(() => {
        if (isAuthenticated && user) {
            const redirectPath = redirect ||
                (user.role === 'customer' ? '/shop/products' : '/admin/adashboard');
            router.push(redirectPath);
        }
    }, [isAuthenticated, user, router, redirect]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your account to continue shopping"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <Card className="bg-red-50 border-red-200">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2 text-red-800">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                            Remember me
                        </label>
                    </div>

                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                        Forgot password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 text-base font-medium"
                >
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Signing in...</span>
                        </div>
                    ) : (
                        'Sign in'
                    )}
                </Button>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            href="/register"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </form>

            {/* Demo Accounts Hint */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Demo Accounts</h4>
                    <div className="text-xs text-blue-700 space-y-1">
                        <p><strong>Admin:</strong> admin@example.com / password</p>
                        <p><strong>Customer:</strong> customer@example.com / password</p>
                    </div>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
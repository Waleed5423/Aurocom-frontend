// src/app/(auth)/register/page.tsx - UPDATED
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { register, isLoading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(formData);
            setShowSuccess(true);
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    if (showSuccess) {
        return (
            <AuthLayout
                title="Verify your email"
                subtitle="We've sent a verification link to your email address"
            >
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                            Check Your Email
                        </h3>
                        <p className="text-green-700 mb-4">
                            We've sent a verification link to <strong>{formData.email}</strong>.
                            Please check your inbox and click the link to verify your account.
                        </p>
                        <div className="space-y-3 text-sm text-green-600">
                            <p>📧 Check your spam folder if you don't see the email</p>
                            <p>⏱️ The link expires in 24 hours</p>
                        </div>
                        <Button
                            onClick={() => setShowSuccess(false)}
                            variant="outline"
                            className="mt-4 w-full"
                        >
                            Back to Registration
                        </Button>
                    </CardContent>
                </Card>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Join thousands of happy customers"
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
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number (Optional)
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                className="pl-10"
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
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                className="pl-10 pr-10"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Password must be at least 6 characters long
                        </p>
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                        I agree to the{' '}
                        <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                            Privacy Policy
                        </Link>
                    </label>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 text-base font-medium"
                >
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Creating account...</span>
                        </div>
                    ) : (
                        'Create Account'
                    )}
                </Button>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
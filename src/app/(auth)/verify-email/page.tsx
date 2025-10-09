// src/app/(auth)/verify-email/page.tsx - UPDATED
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification token');
                return;
            }

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                const data = await response.json();

                if (data.success) {
                    setStatus('success');
                    setMessage('Email verified successfully! You can now login.');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Email verification failed');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Email verification failed. Please try again.');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <AuthLayout
            title="Verify your email"
            subtitle="We're confirming your email address"
        >
            <Card className="text-center">
                <CardContent className="p-6">
                    {status === 'loading' && (
                        <div className="py-8">
                            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Verifying your email...
                            </h3>
                            <p className="text-gray-600">
                                Please wait while we confirm your email address.
                            </p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-6">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-green-800 mb-2">
                                Email Verified!
                            </h3>
                            <p className="text-green-700 mb-6">
                                {message}
                            </p>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push('/login')}
                                    className="w-full"
                                >
                                    Continue to Login
                                </Button>
                                <Link href="/">
                                    <Button variant="outline" className="w-full">
                                        Go to Homepage
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="py-6">
                            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-red-800 mb-2">
                                Verification Failed
                            </h3>
                            <p className="text-red-700 mb-4">
                                {message}
                            </p>
                            <div className="space-y-3">
                                <Link href="/login">
                                    <Button className="w-full">
                                        Go to Login
                                    </Button>
                                </Link>
                                <div className="text-sm text-gray-600">
                                    <p className="flex items-center justify-center">
                                        <Mail className="h-4 w-4 mr-1" />
                                        Need help? Contact support
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/verify-email?token=${token}`,
                    {
                        method: 'POST',
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
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Email Verification</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    {status === 'loading' && (
                        <div>
                            <p>Verifying your email...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div>
                            <p className="text-green-600 mb-4">{message}</p>
                            <Button onClick={() => router.push('/login')}>
                                Go to Login
                            </Button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div>
                            <p className="text-red-600 mb-4">{message}</p>
                            <Button onClick={() => router.push('/login')}>
                                Go to Login
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });
    const { register, isLoading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(formData);
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

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Register</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Input
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Input
                                name="email"
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Input
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Input
                                name="phone"
                                placeholder="Phone (Optional)"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
// src/components/auth/AuthLayout.tsx
'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex">
            {/* Left Side - Blue Background */}
            <div className="hidden lg:flex lg:flex-1 bg-blue-600 text-white">
                <div className="flex flex-col justify-center items-center w-full px-12">
                    {/* Logo */}
                    <div className="text-center mb-12">
                        <Link href="/" className="flex items-center justify-center space-x-3 mb-8">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-xl">A</span>
                            </div>
                            <span className="text-2xl font-bold">Aurocom</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 bg-gray-100">
                <div className="mx-auto w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="flex items-center justify-center space-x-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">Aurocom</span>
                        </Link>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-xl">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                            {subtitle && (
                                <p className="mt-2 text-gray-600">{subtitle}</p>
                            )}
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
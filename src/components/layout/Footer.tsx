// src/components/layout/Footer.tsx - UPDATED
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Phone,
    Mail,
    Package,
    Facebook,
    Twitter,
    Instagram,
    MapPin
} from 'lucide-react';

export default function Footer() {
    const pathname = usePathname();

    // Don't show footer on auth pages
    if (pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/reset-password') ||
        pathname.startsWith('/verify-email') ||
        pathname.startsWith('/admin/adashboard') ||
        pathname.startsWith('/admin/aproducts') ||
        pathname.startsWith('/admin/acategories') ||
        pathname.startsWith('/admin/aorders') ||
        pathname.startsWith('/admin/ausers') ||
        pathname.startsWith('/admin/areviews') ||
        pathname.startsWith('/admin/atransactions') ||
        pathname.startsWith('/admin/acoupons')) {
        return null;
    }

    return (
        <footer className="bg-gray-900 text-white">
            {/* ... rest of the existing footer code remains the same ... */}
            {/* Newsletter Section */}
            {/* <div className="bg-blue-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
                            <p className="text-blue-100">
                                Subscribe to our newsletter for the latest products, offers, and updates.
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white border-0 text-gray-900 flex-1"
                            />
                            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* Main Footer */}
            <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <span className="text-xl font-bold">Aurocom</span>
                        </Link>
                        <p className="text-gray-400 mb-4">
                            Your one-stop shop for quality products. We're committed to providing the best shopping experience with fast delivery and excellent customer service.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/shop/products" className="text-gray-400 hover:text-white transition-colors">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop/categories" className="text-gray-400 hover:text-white transition-colors">
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns" className="text-gray-400 hover:text-white transition-colors">
                                    Returns & Refunds
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/size-guide" className="text-gray-400 hover:text-white transition-colors">
                                    Size Guide
                                </Link>
                            </li>
                            <li>
                                <Link href="/track-order" className="text-gray-400 hover:text-white transition-colors">
                                    Track Order
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <MapPin className="h-5 w-5 text-blue-400" />
                                <span className="text-gray-400">123 Commerce St, City, State 12345</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="h-5 w-5 text-blue-400" />
                                <span className="text-gray-400">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-blue-400" />
                                <span className="text-gray-400">support@aurocom.com</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Package className="h-5 w-5 text-blue-400" />
                                <span className="text-gray-400">Mon-Fri: 9AM-6PM EST</span>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="mt-6">
                            <h4 className="font-medium mb-2">We Accept</h4>
                            <div className="flex space-x-2">
                                <div className="bg-white rounded p-1">
                                    <span className="text-xs font-bold text-gray-800">VISA</span>
                                </div>
                                <div className="bg-white rounded p-1">
                                    <span className="text-xs font-bold text-gray-800">MC</span>
                                </div>
                                <div className="bg-white rounded p-1">
                                    <span className="text-xs font-bold text-gray-800">AMEX</span>
                                </div>
                                <div className="bg-white rounded p-1">
                                    <span className="text-xs font-bold text-gray-800">PP</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm">
                        © 2024 Aurocom. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
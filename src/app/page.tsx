"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Aurocom</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your one-stop shop for all your needs
        </p>

        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/products">Shop Now</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Featured Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Discover our latest and most popular products</p>
              <Button className="mt-4" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Explore products by category</p>
              <Button className="mt-4" asChild>
                <Link href="/categories">View Categories</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Special Offers</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Check out our current deals and discounts</p>
              <Button className="mt-4" asChild>
                <Link href="/products?featured=true">View Offers</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/register">Create Account</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="mt-16 text-center text-gray-500">
        <p>&copy; 2024 Aurocom. All rights reserved.</p>
      </footer>
    </div>
  );
}
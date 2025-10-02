"use client";
import { SocketProvider } from '@/components/providers/SocketProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import './globals.css'  

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
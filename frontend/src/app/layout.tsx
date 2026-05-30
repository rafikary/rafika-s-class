import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Miss Rafika\'s Learning Center',
  description: 'Platform manajemen les private modern untuk anak SD',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-x-hidden">
          {/* Decorative background patterns - Hidden on mobile for performance */}
          <div className="hidden md:block absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          
          <Sidebar />
          <main className="flex-1 w-full lg:ml-72 pt-safe-plus-mobile-header relative z-10 overflow-x-hidden">
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

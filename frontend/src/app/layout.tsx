import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Les Private Admin',
  description: 'Web App untuk manajemen les private anak SD',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-y-auto lg:ml-64 pt-16 lg:pt-0">
            <div className="container mx-auto p-6 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, FileText, DollarSign, Menu, X, GraduationCap, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, exact: false },
  { name: 'Data Siswa', href: '/siswa', icon: Users, exact: false },
  { name: 'Jadwal', href: '/jadwal', icon: Calendar, exact: false },
  { name: 'Laporan', href: '/laporan', icon: FileText, exact: false },
  { name: 'Keuangan', href: '/laporan/keuangan', icon: DollarSign, exact: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Rafika's Class</h1>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-200 transition-all duration-300 lg:translate-x-0 shadow-lg',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Rafika's Class
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Admin Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              // Fix routing: exact match untuk Keuangan, exclude keuangan dari Laporan
              let isActive = false;
              if (item.exact) {
                isActive = pathname === item.href;
              } else if (item.href === '/laporan') {
                // Laporan active hanya jika di /laporan atau /laporan/tambah, /laporan/bulanan (exclude /laporan/keuangan)
                isActive = pathname === '/laporan' || (pathname.startsWith('/laporan/') && pathname !== '/laporan/keuangan');
              } else {
                isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              }
              
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon 
                    size={20} 
                    className="transition-transform duration-200 group-hover:scale-110"
                  />
                  <span>{item.name}</span>
                  
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer with user profile */}
          <div className="px-6 py-4 border-t border-slate-200">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  R
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Bu Rafika</p>
                <p className="text-xs text-slate-500">Guru Les Private</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

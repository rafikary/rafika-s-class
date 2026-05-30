'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, FileText, DollarSign, Menu, X, GraduationCap, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Data Siswa', href: '/siswa', icon: Users },
  { name: 'Jadwal', href: '/jadwal', icon: Calendar },
  { name: 'Laporan', href: '/laporan', icon: FileText },
  { name: 'Keuangan', href: '/laporan/keuangan', icon: DollarSign },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-xl blur-md opacity-50"></div>
              <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap size={24} className="text-blue-600" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Rafika's Class</h1>
              <p className="text-xs text-blue-100">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
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
          'fixed top-0 left-0 z-40 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300 lg:translate-x-0 shadow-2xl',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo with gradient effect */}
          <div className="px-6 py-6 border-b border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
                {/* Icon container */}
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-200">
                  <GraduationCap size={28} className="text-white" />
                  <Sparkles size={12} className="text-yellow-300 absolute top-1 right-1" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Rafika's Class
                </h1>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Admin Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Navigation with modern hover effects */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'group relative flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200 overflow-hidden',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  )}
                >
                  {/* Animated background on hover */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                  )}
                  
                  <Icon 
                    size={20} 
                    className={cn(
                      'relative z-10 transition-transform duration-200',
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    )} 
                  />
                  <span className="relative z-10">{item.name}</span>
                  
                  {isActive && (
                    <div className="ml-auto relative z-10">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Modern footer with user profile */}
          <div className="px-6 py-4 border-t border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                  R
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">Bu Rafika</p>
                <p className="text-xs text-slate-400">Guru Les Private</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, FileText, DollarSign, Menu, X, BookOpen, Sparkles, Wallet } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, exact: false },
  { name: 'Data Siswa', href: '/siswa', icon: Users, exact: false },
  { name: 'Jadwal', href: '/jadwal', icon: Calendar, exact: false },
  { name: 'Laporan', href: '/laporan', icon: FileText, exact: false },
  { name: 'Keuangan', href: '/laporan/keuangan', icon: DollarSign, exact: true },
  { name: 'Gajian', href: '/gajian', icon: Wallet, exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#FAF9FE] via-white to-[#FAF9FE] border-b border-[#D4BCFA]/30 shadow-md px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo size="sm" showText={true} />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-[#7B68B0] hover:bg-[#D4BCFA]/15 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-[#7B68B0]/30 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-72 bg-gradient-to-br from-[#FAF9FE] via-white to-[#FAF9FE] border-r border-[#D4BCFA]/30 transition-all duration-300 lg:translate-x-0 shadow-xl',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-32 h-32 bg-[#D4BCFA] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#FFB8D1] rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-5 w-24 h-24 bg-[#A8D8F0] rounded-full blur-2xl"></div>
        </div>
        
        <div className="flex flex-col h-full relative z-10">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-[#D4BCFA]/30 bg-white/50 backdrop-blur-sm">
            <Logo size="md" showText={true} />
            
            {/* Fun decorative elements */}
            <div className="mt-4 flex gap-2">
              <div className="flex-1 h-1 bg-gradient-to-r from-[#A8D8F0] to-[#D4BCFA] rounded-full"></div>
              <div className="flex-1 h-1 bg-gradient-to-r from-[#D4BCFA] to-[#FFB8D1] rounded-full"></div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
                    'group flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 relative overflow-hidden',
                    isActive
                      ? 'bg-gradient-to-r from-[#A8D8F0] via-[#D4BCFA] to-[#FFB8D1] text-white shadow-lg shadow-[#D4BCFA]/40'
                      : 'text-[#7B68B0] hover:bg-white/70 hover:text-[#9B8AC0] backdrop-blur-sm'
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  )}
                  
                  <Icon 
                    size={20} 
                    className={cn(
                      "transition-all duration-200 relative z-10",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )}
                  />
                  <span className="relative z-10">{item.name}</span>
                  
                  {isActive && (
                    <div className="ml-auto relative z-10">
                      <Sparkles size={16} className="text-[#FFDAB9] animate-pulse" />
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer with user profile */}
          <div className="px-6 py-4 border-t border-[#D4BCFA]/30 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#FAF9FE] to-white hover:from-[#F5F1FF] hover:to-[#FAF9FE] transition-all duration-200 cursor-pointer group shadow-sm">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-[#A8D8F0] via-[#D4BCFA] to-[#FFB8D1] rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  <BookOpen size={20} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#90E4A8] rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#B8F4D3] rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#7B68B0]">Miss Rafika</p>
                <p className="text-xs text-[#9B8AC0] font-medium">Private Teacher</p>
              </div>
              <Sparkles size={16} className="text-[#D4BCFA] group-hover:rotate-12 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

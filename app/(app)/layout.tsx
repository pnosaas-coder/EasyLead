'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Users2,
  Coins,
  Settings,
  X,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { UserProvider } from '@/components/providers/user-provider';

function MobileBottomNav() {
  const pathname = usePathname();

  const mobileNavItems = [
    { label: 'Accueil', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Scraper', href: '/searches/new', icon: Search },
    { label: 'Leads', href: '/leads', icon: Users2 },
    { label: 'Crédits', href: '/billing', icon: Coins },
    { label: 'Compte', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#0b382c]/10 z-40 px-3 py-2 flex items-center justify-around shadow-lg">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href === '/dashboard' && pathname === '/');

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[11px] font-medium transition-all ${
              isActive
                ? 'text-[#0b382c] font-bold'
                : 'text-[#4f6b61] hover:text-[#0b382c]'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg transition-colors ${
                isActive ? 'bg-[#c6f432] text-[#0b382c]' : 'text-[#4f6b61]'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <UserProvider>
      <div className="flex h-screen overflow-hidden bg-[#f4f8f4]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:shrink-0">
          <Suspense fallback={<aside className="w-72 bg-white border-r border-[#0b382c]/8" />}>
            <Sidebar />
          </Suspense>
        </div>

        {/* Mobile Sidebar Overlay / Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-[#061f18]/60 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer content */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl animate-in slide-in-from-left duration-200">
              {/* Close button inside drawer */}
              <div className="absolute top-4 right-4 z-20">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full bg-[#f4f8f4] text-[#0b382c] hover:bg-neutral-200 transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <Suspense fallback={null}>
                <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
              </Suspense>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

          {/* Scrollable Page Body with padding for mobile bottom bar */}
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
            <Suspense
              fallback={
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 animate-pulse space-y-6">
                  <div className="h-10 w-64 bg-[#0b382c]/10 rounded-2xl" />
                  <div className="h-40 bg-white rounded-3xl border border-[#0b382c]/8" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-32 bg-white rounded-3xl border border-[#0b382c]/8" />
                    ))}
                  </div>
                </div>
              }
            >
              {children}
            </Suspense>
          </main>

          {/* Mobile Bottom Navigation Bar in Suspense */}
          <Suspense fallback={null}>
            <MobileBottomNav />
          </Suspense>
        </div>
      </div>
    </UserProvider>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Menu,
  Coins,
  Bell,
  Search,
} from 'lucide-react';
import { useUser } from '@/components/providers/user-provider';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const { profile } = useUser();
  return (
    <header className="sticky top-0 z-30 bg-[#f4f8f4]/90 backdrop-blur-md border-b border-[#0b382c]/8 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Hamburger + Breadcrumb/Status */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-[#0b382c] bg-white border border-[#0b382c]/10 hover:bg-[#eef4ee] transition-colors focus:outline-none"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand mark visible on mobile only */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0b382c] flex items-center justify-center text-white">
            <span className="font-serif text-lg font-bold text-[#c6f432]">E</span>
          </div>
          <span className="font-serif font-bold text-base text-[#0b382c]">
            Easy<span className="text-[#0b382c]">Lead</span>
          </span>
        </div>

        {/* Desktop Breadcrumb & Market Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#0b382c]/8 font-medium text-[#0b382c] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Moteur Apify &amp; IA Op&eacute;rationnels</span>
          </span>
          <span className="text-neutral-400">&bull;</span>
          <span className="text-[#4f6b61]">Devise : FCFA (XAF/XOF) &bull; Douala, CM</span>
        </div>
      </div>

      {/* Right Actions: Credits Badge, Notifications, CTA Button, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Credits Badge (Pill with lime accent) */}
        <Link
          href="/billing"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#0b382c]/12 shadow-2xs hover:border-[#0b382c]/30 hover:bg-[#fbfdfb] transition-all group"
        >
          <div className="w-5 h-5 rounded-full bg-[#c6f432] text-[#0b382c] flex items-center justify-center font-bold text-[10px]">
            <Coins className="w-3 h-3" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-[#0b382c]">
              {profile.creditsBalance}
            </span>
            <span className="text-[11px] text-[#4f6b61] font-medium hidden sm:inline">
              cr&eacute;dits
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full group-hover:bg-[#c6f432] group-hover:text-[#0b382c] transition-colors">
            + Pack
          </span>
        </Link>

        {/* Notifications Icon with unread ping */}
        <button
          type="button"
          className="relative p-2 rounded-full bg-white border border-[#0b382c]/8 text-[#0b382c] hover:bg-[#eef4ee] transition-colors shadow-2xs"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#c6f432] ring-2 ring-white" />
        </button>

        {/* Primary CTA Button: Launch Search */}
        <Link
          href="/searches/new"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0b382c] hover:bg-[#06241c] text-white text-xs font-semibold shadow-sm transition-all hover:shadow hover:scale-[1.02]"
        >
          <Search className="w-3.5 h-3.5 text-[#c6f432]" />
          <span>Nouvelle recherche</span>
        </Link>

        {/* User Avatar with link to settings */}
        <Link
          href="/settings"
          className="w-8 h-8 rounded-full bg-[#0b382c] text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-2xs hover:scale-105 transition-transform"
          title={`${profile.fullName} (${profile.role})`}
        >
          {profile.initials}
        </Link>
      </div>
    </header>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Coins,
  Bell,
  Search,
  Settings,
  LogOut,
  Sparkles,
  FileSpreadsheet,
  ChevronDown,
  User,
  Shield,
  Command,
} from 'lucide-react';
import { useUser } from '@/components/providers/user-provider';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const router = useRouter();
  const { profile, signOut } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Raccourci clavier global Cmd+K / Ctrl+K pour ouvrir la recherche
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        router.push('/searches/new');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Fermer le menu lors d'un clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#f4f8f4]/90 backdrop-blur-md border-b border-[#0b382c]/8 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile Hamburger + Brand mark */}
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
        <div className="hidden xl:flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#0b382c]/8 font-medium text-[#0b382c] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Moteur Maps &amp; IA Actif</span>
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar accessible directly from anywhere */}
      <Link
        href="/searches/new"
        className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-[#0b382c]/15 hover:border-[#0b382c]/40 text-xs text-[#4f6b61] hover:text-[#0b382c] shadow-2xs hover:shadow-xs transition-all w-64 lg:w-96 group cursor-pointer"
        title="Rechercher des contacts ou des professionnels (Raccourci: ⌘K ou Ctrl+K)"
      >
        <Search className="w-3.5 h-3.5 text-[#0b382c] group-hover:scale-110 transition-transform shrink-0" />
        <span className="truncate font-medium text-neutral-500 group-hover:text-[#0b382c]">
          Rechercher (ex: studio vidéo, quincaillerie...)
        </span>
        <kbd className="ml-auto text-[10px] bg-[#f4f8f4] border border-[#0b382c]/12 px-1.5 py-0.5 rounded text-[#0b382c]/70 font-mono font-bold shrink-0">
          ⌘K
        </kbd>
      </Link>

      {/* Right Actions: Credits Badge, Notifications, CTA Button, Profile Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Credits Badge */}
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
          className="relative p-2 rounded-full bg-white border border-[#0b382c]/8 text-[#0b382c] hover:bg-[#eef4ee] transition-colors shadow-2xs cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#c6f432] ring-2 ring-white" />
        </button>

        {/* Primary CTA Button: Launch Search */}
        <Link
          href="/searches/new"
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-[#0b382c] hover:bg-[#06241c] text-white text-xs font-semibold shadow-sm transition-all hover:shadow hover:scale-[1.02]"
        >
          <Search className="w-3.5 h-3.5 text-[#c6f432]" />
          <span className="hidden sm:inline">Nouvelle recherche</span>
          <span className="sm:hidden">Chercher</span>
        </Link>


        {/* User Avatar with Interactive Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/80 border border-transparent hover:border-[#0b382c]/10 transition-all cursor-pointer focus:outline-none"
            aria-label="Menu profil utilisateur"
          >
            <div className="w-8 h-8 rounded-full bg-[#0b382c] text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-2xs hover:scale-105 transition-transform">
              {profile.initials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#0b382c]/60 hidden sm:block" />
          </button>

          {/* DROPDOWN MENU */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#0b382c]/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Identity Header */}
              <div className="px-4 py-3 border-b border-[#0b382c]/8 bg-[#f8faf8]">
                <div className="font-bold text-sm text-[#0b382c] truncate">
                  {profile.fullName}
                </div>
                <div className="text-xs text-[#4f6b61] truncate">
                  {profile.email}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-[#0b382c]/6">
                  <span className="text-[#0b382c]/70 font-medium">Solde actif :</span>
                  <span className="font-bold text-[#0b382c] bg-[#c6f432]/40 px-2 py-0.5 rounded-full">
                    {profile.creditsBalance} crédits
                  </span>
                </div>
              </div>

              {/* Menu Navigation Links */}
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#0b382c] hover:bg-[#f4f8f4] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#0b382c]/60" />
                  <span>Paramètres &amp; Configuration</span>
                </Link>

                <Link
                  href="/billing"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#0b382c] hover:bg-[#f4f8f4] transition-colors"
                >
                  <Coins className="w-4 h-4 text-[#0b382c]/60" />
                  <span>Factures &amp; Recharges Crédits</span>
                </Link>

                <Link
                  href="/messages"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#0b382c] hover:bg-[#f4f8f4] transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#0b382c]/60" />
                  <span>Messages IA WhatsApp</span>
                </Link>

                <Link
                  href="/exports"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#0b382c] hover:bg-[#f4f8f4] transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#0b382c]/60" />
                  <span>Exports CSV Prospects</span>
                </Link>
              </div>

              {/* Divider & Logout Action */}
              <div className="border-t border-[#0b382c]/8 pt-1 mt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setIsDropdownOpen(false);
                    await signOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

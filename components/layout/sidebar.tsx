'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Users2,
  FileSpreadsheet,
  Coins,
  Settings,
  Sparkles,
  Zap,
  ArrowUpRight,
  MapPin,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useUser } from '@/components/providers/user-provider';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { profile, signOut, refreshProfile } = useUser();

  const navItems = [
    {
      group: 'PROSPECTION',
      items: [
        {
          label: 'Tableau de bord',
          href: '/dashboard',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          label: 'Nouvelle recherche',
          href: '/searches/new',
          icon: Search,
          badge: 'Maps',
          badgeColor: 'bg-[#c6f432] text-[#0b382c]',
        },
        {
          label: 'Annuaire Leads (CRM)',
          href: '/leads',
          icon: Users2,
          badge: '4 820',
          badgeColor: 'bg-[#e5f4ef] text-[#0b382c]',
        },
        {
          label: 'Historique Scraping',
          href: '/searches',
          icon: FileSpreadsheet,
          badge: '38',
          badgeColor: 'bg-[#f4f8f4] text-neutral-600',
        },
      ],
    },
    {
      group: 'IA & OUTREACH',
      items: [
        {
          label: 'Messages IA',
          href: '/messages',
          icon: Sparkles,
          badge: 'WhatsApp/Mail',
          badgeColor: 'bg-emerald-100 text-[#0b382c]',
        },
        {
          label: 'Exports CSV',
          href: '/exports',
          icon: FileSpreadsheet,
          badge: null,
        },
      ],
    },
    {
      group: 'GESTION & COMPTE',
      items: [
        {
          label: 'Factures & Crédits',
          href: '/billing',
          icon: Coins,
          badge: `${profile.creditsBalance} cr.`,
          badgeColor: 'bg-[#c6f432] text-[#0b382c]',
        },
        {
          label: 'Paramètres & Offre',
          href: '/settings',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-[#0b382c]/8 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#0b382c]/6">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group"
        >
          {/* Logo Mark with Spruce + Lime spark */}
          <div className="w-10 h-10 rounded-xl bg-[#0b382c] flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#c6f432]">
              E
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl font-bold tracking-tight text-[#0b382c]">
                Easy<span className="text-[#0b382c]">Lead</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-[#c6f432]" />
            </div>
            <div className="text-[11px] font-medium text-[#4f6b61] tracking-wide flex items-center gap-1">
              <span>B2B Africa Engine</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f4f8f4] text-[#0b382c] border border-[#0b382c]/10">
                PRO
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {navItems.map((group) => (
          <div key={group.group}>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#4f6b61]/70">
              {group.group}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#0b382c] text-white shadow-sm'
                        : 'text-[#142922] hover:bg-[#f4f8f4] hover:text-[#0b382c]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-[#c6f432]' : 'text-[#4f6b61]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-[#c6f432] text-[#0b382c]'
                            : item.badgeColor || 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Africa Coverage Card */}
        <div className="p-3.5 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/8 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0b382c]">
            <MapPin className="w-3.5 h-3.5 text-[#0b382c]" />
            <span>Si&egrave;ge : Douala, Cameroun</span>
          </div>
          <p className="text-[11px] text-[#4f6b61] leading-relaxed">
            Cameroun &bull; S&eacute;n&eacute;gal &bull; C&ocirc;te d&apos;Ivoire &bull; B&eacute;nin &bull; Gabon
          </p>
          <div className="flex items-center gap-1 text-[10px] text-[#0b382c] font-medium pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Apify Google Places connect&eacute;</span>
          </div>
        </div>

        {/* Credits Balance Card */}
        <div className="p-4 rounded-2xl bg-[#0b382c] text-white relative overflow-hidden shadow-sm">
          {/* Subtle glow accent in corner */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#c6f432]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-200">
              Solde de cr&eacute;dits
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c6f432] text-[#0b382c]">
              <Zap className="w-2.5 h-2.5 fill-current" />
              LIVE
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-serif text-3xl font-bold tracking-tight text-white">
              {profile.creditsBalance}
            </span>
            <span className="text-xs text-emerald-200">cr&eacute;dits restants</span>
          </div>

          <p className="text-[11px] text-emerald-100/80 mb-3.5 leading-relaxed">
            1 cr&eacute;dit = 1 lead qualifi&eacute; ou 1 message IA personnalis&eacute;.
          </p>

          <Link
            href="/billing"
            onClick={onCloseMobile}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-[#c6f432] hover:bg-[#b5e326] text-[#0b382c] text-xs font-bold transition-colors shadow-sm"
          >
            <span>Recharger (MTN / Orange)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch('/api/credits/refill', { method: 'POST' });
                if (res.ok) await refreshProfile();
              } catch (e) {
                console.error(e);
              }
            }}
            className="w-full mt-2 text-[11px] font-bold text-center py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#c6f432] transition-colors cursor-pointer"
          >
            🎁 +1 000 cr. Test gratuits
          </button>

          {/* Quick Support Badge with official Douala line */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-200">
            <span>Support Douala :</span>
            <a
              href="https://wa.me/237677481161?text=Bonjour%20EasyLead%20Support"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[#c6f432] hover:underline flex items-center gap-1 font-bold"
              title="Assistance WhatsApp direct"
            >
              <span>+237 677 48 11 61</span>
            </a>
          </div>
        </div>
      </div>

      {/* User Profile Bar at bottom */}
      <div className="p-4 border-t border-[#0b382c]/8 bg-white">
        <div className="flex items-center justify-between">
          <Link
            href="/settings"
            onClick={onCloseMobile}
            className="flex items-center gap-3 overflow-hidden group flex-1 mr-2"
          >
            <div className="w-9 h-9 rounded-full bg-[#0b382c] text-white flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-[#c6f432]">
              {profile.initials}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-[#0b382c] truncate group-hover:text-emerald-800 transition-colors">
                {profile.fullName}
              </div>
              <div className="text-[11px] text-[#4f6b61] truncate">
                {profile.role} &bull; {profile.city}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/settings"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-[#0b382c] hover:bg-[#f4f8f4] transition-colors"
              title="Paramètres"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Déconnexion"
              aria-label="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

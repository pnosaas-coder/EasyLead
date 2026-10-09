import React from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  Zap,
  Smartphone,
  ArrowRight,
  Gift,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { CURRENT_USER } from '@/lib/mock-data';
import { StatCard } from '@/components/dashboard/stat-card';
import { QuickSearchBox } from '@/components/dashboard/quick-search-box';
import { InvoicesTable } from '@/components/dashboard/invoices-table';
import { RecentSearches, RecentSearchItem } from '@/components/dashboard/recent-searches';
import { StatMetric } from '@/lib/types';
import { connection } from 'next/server';

export default async function DashboardPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userName = CURRENT_USER.name;
  let creditsBalance = CURRENT_USER.creditsBalance;
  let recentSearches: RecentSearchItem[] = [];
  let totalSearchesCount = 0;
  let totalLeadsCount = 0;
  let totalMessagesCount = 0;
  let isNewAccount = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      userName = profile.full_name || user.email?.split('@')[0] || CURRENT_USER.name;
      creditsBalance = profile.credits_balance ?? 50;
    }

    const [
      { count: searchesCount },
      { count: leadsCount },
      { count: messagesCount },
      { data: rawSearches },
    ] = await Promise.all([
      supabase.from('searches').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase
        .from('searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4),
    ]);

    totalSearchesCount = searchesCount ?? 0;
    totalLeadsCount = leadsCount ?? 0;
    totalMessagesCount = messagesCount ?? 0;

    if (rawSearches && rawSearches.length > 0) {
      recentSearches = rawSearches.map((s) => ({
        id: s.id,
        sector: s.sector,
        city: s.city,
        country: s.country_code === 'CM' ? 'Cameroun' : s.country_code,
        resultsCount: s.results_count || 0,
        status: (s.status as RecentSearchItem['status']) || 'completed',
        creditsCharged: s.credits_charged || s.credits_reserved || 0,
        createdAt: s.created_at,
      }));
    } else {
      isNewAccount = true;
    }
  }

  // Dynamic stats metrics
  const stats: StatMetric[] = [
    {
      title: 'Total Leads Découverts',
      value: totalLeadsCount > 0 ? totalLeadsCount.toLocaleString('fr-FR') : (isNewAccount ? '0' : '4 820'),
      change: totalLeadsCount > 0 ? `+${totalLeadsCount} qualifiés` : '+18.4% ce mois',
      isPositive: true,
      subtext: 'Dont WhatsApp et Emails vérifiés',
      iconName: 'leads',
    },
    {
      title: 'Recherches Google Places',
      value: totalSearchesCount > 0 ? totalSearchesCount.toString() : (isNewAccount ? '0' : '38'),
      change: totalSearchesCount > 0 ? `${totalSearchesCount} sessions` : '+6 cette semaine',
      isPositive: true,
      subtext: 'Douala, Yaoundé, Abidjan, Dakar',
      iconName: 'searches',
    },
    {
      title: 'Messages IA Rédigés',
      value: totalMessagesCount > 0 ? totalMessagesCount.toString() : (isNewAccount ? '0' : '1 240'),
      change: totalMessagesCount > 0 ? `${totalMessagesCount} envoyés` : '+32.8% ouverture',
      isPositive: true,
      subtext: 'WhatsApp (78%) • Email (22%)',
      iconName: 'messages',
    },
    {
      title: 'Crédits Disponibles',
      value: creditsBalance.toLocaleString('fr-FR'),
      change: creditsBalance > 0 ? 'Solde Actif' : 'Recharge Requise',
      isPositive: creditsBalance > 0,
      subtext: '1 crédit = 1 lead ou 1 message IA',
      iconName: 'credits',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Editorial Hero Header (Inspired by Screenshot 1 & 2) */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="max-w-3xl space-y-3">
          {/* Tag Pill with vibrant dot */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#0b382c] border border-[#0b382c]/10 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#c6f432] ring-2 ring-[#0b382c]/20" />
            <span>Moteur de Prospection B2B • Afrique Francophone & Anglophone</span>
          </div>

          {/* Main Editorial Title in Serif font */}
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#0b382c] leading-[1.15]">
            G&eacute;n&eacute;rez des leads qualifi&eacute;s en continu pour vos offres B2B.
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-[#4f6b61] leading-relaxed max-w-2xl">
            Bienvenue {userName}. Scrapez Google Maps &agrave; Douala, Yaound&eacute;, Abidjan ou Dakar, 
            identifiez les d&eacute;cisionnaires et laissez l&apos;IA r&eacute;diger vos messages WhatsApp et Emails d&apos;approche.
          </p>
        </div>

        {/* Hero Actions Pills */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/searches/new"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#0b382c] hover:bg-[#06241c] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Search className="w-4 h-4 text-[#c6f432]" />
            <span>Nouveau Scraping Maps</span>
          </Link>

          <Link
            href="/billing"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#c6f432] hover:bg-[#b5e326] text-[#0b382c] text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all hover:scale-[1.02]"
          >
            <Zap className="w-4 h-4" />
            <span>Recharger ({creditsBalance} cr.)</span>
          </Link>
        </div>
      </section>

      {/* Welcome bonus alert for new accounts */}
      {isNewAccount && (
        <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#e6f4ea] to-[#f4fbf6] border border-[#0b382c]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0b382c] text-[#c6f432] flex items-center justify-center font-bold shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#0b382c]">
                Bienvenue sur EasyLead ! Vos {creditsBalance} crédits de bienvenue sont activés.
              </div>
              <div className="text-xs text-[#4f6b61]">
                Testez immédiatement le scraping Google Places ci-dessous sans carte bancaire requise.
              </div>
            </div>
          </div>

          <Link
            href="/searches/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0b382c] text-white text-xs font-bold hover:bg-[#06241c] transition-colors shrink-0 self-start sm:self-auto"
          >
            <span>Démarrer</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#c6f432]" />
          </Link>
        </section>
      )}

      {/* 4 Stats Cards Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </div>
      </section>

      {/* Interactive Quick Search Box (Connected to real Apify scraping API) */}
      <section>
        <QuickSearchBox />
      </section>

      {/* Recent Scraping Jobs & Invoices Table */}
      <div className="grid grid-cols-1 gap-8">
        {/* Recent Scraping Jobs */}
        <RecentSearches
          searches={recentSearches.length > 0 ? recentSearches : undefined}
          totalCount={totalSearchesCount > 0 ? totalSearchesCount : undefined}
        />

        {/* Invoices and Payments Table */}
        <InvoicesTable />
      </div>

      {/* African Market Outreaching Tips / Trust Banner */}
      <section className="bg-[#0b382c] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c6f432]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-[#c6f432] border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Astuce de Conversion EasyLead</span>
            </div>
            <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
              WhatsApp g&eacute;n&egrave;re 4&times; plus de r&eacute;ponses que l&apos;Email en Afrique de l&apos;Ouest et Centrale.
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Vos leads scrap&eacute;s incluent le num&eacute;ro normalis&eacute; au format E.164. 
              G&eacute;n&eacute;rez un pitch concis et cliquez directement sur &laquo; Ouvrir WhatsApp &raquo; pour engager la conversation sans risque de blocage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/leads"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#c6f432] hover:bg-[#b5e326] text-[#0b382c] text-xs font-bold transition-all shadow-sm"
            >
              <Smartphone className="w-4 h-4" />
              <span>Voir mes Leads WhatsApp</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

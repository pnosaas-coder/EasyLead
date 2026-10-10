import React from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  Zap,
  Smartphone,
  ArrowRight,
  Gift,
  Compass,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { CURRENT_USER } from '@/lib/mock-data';
import { StatCard } from '@/components/dashboard/stat-card';
import { QuickSearchBox } from '@/components/dashboard/quick-search-box';
import { RecentSearches, RecentSearchItem } from '@/components/dashboard/recent-searches';
import { StatMetric } from '@/lib/types';
import { connection } from 'next/server';

export const instant = false;

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

  // Dynamic stats metrics (condensed)
  const stats: StatMetric[] = [
    {
      title: 'Total Leads Découverts',
      value: totalLeadsCount > 0 ? totalLeadsCount.toLocaleString('fr-FR') : (isNewAccount ? '0' : '4 820'),
      change: totalLeadsCount > 0 ? `+${totalLeadsCount} qualifiés` : '+18.4% ce mois',
      isPositive: true,
      subtext: 'Numéros WhatsApp vérifiés',
      iconName: 'leads',
    },
    {
      title: 'Recherches Maps',
      value: totalSearchesCount > 0 ? totalSearchesCount.toString() : (isNewAccount ? '0' : '38'),
      change: totalSearchesCount > 0 ? `${totalSearchesCount} sessions` : '+6 cette semaine',
      isPositive: true,
      subtext: 'Douala, Yaoundé, Abidjan, Dakar...',
      iconName: 'searches',
    },
    {
      title: 'Messages IA Rédigés',
      value: totalMessagesCount > 0 ? totalMessagesCount.toString() : (isNewAccount ? '0' : '1 240'),
      change: totalMessagesCount > 0 ? `${totalMessagesCount} envoyés` : '+32.8% réponse',
      isPositive: true,
      subtext: 'Approche WhatsApp & Email',
      iconName: 'messages',
    },
    {
      title: 'Crédits Disponibles',
      value: creditsBalance.toLocaleString('fr-FR'),
      change: creditsBalance > 0 ? 'Solde Actif' : 'Recharge Requise',
      isPositive: creditsBalance > 0,
      subtext: '1 crédit = 1 prospect complet',
      iconName: 'credits',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-8">
      {/* 1. HERO DIRECT : L'OUTIL DE RECHERCHE EST LA STAR CENTRALE */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#0b382c] border border-[#0b382c]/10">
              <Compass className="w-3.5 h-3.5 text-[#0b382c]" />
              <span>Moteur de Prospection &amp; Contacts Directs &bull; Afrique</span>
            </div>

            {/* Main Action-Oriented Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0b382c] leading-[1.15]">
              Trouvez n&apos;importe quel contact ou professionnel en Afrique.
            </h1>

            {/* Clear subtitle */}
            <p className="text-xs sm:text-sm text-[#4f6b61] leading-relaxed max-w-2xl">
              Bienvenue {userName}. Con&ccedil;u pour les <strong>entrepreneurs, cr&eacute;ateurs de contenu, youtubeurs, commer&ccedil;ants et ind&eacute;pendants</strong>. 
              Extrayez en temps r&eacute;el les coordonn&eacute;es Google Maps et num&eacute;ros WhatsApp directs.
            </p>
          </div>

          {/* Quick shortcuts */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <Link
              href="/searches/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0b382c] text-white text-xs font-bold hover:bg-[#06241c] transition-all shadow-xs"
            >
              <Search className="w-3.5 h-3.5 text-[#c6f432]" />
              <span>Recherche Avancée</span>
            </Link>

            <Link
              href="/billing"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#c6f432] text-[#0b382c] text-xs font-bold hover:bg-[#b5e326] transition-all shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{creditsBalance} crédits</span>
            </Link>
          </div>
        </div>

        {/* L'OUTIL DE RECHERCHE PRINCIPAL DIRECTEMENT EN HAUT */}
        <QuickSearchBox />
      </section>

      {/* 2. STATS CLÉS SYNTHÉTIQUES (DISCRÈTES SOUS LA RECHERCHE) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#4f6b61]">
            Vue d&apos;ensemble de votre activit&eacute;
          </h2>
          <Link
            href="/leads"
            className="text-xs font-semibold text-[#0b382c] hover:underline inline-flex items-center gap-1"
          >
            <span>Consulter l&apos;annuaire des leads</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </div>
      </section>

      {/* 3. RECHERCHES RÉCENTES (ACCÈS DIRECT AUX RÉSULTATS) */}
      <section>
        <RecentSearches
          searches={recentSearches.length > 0 ? recentSearches : undefined}
          totalCount={totalSearchesCount > 0 ? totalSearchesCount : undefined}
        />
      </section>

      {/* 4. BANNIÈRE CONSEIL WHATSAPP DIRECT (ÉPURÉE & MOTIVANTE) */}
      <section className="bg-[#0b382c] text-white rounded-3xl p-6 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c6f432]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-[#c6f432]">
              <Sparkles className="w-3 h-3" />
              <span>Optimisation des résultats</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
              WhatsApp : le canal n&deg;1 pour engager des d&eacute;cideurs en Afrique.
            </h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Tous vos contacts scrap&eacute;s b&eacute;n&eacute;ficient du format international normalis&eacute;. 
              Utilisez nos mod&egrave;les IA ou cliquez sur &laquo; Ouvrir WhatsApp &raquo; pour engager directement la discussion.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/leads"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#c6f432] hover:bg-[#b5e326] text-[#0b382c] text-xs font-bold transition-all shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Accéder aux Leads WhatsApp</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


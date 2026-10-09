import React from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Zap,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { MOCK_RECENT_SEARCHES } from '@/lib/mock-data';
import { connection } from 'next/server';

export default async function SearchesPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dbSearches: Array<{
    id: string;
    sector: string;
    city: string;
    country: string;
    countryCode: string;
    resultsCount: number;
    maxResults: number;
    status: 'completed' | 'running' | 'pending' | 'failed';
    creditsCharged: number;
    createdAt: string;
    enrichEmail: boolean;
  }> = [];

  if (user) {
    const { data: rawSearches } = await supabase
      .from('searches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (rawSearches && rawSearches.length > 0) {
      dbSearches = rawSearches.map((s) => ({
        id: s.id,
        sector: s.sector,
        city: s.city,
        country: s.country_code === 'CM' ? 'Cameroun' : s.country_code,
        countryCode: s.country_code,
        resultsCount: s.results_count || 0,
        maxResults: s.max_results,
        status: (s.status as 'completed' | 'running' | 'pending' | 'failed') || 'completed',
        creditsCharged: s.credits_charged || s.credits_reserved || 0,
        createdAt: s.created_at?.split('T')[0] || 'Aujourd’hui',
        enrichEmail: s.enrich_contacts,
      }));
    }
  }

  const allSearches = dbSearches.length > 0 ? dbSearches : MOCK_RECENT_SEARCHES;
  const isUsingRealData = dbSearches.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#0b382c] border border-[#0b382c]/10 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#c6f432] ring-2 ring-[#0b382c]/20" />
            <span>Historique Apify Google Places Scraper</span>
            {isUsingRealData && (
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full">
                Données Live Supabase
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#0b382c] leading-[1.15]">
            Historique de vos Scrapings
          </h1>

          <p className="text-sm sm:text-base text-[#4f6b61] leading-relaxed max-w-2xl">
            Retrouvez toutes vos campagnes de scraping exécutées sur Google Maps. 
            Consultez les entreprises trouvées, téléchargez vos fichiers CSV et relancez vos prospections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/searches/new"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#0b382c] hover:bg-[#06241c] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            <Search className="w-4 h-4 text-[#c6f432]" />
            <span>+ Lancer une nouvelle recherche</span>
          </Link>
        </div>
      </section>

      {/* Searches List */}
      <section className="bg-white rounded-3xl border border-[#0b382c]/8 shadow-[0_4px_24px_-4px_rgba(11,56,44,0.04)] overflow-hidden">
        <div className="p-6 sm:p-7 border-b border-[#0b382c]/6 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0b382c]">
              Recherches Enregistrées ({allSearches.length})
            </h2>
            <p className="text-xs sm:text-sm text-[#4f6b61] mt-0.5">
              Toutes les recherches sont sauvegardées dans votre base de données sans expiration.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#0b382c]/6">
          {allSearches.map((search) => (
            <div
              key={search.id}
              className="p-6 hover:bg-[#fbfdfb] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-base text-[#0b382c] group-hover:text-emerald-900">
                    {search.sector}
                  </h3>
                  {search.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e5f4ef] text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Complété</span>
                    </span>
                  )}
                  {search.status === 'running' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                      <span>En cours...</span>
                    </span>
                  )}
                  {search.status === 'failed' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      <span>Échec</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#4f6b61]">
                  <span className="flex items-center gap-1 font-medium text-[#0b382c]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{search.city}, {search.country}</span>
                  </span>
                  <span>&bull;</span>
                  <span>Lancé le {search.createdAt}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-800 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>{search.creditsCharged} crédits utilisés</span>
                  </span>
                  {search.enrichEmail && (
                    <span className="text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                      Emails enrichis
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="font-serif text-xl font-bold text-[#0b382c]">
                    {search.resultsCount} leads
                  </div>
                  <div className="text-[11px] text-[#4f6b61]">
                    sur {search.maxResults} demandés
                  </div>
                </div>

                <Link
                  href={`/searches/${search.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f4f8f4] hover:bg-[#0b382c] text-[#0b382c] hover:text-white font-bold text-xs transition-all border border-[#0b382c]/10 cursor-pointer"
                >
                  <span>Voir les résultats</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

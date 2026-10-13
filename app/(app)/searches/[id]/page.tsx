'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  Download,
} from 'lucide-react';
import { MOCK_RECENT_SEARCHES, MOCK_LEADS } from '@/lib/mock-data';
import { LeadsTable } from '@/components/leads-table';
import { Lead } from '@/lib/types';

interface SearchRecord {
  id: string;
  sector: string;
  city: string;
  country_code: string;
  max_results: number;
  enrich_contacts: boolean;
  status: 'pending' | 'running' | 'ingesting' | 'completed' | 'failed';
  apify_run_id?: string | null;
  results_count: number;
  credits_reserved: number;
  credits_charged: number;
  error?: string | null;
  created_at: string;
  completed_at?: string | null;
}

export default function SearchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const isMock = id.startsWith('sr_');

  const [search, setSearch] = useState<SearchRecord | null>(() => {
    if (id.startsWith('sr_')) {
      const mockRun =
        MOCK_RECENT_SEARCHES.find((s) => s.id === id) || MOCK_RECENT_SEARCHES[0];
      return {
        id: mockRun.id,
        sector: mockRun.sector,
        city: mockRun.city,
        country_code: mockRun.countryCode,
        max_results: mockRun.maxResults,
        enrich_contacts: mockRun.enrichEmail,
        status: 'completed',
        results_count: mockRun.resultsCount,
        credits_reserved: mockRun.creditsCharged,
        credits_charged: mockRun.creditsCharged,
        created_at: mockRun.createdAt,
      };
    }
    return null;
  });
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (id.startsWith('sr_')) {
      return MOCK_LEADS;
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(() => !id.startsWith('sr_'));
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isMock) {
      return;
    }

    let isMounted = true;
    let interval: NodeJS.Timeout | null = null;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/searches/${id}`);
        if (!res.ok) {
          throw new Error('Erreur chargement recherche');
        }
        const data = await res.json();
        if (isMounted) {
          setSearch(data.search);
          if (data.leads && data.leads.length > 0) {
            // Mapper les leads Supabase au format typé Lead
            const mappedLeads: Lead[] = data.leads.map((l: Record<string, unknown>) => ({
              id: String(l.id),
              searchId: String(l.search_id),
              name: String(l.name),
              category: String(l.category || data.search.sector),
              address: String(l.address || ''),
              city: String(l.city || data.search.city),
              country: String(l.country_code || data.search.country_code),
              countryCode: String(l.country_code || data.search.country_code),
              phone: l.phone ? String(l.phone) : undefined,
              phoneE164: l.phone_e164 ? String(l.phone_e164) : undefined,
              website: l.website ? String(l.website) : undefined,
              email: l.email ? String(l.email) : undefined,
              rating: Number(l.rating) || 0,
              reviewsCount: Number(l.reviews_count) || 0,
              mapsUrl: String(l.maps_url || ''),
              status: (l.status as Lead['status']) || 'new',
              notes: l.notes ? String(l.notes) : undefined,
            }));
            setLeads(mappedLeads);
          }
          setIsLoading(false);

          if (data.search?.status === 'completed' || data.search?.status === 'failed') {
            if (interval) clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Erreur polling search:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    void fetchStatus();

    // Polling toutes les 3 secondes si le scraping est en cours
    interval = setInterval(() => {
      void fetchStatus();
    }, 3000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [id, isMock]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      if (isMock) {
        // Mock export
        const csvContent =
          '\uFEFFNom;Secteur;Adresse;Ville;Téléphone;Email;Note\n' +
          leads
            .map(
              (l) =>
                `"${l.name}";"${l.category}";"${l.address}";"${l.city}";"${l.phone || ''}";"${l.email || ''}";${l.rating}`
            )
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `easylead-${search?.sector || 'export'}.csv`;
        a.click();
      } else {
        const a = document.createElement('a');
        a.href = `/api/searches/${id}/export?delimiter=;&includeMessages=true`;
        a.download = `easylead-${search?.sector || 'export'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && !search) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#0b382c] mb-4" />
        <h2 className="font-serif text-2xl font-bold text-[#0b382c]">
          Chargement de la recherche...
        </h2>
      </div>
    );
  }

  const isCompleted = search?.status === 'completed';
  const isRunning =
    search?.status === 'running' ||
    search?.status === 'pending' ||
    search?.status === 'ingesting';
  const isFailed = search?.status === 'failed';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-[#4f6b61]">
        <div className="flex items-center gap-2">
          <Link
            href="/searches"
            className="hover:text-[#0b382c] flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Toutes les recherches</span>
          </Link>
          <span>/</span>
          <span className="text-[#0b382c] font-bold">Résultats de Scraping</span>
        </div>

        {isCompleted && leads.length > 0 && (
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#0b382c]/15 hover:bg-[#f4f8f4] text-[#0b382c] font-bold transition-all shadow-2xs cursor-pointer text-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isExporting ? 'Téléchargement...' : 'Exporter CSV (Excel FR)'}</span>
          </button>
        )}
      </div>

      {/* Header & Status Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0b382c]/8 shadow-[0_4px_24px_-4px_rgba(11,56,44,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#0b382c]/6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isCompleted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e5f4ef] text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Indexation terminée (100%)</span>
                </span>
              )}

              {isRunning && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>
                    {search?.status === 'ingesting'
                      ? 'Ingestion des données...'
                      : 'Extraction Google Places en cours...'}
                  </span>
                </span>
              )}

              {isFailed && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Échec du run (Crédits remboursés)</span>
                </span>
              )}

              <span className="text-xs text-[#4f6b61]">
                ID :{' '}
                <code className="font-mono bg-[#f4f8f4] px-1.5 py-0.5 rounded text-[11px]">
                  {search?.id}
                </code>
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#0b382c]">
              {search?.sector}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#4f6b61]">
              <span className="flex items-center gap-1 font-semibold text-[#0b382c]">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  {search?.city}, {search?.country_code}
                </span>
              </span>
              <span>&bull;</span>
              <span>Lancé le {search?.created_at?.split('T')[0]}</span>
              {search?.enrich_contacts && (
                <>
                  <span>&bull;</span>
                  <span className="text-blue-700 font-semibold">
                    Enrichissement emails actif
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="p-4 rounded-2xl bg-[#f4f8f4] text-center min-w-[120px]">
              <div className="text-[11px] font-bold text-[#4f6b61] uppercase tracking-wider">
                Leads Trouvés
              </div>
              <div className="font-serif text-3xl font-bold text-[#0b382c] mt-0.5">
                {leads.length || search?.results_count || 0}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0b382c] text-white text-center min-w-[120px]">
              <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                Crédits Débités
              </div>
              <div className="font-serif text-3xl font-bold text-[#c6f432] mt-0.5">
                {search?.credits_charged ?? search?.credits_reserved ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Status In-Progress Banner */}
        {isRunning && (
          <div className="pt-6">
            <div className="p-5 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#0b382c]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700 animate-spin" />
                  <span>
                    Extraction Google Maps en cours...
                  </span>
                </div>
                <span>Actualisation automatique toutes les 3s</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
                <div className="h-full bg-[#0b382c] rounded-full animate-indeterminate" />
              </div>
              <p className="text-xs text-[#4f6b61]">
                L&apos;extraction prend généralement entre 30 secondes et 2 minutes. Vous pouvez
                fermer cette page ou continuer votre navigation, vos leads seront enregistrés
                automatiquement dès la fin du traitement.
              </p>
            </div>
          </div>
        )}

        {/* Sync Info Strip */}
        {isCompleted && (
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#4f6b61] gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                Numéros de téléphone normalisés en E.164 prêts pour ouverture WhatsApp en 1 clic.
              </span>
            </div>
            {search?.credits_reserved && search.credits_reserved > search.credits_charged && (
              <span className="font-semibold text-emerald-800">
                +{(search.credits_reserved - search.credits_charged)} crédits non consommés remboursés automatiquement.
              </span>
            )}
          </div>
        )}
      </section>

      {/* Leads Table Component with Filters & AI Message Drawer */}
      {leads.length > 0 ? (
        <LeadsTable
          initialLeads={leads}
          title={`Prospects Détectés (${leads.length})`}
          subtitle={`Entreprises locales à ${search?.city} avec coordonnées vérifiées.`}
          showExport={true}
        />
      ) : isRunning ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#0b382c]/8 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0b382c] mx-auto" />
          <h3 className="font-serif text-xl font-bold text-[#0b382c]">
            Le moteur EasyLead explore actuellement Google Maps...
          </h3>
          <p className="text-xs text-[#4f6b61] max-w-md mx-auto">
            Les premiers résultats apparaîtront ici dès la finalisation de l&apos;extraction.
          </p>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#0b382c]/8 space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-[#0b382c]">
            Aucun résultat trouvé pour cette zone
          </h3>
          <p className="text-xs text-[#4f6b61] max-w-md mx-auto">
            Google Places n&apos;a renvoyé aucun établissement correspondant exactement à ce
            secteur et cette ville. Tous les crédits réservés ont été recrédités sur votre solde.
          </p>
          <Link
            href="/searches/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0b382c] text-[#c6f432] text-xs font-bold shadow-xs hover:bg-[#07251d]"
          >
            <span>Tenter une nouvelle recherche</span>
          </Link>
        </div>
      )}
    </div>
  );
}

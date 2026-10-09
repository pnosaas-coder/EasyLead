'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  CheckCircle2,
  Clock,
  Download,
  Users2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { MOCK_RECENT_SEARCHES } from '@/lib/mock-data';

export interface RecentSearchItem {
  id: string;
  sector: string;
  city: string;
  country: string;
  resultsCount: number;
  status: 'completed' | 'running' | 'pending' | 'failed';
  creditsCharged: number;
  createdAt?: string;
}

interface RecentSearchesProps {
  searches?: RecentSearchItem[];
  totalCount?: number;
}

export function RecentSearches({ searches, totalCount }: RecentSearchesProps) {
  const displaySearches = searches && searches.length > 0 ? searches : MOCK_RECENT_SEARCHES;
  const count = totalCount !== undefined ? totalCount : displaySearches.length;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#0b382c]/8 shadow-[0_4px_24px_-4px_rgba(11,56,44,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef7f2] text-[#0b382c] border border-[#0b382c]/10 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c6f432]" />
            <span>Historique R&eacute;cent</span>
          </div>
          <h3 className="font-serif text-xl font-bold tracking-tight text-[#0b382c]">
            Derni&egrave;res Recherches Scrapp&eacute;es
          </h3>
        </div>

        <Link
          href="/searches"
          className="text-xs font-bold text-[#0b382c] hover:text-emerald-700 flex items-center gap-1 group"
        >
          <span>Voir tout ({count})</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Grid of recent searches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displaySearches.slice(0, 4).map((search) => (
          <div
            key={search.id}
            className="p-4 rounded-2xl bg-[#f8faf8] border border-[#0b382c]/6 hover:border-[#0b382c]/20 hover:bg-[#f3f8f4] transition-all group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#0b382c] group-hover:text-emerald-900 transition-colors">
                  {search.sector}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-[#4f6b61] mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    {search.city}, {search.country}
                  </span>
                </div>
              </div>

              {search.status === 'completed' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e5f4ef] text-emerald-800 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Termin&eacute;</span>
                </span>
              )}
              {search.status === 'running' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 shrink-0">
                  <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                  <span>En cours...</span>
                </span>
              )}
              {search.status === 'pending' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700 shrink-0">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  <span>En attente</span>
                </span>
              )}
              {search.status === 'failed' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 shrink-0">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  <span>Échoué</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-[#0b382c]/6">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0b382c] flex items-center gap-1">
                  <Users2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{search.resultsCount} leads</span>
                </span>
                <span className="text-[11px] text-[#4f6b61]">
                  ({search.creditsCharged} cr&eacute;dits)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/searches/${search.id}`}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#0b382c]/10 text-[#0b382c] font-bold text-[11px] hover:bg-[#c6f432] transition-colors"
                >
                  Voir leads
                </Link>
                {search.resultsCount > 0 && (
                  <a
                    href={`/api/searches/${search.id}/export`}
                    download
                    className="p-1 rounded-lg bg-white border border-[#0b382c]/10 text-[#0b382c] hover:bg-neutral-100 transition-colors inline-flex items-center justify-center"
                    title="Télécharger CSV (RFC 4180)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

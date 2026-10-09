'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Mail,
  Zap,
  ArrowRight,
  Loader2,
  AlertCircle,
  Coins,
} from 'lucide-react';
import { useUser } from '@/components/providers/user-provider';

export function QuickSearchBox() {
  const router = useRouter();
  const { profile, refreshProfile } = useUser();

  const [sector, setSector] = useState('Quincailleries & BTP');
  const [city, setCity] = useState('Douala');
  const [countryCode, setCountryCode] = useState('CM');
  const [maxResults, setMaxResults] = useState(20);
  const [enrichEmail, setEnrichEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Credit cost calculation:
  // 1 credit per scraped lead + 1 credit if enrichEmail is checked
  const creditCost = maxResults * (enrichEmail ? 2 : 1);
  const hasEnoughCredits = profile.creditsBalance >= creditCost;

  const popularSectors = [
    'Pharmacies',
    'Hôtels & Auberges',
    'Restaurants',
    'Quincailleries',
    'Écoles privées',
    'Agences immobilières',
  ];

  const handleStartSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sector.trim() || !city.trim()) {
      setErrorMessage('Veuillez spécifier un secteur et une ville.');
      return;
    }

    if (!hasEnoughCredits) {
      setErrorMessage(
        `Crédits insuffisants : vous avez ${profile.creditsBalance} crédit(s), mais cette recherche en nécessite ${creditCost}.`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector: sector.trim(),
          city: city.trim(),
          countryCode,
          maxResults,
          enrichContacts: enrichEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'INSUFFICIENT_CREDITS') {
          throw new Error(
            `Solde insuffisant (${data.currentBalance} cr. restants pour un besoin de ${data.required} cr.).`
          );
        }
        throw new Error(data.error || 'Erreur lors du démarrage du scraping.');
      }

      await refreshProfile();
      router.push(`/searches/${data.searchId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0b382c]/8 shadow-[0_4px_24px_-4px_rgba(11,56,44,0.04)] relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#c6f432]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef7f2] text-[#0b382c] border border-[#0b382c]/10 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c6f432]" />
            <span>Moteur Apify Google Places</span>
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#0b382c]">
            Lancer un Scraping Instantan&eacute;
          </h2>
          <p className="text-xs sm:text-sm text-[#4f6b61] mt-0.5">
            Extrayez les entreprises avec coordonn&eacute;es WhatsApp et adresses en Afrique.
          </p>
        </div>

        {/* Live cost estimator */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#0b382c] text-white shadow-xs self-start sm:self-auto">
          <Zap className="w-4 h-4 text-[#c6f432]" />
          <div className="text-right">
            <div className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">
              Co&ucirc;t estim&eacute;
            </div>
            <div className="font-serif text-sm font-bold text-[#c6f432]">
              {creditCost} cr&eacute;dits
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{errorMessage}</p>
              {!hasEnoughCredits && (
                <p className="mt-1 text-xs text-rose-700">
                  Rechargez votre solde ou réduisez le nombre de leads cibles.
                </p>
              )}
            </div>
          </div>
          {!hasEnoughCredits && (
            <Link
              href="/billing"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b382c] text-white text-xs font-bold shrink-0 hover:bg-[#06241c] transition-colors"
            >
              <Coins className="w-3.5 h-3.5 text-[#c6f432]" />
              <span>Recharger</span>
            </Link>
          )}
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Sector input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0b382c] flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#4f6b61]" />
            <span>Secteur d&apos;activit&eacute;</span>
          </label>
          <input
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Ex: Quincaillerie, Clinique..."
            className="w-full px-4 py-3 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs sm:text-sm font-medium text-[#0b382c] focus:outline-none focus:border-[#0b382c] focus:bg-white transition-all"
          />
        </div>

        {/* City input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0b382c] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#4f6b61]" />
            <span>Ville cible</span>
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex: Abidjan, Douala, Dakar..."
            className="w-full px-4 py-3 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs sm:text-sm font-medium text-[#0b382c] focus:outline-none focus:border-[#0b382c] focus:bg-white transition-all"
          />
        </div>

        {/* Country selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0b382c] flex items-center gap-1.5">
            <span>Pays</span>
          </label>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs sm:text-sm font-medium text-[#0b382c] focus:outline-none focus:border-[#0b382c] focus:bg-white transition-all appearance-none cursor-pointer"
          >
            <option value="CM">🇨🇲 Cameroun</option>
            <option value="CI">🇨🇮 Côte d&apos;Ivoire</option>
            <option value="SN">🇸🇳 Sénégal</option>
            <option value="GA">🇬🇦 Gabon</option>
            <option value="BJ">🇧🇯 Bénin</option>
            <option value="TG">🇹🇬 Togo</option>
            <option value="ML">🇲🇱 Mali</option>
            <option value="GN">🇬🇳 Guinée</option>
          </select>
        </div>
      </div>

      {/* Popular Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-[11px] font-semibold text-[#4f6b61]">
          Suggestions :
        </span>
        {popularSectors.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSector(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              sector === s
                ? 'bg-[#0b382c] text-white shadow-xs'
                : 'bg-[#f4f8f4] text-[#0b382c] hover:bg-[#e6f0eb]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Options Row & CTA */}
      <div className="pt-4 border-t border-[#0b382c]/6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Max results selector */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#0b382c]">
            <span className="text-[#4f6b61]">Volume :</span>
            {[20, 50, 100].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMaxResults(num)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  maxResults === num
                    ? 'bg-[#0b382c] text-white'
                    : 'bg-[#f4f8f4] text-[#4f6b61] hover:text-[#0b382c]'
                }`}
              >
                {num} leads
              </button>
            ))}
          </div>

          {/* Enrich email checkbox */}
          <label className="flex items-center gap-2 text-xs font-medium text-[#0b382c] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enrichEmail}
              onChange={(e) => setEnrichEmail(e.target.checked)}
              className="w-4 h-4 rounded text-[#0b382c] accent-[#0b382c] cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              <span>Enrichir les emails (+1 cr./lead)</span>
            </span>
          </label>
        </div>

        {/* Action Button: Dark Spruce Pill from Screenshots */}
        <button
          type="button"
          onClick={() => handleStartSearch()}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-[#0b382c] hover:bg-[#07241c] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#c6f432]" />
              <span>Lancement du scraping...</span>
            </>
          ) : (
            <>
              <span>D&eacute;marrer le Scraping ({creditCost} cr.)</span>
              <ArrowRight className="w-4 h-4 text-[#c6f432]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

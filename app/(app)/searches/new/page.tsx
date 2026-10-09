'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Mail,
  Zap,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AFRICAN_COUNTRIES } from '@/lib/countries';

export function NewSearchPage() {
  const router = useRouter();
  const supabase = createClient();

  const [sector, setSector] = useState('Quincailleries & Matériaux BTP');
  const [city, setCity] = useState('Douala');
  const [countryCode, setCountryCode] = useState('CM');
  const [maxResults, setMaxResults] = useState(50);
  const [enrichEmail, setEnrichEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(50);

  useEffect(() => {
    async function loadUserBalance() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('credits_balance, country_code')
            .eq('id', user.id)
            .single();

          if (profile) {
            setUserCredits(profile.credits_balance ?? 50);
            if (profile.country_code) setCountryCode(profile.country_code);
          }
        }
      } catch (err) {
        console.error('Error fetching balance:', err);
      }
    }
    loadUserBalance();
  }, [supabase]);

  // Calcul du coût unitaire
  const unitCost = enrichEmail ? 2 : 1;
  const totalReservedCredits = maxResults * unitCost;

  const popularSectors = [
    'Quincailleries & Matériaux BTP',
    'Pharmacies & Parapharmacies',
    'Hôtels & Hébergements',
    'Cliniques & Cabinets médicaux',
    'Écoles & Universités privées',
    'Agences de transit & Douane',
    'Restaurants & Traiteurs',
    'Garages & Concessionnaires auto',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector,
          city,
          countryCode,
          maxResults,
          enrichContacts: enrichEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || 'Erreur lors du lancement de la recherche.'
        );
      }

      router.push(`/searches/${data.searchId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#0b382c] border border-[#0b382c]/10 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#c6f432] ring-2 ring-[#0b382c]/20" />
          <span>Apify Actor : Google Places Scraper (compass/crawler-google-places)</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#0b382c]">
          Lancer une Nouvelle Recherche Maps
        </h1>

        <p className="text-sm sm:text-base text-[#4f6b61] leading-relaxed">
          Configurez votre recherche locale. Le scraper extrait automatiquement les coordonnées,
          les numéros de téléphone normalisés en E.164 pour WhatsApp et les avis en temps réel.
        </p>
      </div>

      {submitError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
          {submitError.includes('insuffisant') && (
            <Link
              href="/billing"
              className="font-bold underline text-rose-900 shrink-0"
            >
              Recharger mes crédits &rarr;
            </Link>
          )}
        </div>
      )}

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0b382c]/8 shadow-[0_4px_24px_-4px_rgba(11,56,44,0.04)] space-y-6"
      >
        {/* Sector Field with Suggestions */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#0b382c] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-emerald-700" />
              <span>Secteur d&apos;activité ou Type d&apos;établissement</span>
            </span>
            <span className="text-[11px] text-[#4f6b61] font-normal">Texte libre</span>
          </label>
          <input
            type="text"
            required
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Ex: Quincaillerie, Agence de transit, Clinique..."
            className="w-full px-4 py-3 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-sm font-medium text-[#0b382c] focus:outline-none focus:border-[#0b382c] focus:bg-white transition-all shadow-2xs"
          />

          {/* Suggestions chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[11px] font-semibold text-[#4f6b61] mr-1">
              Suggestions Afrique :
            </span>
            {popularSectors.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSector(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  sector === s
                    ? 'bg-[#0b382c] text-white shadow-xs'
                    : 'bg-[#f4f8f4] text-[#0b382c] hover:bg-[#e6f0eb]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Location Grid: City & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0b382c] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ville ou Quartier spécifique</span>
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Douala, Yaoundé, Abidjan..."
              className="w-full px-4 py-3 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-sm font-medium text-[#0b382c] focus:outline-none focus:border-[#0b382c] focus:bg-white transition-all shadow-2xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0b382c]">
              Pays cible
            </label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-sm font-medium text-[#0b382c] focus:outline-none focus:border-[#0b382c] focus:bg-white transition-all appearance-none cursor-pointer shadow-2xs"
            >
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.currency})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Max Results & Email Enrichment Option */}
        <div className="p-5 rounded-2xl bg-[#f8faf8] border border-[#0b382c]/8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#0b382c]">
                Nombre maximum de résultats
              </div>
              <p className="text-[11px] text-[#4f6b61]">
                Arrêt automatique dès que le quota est atteint.
              </p>
            </div>

            <div className="inline-flex rounded-full bg-white p-1 border border-[#0b382c]/10 text-xs">
              {[20, 50, 100, 200].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMaxResults(num)}
                  className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                    maxResults === num
                      ? 'bg-[#0b382c] text-white shadow-xs'
                      : 'text-[#4f6b61] hover:text-[#0b382c]'
                  }`}
                >
                  {num} leads
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#0b382c]/8 flex items-center justify-between">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enrichEmail}
                onChange={(e) => setEnrichEmail(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#0b382c] accent-[#0b382c] cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-[#0b382c] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Enrichissement des adresses Emails (+1 crédit/lead)</span>
                </span>
                <p className="text-[11px] text-[#4f6b61] mt-0.5">
                  Le scraper explore le site web et les réseaux sociaux de l&apos;entreprise pour extraire l&apos;email.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Live Credits Reserve Summary Card */}
        <div className="p-5 rounded-2xl bg-[#0b382c] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#c6f432]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#c6f432]">
                Réservation de crédits garantie
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed max-w-md">
              {totalReservedCredits} crédits réservés ({maxResults} &times; {unitCost} cr).
              Si Google Maps ne trouve que 42 résultats, la différence est automatiquement remboursée sur votre compte !
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-emerald-800 sm:pl-6 shrink-0">
            <div className="text-[11px] text-emerald-200">Votre solde actuel</div>
            <div className="font-serif text-2xl font-bold text-white">
              {userCredits} crédits
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/dashboard"
            className="text-xs font-bold text-[#4f6b61] hover:text-[#0b382c]"
          >
            &larr; Annuler et retour au Dashboard
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#0b382c] hover:bg-[#06241c] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#c6f432]" />
                <span>Démarrage Apify...</span>
              </>
            ) : (
              <>
                <span>Lancer la recherche ({totalReservedCredits} cr.)</span>
                <ArrowRight className="w-4 h-4 text-[#c6f432]" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewSearchPage;

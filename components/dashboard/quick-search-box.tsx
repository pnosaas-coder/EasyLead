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
  Video,
  Briefcase,
  Wrench,
  HeartPulse,
  Building2,
  Sparkles,
  Megaphone,
} from 'lucide-react';
import { useUser } from '@/components/providers/user-provider';
import { calculateSearchCost, leadsForCredits } from '@/lib/pricing';

// Profils métiers ciblés pour entrepreneurs, youtubeurs, artisans et B2B
const TARGET_ARCHETYPES = [
  {
    id: 'affichage',
    label: '📢 Affichage, Régie & Publicité',
    icon: Megaphone,
    placeholder: 'Ex: Régie d\'affichage publicitaire, Panneaux 4x3, Communication extérieure...',
    suggestions: [
      'Régie d\'affichage publicitaire & Panneaux',
      'Entreprise de communication extérieure (OOH)',
      'Fabricant d\'enseignes & Habillage publicitaire',
      'Affichage urbain & Panneaux 4x3',
      'Écrans géants LED & DOOH',
      'Imprimerie grand format & Bâches',
    ],
  },
  {
    id: 'creators',
    label: '🎬 Créateurs & YouTube',
    icon: Video,
    placeholder: 'Ex: Studio de tournage vidéo, Agence TikTok, Motion design...',
    suggestions: [
      'Studio de tournage vidéo',
      'Agence de création de contenu',
      'Monteur vidéo & Podcast',
      'Studio photo & Événements',
      'Agence marketing d\'influence',
    ],
  },
  {
    id: 'b2b',
    label: '💼 Entrepreneurs & B2B',
    icon: Briefcase,
    placeholder: 'Ex: Quincaillerie BTP, Grossiste alimentaire, Import-Export...',
    suggestions: [
      'Quincailleries & Matériaux',
      'Fournisseurs & Grossistes',
      'Société d\'import-export',
      'Cabinet d\'expertise comptable',
      'Agence de communication & Web',
    ],
  },
  {
    id: 'artisans',
    label: '🛠️ Artisans & Services',
    icon: Wrench,
    placeholder: 'Ex: Plombier, Électricien, Frigoriste, Menuisier aluminium...',
    suggestions: [
      'Plombier sanitaire',
      'Froid & Climatisation',
      'Électricien bâtiment',
      'Menuiserie aluminium',
      'Garage mécanique auto',
    ],
  },
  {
    id: 'sante',
    label: '🏥 Santé & Cliniques',
    icon: HeartPulse,
    placeholder: 'Ex: Pharmacie, Clinique médicale, Cabinet dentaire...',
    suggestions: [
      'Pharmacie & Parapharmacie',
      'Clinique & Centre médical',
      'Cabinet dentaire',
      'Laboratoire d\'analyses',
      'Opticien & Lunetterie',
    ],
  },
  {
    id: 'commerces',
    label: '🏢 Commerces & Hôtels',
    icon: Building2,
    placeholder: 'Ex: Hôtel & Résidence, Restaurant, École privée...',
    suggestions: [
      'Hôtel & Résidence meublée',
      'Restaurant & Traiteur',
      'École privée & Formation',
      'Agence immobilière',
      'Supermarché & Supérette',
    ],
  },
];

const POPULAR_CITIES = [
  { name: 'Douala', country: 'CM' },
  { name: 'Yaoundé', country: 'CM' },
  { name: 'Abidjan', country: 'CI' },
  { name: 'Dakar', country: 'SN' },
  { name: 'Libreville', country: 'GA' },
  { name: 'Cotonou', country: 'BJ' },
  { name: 'Lomé', country: 'TG' },
];

export function QuickSearchBox() {
  const router = useRouter();
  const { profile, isLoading, refreshProfile } = useUser();

  const [activeArchetype, setActiveArchetype] = useState('creators');
  const [sector, setSector] = useState('Studio de tournage vidéo');
  const [city, setCity] = useState('Douala');
  const [countryCode, setCountryCode] = useState('CM');
  const [chosenMaxResults, setMaxResults] = useState<number | null>(null);
  const [enrichEmail, setEnrichEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentArchetypeConfig =
    TARGET_ARCHETYPES.find((a) => a.id === activeArchetype) || TARGET_ARCHETYPES[0];

  // Tant que l'utilisateur n'a pas choisi, proposer un volume finançable (5 crédits offerts → 1 prospect)
  const maxResults =
    chosenMaxResults ??
    (isLoading ? 20 : Math.max(1, Math.min(20, leadsForCredits(profile.creditsBalance))));

  // Calcul du coût : 3 crédits par prospect, enrichissement email inclus
  const creditCost = calculateSearchCost(maxResults);
  const hasEnoughCredits = profile.creditsBalance >= creditCost;

  const handleSelectArchetype = (archId: string) => {
    setActiveArchetype(archId);
    const arch = TARGET_ARCHETYPES.find((a) => a.id === archId);
    if (arch && arch.suggestions.length > 0) {
      setSector(arch.suggestions[0]);
    }
  };

  const handleStartSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sector.trim() || !city.trim()) {
      setErrorMessage('Veuillez spécifier un métier/secteur et une ville.');
      return;
    }

    if (!hasEnoughCredits) {
      setErrorMessage(
        `Solde insuffisant : vous disposez de ${profile.creditsBalance} crédit(s), mais cette recherche en nécessite ${creditCost}.`
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
        throw new Error(data.error || 'Erreur lors du démarrage de la recherche.');
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
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#0b382c]/10 shadow-[0_8px_32px_-4px_rgba(11,56,44,0.08)] relative overflow-hidden transition-all">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#c6f432]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#0b382c]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Archetypes Pill Selector - Catégories pour créateurs & entrepreneurs */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0b382c] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0b382c]" />
            <span>Choisissez le profil ou l&apos;activit&eacute; &agrave; cibler :</span>
          </span>
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-[#eef7f2] px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c6f432] animate-pulse" />
            <span>Google Maps Afrique en Direct</span>
          </div>
        </div>

        {/* Scrollable Archetypes Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TARGET_ARCHETYPES.map((arch) => {
            const isSelected = activeArchetype === arch.id;
            return (
              <button
                key={arch.id}
                type="button"
                onClick={() => handleSelectArchetype(arch.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0b382c] text-white shadow-sm ring-2 ring-[#0b382c]/20 scale-[1.02]'
                    : 'bg-[#f4f8f4] text-[#0b382c] hover:bg-[#e6f0eb] border border-[#0b382c]/6'
                }`}
              >
                <span>{arch.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start justify-between gap-3 animate-in fade-in duration-150">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b382c] text-[#c6f432] text-xs font-bold shrink-0 hover:bg-[#06241c] transition-colors"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Acheter des crédits</span>
            </Link>
          )}
        </div>
      )}

      {/* Main Search Input Grid */}
      <form onSubmit={handleStartSearch} className="relative z-10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-2 bg-[#f4f8f4] rounded-2xl border border-[#0b382c]/10">
          {/* Target Query Input (Col 6) */}
          <div className="md:col-span-6 bg-white rounded-xl p-3 border border-[#0b382c]/8 focus-within:border-[#0b382c] focus-within:ring-2 focus-within:ring-[#0b382c]/10 transition-all">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#4f6b61] flex items-center gap-1.5 mb-1">
              <Search className="w-3.5 h-3.5 text-[#0b382c]" />
              <span>1. Qui recherchez-vous ?</span>
            </label>
            <input
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder={currentArchetypeConfig.placeholder}
              className="w-full bg-transparent text-sm font-semibold text-[#0b382c] placeholder:text-neutral-400 focus:outline-none"
            />
          </div>

          {/* City Target (Col 3) */}
          <div className="md:col-span-3 bg-white rounded-xl p-3 border border-[#0b382c]/8 focus-within:border-[#0b382c] focus-within:ring-2 focus-within:ring-[#0b382c]/10 transition-all">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#4f6b61] flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#0b382c]" />
              <span>2. Ville cible</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Douala, Abidjan..."
              className="w-full bg-transparent text-sm font-semibold text-[#0b382c] placeholder:text-neutral-400 focus:outline-none"
            />
          </div>

          {/* Country Selector (Col 3) */}
          <div className="md:col-span-3 bg-white rounded-xl p-3 border border-[#0b382c]/8 focus-within:border-[#0b382c] transition-all">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#4f6b61] flex items-center gap-1.5 mb-1">
              <span>3. Pays</span>
            </label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-[#0b382c] focus:outline-none cursor-pointer"
            >
              <option value="CM">🇨🇲 Cameroun</option>
              <option value="CI">🇨🇮 Côte d&apos;Ivoire</option>
              <option value="SN">🇸🇳 Sénégal</option>
              <option value="GA">🇬🇦 Gabon</option>
              <option value="BJ">🇧🇯 Bénin</option>
              <option value="TG">🇹🇬 Togo</option>
              <option value="CD">🇨🇩 RDC</option>
              <option value="ML">🇲🇱 Mali</option>
              <option value="GN">🇬🇳 Guinée</option>
              <option value="BF">🇧🇫 Burkina Faso</option>
            </select>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-[#4f6b61] mr-1">
            Suggestions rapides :
          </span>
          {currentArchetypeConfig.suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSector(item)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                sector === item
                  ? 'bg-[#0b382c] text-white shadow-xs'
                  : 'bg-[#f4f8f4] text-[#0b382c] hover:bg-[#e6f0eb] border border-[#0b382c]/8'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Popular Cities Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#4f6b61] mr-1">
            Villes populaires :
          </span>
          {POPULAR_CITIES.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => {
                setCity(c.name);
                setCountryCode(c.country);
              }}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                city.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-[#c6f432] text-[#0b382c] font-bold'
                  : 'bg-white text-[#4f6b61] hover:text-[#0b382c] border border-[#0b382c]/8'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Bottom Options & CTA Row */}
        <div className="pt-4 border-t border-[#0b382c]/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Options: Volume & Email */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0b382c]">
              <span className="text-[#4f6b61] font-normal">Prospects :</span>
              {[1, 5, 10, 20, 50].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMaxResults(num)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    maxResults === num
                      ? 'bg-[#0b382c] text-white'
                      : 'bg-[#f4f8f4] text-[#4f6b61] hover:text-[#0b382c]'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#0b382c] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enrichEmail}
                onChange={(e) => setEnrichEmail(e.target.checked)}
                className="w-4 h-4 rounded text-[#0b382c] accent-[#0b382c] cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-emerald-700" />
                <span>Enrichir emails (inclus)</span>
              </span>
            </label>
          </div>

          {/* Big Prominent Action Button */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-[#4f6b61] font-semibold">
                Co&ucirc;t : {creditCost} cr&eacute;dits
              </div>
              <div className="text-[11px] font-bold text-[#0b382c]">
                Solde : {profile.creditsBalance} cr.
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#0b382c] hover:bg-[#07241c] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#c6f432]" />
                  <span>Extraction Google Maps en cours...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-[#c6f432]" />
                  <span>Trouver ces contacts ({creditCost} cr.)</span>
                  <ArrowRight className="w-4 h-4 text-[#c6f432]" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


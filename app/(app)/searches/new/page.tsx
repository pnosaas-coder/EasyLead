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
  Coins,
  Briefcase,
  Building,
  HeartPulse,
  Utensils,
  Ship,
  Car,
  GraduationCap,
  Video,
  Megaphone,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AFRICAN_COUNTRIES } from '@/lib/countries';
import { CREDIT_COSTS, calculateSearchCost, leadsForCredits } from '@/lib/pricing';

const RESULT_OPTIONS = [1, 5, 10, 20, 50, 100, 200];

// Catégories riches de suggestions métiers et commerces en Afrique
const CATEGORIES = [
  {
    id: 'affichage_com',
    label: 'Affichage, Régies & Publicité',
    icon: Megaphone,
    items: [
      'Régie d\'affichage publicitaire & Panneaux',
      'Entreprise de communication extérieure (OOH)',
      'Fabricant d\'enseignes & Habillage publicitaire',
      'Affichage urbain & Panneaux 4x3',
      'Écrans géants LED & Affichage dynamique (DOOH)',
      'Imprimerie grand format & Bâches',
      'Agence de publicité & Médias',
      'Pose et maintenance de panneaux publicitaires',
    ],
  },
  {
    id: 'creators',
    label: 'Créateurs & YouTube',
    icon: Video,
    items: [
      'Studio de tournage vidéo',
      'Monteur vidéo & Podcast',
      'Agence de création de contenu',
      'Studio photo & Événements',
      'Agence marketing d\'influence',
      'Graphiste & Motion designer',
      'Social media manager',
      'Voix off & Production sonore',
    ],
  },
  {
    id: 'metiers',
    label: 'Artisans & Métiers',
    icon: Briefcase,
    items: [
      'Plombier',
      'Maçon',
      'Électricien',
      'Ferrailleur',
      'Menuisier',
      'Peintre en bâtiment',
      'Mécanicien auto',
      'Frigoriste / Froid & Climatisation',
      'Soudeur métallier',
      'Carreleur',
      'Dentiste',
      'Avocat / Cabinet juridique',
      'Expert-comptable',
      'Architecte BTP',
    ],
  },
  {
    id: 'btp',
    label: 'BTP, Matériaux & Quincailleries',
    icon: Building,
    items: [
      'Quincailleries & Matériaux BTP',
      'Vente de fer à béton & Ciment',
      'Menuiserie aluminium & Vitrerie',
      'Carrelage & Sanitaire',
      'Location engins de chantier',
    ],
  },
  {
    id: 'sante',
    label: 'Santé, Pharmacies & Cliniques',
    icon: HeartPulse,
    items: [
      'Pharmacie & Parapharmacie',
      'Clinique & Centre médical',
      'Cabinet dentaire',
      'Laboratoire d’analyses médicales',
      'Cabinet ophtalmologique & Opticien',
    ],
  },
  {
    id: 'hotellerie',
    label: 'Hôtellerie & Restauration',
    icon: Utensils,
    items: [
      'Hôtel & Hébergement',
      'Restaurant & Traiteur',
      'Résidence meublée & Appart-hôtel',
      'Salon de thé & Pâtisserie',
      'Salle d’événements & Réceptions',
    ],
  },
  {
    id: 'transit',
    label: 'Transit, Douane & Logistique',
    icon: Ship,
    items: [
      'Agence de transit & Douane',
      'Transport routier & Fret maritime',
      'Commissionnaire agréé en douane',
      'Entrepôt sous douane & Logistique',
    ],
  },
  {
    id: 'auto',
    label: 'Auto, Garages & Concessionnaires',
    icon: Car,
    items: [
      'Garage automobile & Réparation',
      'Concessionnaire auto (Véhicules neufs / occasion)',
      'Vente de pièces détachées auto',
      'Lavage auto & Entretien express',
    ],
  },
  {
    id: 'education',
    label: 'Écoles & Universités',
    icon: GraduationCap,
    items: [
      'École primaire & Collège privé',
      'Lycée & Établissement secondaire',
      'Université & Institut supérieur',
      'Centre de formation professionnelle',
    ],
  },
];

const SUGGESTED_CITIES = [
  { name: 'Douala', country: 'CM' },
  { name: 'Yaoundé', country: 'CM' },
  { name: 'Bafoussam', country: 'CM' },
  { name: 'Kribi', country: 'CM' },
  { name: 'Garoua', country: 'CM' },
  { name: 'Abidjan', country: 'CI' },
  { name: 'Dakar', country: 'SN' },
  { name: 'Libreville', country: 'GA' },
  { name: 'Cotonou', country: 'BJ' },
  { name: 'Lomé', country: 'TG' },
];

export function NewSearchPage() {
  const router = useRouter();
  const supabase = createClient();

  const [activeCategory, setActiveCategory] = useState('metiers');
  const [sector, setSector] = useState('Plombier');
  const [city, setCity] = useState('Douala');
  const [countryCode, setCountryCode] = useState('CM');
  const [maxResults, setMaxResults] = useState(20);
  const [enrichEmail, setEnrichEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);

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
            const balance = profile.credits_balance ?? 0;
            setUserCredits(balance);
            // Pré-sélectionner un volume finançable (ex : 5 crédits offerts → 1 prospect)
            setMaxResults((prev) => Math.max(1, Math.min(prev, leadsForCredits(balance))));
            if (profile.country_code) setCountryCode(profile.country_code);
          }
        }
      } catch (err) {
        console.error('Error fetching balance:', err);
      }
    }
    loadUserBalance();
  }, [supabase]);

  // 3 crédits par prospect, enrichissement email inclus
  const unitCost = CREDIT_COSTS.PER_LEAD;
  const totalReservedCredits = calculateSearchCost(maxResults);
  const hasEnoughCredits = userCredits >= totalReservedCredits;

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
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Credits Pricing Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0b382c] text-[#c6f432] flex items-center justify-center font-bold shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#0b382c]">
              1 prospect complet = {unitCost} cr&eacute;dits
            </div>
            <p className="text-xs text-emerald-800">
              Téléphone, lien WhatsApp, site web et email inclus. Seuls les prospects réellement trouvés sont facturés.
            </p>
          </div>
        </div>

        <Link
          href="/billing"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0b382c] hover:bg-[#07251d] text-[#c6f432] text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Acheter des crédits</span>
        </Link>
      </div>

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
          Recherchez n&apos;importe quel <strong>profil métier</strong> (plombier, maçon, ferrailleur, dentiste...) ou <strong>établissement en Afrique</strong> (quincaillerie, pharmacie, transit, garage...). Les coordonnées et téléphones WhatsApp sont extraits en temps réel.
        </p>
      </div>

      {submitError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0b382c]/8 shadow-[0_4px_24px_-4px_rgba(11,56,44,0.04)] space-y-6"
      >
        {/* Sector Field with Categories and Suggestion Chips */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#0b382c] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-emerald-700" />
              <span>Profil Métier ou Type d&apos;Établissement (Saisie libre)</span>
            </span>
            <span className="text-[11px] text-[#4f6b61] font-normal">
              Ex: Plombier, Dentiste, Quincaillerie BTP...
            </span>
          </label>

          <div className="relative">
            <input
              type="text"
              required
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Ex: Plombier, Maçon, Pharmacie, Quincaillerie BTP..."
              className="w-full px-4 py-3.5 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-sm font-semibold text-[#0b382c] focus:outline-none focus:border-[#0b382c] focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Onglets de catégories pour guider l'utilisateur */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#0b382c]/70">
              Suggestions Afrique par catégorie (cliquez pour choisir) :
            </div>

            {/* Onglets de thématiques */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0b382c] text-white shadow-xs'
                        : 'bg-[#f4f8f4] text-[#0b382c]/80 hover:bg-[#e6f0eb]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Chips de la catégorie sélectionnée */}
            <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-2xl bg-[#f8faf8] border border-[#0b382c]/6">
              {CATEGORIES.find((c) => c.id === activeCategory)?.items.map((item) => {
                const isSelected = sector.toLowerCase() === item.toLowerCase();
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSector(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0b382c] text-[#c6f432] font-bold shadow-xs scale-105'
                        : 'bg-white text-[#0b382c] border border-[#0b382c]/10 hover:bg-[#0b382c]/5'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Location Grid: City & Country + Raccourcis Villes */}
        <div className="space-y-3">
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

          {/* Raccourcis villes rapides */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-[#4f6b61] mr-1">
              Villes rapides :
            </span>
            {SUGGESTED_CITIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  setCity(c.name);
                  setCountryCode(c.country);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  city === c.name
                    ? 'bg-[#0b382c] text-white'
                    : 'bg-[#f4f8f4] text-[#0b382c] hover:bg-[#e6f0eb]'
                }`}
              >
                {c.name}
              </button>
            ))}
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

            <div className="inline-flex flex-wrap rounded-3xl bg-white p-1 border border-[#0b382c]/10 text-xs">
              {RESULT_OPTIONS.map((num) => (
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
                  {num} {num > 1 ? 'leads' : 'lead'}
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
                  <span>Enrichissement des adresses Emails (inclus)</span>
                </span>
                <p className="text-[11px] text-[#4f6b61] mt-0.5">
                  Le scraper explore le site web et les réseaux sociaux pour extraire l&apos;email en complément des numéros WhatsApp.
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
                Réservation de crédits
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed max-w-md">
              {totalReservedCredits} crédits réservés ({maxResults} &times; {unitCost} cr).
              Les crédits non consommés sont automatiquement remboursés dès la fin du scraping.
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-emerald-800 sm:pl-6 shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
            <div>
              <div className="text-[11px] text-emerald-200">Votre solde actuel</div>
              <div className="font-serif text-2xl font-bold text-white">
                {userCredits} crédits
              </div>
            </div>
            <Link
              href="/billing"
              className="text-[11px] font-bold text-[#c6f432] underline hover:text-white"
            >
              Recharger mes crédits
            </Link>
          </div>
        </div>

        {!hasEnoughCredits && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Solde insuffisant : cette recherche n&eacute;cessite {totalReservedCredits} cr&eacute;dits.
                Votre solde permet {leadsForCredits(userCredits)} prospect(s).
              </span>
            </div>
            <Link
              href="/billing"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b382c] text-[#c6f432] font-bold shrink-0 hover:bg-[#06241c] transition-colors"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Acheter des cr&eacute;dits</span>
            </Link>
          </div>
        )}

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

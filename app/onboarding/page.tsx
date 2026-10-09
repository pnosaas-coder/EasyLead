'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Sparkles,
  ArrowRight,
  Building2,
  Target,
  Globe2,
  Loader2,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

const AFRICAN_COUNTRIES = [
  { code: 'CM', name: 'Cameroun', currency: 'XAF', lang: 'fr' },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF', lang: 'fr' },
  { code: 'SN', name: 'Sénégal', currency: 'XOF', lang: 'fr' },
  { code: 'CD', name: 'RD Congo', currency: 'USD/CDF', lang: 'fr' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', lang: 'en' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', lang: 'en' },
  { code: 'GA', name: 'Gabon', currency: 'XAF', lang: 'fr' },
  { code: 'BJ', name: 'Bénin', currency: 'XOF', lang: 'fr' },
  { code: 'TG', name: 'Togo', currency: 'XOF', lang: 'fr' },
  { code: 'BF', name: 'Burkina Faso', currency: 'XOF', lang: 'fr' },
  { code: 'ML', name: 'Mali', currency: 'XOF', lang: 'fr' },
  { code: 'GN', name: 'Guinée', currency: 'GNF', lang: 'fr' },
  { code: 'KE', name: 'Kenya', currency: 'KES', lang: 'en' },
  { code: 'RW', name: 'Rwanda', currency: 'RWF', lang: 'en' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [companyName, setCompanyName] = useState('Prunus Engineering SARL');
  const [offerDescription, setOfferDescription] = useState(
    'Solutions d’ingénierie logicielle, intégration ERP et digitalisation des opérations pour les entreprises et industries en Afrique centrale.'
  );
  const [targetDescription, setTargetDescription] = useState(
    'Directeurs généraux, directeurs des opérations, gérants de cliniques, hôtels, distributeurs et PME en croissance à Douala, Yaoundé et dans la zone CEMAC.'
  );
  const [countryCode, setCountryCode] = useState('CM');
  const [defaultLanguage, setDefaultLanguage] = useState<'fr' | 'en'>('fr');

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          // Pré-charger le profil s'il existe déjà
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            if (profile.company_name) setCompanyName(profile.company_name);
            if (profile.offer_description)
              setOfferDescription(profile.offer_description);
            if (profile.target_description)
              setTargetDescription(profile.target_description);
            if (profile.country_code) setCountryCode(profile.country_code);
            if (profile.default_language)
              setDefaultLanguage(profile.default_language as 'fr' | 'en');

            // Si déjà onboardé, renvoyer direct au dashboard
            if (profile.onboarded) {
              router.push('/dashboard');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user on onboarding', err);
      } finally {
        setIsFetchingUser(false);
      }
    }

    checkUser();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const targetId = user?.id || userId;

      if (targetId) {
        const { error } = await supabase
          .from('profiles')
          .update({
            company_name: companyName,
            offer_description: offerDescription,
            target_description: targetDescription,
            country_code: countryCode,
            default_language: defaultLanguage,
            onboarded: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetId);

        if (error) throw error;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement de l'onboarding.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingUser) {
    return (
      <div className="min-h-screen bg-[#f4f8f4] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0b382c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8f4] flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#0b382c]/10 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#0b382c] flex items-center justify-center text-[#c6f432] shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#0b382c]">
              EasyLead Onboarding
            </span>
            <span className="block text-xs font-semibold text-[#0b382c]/60 -mt-0.5 uppercase tracking-wider">
              Personnalisation de vos prompts IA
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#c6f432]/20 border border-[#c6f432]/50 text-[#0b382c] mb-8 text-xs font-medium leading-relaxed">
          💡 Ces informations sont injectées dans chaque prompt Claude
          (WhatsApp, Email, Script d&apos;appel) pour formuler des messages sur
          mesure, crédibles et parfaitement alignés avec votre activité en
          Afrique.
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0b382c]/80 mb-2">
              1. Nom de votre structure / Entreprise
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#0b382c]/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex : Prunus Engineering SARL"
                className="w-full bg-[#f4f8f4] border border-[#0b382c]/15 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium text-[#0b382c] placeholder-[#0b382c]/35 focus:outline-none focus:ring-2 focus:ring-[#0b382c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0b382c]/80 mb-2">
                2. Pays principal d&apos;opération
              </label>
              <div className="relative">
                <Globe2 className="w-4 h-4 text-[#0b382c]/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full bg-[#f4f8f4] border border-[#0b382c]/15 rounded-2xl pl-11 pr-8 py-3 text-sm font-medium text-[#0b382c] focus:outline-none focus:ring-2 focus:ring-[#0b382c] cursor-pointer appearance-none"
                >
                  {AFRICAN_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0b382c]/80 mb-2">
                3. Langue de prospection par défaut
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDefaultLanguage('fr')}
                  className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-xs border transition-all cursor-pointer ${
                    defaultLanguage === 'fr'
                      ? 'bg-[#0b382c] text-[#c6f432] border-[#0b382c]'
                      : 'bg-[#f4f8f4] text-[#0b382c]/70 border-[#0b382c]/15 hover:border-[#0b382c]'
                  }`}
                >
                  Français (FR)
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultLanguage('en')}
                  className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-xs border transition-all cursor-pointer ${
                    defaultLanguage === 'en'
                      ? 'bg-[#0b382c] text-[#c6f432] border-[#0b382c]'
                      : 'bg-[#f4f8f4] text-[#0b382c]/70 border-[#0b382c]/15 hover:border-[#0b382c]'
                  }`}
                >
                  Anglais (EN)
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0b382c]/80">
                4. Que vendez-vous ? (Votre Offre Clé)
              </label>
              <span className="text-[11px] text-[#0b382c]/50">
                Crucial pour l&apos;accroche IA
              </span>
            </div>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-[#0b382c]/40 absolute left-4 top-4" />
              <textarea
                required
                rows={3}
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
                placeholder="Ex : Création de sites web et applications mobiles pour PME avec garantie de livraison en 2 semaines..."
                className="w-full bg-[#f4f8f4] border border-[#0b382c]/15 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium text-[#0b382c] placeholder-[#0b382c]/35 focus:outline-none focus:ring-2 focus:ring-[#0b382c]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0b382c]/80">
                5. Votre Cible Idéale (ICP)
              </label>
              <span className="text-[11px] text-[#0b382c]/50">
                Secteurs & décideurs
              </span>
            </div>
            <div className="relative">
              <Target className="w-4 h-4 text-[#0b382c]/40 absolute left-4 top-4" />
              <textarea
                required
                rows={3}
                value={targetDescription}
                onChange={(e) => setTargetDescription(e.target.value)}
                placeholder="Ex : Gérants d'hôtels, restaurants, cliniques privées, commerces de détail avec plus de 5 employés..."
                className="w-full bg-[#f4f8f4] border border-[#0b382c]/15 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium text-[#0b382c] placeholder-[#0b382c]/35 focus:outline-none focus:ring-2 focus:ring-[#0b382c]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0b382c] hover:bg-[#07251d] text-[#c6f432] font-semibold py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Enregistrer et accéder au Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

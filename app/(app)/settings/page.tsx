'use client';

import React, { useState } from 'react';
import {
  User,
  Sparkles,
  MapPin,
  Save,
  CheckCircle2,
  Phone,
  Loader2,
  LogOut,
} from 'lucide-react';
import { useUser } from '@/components/providers/user-provider';
import { createClient } from '@/lib/supabase/client';
import { CURRENT_USER } from '@/lib/mock-data';

export function SettingsPage() {
  const { user, profile, refreshProfile, signOut } = useUser();

  const [name, setName] = useState(profile.fullName || CURRENT_USER.name);
  const [role, setRole] = useState(profile.role || CURRENT_USER.role);
  const [email, setEmail] = useState(profile.email || CURRENT_USER.email);
  const [company, setCompany] = useState(profile.companyName || CURRENT_USER.company);
  const [city, setCity] = useState(profile.city || CURRENT_USER.city);
  const [country, setCountry] = useState(profile.country || CURRENT_USER.country);

  // Official contact numbers
  const [phoneMtn, setPhoneMtn] = useState('+237 677 48 11 61');
  const [phoneOrange, setPhoneOrange] = useState('+237 691 11 49 08');

  // Business offer feeding the AI prompts as per spec!
  const [offerDescription, setOfferDescription] = useState(
    profile.offerDescription ||
      'Nous fournissons aux PME et entreprises du Cameroun des solutions d’approvisionnement direct et de prospection commerciale B2B automatisée.'
  );
  const [targetDescription, setTargetDescription] = useState(
    profile.targetDescription ||
      'Directeurs généraux, Directeurs des achats, Responsables commerciaux et Décisionnaires PME/PMI au Cameroun.'
  );
  const [defaultLanguage, setDefaultLanguage] = useState<'fr' | 'en'>(
    profile.defaultLanguage || 'fr'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [prevProfileId, setPrevProfileId] = useState<string | null>(profile?.id || null);

  if (profile && profile.id !== prevProfileId) {
    setPrevProfileId(profile.id);
    setName(profile.fullName || CURRENT_USER.name);
    setRole(profile.role || CURRENT_USER.role);
    setEmail(profile.email || CURRENT_USER.email);
    setCompany(profile.companyName || CURRENT_USER.company);
    setCity(profile.city || CURRENT_USER.city);
    setCountry(profile.country || CURRENT_USER.country);
    if (profile.offerDescription) setOfferDescription(profile.offerDescription);
    if (profile.targetDescription) setTargetDescription(profile.targetDescription);
    if (profile.defaultLanguage) setDefaultLanguage(profile.defaultLanguage);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (user?.id) {
        const supabase = createClient();
        await supabase
          .from('profiles')
          .update({
            full_name: name,
            company_name: company,
            offer_description: offerDescription,
            target_description: targetDescription,
            default_language: defaultLanguage,
            country_code: country === 'Cameroun' ? 'CM' : 'CI',
          })
          .eq('id', user.id);

        await refreshProfile();
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error('Erreur sauvegarde profil:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#0b382c] border border-[#0b382c]/10 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#c6f432] ring-2 ring-[#0b382c]/20" />
          <span>Profil Fondateur &bull; Param&egrave;tres de l&apos;Offre IA</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#0b382c]">
          Param&egrave;tres &amp; Configuration
        </h1>

        <p className="text-sm sm:text-base text-[#4f6b61] leading-relaxed">
          Configurez votre profil et les d&eacute;tails de votre offre commerciale. 
          Ces informations sont automatiquement inject&eacute;es dans les prompts IA Claude pour r&eacute;diger des messages ultra-cibl&eacute;s.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-[#e5f4ef] border border-emerald-300 text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm font-bold">
            Modifications enregistr&eacute;es avec succ&egrave;s. Vos prochains messages IA utiliseront ces donn&eacute;es !
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Profil & Identité Fondateur */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0b382c]/8 shadow-[0_4px_24px_-4px_rgba(11,56,44,0.04)] space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#0b382c]/6">
            <div className="w-10 h-10 rounded-2xl bg-[#c6f432] text-[#0b382c] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#0b382c]">
                Identit&eacute; du Fondateur &amp; Compte
              </h2>
              <p className="text-xs text-[#4f6b61]">
                Informations visibles sur vos re&ccedil;us et signatures de messages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0b382c]">Nom complet</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs sm:text-sm font-bold text-[#0b382c] focus:outline-none focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0b382c]">Fonction / Titre</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs sm:text-sm font-medium text-[#0b382c] focus:outline-none focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0b382c]">Email professionnel</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs sm:text-sm font-medium text-[#0b382c] focus:outline-none focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0b382c]">Nom de l&apos;entreprise</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs sm:text-sm font-bold text-[#0b382c] focus:outline-none focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contexte de l'Offre pour les Prompts IA */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0b382c]/8 shadow-[0_4px_24px_-4px_rgba(11,56,44,0.04)] space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#0b382c]/6">
            <div className="w-10 h-10 rounded-2xl bg-[#0b382c] text-[#c6f432] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#0b382c]">
                Contexte Commercial inject&eacute; dans l&apos;IA
              </h2>
              <p className="text-xs text-[#4f6b61]">
                Indispensable pour g&eacute;n&eacute;rer des accroches WhatsApp et des emails sp&eacute;cifiques &agrave; votre activit&eacute;.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0b382c] flex items-center justify-between">
                <span>Que vendez-vous ? (Votre Offre &amp; Proposition de valeur)</span>
                <span className="text-[11px] text-[#4f6b61] font-normal">Inject&eacute; dans chaque prompt</span>
              </label>
              <textarea
                rows={3}
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
                placeholder="Ex: Je crée des sites web et gère les publicités Facebook pour les commerces et hôtels de Douala..."
                className="w-full p-3.5 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs sm:text-sm text-[#0b382c] focus:outline-none focus:bg-white resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0b382c] flex items-center justify-between">
                <span>Qui sont vos clients id&eacute;aux ? (Cible)</span>
                <span className="text-[11px] text-[#4f6b61] font-normal">Personas d&apos;acheteurs</span>
              </label>
              <textarea
                rows={2}
                value={targetDescription}
                onChange={(e) => setTargetDescription(e.target.value)}
                placeholder="Ex: Directeurs d'achats, hôteliers, architectes, chefs d'entreprises PME..."
                className="w-full p-3.5 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs sm:text-sm text-[#0b382c] focus:outline-none focus:bg-white resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Marché & Localisation */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0b382c]/8 shadow-[0_4px_24px_-4px_rgba(11,56,44,0.04)] space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#0b382c]/6">
            <div className="w-10 h-10 rounded-2xl bg-[#c6f432] text-[#0b382c] flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#0b382c]">
                March&eacute; et Langue par d&eacute;faut
              </h2>
              <p className="text-xs text-[#4f6b61]">
                Configuration r&eacute;gionale pour le format des num&eacute;ros et devises.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0b382c]">Ville du si&egrave;ge</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs sm:text-sm font-bold text-[#0b382c] focus:outline-none focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0b382c]">Pays principal</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs sm:text-sm font-bold text-[#0b382c] focus:outline-none focus:bg-white appearance-none"
              >
                <option value="Cameroun">🇨🇲 Cameroun</option>
                <option value="Côte d'Ivoire">🇨🇮 Côte d&apos;Ivoire</option>
                <option value="Sénégal">🇸🇳 Sénégal</option>
                <option value="Gabon">🇬🇦 Gabon</option>
                <option value="Bénin">🇧🇯 Bénin</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0b382c]">Langue des messages</label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value as 'fr' | 'en')}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs sm:text-sm font-bold text-[#0b382c] focus:outline-none focus:bg-white appearance-none"
              >
                <option value="fr">Français (Afrique francophone)</option>
                <option value="en">English (Nigeria, Ghana, Kenya)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Coordonnées & Lignes Mobile Money Cameroun */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0b382c]/8 shadow-[0_4px_24px_-4px_rgba(11,56,44,0.04)] space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#0b382c]/6">
            <div className="w-10 h-10 rounded-2xl bg-[#0b382c] text-[#c6f432] flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#0b382c]">
                Lignes Téléphoniques &amp; Mobile Money
              </h2>
              <p className="text-xs text-[#4f6b61]">
                Num&eacute;ros officiels utilis&eacute;s pour la confirmation de paiement USSD et le support client WhatsApp.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 p-4 rounded-2xl bg-[#fffdf0] border border-[#ffcc00]/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0b382c] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffcc00]" />
                  <span>Ligne MTN MoMo (Cameroun)</span>
                </label>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Actif &bull; Principal
                </span>
              </div>
              <input
                type="text"
                value={phoneMtn}
                onChange={(e) => setPhoneMtn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ffcc00]/60 text-xs sm:text-sm font-mono font-bold text-[#0b382c] focus:outline-none focus:ring-2 focus:ring-[#ffcc00]"
              />
              <p className="text-[11px] text-[#4f6b61]">
                Associ&eacute; au compte marchand et support WhatsApp (+237 677 48 11 61).
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-[#fffaf5] border border-[#ff7900]/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0b382c] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff7900]" />
                  <span>Ligne Orange Money (Cameroun)</span>
                </label>
                <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                  Actif &bull; Secondaire
                </span>
              </div>
              <input
                type="text"
                value={phoneOrange}
                onChange={(e) => setPhoneOrange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ff7900]/60 text-xs sm:text-sm font-mono font-bold text-[#0b382c] focus:outline-none focus:ring-2 focus:ring-[#ff7900]"
              />
              <p className="text-[11px] text-[#4f6b61]">
                Associ&eacute; au compte Orange Money Cameroun (+237 691 11 49 08).
              </p>
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0b382c] hover:bg-[#06241c] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 text-[#c6f432] animate-spin" />
                <span>Enregistrement en cours...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#c6f432]" />
                <span>Enregistrer les param&egrave;tres</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Section Sécurité & Déconnexion */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-[0_4px_24px_-4px_rgba(225,29,72,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-rose-600" />
            <h2 className="font-serif text-lg font-bold text-rose-950">
              Session Active &amp; D&eacute;connexion
            </h2>
          </div>
          <p className="text-xs text-[#4f6b61]">
            Vous &ecirc;tes connect&eacute; avec l&apos;adresse email <strong className="text-[#0b382c]">{profile.email}</strong>.
            Cliquez pour fermer votre session sur cet appareil en toute s&eacute;curit&eacute;.
          </p>
        </div>

        <button
          type="button"
          onClick={() => signOut()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.98]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Se d&eacute;connecter</span>
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;

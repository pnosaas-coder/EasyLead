import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Building2, Phone, Mail } from 'lucide-react';

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-[#f4f8f4] text-[#142922] py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0b382c] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au tableau de bord</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 border border-[#0b382c]/8 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#0b382c]">
            <ShieldCheck className="w-4 h-4 text-[#0b382c]" />
            <span>Mentions Légales &amp; Conditions Générales d&apos;Utilisation</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0b382c]">
            Conditions Générales d&apos;Utilisation (CGU)
          </h1>
          <p className="text-xs sm:text-sm text-[#4f6b61]">
            Dernière mise à jour : 09 Octobre 2026 &bull; Plateforme EasyLead Africa
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 border border-[#0b382c]/8 shadow-sm space-y-8 text-sm leading-relaxed text-[#314a40]">
          {/* Article 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b382c]">
              1. Informations Légales &amp; Éditeur
            </h2>
            <div className="p-4 rounded-2xl bg-[#f8faf8] border border-[#0b382c]/6 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-bold text-[#0b382c]">
                <Building2 className="w-4 h-4 text-[#0b382c]" />
                <span>EasyLead SARL</span>
              </div>
              <p>
                <strong>Siège Social :</strong> Douala, République du Cameroun (Zone Akwa &bull; Boulevard de la Liberté).
              </p>
              <p>
                <strong>Gérant Fondateur :</strong> Philippe NOUGOUE
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs">
                <span className="flex items-center gap-1 text-[#0b382c]">
                  <Phone className="w-3.5 h-3.5 text-[#ffcc00]" />
                  <span>MTN : +237 677 48 11 61</span>
                </span>
                <span className="flex items-center gap-1 text-[#0b382c]">
                  <Phone className="w-3.5 h-3.5 text-[#ff7900]" />
                  <span>Orange : +237 691 11 49 08</span>
                </span>
                <span className="flex items-center gap-1 text-[#0b382c]">
                  <Mail className="w-3.5 h-3.5 text-emerald-700" />
                  <span>contact@easylead.africa</span>
                </span>
              </div>
            </div>
          </section>

          {/* Article 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b382c]">
              2. Objet du Service
            </h2>
            <p>
              EasyLead est une plateforme SaaS de prospection commerciale B2B dédiée au marché africain.
              Le service permet aux entreprises et commerciaux de rechercher des professionnels et établissements
              à partir des données publiques disponibles sur Google Maps, de normaliser les numéros de téléphone au format international (E.164),
              et de générer des suggestions d&apos;accroches commerciales par Intelligence Artificielle (WhatsApp, Email, Script d&apos;appel).
            </p>
          </section>

          {/* Article 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b382c]">
              3. Système de Crédits Prépayés &amp; Paiement
            </h2>
            <p>
              L&apos;utilisation d&apos;EasyLead ne nécessite aucun abonnement récurrent obligatoire. Les services sont facturés
              selon un barème de crédits prépayés acquis par l&apos;utilisateur :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>1 crédit = 1 fiche entreprise qualifiée ou 1 message IA personnalisé rédigé.</li>
              <li>Les crédits achetés n&apos;ont aucune date d&apos;expiration et restent valables indéfiniment.</li>
              <li>Les paiements sont traités par la passerelle sécurisée CinetPay via Mobile Money (MTN MoMo, Orange Money, Wave) et Carte Bancaire en FCFA.</li>
            </ul>
          </section>

          {/* Article 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b382c]">
              4. Respect des Règles de Prospection B2B
            </h2>
            <p>
              EasyLead fournit des outils d&apos;aide à la prospection directe entre professionnels. L&apos;utilisateur est seul
              responsable de l&apos;envoi effectif des messages depuis ses propres canaux (son compte WhatsApp personnel ou sa messagerie d&apos;entreprise).
              L&apos;utilisateur s&apos;engage à respecter les législations locales applicables en matière de communications électroniques
              et à honorer immédiatement toute demande de désinscription ou d&apos;opposition (opt-out).
            </p>
          </section>

          {/* Article 5 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b382c]">
              5. Droit Applicable &amp; Juridiction
            </h2>
            <p>
              Les présentes conditions sont régies par le droit camerounais et les règles communautaires de la zone OHADA.
              Tout litige sera soumis à la compétence des tribunaux compétents de Douala, Cameroun.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

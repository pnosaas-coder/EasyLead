import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';

export default function ConfidentialitePage() {
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
            <Lock className="w-4 h-4 text-[#0b382c]" />
            <span>Protection des Données Personnelles &amp; Vie Privée</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0b382c]">
            Politique de Confidentialité
          </h1>
          <p className="text-xs sm:text-sm text-[#4f6b61]">
            Applicable aux services EasyLead &bull; Conforme aux réglementations africaines et internationales
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 border border-[#0b382c]/8 shadow-sm space-y-8 text-sm leading-relaxed text-[#314a40]">
          {/* Article 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b382c]">
              1. Nature des Données Traitées
            </h2>
            <p>
              EasyLead traite exclusivement des <strong>données publiques professionnelles (B2B)</strong> d&apos;entreprises,
              de commerces et de prestataires référencés publiquement sur Google Maps. Ces données comprennent :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#f8faf8] border border-[#0b382c]/6 flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Raison sociale, nom d&apos;établissement et enseigne</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f8faf8] border border-[#0b382c]/6 flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Adresse physique, ville et pays d&apos;implantation</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f8faf8] border border-[#0b382c]/6 flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Numéro de téléphone professionnel (normalisé E.164)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f8faf8] border border-[#0b382c]/6 flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Site internet public, note et nombre d&apos;avis publics</span>
              </div>
            </div>
          </section>

          {/* Article 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b382c]">
              2. Utilisation de l&apos;Intelligence Artificielle &amp; Confidentialité
            </h2>
            <p>
              Les prompts générés pour WhatsApp, Email et les scripts d&apos;appel sont traités via des modèles d&apos;IA de pointe (Anthropic Claude).
              Vos données d&apos;offre commerciale et les données des leads sont traitées dans un environnement isolé :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Aucune donnée client n&apos;est utilisée pour entraîner des modèles d&apos;IA publics.</li>
              <li>Les messages sont générés à la demande et restent confidentiels à votre compte.</li>
              <li>Aucun envoi automatisé n&apos;est effectué par la plateforme : vous gardez le contrôle direct de chaque envoi.</li>
            </ul>
          </section>

          {/* Article 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b382c]">
              3. Sécurité des Paiements Mobile Money
            </h2>
            <p>
              EasyLead ne stocke aucun mot de passe ni code secret USSD ou numéro de carte bancaire.
              Toutes les transactions sont déléguées à l&apos;opérateur agréé <strong>CinetPay</strong>, certifié PCI-DSS
              et relié directement aux opérateurs télécoms (MTN Mobile Money, Orange Money, Wave).
            </p>
          </section>

          {/* Article 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b382c]">
              4. Droit d&apos;Accès, de Rectification &amp; Droit à l&apos;Oubli (Opt-Out)
            </h2>
            <p>
              Conformément aux législations sur la protection des données personnelles en vigueur en Afrique et à l&apos;international,
              toute entreprise ou professionnel qui souhaite que ses coordonnées soient retirées de la base EasyLead
              peut exercer son droit d&apos;opposition à tout moment par simple message :
            </p>
            <div className="p-4 rounded-2xl bg-[#f8faf8] border border-[#0b382c]/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <div className="font-bold text-[#0b382c]">Délégué à la Protection des Données :</div>
                <div className="text-[#4f6b61]">Philippe NOUGOUE &bull; EasyLead SARL (Douala, Cameroun)</div>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <a
                  href="mailto:contact@easylead.africa?subject=Demande%20de%20retrait%20Opt-out"
                  className="px-3.5 py-1.5 rounded-full bg-[#0b382c] text-white hover:bg-[#06241c] transition-colors font-bold"
                >
                  Demande par Email
                </a>
                <a
                  href="https://wa.me/237677481161?text=Demande%20de%20retrait%20Opt-Out%20EasyLead"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full bg-[#c6f432] text-[#0b382c] hover:bg-[#b5e326] transition-colors font-bold"
                >
                  WhatsApp Direct
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

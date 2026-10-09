import React from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  ThumbsUp,
  Award,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { MOCK_LEADS } from '@/lib/mock-data';
import { LeadsTable } from '@/components/leads-table';
import { Lead } from '@/lib/types';
import { connection } from 'next/server';

export const instant = false;

export default async function LeadsPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dbLeads: Lead[] = [];

  if (user) {
    const { data: rawLeads } = await supabase
      .from('leads')
      .select('*, messages(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (rawLeads && rawLeads.length > 0) {
      dbLeads = rawLeads.map((l) => ({
        id: l.id,
        searchId: l.search_id,
        name: l.name,
        category: l.category || 'Commerce',
        address: l.address || '',
        city: l.city || 'Douala',
        country: l.country_code || 'CM',
        countryCode: l.country_code || 'CM',
        phone: l.phone || undefined,
        phoneE164: l.phone_e164 || undefined,
        website: l.website || undefined,
        email: l.email || undefined,
        rating: Number(l.rating) || 0,
        reviewsCount: Number(l.reviews_count) || 0,
        mapsUrl: l.maps_url || '',
        status: (l.status as Lead['status']) || 'new',
        notes: l.notes || undefined,
        messages: (l.messages || []).map((m) => ({
          id: m.id,
          leadId: m.lead_id,
          channel: m.channel,
          language: (m.language as 'fr' | 'en') || 'fr',
          tone: (m.tone as 'professionnel' | 'chaleureux' | 'direct') || 'professionnel',
          subject: m.subject || undefined,
          body: m.body,
          createdAt: m.created_at,
        })),
      }));
    }
  }

  // Si l'utilisateur n'a pas encore de leads scrapés, afficher les mock leads comme démonstration
  const allLeads = dbLeads.length > 0 ? dbLeads : MOCK_LEADS;
  const isUsingRealData = dbLeads.length > 0;

  const newCount = allLeads.filter((l) => l.status === 'new').length;
  const contactedCount = allLeads.filter((l) => l.status === 'contacted').length;
  const repliedCount = allLeads.filter((l) => l.status === 'replied').length;
  const wonCount = allLeads.filter((l) => l.status === 'won').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#0b382c] border border-[#0b382c]/10 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#c6f432] ring-2 ring-[#0b382c]/20" />
            <span>Mini-CRM B2B &bull; Suivi de Prospection</span>
            {isUsingRealData && (
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full">
                Données Live Supabase
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#0b382c] leading-[1.15]">
            Répertoire Central de vos Prospects
          </h1>

          <p className="text-sm sm:text-base text-[#4f6b61] leading-relaxed max-w-2xl">
            Suivez l&apos;état d&apos;avancement de chaque contact extrait sur Google Maps. 
            Modifiez leurs statuts en direct, ajoutez des mémos et générez vos messages WhatsApp personnalisés avec l&apos;IA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/searches/new"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#0b382c] hover:bg-[#06241c] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            <Search className="w-4 h-4 text-[#c6f432]" />
            <span>+ Lancer un nouveau scraping</span>
          </Link>
        </div>
      </section>

      {/* Mini-CRM Pipeline Summary Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#0b382c]/8 shadow-2xs">
          <div className="text-xs font-bold text-[#4f6b61] uppercase tracking-wider mb-1">
            Nouveaux Prospects
          </div>
          <div className="font-serif text-3xl font-bold text-[#0b382c]">
            {newCount}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">À contacter en priorité</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#0b382c]/8 shadow-2xs">
          <div className="text-xs font-bold text-[#4f6b61] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Contactés</span>
          </div>
          <div className="font-serif text-3xl font-bold text-[#0b382c]">
            {contactedCount}
          </div>
          <div className="text-[11px] text-blue-700 mt-1">WhatsApp / Email envoyé</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#0b382c]/8 shadow-2xs">
          <div className="text-xs font-bold text-[#4f6b61] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ThumbsUp className="w-3.5 h-3.5 text-amber-600" />
            <span>Réponses</span>
          </div>
          <div className="font-serif text-3xl font-bold text-[#0b382c]">
            {repliedCount}
          </div>
          <div className="text-[11px] text-amber-800 mt-1">En phase d&apos;échange</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#0b382c]/8 shadow-2xs">
          <div className="text-xs font-bold text-[#4f6b61] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Clients Gagnés</span>
          </div>
          <div className="font-serif text-3xl font-bold text-emerald-800">
            {wonCount}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">Contrats convertis</div>
        </div>
      </section>

      {/* Main Leads Table with Drawer */}
      <section>
        <LeadsTable
          initialLeads={allLeads}
          title={isUsingRealData ? `Vos Prospects Réels (${allLeads.length})` : 'Tous les Leads Référencés'}
          subtitle="Filtrez par statut, par opportunité (sans site web) et lancez vos messages IA."
          showExport={true}
        />
      </section>
    </div>
  );
}

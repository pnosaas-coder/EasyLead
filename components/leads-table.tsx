'use client';

import React, { useState } from 'react';
import {
  Search,
  Phone,
  Mail,
  Globe,
  Star,
  MapPin,
  Sparkles,
  MessageCircle,
  Download,
  CheckCircle2,
  Clock,
  ThumbsUp,
} from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/types';
import { LeadDrawer } from './lead-drawer';

interface LeadsTableProps {
  initialLeads: Lead[];
  title?: string;
  subtitle?: string;
  showExport?: boolean;
}

export function LeadsTable({
  initialLeads,
  title = 'Annuaire des Leads Qualifiés',
  subtitle = 'Gérez vos prospects B2B, filtrez les opportunités et lancez vos messages IA.',
  showExport = true,
}: LeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [onlyPhone, setOnlyPhone] = useState(false);
  const [onlyEmail, setOnlyEmail] = useState(false);
  const [noWebsite, setNoWebsite] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPhone = !onlyPhone || !!lead.phone;
    const matchesEmail = !onlyEmail || !!lead.email;
    const matchesNoWebsite = !noWebsite || !lead.website;
    const matchesRating = lead.rating >= minRating;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPhone &&
      matchesEmail &&
      matchesNoWebsite &&
      matchesRating
    );
  });

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleNotesChange = (leadId: string, newNotes: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes: newNotes } : l))
    );
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
            Nouveau
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            Contact&eacute;
          </span>
        );
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <ThumbsUp className="w-3 h-3 text-amber-600" />
            A r&eacute;pondu
          </span>
        );
      case 'won':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e5f4ef] text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Gagn&eacute; (Client)
          </span>
        );
      case 'lost':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
            Perdu
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#0b382c]/8 shadow-[0_4px_24px_-4px_rgba(11,56,44,0.04)] overflow-hidden">
      {/* Table Header with Search and Stats */}
      <div className="p-6 sm:p-7 border-b border-[#0b382c]/6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef7f2] text-[#0b382c] border border-[#0b382c]/10 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c6f432]" />
              <span>Mini-CRM &amp; R&eacute;pertoire Prospects</span>
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#0b382c]">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-[#4f6b61] mt-0.5">
              {subtitle}
            </p>
          </div>

          {/* Quick Search Input & Export Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4f6b61]" />
              <input
                type="text"
                placeholder="Rechercher nom, quartier, mot-clé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-full bg-[#f4f8f4] border border-[#0b382c]/10 text-[#0b382c] focus:outline-none focus:border-[#0b382c] focus:bg-white transition-all w-48 sm:w-64"
              />
            </div>

            {showExport && (
              <button
                type="button"
                onClick={() => alert(`Exportation de ${filteredLeads.length} leads au format CSV (séparateur point-virgule Excel avec BOM UTF-8).`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f4f8f4] hover:bg-[#e6f4ea] text-[#0b382c] text-xs font-bold border border-[#0b382c]/10 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter CSV ({filteredLeads.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#0b382c]/6 text-xs">
          {/* Status Tabs */}
          <div className="inline-flex rounded-full bg-[#f4f8f4] p-1 border border-[#0b382c]/8">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#0b382c] text-white shadow-xs'
                  : 'text-[#4f6b61] hover:text-[#0b382c]'
              }`}
            >
              Tous ({leads.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('new')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                statusFilter === 'new'
                  ? 'bg-[#0b382c] text-white shadow-xs'
                  : 'text-[#4f6b61] hover:text-[#0b382c]'
              }`}
            >
              Nouveaux
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('contacted')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                statusFilter === 'contacted'
                  ? 'bg-[#0b382c] text-white shadow-xs'
                  : 'text-[#4f6b61] hover:text-[#0b382c]'
              }`}
            >
              Contact&eacute;s
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('won')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                statusFilter === 'won'
                  ? 'bg-[#0b382c] text-white shadow-xs'
                  : 'text-[#4f6b61] hover:text-[#0b382c]'
              }`}
            >
              Clients gagn&eacute;s
            </button>
          </div>

          {/* Quick Opportunity Filter Pills */}
          <button
            type="button"
            onClick={() => setNoWebsite(!noWebsite)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border transition-all ${
              noWebsite
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-white text-[#4f6b61] border-neutral-200 hover:border-[#0b382c]/20'
            }`}
          >
            <span>🌐 Sans site web (Opportunit&eacute;)</span>
          </button>

          <button
            type="button"
            onClick={() => setOnlyPhone(!onlyPhone)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border transition-all ${
              onlyPhone
                ? 'bg-emerald-100 text-[#0b382c] border-emerald-300 shadow-xs'
                : 'bg-white text-[#4f6b61] border-neutral-200 hover:border-[#0b382c]/20'
            }`}
          >
            <span>📱 Avec WhatsApp/T&eacute;l</span>
          </button>

          <button
            type="button"
            onClick={() => setOnlyEmail(!onlyEmail)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border transition-all ${
              onlyEmail
                ? 'bg-blue-100 text-blue-900 border-blue-300 shadow-xs'
                : 'bg-white text-[#4f6b61] border-neutral-200 hover:border-[#0b382c]/20'
            }`}
          >
            <span>📧 Avec Email</span>
          </button>

          <button
            type="button"
            onClick={() => setMinRating(minRating === 4.5 ? 0 : 4.5)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border transition-all ${
              minRating === 4.5
                ? 'bg-yellow-100 text-yellow-900 border-yellow-300 shadow-xs'
                : 'bg-white text-[#4f6b61] border-neutral-200 hover:border-[#0b382c]/20'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>Note &gt; 4.5&starf;</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8faf8] border-b border-[#0b382c]/6 text-[11px] font-bold uppercase tracking-wider text-[#4f6b61]">
              <th className="py-3.5 px-6">Entreprise &amp; Cat&eacute;gorie</th>
              <th className="py-3.5 px-6">Localisation &amp; Avis</th>
              <th className="py-3.5 px-6">Coordonn&eacute;es</th>
              <th className="py-3.5 px-6">Statut CRM</th>
              <th className="py-3.5 px-6 text-right">Actions IA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0b382c]/6 text-xs text-[#142922]">
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-[#fbfdfb] transition-colors group"
              >
                {/* Enterprise Name & Category */}
                <td className="py-4 px-6">
                  <div className="font-bold text-[#0b382c] text-sm group-hover:text-emerald-900">
                    {lead.name}
                  </div>
                  <div className="text-[11px] text-[#4f6b61] mt-0.5">
                    {lead.category}
                  </div>
                  {lead.notes && (
                    <div className="text-[10px] text-neutral-500 italic mt-1 line-clamp-1">
                      &laquo; {lead.notes} &raquo;
                    </div>
                  )}
                </td>

                {/* Location & Google Rating */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1.5 text-xs text-[#0b382c]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{lead.address || lead.city}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#4f6b61] mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-[#0b382c]">{lead.rating}</span>
                    <span>({lead.reviewsCount} avis)</span>
                  </div>
                </td>

                {/* Contacts (Phone, Website, Email) */}
                <td className="py-4 px-6 space-y-1">
                  {lead.phone && (
                    <div className="font-mono text-xs font-semibold text-[#0b382c] flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-[#25D366]" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                  {lead.email && (
                    <div className="text-[11px] text-[#4f6b61] flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-blue-500" />
                      <span className="truncate max-w-[160px]">{lead.email}</span>
                    </div>
                  )}
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      <span className="truncate max-w-[140px]">
                        {lead.website.replace('https://', '')}
                      </span>
                    </a>
                  ) : (
                    <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Sans site web
                    </span>
                  )}
                </td>

                {/* CRM Status select */}
                <td className="py-4 px-6">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                    className="text-xs font-semibold rounded-full px-2.5 py-1 bg-[#f4f8f4] border border-[#0b382c]/10 text-[#0b382c] cursor-pointer"
                  >
                    <option value="new">Nouveau</option>
                    <option value="contacted">Contacté</option>
                    <option value="replied">A répondu</option>
                    <option value="won">Gagné</option>
                    <option value="lost">Perdu</option>
                  </select>
                </td>

                {/* Actions: Pitch IA & WhatsApp button */}
                <td className="py-4 px-6 text-right">
                  <div className="inline-flex items-center gap-2">
                    {/* Open Drawer with AI pitch */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsDrawerOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#c6f432] hover:bg-[#b5e326] text-[#0b382c] text-xs font-bold transition-all shadow-2xs hover:scale-105"
                      title="Générer pitch WhatsApp / Email / Script"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-[#0b382c]" />
                      <span>Pitch IA</span>
                    </button>

                    {/* Direct WhatsApp link */}
                    {lead.phoneE164 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsDrawerOpen(true);
                        }}
                        className="p-1.5 rounded-full bg-[#eaf8ee] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors border border-emerald-200"
                        title="Ouvrir sur WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View (< md) */}
      <div className="md:hidden divide-y divide-[#0b382c]/6 p-4 space-y-3">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="p-4 rounded-2xl bg-[#f8faf8] border border-[#0b382c]/6 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-[#0b382c]">{lead.name}</h3>
                <div className="text-xs text-[#4f6b61]">{lead.category}</div>
              </div>
              {getStatusBadge(lead.status)}
            </div>

            <div className="flex items-center justify-between text-xs text-[#4f6b61]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lead.address || lead.city}</span>
              </span>
              <span className="flex items-center gap-1 font-bold text-[#0b382c]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{lead.rating}</span>
                <span className="text-[#4f6b61] font-normal">({lead.reviewsCount})</span>
              </span>
            </div>

            {lead.phone && (
              <div className="font-mono text-xs font-bold text-[#0b382c] bg-white p-2 rounded-xl border border-[#0b382c]/10 flex items-center justify-between">
                <span>{lead.phone}</span>
                {!lead.website && (
                  <span className="text-[10px] text-amber-800 font-sans font-semibold">
                    Sans site web
                  </span>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-[#0b382c]/6 flex items-center justify-between">
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                className="text-xs font-semibold rounded-lg px-2 py-1 bg-white border border-[#0b382c]/10 text-[#0b382c]"
              >
                <option value="new">Nouveau</option>
                <option value="contacted">Contacté</option>
                <option value="replied">A répondu</option>
                <option value="won">Gagné</option>
                <option value="lost">Perdu</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSelectedLead(lead);
                  setIsDrawerOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0b382c] text-white text-xs font-bold shadow-xs hover:bg-[#06241c]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#c6f432]" />
                <span>Pitch IA &amp; WhatsApp</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Table Footer */}
      <div className="p-4 sm:p-5 bg-[#f8faf8] border-t border-[#0b382c]/6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#4f6b61] gap-2">
        <div>
          Affichage de <span className="font-bold text-[#0b382c]">{filteredLeads.length}</span> sur{' '}
          <span className="font-bold text-[#0b382c]">{leads.length}</span> leads qualifi&eacute;s
        </div>
        <div className="font-medium">
          Tri&eacute; par pertinence Google Maps &amp; volume d&apos;avis
        </div>
      </div>

      {/* Lead Drawer Modal / Slide-over */}
      <LeadDrawer
        lead={selectedLead}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusChange={handleStatusChange}
        onNotesChange={handleNotesChange}
      />
    </div>
  );
}

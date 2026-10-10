'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Calendar,
  MapPin,
  Users2,
  FileText,
  Search,
  Filter,
  ArrowRight,
  Loader2,
  Building2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SearchItem {
  id: string;
  sector: string;
  city: string;
  country_code: string;
  results_count: number;
  created_at: string;
  status: string;
}

export default function ExportsPage() {
  const supabase = createClient();

  const [searches, setSearches] = useState<SearchItem[]>([]);
  const [totalLeadsCount, setTotalLeadsCount] = useState<number>(0);
  const [delimiter, setDelimiter] = useState<';' | ','>(';');
  const [includeMessages, setIncludeMessages] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  useEffect(() => {
    async function loadExportsData() {
      setIsLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // 1. Charger les recherches terminées
          const { data: searchesData } = await supabase
            .from('searches')
            .select('id, sector, city, country_code, results_count, created_at, status')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (searchesData) {
            setSearches(searchesData);
          }

          // 2. Compter le total de leads
          const { count } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          setTotalLeadsCount(count || 0);
        }
      } catch (err) {
        console.error('Error loading exports data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadExportsData();
  }, [supabase]);

  const handleDownloadSearchCSV = async (searchId: string, filename: string) => {
    setDownloadingId(searchId);
    try {
      const url = `/api/searches/${searchId}/export?delimiter=${delimiter}&includeMessages=${includeMessages}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Échec du téléchargement CSV');

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download error:', err);
      alert('Erreur lors du téléchargement du fichier CSV.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAllLeadsCSV = async () => {
    setDownloadingId('all');
    try {
      const url = `/api/leads/export?delimiter=${delimiter}&includeMessages=${includeMessages}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Échec du téléchargement du CRM complet');

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `easylead_tous_les_prospects_${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Global export error:', err);
      alert('Erreur lors de l’export global des prospects.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredSearches = searches.filter((s) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return s.sector.toLowerCase().includes(q) || s.city.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#0b382c]" />
            <span>Exports Excel &bull; Google Sheets &bull; WhatsApp Bulk</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#0b382c]">
            Exports CSV &amp; Fichiers Prospects
          </h1>
          <p className="text-sm text-[#4f6b61] mt-1 max-w-2xl">
            Téléchargez vos listes de prospects enrichies avec numéros WhatsApp, emails, coordonnées et messages personnalisés. Encodage UTF-8 natif pour un affichage parfait dans Excel.
          </p>
        </div>

        <Link
          href="/searches/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0b382c] hover:bg-[#07251d] text-[#c6f432] text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Nouvelle prospection</span>
        </Link>
      </div>

      {/* Options d'export globales */}
      <div className="bg-white rounded-3xl p-6 border border-[#0b382c]/8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0b382c]/8 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#0b382c] flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Format d&apos;exportation personnalisé</span>
            </h2>
            <p className="text-xs text-[#4f6b61]">
              Adaptez le fichier CSV à votre logiciel de travail habituel.
            </p>
          </div>

          {/* Sélecteurs de format */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 bg-[#f4f8f4] p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDelimiter(';')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  delimiter === ';'
                    ? 'bg-[#0b382c] text-white shadow-2xs'
                    : 'text-[#4f6b61] hover:text-[#0b382c]'
                }`}
              >
                Excel FR / Afrique ( ; )
              </button>
              <button
                type="button"
                onClick={() => setDelimiter(',')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  delimiter === ','
                    ? 'bg-[#0b382c] text-white shadow-2xs'
                    : 'text-[#4f6b61] hover:text-[#0b382c]'
                }`}
              >
                Google Sheets / US ( , )
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#0b382c] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeMessages}
                onChange={(e) => setIncludeMessages(e.target.checked)}
                className="w-4 h-4 rounded text-[#0b382c] accent-[#0b382c] cursor-pointer"
              />
              <span>Inclure les messages IA générés</span>
            </label>
          </div>
        </div>

        {/* CARTE EXPORT GLOBAL TOUS LES LEADS */}
        <div className="p-5 rounded-2xl bg-[#0b382c] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c6f432]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#c6f432]">
                Base Complète du CRM
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold">
              Tous vos prospects qualifiés ({totalLeadsCount} leads)
            </h3>
            <p className="text-xs text-emerald-100/80 max-w-xl">
              Exportez l&apos;intégralité des entreprises récoltées avec téléphones vérifiés pour WhatsApp, adresses complètes, catégories et notes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadAllLeadsCSV}
            disabled={downloadingId === 'all' || totalLeadsCount === 0}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c6f432] hover:bg-[#b5e326] text-[#0b382c] text-xs font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 disabled:opacity-50"
          >
            {downloadingId === 'all' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0b382c]" />
                <span>Génération du fichier...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Télécharger tout le CRM (.CSV)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION EXPORTS PAR RECHERCHE */}
      <div className="bg-white rounded-3xl p-6 border border-[#0b382c]/8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0b382c]/8 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#0b382c] flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Exports par recherche &bull; Campagnes ciblées</span>
            </h2>
            <p className="text-xs text-[#4f6b61]">
              Téléchargez les prospects d&apos;une ville ou d&apos;un métier en particulier.
            </p>
          </div>

          {/* Recherche dans les campagnes */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#0b382c]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filtrer (ex: Douala, Plombier...)"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs text-[#0b382c] focus:outline-none focus:border-[#0b382c] focus:bg-white"
            />
          </div>
        </div>

        {/* LISTE DES RECHERCHES */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#0b382c]" />
            <span className="text-xs">Chargement de vos fichiers...</span>
          </div>
        ) : filteredSearches.length > 0 ? (
          <div className="divide-y divide-[#0b382c]/6">
            {filteredSearches.map((s) => {
              const isDownloading = downloadingId === s.id;
              const safeFilename = `easylead_${s.sector.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${s.city.toLowerCase()}`;

              return (
                <div
                  key={s.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f8faf8] px-3 rounded-2xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-sm text-[#0b382c]">
                        {s.sector}
                      </h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800">
                        <MapPin className="w-3 h-3 text-emerald-700" />
                        <span>{s.city}, {s.country_code}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#4f6b61]">
                      <span className="flex items-center gap-1">
                        <Users2 className="w-3.5 h-3.5 text-[#0b382c]" />
                        <strong>{s.results_count || 0}</strong> prospects
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(s.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/searches/${s.id}`}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#f4f8f4] hover:bg-[#eaf1ec] text-[#0b382c] text-xs font-semibold transition-colors"
                    >
                      <span>Voir les leads</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDownloadSearchCSV(s.id, safeFilename)}
                      disabled={isDownloading || (s.results_count || 0) === 0}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0b382c] hover:bg-[#07251d] text-[#c6f432] text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-40"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Télécharger CSV</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <FileSpreadsheet className="w-10 h-10 text-[#0b382c]/20 mx-auto" />
            <h4 className="text-sm font-bold text-[#0b382c]">
              Aucune recherche disponible pour l&apos;export
            </h4>
            <p className="text-xs text-[#4f6b61] max-w-sm mx-auto">
              Lancez votre première recherche Google Places pour récolter des leads et les télécharger ici.
            </p>
            <Link
              href="/searches/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0b382c] text-[#c6f432] text-xs font-bold"
            >
              Lancer une recherche &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Guide & Astuces Compatibilité */}
      <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 space-y-2">
        <h3 className="font-bold text-neutral-900 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Conseils d&apos;ouverture et d&apos;importation :</span>
        </h3>
        <ul className="list-disc list-inside space-y-1 text-neutral-600 pl-1">
          <li><strong>Microsoft Excel (Windows &amp; Mac)</strong> : Utilisez le séparateur point-virgule ( ; ). Le fichier intègre le BOM UTF-8 officiel garantissant que tous les accents et caractères français s&apos;affichent correctement.</li>
          <li><strong>WhatsApp Bulk Sender</strong> : La colonne <em>Téléphone E.164</em> (+237...) et le <em>Lien WhatsApp direct</em> sont prêts à l&apos;emploi pour vos outils d&apos;envoi automatisé.</li>
          <li><strong>Brevo / HubSpot / Mailchimp</strong> : Vous pouvez importer le fichier directement en sélectionnant les champs <em>Nom de l&apos;entreprise</em>, <em>Email</em>, et <em>Téléphone</em>.</li>
        </ul>
      </div>
    </div>
  );
}

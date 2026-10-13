'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MessageSquare,
  Mail,
  PhoneCall,
  Copy,
  Check,
  Send,
  RefreshCw,
  Loader2,
  Users2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/providers/user-provider';

interface LeadItem {
  id: string;
  name: string;
  category: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  website?: string | null;
}

interface SavedMessage {
  id: string;
  lead_id: string;
  lead_name?: string;
  lead_phone?: string;
  channel: 'whatsapp' | 'email' | 'call_script';
  language: string;
  tone: string;
  subject?: string | null;
  body: string;
  created_at: string;
}

export default function MessagesPage() {
  const supabase = createClient();
  const { profile, refreshProfile } = useUser();

  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'call_script'>('whatsapp');
  const [tone, setTone] = useState<'professionnel' | 'chaleureux' | 'direct'>('professionnel');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [customInstructions, setCustomInstructions] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [generatedSubject, setGeneratedSubject] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [searchFilter, setSearchFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Charger les leads et les messages existants
  useEffect(() => {
    async function loadData() {
      setIsLoadingData(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Charger les leads
          const { data: leadsData } = await supabase
            .from('leads')
            .select('id, name, category, city, phone, email, rating, reviews_count, website')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100);

          if (leadsData && leadsData.length > 0) {
            setLeads(
              leadsData.map((l) => ({
                id: l.id,
                name: l.name,
                category: l.category || 'Commerce',
                city: l.city || 'Douala',
                phone: l.phone,
                email: l.email,
                rating: l.rating,
                reviews_count: l.reviews_count,
                website: l.website,
              }))
            );
            setSelectedLeadId(leadsData[0].id);
          }

          // Charger l'historique des messages
          const { data: msgsData } = await supabase
            .from('messages')
            .select('*, leads(name, phone)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (msgsData) {
            const formatted: SavedMessage[] = msgsData.map((m: any) => ({
              id: m.id,
              lead_id: m.lead_id,
              lead_name: m.leads?.name || 'Prospect',
              lead_phone: m.leads?.phone || '',
              channel: m.channel,
              language: m.language,
              tone: m.tone,
              subject: m.subject,
              body: m.body,
              created_at: m.created_at,
            }));
            setMessages(formatted);
          }
        }
      } catch (err) {
        console.error('Error loading leads & messages:', err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [supabase]);

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  const handleGenerate = async () => {
    if (!selectedLeadId) {
      setErrorMsg('Veuillez sélectionner un prospect.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedMessage(null);
    setGeneratedSubject(null);

    try {
      const res = await fetch(`/api/leads/${selectedLeadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          tone,
          language,
          customInstructions,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Erreur lors de la génération du message.');
      }

      // Lecture du flux SSE / streaming
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setGeneratedMessage(fullText);
        }
      }

      // Si c'est un email avec section OBJET:
      if (channel === 'email' && fullText.includes('OBJET:')) {
        const parts = fullText.split('CORPS:');
        if (parts.length > 1) {
          const subj = parts[0].replace('OBJET:', '').trim();
          const bdy = parts[1].trim();
          setGeneratedSubject(subj);
          setGeneratedMessage(bdy);
        }
      }

      // Rafraîchir les crédits et l'historique
      await refreshProfile();

      // Ajouter le nouveau message à l'historique
      const newMessage: SavedMessage = {
        id: `msg_${Date.now()}`,
        lead_id: selectedLeadId,
        lead_name: selectedLead?.name || 'Prospect',
        lead_phone: selectedLead?.phone || '',
        channel,
        language,
        tone,
        subject: generatedSubject,
        body: fullText,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [newMessage, ...prev]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Échec de génération IA.';
      setErrorMsg(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getWhatsAppLink = (phone?: string | null, text?: string) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text || '')}`;
  };

  const filteredMessages = messages.filter((m) => {
    const matchesFilter =
      channelFilter === 'all' || m.channel === channelFilter;
    const matchesSearch =
      !searchFilter ||
      m.lead_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.body.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0b382c]" />
            <span>Moteur IA EasyLead &bull; Prospection B2B Afrique</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#0b382c]">
            Messages IA &amp; Prospection WhatsApp
          </h1>
          <p className="text-sm text-[#4f6b61] mt-1 max-w-2xl">
            Rédigez des messages ultra-personnalisés en 2 secondes chrono. Conçus pour maximiser les taux d&apos;ouverture et de réponse auprès des décideurs en Afrique.
          </p>
        </div>

        <Link
          href="/searches/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0b382c] hover:bg-[#07251d] text-[#c6f432] text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <Users2 className="w-3.5 h-3.5" />
          <span>Trouver de nouveaux leads</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Generator (Left) + Preview / History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLONNE GAUCHE : CONFIGURATION DU PROMPT (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#0b382c]/8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#0b382c]/8 pb-4">
              <h2 className="text-base font-bold text-[#0b382c] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Paramètres du message</span>
              </h2>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                1 crédit / message
              </span>
            </div>

            {/* 1. Sélection du prospect */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0b382c]">
                Sélectionner le prospect cible
              </label>
              {leads.length > 0 ? (
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs font-semibold text-[#0b382c] focus:outline-none focus:border-[#0b382c] focus:bg-white"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.city} &bull; {l.category})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 rounded-2xl bg-[#f8faf8] border border-dashed border-[#0b382c]/15 text-center">
                  <p className="text-xs text-[#4f6b61] mb-2">
                    Aucun lead dans votre base pour l&apos;instant.
                  </p>
                  <Link
                    href="/searches/new"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b382c] underline"
                  >
                    Lancer une recherche de prospects &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Carte récapitulative du lead sélectionné */}
            {selectedLead && (
              <div className="p-3.5 rounded-2xl bg-[#f8faf8] border border-[#0b382c]/6 text-xs space-y-1.5">
                <div className="font-bold text-[#0b382c]">{selectedLead.name}</div>
                <div className="text-[11px] text-[#4f6b61] flex items-center gap-2">
                  <span>{selectedLead.city}</span>
                  {selectedLead.phone && (
                    <>
                      <span>&bull;</span>
                      <span className="font-mono text-[#0b382c]">{selectedLead.phone}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 2. Canal d'envoi */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0b382c]">
                Canal d&apos;outreach
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                  { id: 'email', label: 'Email', icon: Mail },
                  { id: 'call_script', label: 'Appel tél.', icon: PhoneCall },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = channel === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setChannel(item.id as any)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0b382c] text-[#c6f432] shadow-xs'
                          : 'bg-[#f4f8f4] text-[#0b382c]/80 hover:bg-[#eaf1ec]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Ton du message */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0b382c]">
                Tonalité
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'professionnel', label: 'Professionnel' },
                  { id: 'chaleureux', label: 'Chaleureux' },
                  { id: 'direct', label: 'Direct & Percutant' },
                ].map((item) => {
                  const isSelected = tone === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTone(item.id as any)}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#0b382c] text-white shadow-2xs'
                          : 'bg-[#f4f8f4] text-[#0b382c]/70 hover:bg-[#eaf1ec]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Consignes optionnelles */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0b382c] flex items-center justify-between">
                <span>Consignes personnalisées (Optionnel)</span>
                <span className="text-[10px] text-[#4f6b61] font-normal">Ex: Mentionner -20%</span>
              </label>
              <textarea
                rows={2}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Ex: Mettre l'accent sur notre livraison rapide à Douala..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs font-medium text-[#0b382c] placeholder-[#0b382c]/40 focus:outline-none focus:border-[#0b382c] focus:bg-white resize-none"
              />
            </div>

            {/* Bouton Générer */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !selectedLeadId}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0b382c] hover:bg-[#07251d] text-[#c6f432] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#c6f432]" />
                  <span>Rédaction IA en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Générer le message IA EasyLead</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* COLONNE DROITE : APERÇU EN DIRECT + HISTORIQUE (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* APERÇU DU MESSAGE ACTUELLEMENT GÉNÉRÉ */}
          {generatedMessage && (
            <div className="bg-white rounded-3xl p-6 border border-[#0b382c]/12 shadow-md space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[#0b382c]/8 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0b382c]">
                    Aperçu généré &bull; {channel.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedMessage, 'preview')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f4f8f4] hover:bg-[#eaf1ec] text-xs font-bold text-[#0b382c] transition-colors cursor-pointer"
                  >
                    {copiedId === 'preview' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>

                  {channel === 'whatsapp' && selectedLead?.phone && (
                    <a
                      href={getWhatsAppLink(selectedLead.phone, generatedMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Ouvrir WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              {generatedSubject && (
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                  <span className="font-bold text-neutral-500 mr-2">Objet :</span>
                  <span className="font-semibold text-neutral-900">{generatedSubject}</span>
                </div>
              )}

              {/* Rendu style bulle WhatsApp ou Email */}
              <div className="p-4 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/8 text-xs font-sans text-[#0b382c] leading-relaxed whitespace-pre-wrap">
                {generatedMessage}
              </div>
            </div>
          )}

          {/* SECTION HISTORIQUE DES MESSAGES */}
          <div className="bg-white rounded-3xl p-6 border border-[#0b382c]/8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0b382c]/8 pb-4">
              <div>
                <h2 className="text-base font-bold text-[#0b382c] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>Historique des messages récents</span>
                </h2>
                <p className="text-xs text-[#4f6b61]">
                  {messages.length} message(s) rédigé(s) pour vos prospects
                </p>
              </div>

              {/* Filtres de canaux */}
              <div className="flex items-center gap-1 bg-[#f4f8f4] p-1 rounded-xl text-xs font-semibold">
                {['all', 'whatsapp', 'email', 'call_script'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannelFilter(c)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                      channelFilter === c
                        ? 'bg-[#0b382c] text-white shadow-2xs'
                        : 'text-[#4f6b61] hover:text-[#0b382c]'
                    }`}
                  >
                    {c === 'all' ? 'Tous' : c === 'whatsapp' ? 'WhatsApp' : c === 'email' ? 'Email' : 'Appels'}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des messages */}
            {filteredMessages.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 rounded-2xl bg-[#f8faf8] border border-[#0b382c]/6 hover:border-[#0b382c]/20 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#0b382c]">
                          {msg.lead_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0b382c]/10 text-[#0b382c]">
                          {msg.channel}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.body, msg.id)}
                          className="p-1.5 rounded-lg hover:bg-white text-neutral-500 hover:text-[#0b382c] transition-colors"
                          title="Copier le message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {msg.channel === 'whatsapp' && msg.lead_phone && (
                          <a
                            href={getWhatsAppLink(msg.lead_phone, msg.body)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="Ouvrir dans WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {msg.subject && (
                      <div className="text-[11px] font-semibold text-neutral-600">
                        Objet : {msg.subject}
                      </div>
                    )}

                    <p className="text-xs text-[#142922] whitespace-pre-wrap leading-relaxed line-clamp-3">
                      {msg.body}
                    </p>

                    <div className="text-[10px] text-[#4f6b61]">
                      {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 space-y-2">
                <MessageSquare className="w-8 h-8 text-[#0b382c]/20 mx-auto" />
                <p className="text-xs text-[#4f6b61]">
                  Aucun message dans cette catégorie pour le moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

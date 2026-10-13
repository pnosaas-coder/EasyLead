'use client';

import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Mail,
  PhoneCall,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Star,
  Globe,
  RefreshCw,
  Send,
  Edit3,
  AlertCircle,
} from 'lucide-react';
import { Lead, MessageChannel, LeadStatus } from '@/lib/types';
import { useUser } from '@/components/providers/user-provider';

interface LeadDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
  onNotesChange?: (leadId: string, newNotes: string) => void;
}

export function LeadDrawer({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  onNotesChange,
}: LeadDrawerProps) {
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState<MessageChannel>('whatsapp');
  const [tone, setTone] = useState<'direct' | 'chaleureux' | 'professionnel'>('direct');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(lead?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Generated message states
  const [prevLeadId, setPrevLeadId] = useState<string | null>(null);
  const [whatsappPitch, setWhatsappPitch] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [callScriptCustom, setCallScriptCustom] = useState<string | null>(null);

  if (lead && lead.id !== prevLeadId) {
    setPrevLeadId(lead.id);
    setCurrentNotes(lead.notes || '');
    setGenerationError(null);

    const savedWa = lead.messages?.find((m) => m.channel === 'whatsapp');
    const savedEmail = lead.messages?.find((m) => m.channel === 'email');
    const savedCall = lead.messages?.find((m) => m.channel === 'call_script');

    setWhatsappPitch(
      savedWa?.body ||
        `Bonjour Monsieur/Madame le Responsable de ${lead.name}. J'ai découvert votre activité à ${lead.city || 'Douala'} (${lead.rating || 4.5}★ sur Google Maps). ${!lead.website ? 'Nous avons remarqué que vous n\'avez pas encore de vitrine web pour convertir les clients mobiles.' : 'Nous accompagnons les entreprises de référence pour décupler leurs opportunités B2B.'} Seriez-vous ouvert à échanger 5 min cette semaine ?`
    );

    setEmailSubject(
      savedEmail?.subject ||
        `Opportunité de croissance B2B - ${lead.name}`
    );

    const myName = profile?.fullName || 'Le Responsable Commercial';
    const myCompany = profile?.companyName || 'Notre Entreprise';
    const myEmail = profile?.email || '';

    setEmailBody(
      savedEmail?.body ||
        `Bonjour à la direction de ${lead.name},\n\nJ'ai découvert vos activités à ${lead.address || lead.city || 'Douala'} et j'ai été impressionné par la régularité de vos retours clients (${lead.reviewsCount || 20} avis).\n\nChez ${myCompany}, nous accompagnons les entreprises de référence pour accélérer leur prospection commerciale B2B sans multiplier les coûts.\n\nAuriez-vous 10 minutes ce jeudi ou vendredi pour un rapide échange d'information ?\n\nBien cordialement,\n${myName}\nDirection Commerciale • ${myCompany}${myEmail ? `\n${myEmail}` : ''}`
    );

    setCallScriptCustom(savedCall?.body || null);
  }

  if (!isOpen || !lead) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusUpdate = async (newStatus: LeadStatus) => {
    onStatusChange?.(lead.id, newStatus);
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    onNotesChange?.(lead.id, currentNotes);
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: currentNotes }),
      });
      alert('Notes enregistrées avec succès pour ce lead !');
    } catch (err) {
      console.error('Erreur sauvegarde notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const rawNumber = lead.phoneE164 || lead.phone;
    if (!rawNumber) {
      alert('Numéro de téléphone non disponible pour ce lead.');
      return;
    }
    handleStatusUpdate('contacted');
    const cleanDigits = rawNumber.replace(/[^\d]/g, '');
    const waUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(whatsappPitch)}`;
    window.open(waUrl, '_blank');
  };

  const handleOpenEmail = () => {
    if (!lead.email) {
      alert('Aucun email disponible pour ce lead.');
      return;
    }
    handleStatusUpdate('contacted');
    const mailtoUrl = `mailto:${lead.email}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    let streamedText = '';
    if (activeTab === 'whatsapp') setWhatsappPitch('');
    else if (activeTab === 'email') {
      setEmailBody('');
      setEmailSubject('');
    } else {
      setCallScriptCustom('');
    }

    try {
      const response = await fetch(`/api/leads/${lead.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: activeTab,
          tone,
          language: 'fr',
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Erreur lors de la génération du message.');
      }

      if (!response.body) {
        throw new Error('Réponse en streaming non reçue.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamedText += chunk;

        if (activeTab === 'whatsapp') {
          setWhatsappPitch(streamedText);
        } else if (activeTab === 'email') {
          if (streamedText.includes('OBJET:')) {
            const parts = streamedText.split(/CORPS:/i);
            setEmailSubject(parts[0].replace(/OBJET:/i, '').trim());
            setEmailBody((parts[1] || '').trim());
          } else {
            setEmailBody(streamedText);
          }
        } else {
          setCallScriptCustom(streamedText);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Échec de génération IA.';
      setGenerationError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

    const senderName = profile?.fullName || 'notre responsable';
    const senderCompany = profile?.companyName || 'notre société';
    const defaultCallScript = {
      intro: `« Bonjour, ${senderName} de ${senderCompany}. Je me permets de vous contacter car j'ai vu la réputation de ${lead.name} sur Google Maps. Est-ce bien le responsable de la structure que j'ai au bout du fil ? »`,
    hook: `« J'ai remarqué que vous êtes basés à ${lead.address || lead.city} et que votre visibilité est forte. Nous avons développé une solution pour vous apporter des clients B2B ciblés sans prospection manuelle. »`,
    questions: [
      `1. Comment trouvez-vous actuellement vos nouveaux clients à ${lead.city || 'Douala'} ?`,
      `2. Est-ce que votre équipe commerciale utilise WhatsApp Business pour relancer vos contacts ?`,
      `3. Si nous pouvions vous livrer 100 contacts de décideurs qualifiés par mois, est-ce un levier prioritaire pour vous ?`,
    ],
    objections: [
      {
        q: '« Envoyez-moi un email d\'abord »',
        a: '« Absolument, je vous envoie un résumé. Quel est votre email direct pour que vous puissiez le parcourir avant qu\'on en reparle demain ? »',
      },
      {
        q: '« Nous avons déjà nos fournisseurs/clients »',
        a: '« C\'est justement pour cela qu\'on vous contacte : nous complétons votre réseau existant sans changer vos habitudes. »',
      },
    ],
    closing: `« Prenons simplement 10 minutes en visio ou café à ${lead.city || 'Douala'} mardi prochain à 10h pour que je vous montre un exemple concret. Ça vous convient ? »`,
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#061f18]/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#0b382c]/8 bg-[#fbfdfb] flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e5f4ef] text-[#0b382c] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c6f432]" />
              <span>{lead.category}</span>
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#0b382c]">
              {lead.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#4f6b61] mt-1">
              <span className="flex items-center gap-1 font-semibold text-[#0b382c]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{lead.rating}</span>
                <span className="text-[#4f6b61]">({lead.reviewsCount} avis)</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lead.address || lead.city}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white border border-[#0b382c]/10 text-[#0b382c] hover:bg-[#f4f8f4] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Quick Badges & External links */}
        <div className="px-6 py-3 bg-[#f4f8f4] border-b border-[#0b382c]/6 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#4f6b61] font-medium">Statut CRM :</span>
            <select
              value={lead.status}
              onChange={(e) => handleStatusUpdate(e.target.value as LeadStatus)}
              className="px-2.5 py-1 rounded-full text-xs font-bold bg-white border border-[#0b382c]/15 text-[#0b382c] cursor-pointer"
            >
              <option value="new">Nouveau</option>
              <option value="contacted">Contacté</option>
              <option value="replied">A répondu</option>
              <option value="won">Gagné (Client)</option>
              <option value="lost">Perdu</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {lead.phone && (
              <span className="font-mono text-xs font-bold text-[#0b382c] bg-white px-2.5 py-1 rounded-lg border border-[#0b382c]/10">
                {lead.phone}
              </span>
            )}
            {lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-800 hover:underline bg-white px-2 py-1 rounded-lg border border-[#0b382c]/10"
              >
                <Globe className="w-3 h-3" />
                <span>Site web</span>
              </a>
            ) : (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                Sans site web
              </span>
            )}
            {lead.mapsUrl && (
              <a
                href={lead.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded-lg bg-white border border-[#0b382c]/10 text-[#0b382c] hover:bg-neutral-100"
                title="Ouvrir dans Google Maps"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Scrollable Content: 3 Outreach Channels Studio */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {generationError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{generationError}</div>
            </div>
          )}

          {/* Channel Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0b382c] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Générateur de Prospection IA EasyLead</span>
              </span>
              <span className="text-[11px] text-[#4f6b61]">1 crédit / génération</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 bg-[#f4f8f4] p-1.5 rounded-2xl border border-[#0b382c]/8">
              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'whatsapp'
                    ? 'bg-[#0b382c] text-white shadow-xs'
                    : 'text-[#4f6b61] hover:text-[#0b382c]'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'email'
                    ? 'bg-[#0b382c] text-white shadow-xs'
                    : 'text-[#4f6b61] hover:text-[#0b382c]'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>Email B2B</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('call_script')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'call_script'
                    ? 'bg-[#0b382c] text-white shadow-xs'
                    : 'text-[#4f6b61] hover:text-[#0b382c]'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                <span>Script d&apos;Appel</span>
              </button>
            </div>
          </div>

          {/* Tone & Parameters Selector */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#4f6b61]">Ton :</span>
              {(['direct', 'chaleureux', 'professionnel'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                    tone === t
                      ? 'bg-[#c6f432] text-[#0b382c]'
                      : 'bg-[#f4f8f4] text-[#4f6b61] hover:text-[#0b382c]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0b382c] hover:bg-[#07251d] text-[#c6f432] font-bold text-xs border border-[#0b382c]/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Rédaction IA en cours...' : 'Régénérer avec l\'IA'}</span>
            </button>
          </div>

          {/* TAB 1: WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#eaf8ee] border border-emerald-200/60 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Aperçu WhatsApp Direct</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-mono">
                    {whatsappPitch.length} / 500 car.
                  </span>
                </div>

                <textarea
                  value={whatsappPitch}
                  onChange={(e) => setWhatsappPitch(e.target.value)}
                  rows={5}
                  className="w-full p-3 rounded-xl bg-white border border-emerald-200 text-xs text-[#0b382c] font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-none shadow-2xs"
                />

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    onClick={() => handleCopy(whatsappPitch)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-50 text-xs font-semibold text-[#0b382c] border border-emerald-300 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copié !' : 'Copier'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ouvrir sur WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL B2B */}
          {activeTab === 'email' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#f4f7fb] border border-blue-200/60 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-blue-900 block mb-1">
                    Objet de l&apos;email (&lt; 60 car.)
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-blue-200 text-xs text-[#0b382c] font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-blue-900 block mb-1">
                    Corps du message
                  </label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={8}
                    className="w-full p-3 rounded-xl bg-white border border-blue-200 text-xs text-[#0b382c] font-sans leading-relaxed focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(`${emailSubject}\n\n${emailBody}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-xs font-semibold text-[#0b382c] border border-blue-200 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier tout</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenEmail}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0b382c] hover:bg-[#06241c] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#c6f432]" />
                    <span>Ouvrir l&apos;email (Mailto)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCRIPT D'APPEL */}
          {activeTab === 'call_script' && (
            <div className="space-y-3">
              {callScriptCustom ? (
                <div className="p-4 rounded-2xl bg-[#fffcf4] border border-amber-200/70 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase text-amber-900">
                      Script d&apos;appel personnalisé par l&apos;IA
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(callScriptCustom)}
                      className="inline-flex items-center gap-1 text-xs text-amber-900 underline cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copier</span>
                    </button>
                  </div>
                  <pre className="text-xs text-[#0b382c] whitespace-pre-wrap font-sans leading-relaxed bg-white p-3 rounded-xl border border-amber-200">
                    {callScriptCustom}
                  </pre>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#fffcf4] border border-amber-200/70 space-y-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase text-amber-900 mb-1">
                      1. Présentation &amp; Accroche Directe
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-[#0b382c] leading-relaxed italic">
                      {defaultCallScript.intro}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold uppercase text-amber-900 mb-1">
                      2. Questions de Découverte
                    </div>
                    <div className="space-y-1.5">
                      {defaultCallScript.questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-white border border-amber-100 text-xs text-[#0b382c]"
                        >
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold uppercase text-amber-900 mb-1">
                      3. Réponses aux Objections Courantes
                    </div>
                    <div className="space-y-2">
                      {defaultCallScript.objections.map((obj, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white border border-amber-100 space-y-1 text-xs"
                        >
                          <div className="font-bold text-red-900">{obj.q}</div>
                          <div className="text-emerald-900 pl-2 border-l-2 border-emerald-400">
                            {obj.a}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                    <div className="text-[11px] text-amber-900 font-semibold">
                      Conclusion : prise de RDV café ou visio à {lead.city}
                    </div>
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        onClick={() => handleStatusUpdate('contacted')}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0b382c] text-white text-xs font-bold shadow-xs hover:bg-[#06241c] cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-[#c6f432]" />
                        <span>Appeler ({lead.phone})</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes Internes / Suivi CRM */}
          <div className="p-4 rounded-2xl bg-white border border-[#0b382c]/8 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0b382c] flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Notes internes &amp; Suivi CRM</span>
              </label>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer disabled:opacity-50"
              >
                {isSavingNotes ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
            <textarea
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              placeholder="Ex: Responsable des achats rappelé le 10/10, intéressé par la démo..."
              rows={3}
              className="w-full p-2.5 rounded-xl bg-[#f4f8f4] border border-[#0b382c]/10 text-xs text-[#0b382c] focus:outline-none focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#fbfdfb] border-t border-[#0b382c]/8 flex items-center justify-between text-xs text-[#4f6b61]">
          <span>Envoi direct sans risque de bannissement WhatsApp.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#f4f8f4] text-[#0b382c] font-bold hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

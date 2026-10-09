'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  CheckCircle2,
  Clock,
  CreditCard,
  ArrowUpRight,
  Search,
  AlertCircle,
} from 'lucide-react';
import { Invoice } from '@/lib/types';
import { MOCK_INVOICES } from '@/lib/mock-data';

export function InvoicesTable() {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [filter, setFilter] = useState<'all' | 'succeeded' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadTransactions() {
      try {
        const res = await fetch('/api/billing/transactions');
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.payments && data.payments.length > 0) {
            setInvoices(data.payments);
          }
        }
      } catch (e) {
        console.error('Erreur chargement transactions:', e);
      }
    }
    void loadTransactions();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter = filter === 'all' || inv.status === filter;
    const matchesSearch =
      inv.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.packName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPaymentMethodBadge = (method: string, phone?: string) => {
    switch (method) {
      case 'wave':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1dc8fe]" />
            <span className="font-semibold text-[#0b382c]">Wave</span>
            {phone && (
              <span className="text-[11px] text-[#4f6b61] font-mono hidden sm:inline">
                ({phone})
              </span>
            )}
          </div>
        );
      case 'orange_money':
      case 'orange':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff7900]" />
            <span className="font-semibold text-[#0b382c]">Orange Money</span>
            {phone && (
              <span className="text-[11px] text-[#4f6b61] font-mono hidden sm:inline">
                ({phone})
              </span>
            )}
          </div>
        );
      case 'mtn_momo':
      case 'mtn':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ffcc00]" />
            <span className="font-semibold text-[#0b382c]">MTN MoMo</span>
            {phone && (
              <span className="text-[11px] text-[#4f6b61] font-mono hidden sm:inline">
                ({phone})
              </span>
            )}
          </div>
        );
      case 'moov':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#005ba4]" />
            <span className="font-semibold text-[#0b382c]">Moov Money</span>
            {phone && (
              <span className="text-[11px] text-[#4f6b61] font-mono hidden sm:inline">
                ({phone})
              </span>
            )}
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-neutral-600" />
            <span className="font-semibold text-[#0b382c]">Carte Visa/MC</span>
            {phone && (
              <span className="text-[11px] text-[#4f6b61] font-mono hidden sm:inline">
                ({phone})
              </span>
            )}
          </div>
        );
    }
  };

  const formatAmount = (amount: number) => {
    if (amount === 0) return 'Gratuit (Offert)';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadReceipt = (inv: Invoice) => {
    const receiptText = `
========================================
             EASYLEAD AFRICA
      REÇU DE PAIEMENT ÉLECTRONIQUE
========================================
Réf. Facture    : ${inv.reference}
Date & Heure    : ${inv.date}
Client          : Philippe NOUGOUE
Entreprise      : EasyLead SARL / Douala, Cameroun
Ligne MTN       : +237 677 48 11 61
Ligne Orange    : +237 691 11 49 08
----------------------------------------
Description     : ${inv.packName}
Crédits Ajoutés : +${inv.credits} crédits EasyLead
Moyen de Paiement: ${inv.paymentMethod.toUpperCase()} ${inv.phoneNumber || ''}
Montant TTC     : ${formatAmount(inv.amount)}
Statut          : PAYÉ (VALIDÉ)
Passerelle      : CinetPay Mobile Money
========================================
Merci pour votre confiance.
EasyLead - Moteur B2B Google Maps pour l'Afrique
Direction : Philippe NOUGOUE, Gérant Fondateur
Douala, Cameroun
https://easylead.africa
========================================
`.trim();

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Recu-EasyLead-${inv.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#0b382c]/8 shadow-[0_4px_24px_-4px_rgba(11,56,44,0.04)] overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-6 sm:p-7 border-b border-[#0b382c]/6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef7f2] text-[#0b382c] border border-[#0b382c]/10 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c6f432]" />
              <span>Facturation & Recharges Mobile Money</span>
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#0b382c]">
              Derni&egrave;res Factures
            </h2>
            <p className="text-xs sm:text-sm text-[#4f6b61] mt-0.5">
              Historique des packs de cr&eacute;dits et re&ccedil;us de paiement CinetPay.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#4f6b61]" />
              <input
                type="text"
                placeholder="Réf, opérateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-full bg-[#f4f8f4] border border-[#0b382c]/10 text-[#0b382c] focus:outline-none focus:border-[#0b382c] focus:bg-white transition-all w-36 sm:w-48 placeholder:text-neutral-400"
              />
            </div>

            {/* Filter buttons */}
            <div className="inline-flex rounded-full bg-[#f4f8f4] p-1 border border-[#0b382c]/8 text-xs">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-[#0b382c] text-white shadow-xs'
                    : 'text-[#4f6b61] hover:text-[#0b382c]'
                }`}
              >
                Toutes ({invoices.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('succeeded')}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  filter === 'succeeded'
                    ? 'bg-[#0b382c] text-white shadow-xs'
                    : 'text-[#4f6b61] hover:text-[#0b382c]'
                }`}
              >
                Pay&eacute;es
              </button>
            </div>

            {/* Buy Pack CTA Button */}
            <Link
              href="/billing"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c6f432] hover:bg-[#b5e326] text-[#0b382c] text-xs font-bold transition-all shadow-xs"
            >
              <span>+ Acheter un pack</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8faf8] border-b border-[#0b382c]/6 text-[11px] font-bold uppercase tracking-wider text-[#4f6b61]">
              <th className="py-3.5 px-6">R&eacute;f. Facture & Date</th>
              <th className="py-3.5 px-6">Pack / Description</th>
              <th className="py-3.5 px-6">Moyen de Paiement</th>
              <th className="py-3.5 px-6">Montant TTC</th>
              <th className="py-3.5 px-6">Cr&eacute;dits Ajout&eacute;s</th>
              <th className="py-3.5 px-6">Statut</th>
              <th className="py-3.5 px-6 text-right">Re&ccedil;u</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0b382c]/6 text-xs text-[#142922]">
            {filteredInvoices.map((inv) => (
              <tr
                key={inv.id}
                className="hover:bg-[#fbfdfb] transition-colors group"
              >
                {/* Reference & Date */}
                <td className="py-4 px-6">
                  <div className="font-mono font-bold text-[#0b382c]">
                    {inv.reference}
                  </div>
                  <div className="text-[11px] text-[#4f6b61] mt-0.5">
                    {inv.date}
                  </div>
                </td>

                {/* Pack Name */}
                <td className="py-4 px-6">
                  <div className="font-semibold text-[#0b382c]">
                    {inv.packName}
                  </div>
                  <div className="text-[11px] text-[#4f6b61]">
                    {inv.amount === 0 ? 'Offert à l’inscription' : 'Recharge instantanée'}
                  </div>
                </td>

                {/* Payment Method Badge */}
                <td className="py-4 px-6">
                  {getPaymentMethodBadge(inv.paymentMethod, inv.phoneNumber)}
                </td>

                {/* Amount in FCFA */}
                <td className="py-4 px-6 font-semibold text-[#0b382c]">
                  {formatAmount(inv.amount)}
                </td>

                {/* Credits */}
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c6f432]/30 text-[#0b382c] border border-[#c6f432]/60">
                    +{inv.credits.toLocaleString('fr-FR')} cr.
                  </span>
                </td>

                {/* Status Pill */}
                <td className="py-4 px-6">
                  {inv.status === 'succeeded' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e5f4ef] text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pay&eacute;</span>
                    </span>
                  ) : inv.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                      <span>En attente</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Échoué</span>
                    </span>
                  )}
                </td>

                {/* Actions: Download Text / PDF Receipt */}
                <td className="py-4 px-6 text-right">
                  <button
                    type="button"
                    onClick={() => handleDownloadReceipt(inv)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#0b382c] bg-[#f4f8f4] hover:bg-[#c6f432] transition-colors border border-[#0b382c]/10 cursor-pointer"
                    title="Télécharger le reçu"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Re&ccedil;u</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View (< md) */}
      <div className="md:hidden divide-y divide-[#0b382c]/6 p-4 space-y-3">
        {filteredInvoices.map((inv) => (
          <div
            key={inv.id}
            className="p-4 rounded-2xl bg-[#f8faf8] border border-[#0b382c]/6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#0b382c]">
                  {inv.reference}
                </span>
                <div className="text-[11px] text-[#4f6b61]">{inv.date}</div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e5f4ef] text-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Pay&eacute;</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <div className="font-bold text-[#0b382c]">{inv.packName}</div>
                <div className="mt-1">
                  {getPaymentMethodBadge(inv.paymentMethod, inv.phoneNumber)}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-sm text-[#0b382c]">
                  {formatAmount(inv.amount)}
                </div>
                <div className="text-[11px] font-bold text-emerald-700">
                  +{inv.credits} cr&eacute;dits
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#0b382c]/6 flex justify-end">
              <button
                type="button"
                onClick={() => handleDownloadReceipt(inv)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b382c] bg-white px-3 py-1 rounded-full border border-[#0b382c]/10 hover:bg-[#c6f432] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>T&eacute;l&eacute;charger le re&ccedil;u</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Table Footer info */}
      <div className="p-4 sm:p-5 bg-[#f8faf8] border-t border-[#0b382c]/6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#4f6b61] gap-2">
        <div className="flex items-center gap-2">
          <span>Paiements s&eacute;curis&eacute;s par passerelle CinetPay & Op&eacute;rateurs T&eacute;l&eacute;coms.</span>
        </div>
        <div className="font-semibold text-[#0b382c]">
          Affichage de {filteredInvoices.length} sur {invoices.length} factures
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Coins,
  Zap,
  Check,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useUser } from '@/components/providers/user-provider';
import { CREDIT_PACKS, getPackById } from '@/lib/payments/packs';
import { InvoicesTable } from '@/components/dashboard/invoices-table';

export function BillingPage() {
  const router = useRouter();
  const { profile } = useUser();

  const [selectedPack, setSelectedPack] = useState<'starter' | 'pro' | 'business'>('pro');
  const [selectedMethod, setSelectedMethod] = useState<'mtn' | 'orange' | 'wave' | 'card'>('mtn');
  const [phone, setPhone] = useState('+237 677 48 11 61');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activePack = getPackById(selectedPack) || CREDIT_PACKS[1];

  const handleSelectMethod = (method: 'mtn' | 'orange' | 'wave' | 'card') => {
    setSelectedMethod(method);
    if (method === 'mtn') {
      setPhone('+237 677 48 11 61');
    } else if (method === 'orange') {
      setPhone('+237 691 11 49 08');
    }
  };

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: selectedPack,
          phoneNumber: phone,
          paymentMethod: selectedMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’initialisation du paiement CinetPay.');
      }

      if (data.paymentUrl) {
        if (data.paymentUrl.startsWith('http://') || data.paymentUrl.startsWith('https://')) {
          window.location.href = data.paymentUrl;
        } else {
          router.push(data.paymentUrl);
        }
      } else {
        throw new Error('URL de paiement non renvoyée par le serveur.');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#0b382c] border border-[#0b382c]/10 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#c6f432] ring-2 ring-[#0b382c]/20" />
            <span>Passerelle de Paiement Mobile Money &bull; CinetPay</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#0b382c] leading-[1.15]">
            Recharges de Cr&eacute;dits &amp; Facturation
          </h1>

          <p className="text-sm sm:text-base text-[#4f6b61] leading-relaxed max-w-2xl">
            Achetez des packs de cr&eacute;dits sans abonnement ni engagement. 
            Payez instantan&eacute;ment via MTN MoMo, Orange Money, Wave ou Carte Bancaire en FCFA (XAF/XOF).
          </p>
        </div>

        {/* Current Balance Pill */}
        <div className="p-4 rounded-3xl bg-[#0b382c] text-white flex items-center gap-4 shrink-0 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#c6f432] text-[#0b382c] flex items-center justify-center font-bold">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              Solde Actuel Disponible
            </div>
            <div className="font-serif text-3xl font-bold text-white">
              {(profile?.creditsBalance ?? 0).toLocaleString('fr-FR')}{' '}
              <span className="text-sm font-sans font-medium text-emerald-200">cr&eacute;dits</span>
            </div>
          </div>
        </div>
      </section>

      {/* Error banner if checkout failed */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-sm font-semibold">{errorMessage}</div>
        </div>
      )}

      {/* Credit Packs Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CREDIT_PACKS.map((pack) => (
          <div
            key={pack.id}
            onClick={() => setSelectedPack(pack.id)}
            className={`rounded-3xl p-7 border transition-all duration-200 relative cursor-pointer flex flex-col justify-between ${
              selectedPack === pack.id
                ? 'bg-white border-[#0b382c] shadow-[0_12px_32px_-4px_rgba(11,56,44,0.12)] ring-2 ring-[#0b382c]'
                : pack.popular
                ? 'bg-white border-[#0b382c]/20 shadow-md'
                : 'bg-white border-[#0b382c]/8 shadow-sm hover:border-[#0b382c]/20'
            }`}
          >
            {pack.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#c6f432] text-[#0b382c] text-xs font-bold tracking-wide shadow-xs">
                LE PLUS POPULAIRE
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-[#0b382c]">{pack.name}</h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#f4f8f4] text-[#0b382c]">
                  {pack.credits.toLocaleString('fr-FR')} cr.
                </span>
              </div>

              <p className="text-xs text-[#4f6b61] mb-5">{pack.desc}</p>

              <div className="mb-6 pb-6 border-b border-[#0b382c]/6">
                <div className="font-serif text-4xl font-bold text-[#0b382c]">
                  {pack.price.toLocaleString('fr-FR')} <span className="text-sm font-sans font-medium text-[#4f6b61]">FCFA</span>
                </div>
                <div className="text-[11px] text-emerald-800 font-semibold mt-1">
                  Soit {(pack.price / pack.credits).toFixed(1)} FCFA par crédit
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[#4f6b61]">
                  Inclus dans ce pack :
                </div>
                {pack.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-[#0b382c]">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={`w-full py-3 rounded-full text-xs font-bold transition-all ${
                selectedPack === pack.id
                  ? 'bg-[#0b382c] text-white shadow-md'
                  : 'bg-[#f4f8f4] text-[#0b382c] hover:bg-[#e6f4ea]'
              }`}
            >
              {selectedPack === pack.id ? 'Pack sélectionné' : 'Choisir ce pack'}
            </button>
          </div>
        ))}
      </section>

      {/* Checkout Section via Mobile Money / CinetPay */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0b382c]/8 shadow-[0_4px_24px_-4px_rgba(11,56,44,0.04)]">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0b382c]">
              Finaliser votre Recharge Instantanée
            </h2>
            <p className="text-xs sm:text-sm text-[#4f6b61]">
              Pack sélectionné :{' '}
              <strong className="text-[#0b382c]">
                {activePack.name} ({activePack.price.toLocaleString('fr-FR')} FCFA &bull; {activePack.credits.toLocaleString('fr-FR')} crédits)
              </strong>
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0b382c]">
              Moyen de paiement Mobile Money ou Carte :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleSelectMethod('mtn')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedMethod === 'mtn'
                    ? 'border-[#ffcc00] bg-[#fffdf0] ring-2 ring-[#ffcc00]'
                    : 'border-neutral-200 bg-white hover:bg-[#fbfdfb]'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-[#ffcc00] mx-auto mb-1" />
                <div className="text-xs font-bold text-[#0b382c]">MTN MoMo</div>
                <div className="text-[10px] text-neutral-500">Cameroun &bull; 677 48 11 61</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMethod('orange')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedMethod === 'orange'
                    ? 'border-[#ff7900] bg-[#fffaf5] ring-2 ring-[#ff7900]'
                    : 'border-neutral-200 bg-white hover:bg-[#fbfdfb]'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-[#ff7900] mx-auto mb-1" />
                <div className="text-xs font-bold text-[#0b382c]">Orange Money</div>
                <div className="text-[10px] text-neutral-500">Cameroun &bull; 691 11 49 08</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMethod('wave')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedMethod === 'wave'
                    ? 'border-[#1dc8fe] bg-[#f0faff] ring-2 ring-[#1dc8fe]'
                    : 'border-neutral-200 bg-white hover:bg-[#fbfdfb]'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-[#1dc8fe] mx-auto mb-1" />
                <div className="text-xs font-bold text-[#0b382c]">Wave</div>
                <div className="text-[10px] text-neutral-500">Sénégal &amp; CI</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMethod('card')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedMethod === 'card'
                    ? 'border-neutral-800 bg-neutral-50 ring-2 ring-neutral-800'
                    : 'border-neutral-200 bg-white hover:bg-[#fbfdfb]'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1 text-neutral-700" />
                <div className="text-xs font-bold text-[#0b382c]">Carte Bancaire</div>
                <div className="text-[10px] text-neutral-500">Visa / Mastercard</div>
              </button>
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0b382c] flex items-center justify-between">
              <span>Numéro Mobile Money pour la confirmation</span>
              <span className="text-[11px] text-[#4f6b61]">Vous recevrez un prompt de validation USSD</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+237 6XX XX XX XX"
              className="w-full px-4 py-3 rounded-2xl bg-[#f4f8f4] border border-[#0b382c]/10 text-sm font-mono font-bold text-[#0b382c] focus:outline-none focus:bg-white focus:border-[#0b382c] transition-all"
            />
            {/* Quick chips for official numbers */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-[#4f6b61]">Raccourcis Cameroun :</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('mtn');
                  setPhone('+237 677 48 11 61');
                }}
                className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#fffdf0] text-[#0b382c] border border-[#ffcc00] hover:bg-[#fffae0] transition-colors cursor-pointer font-bold"
              >
                🟡 MTN : +237 677 48 11 61
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('orange');
                  setPhone('+237 691 11 49 08');
                }}
                className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#fffaf5] text-[#0b382c] border border-[#ff7900] hover:bg-[#fff2e6] transition-colors cursor-pointer font-bold"
              >
                🟠 Orange : +237 691 11 49 08
              </button>
            </div>
          </div>

          {/* Pay Button */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full py-4 rounded-full bg-[#0b382c] hover:bg-[#06241c] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 text-[#c6f432] animate-spin" />
                <span>Initialisation de la session CinetPay...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-[#c6f432]" />
                <span>
                  Payer {activePack.price.toLocaleString('fr-FR')} FCFA via Mobile Money
                </span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-4 text-xs text-[#4f6b61]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Chiffrement TLS 256 bits</span>
            </span>
            <span>&bull;</span>
            <span>Créditation atomique et idempotente</span>
          </div>
        </div>
      </section>

      {/* Past Invoices and Transactions */}
      <section>
        <InvoicesTable />
      </section>
    </div>
  );
}

export default BillingPage;

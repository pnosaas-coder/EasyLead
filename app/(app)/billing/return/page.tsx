'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  AlertCircle,
  Coins,
  Search,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useUser } from '@/components/providers/user-provider';

function BillingReturnContent() {
  const searchParams = useSearchParams();
  const tx = searchParams.get('tx');
  const isSimulated = searchParams.get('simulated') === 'true';

  const { refreshProfile } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'succeeded' | 'failed' | 'pending'>('pending');
  const [details, setDetails] = useState<{
    credits: number;
    amount: number;
    currency: string;
    packId: string;
    currentBalance: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!tx) return;

    let isMounted = true;

    async function checkPayment() {
      try {
        const res = await fetch(`/api/billing/verify?tx=${encodeURIComponent(tx!)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors de la vérification du paiement.');
        }

        if (isMounted) {
          setStatus(data.status);
          setDetails({
            credits: data.credits,
            amount: data.amount,
            currency: data.currency,
            packId: data.packId,
            currentBalance: data.currentBalance,
          });
          setIsLoading(false);

          if (data.status === 'succeeded') {
            await refreshProfile();
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setErrorMessage(err instanceof Error ? err.message : 'Erreur inconnue');
          setIsLoading(false);
        }
      }
    }

    void checkPayment();

    return () => {
      isMounted = false;
    };
  }, [tx, refreshProfile]);

  if (!tx) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0b382c]">
            Transaction introuvable
          </h1>
          <p className="text-sm text-[#4f6b61]">
            Identifiant de transaction manquant dans l’URL de confirmation.
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <Link
              href="/billing"
              className="px-6 py-3 rounded-full bg-[#0b382c] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#06241c] transition-colors"
            >
              Retour à la facturation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#0b382c] text-[#c6f432] flex items-center justify-center mx-auto shadow-lg animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0b382c]">
          Vérification de votre paiement CinetPay...
        </h1>
        <p className="text-sm text-[#4f6b61]">
          Nous confirmons la transaction auprès de l’opérateur Mobile Money (MTN / Orange / Wave).
        </p>
      </div>
    );
  }

  if (errorMessage || status === 'failed') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0b382c]">
            Paiement non abouti
          </h1>
          <p className="text-sm text-[#4f6b61]">
            {errorMessage ||
              'La transaction a été annulée ou refusée par l’opérateur. Aucun montant n’a été débité.'}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/billing"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#0b382c] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#06241c] transition-colors"
            >
              Réessayer un pack
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#f4f8f4] text-[#0b382c] text-xs sm:text-sm font-bold hover:bg-[#e6f0eb] transition-colors"
            >
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-[#0b382c]/10 shadow-[0_12px_32px_-4px_rgba(11,56,44,0.08)] text-center space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c6f432]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-[#c6f432] text-[#0b382c] flex items-center justify-center mx-auto shadow-md mb-4 ring-8 ring-[#e5f4ef]">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5f4ef] text-[#0b382c] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0b382c]" />
            <span>Recharge Effectu&eacute;e</span>
          </div>

          <h1 className="font-serif text-3xl font-bold text-[#0b382c] tracking-tight">
            Paiement Confirm&eacute; !
          </h1>

          <p className="text-sm text-[#4f6b61] mt-1">
            Vos cr&eacute;dits EasyLead ont &eacute;t&eacute; ajout&eacute;s avec succ&egrave;s &agrave; votre compte.
          </p>
        </div>

        {/* Card details */}
        <div className="p-5 rounded-2xl bg-[#0b382c] text-white space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs text-emerald-200">Cr&eacute;dits ajout&eacute;s</span>
            <span className="font-serif text-2xl font-bold text-[#c6f432]">
              +{details?.credits?.toLocaleString('fr-FR')} cr&eacute;dits
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-200">Montant r&eacute;gl&eacute;</span>
            <span className="font-bold">
              {details?.amount?.toLocaleString('fr-FR')} {details?.currency || 'XAF'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-200">Nouveau solde total</span>
            <span className="font-bold text-[#c6f432]">
              {details?.currentBalance?.toLocaleString('fr-FR')} cr&eacute;dits disponibles
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
            <span className="text-emerald-200">R&eacute;f&eacute;rence transaction</span>
            <span className="font-mono text-[11px] text-white/80">{tx}</span>
          </div>
        </div>

        {isSimulated && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
            Mode Bac &agrave; sable d&eacute;veloppeur : simulation valid&eacute;e sans pr&eacute;l&egrave;vement bancaire r&eacute;el.
          </div>
        )}

        {/* CTA Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/searches/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#0b382c] hover:bg-[#06241c] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02]"
          >
            <Search className="w-4 h-4 text-[#c6f432]" />
            <span>Lancer un Scraping Maps</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#f4f8f4] hover:bg-[#e6f0eb] text-[#0b382c] text-xs sm:text-sm font-bold transition-colors"
          >
            <Coins className="w-4 h-4" />
            <span>Tableau de bord</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BillingReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#0b382c] mx-auto mb-4" />
          <p className="text-sm font-bold text-[#0b382c]">Chargement de la confirmation...</p>
        </div>
      }
    >
      <BillingReturnContent />
    </Suspense>
  );
}

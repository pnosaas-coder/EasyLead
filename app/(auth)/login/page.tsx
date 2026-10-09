'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('philippe.nougoue@prunus-engineering.cm');
  const [password, setPassword] = useState('');
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError ? 'Échec de connexion. Veuillez réessayer.' : null
  );
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          },
        });
        if (error) throw error;
        setMagicLinkSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de la connexion.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erreur OAuth Google.';
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#0b382c]/10 relative z-10">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-[#0b382c] flex items-center justify-center text-[#c6f432] shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#0b382c]">
            EasyLead
          </span>
          <span className="block text-xs font-semibold text-[#0b382c]/60 -mt-0.5 uppercase tracking-wider">
            Afrique B2B Growth
          </span>
        </div>
      </div>

      <h1 className="font-serif text-3xl font-bold text-[#0b382c] tracking-tight mb-2">
        Bon retour
      </h1>
      <p className="text-sm text-[#0b382c]/70 mb-6">
        Connectez-vous pour accéder à vos prospections et générer de nouveaux leads.
      </p>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {magicLinkSent ? (
        <div className="p-6 rounded-2xl bg-[#c6f432]/20 border border-[#c6f432]/50 text-[#0b382c] text-center">
          <CheckCircle2 className="w-8 h-8 text-[#0b382c] mx-auto mb-2" />
          <h3 className="font-semibold text-base mb-1">Lien magique envoyé !</h3>
          <p className="text-xs text-[#0b382c]/80 mb-4">
            Consultez votre boîte de réception à l&apos;adresse <strong>{email}</strong> et cliquez sur le lien sécurisé pour vous connecter.
          </p>
          <button
            type="button"
            onClick={() => setMagicLinkSent(false)}
            className="text-xs font-semibold underline hover:text-black cursor-pointer"
          >
            Utiliser un mot de passe plutôt
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0b382c]/70 mb-1.5">
              Adresse email professionnelle
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#0b382c]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@entreprise.com"
                className="w-full bg-[#f4f8f4] border border-[#0b382c]/15 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-[#0b382c] placeholder-[#0b382c]/35 focus:outline-none focus:ring-2 focus:ring-[#0b382c]"
              />
            </div>
          </div>

          {!isMagicLink && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#0b382c]/70">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => setIsMagicLink(true)}
                  className="text-xs text-[#0b382c]/60 hover:text-[#0b382c] transition-colors cursor-pointer"
                >
                  Connexion par lien sans mot de passe ?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#0b382c]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required={!isMagicLink}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#f4f8f4] border border-[#0b382c]/15 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-[#0b382c] placeholder-[#0b382c]/35 focus:outline-none focus:ring-2 focus:ring-[#0b382c]"
                />
              </div>
            </div>
          )}

          {isMagicLink && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsMagicLink(false)}
                className="text-xs text-[#0b382c]/60 hover:text-[#0b382c] transition-colors cursor-pointer"
              >
                J&apos;ai un mot de passe
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0b382c] hover:bg-[#07251d] text-[#c6f432] font-semibold py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isMagicLink ? 'Envoyer le lien magique' : 'Se connecter'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#0b382c]/10" />
        </div>
        <span className="relative bg-white px-3 text-xs text-[#0b382c]/50 font-medium">
          ou continuez avec
        </span>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full border border-[#0b382c]/15 hover:bg-[#f4f8f4] text-[#0b382c] font-semibold py-3 px-4 rounded-2xl transition-colors flex items-center justify-center gap-3 cursor-pointer text-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Google Workspace</span>
      </button>

      {/* Footer link */}
      <div className="mt-8 pt-6 border-t border-[#0b382c]/10 text-center">
        <p className="text-xs text-[#0b382c]/70">
          Pas encore de compte EasyLead ?{' '}
          <Link
            href="/signup"
            className="font-bold text-[#0b382c] hover:underline inline-flex items-center gap-1"
          >
            Créer un compte (+50 crédits offerts)
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f4f8f4] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c6f432]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#0b382c]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Context Douala */}
      <div className="mb-6 flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#0b382c]/10 text-[#0b382c] shadow-xs">
        <Building2 className="w-3.5 h-3.5 text-[#0b382c]" />
        <span>EasyLead • Douala, Cameroun (Afrique B2B)</span>
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-3xl p-10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#0b382c]" />
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}

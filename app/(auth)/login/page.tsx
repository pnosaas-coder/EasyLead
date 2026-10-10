'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [viewMode, setViewMode] = useState<'login' | 'forgot_password' | 'magic_link'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError ? 'Échec de connexion. Veuillez vérifier vos accès et réessayer.' : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Recharger l'email si l'utilisateur a coché "Rester connecté" précédemment
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('easylead_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch {
      // LocalStorage indisponible
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Mémoriser l'email si l'option est cochée
      try {
        if (rememberMe) {
          localStorage.setItem('easylead_remembered_email', email.trim());
        } else {
          localStorage.removeItem('easylead_remembered_email');
        }
      } catch {
        // Ignorer
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.');
        }
        throw error;
      }

      router.push(redirectTo);
      router.refresh();
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Veuillez renseigner une adresse email valide.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      });
      if (error) throw error;

      setSuccessMessage(
        `Un lien de réinitialisation sécurisé a été envoyé à ${email.trim()}. Vérifiez vos emails.`
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Impossible d’envoyer le lien de réinitialisation.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Veuillez renseigner une adresse email valide.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (error) throw error;

      setSuccessMessage(
        `Lien magique envoyé à ${email.trim()} ! Cliquez dessus pour vous connecter sans mot de passe.`
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erreur envoi lien magique.';
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

      {/* Titre dynamique */}
      {viewMode === 'login' && (
        <>
          <h1 className="font-serif text-3xl font-bold text-[#0b382c] tracking-tight mb-2">
            Se connecter à EasyLead
          </h1>
          <p className="text-sm text-[#0b382c]/70 mb-6">
            Accédez à vos prospections, vos leads qualifiés et vos campagnes WhatsApp.
          </p>
        </>
      )}

      {viewMode === 'forgot_password' && (
        <>
          <button
            type="button"
            onClick={() => {
              setViewMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0b382c]/70 hover:text-[#0b382c] mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à la connexion</span>
          </button>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0b382c] tracking-tight mb-2">
            Mot de passe oublié ?
          </h1>
          <p className="text-sm text-[#0b382c]/70 mb-6">
            Entrez votre adresse email pour recevoir un lien sécurisé de réinitialisation.
          </p>
        </>
      )}

      {viewMode === 'magic_link' && (
        <>
          <button
            type="button"
            onClick={() => {
              setViewMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0b382c]/70 hover:text-[#0b382c] mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à la connexion par mot de passe</span>
          </button>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0b382c] tracking-tight mb-2">
            Connexion sans mot de passe
          </h1>
          <p className="text-sm text-[#0b382c]/70 mb-6">
            Recevez un lien magique instantané dans votre boîte email.
          </p>
        </>
      )}

      {/* Messages d'alerte / succès */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-[#c6f432]/20 border border-[#c6f432]/50 text-[#0b382c] text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#0b382c]" />
          <div>{successMessage}</div>
        </div>
      )}

      {/* VUE 1 : FORMULAIRE DE CONNEXION PRINCIPAL */}
      {viewMode === 'login' && (
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
                placeholder="ex: contact@easylead.com"
                className="w-full bg-[#f4f8f4] border border-[#0b382c]/15 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-[#0b382c] placeholder-[#0b382c]/35 focus:outline-none focus:ring-2 focus:ring-[#0b382c]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#0b382c]/70">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => {
                  setViewMode('forgot_password');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-xs text-[#0b382c]/70 hover:text-[#0b382c] font-semibold transition-colors cursor-pointer"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#0b382c]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#f4f8f4] border border-[#0b382c]/15 rounded-2xl pl-10 pr-11 py-3 text-sm font-medium text-[#0b382c] placeholder-[#0b382c]/35 focus:outline-none focus:ring-2 focus:ring-[#0b382c]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0b382c]/40 hover:text-[#0b382c] cursor-pointer"
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Option Rester Connecté */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#0b382c] accent-[#0b382c] cursor-pointer"
              />
              <span className="text-xs font-semibold text-[#0b382c]/80">
                Rester connecté
              </span>
            </label>

            <button
              type="button"
              onClick={() => {
                setViewMode('magic_link');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-xs text-[#0b382c]/60 hover:text-[#0b382c] transition-colors cursor-pointer"
            >
              Lien sans mot de passe ?
            </button>
          </div>

          {/* Bouton de soumission principal */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0b382c] hover:bg-[#07251d] text-[#c6f432] font-semibold py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* VUE 2 : MOT DE PASSE OUBLIÉ */}
      {viewMode === 'forgot_password' && (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0b382c]/70 mb-1.5">
              Votre adresse email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#0b382c]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: contact@easylead.com"
                className="w-full bg-[#f4f8f4] border border-[#0b382c]/15 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-[#0b382c] placeholder-[#0b382c]/35 focus:outline-none focus:ring-2 focus:ring-[#0b382c]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0b382c] hover:bg-[#07251d] text-[#c6f432] font-semibold py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Envoyer le lien de réinitialisation</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* VUE 3 : LIEN MAGIQUE */}
      {viewMode === 'magic_link' && (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0b382c]/70 mb-1.5">
              Votre adresse email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#0b382c]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: contact@easylead.com"
                className="w-full bg-[#f4f8f4] border border-[#0b382c]/15 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-[#0b382c] placeholder-[#0b382c]/35 focus:outline-none focus:ring-2 focus:ring-[#0b382c]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0b382c] hover:bg-[#07251d] text-[#c6f432] font-semibold py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Envoyer le lien magique</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Séparateur pour options alternatives */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#0b382c]/10" />
        </div>
        <span className="relative bg-white px-3 text-xs text-[#0b382c]/50 font-medium">
          ou continuez avec
        </span>
      </div>

      {/* Bouton Google Officiel */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full border border-[#0b382c]/15 hover:bg-[#f4f8f4] text-[#0b382c] font-semibold py-3 px-4 rounded-2xl transition-colors flex items-center justify-center gap-3 cursor-pointer text-sm shadow-2xs"
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
        <span>Se connecter avec Google</span>
      </button>

      {/* Footer link Créer un compte */}
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

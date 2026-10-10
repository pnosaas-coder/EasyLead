import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get('provider') || 'google';
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json(
      { enabled: false, error: 'Configuration Supabase introuvable.' },
      { status: 500 }
    );
  }

  // URL de redirection finale après connexion
  const origin = request.nextUrl.origin;
  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
  const authorizeUrl = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(callbackUrl)}`;

  try {
    const testRes = await fetch(authorizeUrl, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
    });

    // 400 signifie que le fournisseur OAuth n'est pas configuré/activé dans Supabase
    if (testRes.status === 400) {
      const errorJson = await testRes.json().catch(() => null);
      if (
        errorJson?.msg?.includes('not enabled') ||
        errorJson?.error_code === 'validation_failed'
      ) {
        return NextResponse.json({
          enabled: false,
          error:
            "La connexion Google OAuth n'est pas encore activée dans votre console Supabase (Authentication > Providers > Google). Vous pouvez vous connecter directement avec votre Adresse email et Mot de passe.",
        });
      }
    }

    // Si activé, Supabase redirige vers accounts.google.com
    const location = testRes.headers.get('location');
    return NextResponse.json({
      enabled: true,
      url: location || authorizeUrl,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      enabled: false,
      error:
        err instanceof Error
          ? err.message
          : 'Impossible de joindre le service OAuth Google.',
    });
  }
}

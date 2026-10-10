import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // Vérifier si le profil existe déjà dans la table profiles (notamment pour les nouveaux utilisateurs Google)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!existingProfile) {
        const fullName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email?.split('@')[0] ||
          'Utilisateur';

        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
          company_name: data.user.user_metadata?.company_name || 'Mon Entreprise',
          credits_balance: 50,
          onboarded: true,
          country_code: 'CM',
          default_language: 'fr',
        });
      }

      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(
    new URL('/login?error=auth_callback_failed', request.url)
  );
}

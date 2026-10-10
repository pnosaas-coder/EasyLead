import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addCredits } from '@/lib/credits';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const result = await addCredits(
      user.id,
      1000,
      'purchase',
      `test_refill_${Date.now()}`
    );

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la recharge');
    }

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      message: '1 000 crédits de test ajoutés avec succès !',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

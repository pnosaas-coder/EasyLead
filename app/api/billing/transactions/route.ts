import { NextResponse, connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  await connection();
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const admin = createAdminClient();

    // 1. Récupérer les paiements de l'utilisateur
    const { data: payments } = await admin
      .from('easylead_payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // 2. Récupérer les transactions de crédits
    const { data: transactions } = await admin
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const formattedPayments = (payments || []).map((p) => {
      const raw = (p.raw || {}) as Record<string, unknown>;
      return {
        id: p.id,
        reference: `FAC-${p.provider_tx_id.slice(-8).toUpperCase()}`,
        date: new Date(p.created_at).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        packName:
          p.pack_id === 'starter'
            ? 'Pack Starter (300 Crédits)'
            : p.pack_id === 'pro'
            ? 'Pack Pro (1 500 Crédits)'
            : 'Pack Business (5 000 Crédits)',
        credits: p.credits,
        amount: p.amount,
        currency: p.currency,
        paymentMethod: (raw.paymentMethod as string) || 'mtn_momo',
        phoneNumber: p.phone_number || undefined,
        status: p.status,
      };
    });

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
      transactions: transactions || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

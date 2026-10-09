import { NextRequest, NextResponse, connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cinetPayProvider } from '@/lib/payments/cinetpay';

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const tx = searchParams.get('tx');

    if (!tx) {
      return NextResponse.json(
        { error: 'ID de transaction manquant' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 1. Chercher le paiement dans la table
    const { data: payment, error: fetchError } = await admin
      .from('easylead_payments')
      .select('*')
      .eq('provider_tx_id', tx)
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError || !payment) {
      return NextResponse.json(
        { error: 'Transaction introuvable' },
        { status: 404 }
      );
    }

    // 2. Si le paiement est toujours en attente, faire une vérification directe (sync-on-return)
    if (payment.status === 'pending') {
      const verification = await cinetPayProvider.verifyTransaction(tx);

      if (verification.status === 'succeeded') {
        const { data: updatedPayment } = await admin
          .from('easylead_payments')
          .update({
            status: 'succeeded',
            raw: {
              verifiedOnReturn: true,
              verifiedAt: new Date().toISOString(),
              details: verification.raw ? JSON.parse(JSON.stringify(verification.raw)) : null,
            },
          })
          .eq('id', payment.id)
          .eq('status', 'pending')
          .select('*')
          .maybeSingle();

        if (updatedPayment) {
          await admin.rpc('add_credits', {
            p_user: user.id,
            p_amount: updatedPayment.credits,
            p_reason: 'purchase',
            p_ref: updatedPayment.id,
          });
        }
      } else if (verification.status === 'failed') {
        await admin
          .from('easylead_payments')
          .update({ status: 'failed' })
          .eq('id', payment.id)
          .eq('status', 'pending');
      }
    }

    // 3. Récupérer le solde actuel de l'utilisateur
    const { data: profile } = await admin
      .from('profiles')
      .select('credits_balance')
      .eq('id', user.id)
      .single();

    // 4. Re-vérifier l'état final du paiement
    const { data: finalPayment } = await admin
      .from('easylead_payments')
      .select('*')
      .eq('id', payment.id)
      .single();

    return NextResponse.json({
      success: true,
      status: finalPayment?.status || payment.status,
      credits: payment.credits,
      amount: payment.amount,
      currency: payment.currency,
      packId: payment.pack_id,
      currentBalance: profile?.credits_balance ?? 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('[GET /api/billing/verify Exception]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

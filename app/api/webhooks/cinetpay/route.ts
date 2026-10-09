import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cinetPayProvider } from '@/lib/payments/cinetpay';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const tokenHeader = req.headers.get('x-token');

    // 1. Vérification de la signature HMAC
    const isSignatureValid = cinetPayProvider.verifyWebhookSignature(
      rawBody,
      tokenHeader
    );

    if (!isSignatureValid) {
      console.warn('[CinetPay Webhook] Signature HMAC invalide (x-token).');
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 401 }
      );
    }

    // 2. Parser le payload (supporte JSON ou Form-UrlEncoded)
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      const searchParams = new URLSearchParams(rawBody);
      body = Object.fromEntries(searchParams.entries());
    }

    const providerTxId =
      (body.cpm_trans_id as string) ||
      (body.transaction_id as string) ||
      (body.providerTxId as string) ||
      (body.tx as string);

    if (!providerTxId) {
      return NextResponse.json(
        { error: 'ID de transaction manquant' },
        { status: 400 }
      );
    }

    // 3. Ne JAMAIS faire confiance au payload seul : interroger l'API officielle CinetPay /check
    const verification = await cinetPayProvider.verifyTransaction(providerTxId);

    const admin = createAdminClient();

    if (verification.status === 'succeeded') {
      // 4. Mise à jour atomique idempotente : ne passe à succeeded QUE si status='pending'
      const { data: updatedPayment, error: updateError } = await admin
        .from('easylead_payments')
        .update({
          status: 'succeeded',
          raw: {
            verifiedAt: new Date().toISOString(),
            operatorId: verification.operatorId,
            paymentMethod: verification.paymentMethod,
            verificationDetails: verification.raw ? JSON.parse(JSON.stringify(verification.raw)) : null,
          },
        })
        .eq('provider_tx_id', providerTxId)
        .eq('status', 'pending')
        .select('*')
        .maybeSingle();

      if (updateError) {
        console.error('[CinetPay Webhook DB Update Error]', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Si une ligne est retournée, la transaction vient d'être validée pour la première fois
      if (updatedPayment) {
        console.log(
          `[CinetPay Webhook] Paiement validé avec succès. Ajout de ${updatedPayment.credits} crédits à l'utilisateur ${updatedPayment.user_id}.`
        );

        const { error: rpcError } = await admin.rpc('add_credits', {
          p_user: updatedPayment.user_id,
          p_amount: updatedPayment.credits,
          p_reason: 'purchase',
          p_ref: updatedPayment.id,
        });

        if (rpcError) {
          console.error('[CinetPay Webhook add_credits RPC Error]', rpcError);
          return NextResponse.json(
            { error: 'Erreur lors du crédit du compte' },
            { status: 500 }
          );
        }
      } else {
        console.log(
          `[CinetPay Webhook] Transaction ${providerTxId} déjà créditée ou inexistante (idempotent no-op).`
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Transaction traitée avec succès',
        providerTxId,
      });
    }

    if (verification.status === 'failed') {
      await admin
        .from('easylead_payments')
        .update({
          status: 'failed',
          raw: {
            verifiedAt: new Date().toISOString(),
            verificationDetails: verification.raw ? JSON.parse(JSON.stringify(verification.raw)) : null,
          },
        })
        .eq('provider_tx_id', providerTxId)
        .eq('status', 'pending');

      return NextResponse.json({
        success: true,
        message: 'Transaction marquée comme échouée',
        providerTxId,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction en attente',
      providerTxId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    console.error('[CinetPay Webhook Exception]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

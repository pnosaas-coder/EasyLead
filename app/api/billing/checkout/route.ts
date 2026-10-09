import { NextRequest, NextResponse, connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPackById } from '@/lib/payments/packs';
import { cinetPayProvider } from '@/lib/payments/cinetpay';

export async function POST(req: NextRequest) {
  await connection();
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

    const body = await req.json();
    const { packId, phoneNumber, paymentMethod } = body;

    const pack = getPackById(packId);
    if (!pack) {
      return NextResponse.json(
        { error: `Pack inconnu: ${packId}` },
        { status: 400 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin ||
      'http://localhost:3000';

    const notifyUrl = `${appUrl}/api/webhooks/cinetpay`;
    const returnUrl = `${appUrl}/billing/return`;

    const checkout = await cinetPayProvider.createCheckout({
      userId: user.id,
      userEmail: user.email || 'client@easylead.africa',
      userName: (user.user_metadata?.full_name as string) || undefined,
      packId: pack.id,
      credits: pack.credits,
      amount: pack.price,
      currency: pack.currency,
      phoneNumber,
      paymentMethod,
      notifyUrl,
      returnUrl,
    });

    const admin = createAdminClient();
    const { error: insertError } = await admin
      .from('easylead_payments')
      .insert({
        user_id: user.id,
        pack_id: pack.id,
        amount: pack.price,
        credits: pack.credits,
        currency: pack.currency,
        status: 'pending',
        provider: 'cinetpay',
        provider_tx_id: checkout.providerTxId,
        phone_number: phoneNumber || null,
        raw: {
          paymentMethod: paymentMethod || 'all',
          initiatedAt: new Date().toISOString(),
        },
      });

    if (insertError) {
      console.error('[Checkout DB Error]', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de l’enregistrement de la transaction.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: checkout.paymentUrl,
      providerTxId: checkout.providerTxId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('[POST /api/billing/checkout Exception]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

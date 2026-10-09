import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ingestRun } from '@/lib/apify/ingest';

function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const searchId = searchParams.get('searchId');

    const expectedSecret =
      process.env.APIFY_WEBHOOK_SECRET || 'easylead_dev_secret';

    if (!secret || !timingSafeCompare(secret, expectedSecret)) {
      console.warn('[Webhook Apify] Tentative avec secret invalide');
      return NextResponse.json({ error: 'Secret invalide' }, { status: 401 });
    }

    if (!searchId) {
      return NextResponse.json(
        { error: 'Paramètre searchId manquant' },
        { status: 400 }
      );
    }

    console.info(`[Webhook Apify] Notification reçue pour searchId: ${searchId}`);

    // Exécuter l'ingestion idempotente
    const result = await ingestRun(searchId);

    return NextResponse.json({
      received: true,
      searchId,
      result,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erreur interne webhook';
    console.error('[Webhook Apify] Erreur serveur:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

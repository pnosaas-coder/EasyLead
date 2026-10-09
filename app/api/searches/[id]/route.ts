import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getApifyClient } from '@/lib/apify/client';
import { ingestRun } from '@/lib/apify/ingest';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: searchId } = await params;
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

    const admin = createAdminClient();

    // 1. Récupérer la recherche
    const { data: search, error: searchError } = await admin
      .from('searches')
      .select('*')
      .eq('id', searchId)
      .eq('user_id', user.id)
      .single();

    if (searchError || !search) {
      return NextResponse.json(
        { error: 'Recherche introuvable ou accès refusé.' },
        { status: 404 }
      );
    }

    // 2. Mécanisme « sync-on-read » si la recherche est encore marquée 'running'
    if (search.status === 'running') {
      const apifyClient = getApifyClient();

      if (apifyClient && search.apify_run_id && !search.apify_run_id.startsWith('mock_')) {
        try {
          const run = await apifyClient.run(search.apify_run_id).get();
          if (run?.status === 'SUCCEEDED') {
            await ingestRun(search.id);
          } else if (
            run?.status === 'FAILED' ||
            run?.status === 'TIMED-OUT' ||
            run?.status === 'ABORTED'
          ) {
            // Échec Apify, ingestion traitera le remboursement
            await ingestRun(search.id);
          }
        } catch (runErr) {
          console.error('[Sync-on-read] Erreur vérification run Apify:', runErr);
        }
      } else {
        // En développement local sans webhook joignable ni Apify réel,
        // déclencher l'ingestion après un court délai ou dès la première lecture
        const searchAgeMs = Date.now() - new Date(search.created_at).getTime();
        if (searchAgeMs > 2500) {
          await ingestRun(search.id);
        }
      }
    }

    // 3. Relire l'état final et les leads
    const { data: updatedSearch } = await admin
      .from('searches')
      .select('*')
      .eq('id', searchId)
      .single();

    const { data: leads } = await admin
      .from('leads')
      .select('*')
      .eq('search_id', searchId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      search: updatedSearch || search,
      leads: leads || [],
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

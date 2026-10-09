import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateSearchCost, debitCredits } from '@/lib/credits';
import { startPlacesScrapeRun } from '@/lib/apify/client';
import { getCountryByCode } from '@/lib/countries';

export async function POST(req: NextRequest) {
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
    const {
      sector,
      city,
      countryCode = 'CM',
      maxResults = 50,
      enrichContacts = false,
    } = body;

    if (!sector || typeof sector !== 'string' || sector.trim().length < 2) {
      return NextResponse.json(
        { error: "Veuillez préciser un secteur d'activité valide." },
        { status: 400 }
      );
    }

    if (!city || typeof city !== 'string' || city.trim().length < 2) {
      return NextResponse.json(
        { error: 'Veuillez préciser une ville valide.' },
        { status: 400 }
      );
    }

    const parsedMaxResults = Math.min(
      Math.max(Number(maxResults) || 50, 10),
      200
    );
    const country = getCountryByCode(countryCode);

    const admin = createAdminClient();

    // 1. Limite de concurrence : max 2 recherches en cours par utilisateur
    const { count: activeSearchesCount, error: countError } = await admin
      .from('searches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['pending', 'running', 'ingesting']);

    if (countError) {
      console.error('Error checking active searches', countError);
    }

    if ((activeSearchesCount || 0) >= 2) {
      return NextResponse.json(
        {
          error:
            'Vous avez déjà 2 recherches en cours. Veuillez attendre leur fin avant d’en lancer une nouvelle.',
        },
        { status: 429 }
      );
    }

    // 2. Calcul et réservation des crédits
    const creditsToReserve = calculateSearchCost(
      parsedMaxResults,
      Boolean(enrichContacts)
    );

    const debitResult = await debitCredits(
      user.id,
      creditsToReserve,
      'search_reserve',
      `search_${Date.now()}`
    );

    if (!debitResult.success) {
      return NextResponse.json(
        {
          error:
            debitResult.error ||
            'Crédits insuffisants. Rechargez votre solde pour lancer cette recherche.',
        },
        { status: 402 }
      );
    }

    // 3. Insertion de la recherche en statut 'pending'
    const { data: searchRecord, error: insertError } = await admin
      .from('searches')
      .insert({
        user_id: user.id,
        sector: sector.trim(),
        city: city.trim(),
        country_code: country.code,
        max_results: parsedMaxResults,
        enrich_contacts: Boolean(enrichContacts),
        status: 'pending',
        credits_reserved: creditsToReserve,
      })
      .select('*')
      .single();

    if (insertError || !searchRecord) {
      // Rembourser immédiatement si échec d'insertion
      await debitCredits(
        user.id,
        -creditsToReserve,
        'search_refund',
        'insert_failed'
      );
      throw new Error(`Erreur création recherche: ${insertError?.message}`);
    }

    // 4. Lancement asynchrone du scraper Apify
    try {
      const scrapeRun = await startPlacesScrapeRun({
        searchId: searchRecord.id,
        sector: searchRecord.sector,
        city: searchRecord.city,
        countryName: country.name,
        countryCode: country.code,
        maxResults: parsedMaxResults,
        enrichContacts: Boolean(enrichContacts),
      });

      await admin
        .from('searches')
        .update({
          apify_run_id: scrapeRun.runId,
          apify_dataset_id: scrapeRun.datasetId,
          status: 'running',
        })
        .eq('id', searchRecord.id);

      return NextResponse.json({
        success: true,
        searchId: searchRecord.id,
        status: 'running',
        creditsReserved: creditsToReserve,
        isSimulated: scrapeRun.isSimulated ?? false,
      });
    } catch (scrapeErr: unknown) {
      console.error('Erreur démarrage Apify:', scrapeErr);
      // Remboursement en cas d'échec de démarrage
      await debitCredits(
        user.id,
        -creditsToReserve,
        'search_refund',
        searchRecord.id
      );

      await admin
        .from('searches')
        .update({
          status: 'failed',
          error:
            scrapeErr instanceof Error
              ? scrapeErr.message
              : 'Échec du démarrage Apify',
        })
        .eq('id', searchRecord.id);

      return NextResponse.json(
        { error: 'Échec du lancement du scraping. Vos crédits ont été remboursés.' },
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

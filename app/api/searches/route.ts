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

    // 1. Nettoyage des recherches fantômes et assouplissement de concurrence
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    await admin
      .from('searches')
      .update({ status: 'failed', error: 'Délai d’attente dépassé' })
      .eq('user_id', user.id)
      .in('status', ['pending', 'running', 'ingesting'])
      .lt('created_at', tenMinutesAgo);

    // 2. Calcul et réservation des crédits (avec auto-recharge gracieuse en phase test)
    const creditsToReserve = calculateSearchCost(
      parsedMaxResults,
      Boolean(enrichContacts)
    );

    let debitResult = await debitCredits(
      user.id,
      creditsToReserve,
      'search_reserve',
      `search_${Date.now()}`
    );

    // En phase de test : si les crédits sont insuffisants, auto-recharge immédiate de 1 000 crédits gratuits !
    if (!debitResult.success) {
      console.info(
        `[EasyLead Phase Test] Crédits insuffisants pour ${user.id}. Attribution automatique de 1 000 crédits offerts.`
      );
      await admin
        .from('profiles')
        .update({ credits_balance: 1000 + creditsToReserve })
        .eq('id', user.id);

      debitResult = await debitCredits(
        user.id,
        creditsToReserve,
        'search_reserve',
        `search_${Date.now()}`
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

    // 4. Lancement asynchrone du scraper Apify (avec fallback résilient)
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
      console.error(
        'Erreur démarrage Apify direct, basculement en exécution sécurisée:',
        scrapeErr
      );

      // Pour la phase de test, on ne bloque jamais l'utilisateur
      await admin
        .from('searches')
        .update({
          apify_run_id: `fallback_${searchRecord.id}`,
          apify_dataset_id: `fallback_${searchRecord.id}`,
          status: 'running',
        })
        .eq('id', searchRecord.id);

      return NextResponse.json({
        success: true,
        searchId: searchRecord.id,
        status: 'running',
        creditsReserved: creditsToReserve,
        isSimulated: true,
      });
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

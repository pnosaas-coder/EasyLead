import { ApifyClient } from 'apify-client';

const APIFY_ACTOR_ID = 'compass/crawler-google-places';

// Déblocage des certificats auto-signés sur Windows / antivirus / proxies d'entreprise
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export function getApifyClient(): ApifyClient | null {
  const token = process.env.APIFY_TOKEN;
  if (!token || token.trim() === '' || token.includes('your_token')) {
    return null;
  }
  return new ApifyClient({ token });
}

export interface StartScrapeOptions {
  searchId: string;
  sector: string;
  city: string;
  countryName: string;
  countryCode: string;
  maxResults: number;
  enrichContacts: boolean;
}

export interface StartScrapeResult {
  runId: string;
  datasetId: string;
  isSimulated?: boolean;
}

/**
 * Lance une session asynchrone de scraping Google Places via Apify
 */
export async function startPlacesScrapeRun({
  searchId,
  sector,
  city,
  countryName,
  countryCode,
  maxResults,
  enrichContacts,
}: StartScrapeOptions): Promise<StartScrapeResult> {
  const client = getApifyClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const webhookSecret = process.env.APIFY_WEBHOOK_SECRET || 'easylead_dev_secret';

  // Si aucun token Apify n'est configuré (mode développement local sans clé Apify),
  // on génère des identifiants simulés
  if (!client) {
    console.info(
      `[EasyLead Apify] Aucun APIFY_TOKEN configuré. Mode simulation actif pour la recherche ${searchId} (${sector} - ${city}).`
    );
    return {
      runId: `mock_run_${searchId}_${Date.now()}`,
      datasetId: `mock_dataset_${searchId}`,
      isSimulated: true,
    };
  }

  const isPublicHttps =
    appUrl.startsWith('https://') &&
    !appUrl.includes('localhost') &&
    !appUrl.includes('127.0.0.1');

  const input = {
    searchStringsArray: [sector],
    locationQuery: `${city}, ${countryName}`,
    maxCrawledPlacesPerSearch: maxResults,
    language: countryCode === 'NG' || countryCode === 'GH' ? 'en' : 'fr',
    skipClosedPlaces: true,
    scrapeContacts: enrichContacts,
    maxReviews: 0,
    maxImages: 0,
  };

  const startOptions = isPublicHttps
    ? {
        webhooks: [
          {
            eventTypes: [
              'ACTOR.RUN.SUCCEEDED',
              'ACTOR.RUN.FAILED',
              'ACTOR.RUN.TIMED_OUT',
              'ACTOR.RUN.ABORTED',
            ],
            requestUrl: `${appUrl}/api/webhooks/apify?secret=${encodeURIComponent(
              webhookSecret
            )}&searchId=${encodeURIComponent(searchId)}`,
          },
        ],
      }
    : {};

  const run = await client.actor(APIFY_ACTOR_ID).start(input, startOptions as any);

  return {
    runId: run.id,
    datasetId: run.defaultDatasetId,
    isSimulated: false,
  };
}

import { createAnthropic } from '@ai-sdk/anthropic';

/**
 * Configure et retourne l'instance du modèle Claude routée via Vercel AI Gateway
 */
export function getAIModel() {
  const apiKey =
    process.env.AI_GATEWAY_API_KEY ||
    process.env.ANTHROPIC_API_KEY;

  const isUsingGateway = Boolean(process.env.AI_GATEWAY_API_KEY);
  const baseURL = isUsingGateway
    ? 'https://ai-gateway.vercel.sh'
    : undefined;

  const modelSlug =
    process.env.AI_MODEL || 'claude-3-5-sonnet-20241022';

  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  const anthropic = createAnthropic({
    apiKey,
    baseURL,
  });

  return anthropic(modelSlug);
}

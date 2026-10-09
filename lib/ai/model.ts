import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

/**
 * Configure et retourne l'instance du modèle d'IA (OpenAI GPT ou Anthropic Claude)
 */
export function getAIModel() {
  // 1. Détection OpenAI si une clé OpenAI est renseignée
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    let modelSlug = process.env.AI_MODEL || 'gpt-4o';
    if (modelSlug.includes('claude') || modelSlug.includes('anthropic')) {
      modelSlug = 'gpt-4o';
    }
    return openai(modelSlug);
  }

  // 2. Détection Claude (Anthropic direct ou via Vercel AI Gateway)
  const apiKey =
    process.env.AI_GATEWAY_API_KEY ||
    process.env.ANTHROPIC_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    const isUsingGateway = Boolean(process.env.AI_GATEWAY_API_KEY);
    const baseURL = isUsingGateway
      ? 'https://ai-gateway.vercel.sh'
      : undefined;

    let modelSlug = process.env.AI_MODEL || 'claude-3-5-sonnet-20241022';
    if (modelSlug.startsWith('gpt-')) {
      modelSlug = 'claude-3-5-sonnet-20241022';
    }

    const anthropic = createAnthropic({
      apiKey,
      baseURL,
    });

    return anthropic(modelSlug);
  }

  return null;
}

import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

/**
 * Configure et retourne l'instance du modèle d'IA (Google Gemini, OpenAI GPT ou Anthropic Claude)
 */
export function getAIModel() {
  const modelSlug = (process.env.AI_MODEL || '').toLowerCase();
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();

  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey =
    process.env.AI_GATEWAY_API_KEY ||
    process.env.ANTHROPIC_API_KEY;

  // 1. Détection Google Gemini (Option 100% Gratuite via Google AI Studio)
  const wantsGemini =
    provider === 'gemini' ||
    modelSlug.includes('gemini') ||
    (Boolean(geminiKey) && !modelSlug.includes('gpt') && !modelSlug.includes('claude'));

  if (geminiKey && geminiKey.trim() !== '' && wantsGemini) {
    const google = createGoogleGenerativeAI({
      apiKey: geminiKey.trim(),
    });
    let modelName = process.env.AI_MODEL || 'gemini-3.8-flash';
    if (!modelName.includes('gemini') || modelName.includes('1.5') || modelName.includes('2.5')) {
      modelName = 'gemini-3.8-flash';
    }
    return google(modelName);
  }

  // 2. Détection OpenAI GPT
  const wantsOpenAI =
    provider === 'openai' ||
    modelSlug.includes('gpt') ||
    (Boolean(openaiKey) && !geminiKey && !anthropicKey);

  if (openaiKey && openaiKey.trim() !== '' && wantsOpenAI) {
    const openai = createOpenAI({
      apiKey: openaiKey.trim(),
    });
    let name = process.env.AI_MODEL || 'gpt-4o';
    if (
      name.includes('claude') ||
      name.includes('anthropic') ||
      name.includes('gemini')
    ) {
      name = 'gpt-4o';
    }
    return openai(name);
  }

  // 3. Fallback Gemini si clé Gemini présente
  if (geminiKey && geminiKey.trim() !== '') {
    const google = createGoogleGenerativeAI({
      apiKey: geminiKey.trim(),
    });
    return google('gemini-3.8-flash');
  }

  // 4. Détection Claude (Anthropic direct ou via Vercel AI Gateway)
  if (anthropicKey && anthropicKey.trim() !== '') {
    const isUsingGateway = Boolean(process.env.AI_GATEWAY_API_KEY);
    const baseURL = isUsingGateway
      ? 'https://ai-gateway.vercel.sh'
      : undefined;

    let name = process.env.AI_MODEL || 'claude-3-5-sonnet-20241022';
    if (name.startsWith('gpt-') || name.includes('gemini')) {
      name = 'claude-3-5-sonnet-20241022';
    }

    const anthropic = createAnthropic({
      apiKey: anthropicKey.trim(),
      baseURL,
    });

    return anthropic(name);
  }

  return null;
}

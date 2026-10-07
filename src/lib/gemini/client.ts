import { GoogleGenerativeAI } from '@google/generative-ai';

// Server-only - this file should never be imported from client components
if (typeof window !== 'undefined') {
  throw new Error('Gemini client must not be used in client-side code');
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. AI features will not work.');
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// High-speed, stable models in order of speed and current capacity.
// gemini-3.5-flash-lite and gemini-3.5-flash respond in 1-3 seconds,
// whereas gemini-3.8-flash is currently experiencing 503 high-demand spikes.
export const DEFAULT_AI_MODEL =
  process.env.GEMINI_MODEL && process.env.GEMINI_MODEL !== 'gemini-3.8-flash'
    ? process.env.GEMINI_MODEL
    : 'gemini-3.5-flash-lite';

export function getGeminiModel(modelName: string = DEFAULT_AI_MODEL) {
  if (!genAI) {
    throw new Error('Gemini API key is not configured');
  }
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
    },
  });
}

export function getGeminiVisionModel(modelName: string = DEFAULT_AI_MODEL) {
  return getGeminiModel(modelName);
}

/**
 * Robust OCR vision runner with automatic fallback and timeout.
 * Prevents hanging when a specific Gemini model experiences 503 spikes.
 */
export async function generateVisionJsonWithFallback(
  parts: any[],
  timeoutMs = 15000
) {
  if (!genAI) {
    throw new Error('Gemini API key is not configured');
  }

  const candidateModels = [
    DEFAULT_AI_MODEL,
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
  ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Timeout calling Gemini ${modelName} after ${timeoutMs}ms`)),
          timeoutMs
        )
      );

      const result = (await Promise.race([
        model.generateContent(parts),
        timeoutPromise,
      ])) as any;

      const text = result.response.text();
      return { text, modelUsed: modelName };
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Model ${modelName} failed or timed out:`, err?.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed to process vision request');
}

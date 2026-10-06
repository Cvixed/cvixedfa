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

const defaultModelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

export function getGeminiModel(modelName: string = defaultModelName) {
  if (!genAI) {
    throw new Error('Gemini API key is not configured');
  }
  return genAI.getGenerativeModel({ model: modelName });
}

export function getGeminiVisionModel(modelName: string = defaultModelName) {
  return getGeminiModel(modelName);
}

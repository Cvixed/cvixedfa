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

export function getGeminiModel(modelName: string = 'gemini-2.0-flash') {
  if (!genAI) {
    throw new Error('Gemini API key is not configured');
  }
  return genAI.getGenerativeModel({ model: modelName });
}

export function getGeminiVisionModel() {
  return getGeminiModel('gemini-2.0-flash');
}

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

/**
 * Models tried in order (Google AI Studio free tier, GEMINI_API_KEY).
 * Google retires models for new keys and the free tier gets overloaded, so
 * callers fall through this list on 404/429/503. The "-latest" aliases always
 * point at a current model. GEMINI_MODEL, if set, goes first.
 */
export const MODEL_CHAIN = [
  ...(process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : []),
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
].map((name) => `googleai/${name}`);

export const ai = genkit({
  plugins: [googleAI()],
  model: MODEL_CHAIN[0],
});

/** True for errors where another model may succeed: retired, rate-limited or overloaded. */
export function isModelUnavailable(error: unknown) {
  return /\b(404|429|503)\b|RESOURCE_EXHAUSTED|UNAVAILABLE|overloaded|high demand|no longer available/i.test(
    String((error as any)?.message ?? error)
  );
}

/** Runs `call` with each model in MODEL_CHAIN until one answers. */
export async function withModelFallback<T>(call: (model: string) => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (const model of MODEL_CHAIN) {
    try {
      return await call(model);
    } catch (error) {
      lastError = error;
      if (!isModelUnavailable(error)) throw error;
      console.warn(`Gemini model ${model} unavailable, trying the next one.`);
    }
  }
  throw lastError;
}

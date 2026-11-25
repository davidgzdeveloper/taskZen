import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

/**
 * Gemini via Google AI Studio (free tier). Reads GEMINI_API_KEY.
 * Override the model with GEMINI_MODEL, e.g. "gemini-2.5-flash-lite".
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: `googleai/${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`,
});

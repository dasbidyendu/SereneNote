import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {ai} from '@genkit-ai/ai';

export const ai_ = genkit({
  plugins: [googleAI(), ai()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

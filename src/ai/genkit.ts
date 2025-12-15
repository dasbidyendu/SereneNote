import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {dotprompt} from '@genkit-ai/dotprompt';

export const ai = genkit({
  plugins: [googleAI(), dotprompt()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});


'use server';

/**
 * @fileOverview Provides Cognitive Behavioral Therapy (CBT) based suggestions for stress alleviation tailored to the user's journal entries and tracked mood.
 *
 * @exported {
 *   cbtStressAlleviationSuggestions: (input: CbtStressAlleviationInput) => Promise<CbtStressAlleviationOutput>;
 * }
 */

import { ai_ } from '@/ai/genkit';
import {z} from 'genkit';

const CbtStressAlleviationInputSchema = z.object({
  journalEntry: z
    .string()
    .describe('The user journal entry.'),
  mood: z.string().describe('The user current mood.'),
});
export type CbtStressAlleviationInput = z.infer<typeof CbtStressAlleviationInputSchema>;

const CbtStressAlleviationOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'CBT based suggestions for stress alleviation tailored to the journal entry and mood.'
    ),
  guidedMeditation: z
    .string()
    .describe('A short, 2-3 paragraph guided meditation script to help calm the user.'),
  imagePrompt: z
    .string()
    .describe('A DALL-E prompt for a calming, serene, photorealistic image that relates to the user\'s entry or mood.'),
});
export type CbtStressAlleviationOutput = z.infer<typeof CbtStressAlleviationOutputSchema>;

export async function cbtStressAlleviationSuggestions(
  input: CbtStressAlleviationInput
): Promise<CbtStressAlleviationOutput> {
  return cbtStressAlleviationFlow(input);
}

const prompt = ai_.definePrompt({
  name: 'cbtStressAlleviationPrompt',
  model: 'googleai/gemini-pro',
  input: {schema: CbtStressAlleviationInputSchema},
  output: {schema: CbtStressAlleviationOutputSchema},
  prompt: `You are a mental health expert providing Cognitive Behavioral Therapy (CBT) based suggestions for stress alleviation.

  Based on the user's journal entry and their mood, provide:
  1. Tailored, actionable suggestions.
  2. A short, calming, 2-3 paragraph guided meditation script.
  3. A prompt for a text-to-image model to generate a serene, calming, photorealistic image that is relevant to the journal entry.

  Journal Entry: {{{journalEntry}}}
  Mood: {{{mood}}}
  `,
});

const cbtStressAlleviationFlow = ai_.defineFlow(
  {
    name: 'cbtStressAlleviationFlow',
    inputSchema: CbtStressAlleviationInputSchema,
    outputSchema: CbtStressAlleviationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview Provides actionable tips to improve a user's mood based on recent patterns.
 *
 * @exported {
 *   getMoodImprovementTips: (input: MoodImprovementInput) => Promise<MoodImprovementOutput>;
 * }
 */

import {ai_ as ai} from '@/ai/genkit';
import {z} from 'genkit';

const MoodImprovementInputSchema = z.object({
  moods: z.array(z.string()).describe('A list of the user\'s moods over the last 7 days. Can contain "No Entry".'),
});
export type MoodImprovementInput = z.infer<typeof MoodImprovementInputSchema>;

const MoodImprovementOutputSchema = z.object({
  tips: z.string().describe('A short, actionable list of 2-3 tips to help improve the user\'s mood, formatted as a string with bullet points.'),
});
export type MoodImprovementOutput = z.infer<typeof MoodImprovementOutputSchema>;

export async function getMoodImprovementTips(
  input: MoodImprovementInput
): Promise<MoodImprovementOutput> {
  return moodImprovementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moodImprovementPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: MoodImprovementInputSchema},
  output: {schema: MoodImprovementOutputSchema},
  prompt: `You are a friendly and encouraging wellness coach. Based on the user's mood trend over the last week, provide 2-3 simple, actionable, and positive tips to help them improve their well-being.

  Recent Moods: {{{moods}}}

  Keep the tone light and supportive. Format the output as a simple bulleted list (e.g., using * or -).
  
  Example:
  *   Consider a short, mindful walk to clear your head.
  *   Take a few moments to listen to your favorite upbeat song.
  *   Jot down one thing you're grateful for today.`,
});

const moodImprovementFlow = ai.defineFlow(
  {
    name: 'moodImprovementFlow',
    inputSchema: MoodImprovementInputSchema,
    outputSchema: MoodImprovementOutputSchema,
  },
  async input => {
    // Filter out "No Entry" from moods to provide more focused tips
    const filteredMoods = input.moods.filter(mood => mood !== 'No Entry');
    if (filteredMoods.length === 0) {
      return { tips: "It looks like you haven't logged your mood much this week. Try to record it each day to get personalized tips!" };
    }
    
    const {output} = await prompt({ moods: filteredMoods });
    return output!;
  }
);


'use server';

/**
 * @fileOverview Provides an actionable to-do list to improve a user's mood based on recent patterns.
 *
 * @exported {
 *   getWellnessTodos: (input: WellnessTodoInput) => Promise<WellnessTodoOutput>;
 * }
 */

import { ai_ } from '@/ai/genkit';
import {z} from 'genkit';

const WellnessTodoInputSchema = z.object({
  moods: z.array(z.string()).describe('A list of the user\'s moods over the last 7 days. Can contain "No Entry".'),
});
export type WellnessTodoInput = z.infer<typeof WellnessTodoInputSchema>;

const WellnessTodoOutputSchema = z.object({
  todos: z.array(z.string()).describe('A short, actionable list of 2-3 to-do items to help improve the user\'s mood.'),
});
export type WellnessTodoOutput = z.infer<typeof WellnessTodoOutputSchema>;

export async function getWellnessTodos(
  input: WellnessTodoInput
): Promise<WellnessTodoOutput> {
  return wellnessTodoFlow(input);
}

const prompt = ai_.definePrompt({
  name: 'wellnessTodoPrompt',
  model: 'googleai/gemini-pro',
  input: {schema: WellnessTodoInputSchema},
  output: {schema: WellnessTodoOutputSchema},
  prompt: `You are a friendly and encouraging wellness coach. Based on the user's mood trend over the last week, provide 2-3 simple, actionable, and positive to-do items to help them improve their well-being. Frame them as tasks.

  Recent Moods: {{{moods}}}
  
  Example:
  {
    "todos": [
      "Go for a short, mindful walk to clear your head",
      "Listen to your favorite upbeat song",
      "Jot down one thing you're grateful for today"
    ]
  }`,
});

const wellnessTodoFlow = ai_.defineFlow(
  {
    name: 'wellnessTodoFlow',
    inputSchema: WellnessTodoInputSchema,
    outputSchema: WellnessTodoOutputSchema,
  },
  async input => {
    const filteredMoods = input.moods.filter(mood => mood !== 'No Entry');
    if (filteredMoods.length === 0) {
      return { todos: ["Log your mood each day to get personalized wellness tasks!"] };
    }
    
    const {output} = await prompt({ moods: filteredMoods });
    return output!;
  }
);

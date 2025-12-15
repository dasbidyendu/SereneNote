
'use server';
/**
 * @fileOverview A flow for generating an image from a text prompt.
 *
 * - generateImage - A function that takes a prompt and returns an image data URI.
 */

import { ai_ } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('A text prompt for the image generation model.'),
});

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a Base64 encoded data URI.'),
});

export async function generateImage(input: { prompt: string }): Promise<{ imageDataUri: string }> {
  return generateImageFlow(input);
}

const generateImageFlow = ai_.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai_.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a photorealistic, serene, and calming image based on the following description: ${input.prompt}. Style: soft light, peaceful, high resolution.`,
    });

    if (!media.url) {
      throw new Error('Image generation failed to return a data URI.');
    }
    
    return { imageDataUri: media.url };
  }
);

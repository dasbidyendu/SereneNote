'use server';

/**
 * @fileOverview Provides CBT suggestions and generates audio for a guided meditation in a single flow.
 *
 * @exported {
 *   cbtWithAudio: (input: CbtWithAudioInput) => Promise<CbtWithAudioOutput>;
 * }
 */

import { ai_ } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

const CbtWithAudioInputSchema = z.object({
  journalEntry: z.string().describe("The user's journal entry."),
  mood: z.string().describe("The user's current mood."),
});
export type CbtWithAudioInput = z.infer<typeof CbtWithAudioInputSchema>;

const CbtWithAudioOutputSchema = z.object({
  suggestions: z.string().describe('CBT based suggestions for stress alleviation.'),
  guidedMeditation: z.string().describe('A short guided meditation script.'),
  reflectiveExercise: z.string().describe('A short, text-based reflective exercise.'),
  meditationAudioUri: z.string().describe("The generated audio for the meditation as a data URI."),
});
export type CbtWithAudioOutput = z.infer<typeof CbtWithAudioOutputSchema>;

export async function cbtWithAudio(input: CbtWithAudioInput): Promise<CbtWithAudioOutput> {
  return cbtWithAudioFlow(input);
}

const cbtPrompt = ai_.definePrompt({
  name: 'cbtAnalysisPrompt',
  model: 'googleai/gemini-2.5-flash-lite',
  input: { schema: CbtWithAudioInputSchema },
  output: { schema: z.object({
    suggestions: CbtWithAudioOutputSchema.shape.suggestions,
    guidedMeditation: CbtWithAudioOutputSchema.shape.guidedMeditation,
    reflectiveExercise: CbtWithAudioOutputSchema.shape.reflectiveExercise,
  })},
  prompt: `You are a mental health expert providing Cognitive Behavioral Therapy (CBT) based suggestions for stress alleviation.

  Based on the user's journal entry and their mood, provide:
  1. Tailored, actionable suggestions.
  2. A short, calming, 2-3 paragraph guided meditation script.
  3. A short, simple, text-based reflective exercise.

  Journal Entry: {{{journalEntry}}}
  Mood: {{{mood}}}
  `,
});

const cbtWithAudioFlow = ai_.defineFlow(
  {
    name: 'cbtWithAudioFlow',
    inputSchema: CbtWithAudioInputSchema,
    outputSchema: CbtWithAudioOutputSchema,
  },
  async (input) => {
    // Step 1: Get the text analysis
    const { output: textOutput } = await cbtPrompt(input);
    if (!textOutput) {
        throw new Error('Failed to generate text analysis.');
    }

    // Step 2: Generate audio from the meditation script
    const { media } = await ai_.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: textOutput.guidedMeditation,
    });

    if (!media) {
      throw new Error('No audio was generated from the text.');
    }

    // Step 3: Convert raw PCM audio to WAV format
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    const audioDataUri = `data:audio/wav;base64,${wavBase64}`;

    // Step 4: Combine results and return
    return {
      ...textOutput,
      meditationAudioUri: audioDataUri,
    };
  }
);

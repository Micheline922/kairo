'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing the spiritual climate of a journal entry and providing a "Word of Light."
 *
 * - analyzeSpiritualJournal - Analyzes the spiritual climate of a journal entry and provides a "Word of Light."
 * - AnalyzeSpiritualJournalInput - The input type for the analyzeSpiritualJournal function.
 * - AnalyzeSpiritualJournalOutput - The return type for the analyzeSpiritualJournal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSpiritualJournalInputSchema = z.object({
  journalEntry: z
    .string()
    .describe('The text content of the spiritual journal entry.'),
});
export type AnalyzeSpiritualJournalInput = z.infer<typeof AnalyzeSpiritualJournalInputSchema>;

const AnalyzeSpiritualJournalOutputSchema = z.object({
  spiritualClimate: z.string().describe('A summary of the spiritual climate of the journal entry.'),
  wordOfLightVerses: z.string().describe('Specifically chosen Bible verses relevant to the journal entry.'),
  empatheticOrientation: z
    .string()
    .describe('A short, empathetic orientation based on the Bible, providing guidance and encouragement.'),
});
export type AnalyzeSpiritualJournalOutput = z.infer<typeof AnalyzeSpiritualJournalOutputSchema>;

export async function analyzeSpiritualJournal(
  input: AnalyzeSpiritualJournalInput
): Promise<AnalyzeSpiritualJournalOutput> {
  return analyzeSpiritualJournalFlow(input);
}

const analyzeSpiritualJournalPrompt = ai.definePrompt({
  name: 'analyzeSpiritualJournalPrompt',
  input: {schema: AnalyzeSpiritualJournalInputSchema},
  output: {schema: AnalyzeSpiritualJournalOutputSchema},
  prompt: `You are a spiritual guide, skilled in understanding the nuances of faith and struggle.

  Analyze the following journal entry and determine its spiritual climate. Provide a concise summary of the user's spiritual state as reflected in the text.  Based on your analysis, select relevant Bible verses that offer comfort, guidance, and encouragement.  Finally, offer a short, empathetic orientation based on biblical principles, providing personalized advice.

  Journal Entry: {{{journalEntry}}}

  Format your response as follows:
  Spiritual Climate: [Summary of the spiritual climate]
  Word of Light Verses: [Relevant Bible verses]
  Empathetic Orientation: [A short, empathetic orientation based on the Bible]`,
});

const analyzeSpiritualJournalFlow = ai.defineFlow(
  {
    name: 'analyzeSpiritualJournalFlow',
    inputSchema: AnalyzeSpiritualJournalInputSchema,
    outputSchema: AnalyzeSpiritualJournalOutputSchema,
  },
  async input => {
    const {output} = await analyzeSpiritualJournalPrompt(input);
    return output!;
  }
);

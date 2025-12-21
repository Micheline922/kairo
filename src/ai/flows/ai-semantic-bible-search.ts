'use server';
/**
 * @fileOverview Implements AI semantic search for the Bible.
 *
 * - aiSemanticBibleSearch - A function that performs the semantic search.
 * - AISemanticBibleSearchInput - The input type for the aiSemanticBibleSearch function.
 * - AISemanticBibleSearchOutput - The return type for the aiSemanticBibleSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISemanticBibleSearchInputSchema = z.object({
  query: z.string().describe('The natural language query expressing feelings or situation.'),
});
export type AISemanticBibleSearchInput = z.infer<typeof AISemanticBibleSearchInputSchema>;

const AISemanticBibleSearchOutputSchema = z.object({
  verses: z
    .array(
      z.object({
        book: z.string().describe('The book of the Bible.'),
        chapter: z.number().describe('The chapter number.'),
        verse: z.number().describe('The verse number.'),
        text: z.string().describe('The text of the verse.'),
      })
    )
    .describe('The relevant verses found based on the semantic search.'),
});
export type AISemanticBibleSearchOutput = z.infer<typeof AISemanticBibleSearchOutputSchema>;

export async function aiSemanticBibleSearch(input: AISemanticBibleSearchInput): Promise<AISemanticBibleSearchOutput> {
  return aiSemanticBibleSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSemanticBibleSearchPrompt',
  input: {schema: AISemanticBibleSearchInputSchema},
  output: {schema: AISemanticBibleSearchOutputSchema},
  prompt: `You are a knowledgeable assistant who helps users find relevant Bible verses based on their feelings or situation.

  Based on the user's query, search for Bible verses that address the underlying emotions, needs, or circumstances expressed in the query.
  Return a list of verses with the book, chapter, verse number, and text.

  User query: {{{query}}}
  `,
});

const aiSemanticBibleSearchFlow = ai.defineFlow(
  {
    name: 'aiSemanticBibleSearchFlow',
    inputSchema: AISemanticBibleSearchInputSchema,
    outputSchema: AISemanticBibleSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

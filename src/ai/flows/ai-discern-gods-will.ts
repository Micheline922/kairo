'use server';
/**
 * @fileOverview An AI flow that acts as a biblical mentor to help users discern God's will.
 *
 * - discernGodsWill - A function that handles the process of discerning God's will.
 * - DiscernGodsWillInput - The input type for the discernGodsWill function.
 * - DiscernGodsWillOutput - The return type for the discernGodsWill function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiscernGodsWillInputSchema = z.object({
  decisionContext: z
    .string()
    .describe("The user's description of the decision they are trying to make."),
});
export type DiscernGodsWillInput = z.infer<typeof DiscernGodsWillInputSchema>;

const DiscernGodsWillOutputSchema = z.object({
  guidance: z.string().describe('Biblically-sound guidance for the user.'),
});
export type DiscernGodsWillOutput = z.infer<typeof DiscernGodsWillOutputSchema>;

export async function discernGodsWill(input: DiscernGodsWillInput): Promise<DiscernGodsWillOutput> {
  return discernGodsWillFlow(input);
}

const prompt = ai.definePrompt({
  name: 'discernGodsWillPrompt',
  input: {schema: DiscernGodsWillInputSchema},
  output: {schema: DiscernGodsWillOutputSchema},
  prompt: `You are a biblical mentor, offering biblically-sound guidance to users seeking to discern God's will for a specific decision.
  Based on the user's description of their decision, provide guidance rooted in biblical principles and wisdom.

  Decision Context: {{{decisionContext}}}
  `,
});

const discernGodsWillFlow = ai.defineFlow(
  {
    name: 'discernGodsWillFlow',
    inputSchema: DiscernGodsWillInputSchema,
    outputSchema: DiscernGodsWillOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

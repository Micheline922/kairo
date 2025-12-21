'use server';
/**
 * @fileOverview Generates a customized reading plan for a user's fasting period based on their specific reason for fasting.
 *
 * - generateReadingPlan - A function that takes the user's reason for fasting and returns a customized reading plan.
 * - ReadingPlanInput - The input type for the generateReadingPlan function.
 * - ReadingPlanOutput - The return type for the generateReadingPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReadingPlanInputSchema = z.object({
  reasonForFasting: z
    .string()
    .describe("The user's specific reason or 'Why' for undertaking the fast."),
});
export type ReadingPlanInput = z.infer<typeof ReadingPlanInputSchema>;

const ReadingPlanOutputSchema = z.object({
  readingPlan: z
    .string()
    .describe('A customized reading plan tailored to the user provided reason for fasting.'),
});
export type ReadingPlanOutput = z.infer<typeof ReadingPlanOutputSchema>;

export async function generateReadingPlan(
  input: ReadingPlanInput
): Promise<ReadingPlanOutput> {
  return generateReadingPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'readingPlanPrompt',
  input: {schema: ReadingPlanInputSchema},
  output: {schema: ReadingPlanOutputSchema},
  prompt: `You are a spiritual guide who creates customized Bible reading plans for users who are fasting. Based on their reason for fasting, create a reading plan with specific verses that will encourage and focus them during their fast.\n\nReason for fasting: {{{reasonForFasting}}}`,
});

const generateReadingPlanFlow = ai.defineFlow(
  {
    name: 'generateReadingPlanFlow',
    inputSchema: ReadingPlanInputSchema,
    outputSchema: ReadingPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

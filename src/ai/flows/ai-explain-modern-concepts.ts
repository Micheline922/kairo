'use server';

/**
 * @fileOverview Explains modern concepts from a biblical perspective.
 *
 * - explainConcept - A function that explains a modern concept using biblical truth.
 * - ExplainConceptInput - The input type for the explainConcept function.
 * - ExplainConceptOutput - The return type for the explainConcept function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainConceptInputSchema = z.object({
  concept: z
    .string()
    .describe('The modern concept to be explained (e.g., Metaverse, Work-life balance, Anxiety).'),
});
export type ExplainConceptInput = z.infer<typeof ExplainConceptInputSchema>;

const ExplainConceptOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'An explanation of the concept, bridging the modern world and biblical truth, explaining what God expects from us in this specific context.'
    ),
});
export type ExplainConceptOutput = z.infer<typeof ExplainConceptOutputSchema>;

export async function explainConcept(input: ExplainConceptInput): Promise<ExplainConceptOutput> {
  return explainConceptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainConceptPrompt',
  input: {schema: ExplainConceptInputSchema},
  output: {schema: ExplainConceptOutputSchema},
  prompt: `You are a theologian skilled at explaining modern concepts from a biblical perspective.

  Explain the following concept by bridging the modern world and biblical truth, explaining what God expects from us in this specific context.

  Concept: {{{concept}}}`,
});

const explainConceptFlow = ai.defineFlow(
  {
    name: 'explainConceptFlow',
    inputSchema: ExplainConceptInputSchema,
    outputSchema: ExplainConceptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

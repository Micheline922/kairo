'use server';

/**
 * @fileOverview Explique les concepts modernes d'un point de vue biblique.
 *
 * - explainConcept - Une fonction qui explique un concept moderne en utilisant la vérité biblique.
 * - ExplainConceptInput - Le type d'entrée pour la fonction explainConcept.
 * - ExplainConceptOutput - Le type de retour pour la fonction explainConcept.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainConceptInputSchema = z.object({
  concept: z
    .string()
    .describe('Le concept moderne à expliquer (par ex., Métavers, équilibre travail-vie personnelle, anxiété).'),
});
export type ExplainConceptInput = z.infer<typeof ExplainConceptInputSchema>;

const ExplainConceptOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      "Une explication du concept, faisant le pont entre le monde moderne et la vérité biblique, expliquant ce que Dieu attend de nous dans ce contexte spécifique."
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
  prompt: `Vous êtes un théologien doué pour expliquer les concepts modernes d'un point de vue biblique.

  Expliquez le concept suivant en faisant le pont entre le monde moderne et la vérité biblique, en expliquant ce que Dieu attend de nous dans ce contexte spécifique.

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

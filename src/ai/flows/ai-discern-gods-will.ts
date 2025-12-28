'use server';
/**
 * @fileOverview Un flux d'IA qui agit comme un mentor biblique pour aider les utilisateurs à discerner la volonté de Dieu.
 *
 * - discernGodsWill - Une fonction qui gère le processus de discernement de la volonté de Dieu.
 * - DiscernGodsWillInput - Le type d'entrée pour la fonction discernGodsWill.
 * - DiscernGodsWillOutput - Le type de retour pour la fonction discernGodsWill.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiscernGodsWillInputSchema = z.object({
  decisionContext: z
    .string()
    .describe("La description par l'utilisateur de la décision qu'il essaie de prendre."),
});
export type DiscernGodsWillInput = z.infer<typeof DiscernGodsWillInputSchema>;

const DiscernGodsWillOutputSchema = z.object({
  guidance: z.string().describe('Des conseils bibliquement fondés pour l\'utilisateur.'),
});
export type DiscernGodsWillOutput = z.infer<typeof DiscernGodsWillOutputSchema>;

export async function discernGodsWill(input: DiscernGodsWillInput): Promise<DiscernGodsWillOutput> {
  return discernGodsWillFlow(input);
}

const prompt = ai.definePrompt({
  name: 'discernGodsWillPrompt',
  input: {schema: DiscernGodsWillInputSchema},
  output: {schema: DiscernGodsWillOutputSchema},
  prompt: `Vous êtes un mentor biblique, offrant des conseils bibliquement fondés aux utilisateurs cherchant à discerner la volonté de Dieu pour une décision spécifique.
  Sur la base de la description de leur décision par l'utilisateur, fournissez des conseils enracinés dans les principes et la sagesse bibliques. Ne saluez pas l'utilisateur (par exemple, pas de "Cher ami"). Allez directement au conseil.

  Contexte de la décision: {{{decisionContext}}}
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

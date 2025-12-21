'use server';
/**
 * @fileOverview Implémente la recherche sémantique par IA pour la Bible.
 *
 * - aiSemanticBibleSearch - Une fonction qui effectue la recherche sémantique.
 * - AISemanticBibleSearchInput - Le type d'entrée pour la fonction aiSemanticBibleSearch.
 * - AISemanticBibleSearchOutput - Le type de retour pour la fonction aiSemanticBibleSearch.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISemanticBibleSearchInputSchema = z.object({
  query: z.string().describe('La requête en langage naturel exprimant des sentiments ou une situation.'),
});
export type AISemanticBibleSearchInput = z.infer<typeof AISemanticBibleSearchInputSchema>;

const AISemanticBibleSearchOutputSchema = z.object({
  verses: z
    .array(
      z.object({
        book: z.string().describe('Le livre de la Bible.'),
        chapter: z.number().describe('Le numéro du chapitre.'),
        verse: z.number().describe('Le numéro du verset.'),
        text: z.string().describe('Le texte du verset.'),
      })
    )
    .describe('Les versets pertinents trouvés sur la base de la recherche sémantique.'),
});
export type AISemanticBibleSearchOutput = z.infer<typeof AISemanticBibleSearchOutputSchema>;

export async function aiSemanticBibleSearch(input: AISemanticBibleSearchInput): Promise<AISemanticBibleSearchOutput> {
  return aiSemanticBibleSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSemanticBibleSearchPrompt',
  input: {schema: AISemanticBibleSearchInputSchema},
  output: {schema: AISemanticBibleSearchOutputSchema},
  prompt: `Vous êtes un assistant compétent qui aide les utilisateurs à trouver des versets bibliques pertinents en fonction de leurs sentiments ou de leur situation.

  Sur la base de la requête de l'utilisateur, recherchez des versets bibliques qui traitent des émotions, des besoins ou des circonstances sous-jacents exprimés dans la requête.
  Retournez une liste de versets avec le livre, le chapitre, le numéro de verset et le texte.

  Requête de l'utilisateur: {{{query}}}
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

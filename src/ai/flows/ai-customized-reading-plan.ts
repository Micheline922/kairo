'use server';
/**
 * @fileOverview Génère un plan de lecture personnalisé et un guide de prière pour la période de jeûne d'un utilisateur en fonction de sa raison spécifique de jeûner.
 *
 * - generateReadingPlan - Une fonction qui prend la raison de jeûne de l'utilisateur et retourne un plan de lecture personnalisé et un guide de prière.
 * - ReadingPlanInput - Le type d'entrée pour la fonction generateReadingPlan.
 * - ReadingPlanOutput - Le type de retour pour la fonction generateReadingPlan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReadingPlanInputSchema = z.object({
  reasonForFasting: z
    .string()
    .describe("La raison spécifique ou le 'Pourquoi' de l'utilisateur pour entreprendre le jeûne."),
});
export type ReadingPlanInput = z.infer<typeof ReadingPlanInputSchema>;

const ReadingPlanOutputSchema = z.object({
  readingPlan: z
    .string()
    .describe('Un plan de lecture personnalisé et un guide de prière adaptés à la raison de jeûne fournie par l\'utilisateur, avec chaque jour sur une nouvelle ligne.'),
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
  prompt: `Vous êtes un guide spirituel qui crée des plans de lecture de la Bible personnalisés et des guides de prière pour les utilisateurs qui jeûnent.
  
  En fonction de leur raison de jeûner, créez un plan de lecture avec des versets spécifiques et un guide sur la façon de prier pendant le jeûne.
  Le plan doit encourager et concentrer l'utilisateur pendant son jeûne.
  
  Structurez la réponse de manière claire, en commençant par le guide de prière, puis le plan de lecture jour par jour. Assurez-vous que chaque jour du plan de lecture commence sur une nouvelle ligne (par exemple, "Jour 1: ...").

  Raison du jeûne: {{{reasonForFasting}}}`,
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

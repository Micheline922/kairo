'use server';
/**
 * @fileOverview Génère un plan de lecture personnalisé pour la période de jeûne d'un utilisateur en fonction de sa raison spécifique de jeûner.
 *
 * - generateReadingPlan - Une fonction qui prend la raison de jeûne de l'utilisateur et retourne un plan de lecture personnalisé.
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
    .describe('Un plan de lecture personnalisé adapté à la raison de jeûne fournie par l\'utilisateur.'),
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
  prompt: `Vous êtes un guide spirituel qui crée des plans de lecture de la Bible personnalisés pour les utilisateurs qui jeûnent. En fonction de leur raison de jeûner, créez un plan de lecture avec des versets spécifiques qui les encourageront et les concentreront pendant leur jeûne.\n\nRaison du jeûne: {{{reasonForFasting}}}`,
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

'use server';
/**
 * @fileOverview Ce fichier définit un flux Genkit pour analyser le climat spirituel d'une entrée de journal et fournir une "Parole de Lumière".
 *
 * - analyzeSpiritualJournal - Analyse le climat spirituel d'une entrée de journal et fournit une "Parole de Lumière".
 * - AnalyzeSpiritualJournalInput - Le type d'entrée pour la fonction analyzeSpiritualJournal.
 * - AnalyzeSpiritualJournalOutput - Le type de retour pour la fonction analyzeSpiritualJournal.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSpiritualJournalInputSchema = z.object({
  journalEntry: z
    .string()
    .describe("Le contenu textuel de l'entrée du journal spirituel."),
});
export type AnalyzeSpiritualJournalInput = z.infer<typeof AnalyzeSpiritualJournalInputSchema>;

const AnalyzeSpiritualJournalOutputSchema = z.object({
  spiritualClimate: z.string().describe("Un résumé du climat spirituel de l'entrée du journal."),
  wordOfLightVerses: z.string().describe("Des versets bibliques spécifiquement choisis et pertinents pour l'entrée du journal."),
  empatheticOrientation: z
    .string()
    .describe("Une courte orientation empathique basée sur la Bible, offrant des conseils et des encouragements."),
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
  prompt: `Vous êtes un guide spirituel, doué pour comprendre les nuances de la foi et de la lutte.

  Analysez l'entrée de journal suivante et déterminez son climat spirituel. Fournissez un résumé concis de l'état spirituel de l'utilisateur tel que reflété dans le texte. Sur la base de votre analyse, sélectionnez des versets bibliques pertinents qui offrent réconfort, conseils et encouragements. Enfin, offrez une courte orientation empathique basée sur les principes bibliques, en fournissant des conseils personnalisés.

  Entrée de journal: {{{journalEntry}}}

  Formatez votre réponse comme suit:
  Climat Spirituel: [Résumé du climat spirituel]
  Versets de la Parole de Lumière: [Versets bibliques pertinents]
  Orientation Empathique: [Une courte orientation empathique basée sur la Bible]`,
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

'use server';
/**
 * @fileOverview Un flux d'IA qui améliore un article rédigé par un utilisateur.
 *
 * - enhanceArticle - Une fonction qui prend le brouillon d'un utilisateur et le retourne amélioré.
 * - EnhanceArticleInput - Le type d'entrée pour la fonction enhanceArticle.
 * - EnhanceArticleOutput - Le type de retour pour la fonction enhanceArticle.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceArticleInputSchema = z.object({
  articleDraft: z
    .string()
    .describe("Le brouillon de l'article de l'utilisateur."),
  title: z
    .string()
    .describe("Le titre de l'article de l'utilisateur."),
});
export type EnhanceArticleInput = z.infer<typeof EnhanceArticleInputSchema>;

const EnhanceArticleOutputSchema = z.object({
  enhancedArticle: z.string().describe("L'article amélioré par l'IA, en développant les idées originales et en intégrant des versets."),
  supportingVerses: z.string().describe("Une liste de versets bibliques qui soutiennent les idées de l'article."),
});
export type EnhanceArticleOutput = z.infer<typeof EnhanceArticleOutputSchema>;

export async function enhanceArticle(input: EnhanceArticleInput): Promise<EnhanceArticleOutput> {
  return enhanceArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceArticlePrompt',
  input: {schema: EnhanceArticleInputSchema},
  output: {schema: EnhanceArticleOutputSchema},
  prompt: `Vous êtes un éditeur théologique et un mentor pour les écrivains chrétiens. Votre but est d'aider un utilisateur à développer sa pensée en un article plus riche et plus profond.

  Prenez le brouillon de l'article suivant, intitulé "{{title}}".
  
  Votre tâche est de :
  1.  **Conserver la Voix de l'Auteur :** Gardez le ton et le style de l'auteur original.
  2.  **Développer les Idées :** Approfondissez les concepts présentés. Ajoutez des réflexions, des questions et des perspectives complémentaires pour enrichir le contenu.
  3.  **Intégrer des Versets :** Tissez des versets bibliques pertinents directement dans le corps du texte pour soutenir les arguments, pas seulement en les listant à la fin.
  4.  **Structurer l'Article :** Assurez-vous que l'article final a une introduction, un développement logique et une conclusion claire.
  5.  **Lister les Versets :** En plus de les intégrer, fournissez une liste séparée de tous les versets utilisés pour référence.

  Brouillon de l'article : 
  {{{articleDraft}}}
  `,
});

const enhanceArticleFlow = ai.defineFlow(
  {
    name: 'enhanceArticleFlow',
    inputSchema: EnhanceArticleInputSchema,
    outputSchema: EnhanceArticleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';
/**
 * @fileOverview Génère une méditation audio guidée sur un thème donné.
 *
 * - generateMeditationAudio - Une fonction qui prend un thème et retourne un texte de méditation et une URL de données audio.
 * - GenerateMeditationAudioInput - Le type d'entrée pour la fonction generateMeditationAudio.
 * - GenerateMeditationAudioOutput - Le type de retour pour la fonction generateMeditationAudio.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const GenerateMeditationAudioInputSchema = z.object({
  topic: z
    .string()
    .describe('Le sujet ou le thème de la méditation guidée (par ex., la paix, le pardon, la gratitude).'),
});
export type GenerateMeditationAudioInput = z.infer<typeof GenerateMeditationAudioInputSchema>;

const GenerateMeditationAudioOutputSchema = z.object({
  meditationText: z.string().describe("Le script de la méditation guidée."),
  audioDataUri: z.string().describe("L'audio de la méditation sous forme d'URI de données (format WAV)."),
});
export type GenerateMeditationAudioOutput = z.infer<typeof GenerateMeditationAudioOutputSchema>;

export async function generateMeditationAudio(
  input: GenerateMeditationAudioInput
): Promise<GenerateMeditationAudioOutput> {
  return generateMeditationAudioFlow(input);
}

const meditationPrompt = ai.definePrompt({
    name: 'meditationTextPrompt',
    input: { schema: GenerateMeditationAudioInputSchema },
    output: { schema: z.object({ meditationText: z.string() }) },
    prompt: `Vous êtes un guide de méditation chrétien. Votre voix est calme, apaisante et remplie de chaleur.
    
    Créez un court script de méditation guidée (environ 150-200 mots) sur le thème de "{{topic}}".
    
    Le script doit :
    1. Commencer par une invitation à trouver une posture confortable et à se concentrer sur sa respiration.
    2. Introduire en douceur le thème de "{{topic}}" d'un point de vue biblique, en utilisant des images et des concepts réconfortants.
    3. Inclure une ou deux courtes citations ou paraphrases de versets bibliques pertinents.
    4. Conclure par une courte prière ou une affirmation positive liée au thème.
    5. Être écrit dans un langage simple, direct et encourageant.
    
    Exemple pour le thème "Paix" :
    "Trouvez une position confortable... Inspirez profondément... et expirez lentement... Laissez la paix de Dieu, qui surpasse toute intelligence, garder votre cœur et vos pensées... Comme un berger veille sur ses brebis, le Seigneur veille sur vous... Il vous mène près des eaux paisibles pour restaurer votre âme... Sentez sa présence vous envelopper... Amen."
    
    Thème : {{{topic}}}`,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    
    writer.write(pcmData);
    writer.end();
  });
}

const generateMeditationAudioFlow = ai.defineFlow(
  {
    name: 'generateMeditationAudioFlow',
    inputSchema: GenerateMeditationAudioInputSchema,
    outputSchema: GenerateMeditationAudioOutputSchema,
  },
  async (input) => {
    // 1. Generate the meditation text
    const { output: textOutput } = await meditationPrompt(input);
    const meditationText = textOutput!.meditationText;

    // 2. Generate the audio from the text
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: meditationText,
    });
    if (!media) {
      throw new Error("La génération audio a échoué.");
    }

    // 3. Convert PCM audio to WAV format
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);

    return {
      meditationText,
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

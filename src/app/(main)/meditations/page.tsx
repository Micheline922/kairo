'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoaderCircle, Sparkles, Wand2, HeartPulse, Music4, Pause, Play } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { generateMeditationAudio, GenerateMeditationAudioOutput } from '@/ai/flows/ai-generate-meditation-audio';

const meditationSchema = z.object({
  topic: z.string().min(3, { message: 'Le thème doit contenir au moins 3 caractères.' }),
});

export default function MeditationsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [meditation, setMeditation] = useState<GenerateMeditationAudioOutput | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const form = useForm<z.infer<typeof meditationSchema>>({
    resolver: zodResolver(meditationSchema),
    defaultValues: { topic: '' },
  });

  async function onSubmit(values: z.infer<typeof meditationSchema>) {
    setIsGenerating(true);
    setMeditation(null);
    setIsPlaying(false);
    try {
      const result = await generateMeditationAudio({ topic: values.topic });
      setMeditation(result);
    } catch (error) {
      console.error('Échec de la génération de la méditation:', error);
      // TODO: Handle error with a toast
    } finally {
      setIsGenerating(false);
    }
  }
  
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  React.useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const onEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', onEnded);
      return () => audio.removeEventListener('ended', onEnded);
    }
  }, [meditation]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Méditations Audio</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Trouvez le calme et la concentration avec des méditations guidées par la Parole.
        </p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Générer une Méditation</CardTitle>
          <CardDescription>
            Entrez un thème (ex: "Paix", "Pardon", "Force") et laissez l'IA créer une méditation audio pour vous.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="ex: Gratitude" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isGenerating} className="w-40">
                {isGenerating ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Générer
              </Button>
            </form>
          </Form>

          {isGenerating && (
            <div className="text-center py-16">
              <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Création de votre moment de paix...</p>
            </div>
          )}

          {meditation && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold font-headline flex items-center gap-2 capitalize">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Votre Méditation sur "{form.getValues('topic')}"
              </h3>
              <div className="p-6 border rounded-lg bg-secondary mt-4 space-y-6">
                <div className="flex items-center gap-4">
                    <Button onClick={togglePlayPause} size="icon" className="h-14 w-14 rounded-full">
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    <div className="flex-1">
                        <p className="font-semibold">Écoutez la méditation</p>
                        <p className="text-sm text-muted-foreground">Cliquez pour jouer ou mettre en pause.</p>
                    </div>
                </div>
                
                {meditation.audioDataUri && (
                  <audio ref={audioRef} src={meditation.audioDataUri}></audio>
                )}

                <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-semibold text-lg flex items-center gap-2"><Music4 className="h-5 w-5"/> Script de Méditation</h4>
                    <p className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">{meditation.meditationText}</p>
                </div>
              </div>
            </div>
          )}

          {!isGenerating && !meditation && (
            <div className="text-center py-16 border-2 border-dashed rounded-lg mt-8">
              <HeartPulse className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Prêt pour un moment de calme ?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                  Entrez un thème ci-dessus pour commencer.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

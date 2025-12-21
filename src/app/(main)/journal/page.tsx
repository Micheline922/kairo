'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, BookHeart, Lightbulb, PlusCircle, LoaderCircle } from 'lucide-react';
import { analyzeSpiritualJournal, AnalyzeSpiritualJournalOutput } from '@/ai/flows/ai-analyze-spiritual-journal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const journalSchema = z.object({
  entry: z.string().min(10, { message: 'L\'entrée de journal doit contenir au moins 10 caractères.' }),
});

type JournalEntry = {
  id: number;
  date: string;
  excerpt: string;
  content: string;
  analysis?: AnalyzeSpiritualJournalOutput;
};

const mockEntries: JournalEntry[] = [
  {
    id: 1,
    date: 'Il y a 2 jours',
    excerpt: 'J\'ai ressenti un profond sentiment de paix pendant ma prière matinale...',
    content: 'J\'ai ressenti un profond sentiment de paix pendant ma prière matinale. Le monde semblait ralentir, et je pouvais entendre le murmure de Dieu dans la brise légère. J\'ai lu le Psaume 23, et il a résonné dans mon âme.',
  },
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(mockEntries);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(entries[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof journalSchema>>({
    resolver: zodResolver(journalSchema),
    defaultValues: { entry: '' },
  });

  const handleAnalyze = async (entry: JournalEntry) => {
    if (!entry) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeSpiritualJournal({ journalEntry: entry.content });
      const updatedEntries = entries.map(e => e.id === entry.id ? { ...e, analysis } : e);
      setEntries(updatedEntries);
      setSelectedEntry(updatedEntries.find(e => e.id === entry.id) || null);
    } catch (error) {
      console.error("L'analyse a échoué:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  async function onSubmit(values: z.infer<typeof journalSchema>) {
    setIsCreating(true);
    const newEntry: JournalEntry = {
      id: entries.length + 1,
      date: 'À l\'instant',
      excerpt: values.entry.substring(0, 50) + '...',
      content: values.entry,
    };
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 500));
    setEntries([newEntry, ...entries]);
    setSelectedEntry(newEntry);
    setIsCreating(false);
    setIsDialogOpen(false);
    form.reset();
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Journal Spirituel</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Enregistrez votre évolution spirituelle et vos réflexions quotidiennes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold font-headline">Entrées</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                 <Button variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2"/>
                  Nouvelle entrée
                </Button>
              </DialogTrigger>
              <DialogContent>
                 <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <DialogHeader>
                      <DialogTitle>Nouvelle entrée de journal</DialogTitle>
                      <DialogDescription>
                        Épanchez votre cœur. Qu'avez-vous sur le cœur aujourd'hui ?
                      </DialogDescription>
                    </DialogHeader>
                    <FormField
                      control={form.control}
                      name="entry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Votre réflexion</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Aujourd'hui, j'ai senti la présence de Dieu quand..."
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">Annuler</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {entries.map(entry => (
              <Card
                key={entry.id}
                className={`cursor-pointer transition-all ${selectedEntry?.id === entry.id ? 'border-primary bg-primary/5' : 'hover:bg-secondary'}`}
                onClick={() => setSelectedEntry(entry)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{entry.date}</CardTitle>
                  <CardDescription>{entry.excerpt}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedEntry ? (
            <Card className="min-h-[60vh]">
              <CardHeader>
                <CardTitle className="text-2xl">Réflexion d'{selectedEntry.date}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-base leading-relaxed">{selectedEntry.content}</p>

                <div className="mt-8">
                  {selectedEntry.analysis ? (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold font-headline flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-primary" />
                        Parole de Lumière
                      </h3>
                      <div className="p-4 rounded-md bg-secondary">
                        <h4 className="font-bold flex items-center gap-2"><Lightbulb className="h-4 w-4 text-accent-foreground"/>Climat Spirituel</h4>
                        <p className="text-muted-foreground">{selectedEntry.analysis.spiritualClimate}</p>
                      </div>
                      <div className="p-4 rounded-md bg-secondary">
                        <h4 className="font-bold flex items-center gap-2"><BookHeart className="h-4 w-4 text-accent-foreground"/>Versets de la Parole de Lumière</h4>
                        <p className="text-muted-foreground italic">{selectedEntry.analysis.wordOfLightVerses}</p>
                      </div>
                       <div className="p-4 rounded-md bg-secondary">
                        <h4 className="font-bold flex items-center gap-2"><Wand2 className="h-4 w-4 text-accent-foreground"/>Orientation Empathique</h4>
                        <p className="text-muted-foreground">{selectedEntry.analysis.empatheticOrientation}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 border-2 border-dashed rounded-lg">
                      <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">Recevoir un conseil de l'IA</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Laissez l'IA analyser le climat spirituel de votre entrée.
                      </p>
                      <Button className="mt-4" onClick={() => handleAnalyze(selectedEntry)} disabled={isAnalyzing}>
                         {isAnalyzing ? (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                          )}
                        Analyser le journal
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
             <div className="flex items-center justify-center min-h-[60vh] border-2 border-dashed rounded-lg">
                <div className="text-center">
                    <p className="text-muted-foreground">Sélectionnez une entrée ou créez-en une nouvelle.</p>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

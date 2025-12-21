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
import { Input } from '@/components/ui/input';
import { Wand2, BookHeart, Lightbulb, PlusCircle, LoaderCircle, Shield, Lock } from 'lucide-react';
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
import { useFirestore, useUser, useCollection, useMemoFirebase, addDocumentNonBlocking, useAuth } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const journalSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères." }),
  entry: z.string().min(10, { message: "L'entrée de journal doit contenir au moins 10 caractères." }),
});

type JournalEntry = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  creationDate: any;
  analysis?: AnalyzeSpiritualJournalOutput;
};

export default function JournalPage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIncognitoLocked, setIsIncognitoLocked] = useState(true);
  const [password, setPassword] = useState('');
  
  const journalEntriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/journalEntries`), orderBy('creationDate', 'desc'));
  }, [firestore, user]);

  const { data: entries, isLoading: isLoadingEntries } = useCollection<JournalEntry>(journalEntriesQuery);

  const form = useForm<z.infer<typeof journalSchema>>({
    resolver: zodResolver(journalSchema),
    defaultValues: { title: '', entry: '' },
  });

  const handleAnalyze = async (entry: JournalEntry) => {
    if (!entry) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeSpiritualJournal({ journalEntry: entry.content });
      if (selectedEntry && selectedEntry.id === entry.id) {
        setSelectedEntry({ ...selectedEntry, analysis });
      }
    } catch (error) {
      console.error("L'analyse a échoué:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  async function onSubmit(values: z.infer<typeof journalSchema>) {
    if (!user) return;
    setIsCreating(true);

    const newEntryData = {
      userId: user.uid,
      title: values.title,
      content: values.entry,
      creationDate: serverTimestamp(),
      lastModified: serverTimestamp(),
    };
    
    const entriesCollection = collection(firestore, `users/${user.uid}/journalEntries`);
    addDocumentNonBlocking(entriesCollection, newEntryData);
    
    setIsCreating(false);
    setIsDialogOpen(false);
    form.reset();
  }

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) {
      toast({ variant: 'destructive', title: 'Utilisateur non trouvé.' });
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    try {
      await reauthenticateWithCredential(user, credential);
      setIsIncognitoLocked(false);
      setPassword('');
      toast({ title: 'Journal déverrouillé.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Mot de passe incorrect.' });
      setPassword('');
    }
  };

  const displayedEntries = entries?.map(e => ({
    ...e,
    excerpt: e.content.substring(0, 50) + '...',
    date: e.creationDate?.toDate().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) || 'Date inconnue'
  })) || [];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-4xl font-bold font-headline">Journal Spirituel</h1>
            <p className="text-lg text-muted-foreground mt-2">
            Enregistrez votre évolution spirituelle et vos réflexions quotidiennes.
            </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsIncognitoLocked(true)} title="Verrouiller le journal">
            <Shield className="h-6 w-6 text-primary" />
        </Button>
      </div>
      
      {isIncognitoLocked ? (
        <Card className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 border-2 border-dashed">
            <Lock className="h-16 w-16 text-muted-foreground" />
            <CardTitle className="mt-6 text-2xl">Mode Confidentiel Activé</CardTitle>
            <CardDescription className="mt-2 max-w-sm">
                Pour protéger votre vie privée, vos entrées sont masquées. Veuillez entrer votre mot de passe pour les afficher.
            </CardDescription>
            <form onSubmit={handleUnlockSubmit} className="mt-6 flex max-w-xs w-full items-center space-x-2">
                <Input
                    type="password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit">Déverrouiller</Button>
            </form>
        </Card>
      ) : (
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <DialogHeader>
                        <DialogTitle>Nouvelle entrée de journal</DialogTitle>
                        <DialogDescription>
                            Épanchez votre cœur. Qu'avez-vous sur le cœur aujourd'hui ?
                        </DialogDescription>
                        </DialogHeader>
                        <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Titre</FormLabel>
                            <FormControl>
                                <Input placeholder="Réflexion sur la gratitude" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
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
                {isLoadingEntries ? (
                <p>Chargement des entrées...</p>
                ) : displayedEntries.length > 0 ? (
                displayedEntries.map(entry => (
                    <Card
                    key={entry.id}
                    className={`cursor-pointer transition-all ${selectedEntry?.id === entry.id ? 'border-primary bg-primary/5' : 'hover:bg-secondary'}`}
                    onClick={() => setSelectedEntry(entry)}
                    >
                    <CardHeader>
                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                        <CardDescription>{entry.excerpt}</CardDescription>
                        <CardDescription className="text-xs pt-1">{entry.date}</CardDescription>
                    </CardHeader>
                    </Card>
                ))
                ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune entrée pour le moment.</p>
                )}
            </div>
            </div>

            <div className="md:col-span-2">
            {selectedEntry ? (
                <Card className="min-h-[60vh]">
                <CardHeader>
                    <CardTitle className="text-2xl">{selectedEntry.title}</CardTitle>
                    <CardDescription>Réflexion du {selectedEntry.date}</CardDescription>
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
      )}
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Wand2, BookHeart, Lightbulb, PlusCircle, LoaderCircle, Shield, Lock, ArrowLeft } from 'lucide-react';
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
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useLanguage } from '@/context/language-provider';
import { translations } from '@/lib/translations';

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
  const router = useRouter();
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
  const { language } = useLanguage();
  const t = translations[language];
  
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
      toast({ variant: 'destructive', title: t.unlockFailed });
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    try {
      await reauthenticateWithCredential(user, credential);
      setIsIncognitoLocked(false);
      setPassword('');
      toast({ title: t.journalUnlocked });
    } catch (error) {
      toast({ variant: 'destructive', title: t.incorrectPassword });
      setPassword('');
    }
  };

  const displayedEntries = entries?.map(e => ({
    ...e,
    excerpt: e.content.substring(0, 50) + '...',
    date: e.creationDate?.toDate().toLocaleDateString(language, { day: 'numeric', month: 'long', year: 'numeric' }) || 'Date inconnue'
  })) || [];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
        <div>
            <h1 className="text-4xl font-bold font-headline">{t.journalTitle}</h1>
            <p className="text-lg text-muted-foreground mt-2">
            {t.journalDescription}
            </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsIncognitoLocked(true)} title={t.lockJournal}>
              <Shield className="h-6 w-6 text-primary" />
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.backToDashboard}
          </Button>
        </div>
      </div>
      
      {isIncognitoLocked ? (
        <Card className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 border-2 border-dashed">
            <Lock className="h-16 w-16 text-muted-foreground" />
            <CardTitle className="mt-6 text-2xl">{t.confidentialMode}</CardTitle>
            <CardDescription className="mt-2 max-w-sm">
                {t.confidentialPrompt}
            </CardDescription>
            <form onSubmit={handleUnlockSubmit} className="mt-6 flex max-w-xs w-full items-center space-x-2">
                <Input
                    type="password"
                    placeholder={t.yourPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit">{t.unlock}</Button>
            </form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold font-headline">{t.entries}</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                    <PlusCircle className="h-4 w-4 mr-2"/>
                    {t.newEntry}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <DialogHeader>
                        <DialogTitle>{t.newEntryTitle}</DialogTitle>
                        <DialogDescription>
                            {t.newEntryDescription}
                        </DialogDescription>
                        </DialogHeader>
                        <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t.entryTitle}</FormLabel>
                            <FormControl>
                                <Input placeholder={t.entryTitlePlaceholder} {...field} />
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
                            <FormLabel>{t.yourReflection}</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder={t.reflectionPlaceholder}
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
                            <Button type="button" variant="secondary">{t.cancel}</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isCreating}>
                            {isCreating && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {t.save}
                        </Button>
                        </DialogFooter>
                    </form>
                    </Form>
                </DialogContent>
                </Dialog>
            </div>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {isLoadingEntries ? (
                <p>{t.loading}...</p>
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
                <p className="text-sm text-muted-foreground text-center py-4">{t.noEntries}</p>
                )}
            </div>
            </div>

            <div className="md:col-span-2">
            {selectedEntry ? (
                <Card className="min-h-[70vh]">
                <CardHeader>
                    <CardTitle className="text-2xl">{selectedEntry.title}</CardTitle>
                    <CardDescription>{t.reflectionDate.replace('{date}', selectedEntry.date)}</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[60vh] overflow-y-auto">
                    <p className="whitespace-pre-wrap text-base leading-relaxed">{selectedEntry.content}</p>

                    <div className="mt-8">
                    {selectedEntry.analysis ? (
                        <div className="space-y-6">
                        <h3 className="text-xl font-semibold font-headline flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-primary" />
                            {t.wordOfLight}
                        </h3>
                        <div className="p-4 rounded-md bg-secondary">
                            <h4 className="font-bold flex items-center gap-2"><Lightbulb className="h-4 w-4 text-accent-foreground"/>{t.spiritualClimate}</h4>
                            <p className="text-muted-foreground">{selectedEntry.analysis.spiritualClimate}</p>
                        </div>
                        <div className="p-4 rounded-md bg-secondary">
                            <h4 className="font-bold flex items-center gap-2"><BookHeart className="h-4 w-4 text-accent-foreground"/>{t.wordOfLight}</h4>
                            <p className="text-muted-foreground italic">{selectedEntry.analysis.wordOfLightVerses}</p>
                        </div>
                        <div className="p-4 rounded-md bg-secondary">
                            <h4 className="font-bold flex items-center gap-2"><Wand2 className="h-4 w-4 text-accent-foreground"/>{t.empatheticGuidance}</h4>
                            <p className="text-muted-foreground">{selectedEntry.analysis.empatheticOrientation}</p>
                        </div>
                        </div>
                    ) : (
                        <div className="text-center p-8 border-2 border-dashed rounded-lg">
                        <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">{t.aiInsight}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t.aiAnalyzePrompt}
                        </p>
                        <Button className="mt-4" onClick={() => handleAnalyze(selectedEntry)} disabled={isAnalyzing}>
                            {isAnalyzing ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Wand2 className="mr-2 h-4 w-4" />
                            )}
                            {t.analyzeJournal}
                        </Button>
                        </div>
                    )}
                    </div>
                </CardContent>
                </Card>
            ) : (
                <div className="flex items-center justify-center min-h-[70vh] border-2 border-dashed rounded-lg">
                    <div className="text-center p-4">
                        <p className="text-muted-foreground">{t.selectEntry}</p>
                    </div>
                </div>
            )}
            </div>
        </div>
      )}
    </div>
  );
}

    
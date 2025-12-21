'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Search, LoaderCircle, BookOpen, BookMarked, Save } from 'lucide-react';
import {
  aiSemanticBibleSearch,
  AISemanticBibleSearchOutput,
} from '@/ai/flows/ai-semantic-bible-search';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

const semanticSearchSchema = z.object({
  query: z.string().min(3, { message: 'La requête de recherche doit contenir au moins 3 caractères.' }),
});

const verseSearchSchema = z.object({
    book: z.string().min(3, 'Livre requis'),
    chapter: z.string().min(1, 'Chapitre requis'),
    verse: z.string().min(1, 'Verset requis'),
});

const savePearlSchema = z.object({
  notes: z.string().optional(),
});

type PearlOfWisdom = {
    id: string;
    verseReference: string;
    verseText: string;
    notes: string;
    savedDate: any;
};

export default function BiblePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AISemanticBibleSearchOutput['verses'] | null>(null);
  const [selection, setSelection] = useState<Range | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const pearlsOfWisdomQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/pearlsOfWisdom`), orderBy('savedDate', 'desc'));
  }, [firestore, user]);

  const { data: pearls, isLoading: isLoadingPearls } = useCollection<PearlOfWisdom>(pearlsOfWisdomQuery);

  const semanticForm = useForm<z.infer<typeof semanticSearchSchema>>({
    resolver: zodResolver(semanticSearchSchema),
    defaultValues: { query: '' },
  });

  const verseForm = useForm<z.infer<typeof verseSearchSchema>>({
    resolver: zodResolver(verseSearchSchema),
    defaultValues: { book: 'Genèse', chapter: '1', verse: '1' },
  });

  const pearlForm = useForm<z.infer<typeof savePearlSchema>>({
    resolver: zodResolver(savePearlSchema),
    defaultValues: { notes: '' },
  });

  async function onSemanticSubmit(values: z.infer<typeof semanticSearchSchema>) {
    setIsSearching(true);
    setSearchResults(null);
    try {
      const results = await aiSemanticBibleSearch({ query: values.query });
      setSearchResults(results.verses);
    } catch (error) {
      console.error('La recherche sémantique a échoué:', error);
    } finally {
      setIsSearching(false);
    }
  }

  function onVerseSubmit(values: z.infer<typeof verseSearchSchema>) {
    console.log('Recherche de verset spécifique:', values);
    // Logique de recherche de verset à implémenter
  }

  const handleMouseUp = () => {
    const currentSelection = window.getSelection();
    if (currentSelection && currentSelection.rangeCount > 0) {
      const range = currentSelection.getRangeAt(0);
      if (!range.collapsed) {
        setSelection(range);
        setPopoverOpen(true);
      } else {
        setPopoverOpen(false);
      }
    }
  };

  const handleSavePearl = async (values: z.infer<typeof savePearlSchema>) => {
    if (!selection || !user) return;
    setIsSaving(true);
    const verseText = selection.toString();
    const verseElement = selection.startContainer.parentElement;
    const verseNumber = verseElement?.querySelector('span.verse-number')?.textContent;
    const book = "Genèse"; // Mock
    const chapter = "1"; // Mock
    const verseReference = `${book} ${chapter}:${verseNumber}`;

    const newPearl = {
        userId: user.uid,
        verseReference: verseReference,
        verseText: verseText,
        notes: values.notes || '',
        savedDate: serverTimestamp(),
    };
    
    addDocumentNonBlocking(collection(firestore, `users/${user.uid}/pearlsOfWisdom`), newPearl);

    setIsSaving(false);
    setPopoverOpen(false);
    pearlForm.reset();
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline">La Bible</h1>
        <p className="text-lg text-muted-foreground mt-2 italic">
          "Ta parole est une lampe à mes pieds, Et une lumière sur mon sentier." - Psaume 119:105
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold font-headline mb-4 flex items-center gap-3"><BookOpen /> Parcourir les Écritures</h2>
            
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Rechercher un Verset</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...verseForm}>
                        <form onSubmit={verseForm.handleSubmit(onVerseSubmit)} className="grid sm:grid-cols-4 gap-4 items-end">
                            <FormField control={verseForm.control} name="book" render={({ field }) => ( <FormItem><FormLabel>Livre</FormLabel><FormControl><Input placeholder="ex: Genèse" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={verseForm.control} name="chapter" render={({ field }) => ( <FormItem><FormLabel>Chapitre</FormLabel><FormControl><Input placeholder="ex: 1" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={verseForm.control} name="verse" render={({ field }) => ( <FormItem><FormLabel>Verset</FormLabel><FormControl><Input placeholder="ex: 1" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <Button type="submit" className="w-full">Trouver</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Genèse, Chapitre 1</CardTitle>
                <CardDescription>Sélectionnez du texte pour le surligner ou l'enregistrer comme "Perle de Sagesse".</CardDescription>
              </CardHeader>
              <CardContent onMouseUp={handleMouseUp} className="space-y-4 text-base leading-relaxed max-h-[60vh] overflow-y-auto">
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div style={{ display: 'none' }} />
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                     <Form {...pearlForm}>
                      <form onSubmit={pearlForm.handleSubmit(handleSavePearl)} className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Sauvegarder la Perle</h4>
                          <p className="text-sm text-muted-foreground italic">"{selection?.toString()}"</p>
                        </div>
                        <FormField
                            control={pearlForm.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Vos notes (optionnel)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Ce verset me parle parce que..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSaving} className="w-full">
                          {isSaving ? <LoaderCircle className="animate-spin" /> : <Save />}
                          Enregistrer la Perle
                        </Button>
                      </form>
                    </Form>
                  </PopoverContent>
                </Popover>

                <p><span className="font-bold text-primary pr-2 verse-number">1</span>Au commencement, Dieu créa les cieux et la terre.</p>
                <p><span className="font-bold text-primary pr-2 verse-number">2</span>La terre était informe et vide: il y avait des ténèbres à la surface de l'abîme, et l'esprit of Dieu se mouvait au-dessus des eaux.</p>
                <p><span className="font-bold text-primary pr-2 verse-number">3</span>Dieu dit: Que la lumière soit! Et la lumière fut.</p>
                <p><span className="font-bold text-primary pr-2 verse-number">4</span>Dieu vit que la lumière était bonne; et Dieu sépara la lumière d'avec les ténèbres.</p>
                <p><span className="font-bold text-primary pr-2 verse-number">5</span>Dieu appela la lumière jour, et il appela les ténèbres nuit. Ainsi, il y eut un soir, et il y eut un matin: ce fut le premier jour.</p>
                <p><span className="font-bold text-primary pr-2 verse-number">6</span>Dieu dit: Qu'il y ait une étendue entre les eaux, et qu'elle sépare les eaux d'avec les eaux.</p>
                <p><span className="font-bold text-primary pr-2 verse-number">7</span>Et Dieu fit l'étendue, et il sépara les eaux qui sont au-dessous de l'étendue d'avec les eaux qui sont au-dessus de l'étendue. Et cela fut ainsi.</p>
              </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
            <div>
                 <h2 className="text-3xl font-bold font-headline mb-4 flex items-center gap-3"><Search /> Recherche Sémantique</h2>
                <Card>
                    <CardHeader>
                    <CardDescription>
                        Décrivez ce que vous ressentez ou votre situation pour trouver des versets pertinents.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Form {...semanticForm}>
                        <form onSubmit={semanticForm.handleSubmit(onSemanticSubmit)} className="flex flex-col gap-4">
                        <FormField
                            control={semanticForm.control}
                            name="query"
                            render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                <Input
                                    placeholder="J'ai du mal à pardonner..."
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSearching}>
                            {isSearching ? (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Trouver des versets
                        </Button>
                        </form>
                    </Form>
                    </CardContent>
                </Card>
            </div>

            {isSearching && (
                <div className="text-center text-muted-foreground">
                    <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                    <p className="mt-2">Recherche dans les écritures...</p>
                </div>
            )}
            {searchResults && (
                <div className="space-y-4">
                  {searchResults.length > 0 ? (
                    searchResults.map((verse, index) => (
                      <div key={index} className="p-4 border rounded-md bg-secondary/50">
                        <p className="italic">"{verse.text}"</p>
                        <p className="text-right mt-2 font-semibold text-primary/80">
                          - {verse.book} {verse.chapter}:{verse.verse}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Aucun verset trouvé pour votre requête.</p>
                  )}
                </div>
            )}
            
            <div>
                <h2 className="text-3xl font-bold font-headline mb-4 flex items-center gap-3"><BookMarked /> Mes Perles de Sagesse</h2>
                <Card>
                    <CardContent className="pt-6">
                        {isLoadingPearls ? (
                             <p className="text-sm text-muted-foreground text-center">Chargement des perles...</p>
                        ) : pearls && pearls.length > 0 ? (
                            <div className="space-y-4">
                                {pearls.map(pearl => (
                                    <div key={pearl.id} className="p-4 border rounded-md bg-secondary/50">
                                        <p className="font-semibold text-primary/80">{pearl.verseReference}</p>
                                        <blockquote className="italic border-l-2 border-accent pl-2 my-1">"{pearl.verseText}"</blockquote>
                                        {pearl.notes && <p className="text-sm text-muted-foreground mt-2">Note: {pearl.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <p>Vous n'avez pas encore de versets soulignés.</p>
                                <p className="text-xs">Sélectionnez du texte dans la Bible pour en ajouter.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}

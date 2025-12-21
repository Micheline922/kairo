
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
import { Input } from '@/components/ui/input';
import { Search, LoaderCircle, BookOpen, BookMarked, Save, ArrowLeft } from 'lucide-react';
import {
  aiSemanticBibleSearch,
  AISemanticBibleSearchOutput,
} from '@/ai/flows/ai-semantic-bible-search';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/language-provider';
import { translations } from '@/lib/translations';

const semanticSearchSchema = z.object({
  query: z.string().min(3, { message: 'La requête de recherche doit contenir au moins 3 caractères.' }),
});

const verseSearchSchema = z.object({
    book: z.string().min(3, 'Livre requis'),
    chapter: z.string().min(1, 'Chapitre requis'),
    verse: z.string().optional(),
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

// Mock Bible content
const bibleData: { [key: string]: { [key: string]: string[] } } = {
  'genese': {
    '1': [
      "Au commencement, Dieu créa les cieux et la terre.",
      "La terre était informe et vide: il y avait des ténèbres à la surface de l'abîme, et l'esprit of Dieu se mouvait au-dessus des eaux.",
      "Dieu dit: Que la lumière soit! Et la lumière fut.",
      "Dieu vit que la lumière était bonne; et Dieu sépara la lumière d'avec les ténèbres.",
      "Dieu appela la lumière jour, et il appela les ténèbres nuit. Ainsi, il y eut un soir, et il y eut un matin: ce fut le premier jour.",
      "Dieu dit: Qu'il y ait une étendue entre les eaux, et qu'elle sépare les eaux d'avec les eaux.",
      "Et Dieu fit l'étendue, et il sépara les eaux qui sont au-dessous de l'étendue d'avec les eaux qui sont au-dessus de l'étendue. Et cela fut ainsi.",
    ],
    '2': [
      "Ainsi furent achevés les cieux et la terre, et toute leur armée.",
      "Dieu acheva au septième jour son oeuvre, qu'il avait faite; et il se reposa au septième jour de toute son oeuvre, qu'il avait faite.",
      "Dieu bénit le septième jour, et il le sanctifia, parce qu'en ce jour il se reposa de toute son oeuvre qu'il avait créée en la faisant.",
    ]
  },
};


export default function BiblePage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AISemanticBibleSearchOutput['verses'] | null>(null);
  const [selection, setSelection] = useState<Range | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showVerseSearch, setShowVerseSearch] = useState(true);
  const { language } = useLanguage();
  const t = translations[language];

  const [bibleDisplay, setBibleDisplay] = useState({
    book: 'Genèse',
    chapter: '1',
    content: bibleData['genese']['1'],
  });

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
    defaultValues: { book: 'Genèse', chapter: '1', verse: '' },
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
    const bookKey = values.book.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Use 'genese' as a fallback if the book is not found in the mock data
    const bookData = bibleData[bookKey as keyof typeof bibleData] || bibleData['genese'];
    const chapter = values.chapter;
    const chapterContent = bookData[chapter as keyof typeof bookData] || bookData['1']; // Fallback to chapter 1

    setBibleDisplay({
        book: values.book,
        chapter: chapter,
        content: chapterContent,
    });
    setShowVerseSearch(false);
    
    if (values.verse) {
        setTimeout(() => {
        const verseElement = document.getElementById(`verse-${values.verse}`);
        verseElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        verseElement?.classList.add('bg-accent/20', 'rounded-md');
        setTimeout(() => verseElement?.classList.remove('bg-accent/20', 'rounded-md'), 2000);
        }, 100);
    }
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
    const verseReference = `${bibleDisplay.book} ${bibleDisplay.chapter}:${verseNumber}`;

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
      <div className="flex items-center justify-between mb-8">
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-4xl font-bold font-headline">{t.bibleTitle}</h1>
          <p className="text-lg text-muted-foreground mt-2 italic">
            "{t.bibleQuote}"
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="ml-4 hidden sm:flex">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.backToDashboard}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl lg:text-3xl font-bold font-headline flex items-center gap-3"><BookOpen /> {t.browseScriptures}</h2>
              {!showVerseSearch && (
                <Button variant="outline" onClick={() => setShowVerseSearch(true)}>{t.newSearch}</Button>
              )}
            </div>
            
            {showVerseSearch && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{t.searchAVerse}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...verseForm}>
                            <form onSubmit={verseForm.handleSubmit(onVerseSubmit)} className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                <FormField control={verseForm.control} name="book" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>{t.book}</FormLabel><FormControl><Input placeholder="ex: Genèse" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={verseForm.control} name="chapter" render={({ field }) => ( <FormItem><FormLabel>{t.chapter}</FormLabel><FormControl><Input placeholder="ex: 1" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={verseForm.control} name="verse" render={({ field }) => ( <FormItem><FormLabel>{t.verseOptional}</FormLabel><FormControl><Input placeholder="ex: 1" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <Button type="submit" className="w-full md:col-start-4">{t.find}</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>{t.bibleChapterTitle.replace('{book}', bibleDisplay.book).replace('{chapter}', bibleDisplay.chapter)}</CardTitle>
                <CardDescription>{t.selectToSave}</CardDescription>
              </CardHeader>
              <CardContent onMouseUp={handleMouseUp} className="space-y-4 text-base leading-relaxed max-h-[60vh] overflow-y-auto p-4 sm:p-6">
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div style={{ display: 'none' }} />
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                     <Form {...pearlForm}>
                      <form onSubmit={pearlForm.handleSubmit(handleSavePearl)} className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">{t.savePearl}</h4>
                          <p className="text-sm text-muted-foreground italic">"{selection?.toString()}"</p>
                        </div>
                        <FormField
                            control={pearlForm.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t.yourNotesOptional}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={t.notesPlaceholder} {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSaving} className="w-full">
                          {isSaving ? <LoaderCircle className="animate-spin" /> : <Save />}
                          {t.savePearlButton}
                        </Button>
                      </form>
                    </Form>
                  </PopoverContent>
                </Popover>

                {bibleDisplay.content.map((verseText, index) => (
                  <p key={index} id={`verse-${index + 1}`} className="transition-all duration-1000 p-1">
                    <span className="font-bold text-primary pr-2 verse-number">{index + 1}</span>
                    {verseText}
                  </p>
                ))}
              </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
            <div>
                 <h2 className="text-2xl lg:text-3xl font-bold font-headline mb-4 flex items-center gap-3"><Search /> {t.semanticSearch}</h2>
                <Card>
                    <CardHeader>
                    <CardDescription>
                        {t.semanticSearchDescription}
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
                                    placeholder={t.semanticSearchPlaceholder}
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
                            {t.findVerses}
                        </Button>
                        </form>
                    </Form>
                    </CardContent>
                </Card>
            </div>

            {isSearching && (
                <div className="text-center text-muted-foreground py-8">
                    <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                    <p className="mt-2">{t.searchingScriptures}</p>
                </div>
            )}
            {searchResults && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
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
                    <p className="text-muted-foreground text-center py-4">{t.noVersesFound}</p>
                  )}
                </div>
            )}
            
            <div>
                <h2 className="text-2xl lg:text-3xl font-bold font-headline mb-4 flex items-center gap-3"><BookMarked /> {t.myPearls}</h2>
                <Card>
                    <CardContent className="pt-6 max-h-[60vh] overflow-y-auto">
                        {isLoadingPearls ? (
                             <p className="text-sm text-muted-foreground text-center">{t.loadingPearls}</p>
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
                            <div className="text-center text-muted-foreground py-8">
                                <p>{t.noPearlsSaved}</p>
                                <p className="text-xs">{t.noPearlsHint}</p>
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

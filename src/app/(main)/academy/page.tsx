
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wand2, LoaderCircle, School, Sparkles, Save, BookCopy, BookMarked, ArrowLeft } from 'lucide-react';
import { explainConcept } from '@/ai/flows/ai-explain-modern-concepts';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-provider';
import { translations } from '@/lib/translations';

const conceptSchema = z.object({
  concept: z.string().min(2, { message: 'Le concept doit contenir au moins 2 caractères.' }),
});

type AcademyInsight = {
  id: string;
  concept: string;
  explanation: string;
  relevantVerses?: string;
  savedDate: any;
};

export default function AcademyPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [relevantVerses, setRelevantVerses] = useState<string | null>(null);
  const [explainedConcept, setExplainedConcept] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  const insightsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/academyInsights`), orderBy('savedDate', 'desc'));
  }, [firestore, user]);

  const { data: insights, isLoading: isLoadingInsights } = useCollection<AcademyInsight>(insightsQuery);

  const form = useForm<z.infer<typeof conceptSchema>>({
    resolver: zodResolver(conceptSchema),
    defaultValues: { concept: '' },
  });

  async function onSubmit(values: z.infer<typeof conceptSchema>) {
    setIsExplaining(true);
    setExplanation(null);
    setRelevantVerses(null);
    setExplainedConcept(values.concept);
    try {
      const result = await explainConcept({ concept: values.concept });
      setExplanation(result.explanation);
      setRelevantVerses(result.relevantVerses);
    } catch (error) {
      console.error('Échec de l\'explication du concept:', error);
      setExplanation('Désolé, une erreur est survenue lors de la génération de l\'explication. Veuillez réessayer.');
    } finally {
      setIsExplaining(false);
    }
  }
  
  const handleSaveInsight = () => {
    if (!explanation || !explainedConcept || !user) return;
    
    const newInsight = {
        userId: user.uid,
        concept: explainedConcept,
        explanation: explanation,
        relevantVerses: relevantVerses || '',
        savedDate: serverTimestamp(),
    };
    
    addDocumentNonBlocking(collection(firestore, `users/${user.uid}/academyInsights`), newInsight);
    
    toast({
        title: t.insightSaved,
        description: t.insightSavedDescription.replace('{concept}', explainedConcept),
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
       <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold font-headline">{t.academyTitle}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            {t.academyDescription}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.backToDashboard}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>{t.conceptVsWord}</CardTitle>
                <CardDescription>
                  {t.conceptVsWordDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-4">
                    <FormField
                      control={form.control}
                      name="concept"
                      render={({ field }) => (
                        <FormItem className="flex-1 w-full">
                          <FormControl>
                            <Input
                              placeholder={t.conceptPlaceholder}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isExplaining} className="w-full sm:w-32">
                      {isExplaining ? (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      {t.explain}
                    </Button>
                  </form>
                </Form>

                {(isExplaining || explanation) && (
                  <div className="mt-8">
                      {isExplaining && (
                          <div className="text-center text-muted-foreground">
                          <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                          <p className="mt-2">{t.seekingWisdom}</p>
                          </div>
                      )}
                      {explanation && (
                          <div>
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold font-headline flex items-center gap-2 capitalize">
                                    <Sparkles className="h-5 w-5 text-accent" />
                                    {t.perspectiveOn.replace('{concept}', explainedConcept || '')}
                                </h3>
                                <Button variant="outline" size="sm" onClick={handleSaveInsight}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t.save}
                                </Button>
                              </div>
                              <div className="p-4 sm:p-6 border rounded-lg bg-secondary space-y-6">
                                  <div className="space-y-2">
                                      <h4 className="font-semibold text-lg">{t.explanation}</h4>
                                      <p className="whitespace-pre-wrap text-base leading-relaxed">{explanation}</p>
                                  </div>
                                  {relevantVerses && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-lg flex items-center gap-2"><BookMarked className="h-5 w-5"/> {t.keyVerses}</h4>
                                        <p className="whitespace-pre-wrap text-base leading-relaxed italic text-muted-foreground">{relevantVerses}</p>
                                    </div>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
                )}

                 {!isExplaining && !explanation && (
                   <div className="text-center py-16 border-2 border-dashed rounded-lg mt-8">
                      <School className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">{t.readyForWisdom}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                          {t.readyForWisdomHint}
                      </p>
                  </div>
                 )}
              </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
          <div>
              <h2 className="text-2xl lg:text-3xl font-bold font-headline mb-4 flex items-center gap-3"><BookCopy /> {t.myInsights}</h2>
              <Card>
                  <CardContent className="pt-6 max-h-[60vh] overflow-y-auto">
                      {isLoadingInsights ? (
                           <p className="text-sm text-muted-foreground text-center">{t.loadingInsights}</p>
                      ) : insights && insights.length > 0 ? (
                          <div className="space-y-4">
                              {insights.map(insight => (
                                  <div key={insight.id} className="p-4 border rounded-md bg-secondary/50">
                                      <p className="font-semibold text-primary/80 capitalize">{insight.concept}</p>
                                      <blockquote className="italic border-l-2 border-accent pl-2 my-1 text-sm text-muted-foreground line-clamp-2">"{insight.explanation}"</blockquote>
                                      {insight.relevantVerses && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.verseLabel.replace('{verses}', insight.relevantVerses)}</p>}
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center text-muted-foreground py-8">
                              <p>{t.noInsightsSaved}</p>
                              <p className="text-xs">{t.noInsightsHint}</p>
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

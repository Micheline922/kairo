
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, LoaderCircle, Sparkles, Save, BookCopy, ArrowLeft } from 'lucide-react';
import { discernGodsWill } from '@/ai/flows/ai-discern-gods-will';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-provider';
import { translations } from '@/lib/translations';

const discernSchema = z.object({
  context: z.string().min(20, { message: 'Veuillez décrire votre situation en au moins 20 caractères.' }),
});

type DivineGuidance = {
  id: string;
  decisionContext: string;
  guidance: string;
  savedDate: any;
};

export default function DiscernPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDiscerning, setIsDiscerning] = useState(false);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [decisionContext, setDecisionContext] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  const guidancesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/divineGuidances`), orderBy('savedDate', 'desc'));
  }, [firestore, user]);

  const { data: savedGuidances, isLoading: isLoadingGuidances } = useCollection<DivineGuidance>(guidancesQuery);

  const form = useForm<z.infer<typeof discernSchema>>({
    resolver: zodResolver(discernSchema),
    defaultValues: { context: '' },
  });

  async function onSubmit(values: z.infer<typeof discernSchema>) {
    setIsDiscerning(true);
    setGuidance(null);
    setDecisionContext(values.context);
    try {
      const result = await discernGodsWill({ decisionContext: values.context });
      setGuidance(result.guidance);
    } catch (error) {
      console.error('Échec de l\'obtention des conseils:', error);
      setGuidance('Désolé, une erreur est survenue lors de la recherche de conseils. Veuillez réessayer.');
    } finally {
      setIsDiscerning(false);
    }
  }

  const handleSaveGuidance = () => {
    if (!guidance || !decisionContext || !user) return;
    
    const newGuidance = {
        userId: user.uid,
        decisionContext: decisionContext,
        guidance: guidance,
        savedDate: serverTimestamp(),
    };
    
    addDocumentNonBlocking(collection(firestore, `users/${user.uid}/divineGuidances`), newGuidance);
    
    toast({
        title: t.guidanceSaved,
        description: t.guidanceSavedDescription,
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-4xl font-bold font-headline">{t.discernTitle}</h1>
            <p className="text-lg text-muted-foreground mt-2">
              {t.discernDescription}
            </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.backToDashboard}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>{t.doubtProjectSpace}</CardTitle>
                <CardDescription>
                    {t.doubtProjectDescription}
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="context"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t.decisionContext}</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder={t.decisionContextPlaceholder}
                                className="min-h-[150px]"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isDiscerning} size="lg" className="w-full sm:w-auto">
                        {isDiscerning ? (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        {t.seekAdvice}
                        </Button>
                    </div>
                    </form>
                </Form>

                {isDiscerning && (
                    <div className="mt-8 text-center text-muted-foreground">
                    <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                    <p className="mt-2">{t.consultingScriptures}</p>
                    </div>
                )}

                {guidance && (
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold font-headline flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-accent" />
                                {t.biblicalGuidance}
                            </h3>
                             <Button variant="outline" size="sm" onClick={handleSaveGuidance}>
                                <Save className="mr-2 h-4 w-4" />
                                {t.save}
                            </Button>
                        </div>
                        <div className="p-4 sm:p-6 border rounded-lg bg-secondary space-y-4">
                            <p className="whitespace-pre-wrap text-base leading-relaxed">{guidance}</p>
                        </div>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
           <div>
              <h2 className="text-2xl lg:text-3xl font-bold font-headline mb-4 flex items-center gap-3"><BookCopy /> {t.mySavedGuidance}</h2>
              <Card>
                  <CardContent className="pt-6 max-h-[60vh] overflow-y-auto">
                      {isLoadingGuidances ? (
                           <p className="text-sm text-muted-foreground text-center">{t.loadingGuidance}</p>
                      ) : savedGuidances && savedGuidances.length > 0 ? (
                          <div className="space-y-4">
                              {savedGuidances.map(item => (
                                  <div key={item.id} className="p-4 border rounded-md bg-secondary/50">
                                      <p className="font-semibold text-primary/80 text-sm line-clamp-2">{t.guidanceFor.replace('{context}', item.decisionContext)}</p>
                                      <blockquote className="italic border-l-2 border-accent pl-2 my-1 text-sm text-muted-foreground line-clamp-3">"{item.guidance}"</blockquote>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center text-muted-foreground py-8">
                              <p>{t.noGuidanceSaved}</p>
                              <p className="text-xs">{t.noGuidanceHint}</p>
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

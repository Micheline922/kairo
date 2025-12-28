
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Wand2, LoaderCircle, Sparkles, Save, BookCopy, BookMarked, ArrowLeft, PenSquare } from 'lucide-react';
import { enhanceArticle } from '@/ai/flows/ai-enhance-article';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-provider';
import { translations } from '@/lib/translations';

const articleSchema = z.object({
  title: z.string().min(5, { message: 'Le titre doit contenir au moins 5 caractères.' }),
  draft: z.string().min(50, { message: 'Le brouillon doit contenir au moins 50 caractères.' }),
});

type SavedArticle = {
  id: string;
  title: string;
  enhancedArticle: string;
  supportingVerses: string;
  savedDate: any;
};

export default function WritingSanctuaryPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<{ enhancedArticle: string; supportingVerses: string; } | null>(null);
  const [originalTitle, setOriginalTitle] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language] as any; // Using 'any' to simplify access to nested keys

  const articlesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/writersSanctuary`), orderBy('savedDate', 'desc'));
  }, [firestore, user]);

  const { data: savedArticles, isLoading: isLoadingArticles } = useCollection<SavedArticle>(articlesQuery);

  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: { title: '', draft: '' },
  });

  async function onSubmit(values: z.infer<typeof articleSchema>) {
    setIsEnhancing(true);
    setEnhancedResult(null);
    setOriginalTitle(values.title);
    try {
      const result = await enhanceArticle({ title: values.title, articleDraft: values.draft });
      setEnhancedResult(result);
    } catch (error) {
      console.error('Échec de l\'amélioration de l\'article:', error);
      toast({
        variant: 'destructive',
        title: t.articlesBank.errorTitle,
        description: t.articlesBank.errorDescription,
      });
    } finally {
      setIsEnhancing(false);
    }
  }
  
  const handleSaveArticle = () => {
    if (!enhancedResult || !originalTitle || !user) return;
    
    const newArticle = {
        userId: user.uid,
        title: originalTitle,
        ...enhancedResult,
        savedDate: serverTimestamp(),
    };
    
    addDocumentNonBlocking(collection(firestore, `users/${user.uid}/writersSanctuary`), newArticle);
    
    toast({
        title: t.articlesBank.saveSuccessTitle,
        description: t.articlesBank.saveSuccessDescription.replace('{title}', originalTitle),
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
       <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold font-headline">{t.articlesBank.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            {t.articlesBank.description}
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
                <CardTitle>{t.articlesBank.editorTitle}</CardTitle>
                <CardDescription>
                  {t.articlesBank.editorDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                     <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.articlesBank.articleTitleLabel}</FormLabel>
                          <FormControl>
                            <Input placeholder={t.articlesBank.articleTitlePlaceholder} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="draft"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.articlesBank.draftLabel}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t.articlesBank.draftPlaceholder}
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isEnhancing} className="w-full sm:w-auto">
                      {isEnhancing ? (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      {t.articlesBank.enhanceButton}
                    </Button>
                  </form>
                </Form>

                {isEnhancing && (
                    <div className="text-center text-muted-foreground py-16">
                    <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                    <p className="mt-2">{t.articlesBank.enhancingMessage}</p>
                    </div>
                )}
                {enhancedResult && (
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold font-headline flex items-center gap-2 capitalize">
                            <Sparkles className="h-5 w-5 text-accent" />
                            {t.articlesBank.enhancedArticleTitle}
                        </h3>
                        <Button variant="outline" size="sm" onClick={handleSaveArticle}>
                            <Save className="mr-2 h-4 w-4" />
                            {t.save}
                        </Button>
                        </div>
                        <div className="p-4 sm:p-6 border rounded-lg bg-secondary space-y-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-lg">{originalTitle}</h4>
                                <p className="whitespace-pre-wrap text-base leading-relaxed">{enhancedResult.enhancedArticle}</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-lg flex items-center gap-2"><BookMarked className="h-5 w-5"/> {t.articlesBank.versesTitle}</h4>
                                <p className="whitespace-pre-wrap text-base leading-relaxed italic text-muted-foreground">{enhancedResult.supportingVerses}</p>
                            </div>
                        </div>
                    </div>
                )}

                 {!isEnhancing && !enhancedResult && (
                   <div className="text-center py-16 border-2 border-dashed rounded-lg mt-8">
                      <PenSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">{t.articlesBank.waitingTitle}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                          {t.articlesBank.waitingDescription}
                      </p>
                  </div>
                 )}
              </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
          <div>
              <h2 className="text-2xl lg:text-3xl font-bold font-headline mb-4 flex items-center gap-3"><BookCopy /> {t.articlesBank.myArticlesTitle}</h2>
              <Card>
                  <CardContent className="pt-6 max-h-[60vh] overflow-y-auto">
                      {isLoadingArticles ? (
                           <p className="text-sm text-muted-foreground text-center">{t.articlesBank.loadingArticles}</p>
                      ) : savedArticles && savedArticles.length > 0 ? (
                          <div className="space-y-4">
                              {savedArticles.map(article => (
                                  <div key={article.id} className="p-4 border rounded-md bg-secondary/50">
                                      <p className="font-semibold text-primary/80 capitalize">{article.title}</p>
                                      <blockquote className="italic border-l-2 border-accent pl-2 my-1 text-sm text-muted-foreground line-clamp-2">"{article.enhancedArticle}"</blockquote>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center text-muted-foreground py-8">
                              <p>{t.articlesBank.noArticlesSaved}</p>
                              <p className="text-xs">{t.articlesBank.noArticlesHint}</p>
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

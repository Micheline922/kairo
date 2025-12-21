'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, LoaderCircle, Sparkles, Save, BookCopy } from 'lucide-react';
import { discernGodsWill } from '@/ai/flows/ai-discern-gods-will';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


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
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDiscerning, setIsDiscerning] = useState(false);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [decisionContext, setDecisionContext] = useState<string | null>(null);

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
        title: "Conseil sauvegardé !",
        description: `Le conseil concernant votre décision a bien été enregistré.`,
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Discerner la Volonté de Dieu</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Un espace pour déposer vos projets et vos doutes, en cherchant la sagesse biblique pour vos décisions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>Espace Projets / Doutes</CardTitle>
                <CardDescription>
                    Décrivez la décision à laquelle vous êtes confronté. Plus vous fournirez de détails, plus les conseils seront personnalisés.
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
                            <FormLabel>Le contexte de votre décision</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="J'envisage une nouvelle offre d'emploi dans une autre ville, mais cela signifierait déraciner ma famille..."
                                className="min-h-[150px]"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isDiscerning} size="lg">
                        {isDiscerning ? (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Chercher conseil
                        </Button>
                    </div>
                    </form>
                </Form>

                {isDiscerning && (
                    <div className="mt-8 text-center text-muted-foreground">
                    <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                    <p className="mt-2">Consultation des écritures et prière pour la sagesse...</p>
                    </div>
                )}

                {guidance && (
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold font-headline flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-accent" />
                                Conseils bibliques
                            </h3>
                             <Button variant="outline" size="sm" onClick={handleSaveGuidance}>
                                <Save className="mr-2 h-4 w-4" />
                                Enregistrer
                            </Button>
                        </div>
                        <div className="p-6 border rounded-lg bg-secondary space-y-4">
                            <p className="whitespace-pre-wrap text-base leading-relaxed">{guidance}</p>
                        </div>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
           <div>
              <h2 className="text-3xl font-bold font-headline mb-4 flex items-center gap-3"><BookCopy /> Mes Conseils Sauvegardés</h2>
              <Card>
                  <CardContent className="pt-6">
                      {isLoadingGuidances ? (
                           <p className="text-sm text-muted-foreground text-center">Chargement des conseils...</p>
                      ) : savedGuidances && savedGuidances.length > 0 ? (
                          <div className="space-y-4">
                              {savedGuidances.map(item => (
                                  <div key={item.id} className="p-4 border rounded-md bg-secondary/50">
                                      <p className="font-semibold text-primary/80 text-sm line-clamp-2">Pour: {item.decisionContext}</p>
                                      <blockquote className="italic border-l-2 border-accent pl-2 my-1 text-sm text-muted-foreground line-clamp-3">"{item.guidance}"</blockquote>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center text-muted-foreground py-8">
                              <p>Vous n'avez pas encore de conseils sauvegardés.</p>
                              <p className="text-xs">Enregistrez un conseil pour le retrouver ici.</p>
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

    
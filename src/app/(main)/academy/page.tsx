'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wand2, LoaderCircle, School, Sparkles } from 'lucide-react';
import { explainConcept } from '@/ai/flows/ai-explain-modern-concepts';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const conceptSchema = z.object({
  concept: z.string().min(2, { message: 'Le concept doit contenir au moins 2 caractères.' }),
});

export default function AcademyPage() {
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainedConcept, setExplainedConcept] = useState<string | null>(null);

  const form = useForm<z.infer<typeof conceptSchema>>({
    resolver: zodResolver(conceptSchema),
    defaultValues: { concept: '' },
  });

  async function onSubmit(values: z.infer<typeof conceptSchema>) {
    setIsExplaining(true);
    setExplanation(null);
    setExplainedConcept(values.concept);
    try {
      const result = await explainConcept({ concept: values.concept });
      setExplanation(result.explanation);
    } catch (error) {
      console.error('Échec de l\'explication du concept:', error);
      setExplanation('Désolé, une erreur est survenue lors de la génération de l\'explication. Veuillez réessayer.');
    } finally {
      setIsExplaining(false);
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">L'Académie</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Faire le pont entre le monde moderne et la vérité biblique.
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Concept vs. Parole</CardTitle>
          <CardDescription>
            Entrez un terme moderne (ex: "Métavers", "Équilibre vie pro/perso", "Anxiété") pour recevoir une perspective biblique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="concept"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="ex: Intelligence Artificielle"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isExplaining} className="w-32">
                {isExplaining ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Expliquer
              </Button>
            </form>
          </Form>

          {(isExplaining || explanation) && (
            <div className="mt-8">
                {isExplaining && (
                    <div className="text-center text-muted-foreground">
                    <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                    <p className="mt-2">Recherche de sagesse...</p>
                    </div>
                )}
                {explanation && (
                    <div>
                        <h3 className="text-xl font-semibold font-headline flex items-center gap-2 mb-4 capitalize">
                            <Sparkles className="h-5 w-5 text-accent" />
                            Une perspective biblique sur "{explainedConcept}"
                        </h3>
                        <div className="p-6 border rounded-lg bg-secondary space-y-4">
                            <p className="whitespace-pre-wrap text-base leading-relaxed">{explanation}</p>
                        </div>
                    </div>
                )}
            </div>
          )}

           {!isExplaining && !explanation && (
             <div className="text-center py-16 border-2 border-dashed rounded-lg mt-8">
                <School className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Prêt pour la Sagesse</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Entrez un concept ci-dessus pour commencer.
                </p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}

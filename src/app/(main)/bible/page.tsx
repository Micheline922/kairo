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
import { Input } from '@/components/ui/input';
import { Search, LoaderCircle, BookOpen } from 'lucide-react';
import {
  aiSemanticBibleSearch,
  AISemanticBibleSearchOutput,
} from '@/ai/flows/ai-semantic-bible-search';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

const searchSchema = z.object({
  query: z.string().min(3, { message: 'La requête de recherche doit contenir au moins 3 caractères.' }),
});

export default function BiblePage() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AISemanticBibleSearchOutput['verses'] | null>(null);

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: '' },
  });

  async function onSubmit(values: z.infer<typeof searchSchema>) {
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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">La Parole Vivante</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Sondez les Écritures non seulement avec des mots-clés, mais avec votre cœur.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recherche Sémantique par IA</CardTitle>
          <CardDescription>
            Décrivez ce que vous ressentez ou votre situation. Par exemple, "Je me sens dépassé par mes dettes".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
              <FormField
                control={form.control}
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
              <Button type="submit" disabled={isSearching} className="w-32">
                {isSearching ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Chercher
              </Button>
            </form>
          </Form>

          {isSearching && (
            <div className="mt-6 text-center text-muted-foreground">
              <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
              <p className="mt-2">Recherche dans les écritures pour vous...</p>
            </div>
          )}

          {searchResults && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Versets pertinents</h3>
              {searchResults.length > 0 ? (
                searchResults.map((verse, index) => (
                  <div key={index} className="p-4 border rounded-md bg-secondary">
                    <p className="italic">"{verse.text}"</p>
                    <p className="text-right mt-2 font-semibold text-primary/80">
                      - {verse.book} {verse.chapter}:{verse.verse}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Aucun verset trouvé pour votre requête. Essayez de reformuler.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Separator className="my-12"/>

      <div className="mt-8">
        <h2 className="text-3xl font-bold font-headline mb-4 flex items-center gap-3"><BookOpen /> Parcourir les Écritures</h2>
        <Card>
          <CardHeader>
            <CardTitle>Genèse, Chapitre 1</CardTitle>
            <CardDescription>Sélectionnez du texte pour le surligner ou l'enregistrer comme "Perle de Sagesse".</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-lg leading-relaxed max-h-[60vh] overflow-y-auto">
            <p><span className="font-bold text-primary pr-2">1</span>Au commencement, Dieu créa les cieux et la terre.</p>
            <p><span className="font-bold text-primary pr-2">2</span>La terre était informe et vide: il y avait des ténèbres à la surface de l'abîme, et l'esprit of Dieu se mouvait au-dessus des eaux.</p>
            <p><span className="font-bold text-primary pr-2">3</span>Dieu dit: Que la lumière soit! Et la lumière fut.</p>
            <p><span className="font-bold text-primary pr-2">4</span>Dieu vit que la lumière était bonne; et Dieu sépara la lumière d'avec les ténèbres.</p>
            <p><span className="font-bold text-primary pr-2">5</span>Dieu appela la lumière jour, et il appela les ténèbres nuit. Ainsi, il y eut un soir, et il y eut un matin: ce fut le premier jour.</p>
            <p><span className="font-bold text-primary pr-2">6</span>Dieu dit: Qu'il y ait une étendue entre les eaux, et qu'elle sépare les eaux d'avec les eaux.</p>
            <p><span className="font-bold text-primary pr-2">7</span>Et Dieu fit l'étendue, et il sépara les eaux qui sont au-dessous de l'étendue d'avec les eaux qui sont au-dessus de l'étendue. Et cela fut ainsi.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

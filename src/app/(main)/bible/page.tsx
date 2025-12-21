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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

const searchSchema = z.object({
  query: z.string().min(3, { message: 'Search query must be at least 3 characters.' }),
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
      console.error('Semantic search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">The Living Word</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Search the scriptures not just with keywords, but with your heart.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>AI Semantic Search</CardTitle>
          <CardDescription>
            Describe how you feel or your situation. For example, "I feel overwhelmed by my debts".
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
                        placeholder="I'm struggling with forgiveness..."
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
                Search
              </Button>
            </form>
          </Form>

          {isSearching && (
            <div className="mt-6 text-center text-muted-foreground">
              <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
              <p className="mt-2">Searching the scriptures for you...</p>
            </div>
          )}

          {searchResults && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Relevant Verses</h3>
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
                <p className="text-muted-foreground">No verses found for your query. Try rephrasing.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Separator className="my-12"/>

      <div className="mt-8">
        <h2 className="text-3xl font-bold font-headline mb-4 flex items-center gap-3"><BookOpen /> Browse Scripture</h2>
        <Card>
          <CardHeader>
            <CardTitle>Genesis, Chapter 1</CardTitle>
            <CardDescription>Select text to highlight or save as a "Pearl of Wisdom".</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-lg leading-relaxed max-h-[60vh] overflow-y-auto">
            <p><span className="font-bold text-primary pr-2">1</span>In the beginning God created the heavens and the earth.</p>
            <p><span className="font-bold text-primary pr-2">2</span>Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.</p>
            <p><span className="font-bold text-primary pr-2">3</span>And God said, “Let there be light,” and there was light.</p>
            <p><span className="font-bold text-primary pr-2">4</span>God saw that the light was good, and he separated the light from the darkness.</p>
            <p><span className="font-bold text-primary pr-2">5</span>God called the light “day,” and the darkness he called “night.” And there was evening, and there was morning—the first day.</p>
            <p><span className="font-bold text-primary pr-2">6</span>And God said, “Let there be a vault between the waters to separate water from water.”</p>
            <p><span className="font-bold text-primary pr-2">7</span>So God made the vault and separated the water under the vault from the water above it. And it was so.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
  concept: z.string().min(2, { message: 'Concept must be at least 2 characters.' }),
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
      console.error('Failed to explain concept:', error);
      setExplanation('Sorry, an error occurred while generating the explanation. Please try again.');
    } finally {
      setIsExplaining(false);
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">The Academy</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Bridging the modern world and biblical truth.
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Concept vs. Word</CardTitle>
          <CardDescription>
            Enter a modern term (e.g., "Metaverse", "Work-life balance", "Anxiety") to receive a biblical perspective.
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
                        placeholder="e.g., Artificial Intelligence"
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
                Explain
              </Button>
            </form>
          </Form>

          {(isExplaining || explanation) && (
            <div className="mt-8">
                {isExplaining && (
                    <div className="text-center text-muted-foreground">
                    <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                    <p className="mt-2">Searching for wisdom...</p>
                    </div>
                )}
                {explanation && (
                    <div>
                        <h3 className="text-xl font-semibold font-headline flex items-center gap-2 mb-4 capitalize">
                            <Sparkles className="h-5 w-5 text-accent" />
                            A Biblical Perspective on "{explainedConcept}"
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
                <h3 className="mt-4 text-lg font-semibold">Ready for Wisdom</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Enter a concept above to begin.
                </p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}

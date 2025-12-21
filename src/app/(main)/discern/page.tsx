'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, LoaderCircle, Sparkles } from 'lucide-react';
import { discernGodsWill } from '@/ai/flows/ai-discern-gods-will';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const discernSchema = z.object({
  context: z.string().min(20, { message: 'Please describe your situation in at least 20 characters.' }),
});

export default function DiscernPage() {
  const [isDiscerning, setIsDiscerning] = useState(false);
  const [guidance, setGuidance] = useState<string | null>(null);

  const form = useForm<z.infer<typeof discernSchema>>({
    resolver: zodResolver(discernSchema),
    defaultValues: { context: '' },
  });

  async function onSubmit(values: z.infer<typeof discernSchema>) {
    setIsDiscerning(true);
    setGuidance(null);
    try {
      const result = await discernGodsWill({ decisionContext: values.context });
      setGuidance(result.guidance);
    } catch (error) {
      console.error('Failed to get guidance:', error);
      setGuidance('Sorry, an error occurred while seeking guidance. Please try again.');
    } finally {
      setIsDiscerning(false);
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Discern God's Will</h1>
        <p className="text-lg text-muted-foreground mt-2">
          A space to lay down your projects and doubts, seeking biblical wisdom for your decisions.
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Project / Doubt Space</CardTitle>
          <CardDescription>
            Describe the decision you're facing. The more detail you provide, the more tailored the guidance will be.
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
                    <FormLabel>Your Decision Context</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="I'm considering a new job offer in another city, but it would mean uprooting my family..."
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
                  Seek Guidance
                </Button>
              </div>
            </form>
          </Form>

          {isDiscerning && (
            <div className="mt-8 text-center text-muted-foreground">
              <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
              <p className="mt-2">Consulting scripture and praying for wisdom...</p>
            </div>
          )}

          {guidance && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold font-headline flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-accent" />
                Biblical Guidance
              </h3>
              <div className="p-6 border rounded-lg bg-secondary space-y-4">
                 <p className="whitespace-pre-wrap text-base leading-relaxed">{guidance}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

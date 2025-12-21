
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
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Wand2, PlusCircle, LoaderCircle, Calendar, Sparkles, Save } from 'lucide-react';
import { generateReadingPlan } from '@/ai/flows/ai-customized-reading-plan';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentsui/select';
import { useLanguage } from '@/context/language-provider';
import { translations } from '@/lib/translations';

const fastingSchema = z.object({
  duration: z.string().min(1, 'Veuillez saisir une durée.'),
  type: z.string().min(1, 'Veuillez sélectionner un type.'),
  purpose: z.string().min(10, { message: 'Le but doit contenir au moins 10 caractères.' }),
});

type Fast = z.infer<typeof fastingSchema> & {
  id: number;
  readingPlan?: string;
  progress: number;
};

const mockFasts: Fast[] = [];

export default function FastingPage() {
  const [fasts, setFasts] = useState<Fast[]>(mockFasts);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  const form = useForm<z.infer<typeof fastingSchema>>({
    resolver: zodResolver(fastingSchema),
    defaultValues: { duration: '3 Jours', type: 'À l\'eau seulement', purpose: '' },
  });

  async function handleGeneratePlan(values: z.infer<typeof fastingSchema>) {
    setIsGenerating(true);
    setGeneratedPlan(null);
    try {
      const result = await generateReadingPlan({ reasonForFasting: values.purpose });
      setGeneratedPlan(result.readingPlan);
    } catch (error) {
      console.error('La génération du plan de lecture a échoué:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSaveFast() {
    if (!generatedPlan) return;
    
    const values = form.getValues();
    const newFast: Fast = {
      id: fasts.length + 1,
      ...values,
      readingPlan: generatedPlan,
      progress: 0, // Commence à 0%
    };
    setFasts([newFast, ...fasts]);
    
    // Reset state and close dialog
    setGeneratedPlan(null);
    form.reset();
    setIsDialogOpen(false);
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">{t.fastingAltar}</h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t.fastingDescription}
        </p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setGeneratedPlan(null);
          form.reset();
        }
        setIsDialogOpen(open);
      }}>
        <DialogTrigger asChild>
          <Button size="lg" className="mb-8">
            <PlusCircle className="mr-2 h-5 w-5" />
            {t.scheduleNewFast}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGeneratePlan)} className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">{t.newFastTitle}</DialogTitle>
                <DialogDescription>
                  {t.newFastDescription}
                </DialogDescription>
              </DialogHeader>
              
              {!generatedPlan ? (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.duration}</FormLabel>
                          <FormControl><Input placeholder={t.durationPlaceholder} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.fastingType}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder={t.selectType} /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={t.waterFast}>{t.waterFast}</SelectItem>
                              <SelectItem value={t.juiceFast}>{t.juiceFast}</SelectItem>
                              <SelectItem value={t.danielFast}>{t.danielFast}</SelectItem>
                              <SelectItem value={t.partialFast}>{t.partialFast}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.purpose}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.purposePlaceholder}
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">{t.cancel}</Button></DialogClose>
                    <Button type="submit" disabled={isGenerating}>
                        {isGenerating && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        <Wand2 className="mr-2 h-4 w-4" />
                        {t.generatePlan}
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Sparkles className="text-accent"/> {t.yourCustomPlan}</h3>
                    <div className="p-4 bg-secondary rounded-md max-h-64 overflow-y-auto border">
                      <p className="whitespace-pre-wrap font-sans text-sm">{generatedPlan}</p>
                    </div>
                  </div>
                   <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setGeneratedPlan(null)}>{t.back}</Button>
                      <Button type="button" onClick={handleSaveFast}>
                          <Save className="mr-2 h-4 w-4" />
                          {t.saveAndStart}
                      </Button>
                  </DialogFooter>
                </>
              )}
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <h2 className="text-3xl font-bold font-headline mb-4">{t.yourFasts}</h2>
      {fasts.length > 0 ? (
        <div className="space-y-4">
          {fasts.map(fast => (
            <Card key={fast.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{fast.duration} - {fast.type}</span>
                  <span className="text-sm font-medium text-muted-foreground">{t.progressCompleted.replace('{progress}', fast.progress.toString())}</span>
                </CardTitle>
                <Progress value={fast.progress} className="mt-2" />
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold">{t.purpose}:</h4>
                  <p className="text-muted-foreground italic">"{fast.purpose}"</p>
                </div>
                {fast.readingPlan && (
                  <div className="mt-4">
                    <h4 className="font-semibold">{t.readingPrayerPlan}</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap text-sm border p-3 rounded-md bg-secondary/50 mt-2">{fast.readingPlan}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t.noFastsScheduled}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.noFastsHint}
          </p>
        </div>
      )}
    </div>
  );
}

    
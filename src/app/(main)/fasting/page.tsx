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
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Wand2, PlusCircle, LoaderCircle, Calendar, Sparkles } from 'lucide-react';
import { generateReadingPlan, ReadingPlanOutput } from '@/ai/flows/ai-customized-reading-plan';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fastingSchema = z.object({
  duration: z.string().min(1, 'Please enter a duration.'),
  type: z.string().min(1, 'Please select a type.'),
  purpose: z.string().min(10, { message: 'Purpose must be at least 10 characters.' }),
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

  const form = useForm<z.infer<typeof fastingSchema>>({
    resolver: zodResolver(fastingSchema),
    defaultValues: { duration: '3 Days', type: 'Water Only', purpose: '' },
  });

  async function onSubmit(values: z.infer<typeof fastingSchema>) {
    setIsGenerating(true);
    setGeneratedPlan(null);
    try {
      const result = await generateReadingPlan({ reasonForFasting: values.purpose });
      setGeneratedPlan(result.readingPlan);
      
      const newFast: Fast = {
        id: fasts.length + 1,
        ...values,
        readingPlan: result.readingPlan,
        progress: 33, // Example progress
      };
      setFasts([newFast, ...fasts]);
      // The dialog would be closed upon successful submission in a real app
      // setIsDialogOpen(false); 
      // form.reset();
    } catch (error) {
      console.error('Failed to generate reading plan:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">The Fasting Altar</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Commit to a fast and receive spiritual sustenance for your journey.
        </p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="mb-8">
            <PlusCircle className="mr-2 h-5 w-5" />
            Program a New Fast
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">New Fast</DialogTitle>
                <DialogDescription>
                  Define your fast and let AI generate a custom reading plan for you.
                </DialogDescription>
              </DialogHeader>
              
              {!generatedPlan ? (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <FormControl><Input placeholder="e.g., 3 Days" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type of Fast</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Water Only">Water Only</SelectItem>
                              <SelectItem value="Juice Fast">Juice Fast</SelectItem>
                              <SelectItem value="Daniel Fast">Daniel Fast</SelectItem>
                              <SelectItem value="Partial Fast">Partial Fast</SelectItem>
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
                        <FormLabel>Purpose (Your "Why")</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="I am fasting for clarity on a major life decision..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Sparkles className="text-accent"/> Your Customized Reading Plan</h3>
                  <div className="p-4 bg-secondary rounded-md max-h-64 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{generatedPlan}</p>
                  </div>
                </div>
              )}

              <DialogFooter>
                 {!generatedPlan ? (
                    <>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isGenerating}>
                        {isGenerating && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Plan
                    </Button>
                    </>
                 ) : (
                    <DialogClose asChild><Button type="button" onClick={() => { setGeneratedPlan(null); form.reset(); }}>Close</Button></DialogClose>
                 )}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <h2 className="text-3xl font-bold font-headline mb-4">Your Fasts</h2>
      {fasts.length > 0 ? (
        <div className="space-y-4">
          {fasts.map(fast => (
            <Card key={fast.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{fast.duration} - {fast.type}</span>
                  <span className="text-sm font-medium text-muted-foreground">{fast.progress}% complete</span>
                </CardTitle>
                <Progress value={fast.progress} className="mt-2" />
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold">Purpose:</h4>
                  <p className="text-muted-foreground italic">"{fast.purpose}"</p>
                </div>
                {fast.readingPlan && (
                  <div className="mt-4">
                    <h4 className="font-semibold">AI Sustenance Reading Plan:</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap text-sm">{fast.readingPlan}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Fasts Programmed</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Click 'Program a New Fast' to begin a new season of spiritual focus.
          </p>
        </div>
      )}
    </div>
  );
}

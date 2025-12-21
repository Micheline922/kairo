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
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, HandHelping, LoaderCircle, Send, Sparkle, Trash2, PlusCircle, Clock } from 'lucide-react';
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
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

const prayerRequestSchema = z.object({
  request: z.string().min(10, { message: 'Votre sujet de prière doit contenir au moins 10 caractères.' }),
});

const prayerPlanSchema = z.object({
  title: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères.' }),
  time: z.string().min(1, { message: 'Veuillez définir une heure.'}),
  intention: z.string().min(5, { message: 'L\'intention doit contenir au moins 5 caractères.' }),
});

type PrayerRequest = {
  id: string;
  requestText: string;
  isAnswered: boolean;
  creationDate: any;
  answeredDate?: any;
};

type PrayerPlan = {
  id: string;
  title: string;
  time: string;
  intention: string;
  creationDate: any;
};

export default function PrayerWallPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);

  // Queries for prayer requests
  const prayerRequestsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/prayerRequests`), orderBy('creationDate', 'desc'));
  }, [firestore, user]);
  const { data: prayerRequests, isLoading: isLoadingRequests } = useCollection<PrayerRequest>(prayerRequestsQuery);

  // Queries for prayer plans
  const prayerPlansQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/prayerPlans`), orderBy('creationDate', 'desc'));
  }, [firestore, user]);
  const { data: prayerPlans, isLoading: isLoadingPlans } = useCollection<PrayerPlan>(prayerPlansQuery);

  const pendingPrayers = prayerRequests?.filter(p => !p.isAnswered) || [];
  const answeredPrayers = prayerRequests?.filter(p => p.isAnswered) || [];

  const requestForm = useForm<z.infer<typeof prayerRequestSchema>>({
    resolver: zodResolver(prayerRequestSchema),
    defaultValues: { request: '' },
  });

  const planForm = useForm<z.infer<typeof prayerPlanSchema>>({
    resolver: zodResolver(prayerPlanSchema),
    defaultValues: { title: '', time: '', intention: '' },
  });

  async function onRequestSubmit(values: z.infer<typeof prayerRequestSchema>) {
    if (!user) return;
    setIsSubmittingRequest(true);
    
    const newRequest = {
        userId: user.uid,
        requestText: values.request,
        isAnswered: false,
        creationDate: serverTimestamp(),
    };
    
    addDocumentNonBlocking(collection(firestore, `users/${user.uid}/prayerRequests`), newRequest);

    toast({
      title: 'Prière déposée',
      description: 'Votre prière a été ajoutée au mur. Nous croyons avec vous.',
    });
    
    setIsSubmittingRequest(false);
    requestForm.reset();
  }

  async function onPlanSubmit(values: z.infer<typeof prayerPlanSchema>) {
    if (!user) return;
    setIsSubmittingPlan(true);

    const newPlan = {
      userId: user.uid,
      ...values,
      creationDate: serverTimestamp(),
    };

    addDocumentNonBlocking(collection(firestore, `users/${user.uid}/prayerPlans`), newPlan);

    toast({
      title: 'Plan de prière ajouté',
      description: 'Votre nouveau moment de prière a été planifié.',
    });

    setIsSubmittingPlan(false);
    planForm.reset();
    setIsPlanDialogOpen(false);
  }

  const markAsAnswered = (prayerId: string) => {
    if (!user) return;
    const prayerRef = doc(firestore, `users/${user.uid}/prayerRequests`, prayerId);
    updateDocumentNonBlocking(prayerRef, {
      isAnswered: true,
      answeredDate: serverTimestamp(),
    });
    toast({
        title: 'Prière Exaucée !',
        description: 'Gloire à Dieu ! Cette prière a été marquée comme exaucée.',
    });
  };

  const deletePrayer = (prayerId: string) => {
    if (!user) return;
    const prayerRef = doc(firestore, `users/${user.uid}/prayerRequests`, prayerId);
    deleteDocumentNonBlocking(prayerRef);
    toast({
        title: 'Prière retirée',
        description: 'La prière a été retirée du mur.',
        variant: 'destructive',
    });
  }
  
  const deletePlan = (planId: string) => {
    if (!user) return;
    const planRef = doc(firestore, `users/${user.uid}/prayerPlans`, planId);
    deleteDocumentNonBlocking(planRef);
    toast({
        title: 'Plan de prière supprimé',
        variant: 'destructive',
    });
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Mur de Prière</h1>
        <p className="text-lg text-muted-foreground mt-2">
          "Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces." - Philippiens 4:6
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Déposer une prière</CardTitle>
                    <CardDescription>Confiez vos fardeaux et vos espoirs. Votre communauté prie avec vous en esprit.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...requestForm}>
                        <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                            <FormField
                                control={requestForm.control}
                                name="request"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormControl>
                                        <Textarea
                                        placeholder="Seigneur, je te prie pour..."
                                        className="min-h-[120px]"
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSubmittingRequest} className="w-full">
                                {isSubmittingRequest ? (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                )}
                                Soumettre
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold font-headline mb-4 flex items-center gap-3"><HandHelping /> Vos Prières</h2>
            <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">En attente ({pendingPrayers.length})</TabsTrigger>
                    <TabsTrigger value="answered">Exaucées ({answeredPrayers.length})</TabsTrigger>
                    <TabsTrigger value="planner">Planificateur</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                    <Card>
                        <CardContent className="pt-6">
                            {isLoadingRequests ? (
                               <p className="text-center text-sm text-muted-foreground">Chargement...</p>
                            ) : pendingPrayers.length > 0 ? (
                                <div className="space-y-4">
                                    {pendingPrayers.map(p => (
                                        <div key={p.id} className="p-4 border rounded-md bg-secondary/50 flex justify-between items-start">
                                            <div>
                                                <p className="text-primary/90">{p.requestText}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Déposée le {p.creationDate?.toDate().toLocaleDateString('fr-FR')}</p>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button size="icon" variant="outline" onClick={() => markAsAnswered(p.id)} title="Marquer comme exaucée">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                </Button>
                                                <Button size="icon" variant="destructive" onClick={() => deletePrayer(p.id)} title="Supprimer">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-12">
                                    <p>Aucune prière en attente.</p>
                                    <p className="text-sm">Déposez un sujet de prière pour commencer.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="answered">
                    <Card>
                        <CardContent className="pt-6">
                             {isLoadingRequests ? (
                               <p className="text-center text-sm text-muted-foreground">Chargement...</p>
                            ) : answeredPrayers.length > 0 ? (
                                <div className="space-y-4">
                                    {answeredPrayers.map(p => (
                                        <div key={p.id} className="p-4 border rounded-md bg-green-500/10 flex justify-between items-start">
                                           <div>
                                                <p className="italic text-muted-foreground line-through">{p.requestText}</p>
                                                <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                                    <Sparkle className="h-3 w-3"/>
                                                    Exaucée le {p.answeredDate?.toDate().toLocaleDateString('fr-FR')}
                                                </p>
                                           </div>
                                            <Button size="icon" variant="ghost" onClick={() => deletePrayer(p.id)} title="Supprimer">
                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-12">
                                    <p>Aucune prière exaucée pour le moment.</p>
                                    <p className="text-sm">Continuez à persévérer dans la prière.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="planner">
                   <Card>
                       <CardHeader>
                          <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Plan de Prière</CardTitle>
                                <CardDescription>Organisez vos moments de prière quotidiens.</CardDescription>
                            </div>
                             <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un plan</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <Form {...planForm}>
                                    <form onSubmit={planForm.handleSubmit(onPlanSubmit)} className="space-y-6">
                                        <DialogHeader>
                                            <DialogTitle>Nouveau Plan de Prière</DialogTitle>
                                            <DialogDescription>Définissez un moment de prière récurrent.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <FormField control={planForm.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Titre</FormLabel><FormControl><Input placeholder="Prière du Matin" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={planForm.control} name="time" render={({ field }) => ( <FormItem><FormLabel>Heure</FormLabel><FormControl><Input placeholder="ex: 06:00" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={planForm.control} name="intention" render={({ field }) => ( <FormItem><FormLabel>Intention</FormLabel><FormControl><Textarea placeholder="Action de grâce, lecture de Proverbes..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
                                            <Button type="submit" disabled={isSubmittingPlan}>
                                            {isSubmittingPlan ? <LoaderCircle className="animate-spin mr-2"/> : <Send className="mr-2"/>}
                                            Enregistrer
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                          </div>
                       </CardHeader>
                       <CardContent>
                           {isLoadingPlans ? (
                              <p className="text-center text-sm text-muted-foreground">Chargement des plans...</p>
                           ) : prayerPlans && prayerPlans.length > 0 ? (
                               <div className="grid sm:grid-cols-2 gap-4">
                                   {prayerPlans.map(plan => (
                                       <Card key={plan.id} className="flex flex-col">
                                           <CardHeader>
                                                <CardTitle className="flex justify-between items-center text-lg">
                                                    {plan.title}
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deletePlan(plan.id)}>
                                                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </CardTitle>
                                               <p className="flex items-center text-sm text-muted-foreground pt-1"><Clock className="mr-2 h-4 w-4"/>{plan.time}</p>
                                           </CardHeader>
                                           <CardContent className="flex-1">
                                               <p className="text-sm">{plan.intention}</p>
                                           </CardContent>
                                       </Card>
                                   ))}
                               </div>
                           ) : (
                               <div className="text-center text-muted-foreground py-12">
                                   <p>Aucun plan de prière défini.</p>
                                   <p className="text-sm">Structurez votre journée en ajoutant un plan.</p>
                               </div>
                           )}
                       </CardContent>
                   </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}

    
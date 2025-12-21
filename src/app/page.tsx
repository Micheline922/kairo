
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Fingerprint, Feather, LoaderCircle, BookOpen, BookMarked, Cross, HelpCircle, School } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';
import { useAuth, useUser, initiateEmailSignIn, initiateAnonymousSignIn } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

const features = [
    { title: 'Journal Spirituel', description: 'Réfléchissez à votre marche.', icon: BookOpen },
    { title: 'La Parole Vivante', description: 'Lisez et recherchez la Bible.', icon: BookMarked },
    { title: 'Autel du Jeûne', description: 'Planifiez et suivez vos jeûnes.', icon: Cross },
    { title: 'Discerner la Volonté de Dieu', description: 'Cherchez des conseils pour vos décisions.', icon: HelpCircle },
    { title: 'L\'Académie', description: 'Vision biblique sur des sujets modernes.', icon: School },
];

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [email, setEmail] = useState('croyant@sanctuaire.app');
  const [password, setPassword] = useState('motdepasse123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      setTimeout(() => {
        router.push('/dashboard');
      }, 2500); // Wait for the welcome screen to be visible for a moment
    }
  }, [user, isUserLoading, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    initiateEmailSignIn(auth, email, password);
  };
  
  const handleAnonymousLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    initiateAnonymousSignIn(auth);
  }

  const loginImage = PlaceHolderImages.find(p => p.id === 'login-background');
  
  if (isUserLoading || user) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
        {loginImage && (
         <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            fill
            priority
            className="object-cover opacity-10"
            data-ai-hint={loginImage.imageHint}
          />
        )}
        <div className="z-10 flex flex-col items-center text-center animate-fade-in">
          <Logo />
          <p className="mt-4 max-w-md text-lg text-foreground/80 italic">
            "C'est le moment que Dieu a choisi pour nous parler ou pour agir. Ne laissons pas passer cette chance."
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden">
      {loginImage && (
         <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            fill
            priority
            className="object-cover opacity-20"
            data-ai-hint={loginImage.imageHint}
          />
      )}
      
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-2">
            <Feather className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">KAIRO</h1>
        </div>
      </div>

      <div className="z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl">
        <div className="text-foreground flex flex-col justify-center">
            <h2 className="text-5xl font-bold font-headline leading-tight text-center lg:text-left">Le meilleur endroit pour une foi éclairée.</h2>
            <p className="mt-4 text-lg text-foreground/80">KAIRO est une retraite spirituelle privée conçue pour vous aider à approfondir votre relation avec Dieu. Voici ce qui vous attend :</p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                           <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex items-center justify-center">
            <Card className="z-10 w-full bg-background/80 backdrop-blur-sm shadow-2xl">
                <form onSubmit={handleLogin}>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline">Entrez dans KAIRO</CardTitle>
                    <CardDescription>C'est le moment que Dieu a choisi pour vous parler ou pour agir.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="nom@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">
                        Votre journal est crypté et strictement privé.
                    </p>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoggingIn}>
                    {isLoggingIn ? <LoaderCircle className="animate-spin" /> : 'Se connecter avec un mot de passe'}
                    </Button>
                    <div className="flex items-center w-full">
                        <Separator className="flex-1" />
                        <span className="px-4 text-xs text-muted-foreground">OU</span>
                        <Separator className="flex-1" />
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleAnonymousLogin} disabled={isLoggingIn}>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    Se connecter avec la biométrie
                    </Button>
                </CardFooter>
                </form>
            </Card>
        </div>
      </div>

      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground z-10">
        <p>Avec tout mon cœur, Micheline Ntale</p>
      </footer>
    </div>
  );
}

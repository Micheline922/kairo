'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Fingerprint, Feather, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';
import { useAuth, useUser, initiateEmailSignIn, initiateAnonymousSignIn } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

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
      router.push('/dashboard');
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
      <div className="flex min-h-screen flex-col items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Chargement de votre KAIRO...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
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
      <Card className="z-10 w-full max-w-md bg-background/80 backdrop-blur-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Entrez dans KAIRO</CardTitle>
            <CardDescription>C'est le moment que Dieu a choisi pour nous parler ou pour agir.</CardDescription>
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
      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground z-10">
        <p>&copy; {new Date().getFullYear()} KAIRO. Chaque interaction devrait ressembler à une prière.</p>
      </footer>
    </div>
  );
}

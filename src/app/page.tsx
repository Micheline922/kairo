
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Feather, LoaderCircle, BookOpen, BookMarked, Cross, HelpCircle, School } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useUser, initiateEmailSignIn } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { useLanguage } from '@/context/language-provider';
import { translations } from '@/lib/translations';

const features = [
    { title: 'journalTitle', description: 'journalDescription', icon: BookOpen },
    { title: 'bibleTitle', description: 'selectToSave', icon: BookMarked },
    { title: 'fastingAltar', description: 'fastingDescription', icon: Cross },
    { title: 'discernTitle', description: 'discernDescription', icon: HelpCircle },
    { title: 'academyTitle', description: 'academyDescription', icon: School },
];

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [email, setEmail] = useState('croyant@sanctuaire.app');
  const [password, setPassword] = useState('motdepasse123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

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
            "{t.loginSubTitle}"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden pb-16">
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
         <Logo />
      </div>

      <div className="z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl">
        <div className="text-foreground flex flex-col justify-center">
            <h2 className="text-5xl font-bold font-headline leading-tight text-center lg:text-left">{t.loginWelcome}</h2>
            <p className="mt-4 text-lg text-foreground/80">{t.loginDescription}</p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                           <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{t[feature.title as keyof typeof t]}</h3>
                            <p className="text-sm text-muted-foreground">{t[feature.description as keyof typeof t]}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex items-center justify-center w-full">
            <Card className="z-10 w-full bg-background/80 backdrop-blur-sm shadow-2xl">
                <form onSubmit={handleLogin}>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline">{t.loginEnter}</CardTitle>
                    <CardDescription>{t.loginSubTitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="email">{t.email}</Label>
                    <Input id="email" type="email" placeholder="nom@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="password">{t.password}</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">
                        {t.loginPrivacy}
                    </p>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoggingIn}>
                    {isLoggingIn ? <LoaderCircle className="animate-spin" /> : t.loginWithPassword}
                    </Button>
                </CardFooter>
                </form>
            </Card>
        </div>
      </div>

      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground z-10 w-full pb-4">
        <p>{t.loginFooter}</p>
      </footer>
    </div>
  );
}

    
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Fingerprint, Feather } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  const loginImage = PlaceHolderImages.find(p => p.id === 'login-background');

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {loginImage && (
         <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            fill
            className="object-cover opacity-20"
            data-ai-hint={loginImage.imageHint}
          />
      )}
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-2">
            <Feather className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Sanctuary</h1>
        </div>
      </div>
      <Card className="z-10 w-full max-w-md bg-background/80 backdrop-blur-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Enter the Sanctuary</CardTitle>
            <CardDescription>A private spiritual retreat in your pocket.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@email.com" defaultValue="believer@sanctuary.app" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" defaultValue="password123" />
            </div>
             <p className="text-xs text-muted-foreground pt-2">
                Your journal is encrypted and strictly private. 
            </p>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full">
              Login with Password
            </Button>
            <div className="flex items-center w-full">
                <Separator className="flex-1" />
                <span className="px-4 text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
            </div>
             <Button variant="outline" className="w-full" onClick={handleLogin}>
              <Fingerprint className="mr-2 h-4 w-4" />
              Sign in with Biometrics
            </Button>
          </CardFooter>
        </form>
      </Card>
      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground z-10">
        <p>&copy; {new Date().getFullYear()} Sanctuary. Every interaction should feel like a prayer.</p>
      </footer>
    </div>
  );
}

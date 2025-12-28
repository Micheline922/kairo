'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .catch((error) => {
       toast({
         variant: "destructive",
         title: "Erreur d'inscription",
         description: "Impossible de créer un compte. L'email est peut-être déjà utilisé.",
       });
       console.error('Sign-up error:', error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch((error) => {
      // Create a new account ONLY if the user does not exist.
      if (error.code === 'auth/user-not-found') {
        initiateEmailSignUp(authInstance, email, password);
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        // Handle incorrect password or other invalid credential errors without trying to sign up.
        toast({
            variant: "destructive",
            title: "Échec de la connexion",
            description: "L'adresse e-mail ou le mot de passe est incorrect.",
        });
        console.error('Sign-in error:', error);
      } else {
        // Handle other errors.
         toast({
            variant: "destructive",
            title: "Erreur de connexion",
            description: "Une erreur inattendue est survenue.",
        });
        console.error('Sign-in error:', error);
      }
    });
}


'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, BookMarked, Cross, School, HelpCircle, HandHelping, HeartPulse, PenSquare } from 'lucide-react';
import { useLanguage } from '@/context/language-provider';
import { translations } from '@/lib/translations';
import { dailyVerses } from '@/lib/daily-verses';
import { useState, useEffect } from 'react';

const quickLinks = [
    { title: 'journalTitle', description: 'journalDescription', href: '/journal', icon: BookOpen },
    { title: 'bibleTitle', description: 'selectToSave', href: '/bible', icon: BookMarked },
    { title: 'fastingAltar', description: 'fastingDescription', href: '/fasting', icon: Cross },
    { title: 'discernTitle', description: 'discernDescription', href: '/discern', icon: HelpCircle },
    { title: 'academyTitle', description: 'academyDescription', href: '/academy', icon: School },
    { title: 'prayerWallTitle', description: 'postPrayerDescription', href: '/prayer-wall', icon: HandHelping },
    { title: 'meditationsTitle', description: 'meditationsDescription', href: '/meditations', icon: HeartPulse },
    { title: 'articlesBank.title', description: 'articlesBank.description', href: '/writing-sanctuary', icon: PenSquare },
];

type Verse = {
  fr: string;
  en: string;
  es: string;
  pt: string;
  sw: string;
  reference: string;
};

export default function DashboardPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [verse, setVerse] = useState<Verse | null>(null);

  useEffect(() => {
    // This check avoids hydration errors by running client-side only
    setVerse(dailyVerses[Math.floor(Math.random() * dailyVerses.length)]);
  }, []);

  // Helper to access nested translation keys safely
  const getTranslation = (key: string): string => {
    const keys = key.split('.');
    let result: any = t;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return the key itself if path is invalid
      }
    }
    return typeof result === 'string' ? result : key;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline">{t.welcomeMessage}</h1>
        <p className="text-md sm:text-lg text-muted-foreground mt-2">
          {t.welcomeSubMessage}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-12 lg:col-span-7 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">{t.verseOfTheDay}</CardTitle>
          </CardHeader>
          <CardContent>
            {verse ? (
              <>
                <blockquote className="text-lg sm:text-xl italic border-l-4 border-accent pl-4">
                  <p>"{verse[language]}"</p>
                </blockquote>
                <p className="text-right mt-2 font-semibold text-primary/80">{verse.reference}</p>
              </>
            ) : (
              <p>{t.loading}...</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-12 lg:col-span-5">
           <CardHeader>
            <CardTitle>{t.currentFast}</CardTitle>
            <CardDescription>{t.fastingDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
                <p>{t.noActiveFast}</p>
                <Button variant="link" asChild className="text-primary">
                    <Link href="/fasting">{t.planNewFast}</Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold font-headline mb-6">{t.exploreKairo}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quickLinks.map(link => (
              <Card key={link.href} className="flex flex-col">
                <CardHeader className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <link.icon className="h-5 w-5 text-primary" />
                    {getTranslation(link.title)}
                  </CardTitle>
                  <CardDescription>{getTranslation(link.description)}</CardDescription>
                </CardHeader>
                <CardContent>
                   <Button asChild variant="outline" className="w-full">
                     <Link href={link.href}>
                       {t.open} <ArrowRight className="ml-2 h-4 w-4" />
                     </Link>
                   </Button>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
}

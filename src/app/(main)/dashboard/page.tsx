import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Bible, Cross, School, HelpCircle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const quickLinks = [
    { title: 'Spiritual Journal', description: 'Reflect on your walk.', href: '/journal', icon: BookOpen, imageId: 'journal-card' },
    { title: 'The Living Word', description: 'Read and search the Bible.', href: '/bible', icon: Bible, imageId: 'bible-card' },
    { title: 'Fasting Altar', description: 'Plan and track your fasts.', href: '/fasting', icon: Cross, imageId: 'fasting-card' },
    { title: 'Discern God\'s Will', description: 'Seek guidance for decisions.', href: '/discern', icon: HelpCircle, imageId: 'discern-card' },
    { title: 'The Academy', description: 'Biblical view on modern topics.', href: '/academy', icon: School, imageId: 'academy-card' },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Welcome to your Sanctuary</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Your private spiritual retreat. Find peace and guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-12 lg:col-span-7 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Verse of the Day</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-xl italic border-l-4 border-accent pl-4">
              <p>"For I know the plans I have for you,” declares the LORD, “plans to prosper you and not to harm you, plans to give you hope and a future."</p>
            </blockquote>
            <p className="text-right mt-2 font-semibold text-primary/80">Jeremiah 29:11</p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-12 lg:col-span-5">
           <CardHeader>
            <CardTitle>Ongoing Fast</CardTitle>
            <CardDescription>Your current commitment.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
                <p>No active fast. Ready to begin?</p>
                <Button variant="link" asChild className="text-primary">
                    <Link href="/fasting">Plan a new fast</Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold font-headline mb-6">Explore Your Sanctuary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map(link => {
            const image = PlaceHolderImages.find(p => p.id === link.imageId);
            return (
              <Card key={link.href} className="overflow-hidden group">
                 {image && (
                  <div className="overflow-hidden h-40 relative">
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={image.imageHint}
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <link.icon className="h-5 w-5 text-primary" />
                    {link.title}
                  </CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
                <CardContent>
                   <Button asChild variant="outline" className="w-full">
                     <Link href={link.href}>
                       Open <ArrowRight className="ml-2 h-4 w-4" />
                     </Link>
                   </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  );
}

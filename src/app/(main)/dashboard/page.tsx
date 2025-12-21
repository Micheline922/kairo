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
import { ArrowRight, BookOpen, BookMarked, Cross, School, HelpCircle, HandHelping } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const quickLinks = [
    { title: 'Journal Spirituel', description: 'Réfléchissez à votre marche.', href: '/journal', icon: BookOpen, imageId: 'journal-card' },
    { title: 'Bible', description: 'Lisez et recherchez les Écritures.', href: '/bible', icon: BookMarked, imageId: 'bible-card' },
    { title: 'Autel du Jeûne', description: 'Planifiez et suivez vos jeûnes.', href: '/fasting', icon: Cross, imageId: 'fasting-card' },
    { title: 'Discerner la Volonté de Dieu', description: 'Cherchez des conseils pour vos décisions.', href: '/discern', icon: HelpCircle, imageId: 'discern-card' },
    { title: 'L\'Académie', description: 'Vision biblique sur des sujets modernes.', href: '/academy', icon: School, imageId: 'academy-card' },
    { title: 'Mur de Prière', description: 'Déposez et suivez vos prières.', href: '/prayer-wall', icon: HandHelping, imageId: 'prayer-wall-card' },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Bienvenue dans KAIRO</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Votre retraite spirituelle privée. Trouvez la paix et la guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-12 lg:col-span-7 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Verset du Jour</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-xl italic border-l-4 border-accent pl-4">
              <p>"Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance."</p>
            </blockquote>
            <p className="text-right mt-2 font-semibold text-primary/80">Jérémie 29:11</p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-12 lg:col-span-5">
           <CardHeader>
            <CardTitle>Jeûne en cours</CardTitle>
            <CardDescription>Votre engagement actuel.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
                <p>Aucun jeûne actif. Prêt à commencer ?</p>
                <Button variant="link" asChild className="text-primary">
                    <Link href="/fasting">Planifier un nouveau jeûne</Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold font-headline mb-6">Explorez KAIRO</h2>
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
                       Ouvrir <ArrowRight className="ml-2 h-4 w-4" />
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

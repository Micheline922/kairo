'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  BookMarked,
  Cross,
  HelpCircle,
  School,
  HandHelping,
  HeartPulse,
  PenSquare,
} from 'lucide-react';
import { useLanguage } from '@/context/language-provider';

import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navLabels = {
  en: {
    dashboard: 'Dashboard',
    journal: 'Spiritual Journal',
    bible: 'Bible',
    fasting: 'Fasting Altar',
    discern: 'Discern God\'s Will',
    academy: 'The Academy',
    prayerWall: 'Prayer Wall',
    meditations: 'Meditations',
    writingSanctuary: 'Writing Sanctuary',
  },
  fr: {
    dashboard: 'Tableau de bord',
    journal: 'Journal Spirituel',
    bible: 'Bible',
    fasting: 'Autel du Jeûne',
    discern: 'Discerner la Volonté de Dieu',
    academy: 'L\'Académie',
    prayerWall: 'Mur de Prière',
    meditations: 'Méditations',
    writingSanctuary: 'Sanctuaire de l\'Écriture',
  },
  es: {
    dashboard: 'Tablero',
    journal: 'Diario Espiritual',
    bible: 'Biblia',
    fasting: 'Altar de Ayuno',
    discern: 'Discernir la Voluntad de Dios',
    academy: 'La Academia',
    prayerWall: 'Muro de Oración',
    meditations: 'Meditaciones',
    writingSanctuary: 'Santuario de Escritura',
  },
  pt: {
    dashboard: 'Painel',
    journal: 'Diário Espiritual',
    bible: 'Bíblia',
    fasting: 'Altar de Jejum',
    discern: 'Discernir a Vontade de Deus',
    academy: 'A Academia',
    prayerWall: 'Mural de Oração',
    meditations: 'Meditações',
    writingSanctuary: 'Santuário da Escrita',
  },
  sw: {
    dashboard: 'Dashibodi',
    journal: 'Shajara ya Kiroho',
    bible: 'Biblia',
    fasting: 'Madhabahu ya Kufunga',
    discern: 'Kutambua Mapenzi ya Mungu',
    academy: 'Chuo',
    prayerWall: 'Ukuta wa Maombi',
    meditations: 'Tafakari',
    writingSanctuary: 'Patakatifu pa Kuandika',
  },
};

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/journal', icon: BookOpen, labelKey: 'journal' },
  { href: '/bible', icon: BookMarked, labelKey: 'bible' },
  { href: '/fasting', icon: Cross, labelKey: 'fasting' },
  { href: '/discern', icon: HelpCircle, labelKey: 'discern' },
  { href: '/academy', icon: School, labelKey: 'academy' },
  { href: '/prayer-wall', icon: HandHelping, labelKey: 'prayerWall' },
  { href: '/meditations', icon: HeartPulse, labelKey: 'meditations' },
  { href: '/writing-sanctuary', icon: PenSquare, labelKey: 'writingSanctuary' },
];

export function MainNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const labels = navLabels[language as keyof typeof navLabels] || navLabels.fr;

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const label = labels[item.labelKey as keyof typeof labels];
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={cn(
                  'justify-start',
                  pathname === item.href && 'font-bold text-sidebar-accent-foreground'
                )}
                tooltip={label}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

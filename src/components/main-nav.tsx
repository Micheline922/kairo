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
    bible: 'The Living Word',
    fasting: 'Fasting Altar',
    discern: 'Discern God\'s Will',
    academy: 'The Academy',
  },
  fr: {
    dashboard: 'Tableau de bord',
    journal: 'Journal Spirituel',
    bible: 'La Parole Vivante',
    fasting: 'Autel du Jeûne',
    discern: 'Discerner la Volonté de Dieu',
    academy: 'L\'Académie',
  },
  es: {
    dashboard: 'Tablero',
    journal: 'Diario Espiritual',
    bible: 'La Palabra Viva',
    fasting: 'Altar de Ayuno',
    discern: 'Discernir la Voluntad de Dios',
    academy: 'La Academia',
  },
  pt: {
    dashboard: 'Painel',
    journal: 'Diário Espiritual',
    bible: 'A Palavra Viva',
    fasting: 'Altar de Jejum',
    discern: 'Discernir a Vontade de Deus',
    academy: 'A Academia',
  },
  sw: {
    dashboard: 'Dashibodi',
    journal: 'Shajara ya Kiroho',
    bible: 'Neno Lililo Hai',
    fasting: 'Madhabahu ya Kufunga',
    discern: 'Kutambua Mapenzi ya Mungu',
    academy: 'Chuo',
  },
};

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/journal', icon: BookOpen, labelKey: 'journal' },
  { href: '/bible', icon: BookMarked, labelKey: 'bible' },
  { href: '/fasting', icon: Cross, labelKey: 'fasting' },
  { href: '/discern', icon: HelpCircle, labelKey: 'discern' },
  { href: '/academy', icon: School, labelKey: 'academy' },
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

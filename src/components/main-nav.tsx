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

import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/journal', icon: BookOpen, label: 'Journal Spirituel' },
  { href: '/bible', icon: BookMarked, label: 'La Parole Vivante' },
  { href: '/fasting', icon: Cross, label: 'Autel du Jeûne' },
  { href: '/discern', icon: HelpCircle, label: 'Discerner la Volonté de Dieu' },
  { href: '/academy', icon: School, label: 'L\'Académie' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              className={cn(
                'justify-start',
                pathname === item.href && 'font-bold text-sidebar-accent-foreground'
              )}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}


'use client';

import { useLanguage } from '@/context/language-provider';
import { translations } from '@/lib/translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title={t.language}>
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t.language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('en')}>
          <span>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('fr')}>
          <span>Français</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('es')}>
          <span>Español</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('pt')}>
          <span>Português</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('sw')}>
          <span>Swahili</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

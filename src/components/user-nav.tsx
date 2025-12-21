'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon, Moon, Sun, Monitor, MoreVertical, Globe } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';

export function UserNav() {
  const { state } = useSidebar();
  const auth = useAuth();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    signOut(auth);
  };
  
  const displayName = user?.isAnonymous ? 'Utilisateur Anonyme' : user?.displayName || user?.email || 'Utilisateur';
  const email = user?.isAnonymous ? 'Connecté anonymement' : user?.email || '';
  const fallback = displayName?.charAt(0).toUpperCase() || 'U';


  if (state === 'collapsed') {
    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
           <Button variant="ghost" size="icon" className="!size-10 rounded-full">
            <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} alt={displayName} />
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
           </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <Globe className="mr-2 h-4 w-4" />
                    <span>Langue</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem><span>English</span></DropdownMenuItem>
                        <DropdownMenuItem><span>Français</span></DropdownMenuItem>
                        <DropdownMenuItem><span>Español</span></DropdownMenuItem>
                        <DropdownMenuItem><span>Português</span></DropdownMenuItem>
                        <DropdownMenuItem><span>Swahili</span></DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span>Thème</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme('light')}>
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Clair</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('dark')}>
                            <Moon className="mr-2 h-4 w-4" />
                            <span>Sombre</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('system')}>
                            <Monitor className="mr-2 h-4 w-4" />
                            <span>Système</span>
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
           <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-md p-2">
      <Avatar className="h-9 w-9">
        <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} alt={displayName} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col overflow-hidden">
        <span className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</span>
        <span className="text-xs text-muted-foreground truncate">{email}</span>
      </div>
       <div className="ml-auto flex items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Changer le thème</span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Globe className="mr-2 h-4 w-4" />
                            <span>Langue</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem><span>English</span></DropdownMenuItem>
                                <DropdownMenuItem><span>Français</span></DropdownMenuItem>
                                <DropdownMenuItem><span>Español</span></DropdownMenuItem>
                                <DropdownMenuItem><span>Português</span></DropdownMenuItem>
                                <DropdownMenuItem><span>Swahili</span></DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span>Thème</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => setTheme('light')}>
                                    <Sun className="mr-2 h-4 w-4" />
                                    <span>Clair</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme('dark')}>
                                    <Moon className="mr-2 h-4 w-4" />
                                    <span>Sombre</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme('system')}>
                                    <Monitor className="mr-2 h-4 w-4" />
                                    <span>Système</span>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
       </div>
    </div>
  );
}

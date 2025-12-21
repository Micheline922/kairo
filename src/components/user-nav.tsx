'use client'

import Link from 'next/link';
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
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

export function UserNav() {
  const { state } = useSidebar();

  if (state === 'collapsed') {
    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
           <Button variant="ghost" size="icon" className="!size-10 rounded-full">
            <Avatar className="h-8 w-8">
                <AvatarImage src="https://picsum.photos/seed/avatar/40/40" alt="Utilisateur" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
           </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Croyant</p>
              <p className="text-xs leading-none text-muted-foreground">
                croyant@sanctuaire.app
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
           <Link href="/" legacyBehavior passHref>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-md p-2">
      <Avatar className="h-9 w-9">
        <AvatarImage src="https://picsum.photos/seed/avatar/40/40" alt="Utilisateur" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-sidebar-foreground">Croyant</span>
        <span className="text-xs text-muted-foreground">croyant@sanctuaire.app</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
           <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
            <LogOut className="h-4 w-4" />
           </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
           <Link href="/" legacyBehavior passHref>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

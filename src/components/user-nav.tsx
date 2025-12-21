
'use client';

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
import { LogOut, User as UserIcon, MoreVertical } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useLanguage } from '@/context/language-provider';
import { translations } from '@/lib/translations';

export function UserNav() {
  const { state } = useSidebar();
  const auth = useAuth();
  const { user } = useUser();
  const { language } = useLanguage();
  const t = translations[language];

  const handleLogout = () => {
    signOut(auth);
  };
  
  const displayName = user?.isAnonymous ? t.anonymousUser : user?.displayName || user?.email || 'User';
  const email = user?.isAnonymous ? t.anonymouslyLoggedIn : user?.email || '';
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
              <span>{t.profile}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
           <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t.logout}</span>
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel>{t.myAccount}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>{t.profile}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t.logout}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
       </div>
    </div>
  );
}

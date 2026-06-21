import React from 'react';
import { Menu, Bell, ChevronDown, Award } from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function DashboardTopNav({ onMenuToggle }) {
    const mockUser = {
        firstName: 'Themba',
        lastName: 'Ntimane',
        role: 'borrower',
        creditGrade: 'A',
        creditScore: 710,
    };

    return (
        <header className="sticky top-0 z-30 w-full h-16 border-b border-border/40 bg-background/60 backdrop-blur-md flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onMenuToggle}
                    aria-label="Open sidebar"
                >
                    <Menu className="h-5 w-5" />
                </Button>
                <div >
                    <p className=" justify-items-start justify-content-start text-sm font-bold tracking-tight md:text-base pr-7">
                        Good Day, {mockUser.firstName} 👋
                    </p>
                    <p className="hidden sm:block text-[11px] text-muted-foreground font-medium ">
                        Welcome to your MoneyCircle workspace.
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
             
          {/*      <div className="hidden md:flex items-center gap-2 rounded-full border border-border/40 bg-muted/40 px-3 py-1 text-xs font-semibold backdrop-blur-sm">*/}
          {/*          <Award className="h-3.5 w-3.5 text-emerald-500" />*/}
          {/*          <span>*/}
          {/*  Score: <span className="text-emerald-500">{mockUser.creditScore}</span>*/}
          {/*</span>*/}
          {/*          <span className="text-muted-foreground/40">|</span>*/}
          {/*          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">*/}
          {/*              Grade {mockUser.creditGrade}*/}
          {/*          </Badge>*/}
          {/*      </div>*/}

            
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notifications"
                >
                    <Bell className="h-[1.1rem] w-[1.1rem]" />
                    <span className="absolute top-1 right-2 flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                </Button>

                {/* Profile dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-auto p-1.5 pr-2.5 gap-2">
                            <Avatar className="h-7 w-7 rounded-lg ">
                                <AvatarFallback className="text-[11px] font-bold">
                                    {mockUser.firstName[0]}
                                    {mockUser.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
              {/*              <span className="hidden sm:block font-medium text-xs">*/}
              {/*  {mockUser.firstName}*/}
              {/*</span>*/}
              {/*              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />*/}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>
                            <p className="font-bold text-xs">
                                {mockUser.firstName} {mockUser.lastName}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                {mockUser.role}
                            </p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs">
                            View Profile Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs text-destructive">
                            Sign Out Session
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
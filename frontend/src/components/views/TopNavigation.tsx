import { Menu, Bell } from 'lucide-react';
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardTopNavProps {
    onMenuToggle: () => void;
}

export default function DashboardTopNav({ onMenuToggle }: DashboardTopNavProps) {
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
                <div>
                    <p className="text-sm font-bold tracking-tight md:text-base pr-7">
                        Good Day, {mockUser.firstName} 👋
                    </p>
                    <p className="hidden sm:block text-[11px] text-muted-foreground font-medium">
                        Welcome to your MoneyCircle workspace.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notifications"
                >
                    <Bell className="h-[1.1rem] w-[1.1rem]" />
                    <span className="absolute top-1 right-2 flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-auto p-1.5 pr-2.5 gap-2">
                            <Avatar className="h-7 w-7 rounded-lg">
                                <AvatarFallback className="text-[11px] font-bold">
                                    {mockUser.firstName[0]}{mockUser.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
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
                        <DropdownMenuItem className="text-xs">View Profile Settings</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs text-destructive">Sign Out Session</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
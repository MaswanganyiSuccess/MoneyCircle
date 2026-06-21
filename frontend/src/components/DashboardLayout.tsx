import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    CreditCard,
    Sparkles,
    TrendingUp,
    Wallet,
    Users,
    BadgeHelp
} from 'lucide-react';
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton
} from '@/components/ui/sidebar';
import DashboardTopNav from "@/components/views/TopNavigation.tsx";

export default function DashboardLayout({ children }) {
    const location = useLocation();
    const navigationLinks = [
        // Global View Layouts
        { name: 'Overview Hub', path: '/dashboard', icon: LayoutDashboard, role: 'all' },

        // Borrower Exclusive Action Workflow items
        { name: 'Apply for Loan', path: '/dashboard/apply', icon: FileText, role: 'borrower' },
        { name: 'My Repayments', path: '/dashboard/repayments', icon: CreditCard, role: 'borrower' },

        // Lender / Investor Exclusive Action Workflow items
        { name: 'Browse Loans', path: '/dashboard/marketplace', icon: TrendingUp, role: 'lender' },
        { name: 'Wallet Deposits', path: '/dashboard/wallet', icon: Wallet, role: 'lender' },
        { name: 'Auto-Invest Engine', path: '/dashboard/auto-invest', icon: Sparkles, role: 'lender' },

        // Shared Utilities
        { name: 'P2P Community', path: '/dashboard/investors', icon: Users, role: 'all' },
        { name: 'Rules & FAQ', path: '/dashboard/faq', icon: BadgeHelp, role: 'all' },
    ];
    const activeUserRole = 'borrower';

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex">
                <Sidebar collapsible="icon" className="border-r border-border/30 bg-background/50 backdrop-blur-xl">

                    {/* Consistent Height Brand Branding Wrapper */}
                    <SidebarHeader className="h-16 flex flex-row items-center px-6 border-b border-border/40 gap-3">
                        <img
                            src="/logos/moneycircle-logo.svg"
                            alt="MoneyCircle"
                            className="h-7 w-auto object-contain block dark:hidden"
                        />
                        <img
                            src="/logos/moneycircle-logo-dark.svg"
                            alt="MoneyCircle"
                            className="h-7 w-auto object-contain hidden dark:block"
                        />
                    </SidebarHeader>
                    <SidebarContent className="p-3">
                        <SidebarMenu className="space-y-1">
                            {navigationLinks
                                .filter(item => item.role === 'all' || item.role === activeUserRole)
                                .map((link) => {
                                    const IconComponent = link.icon;
                                    const isCurrentRouteActive = location.pathname === link.path;

                                    return (
                                        <SidebarMenuItem key={link.name}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isCurrentRouteActive}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 h-10 rounded-xl font-medium text-xs transition-all duration-200 select-none
                                                    ${isCurrentRouteActive
                                                    ? 'bg-primary text-primary-foreground shadow-md font-bold scale-[1.01]'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                                                }`}
                                            >
                                                <Link to={link.path}>
                                                    <IconComponent className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isCurrentRouteActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                                    <span className="truncate tracking-wide">{link.name}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <DashboardTopNav onMenuToggle={true} />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/20 dark:bg-muted/5">
                        <div className="mx-auto max-w-6xl animate-fade-in">
                            {children}
                        </div>
                    </main>

                </div>
            </div>
        </SidebarProvider>
    );
}

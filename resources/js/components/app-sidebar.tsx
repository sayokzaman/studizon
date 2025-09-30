import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CoinsIcon, LayoutGrid, LibraryBig, UserPlus2Icon } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Classroom',
        href: '/classroom',
        icon: LibraryBig,
    },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: Folder,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    const { state } = useSidebar();
    const { auth } = usePage<SharedData>().props;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <div
                    className={cn(
                        'mb-4 flex w-full flex-col items-center justify-center gap-4 transition-all duration-300 ease-in-out',
                        state === 'expanded' ? 'px-2' : '',
                    )}
                >
                    <div
                        className={cn(
                            'relative flex w-full items-center gap-2',
                            state === 'collapsed' ? 'justify-center' : '',
                        )}
                    >
                        <UserPlus2Icon className="h-5 w-5 text-primary/80" />
                        <span
                            className={cn(
                                'text-[10px] font-semibold transition-all duration-300 ease-in-out w-12 text-center',
                                state === 'collapsed'
                                    ? 'absolute -top-2 -right-1/2 translate-x-1/2 rounded-full border border-primary bg-background px-1.5 py-0.5 text-white'
                                    : '',
                            )}
                        >
                            20k+
                        </span>
                    </div>

                    <div
                        className={cn(
                            'relative flex w-full items-center gap-2',
                            state === 'collapsed' ? 'justify-center' : '',
                        )}
                    >
                        <CoinsIcon className="h-5 w-5 text-yellow-400" />
                        <span
                            className={cn(
                                'text-[10px] font-semibold transition-all duration-300 ease-in-out w-12 text-center',
                                state === 'collapsed'
                                    ? 'absolute -top-2 -right-1/2 translate-x-1/2 rounded-full border border-yellow-400 bg-background px-1.5 py-0.5 text-white'
                                    : '',
                            )}
                        >
                            {auth.user.credit}
                        </span>
                    </div>
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

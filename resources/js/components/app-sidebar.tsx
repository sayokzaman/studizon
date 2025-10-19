import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import NotificationDialog from '@/components/notifications-dialog';
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
import type { Notification } from '@/types/notification';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    CoinsIcon,
    LayoutGrid,
    LibraryBig,
    SquarePlay,
    UserRoundPlusIcon,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
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
    {
        title: 'Shorts',
        href: '/shorts',
        icon: SquarePlay,
    },
    {
        title: 'People',
        href: '/people',
        icon: Users,
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

    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get<{
                    notifications: Notification[];
                }>(route('notifications.index'));
                setNotifications(response.data.notifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, []);

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
                        'flex items-center justify-center pb-4 text-xs text-muted-foreground',
                        state === 'collapsed'
                            ? 'flex-col gap-3'
                            : 'overflow-hidden',
                    )}
                >
                    <div className="relative flex items-center gap-1">
                        <UserRoundPlusIcon className="h-4 w-4" />
                        <span
                            className={
                                state === 'collapsed'
                                    ? 'absolute -top-2.5 -right-1/2 flex h-4 translate-x-1/2 items-center justify-center rounded-full bg-blue-500 px-1 font-semibold text-white'
                                    : ''
                            }
                        >
                            {auth.user.follower_count ?? 0}
                            {state !== 'collapsed' && ' Followers'}
                        </span>
                    </div>
                    <span className="mx-2 text-[4px]">⬤</span>
                    <div className="relative flex items-center gap-1">
                        <CoinsIcon className="h-4 w-4" />
                        <span
                            className={
                                state === 'collapsed'
                                    ? 'absolute -top-2.5 -right-1/2 flex h-4 translate-x-1/2 items-center justify-center rounded-full bg-yellow-600 px-1 font-semibold text-white'
                                    : ''
                            }
                        >
                            {auth.user.credits ?? 0}
                            {state !== 'collapsed' && ' Followers'}
                        </span>
                    </div>
                </div>
                <NotificationDialog notifications={notifications} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

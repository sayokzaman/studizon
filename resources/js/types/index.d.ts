import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    department_id: number | null;
    credits: number;
    email: string;
    profile_picture?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    courses?: Course[];
    program?: Program;
    department?: Department;
    classrooms?: Classroom[];
    classrooms_count?: number;
    shorts?: Short[];
    shorts_count?: number;
    followers?: User[];
    follower_count?: number;
    following?: User[];
    following_count?: number;
    ratings?: Rating[];
    rating: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

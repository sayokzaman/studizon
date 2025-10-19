import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// utils/date.ts
export const parseBDLocalTime = (utcString?: string) => {
    if (!utcString) return null;
    const date = new Date(utcString);
    // Add 6 hours for Bangladesh
    return new Date(date.getTime() + 6 * 60 * 60 * 1000);
};

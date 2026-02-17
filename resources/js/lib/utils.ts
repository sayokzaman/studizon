import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const DEFAULT_AVATAR_URL = 'https://avatar.iran.liara.run/public';
const DEFAULT_CLASSROOM_THUMBNAILS = [
    'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1184572/pexels-photo-1184572.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/5905445/pexels-photo-5905445.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/6238120/pexels-photo-6238120.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/5428263/pexels-photo-5428263.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

export function resolveProfilePictureUrl(profilePicture?: string | null): string {
    if (!profilePicture) return DEFAULT_AVATAR_URL;

    const value = profilePicture.trim();
    if (!value) return DEFAULT_AVATAR_URL;

    if (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('data:') ||
        value.startsWith('blob:')
    ) {
        return value;
    }

    if (value.startsWith('/storage/')) {
        return value;
    }

    if (value.startsWith('storage/')) {
        return `/${value}`;
    }

    if (value.startsWith('/')) {
        return value;
    }

    return `/storage/${value}`;
}

const hashSeed = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return hash;
};

const resolveDefaultClassroomThumbnail = (seed?: string | number | null) => {
    if (seed === undefined || seed === null) {
        return DEFAULT_CLASSROOM_THUMBNAILS[0];
    }

    const index =
        hashSeed(String(seed)) % DEFAULT_CLASSROOM_THUMBNAILS.length;
    return DEFAULT_CLASSROOM_THUMBNAILS[index];
};

export function resolveClassroomThumbnailUrl(
    thumbnailPath?: string | null,
    seed?: string | number | null,
): string {
    if (!thumbnailPath) return resolveDefaultClassroomThumbnail(seed);

    const value = thumbnailPath.trim();
    if (!value) return resolveDefaultClassroomThumbnail(seed);

    if (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('data:') ||
        value.startsWith('blob:')
    ) {
        return value;
    }

    if (value.startsWith('/storage/')) {
        return value;
    }

    if (value.startsWith('storage/')) {
        return `/${value}`;
    }

    if (value.startsWith('/')) {
        return value;
    }

    return `/storage/${value}`;
}

// utils/date.ts
export const parseBDLocalTime = (utcString?: string) => {
    if (!utcString) return null;
    const date = new Date(utcString);
    // Add 6 hours for Bangladesh
    return new Date(date.getTime() + 6 * 60 * 60 * 1000);
};

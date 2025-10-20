import { User } from '@/types';

export type Note = {
    id: number;
    course_id: number;
    user_id: number;
    description: string;
    author: User;
    course?: {
        id: number;
        title: string;
    };
    attachments?: {
        id: number;
        note_id: number;
        file_name: string;
        file_type: string;
        file_size: number;
        file_path: string;
    }[];
    likes_count: number;
    liked_by_user?: boolean;
    comments_count?: number;
    created_at: string;
};

import { User } from '@/types';
import { Course } from '@/types/course';

export interface ClassRoom {
    id: number;
    course_id: number | null;
    teacher_id: number;
    topic: string;
    room_name: string;
    is_live: boolean;
    record: boolean;
    join_link: string;
    description: string | null;
    status: string;
    thumbnail_path: string | null;
    cost: number;
    capacity: number;
    capacity_filled?: number;
    scheduled_date: string; // ISO date string
    start_time: string; // ISO time string
    end_time: string; // ISO time string
    starts_at?: string; // ISO datetime
    ends_at?: string; // ISO datetime
    created_at: string; // ISO date-time string
    updated_at: string; // ISO date-time string
    course?: Course;
    teacher?: User;
    students?: User[];
}

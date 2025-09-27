import { User } from '@/types'
import { Course } from '@/types/course'

export interface ClassRoom {
    id: number;
    course_id: number | null;
    teacher_id: number;
    topic: string;
    description: string | null;
    thumbnail_path: string | null;
    cost: number;
    capacity: number;
    scheduled_date: string; // ISO date string
    start_time: string; // ISO time string
    end_time: string; // ISO time string
    created_at: string; // ISO date-time string
    updated_at: string; // ISO date-time string
    course?: Course
    teacher?: User
}

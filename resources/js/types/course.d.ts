import { Program } from '@/types/program';

export interface Course {
    id: number;
    program_id: number;
    code: string;
    name: string;
    program?: Program;
    created_at: string;
    updated_at: string;
}

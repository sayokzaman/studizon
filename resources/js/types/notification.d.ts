import { ClassRoom } from '@/types/classroom';

export interface Notification {
    id: number;
    type: string;
    user_id: number;
    follower_id: number;
    follower?: User;
    classroom_id?: number;
    classroom?: ClassRoom;
    created_at: string;
    updated_at: string;
}

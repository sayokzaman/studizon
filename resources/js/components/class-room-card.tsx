import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ClassRoom } from '@/types/classroom';
import { CalendarIcon, CoinsIcon, UsersIcon } from 'lucide-react';
import React from 'react';

interface Props {
    classRoom: ClassRoom;
    onJoin?: (id: number) => void;
}

export const ClassRoomCard: React.FC<Props> = ({ classRoom, onJoin }) => {
    const {
        id,
        topic,
        description,
        thumbnail_path,
        cost,
        capacity,
        scheduled_date,
        start_time,
        end_time,
    } = classRoom;

    const formattedDate = new Date(scheduled_date).toLocaleDateString(
        undefined,
        {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        },
    );

    return (
        <Card className="gap-2 overflow-hidden rounded-2xl pt-0 shadow transition-shadow hover:shadow-lg">
            <img
                src={thumbnail_path || './thumbnail-placeholder.jpg'}
                alt={topic}
                className="h-40 object-cover"
            />
            <CardHeader className="gap-1">
                <CardTitle className="line-clamp-1 text-lg font-semibold">
                    {topic}
                </CardTitle>
                <Badge className="self-start">
                    {classRoom.course ? (
                        <p>{classRoom.course.name}</p>
                    ) : (
                        'No Course'
                    )}
                </Badge>
                <p className="mt-1 line-clamp-2 min-h-4 pb-2 text-xs text-muted-foreground">
                    {description ? description : ''}
                </p>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                        {formattedDate} • {start_time.slice(0, 5)}–
                        {end_time.slice(0, 5)}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                    <UsersIcon className="h-4 w-4" />
                    <span>Capacity: {capacity}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                    <CoinsIcon className="h-4 w-4" />
                    <span>{cost} credits</span>
                </div>
            </CardContent>

            <CardFooter className='self-end'>
                <Button className="w-full mt-2 shadow hover:scale-105 transition-all duration-300" onClick={() => onJoin?.(id)}>
                    Join Class
                </Button>
            </CardFooter>
        </Card>
    );
};

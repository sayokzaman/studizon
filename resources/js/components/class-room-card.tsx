import StarRating from '@/components/star-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Link } from '@inertiajs/react';
import {
    CalendarIcon,
    Clock9Icon,
    CoinsIcon,
    ExternalLinkIcon,
    UsersIcon,
} from 'lucide-react';
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
        capacity_filled,
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
        <Card className="flex flex-col justify-between gap-4 overflow-hidden rounded-2xl py-4 shadow transition-all duration-300 hover:scale-101 hover:shadow-2xl">
            <CardHeader className="gap-1 px-4">
                <img
                    src={thumbnail_path || './thumbnail-placeholder.jpg'}
                    alt={topic}
                    className="h-40 rounded-2xl object-cover"
                />
                <div className="space-y-1 pt-3">
                    <div className="flex flex-col gap-2">
                        <CardTitle className="line-clamp-1 font-semibold">
                            {topic}
                        </CardTitle>
                        <Badge className="self-start">
                            {classRoom.course ? (
                                <p>{classRoom.course.name}</p>
                            ) : (
                                'No Course'
                            )}
                        </Badge>
                    </div>
                    <p className="line-clamp-2 min-h-4 text-xs text-muted-foreground/70">
                        {description ? description : 'No Description Provided.'}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="space-y-1 border-y px-4 py-2">
                <div className="text-xs text-muted-foreground">Teacher</div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                            <AvatarImage
                                src={classRoom.teacher?.avatar}
                                alt={classRoom.teacher?.name}
                            />

                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {classRoom.teacher?.name[0]}
                            </AvatarFallback>
                        </Avatar>

                        <Link className="truncate text-sm font-semibold underline-offset-2 hover:underline">
                            {classRoom.teacher?.name}
                        </Link>
                    </div>

                    <div className="w-1/3">
                        <StarRating rating={3.5} readonly />
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 px-4 text-xs">
                <div className="grid w-full grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock9Icon className="h-4 w-4" />
                        <span>
                            {start_time.slice(0, 5)}–{end_time.slice(0, 5)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <UsersIcon className="h-4 w-4" />
                        <span>
                            Capacity: {capacity_filled}/{capacity}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CoinsIcon className="h-4 w-4" />
                        <span>{cost} credits</span>
                    </div>
                </div>

                <div className="mt-2 flex w-full items-center gap-2">
                    <Button
                        className="w-full shadow transition-all duration-300 hover:scale-105"
                        onClick={() => onJoin?.(id)}
                    >
                        Join Class
                    </Button>

                    <Button
                        variant={'secondary'}
                        className="size-9 rounded-full shadow transition-all duration-300 hover:scale-105"
                    >
                        <ExternalLinkIcon className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

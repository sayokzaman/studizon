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
import { SharedData } from '@/types';
import { ClassRoom } from '@/types/classroom';
import { Link, useForm, usePage } from '@inertiajs/react';
import {
    CalendarIcon,
    Clock9Icon,
    CoinsIcon,
    ExternalLinkIcon,
    MinusIcon,
    UsersIcon,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

interface Props {
    classRoom: ClassRoom;
}

export const ClassRoomCard: React.FC<Props> = ({ classRoom }) => {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const formattedDate = new Date(classRoom.scheduled_date).toLocaleDateString(
        undefined,
        {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        },
    );

    const { post } = useForm();

    const isTeacher = classRoom.teacher?.id === user.id;

    const isJoined = classRoom.students?.some(
        (student) => student.id === user.id,
    );

    const handleJoin = (id: number) => {
        post(route('classroom.join', id), {
            onSuccess: () => {
                // Optionally, you can refresh the page or update the state to reflect the changes
                // window.location.reload();
            },
            onError: (errors) => {
                console.error('Failed to join classroom:', errors);
            },
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <Card className="flex flex-col justify-between gap-4 overflow-hidden rounded-2xl py-4 shadow transition-all duration-300 hover:scale-101 hover:shadow-2xl">
            <CardHeader className="gap-1 px-4">
                <div className="relative w-full">
                    <img
                        src={
                            classRoom.thumbnail_path ||
                            './thumbnail-placeholder.jpg'
                        }
                        alt={classRoom.topic}
                        className="h-40 w-full rounded-2xl object-cover"
                    />
                    <Badge
                        className="absolute bottom-2 left-2 font-semibold"
                        variant={'secondary'}
                    >
                        {classRoom.course ? (
                            <p>{classRoom.course.name}</p>
                        ) : (
                            'No Course'
                        )}
                    </Badge>
                </div>

                <CardTitle className="line-clamp-1 pt-2 font-semibold">
                    {classRoom.topic}
                </CardTitle>
            </CardHeader>

            {!isTeacher ? (
                <CardContent className="space-y-1 border-b px-4 pb-2">
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
            ) : null}

            <CardFooter className="flex flex-col gap-2 px-4 text-xs">
                <div className="grid w-full grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock9Icon className="h-4 w-4" />
                        <span>
                            {classRoom.start_time.slice(0, 5)}–
                            {classRoom.end_time.slice(0, 5)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <UsersIcon className="h-4 w-4" />
                        <span>
                            Capacity: {classRoom.capacity_filled}/
                            {classRoom.capacity}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CoinsIcon className="h-4 w-4" />
                        <span>{classRoom.cost} credits</span>
                    </div>
                </div>

                <div className="mt-2 flex w-full items-center gap-2">
                    {isJoined || classRoom.teacher_id === user.id ? (
                        <Link
                            href={`/classroom/${classRoom.id}`}
                            className="w-full"
                        >
                            <Button className="w-full">Show Classroom</Button>
                        </Link>
                    ) : (
                        <Button
                            onClick={() => handleJoin(classRoom.id)}
                            className="group w-full"
                            variant={'outline'}
                        >
                            <span className="transition-all duration-300 group-hover:hidden">
                                Join Class
                            </span>
                            <span className="hidden transition-all duration-300 group-hover:inline">
                                <span>
                                    <MinusIcon className="inline h-4 w-4 text-red-400" />{' '}
                                </span>
                                <CoinsIcon className="inline h-4 w-4 text-yellow-400" />{' '}
                                <span className="text-foreground">
                                    {classRoom.cost} credits
                                </span>
                            </span>
                        </Button>
                    )}

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

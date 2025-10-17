import StarRating from '@/components/star-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { SharedData } from '@/types';
import { ClassRoom } from '@/types/classroom';
import { Link, useForm, usePage } from '@inertiajs/react';
import { CoinsIcon } from 'lucide-react';
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
        <Card className="flex flex-col justify-between gap-2 overflow-hidden rounded-2xl p-0 pb-3 shadow transition-all duration-300 hover:scale-101 hover:shadow-2xl">
            <CardHeader className="gap-1 px-0">
                <div className="relative w-full">
                    <img
                        src={
                            classRoom.thumbnail_path ||
                            './thumbnail-placeholder.jpg'
                        }
                        alt={classRoom.topic}
                        className="h-28 w-full object-cover"
                    />
                    {/* <Badge className="absolute bottom-2 left-2 z-10 font-semibold">
                        {classRoom.course ? (
                            <p>{classRoom.course.name}</p>
                        ) : (
                            'No Course'
                        )}
                    </Badge> */}
                    <Badge className="absolute top-2 right-2 z-10 h-fit w-fit border border-muted-foreground/80 bg-black/50 text-white">
                        <CoinsIcon />
                        {classRoom.cost === 0
                            ? 'Free'
                            : `${classRoom.cost}  Credits`}
                    </Badge>
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="-mt-9 flex flex-col gap-1 px-4">
                    <div className="flex justify-between">
                        <div className="flex items-end gap-2">
                            <Avatar className="size-16">
                                <AvatarImage
                                    src="https://github.com/shadcn.png"
                                    alt={user.name}
                                />
                                <AvatarFallback>{user.name}</AvatarFallback>
                            </Avatar>

                            <Link
                                href={route('user.show', user.id)}
                                className="z-10 block hover:underline"
                            >
                                <CardTitle className="text-lg font-semibold">
                                    {user.name}
                                </CardTitle>
                            </Link>
                        </div>

                        <div className="flex w-1/2 flex-col items-end">
                            <div className="w-1/2">
                                <StarRating rating={3.5} readonly />
                            </div>
                        </div>
                    </div>
                </div>

                <CardTitle className="px-3 pt-2 text-sm leading-6 font-semibold">
                    {classRoom.topic}
                </CardTitle>
            </CardHeader>

            {/* <CardContent className="space-y-1 border-b px-3 pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                            <AvatarImage
                                src={
                                    classRoom.teacher?.avatar ||
                                    'https://via.placeholder.com/150'
                                }
                                alt={classRoom.teacher?.name}
                            />

                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {classRoom.teacher?.name[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col justify-center">
                            <Link
                                href={route('user.show', classRoom.teacher?.id)}
                                className="truncate text-xs font-semibold underline-offset-2 hover:underline"
                            >
                                {!isTeacher ? classRoom.teacher?.name : 'You'}
                            </Link>

                            <p className="text-xs text-muted-foreground">
                                Instructor
                            </p>
                        </div>
                    </div>

                    <div className="w-1/3">
                        <StarRating rating={3.5} readonly />
                    </div>
                </div>
            </CardContent> */}

            {/* <CardFooter className="flex flex-col px-4 text-xs">
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
                        <div className="grid w-full grid-cols-2 gap-2">
                            <Link href={`/classroom/${classRoom.id}`}>
                                <Button className="w-full">Show</Button>
                            </Link>

                            {isTeacher ? (
                                <Link href={`/classroom/${classRoom.id}`}>
                                    <Button
                                        className="w-full"
                                        variant={'destructive'}
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                            ) : (
                                <Link href={`/classroom/${classRoom.id}`}>
                                    <Button
                                        className="w-full"
                                        variant={'destructive'}
                                    >
                                        Leave
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            <Button
                                onClick={() => handleJoin(classRoom.id)}
                                className="group w-full"
                                variant={'ghost'}
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

                            <Button
                                variant={'secondary'}
                                className="size-9 rounded-full shadow transition-all duration-300 hover:scale-105"
                            >
                                <ExternalLinkIcon className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            </CardFooter> */}
        </Card>
    );
};

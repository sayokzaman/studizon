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
import { Progress } from '@/components/ui/progress';
import { SharedData, User } from '@/types';
import { ClassRoom } from '@/types/classroom';
import { Link, useForm, usePage } from '@inertiajs/react';
import {
    CalendarIcon,
    Clock9Icon,
    CoinsIcon,
    ExternalLinkIcon,
    LogInIcon,
    LogOutIcon,
    MinusIcon,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

interface Props {
    classroom: ClassRoom;
    userProp?: User;
}

export const ClassRoomCard: React.FC<Props> = ({ classroom, userProp }) => {
    const { auth } = usePage<SharedData>().props;
    const user = userProp ? userProp : auth.user;

    const formattedDate = new Date(classroom.scheduled_date).toLocaleDateString(
        undefined,
        {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        },
    );

    const { post } = useForm();

    const isTeacher = classroom.teacher?.id === user.id;

    const isJoined = classroom.students?.some(
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
        <Card className="flex flex-col justify-between gap-0 overflow-hidden rounded-2xl p-0 pb-3 shadow transition-all duration-300 hover:scale-101 hover:shadow-2xl">
            <CardHeader className="gap-1 px-0">
                <div className="relative w-full">
                    <img
                        src={
                            classroom.thumbnail_path ||
                            '/thumbnail-placeholder.jpg'
                        }
                        alt={classroom.topic}
                        className="h-28 w-full object-cover"
                    />

                    <Badge className="absolute top-2 left-2 z-10 h-fit w-fit">
                        <span className="capitalize">{classroom.status}</span>
                    </Badge>

                    <Badge className="absolute top-2 right-2 z-10 h-fit w-fit border border-muted-foreground/80 bg-black/50 text-white">
                        <CoinsIcon />
                        {classroom.cost === 0
                            ? 'Free'
                            : `${classroom.cost}  Credits`}
                    </Badge>
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="-mt-9 flex flex-col gap-1 px-4">
                    <div className="flex justify-between">
                        <div className="flex w-full items-end gap-2">
                            <Avatar className="size-16">
                                <AvatarImage
                                    src="https://github.com/shadcn.png"
                                    alt={classroom.teacher?.name}
                                />
                                <AvatarFallback>
                                    {classroom.teacher?.name}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex w-full items-end justify-between">
                                <Link
                                    href={route(
                                        'user.show',
                                        userProp
                                            ? user.id
                                            : classroom.teacher?.id,
                                    )}
                                    className="z-10 block hover:underline"
                                >
                                    <CardTitle className="text-lg font-semibold">
                                        {classroom.teacher?.name}
                                    </CardTitle>
                                </Link>

                                <div className="w-20">
                                    <StarRating rating={user.rating} readonly />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-4 mt-2 flex gap-2">
                    {classroom.course ? (
                        <>
                            <Badge className="text-xs">
                                {classroom.course.name}
                            </Badge>

                            <Badge className="text-xs">
                                {classroom.course.code}
                            </Badge>
                        </>
                    ) : (
                        <Badge>Error Fetching Course</Badge>
                    )}
                </div>

                <CardTitle className="px-4 text-sm leading-6 font-semibold">
                    {classroom.topic}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex h-full flex-col justify-end px-4">
                {/* Stats */}
                <div className="flex items-center justify-center pt-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formattedDate}</span>
                    </div>
                    <span className="mx-2 text-[4px]">⬤</span>
                    <div className="flex items-center gap-1">
                        <Clock9Icon className="h-4 w-4" />
                        <span>
                            {classroom.start_time.slice(0, 5)}–
                            {classroom.end_time.slice(0, 5)}
                        </span>
                    </div>
                </div>

                <div className="mt-4 flex flex-col items-center">
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <Progress
                        value={classroom.capacity_filled}
                        max={classroom.capacity}
                        className="mt-1.5 h-1.5 max-w-36"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        Filled: {classroom.capacity_filled}/{classroom.capacity}
                    </p>
                </div>
            </CardContent>

            <CardFooter className="grid grid-cols-2 gap-2 px-4 pt-2">
                {isJoined || classroom.teacher_id === user.id ? (
                    <>
                        <Link href={`/classroom/${classroom.id}`}>
                            <Button className="w-full" variant={'outline'}>
                                <ExternalLinkIcon className="h-4 w-4" />
                                View Class
                            </Button>
                        </Link>

                        {isTeacher ? (
                            <Link href={`/classroom/${classroom.id}`}>
                                <Button
                                    className="w-full"
                                    variant={'destructive'}
                                >
                                    <LogOutIcon className="h-4 w-4" />
                                    Cancel
                                </Button>
                            </Link>
                        ) : (
                            <Link href={`/classroom/${classroom.id}`}>
                                <Button
                                    className="w-full"
                                    variant={'destructive'}
                                >
                                    <LogOutIcon className="h-4 w-4" />
                                    Leave
                                </Button>
                            </Link>
                        )}
                    </>
                ) : (
                    <>
                        <Button
                            onClick={() => handleJoin(classroom.id)}
                            className="group w-full"
                        >
                            <span className="flex items-center gap-2 transition-all duration-300 group-hover:hidden">
                                <LogInIcon className="h-4 w-4" />
                                Enroll
                            </span>
                            <span className="hidden transition-all duration-300 group-hover:inline">
                                <span>
                                    <MinusIcon className="inline h-4 w-4 text-red-400" />{' '}
                                </span>
                                <CoinsIcon className="inline h-4 w-4 text-yellow-400" />{' '}
                                <span className="text-foreground">
                                    {classroom.cost} credits
                                </span>
                            </span>
                        </Button>

                        <Button variant={'secondary'}>
                            <ExternalLinkIcon className="h-4 w-4" />
                            View Class
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    );
};

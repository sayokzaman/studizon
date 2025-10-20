import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SharedData, User } from '@/types';
import { ClassRoom } from '@/types/classroom';
import { Link, usePage } from '@inertiajs/react';
import { Clock9Icon, ExternalLinkIcon } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

interface Props {
    classroom: ClassRoom;
    userProp?: User;
}

export const ClassroomDashboardCard: React.FC<Props> = ({
    classroom,
    userProp,
}) => {
    const { auth } = usePage<SharedData>().props;
    const user = userProp ? userProp : auth.user;
    return (
        <Card className="flex min-w-xs flex-col justify-between gap-0 overflow-hidden rounded-2xl p-0 pb-3 shadow transition-all duration-300 hover:scale-101 hover:shadow-2xl">
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
                        <Clock9Icon className="h-4 w-4" />
                        <span>
                            {classroom.start_time.slice(0, 5)}–
                            {classroom.end_time.slice(0, 5)}
                        </span>
                    </Badge>
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="-mt-9 flex flex-col gap-1 px-4">
                    <div className="flex justify-between">
                        <div className="flex w-full items-end gap-2">
                            <Avatar className="size-16">
                                <AvatarImage
                                    src={
                                        classroom.teacher?.profile_picture ||
                                        "https://avatar.iran.liara.run/public"
                                    }
                                    alt={classroom.teacher?.name}
                                />
                                <AvatarFallback>
                                    {classroom.teacher?.name}
                                </AvatarFallback>
                            </Avatar>

                            <Link
                                href={route(
                                    'user.show',
                                    userProp ? user.id : classroom.teacher?.id,
                                )}
                                className="z-10 block hover:underline"
                            >
                                <CardTitle className="text-lg font-semibold">
                                    {classroom.teacher?.name}
                                </CardTitle>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mx-4 mt-2 flex flex-wrap gap-2">
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

            <CardFooter className="px-4 pt-2">
                <Link
                    href={route('classroom.show', classroom.id)}
                    className="w-full"
                >
                    <Button variant={'secondary'} className="w-full">
                        <ExternalLinkIcon className="h-4 w-4" />
                        View Class
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
};

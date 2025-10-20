import Countdown from '@/components/countdown';
import StarRating from '@/components/star-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { ClassRoom } from '@/types/classroom';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDaysIcon,
    ClockIcon,
    DownloadIcon,
    ExternalLinkIcon,
    FileIcon,
    GithubIcon,
    StarIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { route } from 'ziggy-js';

import ClassLeaveDialog from '@/components/class-leave-dialog';
import { RatingDialog } from '@/components/rating-dialog';
import { format } from 'date-fns';

type Props = {
    classroom: ClassRoom;
    openRatingModal: boolean;
};

const ClassroomShow = ({ classroom, openRatingModal }: Props) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Classrooms',
            href: route('classroom.index'),
        },
        {
            title: classroom.topic,
            href: `/classrooms/${classroom.id}`,
        },
    ];

    const [openRating, setOpenRating] = useState(openRatingModal);

    const user = usePage<SharedData>().props.auth.user;

    const { post } = useForm();

    const startsAtDate = useMemo(() => {
        return classroom.starts_at
            ? new Date(
                  new Date(classroom.starts_at).getTime() - 6 * 60 * 60 * 1000,
              )
            : null;
    }, [classroom.starts_at]);

    const [hasStarted, setHasStarted] = useState(
        startsAtDate ? startsAtDate.getTime() <= Date.now() : false,
    );

    useEffect(() => {
        if (!startsAtDate) return;

        const interval = setInterval(() => {
            setHasStarted(startsAtDate.getTime() <= Date.now());
        }, 5000);

        return () => clearInterval(interval);
    }, [startsAtDate]);

    const handleStartClass = () => {
        post(route('classroom.start', classroom.id), {
            onSuccess: () => {
                // Optionally, you can refresh the page or update the state to reflect the changes
                // window.location.reload();
            },
        });
    };

    const handleJoinClass = () => {
        post(route('classroom.join', classroom.id), {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route('classrooms.live', classroom.id));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Classroom - ${classroom.topic}`} />
            <div className="relative border-b">
                <img
                    src={
                        (classroom.thumbnail_path &&
                            `/${classroom.thumbnail_path}`) ||
                        '/thumbnail-placeholder.jpg'
                    }
                    alt={classroom?.topic}
                    className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="flex h-72 flex-col items-center justify-end bg-accent/30 px-16 py-6 backdrop-blur-xs">
                    <div className="w-full max-w-7xl">
                        <h3 className="flex items-center gap-2 text-xl font-semibold">
                            <Badge className="font-semibold tracking-wide">
                                {classroom.course?.code}
                            </Badge>{' '}
                            <span className="text-foreground/80">
                                {classroom.course?.name}
                            </span>
                        </h3>
                        <h1 className="text-3xl font-semibold">
                            {classroom.topic}
                        </h1>
                        <p className="text-sm text-foreground/80">
                            {classroom.course?.program?.name}
                        </p>
                    </div>
                </div>
            </div>

            <main className="mx-auto w-full max-w-7xl px-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage
                                src={
                                    classroom.teacher?.profile_picture
                                        ? `/${classroom.teacher?.profile_picture}`
                                        : "https://avatar.iran.liara.run/public"
                                }
                                alt={classroom.teacher?.name}
                            />
                            <AvatarFallback>
                                {classroom.teacher?.name}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Instructor
                            </p>

                            <h2 className="text-2xl font-semibold text-nowrap">
                                {classroom.teacher?.name}
                            </h2>

                            <div className="w-24">
                                <StarRating rating={3.5} readonly />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {classroom.status !== 'completed' ? (
                            <>
                                {classroom.join_link && (
                                    <a
                                        href={classroom.join_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button>Join Classroom</Button>
                                    </a>
                                )}

                                {startsAtDate ? (
                                    hasStarted ? (
                                        !classroom.is_live ? (
                                            classroom.teacher_id === user.id ? (
                                                <Button
                                                    onClick={handleStartClass}
                                                >
                                                    Start Classroom
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant={'outline'}
                                                    disabled
                                                >
                                                    Wait for the instructor to
                                                    start
                                                </Button>
                                            )
                                        ) : (
                                            <Button onClick={handleJoinClass}>
                                                Join Live
                                            </Button>
                                        )
                                    ) : (
                                        <Button disabled variant="secondary">
                                            Scheduled for{' '}
                                            {format(startsAtDate, 'p, PPP')}
                                        </Button>
                                    )
                                ) : (
                                    <Button disabled variant="secondary">
                                        No start time
                                    </Button>
                                )}

                                <ClassLeaveDialog classroom={classroom} />
                            </>
                        ) : !classroom.is_rated ? (
                            classroom.teacher_id !== user.id ? (
                                <>
                                    <Button onClick={() => setOpenRating(true)}>
                                        <StarIcon className="h-4 w-4" />
                                        Rate Instructor
                                    </Button>
                                </>
                            ) : null
                        ) : (
                            <Button variant="outline" disabled>
                                This Class has ended
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-8">
                    <div className="flex flex-col items-center justify-center rounded-md border bg-muted/40 p-4">
                        <p className="text-xl text-muted-foreground">
                            Class Status
                        </p>
                        <Badge className="mt-2 font-semibold capitalize">
                            {classroom.status}
                        </Badge>
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-md border bg-muted/40 p-4">
                        <CalendarDaysIcon className="mb-1 h-6 w-6" />
                        <p className="text-sm text-muted-foreground">
                            Scheduled on
                        </p>
                        <p className="text-2xl font-semibold">
                            {new Date(
                                classroom.scheduled_date,
                            ).toLocaleDateString('en-US', {
                                day: 'numeric',
                            })}
                        </p>
                        <p>
                            {new Date(
                                classroom.scheduled_date,
                            ).toLocaleDateString('en-US', {
                                month: 'long',
                            })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {new Date(
                                classroom.scheduled_date,
                            ).toLocaleDateString('en-US', {
                                year: 'numeric',
                            })}
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-md border bg-muted/40 p-4">
                        <ClockIcon className="mb-1 h-6 w-6" />
                        <p className="text-sm text-muted-foreground">
                            Class Time
                        </p>
                        <p className="text-2xl font-semibold">
                            {classroom.starts_at?.split('T')[1].slice(0, 5)} -
                            {classroom.ends_at?.split('T')[1].slice(0, 5)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Starts in
                        </p>
                        <Countdown
                            startTime={
                                classroom.starts_at
                                    ?.split('T')[1]
                                    .slice(0, 7) || '00:00:00'
                            }
                            className="text-lg font-semibold"
                        />
                    </div>
                </div>

                <h3 className="mt-6 text-2xl font-semibold">Overview</h3>

                <div className="flex gap-8">
                    <div className="mt-4 flex w-2/3 flex-col gap-8">
                        <div className="rounded-md border bg-muted/40">
                            <h4 className="p-4 text-lg font-semibold">
                                Description
                            </h4>
                            <hr />
                            <div className="p-4">
                                <p className="text-sm text-muted-foreground">
                                    {classroom.description ||
                                        'No description provided for this classroom.'}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-md border bg-muted/40">
                            <div className="flex items-center gap-1 p-4">
                                <span className="text-lg font-semibold">
                                    Links
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    (1)
                                </span>
                            </div>
                            <hr />
                            <div className="flex flex-col gap-4 p-4">
                                <div className="flex items-center justify-between rounded-[10px] bg-muted-foreground/20 p-4 transition-all duration-300 ease-in-out hover:bg-primary/15">
                                    <div className="flex items-center gap-3">
                                        <GithubIcon className="h-6 w-6" />

                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm">
                                                was.do/s3isd2
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <ExternalLinkIcon className="h-3 w-3 text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground underline">
                                                    https://github.com/sayokzaman
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <ExternalLinkIcon className="h-6 w-6" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-md border bg-muted/40">
                            <div className="flex items-center gap-1 p-4">
                                <span className="text-lg font-semibold">
                                    Materials
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    (3)
                                </span>
                            </div>
                            <hr />
                            <div className="flex flex-col gap-4 p-4">
                                {Array.from({ length: 3 }, () => (
                                    <div className="flex items-center justify-between rounded-[10px] bg-muted-foreground/20 p-4 transition-all duration-300 ease-in-out hover:bg-primary/15">
                                        <div className="flex items-center gap-3">
                                            <FileIcon className="h-6 w-6" />

                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm">
                                                    Filename.txt
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    2.5mb
                                                </p>
                                            </div>
                                        </div>

                                        <DownloadIcon className="h-6 w-6" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 h-fit w-1/3 rounded-md border bg-muted/40 p-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <p className="text-lg font-semibold">Students</p>

                            <div>
                                <span className="text-3xl font-semibold">
                                    {classroom.capacity_filled || 0}
                                </span>{' '}
                                <span className="text-muted-foreground">
                                    / {classroom.capacity}
                                </span>
                            </div>
                        </div>

                        {classroom.students?.map((student) => (
                            <div
                                key={student.id}
                                className="mt-4 flex items-center gap-2"
                            >
                                <Avatar className="h-10 w-10">
                                    <img
                                        src="https://picsum.photos/200/200"
                                        alt={student.name}
                                        className="h-full w-full object-cover"
                                    />
                                </Avatar>
                                <Link className="hover:underline">
                                    <p>{student.name}</p>
                                    {student.program.name && (
                                        <p className="text-sm text-muted-foreground">
                                            {student.program.name}
                                        </p>
                                    )}
                                </Link>
                            </div>
                        ))}

                        <div className="mt-4 flex justify-end gap-3 border-t pt-4">
                            <Button onClick={() => {}}>Invite People</Button>
                            <Button
                                variant={'secondary'}
                                onClick={() => {
                                    const link = route(
                                        'classroom.join.link',
                                        classroom.id,
                                    );
                                    navigator.clipboard.writeText(link);
                                }}
                            >
                                Share Class Link
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <RatingDialog
                classroom={classroom}
                openRatingModal={openRating}
                setOpenRatingModal={setOpenRating}
            />
        </AppLayout>
    );
};

export default ClassroomShow;

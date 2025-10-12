import Countdown from '@/components/countdown';
import StarRating from '@/components/star-rating';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { ClassRoom } from '@/types/classroom';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    CalendarDaysIcon,
    ClockIcon,
    DownloadIcon,
    ExternalLinkIcon,
    FileIcon,
    GithubIcon,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

const ClassroomShow = ({ classroom }: { classroom: ClassRoom }) => {
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

    const { post } = useForm();

    const [openLeaveModal, setOpenLeaveModal] = useState(false);

    const handleLeave = () => {
        post(route('classroom.leave', classroom.id), {
            onSuccess: () => {
                // Optionally, you can refresh the page or update the state to reflect the changes
                // window.location.reload();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Classroom - ${classroom.topic}`} />

            <div className="relative border-b">
                <img
                    src={
                        classroom.thumbnail_path || '/thumbnail-placeholder.jpg'
                    }
                    alt={classroom?.topic}
                    className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="flex h-72 flex-col justify-end bg-accent/30 px-16 py-6 backdrop-blur-xs">
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

            <main className="px-16 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                            <img
                                src="https://picsum.photos/200/200"
                                alt={classroom.teacher?.name}
                                className="h-full w-full object-cover"
                            />
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
                        <a href={classroom.join_link} target="_blank">
                            <Button>Join Classroom</Button>
                        </a>
                        <Button
                            variant="destructive"
                            onClick={() => setOpenLeaveModal(true)}
                        >
                            Leave Classroom
                        </Button>
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
                            {classroom.start_time
                                .split(':')
                                .slice(0, 2)
                                .join(':')}{' '}
                            -{' '}
                            {classroom.end_time
                                .split(':')
                                .slice(0, 2)
                                .join(':')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Starts in
                        </p>
                        <Countdown
                            startTime={classroom.start_time}
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

            <AlertDialog open={openLeaveModal} onOpenChange={setOpenLeaveModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want leave this class?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            remove all your data from the classroom.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button onClick={handleLeave} variant={'destructive'}>
                            Leave
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
};

export default ClassroomShow;

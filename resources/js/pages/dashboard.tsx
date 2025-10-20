import { ClassroomDashboardCard } from '@/components/classroom-dashboard-card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { WeeklyClassesChart } from '@/components/weekly-class-chart';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { ClassRoom } from '@/types/classroom';
import { Head, Link } from '@inertiajs/react';
import { CoinsIcon } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type Props = {
    joinedClassesToday: ClassRoom[];
    myClassesToday: ClassRoom[];
    classesPerDay: {
        date: string;
        total: number;
    }[];
};

export default function Dashboard({
    myClassesToday,
    joinedClassesToday,
    classesPerDay,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Label className="text-xl font-semibold">Welcome User!</Label>
                <span className="mt-1 text-base text-nowrap text-muted-foreground sm:mt-0">
                    Here’s your overview for for this week.
                </span>
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card className="flex flex-col justify-between gap-2 py-2.5">
                        <CardHeader className="flex flex-row items-center justify-between px-3">
                            <CardTitle className="text-sm font-medium">
                                Classes taken
                            </CardTitle>
                            <CoinsIcon className="h-6 w-6 text-yellow-500" />
                        </CardHeader>
                        <CardContent className="flex justify-between px-3 text-xl font-bold">
                            {/* <p>{classesTaken}</p> */}
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col justify-between gap-2 py-2.5">
                        <CardHeader className="flex flex-row items-center justify-between px-3">
                            <CardTitle className="text-sm font-medium">
                                Classes Attended
                            </CardTitle>
                            <CoinsIcon className="h-6 w-6 text-yellow-500" />
                        </CardHeader>
                        <CardContent className="flex justify-between px-3 text-xl font-bold">
                            <p>$0</p>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col justify-between gap-2 py-2.5">
                        <CardHeader className="flex flex-row items-center justify-between px-3">
                            <CardTitle className="text-sm font-medium">
                                Classes Taken
                            </CardTitle>
                            <CoinsIcon className="h-6 w-6 text-yellow-500" />
                        </CardHeader>
                        <CardContent className="flex justify-between px-3 text-xl font-bold">
                            <p>$0</p>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col justify-between gap-2 py-2.5">
                        <CardHeader className="flex flex-row items-center justify-between px-3">
                            <CardTitle className="text-sm font-medium">
                                Classes Taken
                            </CardTitle>
                            <CoinsIcon className="h-6 w-6 text-yellow-500" />
                        </CardHeader>
                        <CardContent className="flex justify-between px-3 text-xl font-bold">
                            <p>$0</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Calendar
                        mode="single"
                        className="w-full rounded-md border bg-card shadow-sm"
                        captionLayout="dropdown"
                    />

                    <div className="col-span-3 flex gap-4">
                        <Card className="w-1/2 py-4">
                            <CardHeader className="px-4">
                                <Label className="text-lg font-semibold">
                                    Joined Classes
                                </Label>
                                <span className="text-base text-nowrap text-muted-foreground">
                                    You have{' '}
                                    <span className="text-primary">
                                        {joinedClassesToday.length}
                                    </span>{' '}
                                    classes today.
                                </span>
                            </CardHeader>
                            <CardContent className="flex h-full gap-4 overflow-x-auto px-4 pb-4">
                                {joinedClassesToday &&
                                joinedClassesToday.length > 0 ? (
                                    joinedClassesToday.map((classroom) => (
                                        <ClassroomDashboardCard
                                            key={classroom.id}
                                            classroom={classroom}
                                        />
                                    ))
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                                        <p>No classes for today.</p>
                                        <Link href={route('classroom.index')}>
                                            <Button>Join a Class</Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="w-1/2 py-4">
                            <CardHeader className="px-4">
                                <Label className="text-lg font-semibold">
                                    My Classes
                                </Label>
                                <span className="text-base text-nowrap text-muted-foreground">
                                    You have {5} classes today.
                                </span>
                            </CardHeader>
                            <CardContent className="flex h-full gap-4 overflow-x-auto px-4 pb-4">
                                {myClassesToday && myClassesToday.length > 0 ? (
                                    myClassesToday.map((classroom) => (
                                        <ClassroomDashboardCard
                                            key={classroom.id}
                                            classroom={classroom}
                                        />
                                    ))
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                                        <p>No classes for today.</p>
                                        <Link href={route('classroom.create')}>
                                            <Button>Create a Class</Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card className="flex flex-col gap-2 py-2.5">
                        <CardHeader className="flex flex-row items-center border-b px-3 pb-3">
                            <CardTitle className="text-lg font-medium">
                                Leaderboards
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 px-3 text-xl font-bold">
                            <p className="mt-1 text-sm font-semibold text-muted-foreground">
                                Top Rated
                            </p>
                            <Card className="border-0 bg-muted py-4">
                                <CardContent className="flex items-center gap-2 px-4">
                                    <p className="text-sm">#1</p>
                                    <img
                                        src="https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=76&q=80"
                                        alt=""
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Username
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            email.email.com
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-muted py-4">
                                <CardContent className="flex items-center gap-2 px-4">
                                    <p className="text-sm">#2</p>
                                    <img
                                        src="https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=76&q=80"
                                        alt=""
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Username
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            email.email.com
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <p className="mt-1 text-sm font-semibold text-muted-foreground">
                                Most Followed
                            </p>

                            <p className="mt-1 text-sm font-semibold text-muted-foreground">
                                Top Teachers
                            </p>

                            <p className="mt-1 text-sm font-semibold text-muted-foreground">
                                Top Learners
                            </p>
                        </CardContent>
                    </Card>

                    <div className="col-span-2">
                        <WeeklyClassesChart
                            chartData={classesPerDay}
                            stroke="#0ea5e9"
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

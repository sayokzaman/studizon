import { ClassRoomCard } from '@/components/class-room-card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { ClassRoom } from '@/types/classroom';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Classroom',
        href: '/classroom',
    },
];

type Props = {
    classrooms: ClassRoom[];
    user: User;
    myClasses: ClassRoom[];
    joinedClasses: ClassRoom[];
};

const ClassroomIndex = ({ classrooms, myClasses, joinedClasses }: Props) => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Classroom" />

            <main className="flex flex-col pb-4">
                <div className="flex flex-col justify-between gap-4 px-6 py-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-xl font-semibold">Classrooms</h2>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
                        <Link href="/classroom/create">
                            <Button className="w-full sm:w-auto">
                                Create New Classroom
                            </Button>
                        </Link>
                    </div>
                </div>

                <section className="flex flex-col items-center gap-3 px-6 py-3">
                    <h2 className="font-semibold">
                        Explore{' '}
                        <span className="text-sm font-medium text-muted-foreground/50">
                            ({classrooms.length})
                        </span>
                    </h2>

                    <div className="w-full">
                        {/* Classroom list will go here */}
                        {classrooms.length === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">
                                No classrooms available.
                            </p>
                        ) : (
                            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                {classrooms.map((classRoom) => (
                                    <ClassRoomCard
                                        key={classRoom.id}
                                        classRoom={classRoom}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    {classrooms.length > 0 && (
                        <Button variant={'secondary'}>Show More</Button>
                    )}
                </section>

                <section className="flex flex-col items-center gap-3 px-6 py-3">
                    <h2 className="font-semibold">
                        Joined Classes{' '}
                        <span className="text-sm font-medium text-muted-foreground/50">
                            ({joinedClasses.length})
                        </span>
                    </h2>

                    <div className="w-full">
                        {/* Classroom list will go here */}
                        {joinedClasses.length === 0 ? (
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                No classrooms available.
                            </p>
                        ) : (
                            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                {joinedClasses.map((classRoom) => (
                                    <ClassRoomCard
                                        key={classRoom.id}
                                        classRoom={classRoom}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    {joinedClasses.length > 0 && (
                        <Button variant={'secondary'}>Show More</Button>
                    )}
                </section>

                <section className="flex flex-col items-center gap-3 px-6 pt-3">
                    <h2 className="font-semibold">
                        My Classes{' '}
                        <span className="text-sm font-medium text-muted-foreground/50">
                            ({myClasses.length})
                        </span>
                    </h2>

                    <div className="w-full">
                        {/* Classroom list will go here */}
                        {myClasses.length === 0 ? (
                            <p className="mt-4 text-center text-sm text-muted-foreground">
                                No classrooms available.
                            </p>
                        ) : (
                            <ul className="grid items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                {myClasses.map((classRoom) => (
                                    <ClassRoomCard
                                        key={classRoom.id}
                                        classRoom={classRoom}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    {myClasses.length > 0 && (
                        <Button variant={'secondary'}>Show More</Button>
                    )}
                </section>
            </main>
        </AppLayout>
    );
};

export default ClassroomIndex;

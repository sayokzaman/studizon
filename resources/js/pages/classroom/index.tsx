import { ClassRoomCard } from '@/components/class-room-card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { ClassRoom } from '@/types/classroom';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Classroom',
        href: '/classroom',
    },
];

const ClassroomIndex = ({ classrooms }: { classrooms: ClassRoom[] }) => {
    const { data, setData, post } = useForm({
        id: null as number | null,
    });

    const handleJoin = async (classroomId: number) => {
        post('/classroom/' + classroomId + '/join', {
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Classroom" />
            <main className="p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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

                <div>
                    {/* Classroom list will go here */}
                    {classrooms.length === 0 ? (
                        <p className="mt-4 text-sm text-muted-foreground">
                            No classrooms available.
                        </p>
                    ) : (
                        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            {classrooms.map((classRoom) => (
                                <ClassRoomCard
                                    key={classRoom.id}
                                    classRoom={classRoom}
                                    onJoin={(id) => {
                                        setData('id', id);
                                        handleJoin(id);
                                    }}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </AppLayout>
    );
};

export default ClassroomIndex;

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Classroom',
        href: '/classroom',
    },
];

const ClassroomIndex = () => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Classroom" />
            <main className="p-4"></main>
        </AppLayout>
    );
};

export default ClassroomIndex;

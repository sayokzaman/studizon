import AppLayout from '@/layouts/app-layout';
import UserCard from '@/pages/user/user-card';
import { BreadcrumbItem, User } from '@/types';
import { Head } from '@inertiajs/react';

type Props = {
    users: User[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User',
        href: '/users',
    },
];

const UserIndex = ({ users }: Props) => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="People" />

            <main className="flex flex-col items-center justify-center p-4">
                <div className="grid grid-cols-3 gap-8">
                    {users.map((user) => (
                        <UserCard user={user} />
                    ))}
                </div>
            </main>
        </AppLayout>
    );
};

export default UserIndex;

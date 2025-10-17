import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

type Props = {
    user: User;
};

const UserShow = ({ user }: Props) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'User',
            href: '/people',
        },
        {
            title: user.name,
            href: `/people/${user.id}`,
        },
    ];

    const { post, delete: destroy, processing } = useForm();

    const handleFollow = (id: number) => {
        if (user.is_following) {
            destroy(route('followers.destroy', id), {
                preserveScroll: true,
            });
        } else {
            post(route('followers.store', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />

            <main className="p-4">
                <p>{user.name}</p>

                <Button onClick={() => handleFollow(user.id)}>
                    {processing && user.is_following
                        ? 'Unfollowing...'
                        : processing && !user.is_following
                          ? 'Following...'
                          : user.is_following
                            ? 'Unfollow'
                            : 'Follow'}
                </Button>
            </main>
        </AppLayout>
    );
};

export default UserShow;

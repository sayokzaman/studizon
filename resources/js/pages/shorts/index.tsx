// resources/js/pages/shorts/Feed.tsx
import ShortCard from '@/components/shorts/short-card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Short } from '@/types/short';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowDownIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

type Props = {
    initial: Short[];
    cursor?: string | null;
};

export default function Feed({ initial, cursor }: Props) {
    const [items, setItems] = useState<Short[]>(initial || []);
    const [idx, setIdx] = useState(0);
    const [nextCursor, setNextCursor] = useState<string | null | undefined>(
        cursor,
    );

    const [seconds, setSeconds] = useState(items[idx]?.time_limit ?? 15);

    useEffect(() => {
        const t = setInterval(
            () => setSeconds((s) => (s > 0 ? s - 1 : 0)),
            1000,
        );
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        // Prefetch next when near end
        if (idx >= items.length - 2 && nextCursor) {
            router.get(
                route('shorts.index'),
                { cursor: nextCursor },
                {
                    preserveState: true,
                    only: ['initial', 'cursor'],
                    onSuccess: (page) => {
                        setItems((prev) => [...prev, ...(page.props.initial as Short[] ?? [])]);
                        setNextCursor(page.props.cursor as string | null | undefined);
                    },
                },
            );
        }
    }, [idx, items.length, nextCursor]);

    const onNext = () => {
        setSeconds(items[idx + 1]?.time_limit ?? 15);
        setIdx((i) => Math.min(i + 1, items.length - 1));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Shorts',
            href: '/shorts',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shorts" />
            <div className="relative flex h-full items-center justify-center">
                {items[idx] && (
                    <>
                        {/* <ShortCardAI item={items[idx]} onNext={onNext} /> */}
                        <ShortCard
                            short={items[idx]}
                            onNext={onNext}
                            seconds={seconds}
                        />
                    </>
                )}

                <Link
                    href={route('shorts.create')}
                    className="absolute top-4 right-4"
                >
                    <Button>Create New Short</Button>
                </Link>
            </div>

            <div className="absolute top-1/2 right-4 -translate-y-1/2">
                <Button
                    className="size-10"
                    onClick={onNext}
                    variant="secondary"
                >
                    <ArrowDownIcon />
                </Button>
            </div>
        </AppLayout>
    );
}

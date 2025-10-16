import TimerBar from '@/components/shorts/timer-bar';
import TypeRenderer from '@/components/shorts/type-renderer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import { CodeOutputPayload, Short } from '@/types/short';
import { usePage } from '@inertiajs/react';
import { Share2Icon, ThumbsUpIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    data: Partial<Short>;
    courseName: string;
};

export default function ShortCreateCard({ data, courseName }: Props) {
    const [seconds, setSeconds] = useState(data.time_limit ?? 15);
    useEffect(() => setSeconds(data.time_limit ?? 15), [data.time_limit]);
    useEffect(() => {
        const t = setInterval(
            () => setSeconds((s) => (s > 0 ? s - 1 : 0)),
            1000,
        );
        return () => clearInterval(t);
    }, []);

    const user = usePage<SharedData>().props.auth.user;

    return (
        <Card
            className={cn(
                'relative h-[calc(100vh-8rem)] w-full max-w-md overflow-hidden rounded-[10px] p-4',
                data.background,
            )}
        >
            <TimerBar seconds={seconds} total={data.time_limit ?? 15} />

            {/* prompt (+ show code snippet when code_output) */}
            <div className="flex h-full w-full items-center justify-center">
                <div className="flex w-full flex-col items-center">
                    <h2 className="text-xl font-semibold text-white drop-shadow-sm">
                        {data.prompt || 'Preview your prompt here'}
                    </h2>
                    {data.type === 'code_output' &&
                        (data.payload as CodeOutputPayload).code && (
                            <pre className="mt-4 w-full overflow-auto rounded bg-black/60 p-3 text-white/90">
                                {(data.payload as CodeOutputPayload).code}
                            </pre>
                        )}
                </div>
            </div>

            <TypeRenderer short={data} seconds={seconds} />

            <div className="flex flex-col justify-end gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Badge className="font-semibold opacity-90">
                            {prettyType(data.type)}
                        </Badge>

                        {courseName && (
                            <Badge className="font-semibold opacity-90">
                                {courseName}
                            </Badge>
                        )}
                    </div>
                    <span className="text-sm text-white/80">{seconds}s</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar>
                            <AvatarImage
                                src="https://avatar.iran.liara.run/public"
                                alt=""
                            />
                            <AvatarFallback>'You'</AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                            <p className="text-sm hover:underline">You</p>
                            <span className="text-xs text-white/60">
                                @{user.name.split(' ')[1]}
                            </span>
                        </div>

                        <Button variant="secondary" size="sm" className="ml-2">
                            Follow
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            className="size-9 border-0 bg-black/30 transition-colors duration-200 ease-in-out hover:bg-black/50"
                            variant={'outline'}
                        >
                            <ThumbsUpIcon />
                        </Button>

                        <Button
                            className="size-9 border-0 bg-black/30 transition-colors duration-200 ease-in-out hover:bg-black/50"
                            variant={'outline'}
                        >
                            <Share2Icon />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function prettyType(t: string | undefined) {
    return t?.replace('_', ' ').replace(/\b\w/g, (s) => s.toUpperCase());
}

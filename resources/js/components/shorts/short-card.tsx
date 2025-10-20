import TimerBar from '@/components/shorts/timer-bar';
import TypeRenderer from '@/components/shorts/type-renderer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { CodeOutputPayload, Short } from '@/types/short';
import { Link, useForm } from '@inertiajs/react';
import {
    SearchIcon,
    Share2Icon,
    ThumbsUpIcon,
    UserPlusIcon,
    UserXIcon,
} from 'lucide-react';
import { route } from 'ziggy-js';

type Props = {
    short: Short;
    seconds: number;
    onNext: () => void;
};

const ShortCard = ({ short, onNext, seconds }: Props) => {
    const { post, delete: destroy, processing } = useForm();

    const handleFollow = () => {
        if (short.creator.is_following) {
            destroy(route('followers.destroy', short.creator.id), {
                preserveScroll: true,
            });
        } else {
            post(route('followers.store', short.creator.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <Card
            className={cn(
                'relative aspect-[16/9] h-[calc(100vh-8rem)] w-full max-w-md overflow-hidden rounded-[10px] p-4',
                short.background,
            )}
        >
            <TimerBar seconds={seconds} total={short.time_limit ?? 15} />
            {short.background?.startsWith('vid:') && (
                <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={short.background.slice(4)}
                    muted
                    loop
                    autoPlay
                    playsInline
                />
            )}
            <div className="flex justify-end">
                <SearchIcon className="size-5" />
            </div>

            <div className="flex h-full w-full items-center justify-center">
                <div className="flex w-full flex-col items-center">
                    <h2 className="text-xl font-semibold text-white drop-shadow-sm">
                        {short.prompt}
                    </h2>

                    {short.type === 'code_output' && (
                        <pre className="mt-4 w-full overflow-auto rounded bg-black/60 p-3 text-white/90">
                            {(short.payload as CodeOutputPayload).code}
                        </pre>
                    )}
                </div>
            </div>

            <div>
                <TypeRenderer short={short} seconds={seconds} onNext={onNext} />
            </div>

            <div className="flex flex-col justify-end gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Badge className="font-semibold opacity-90">
                            {prettyType(short.type)}
                        </Badge>

                        <Badge className="font-semibold opacity-90">
                            {short.course.name}
                        </Badge>
                    </div>
                    <span className="text-sm text-white/80">{seconds}s</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar>
                            <AvatarImage
                                src={
                                    short.creator.profile_picture
                                        ? `/${short.creator.profile_picture}`
                                        : 'https://avatar.iran.liara.run/public'
                                }
                                alt=""
                            />
                            <AvatarFallback>
                                {short.creator.name}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                            <Link
                                href={route('user.show', short.creator_id)}
                                className="text-sm hover:underline"
                            >
                                {short.creator.name}
                            </Link>
                            <span className="text-xs text-white/60">
                                @{short.creator.name.split(' ')[1]}
                            </span>
                        </div>

                        <Button
                            onClick={() => handleFollow()}
                            variant={
                                short.creator.is_following
                                    ? 'outline'
                                    : 'default'
                            }
                        >
                            {processing && short.creator.is_following ? (
                                <span className="flex items-center gap-2">
                                    <Spinner />
                                    Unfollowing...
                                </span>
                            ) : processing && !short.creator.is_following ? (
                                <span className="flex items-center gap-2">
                                    <Spinner />
                                    Following...
                                </span>
                            ) : short.creator.is_following ? (
                                <span className="flex items-center gap-2">
                                    <UserXIcon />
                                    Unfollow
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <UserPlusIcon />
                                    Follow
                                </span>
                            )}
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
};

function prettyType(t: string) {
    return t.replace('_', ' ').replace(/\b\w/g, (s) => s.toUpperCase());
}

export default ShortCard;

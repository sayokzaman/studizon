import StarRating from '@/components/star-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { User } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import {
    BookOpenIcon,
    Eye,
    SquarePlayIcon,
    UserPlusIcon,
    UserRoundCheckIcon,
    UserRoundPlusIcon,
    UserXIcon,
} from 'lucide-react';
import { route } from 'ziggy-js';

type Props = {
    user: User;
};

export default function UserCard({ user }: Props) {
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
        <Card className="flex-1 gap-3 rounded-2xl py-4 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="gap-1 px-4">
                <div className="flex justify-between">
                    <Avatar className="size-16">
                        <AvatarImage
                            src="https://github.com/shadcn.png"
                            alt={user.name}
                        />
                        <AvatarFallback>{user.name}</AvatarFallback>
                    </Avatar>

                    <div className="flex w-1/2 flex-col items-end">
                        <Badge className="h-fit w-fit">BSCSE</Badge>
                        <div className="w-1/2">
                            <StarRating rating={3.5} readonly />
                        </div>
                    </div>
                </div>
                <div>
                    <Link
                        href={route('user.show', user.id)}
                        className="inline-block w-fit hover:underline"
                    >
                        <CardTitle className="w-fit text-lg font-semibold">
                            {user.name}
                        </CardTitle>
                    </Link>
                    <CardDescription className="text-sm text-muted-foreground">
                        {user.email}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="px-4">
                {/* Stats */}
                <div className="flex items-center justify-center pt-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <UserRoundPlusIcon className="h-4 w-4" />
                        <span>{user.follower_count ?? 0} Followers</span>
                    </div>
                    <span className="mx-2 text-[4px]">⬤</span>
                    <div className="flex items-center gap-1">
                        <UserRoundCheckIcon className="h-4 w-4" />
                        {user.following_count ?? 0} Following
                    </div>
                </div>

                <div className="flex items-center justify-center pt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <BookOpenIcon className="h-4 w-4" />
                        <span>{user.classrooms_count ?? 0} Classrooms</span>
                    </div>
                    <span className="mx-2 text-[4px]">⬤</span>
                    <div className="flex items-center gap-1">
                        <SquarePlayIcon className="h-4 w-4" />
                        {user.shorts_count ?? 0} Shorts
                    </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 pt-4">
                    {Array(5)
                        .slice(0, 3)
                        .map((badge, i) => (
                            <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                            >
                                {/* {badge} */}
                                asdasdas
                            </Badge>
                        ))}
                    {Array(5).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{Array(5).length - 3} more
                        </Badge>
                    )}
                </div>
            </CardContent>

            <CardFooter className="grid grid-cols-2 gap-2 px-4">
                <Button
                    onClick={() => handleFollow(user.id)}
                    variant={user.is_following ? 'outline' : 'default'}
                >
                    {processing && user.is_following ? (
                        <span className="flex items-center gap-2">
                            <Spinner />
                            Unfollowing...
                        </span>
                    ) : processing && !user.is_following ? (
                        <span className="flex items-center gap-2">
                            <Spinner />
                            Following...
                        </span>
                    ) : user.is_following ? (
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

                <Link href={route('user.show', user.id)} className="w-full">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-9 w-full flex-1"
                        // onClick={onViewProfile}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

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
import { User } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Eye,
    UserPlus,
    UserRoundCheckIcon,
    UserRoundPlusIcon,
} from 'lucide-react';
import { route } from 'ziggy-js';

type Props = {
    user: User;
};

export default function UserCard({ user }: Props) {
    return (
        <Card className="w-full min-w-sm gap-3 rounded-2xl py-4 shadow-sm transition-all hover:shadow-md">
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
                        <span>{20} Followers</span>
                    </div>
                    <span className="mx-2 text-[4px]">⬤</span>
                    <div className="flex items-center gap-1">
                        <UserRoundCheckIcon className="h-4 w-4" />
                        {40} Following
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
                    // variant={isFollowing ? 'outline' : 'default'}
                    size="sm"
                    className="flex-1"
                    // onClick={onFollow}
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {/* {isFollowing ? 'Following' : 'Follow'} */}
                    Follow
                </Button>

                <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    // onClick={onViewProfile}
                >
                    <Eye className="mr-2 h-4 w-4" />
                    View Profile
                </Button>
            </CardFooter>
        </Card>
    );
}

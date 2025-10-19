import { ClassRoomCard } from '@/components/class-room-card';
import ShortCard from '@/components/shorts/short-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData, User } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    BookOpenText,
    NotebookPen,
    SquarePlay,
    UserPlusIcon,
    UserRoundCheckIcon,
    UserRoundPlusIcon,
    UserXIcon,
} from 'lucide-react';
import { route } from 'ziggy-js';

type Props = {
    user: User;
};

const UserShow = ({ user }: Props) => {
    const auth = usePage<SharedData>().props.auth;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'People',
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
            <Head title="Dashboard" />
            <div className="mx-auto max-w-7xl p-6">
                {/* Profile Header */}
                <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-muted/50 p-6 shadow-md md:flex-row">
                    {/* Profile Image and Basic Info */}
                    <div className="flex items-center gap-5">
                        <img
                            src="https://cdn.pixabay.com/photo/2023/07/13/15/06/avatar-8125365_960_720.png"
                            alt="Prof"
                            className="h-36 w-36 rounded-full border-4 border-zinc-700 object-cover shadow-md"
                        />
                        <div className="grid gap-1">
                            <h2 className="text-2xl font-semibold">
                                {user.name}
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                {user.email}
                            </p>

                            <div className="flex items-center justify-center pt-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <UserRoundPlusIcon className="h-4 w-4" />
                                    <span>
                                        {user.follower_count ?? 0} Followers
                                    </span>
                                </div>
                                <span className="mx-2 text-[4px]">⬤</span>
                                <div className="flex items-center gap-1">
                                    <UserRoundCheckIcon className="h-4 w-4" />
                                    {user.following_count ?? 0} Following
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Joined on: {format(user.created_at, 'PP')}
                            </p>
                        </div>
                    </div>

                    {user.id === auth.user.id ? (
                        <Button>Edit Profile</Button>
                    ) : (
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
                    )}
                </div>

                {/* Bio and Other Details */}
                <Card className="mt-6 bg-muted/50">
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Personal Info</h3>
                    </CardHeader>

                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-semibold text-muted-foreground">
                                Department :
                            </p>
                            <p className="mt-1">
                                {user.program.department.name}
                            </p>
                        </div>

                        <div>
                            <p className="font-semibold text-muted-foreground">
                                Program :
                            </p>
                            <p className="mt-1">{user.program.name}</p>
                        </div>

                        <div className="col-span-2">
                            <p className="font-semibold text-muted-foreground">
                                Running Courses :
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2">
                                {user.courses && user.courses.length > 0
                                    ? user.courses.map((course) => (
                                          <Badge key={course.id}>
                                              {course.name}
                                          </Badge>
                                      ))
                                    : 'No Courses'}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <p className="font-semibold text-muted-foreground">
                                Badges Earned :
                            </p>
                            <div className="mt-1 flex w-full flex-wrap gap-2 rounded-full py-0.5 text-xs">
                                {user.courses && user.courses.length > 0
                                    ? user.courses.map((course) => (
                                          <Badge
                                              className="bg-emerald-600"
                                              key={course.id}
                                          >
                                              Badge
                                          </Badge>
                                      ))
                                    : 'No Courses'}
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold text-muted-foreground">
                                CV :
                            </p>
                            <div className="mt-1 w-fit cursor-pointer rounded-full bg-emerald-600 px-3 py-0.5 text-xs hover:bg-emerald-700">
                                Click here for CV
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold text-muted-foreground">
                                Skills :
                            </p>
                            <div className="mt-1 text-muted-foreground">
                                #CSS, #JavaScript, #HTML
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs Section */}
                <Tabs defaultValue="posts" className="mt-10 w-full">
                    <TabsList className="mx-auto mb-6 grid w-1/3 grid-cols-3 rounded-xl">
                        <TabsTrigger
                            value="posts"
                            className="text-sm md:text-base"
                        >
                            <BookOpenText className="h-5 w-5" /> Classes
                        </TabsTrigger>
                        <TabsTrigger
                            value="liked"
                            className="text-sm md:text-base"
                        >
                            <SquarePlay className="h-5 w-5" /> Shorts
                        </TabsTrigger>
                        <TabsTrigger
                            value="saved"
                            className="text-sm md:text-base"
                        >
                            <NotebookPen className="h-5 w-5" /> Notes
                        </TabsTrigger>
                    </TabsList>

                    {/* Classes */}
                    <TabsContent value="posts">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {user.classrooms && user.classrooms.length > 0
                                ? user.classrooms.map((classroom) => (
                                      <ClassRoomCard
                                          key={classroom.id}
                                          classroom={classroom}
                                          userProp={user}
                                      />
                                  ))
                                : 'No Classes'}
                        </div>
                    </TabsContent>

                    {/* Liked */}
                    <TabsContent value="liked">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {user.shorts && user.shorts.length > 0
                                ? user.shorts.map((short) => (
                                      <ShortCard
                                          key={short.id}
                                          short={short}
                                          seconds={0}
                                          onNext={() => null}
                                      />
                                  ))
                                : 'No Shorts'}
                        </div>
                    </TabsContent>

                    {/* Notes (Replaced Content) */}
                    <TabsContent value="saved">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <p className="mt-10 text-center text-lg">
                                No notes yet.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};

export default UserShow;

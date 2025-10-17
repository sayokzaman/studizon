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
import { BookOpenText, NotebookPen, SquarePlay, UserPlusIcon, UserXIcon } from 'lucide-react';
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
            <div className="mx-auto max-w-6xl p-6">
                {/* Profile Header */}
                <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-muted/50 p-6 shadow-md md:flex-row">
                    {/* Profile Image and Basic Info */}
                    <div className="flex items-center gap-5">
                        <img
                            src="https://cdn.pixabay.com/photo/2023/07/13/15/06/avatar-8125365_960_720.png"
                            alt="Prof"
                            className="h-28 w-28 rounded-full border-4 border-zinc-700 object-cover shadow-md"
                        />
                        <div>
                            <h2 className="text-2xl font-semibold">
                                {user.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {user.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                70 Follows • 5K Followers
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

                    <CardContent className="grid grid-cols-2 text-sm">
                        {/* LEFT SIDE */}
                        <div className="flex flex-col gap-2">
                            <div>
                                <p className="font-semibold text-muted-foreground">
                                    Department :
                                </p>
                                <p className="mt-1">
                                    {/* {user.program.department.name} */}
                                </p>
                            </div>

                            <div>
                                <p className="font-bold text-muted-foreground">
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

                            <div>
                                <p className="font-bold text-muted-foreground">
                                    Expert In :
                                </p>
                                <p className="mt-1">SPL, DBMS</p>
                            </div>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="flex flex-col gap-2">
                            <div>
                                <p className="pt-2 font-bold text-muted-foreground">
                                    Badges :
                                </p>
                                <span className="mt-1 rounded-full bg-emerald-600 px-3 py-0.5 text-xs">
                                    Points
                                </span>
                            </div>

                            <div>
                                <p className="font-bold text-muted-foreground">
                                    CV :
                                </p>
                                <span className="mt-1 cursor-pointer rounded-full bg-emerald-600 px-3 py-0.5 text-xs hover:bg-emerald-700">
                                    Click here for CV
                                </span>
                            </div>

                            <div>
                                <p className="font-bold text-muted-foreground">
                                    Skills :
                                </p>
                                <span className="mt-1 text-muted-foreground">
                                    #CSS, #JavaScript, #HTML
                                </span>
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

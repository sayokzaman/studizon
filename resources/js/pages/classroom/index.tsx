import { ClassRoomCard } from '@/components/class-room-card';
import { DatePicker } from '@/components/date-picker';
import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFetchList } from '@/hooks/use-fetch-list';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { ClassRoom } from '@/types/classroom';
import { Course } from '@/types/course';
import { Paginated } from '@/types/paginate';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ListFilterIcon } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Classroom',
        href: '/classroom',
    },
];

type Props = {
    classrooms: Paginated<ClassRoom>;
    user: User;
    myClasses: ClassRoom[];
    joinedClasses: ClassRoom[];
    filters: {
        search?: string;
        scheduled_date?: string;
        starts_at?: string;
        ends_at?: string;
        course_ids: number[];
        per_page?: number;
    };
};

const ClassroomIndex = ({
    classrooms,
    myClasses,
    joinedClasses,
    filters: initialFilters,
}: Props) => {
    const [activeTab, setActiveTab] = useState('explore');

    const [searchCourse, setSearchCourse] = useState('');
    const { data: courses } = useFetchList<Course, { program_id: number }>({
        url: '/get-courses',
        search: searchCourse,
    });
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);

    const [filters, setFilters] = useState({
        search: initialFilters?.search ?? '',
        scheduled_date: initialFilters?.scheduled_date ?? '',
        starts_at: initialFilters?.starts_at ?? '',
        ends_at: initialFilters?.ends_at ?? '',
        course_ids: initialFilters?.course_ids ?? [],
        per_page: initialFilters?.per_page ?? 20,
    });

    const applyFilters = () => {
        router.get(
            '/classroom',
            {
                search: filters.search,
                scheduled_date: filters.scheduled_date,
                starts_at: filters.starts_at,
                ends_at: filters.ends_at,
                course_ids: filters.course_ids,
                per_page: filters.per_page,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Classroom" />

            <main className="mx-auto flex w-full max-w-7xl flex-col pb-4">
                <div className="flex flex-col justify-between gap-4 px-6 py-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-xl font-semibold">Classrooms</h2>
                    </div>

                    <div className="flex max-w-120 flex-1 gap-2">
                        <Input
                            className="w-full bg-muted-foreground/10"
                            placeholder="Search Classrooms..."
                            value={filters.search}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    search: e.target.value,
                                })
                            }
                        />

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={'outline'}>
                                    <ListFilterIcon className="size-5" />
                                    Filters
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="flex w-full flex-col gap-4 bg-background sm:w-sm">
                                <div className="grid gap-2">
                                    <Label>Courses</Label>
                                    <MultiSelect
                                        options={courses.map((course) => ({
                                            value: course.id.toString(),
                                            label: course.name,
                                        }))}
                                        searchValue={searchCourse}
                                        onSearchChange={setSearchCourse}
                                        value={selectedCourses?.map((course) =>
                                            course.id.toString(),
                                        )}
                                        onValueChange={(selected) => {
                                            const selectedCourseObjects =
                                                courses.filter((course) =>
                                                    selected.includes(
                                                        course.id.toString(),
                                                    ),
                                                );

                                            setSelectedCourses(
                                                selectedCourseObjects,
                                            );

                                            setFilters({
                                                ...filters,
                                                course_ids:
                                                    selectedCourseObjects.map(
                                                        (course) => course.id,
                                                    ),
                                            });
                                        }}
                                        maxCount={3}
                                        placeholder="Select courses"
                                        variant="inverted"
                                        animation={2}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Scheduled Date</Label>
                                    <DatePicker
                                        value={
                                            filters.scheduled_date
                                                ? (() => {
                                                      const [y, m, d] =
                                                          filters.scheduled_date
                                                              .split('-')
                                                              .map(Number);
                                                      return new Date(
                                                          y,
                                                          (m || 1) - 1,
                                                          d || 1,
                                                      );
                                                  })()
                                                : undefined
                                        }
                                        onChange={(d) =>
                                            setFilters({
                                                ...filters,
                                                scheduled_date: d
                                                    ? format(d, 'yyyy-MM-dd')
                                                    : '',
                                            })
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Starts After</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="time"
                                            step="1"
                                            value={
                                                filters.starts_at
                                                    ? (filters.starts_at.split(
                                                          ' ',
                                                      )[1] ?? '')
                                                    : ''
                                            }
                                            onChange={(e) => {
                                                const time =
                                                    e.target.value.length === 5
                                                        ? `${e.target.value}:00`
                                                        : e.target.value;
                                                const date = filters.starts_at
                                                    ? filters.starts_at.split(
                                                          ' ',
                                                      )[0]
                                                    : '';
                                                setFilters({
                                                    ...filters,
                                                    starts_at: date
                                                        ? `${date} ${time}`
                                                        : time,
                                                });
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Ends Before</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="time"
                                            step="1"
                                            value={
                                                filters.ends_at
                                                    ? (filters.ends_at.split(
                                                          ' ',
                                                      )[1] ?? '')
                                                    : ''
                                            }
                                            onChange={(e) => {
                                                const time =
                                                    e.target.value.length === 5
                                                        ? `${e.target.value}:00`
                                                        : e.target.value;
                                                const date = filters.ends_at
                                                    ? filters.ends_at.split(
                                                          ' ',
                                                      )[0]
                                                    : '';
                                                setFilters({
                                                    ...filters,
                                                    ends_at: date
                                                        ? `${date} ${time}`
                                                        : time,
                                                });
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 border-t pt-4">
                                    <Button
                                        variant={'outline'}
                                        onClick={() => {
                                            setSelectedCourses([]);
                                            setFilters({
                                                search: '',
                                                scheduled_date: '',
                                                starts_at: '',
                                                ends_at: '',
                                                course_ids: [],
                                                per_page: filters.per_page,
                                            });
                                            router.get(
                                                '/classroom',
                                                {},
                                                {
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                    replace: true,
                                                },
                                            );
                                        }}
                                    >
                                        Clear Filters
                                    </Button>

                                    <Button onClick={applyFilters}>
                                        Apply
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
                        <Link href="/classroom/create">
                            <Button className="w-full sm:w-auto">
                                Create New Classroom
                            </Button>
                        </Link>
                    </div>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="justify-center px-6"
                >
                    <TabsList className="flex w-full justify-center gap-6 border bg-muted-foreground/10 p-0">
                        <TabsTrigger
                            value="explore"
                            className="h-10 cursor-pointer border-0"
                        >
                            Explore
                        </TabsTrigger>
                        <TabsTrigger
                            value="joined"
                            className="h-10 cursor-pointer border-0"
                        >
                            Joined
                        </TabsTrigger>
                        <TabsTrigger
                            value="myClasses"
                            className="h-10 cursor-pointer border-0"
                        >
                            My Classes
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="explore">
                        <div className="w-full pt-4">
                            {classrooms.data ? (
                                classrooms.data.length === 0 ? (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        No classrooms available.
                                    </p>
                                ) : (
                                    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                        {classrooms.data.map((classroom) => (
                                            <ClassRoomCard
                                                key={classroom.id}
                                                classroom={classroom}
                                            />
                                        ))}
                                    </ul>
                                )
                            ) : null}
                        </div>
                    </TabsContent>

                    <TabsContent value="joined">
                        <div className="w-full pt-4">
                            {joinedClasses ? (
                                joinedClasses.length === 0 ? (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        No Classrooms available.
                                    </p>
                                ) : (
                                    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                        {joinedClasses.map((classroom) => (
                                            <ClassRoomCard
                                                key={classroom.id}
                                                classroom={classroom}
                                            />
                                        ))}
                                    </ul>
                                )
                            ) : null}
                        </div>
                    </TabsContent>

                    <TabsContent value="myClasses">
                        <div className="w-full pt-4">
                            {myClasses ? (
                                myClasses.length === 0 ? (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        No Classrooms available.
                                    </p>
                                ) : (
                                    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                        {myClasses.map((classroom) => (
                                            <ClassRoomCard
                                                key={classroom.id}
                                                classroom={classroom}
                                            />
                                        ))}
                                    </ul>
                                )
                            ) : null}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </AppLayout>
    );
};

export default ClassroomIndex;

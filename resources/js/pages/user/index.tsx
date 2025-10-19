import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useFetchList } from '@/hooks/use-fetch-list';
import AppLayout from '@/layouts/app-layout';
import UserCard from '@/pages/user/user-card';
import { BreadcrumbItem, User } from '@/types';
import { Course } from '@/types/course';
import { Head, router } from '@inertiajs/react';
import { ListFilterIcon } from 'lucide-react';
import { useState } from 'react';

type Props = {
    users: User[];
    filters: {
        search: string;
        course_ids: number[];
        following_only?: boolean;
        sort_by?: 'followers' | 'following' | 'classrooms' | '';
        sort_dir?: 'asc' | 'desc';
        classroom_status?:
            | 'scheduled'
            | 'completed'
            | 'cancelled'
            | 'in_progress'
            | '';
        per_page: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'People',
        href: '/people',
    },
];

const UserIndex = ({ users, filters: initialFilters }: Props) => {
    const [searchCourse, setSearchCourse] = useState('');
    const { data: courses } = useFetchList<Course, { program_id: number }>({
        url: '/get-courses',
        search: searchCourse,
    });
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);

    const [filters, setFilters] = useState({
        search: initialFilters?.search ?? '',
        course_ids: initialFilters?.course_ids ?? [],
        following_only: initialFilters?.following_only ?? false,
        sort_by: initialFilters?.sort_by ?? '',
        sort_dir: initialFilters?.sort_dir ?? 'desc',
        classroom_status: initialFilters?.classroom_status ?? '',
        per_page: initialFilters?.per_page ?? 20,
    });

    const applyFilters = () => {
        router.get(
            '/people',
            {
                search: filters.search,
                course_ids: filters.course_ids,
                following_only: filters.following_only,
                sort_by: filters.sort_by,
                sort_dir: filters.sort_dir,
                classroom_status: filters.classroom_status,
                per_page: filters.per_page,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="People" />

            <main className="flex flex-col items-center justify-center px-4">
                <div className="flex w-full max-w-7xl flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-xl font-semibold">People</h2>
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
                                    <Label>Following Only</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="following-only"
                                            type="checkbox"
                                            checked={!!filters.following_only}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    following_only:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        <Label htmlFor="following-only">
                                            Show only users I follow
                                        </Label>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Sort By</Label>
                                    <select
                                        className="rounded border bg-background p-2"
                                        value={filters.sort_by}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                sort_by: e.target
                                                    .value as typeof filters.sort_by,
                                            })
                                        }
                                    >
                                        <option value="">Default</option>
                                        <option value="followers">
                                            Followers
                                        </option>
                                        <option value="following">
                                            Following
                                        </option>
                                        <option value="classrooms">
                                            Classrooms
                                        </option>
                                    </select>
                                </div>

                                {filters.sort_by === 'classrooms' && (
                                    <div className="grid gap-2">
                                        <Label>Classroom Status</Label>
                                        <select
                                            className="rounded border bg-background p-2"
                                            value={filters.classroom_status}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    classroom_status: e.target
                                                        .value as typeof filters.classroom_status,
                                                })
                                            }
                                        >
                                            <option value="">Any</option>
                                            <option value="scheduled">
                                                Scheduled
                                            </option>
                                            <option value="in_progress">
                                                In Progress
                                            </option>
                                            <option value="completed">
                                                Completed
                                            </option>
                                            <option value="cancelled">
                                                Cancelled
                                            </option>
                                        </select>
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label>Sort Direction</Label>
                                    <select
                                        className="rounded border bg-background p-2"
                                        value={filters.sort_dir}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                sort_dir: e.target.value as
                                                    | 'asc'
                                                    | 'desc',
                                            })
                                        }
                                    >
                                        <option value="desc">Descending</option>
                                        <option value="asc">Ascending</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 border-t pt-4">
                                    <Button
                                        variant={'outline'}
                                        onClick={() => {
                                            setSelectedCourses([]);
                                            setFilters({
                                                search: '',
                                                course_ids: [],
                                                following_only: false,
                                                sort_by: '',
                                                sort_dir: 'desc',
                                                classroom_status: '',
                                                per_page: filters.per_page,
                                            });
                                            router.get(
                                                '/people',
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

                    <div />
                </div>

                <div className="grid w-full max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((user) => (
                        <UserCard user={user} />
                    ))}
                </div>
            </main>
        </AppLayout>
    );
};

export default UserIndex;

import CoverImageInput from '@/components/image-input';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useFetchList } from '@/hooks/use-fetch-list';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Course } from '@/types/course';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { File } from 'lucide-react';
import React, { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Classroom', href: '/classroom' },
    { title: 'Create', href: '/classroom/create' },
];

const initialData = {
    course: null as Course | null,
    course_id: null as number | null,
    topic: '',
    join_link: '',
    description: '',
    thumbnail: null as File | null,
    cost: 0,
    capacity: 20,
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '',
    end_time: '',
    starts_at: '',
    ends_at: '',
    notes: [] as { file: File; progress: number }[],
};

const CreateClassroom = () => {
    const { data, setData, post, processing, errors, reset } =
        useForm(initialData);

    const [searchCourse, setSearchCourse] = useState('');
    const [opeCoursesPopover, setOpenCoursesPopover] = useState(false);

    const widthRef = useRef<HTMLButtonElement>(null);

    const isMobile = useIsMobile();

    const { data: courses, loading: courseLoading } = useFetchList<
        Course,
        { only_user_program: boolean }
    >({
        url: '/get-courses',
        params: { only_user_program: true },
        search: searchCourse,
    });

    const [imagePreview, setImagePreview] = useState<string>('');

    const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map((file) => ({
                file,
                progress: 0,
            }));
            setData('notes', [...data.notes, ...newFiles]);

            // Fake upload simulation
            newFiles.forEach((note) => {
                const interval = setInterval(() => {
                    // setData(
                    //     'notes',
                    //     data.notes.map((n) => {
                    //         if (n.file.name === note.file.name) {
                    //             return {
                    //                 ...n,
                    //                 progress: Math.min(100, n.progress + 10),
                    //             };
                    //         }
                    //         return n;
                    //     }),
                    // );
                    // setNotes((prev) => {
                    //     const copy = [...prev];
                    //     const index = prev.findIndex(
                    //         (n) => n.file.name === note.file.name,
                    //     );
                    //     if (index !== -1) {
                    //         copy[index].progress = Math.min(
                    //             100,
                    //             copy[index].progress + 10,
                    //         );
                    //     }
                    //     return copy;
                    // });
                }, 400);

                setTimeout(() => clearInterval(interval), 5000);
            });
        }
    };

    const removeNote = (name: string) => {
        setData(
            'notes',
            data.notes.filter((n) => n.file.name !== name),
        );
    };

    const padSeconds = (t: string) => (t.length === 5 ? `${t}:00` : t);

    const toDateTime = (dateStr: string, timeStr: string) => {
        const t = padSeconds(timeStr || '00:00:00');
        return `${dateStr} ${t}`;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Derive starts_at/ends_at from date + time
        const startsAt = toDateTime(data.scheduled_date, data.start_time);
        const endsAt = toDateTime(
            data.scheduled_date,
            data.end_time || data.start_time,
        );
        setData('starts_at', startsAt);
        setData('ends_at', endsAt);
        post('/classroom', {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Classroom" />

            <main className="mx-auto flex w-full max-w-7xl flex-col pb-4">
                <div className="flex flex-col justify-between gap-4 border-b px-6 py-4 sm:flex-row sm:items-center">
                    <div className="flex h-9 items-center">
                        <h2 className="text-xl font-semibold">
                            Create Classroom
                        </h2>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-6 px-6 py-6"
                >
                    <Card className="flex-row">
                        <CardHeader className="w-4/12">
                            <CardTitle>Course & Topic Details</CardTitle>
                            <CardDescription>
                                Fill in the classroom details
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex w-8/12 flex-col gap-4">
                            <div className="group relative grid gap-2">
                                <Label>
                                    Course{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Popover
                                    open={opeCoursesPopover}
                                    onOpenChange={setOpenCoursesPopover}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="justify-start"
                                            ref={widthRef}
                                        >
                                            {data.course ? (
                                                <>{data.course.name}</>
                                            ) : (
                                                <>Select course</>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="p-0"
                                        style={{
                                            width: widthRef.current
                                                ?.offsetWidth,
                                        }}
                                        align="start"
                                    >
                                        <Command
                                            shouldFilter={false}
                                            className="relative"
                                        >
                                            {courseLoading && (
                                                <Spinner className="absolute top-2.5 right-4" />
                                            )}
                                            <CommandInput
                                                value={searchCourse}
                                                onValueChange={setSearchCourse}
                                                placeholder="Search Department..."
                                            />
                                            <CommandList>
                                                <CommandGroup
                                                    className="max-h-60 overflow-y-auto"
                                                    heading="Courses"
                                                >
                                                    {courses.map((course) => (
                                                        <CommandItem
                                                            key={course.id}
                                                            value={course.id.toString()}
                                                            onSelect={(
                                                                value,
                                                            ) => {
                                                                setData(
                                                                    'course',
                                                                    courses.find(
                                                                        (c) =>
                                                                            c.id.toString() ===
                                                                            value,
                                                                    ) || null,
                                                                );
                                                                setData(
                                                                    'course_id',
                                                                    Number(
                                                                        value,
                                                                    ),
                                                                );
                                                                setSearchCourse(
                                                                    '',
                                                                );
                                                                setOpenCoursesPopover(
                                                                    false,
                                                                );
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            <Badge className="mr-2 w-16">
                                                                {course.code}
                                                            </Badge>
                                                            {course.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <InputError
                                    message={errors['course_id']}
                                    className="text-xs"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>
                                    Topic{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    value={data.topic}
                                    onChange={(e) =>
                                        setData('topic', e.target.value)
                                    }
                                    placeholder="Enter topic"
                                />
                                <InputError
                                    message={errors.topic}
                                    className="text-xs"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Write course description..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-row">
                        <CardHeader className="w-4/12">
                            <CardTitle>Classroom Details</CardTitle>
                            <CardDescription>
                                Fill in the classroom details
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex w-8/12 flex-col gap-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label>
                                        Cost{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Slider
                                        value={[data.cost]}
                                        onValueChange={(value) =>
                                            setData('cost', value[0])
                                        }
                                        max={500}
                                        step={10}
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Selected: ${data.cost}
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>
                                        Student Capacity{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Slider
                                        value={[data.capacity]}
                                        onValueChange={(value) =>
                                            setData('capacity', value[0])
                                        }
                                        max={50}
                                        step={5}
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Selected: {data.capacity} student
                                    </p>
                                    <InputError
                                        message={errors.capacity}
                                        className="text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Classroom link
                                </label>
                                <Input
                                    value={data.join_link}
                                    onChange={(e) =>
                                        setData('join_link', e.target.value)
                                    }
                                    placeholder="e.g. Zoom, Google Meet, etc."
                                />
                                <InputError
                                    message={errors.join_link}
                                    className="text-xs"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-6">
                        <Card className="w-4/12">
                            <CardContent>
                                <label className="mb-1 block text-sm font-medium">
                                    Thumbnail
                                </label>

                                <CoverImageInput
                                    initialImage={imagePreview} // show existing product image when editing
                                    onChange={(file, previewUrl) => {
                                        // file + preview from the component
                                        setData('thumbnail', file); // ✅ Inertia will send this file
                                        setImagePreview(previewUrl ?? '');
                                    }}
                                    aspectClass={
                                        isMobile
                                            ? 'aspect-[5/2]'
                                            : 'aspect-[2/1]'
                                    }
                                />
                                <InputError
                                    message={errors.thumbnail}
                                    className="text-xs"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="flex-row">
                        <CardHeader className="w-4/12">
                            <CardTitle>Date & Time</CardTitle>
                            <CardDescription>
                                Fill in the classroom details
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex w-8/12 flex-col gap-6">
                            <div className="grid gap-2">
                                <Label>
                                    Scheduled Date{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-start"
                                        >
                                            {data.scheduled_date
                                                ? format(
                                                      data.scheduled_date,
                                                      'PPP',
                                                  )
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={
                                                new Date(data.scheduled_date)
                                            }
                                            onSelect={(e) =>
                                                setData(
                                                    'scheduled_date',
                                                    format(
                                                        e as Date,
                                                        'yyyy-MM-dd',
                                                    ),
                                                )
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                                <InputError
                                    message={errors.scheduled_date}
                                    className="text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <Label>
                                        Start Time{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        value={data.start_time}
                                        onChange={(e) =>
                                            setData(
                                                'start_time',
                                                e.target.value + ':00',
                                            )
                                        }
                                        type="time"
                                    />
                                    <InputError
                                        message={errors.start_time}
                                        className="text-xs"
                                    />
                                </div>
                                <div>
                                    <Label>
                                        End Time{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        value={data.end_time}
                                        onChange={(e) =>
                                            setData(
                                                'end_time',
                                                e.target.value + ':00',
                                            )
                                        }
                                        type="time"
                                    />
                                    <InputError
                                        message={errors.end_time}
                                        className="text-xs"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" className="w-full">
                        Create Classroom
                    </Button>
                </form>
            </main>

            {/* <div className="min-h-screen bg-background p-4 text-foreground">
                <nav className="p-4 shadow-md">
                    <h1 className="flex justify-center text-xl font-bold">
                        <b>CREATE CLASS-ROOM</b>
                    </h1>
                </nav>

                <form
                    onSubmit={handleSubmit}
                    className="mx-auto mt-4 max-w-3xl space-y-6 rounded-2xl bg-card p-6 shadow"
                >
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Notes Files
                        </label>
                        <div className="rounded-xl border-1 border-dashed p-6 text-center">
                            <Upload className="mx-auto mb-2 h-8 w-8 text-gray-500" />
                            <p className="text-sm text-gray-600">
                                Drag & drop or click to upload notes
                            </p>
                            <Input
                                type="file"
                                multiple
                                onChange={handleNotesChange}
                                className="mt-2"
                            />
                            <InputError
                                message={errors.notes}
                                className="text-xs"
                            />
                        </div>

                        <div className="mt-4 space-y-3">
                            {data.notes.map((note) => (
                                <div
                                    key={note.file.name}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <File className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {note.file.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {(
                                                    note.file.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(1)}{' '}
                                                MB
                                            </p>
                                            <div className="mt-1 h-1 rounded bg-gray-200">
                                                <div
                                                    className="h-1 rounded bg-primary"
                                                    style={{
                                                        width: `${note.progress}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            removeNote(note.file.name)
                                        }
                                    >
                                        <X className="h-5 w-5 text-gray-500 hover:text-red-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    

                    <Button type="submit" className="w-full">
                        Create Classroom
                    </Button>
                </form>
            </div> */}
        </AppLayout>
    );
};

export default CreateClassroom;

import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Course } from '@/types/course';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { File, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Classroom', href: '/classroom' },
    { title: 'Create', href: '/classroom/create' },
];

const initialData = {
    course_id: null as number | null,
    topic: '',
    description: '',
    thumbnail: null as File | null,
    cost: 0,
    capacity: 20,
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '',
    end_time: '',
    notes: [] as { file: File; progress: number }[],
};

const CreateClassroom = () => {
    const { data, setData, post, processing, errors, reset } =
        useForm(initialData);

    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get('/get-courses');
                setCourses(res.data);
                console.log('Courses:', res.data);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchCourses();
    }, []);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('thumbnail', e.target.files[0]);
        }
    };

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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/classroom', {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Classroom" />

            <div className="min-h-screen bg-background p-4 text-foreground">
                {/* Navigation */}
                <nav className="p-4 shadow-md">
                    <h1 className="flex justify-center text-xl font-bold">
                        <b>CREATE CLASS-ROOM</b>
                    </h1>
                </nav>

                {/* Main Form */}
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto mt-4 max-w-3xl space-y-6 rounded-2xl bg-card p-6 shadow"
                >
                    {/* Select course */}
                    <div>
                        <label className="block text-sm font-medium">
                            Select course
                        </label>
                        <Select
                            value={data.course_id?.toString() || ''}
                            onValueChange={(value) =>
                                setData('course_id', Number(value))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course) => (
                                    <SelectItem
                                        key={course.id}
                                        value={course.id.toString()}
                                    >
                                        <Badge className="mr-2 w-16">
                                            {course.code}
                                        </Badge>
                                        {course.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError
                            message={errors.course_id}
                            className="text-xs"
                        />
                    </div>

                    {/* Topic */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Topic
                        </label>
                        <Input
                            value={data.topic}
                            onChange={(e) => setData('topic', e.target.value)}
                            placeholder="Enter topic"
                        />
                        <InputError
                            message={errors.topic}
                            className="text-xs"
                        />
                    </div>

                    {/* Cost & People */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Cost ($)
                            </label>
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
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Student Capacity
                            </label>
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

                    {/* Description */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Description
                        </label>
                        <Textarea
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Write course description..."
                        />
                    </div>

                    {/* Thumbnail Uploader */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Thumbnail
                        </label>
                        <div className="text-cente rounded-xl border-1 border-dashed p-6">
                            <Upload className="mx-auto mb-2 h-8 w-8 text-gray-500" />
                            <p className="text-sm text-gray-600">
                                Click to upload thumbnail
                            </p>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="mt-2"
                            />
                            <InputError
                                message={errors.thumbnail}
                                className="text-xs"
                            />
                        </div>
                        {data.thumbnail && (
                            <div className="mt-3 h-32 w-32 overflow-hidden rounded-lg border">
                                <img
                                    src={URL.createObjectURL(data.thumbnail)}
                                    alt="Thumbnail"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    {/* Notes File Uploader */}
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

                        {/* Uploaded files list */}
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
                                            {/* Progress Bar */}
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

                    {/* Date Picker */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Date
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    {data.scheduled_date
                                        ? format(data.scheduled_date, 'PPP')
                                        : 'Pick a date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={new Date(data.scheduled_date)}
                                    onSelect={(e) =>
                                        setData(
                                            'scheduled_date',
                                            format(e as Date, 'yyyy-MM-dd'),
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

                    {/* Time Pickers */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Start Time
                            </label>
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
                            <label className="mb-1 block text-sm font-medium">
                                End Time
                            </label>
                            <Input
                                value={data.end_time}
                                onChange={(e) =>
                                    setData('end_time', e.target.value + ':00')
                                }
                                type="time"
                            />
                            <InputError
                                message={errors.end_time}
                                className="text-xs"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full">
                        Create Classroom
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
};

export default CreateClassroom;

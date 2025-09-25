'use client';

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
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { File, Upload, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Classroom', href: '/classroom' },
    { title: 'Create', href: '/classroom/create' },
];

const CreateClassroom = () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [cost, setCost] = useState([50]);
    const [student, setStudent] = useState([20]);

    // Thumbnail
    const [thumbnail, setThumbnail] = useState<File | null>(null);

    // Notes files
    const [notes, setNotes] = useState<{ file: File; progress: number }[]>([]);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setThumbnail(e.target.files[0]);
        }
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map((file) => ({
                file,
                progress: 0,
            }));
            setNotes((prev) => [...prev, ...newFiles]);

            // Fake upload simulation
            newFiles.forEach((note, idx) => {
                const interval = setInterval(() => {
                    setNotes((prev) => {
                        const copy = [...prev];
                        const index = prev.findIndex(
                            (n) => n.file.name === note.file.name,
                        );
                        if (index !== -1) {
                            copy[index].progress = Math.min(
                                100,
                                copy[index].progress + 10,
                            );
                        }
                        return copy;
                    });
                }, 400);

                setTimeout(() => clearInterval(interval), 5000);
            });
        }
    };

    const removeNote = (name: string) => {
        setNotes((prev) => prev.filter((n) => n.file.name !== name));
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
                <div className="mx-auto mt-4 max-w-3xl space-y-6 rounded-2xl bg-card p-6 shadow">
                    {/* Select course */}
                    <div>
                        <label className="block text-sm font-medium">
                            Select course
                        </label>
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="math">
                                    Mathematics
                                </SelectItem>
                                <SelectItem value="science">Science</SelectItem>
                                <SelectItem value="english">English</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Topic */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Topic
                        </label>
                        <Input placeholder="Enter topic" />
                    </div>

                    {/* Cost & People */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Cost ($)
                            </label>
                            <Slider
                                value={cost}
                                onValueChange={setCost}
                                max={500}
                                step={10}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Selected: ${cost[0]}
                            </p>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Student
                            </label>
                            <Slider
                                value={student}
                                onValueChange={setStudent}
                                max={50}
                                step={5}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Selected: {student[0]} student
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Description
                        </label>
                        <Textarea placeholder="Write course description..." />
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
                        </div>
                        {thumbnail && (
                            <div className="mt-3 h-32 w-32 overflow-hidden rounded-lg border">
                                <img
                                    src={URL.createObjectURL(thumbnail)}
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
                        </div>

                        {/* Uploaded files list */}
                        <div className="mt-4 space-y-3">
                            {notes.map((note) => (
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
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    {date ? format(date, 'PPP') : 'Pick a date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Time Pickers */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Start Time
                            </label>
                            <Input type="time" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                End Time
                            </label>
                            <Input type="time" />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button className="w-full">Create Classroom</Button>
                </div>
            </div>
        </AppLayout>
    );
};

export default CreateClassroom;

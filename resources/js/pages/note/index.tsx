import NoteCard from '@/components/note-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { useFetchList } from '@/hooks/use-fetch-list';
import AppLayout from '@/layouts/app-layout';
import { Course } from '@/types/course';
import { Note } from '@/types/note';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type Props = {
    notes: Note[];
};

const NotesIndex = ({ notes: initialNotes }: Props) => {
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [openModal, setOpenModal] = useState(false);
    const [updatedNote, setUpdatedNote] = useState<Note | null>(null);
    // Course selection
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [searchCourse, setSearchCourse] = useState('');
    const [openCoursesPopover, setOpenCoursesPopover] = useState(false);
    const widthRef = useRef<HTMLButtonElement>(null);

    const { data: courses, loading: courseLoading } = useFetchList<
        Course,
        { only_user_program: boolean }
    >({
        url: '/get-courses',
        params: { only_user_program: true },
        search: searchCourse,
    });

    const form = useForm({
        course_id: selectedCourse?.id || '',
        description: '',
        attachments: [] as File[],
    });

    const handleCourseSelect = (course: Course) => {
        setSelectedCourse(course);
        form.setData('course_id', course.id);
        setOpenCoursesPopover(false);
        setSearchCourse('');
    };

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const fileArray = Array.from(e.target.files);
        form.setData('attachments', [...form.data.attachments, ...fileArray]);
    };

    const removeFile = (index: number) => {
        form.setData(
            'attachments',
            form.data.attachments.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/notes', {
            onSuccess: (pageProps) => {
                if (pageProps.props.note) {
                    setNotes((prev) => [pageProps.props.note as Note, ...prev]);
                }
                form.reset();
                setSelectedCourse(null);
                setOpenModal(false);
                window.location.reload();
            },
        });
    };

    useEffect(() => {
        const handleUpdateNote = () => {
            if (updatedNote) {
                setNotes((prevNotes) =>
                    prevNotes.map((note) =>
                        note.id === updatedNote.id ? updatedNote : note,
                    ),
                );
            }
        };
        handleUpdateNote();
    }, [updatedNote]);

    // Infinite scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastNoteRef = (node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                fetchMoreNotes();
            }
        });

        if (node) observer.current.observe(node);
    };

    const fetchMoreNotes = async () => {
        if (!hasMore) return;
        setLoading(true);

        try {
            const res = await fetch(`/notes/load-more?page=${page + 1}`);
            const json = await res.json();

            setNotes((prev) => [...prev, ...json.data]);
            setPage((p) => p + 1);
            if (json.current_page >= json.last_page) setHasMore(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Notes', href: '/notes' }]}>
            <Head title="Notes" />

            <main className="flex flex-col gap-4 p-4">
                {/* Create Note Button */}
                <div className="mb-4 flex justify-end">
                    <Button onClick={() => setOpenModal(true)}>
                        Create New Note
                    </Button>
                </div>

                {/* Notes Feed */}
                <div className="flex flex-col gap-4">
                    {notes.map((note, idx) => {
                        if (idx === notes.length - 1) {
                            return (
                                <div
                                    key={note.id}
                                    ref={lastNoteRef}
                                    className="transition-opacity duration-500"
                                >
                                    <NoteCard
                                        setUpdatedNote={setUpdatedNote}
                                        note={note}
                                    />
                                </div>
                            );
                        }
                        return (
                            <div
                                key={note.id}
                                className="transition-opacity duration-500"
                            >
                                <NoteCard
                                    setUpdatedNote={setUpdatedNote}
                                    note={note}
                                />
                            </div>
                        );
                    })}

                    {loading && (
                        <div className="mt-4 text-center">
                            <Spinner />
                        </div>
                    )}

                    {!hasMore && (
                        <p className="mt-4 text-center text-sm text-muted-foreground">
                            No more notes
                        </p>
                    )}
                </div>

                {/* Create Note Modal */}
                {openModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="relative w-full max-w-lg rounded-2xl bg-card p-6">
                            <h2 className="mb-4 text-lg font-semibold">
                                Create New Note
                            </h2>
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-4"
                            >
                                {/* Course selector */}
                                <Popover
                                    open={openCoursesPopover}
                                    onOpenChange={setOpenCoursesPopover}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="justify-start"
                                            ref={widthRef}
                                        >
                                            {selectedCourse
                                                ? selectedCourse.name
                                                : 'Select course'}
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
                                        <Command shouldFilter={false}>
                                            {courseLoading && (
                                                <Spinner className="absolute top-2.5 right-4" />
                                            )}
                                            <CommandInput
                                                value={searchCourse}
                                                onValueChange={setSearchCourse}
                                                placeholder="Search course..."
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
                                                            onSelect={() =>
                                                                handleCourseSelect(
                                                                    course,
                                                                )
                                                            }
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

                                {/* Description */}
                                <textarea
                                    value={form.data.description}
                                    onChange={(e) =>
                                        form.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Write your note..."
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    rows={4}
                                />
                                {form.errors.description && (
                                    <p className="text-xs text-red-500">
                                        {form.errors.description}
                                    </p>
                                )}

                                {/* Attachments */}
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFilesChange}
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {form.data.attachments.map(
                                            (file, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative rounded-md border bg-muted-foreground/10 p-1 text-xs"
                                                >
                                                    {file.name}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeFile(idx)
                                                        }
                                                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setOpenModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
                                        {form.processing
                                            ? 'Posting...'
                                            : 'Post'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </AppLayout>
    );
};

export default NotesIndex;

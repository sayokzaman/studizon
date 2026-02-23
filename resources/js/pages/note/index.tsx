import NoteCard from '@/components/note-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { resolveProfilePictureUrl } from '@/lib/utils';
import { SharedData } from '@/types';
import { Course } from '@/types/course';
import { Note } from '@/types/note';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FileText, Paperclip } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
    notes: Note[];
};

const NotesIndex = ({ notes: initialNotes }: Props) => {
    const { user } = usePage<SharedData>().props.auth;
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
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const attachmentPreviews = useMemo(
        () =>
            form.data.attachments.map((file) => ({
                isImage: file.type.startsWith('image/'),
                url: file.type.startsWith('image/')
                    ? URL.createObjectURL(file)
                    : '',
            })),
        [form.data.attachments],
    );

    useEffect(() => {
        return () => {
            attachmentPreviews.forEach((preview) => {
                if (preview.url) URL.revokeObjectURL(preview.url);
            });
        };
    }, [attachmentPreviews]);

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
        e.target.value = '';
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

            <main className="p-4">
                {/* Notes Feed */}
                <div className="flex flex-col gap-4">
                    <div className="relative mx-auto w-full max-w-md rounded-2xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage
                                    src={resolveProfilePictureUrl(
                                        user?.profile_picture,
                                    )}
                                    alt={user?.name}
                                />
                                <AvatarFallback>{user?.name}</AvatarFallback>
                            </Avatar>

                            <Button
                                variant="outline"
                                className="w-full justify-start rounded-full"
                                onClick={() => setOpenModal(true)}
                            >
                                What's on your mind?
                            </Button>

                            <div></div>
                        </div>
                    </div>
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
                        <div className="relative flex w-full max-w-lg flex-col gap-3 rounded-2xl bg-card px-5 py-4">
                            <div className="border-b pb-2">
                                <h2 className="text-center text-lg font-semibold">
                                    Create Note
                                </h2>
                            </div>

                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage
                                        src={resolveProfilePictureUrl(
                                            user?.profile_picture,
                                        )}
                                        alt={user?.name}
                                    />
                                    <AvatarFallback>
                                        {user?.name}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex flex-col">
                                    <span className="font-semibold">
                                        {user?.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date().toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-4"
                            >
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
                                    className="w-full rounded-md border px-3 py-2 text-lg"
                                    rows={4}
                                />
                                {form.errors.description && (
                                    <p className="text-xs text-red-500">
                                        {form.errors.description}
                                    </p>
                                )}

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
                                {form.errors.course_id && (
                                    <p className="text-xs text-red-500">
                                        {form.errors.course_id}
                                    </p>
                                )}

                                {/* Attachments */}
                                <div className="flex flex-col gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        onChange={handleFilesChange}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-fit"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        <Paperclip className="h-4 w-4" />
                                        Add files
                                    </Button>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                        {form.data.attachments.map(
                                            (file, idx) => {
                                                const preview =
                                                    attachmentPreviews[idx];

                                                return (
                                                    <div
                                                        key={`${file.name}-${idx}`}
                                                        className="relative overflow-hidden rounded-md border bg-muted-foreground/10 text-xs"
                                                    >
                                                        {preview?.isImage ? (
                                                            <img
                                                                src={
                                                                    preview.url
                                                                }
                                                                alt={file.name}
                                                                className="h-24 w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-24 flex-col items-center justify-center gap-1 px-2 text-center text-muted-foreground">
                                                                <FileText className="h-4 w-4" />
                                                                <span className="line-clamp-2 break-all">
                                                                    {file.name}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {preview?.isImage && (
                                                            <div className="line-clamp-1 border-t bg-card px-2 py-1 text-muted-foreground">
                                                                {file.name}
                                                            </div>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeFile(idx)
                                                            }
                                                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-[10px] text-white"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
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

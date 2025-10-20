// NoteCard.tsx
import EditNoteModal from '@/components/edit-notemodal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SharedData } from '@/types';
import { Note } from '@/types/note';
import { useForm, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronUp,
    Heart,
    MessageSquare,
    MoreHorizontal,
    Share,
} from 'lucide-react';
import { useState } from 'react';

type Props = {
    note: Note;
    setUpdatedNote: (note: Note) => void;
    onUpdated: (note: Note) => void;
};

const NoteCard = ({ note, setUpdatedNote, onUpdated }: Props) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const currentUserId = usePage<SharedData>().props.auth.user.id;
    const form = useForm();

    const nextAttachment = () => {
        if (note.attachments && activeIndex < note.attachments.length - 1) {
            setActiveIndex(activeIndex + 1);
        }
    };

    const prevAttachment = () => {
        if (note.attachments && activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
        }
    };

    const handleDownloadAll = (noteId: number) => {
        window.location.href = `/notes/${noteId}/download`;
    };

    return (
        <div className="relative mx-auto max-w-md rounded-2xl border bg-card p-4 shadow-sm">
            {/* 3-dot menu for edit/delete */}
            {note.user_id === currentUserId && (
                <div className="absolute top-2 right-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="rounded-full p-1 hover:bg-muted">
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => setEditModalOpen(true)}
                            >
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setConfirmDelete(true)}
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Header */}
            <div className="mb-2 flex items-center gap-3">
                <Avatar>
                    <AvatarImage
                        src={
                            note.author?.profile_picture ||
                            'https://avatar.iran.liara.run/public'
                        }
                        alt={note.author?.name}
                    />
                    <AvatarFallback>{note.author?.name}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold">{note.author?.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {new Date(note.created_at).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Description */}
            <p className="mb-3">{note.description}</p>

            {/* Attachments */}
            {note.attachments && note.attachments.length > 0 && (
                <div className="relative mb-3 flex flex-col items-center gap-2">
                    <div className="absolute top-0 right-0 left-0 flex justify-between p-2">
                        <div className="rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                            {activeIndex + 1} / {note.attachments.length}
                        </div>
                    </div>

                    {note.attachments[activeIndex].file_type.startsWith(
                        'image',
                    ) ? (
                        <img
                            src={`/storage/${note.attachments[activeIndex].file_path}`}
                            alt={note.attachments[activeIndex].file_name}
                            className="h-48 w-full rounded-lg object-cover"
                        />
                    ) : (
                        <div className="flex h-48 w-full items-center justify-center rounded-lg border bg-muted p-2 text-xs text-muted-foreground">
                            {note.attachments[activeIndex].file_name}
                        </div>
                    )}

                    {/* Carousel controls */}
                    {note.attachments.length > 1 && (
                        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 transform flex-col gap-1">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={prevAttachment}
                                disabled={activeIndex === 0}
                            >
                                <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={nextAttachment}
                                disabled={
                                    activeIndex === note.attachments.length - 1
                                }
                            >
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-2 flex justify-between border-t border-muted/30 pt-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                >
                    <Heart className="h-4 w-4" /> Like
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                >
                    <MessageSquare className="h-4 w-4" /> Comment
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleDownloadAll(note.id)}
                >
                    <Share className="h-4 w-4" /> Download
                </Button>
            </div>

            {/* Edit Note Modal */}
            {editModalOpen && (
                <EditNoteModal
                    note={note}
                    open={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onUpdated={(updatedNote: Note) => {
                        setUpdatedNote({ ...updatedNote });
                        Object.assign(note, updatedNote);
                        setEditModalOpen(false);
                    }}
                />
            )}

            {/* Delete Confirmation */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-sm rounded-2xl bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Are you sure?
                        </h2>
                        <p className="mb-6 text-sm text-muted-foreground">
                            This action will permanently delete your note.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setConfirmDelete(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    form.delete(`/notes/${note.id}`, {
                                        onSuccess: () =>
                                            window.location.reload(),
                                    });
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <EditNoteModal
                note={note}
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                onUpdated={(updatedNote: Note) => onUpdated(updatedNote)}
            />
        </div>
    );
};

export default NoteCard;

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Note } from '@/types/note';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

type Props = {
    note: Note;
    open: boolean;
    onClose: () => void;
    onUpdated: (note: Note) => void;
};

export default function EditNoteModal({
    note,
    open,
    onClose,
    onUpdated,
}: Props) {
    const [newAttachments, setNewAttachments] = useState<File[]>([]);
    const [removedAttachments, setRemovedAttachments] = useState<number[]>([]);

    const { data, setData, put, processing } = useForm({
        course_id: note.course_id,
        description: note.description,
        attachments: [] as File[],
        remove_attachment_ids: [] as number[],
    });

    const handleNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setNewAttachments((prev) => [...prev, ...files]);
        setData('attachments', [...data.attachments, ...files]);
    };

    const handleRemoveExisting = (id: number) => {
        setRemovedAttachments((prev) => [...prev, id]);
        setData('remove_attachment_ids', [...data.remove_attachment_ids, id]);
    };

    const handleRemoveNewFile = (index: number) => {
        const updated = [...newAttachments];
        updated.splice(index, 1);
        setNewAttachments(updated);

        const updatedFormFiles = [...data.attachments];
        updatedFormFiles.splice(index, 1);
        setData('attachments', updatedFormFiles);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/notes/${note.id}`, {
            forceFormData: true,
            onSuccess: (page) => {
                if (page.props.note) {
                    onUpdated(page.props.note as Note);
                }
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Note</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Description */}
                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                    </div>

                    {/* Existing Attachments */}
                    {note.attachments && note.attachments?.length > 0 && (
                        <div className="space-y-2">
                            <Label>Existing Attachments</Label>
                            {note.attachments.map((att) =>
                                removedAttachments.includes(att.id) ? null : (
                                    <div
                                        key={att.id}
                                        className="flex items-center justify-between rounded border px-2 py-1 text-sm"
                                    >
                                        <span>{att.file_name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleRemoveExisting(att.id)
                                            }
                                        >
                                            ❌
                                        </Button>
                                    </div>
                                ),
                            )}
                        </div>
                    )}

                    {/* New Attachments */}
                    <div className="space-y-2">
                        <Label>New Attachments</Label>
                        <Input type="file" multiple onChange={handleNewFiles} />

                        {newAttachments.length > 0 && (
                            <div className="space-y-1 text-sm">
                                {newAttachments.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded border px-2 py-1"
                                    >
                                        <span>{file.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleRemoveNewFile(index)
                                            }
                                        >
                                            ❌
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

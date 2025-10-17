import { Button } from '@/components/ui/button'; // shadcn button (optional)
import { Image, Trash, Upload } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

type Props = {
    initialImage?: string | null;
    onChange?: (file: File | null, previewUrl?: string | null) => void;
    aspectClass?: string; // e.g. "aspect-video" or "aspect-[3/1]"
    accept?: string;
};

export default function CoverImageInput({
    initialImage = null,
    onChange,
    aspectClass = 'aspect-[3/1]',
    accept = 'image/*',
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [preview, setPreview] = useState<string | null>(initialImage);
    const [file, setFile] = useState<File | null>(null);
    const [hover, setHover] = useState(false);

    useEffect(() => {
        // revoke object URL on unmount or when preview changes
        return () => {
            if (preview && preview.startsWith('blob:'))
                URL.revokeObjectURL(preview);
        };
    }, [preview]);

    useEffect(() => {
        // if parent changes initialImage externally, update preview
        setPreview(initialImage);
    }, [initialImage]);

    function openFile() {
        inputRef.current?.click();
    }

    function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        if (!f) return;
        const url = URL.createObjectURL(f);
        // cleanup previous blob URL
        if (preview && preview.startsWith('blob:'))
            URL.revokeObjectURL(preview);
        setFile(f);
        setPreview(url);
        onChange?.(f, url);
    }

    function removeImage(e?: React.MouseEvent) {
        e?.stopPropagation();
        if (preview && preview.startsWith('blob:'))
            URL.revokeObjectURL(preview);
        setFile(null);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
        onChange?.(null, null);
    }

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFiles}
            />

            <div
                onClick={openFile}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className={`group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/50`}
                aria-label="Upload cover image"
            >
                <div className={`w-full ${aspectClass} relative`}>
                    {/* Image preview or placeholder */}
                    {preview ? (
                        <img
                            src={preview}
                            alt="Cover preview"
                            className="h-full w-full object-cover"
                            draggable={false}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center gap-4 p-6 text-center">
                            <div className="flex flex-col items-center">
                                <div className="rounded-full border border-dashed border-border p-4">
                                    <Image className="h-6 w-6" />
                                </div>
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Upload a cover image
                                </p>
                                <p className="text-xs text-muted-foreground/80">
                                    Recommended size: wide landscape
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Hover overlay: replace + remove */}
                    <div
                        className={`absolute inset-0 flex items-center justify-center bg-black/0 transition-opacity group-hover:bg-muted/40 ${
                            hover ? 'opacity-100' : 'opacity-0'
                        }`}
                        aria-hidden={!hover}
                    >
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openFile();
                                }}
                                variant={'outline'}
                                size="sm"
                                className="gap-2"
                                aria-label="Replace image"
                            >
                                <Upload className="h-4 w-4" />
                                Upload
                            </Button>
                        </div>
                    </div>

                    {/* Small label at bottom-left showing filename (optional) */}
                    {file && (
                        <div className="absolute bottom-3 left-3 rounded-md bg-background/80 px-2 py-1 text-xs shadow-sm">
                            {file.name}
                        </div>
                    )}

                    {preview && (
                        <Button
                            type="button"
                            onClick={removeImage}
                            variant="destructive"
                            size="sm"
                            className="absolute right-3 bottom-3 gap-2"
                            aria-label="Remove image"
                        >
                            <Trash className="h-4 w-4" />
                            Remove
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

/*
Usage example:

<CoverImageInput
  initialImage={existingUrl}
  onChange={(file, previewUrl) => {
    // upload file or set local state
  }}
  aspectClass="aspect-[5/2]" // optional
/>

Notes:
- This component uses shadcn's Button and lucide-react icons. Replace imports if your project paths differ.
- It uses object URLs for previews and cleans them up on unmount.
- The entire control is full-width and keeps an aspect ratio; adjust `aspectClass` for different shapes.
*/

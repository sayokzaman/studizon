import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import {
    MCQPayload,
    OneNumberPayload,
    OneWordPayload,
    Short,
} from '@/types/short';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

type Props = {
    short: Partial<Short>;
    seconds: number;
    onNext?: () => void;
};

type AttemptResp = {
    is_correct: boolean;
    correct_index?: number; // mcq
    correct?: boolean | string | number; // universal
};

export default function TypeRenderer({ short, seconds, onNext }: Props) {
    const [submitting, setSubmitting] = useState(false);

    // Accept number (mcq), boolean (true/false), string (text/number input)
    const [selected, setSelected] = useState<number | boolean | string | null>(
        null,
    );
    const [correct, setCorrect] = useState<number | boolean | string | null>(
        null,
    );

    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const [inTimeout, setInTimeout] = useState(false);

    const submit = (answer: number | boolean | string) => {
        if (submitting || inTimeout) return;
        setSubmitting(true);

        router.post(
            route('shorts.attempt', short.id),
            {
                answer,
                time_taken: Math.max(
                    0,
                    (short.time_limit ?? 15) - (seconds ?? 0),
                ),
            },
            {
                onSuccess: (page) => {
                    const attempt = page.props?.attempt as
                        | AttemptResp
                        | undefined;
                    setSelected(answer);

                    setIsCorrect(attempt?.is_correct ?? false);

                    // prefer MCQ index if present, otherwise use universal `correct`
                    const corr =
                        attempt?.correct_index ?? attempt?.correct ?? null;
                    setCorrect(corr as string | number | boolean | null);

                    setInTimeout(true);

                    // brief feedback then advance
                    setTimeout(() => {
                        if (onNext) onNext();
                        setInTimeout(false);
                        setSelected(null);
                        setCorrect(null);
                        setIsCorrect(null);
                    }, 1500);
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    switch (short.type) {
        case 'mcq':
            return (
                <div className="z-10 grid grid-cols-2 items-center gap-2">
                    {(short.payload as MCQPayload).choices.map((c, idx) => (
                        <div key={idx}>
                            {c.img ? (
                                <div
                                    onClick={() => submit(idx)}
                                    className={cn(
                                        'flex cursor-pointer items-center justify-center gap-2 rounded bg-white px-4 py-2 transition-colors duration-300 ease-in-out hover:bg-gray-100',
                                        correct === idx
                                            ? 'bg-primary hover:bg-primary/90'
                                            : selected === idx &&
                                                correct !== idx
                                              ? 'bg-destructive hover:bg-destructive/90'
                                              : '',
                                    )}
                                >
                                    <img
                                        src={c.img}
                                        alt={c.alt ?? ''}
                                        className="size-10 object-cover"
                                    />
                                    {c.text ?? ''}
                                </div>
                            ) : (
                                <Button
                                    variant="secondary"
                                    onClick={() => submit(idx)}
                                    className={cn(
                                        'h-10 w-full justify-start rounded-md bg-black/40 px-4 text-lg font-medium text-white/90 capitalize transition-colors duration-300 ease-in-out hover:bg-black/70',
                                        correct === idx
                                            ? 'bg-primary hover:bg-primary/90'
                                            : selected === idx &&
                                                correct !== idx
                                              ? 'bg-destructive hover:bg-destructive/90'
                                              : '',
                                    )}
                                >
                                    {idx + 1}. {c.text ?? ''}
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            );

        case 'true_false':
            return (
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => submit(true)}
                        className={cn(
                            'h-10 justify-center rounded-md bg-black/50 text-lg font-medium text-white/90 transition-colors duration-300 ease-in-out hover:bg-black/70',
                            selected === true && correct === true
                                ? 'bg-green-600 hover:bg-green-600'
                                : selected === true && correct !== true
                                  ? 'bg-destructive hover:bg-destructive'
                                  : '',
                        )}
                    >
                        True
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => submit(false)}
                        className={cn(
                            'h-10 justify-center rounded-md bg-black/50 text-lg font-medium text-white/90 transition-colors duration-300 ease-in-out hover:bg-black/70',
                            selected === false && correct === false
                                ? 'bg-green-600 hover:bg-green-600'
                                : selected === false && correct !== false
                                  ? 'bg-destructive hover:bg-destructive'
                                  : '',
                        )}
                    >
                        False
                    </Button>
                </div>
            );

        case 'one_word':
            return (
                <TextAnswer
                    seconds={seconds}
                    onSubmit={submit}
                    placeholder={
                        (short.payload as OneWordPayload).placeholder ||
                        'Type answer'
                    }
                    isCorrect={isCorrect}
                    correct={correct}
                    inTimeout={inTimeout}
                />
            );

        case 'code_output':
            return (
                <TextAnswer
                    seconds={seconds}
                    onSubmit={submit}
                    placeholder="Program output…"
                    isCorrect={isCorrect}
                    correct={correct}
                    inTimeout={inTimeout}
                />
            );

        case 'one_number':
            return (
                <TextAnswer
                    seconds={seconds}
                    onSubmit={submit}
                    inputMode="numeric"
                    placeholder={
                        (short.payload as OneNumberPayload).placeholder ||
                        ((short.payload as OneNumberPayload).unit
                            ? `Enter value (${(short.payload as OneNumberPayload).unit})`
                            : 'Enter number')
                    }
                    isCorrect={isCorrect}
                    correct={correct}
                    inTimeout={inTimeout}
                />
            );

        default:
            return null;
    }
}

function TextAnswer({
    onSubmit,
    inputMode,
    placeholder,
    correct,
    isCorrect,
    inTimeout,
}: {
    seconds: number;
    onSubmit: (answer: string) => void;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    placeholder?: string;
    correct: string | number | boolean | null;
    isCorrect: boolean | null;
    inTimeout: boolean;
}) {
    const [val, setVal] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submitText = () => {
        if (submitting) return;
        setSubmitting(true);
        // delegate to the same unified submit()
        if (val === '') {
            toast.error('Answer cannot be empty');
        }
        onSubmit(val);
        // let parent handle onSuccess/next; we just disable button briefly
        setTimeout(() => setSubmitting(false), 300);
    };

    return (
        <div className="flex flex-col gap-3 pb-2">
            <input
                className="h-12 w-full rounded-xl border border-muted-foreground bg-black/60 px-4 text-xl font-medium text-white/90 shadow-lg focus:ring-0 focus:ring-primary focus:outline-none"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                inputMode={inputMode}
                placeholder={placeholder}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') submitText();
                }}
            />
            <Button
                onClick={submitText}
                disabled={submitting || inTimeout}
                className={cn(
                    'h-10 text-lg shadow-lg',
                    isCorrect
                        ? 'bg-green-400 hover:bg-green-500'
                        : !isCorrect && correct
                          ? 'bg-destructive hover:bg-destructive/90'
                          : '',
                    inTimeout ? 'disabled:opacity-100' : '',
                )}
            >
                {submitting ? (
                    <span className="flex items-center gap-2">
                        Validating
                        <Spinner />
                    </span>
                ) : isCorrect ? (
                    'Correct!!'
                ) : !isCorrect && correct ? (
                    'Incorrect! Answer: ' + correct
                ) : (
                    'Submit'
                )}
            </Button>
        </div>
    );
}

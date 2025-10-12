// resources/js/components/shorts/ShortCardAI.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolveBackground } from '@/lib/shorts/background';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export type ShortType =
    | 'mcq'
    | 'true_false'
    | 'one_word'
    | 'one_number'
    | 'fill_blanks'
    | 'sequence'
    | 'rearrange'
    | 'spot_error'
    | 'code_output';

export type ShortItem = {
    id: number;
    type: ShortType;
    prompt: string;
    payload: any;
    validate: any; // server rules
    time_limit: number;
    max_points: number;
    background?: string | null;
};

export default function ShortCardAI({
    item,
    onNext,
}: {
    item: ShortItem;
    onNext: (res?: { correct: boolean }) => void;
}) {
    const [answer, setAnswer] = useState<any>(null);
    const [seconds, setSeconds] = useState(item.time_limit ?? 15);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<null | boolean>(null);
    const once = useRef(false);

    useEffect(() => {
        const t = setInterval(
            () => setSeconds((s) => (s > 0 ? s - 1 : 0)),
            1000,
        );
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (seconds === 0 && !once.current) {
            once.current = true;
            handleSubmit();
        }
    }, [seconds]);

    const bgStyle = resolveBackground(item.background);

    const handleSubmit = () => {
        if (submitting) return;
        setSubmitting(true);
        router.post(
            `/shorts/${item.id}/attempt`,
            { answer, time_taken: (item.time_limit ?? 15) - seconds },
            {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    const ok = page.props?.attempt?.is_correct ?? false;
                    setResult(ok);
                    setTimeout(() => onNext({ correct: ok }), 600);
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <motion.div
            className="relative h-[calc(100vh-8rem)] w-full max-w-md overflow-hidden rounded-2xl"
            style={bgStyle.container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <TimerBar seconds={seconds} total={item.time_limit ?? 15} />

            {/* Optional background video */}
            {item.background?.startsWith('vid:') && (
                <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={item.background.slice(4)}
                    muted
                    loop
                    autoPlay
                    playsInline
                />
            )}

            <div className="absolute inset-0 flex flex-col justify-end gap-3 p-4">
                <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="opacity-90">
                        {prettyType(item.type)}
                    </Badge>
                    <span className="text-sm text-white/80">{seconds}s</span>
                </div>
                <h2 className="text-xl font-semibold text-white drop-shadow-sm">
                    {item.prompt}
                </h2>

                <TypeRenderer
                    item={item}
                    answer={answer}
                    setAnswer={setAnswer}
                />

                <div className="flex gap-2 pt-1">
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="grow"
                    >
                        Submit
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => onNext()}
                        className="shrink-0"
                    >
                        Skip
                    </Button>
                </div>

                {result !== null && (
                    <div
                        className={`text-sm ${result ? 'text-emerald-300' : 'text-rose-300'}`}
                    >
                        {result
                            ? 'Correct! +' + item.max_points + 'pt'
                            : 'Incorrect — onto the next'}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function TimerBar({ seconds, total }: { seconds: number; total: number }) {
    const pct = Math.max(0, Math.min(100, (seconds / total) * 100));
    return (
        <div className="absolute top-0 right-0 left-0 h-1 bg-white/20">
            <div
                className="h-1"
                style={{ width: `${pct}%`, background: 'white' }}
            />
        </div>
    );
}

function prettyType(t: string) {
    return t.replace('_', ' ').replace(/\b\w/g, (s) => s.toUpperCase());
}

/* ---------- Per-type UI ---------- */
function TypeRenderer({
    item,
    answer,
    setAnswer,
}: {
    item: ShortItem;
    answer: any;
    setAnswer: (a: any) => void;
}) {
    switch (item.type) {
        case 'mcq':
            return (
                <div className="grid grid-cols-1 gap-2">
                    {item.payload?.choices?.map((c: any, idx: number) => (
                        <Button
                            key={idx}
                            variant={answer === idx ? 'default' : 'secondary'}
                            onClick={() => setAnswer(idx)}
                            className="w-full justify-start"
                        >
                            {c.img ? (
                                <span className="flex items-center gap-2">
                                    <img
                                        src={c.img}
                                        className="h-6 w-6 rounded object-cover"
                                    />
                                    {c.t}
                                </span>
                            ) : (
                                c.t
                            )}
                        </Button>
                    ))}
                </div>
            );

        case 'true_false':
            return (
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant={answer === true ? 'default' : 'secondary'}
                        onClick={() => setAnswer(true)}
                    >
                        True
                    </Button>
                    <Button
                        variant={answer === false ? 'default' : 'secondary'}
                        onClick={() => setAnswer(false)}
                    >
                        False
                    </Button>
                </div>
            );

        case 'one_word':
        case 'code_output':
            return (
                <div className="flex gap-2">
                    <Input
                        autoFocus
                        placeholder="Type your answer"
                        value={answer ?? ''}
                        onChange={(e) => setAnswer(e.target.value)}
                    />
                </div>
            );

        case 'one_number':
            return (
                <div className="flex gap-2">
                    <Input
                        autoFocus
                        inputMode="numeric"
                        pattern="[0-9.,-]*"
                        placeholder="Enter number"
                        value={answer ?? ''}
                        onChange={(e) => setAnswer(e.target.value)}
                    />
                </div>
            );

        case 'fill_blanks': {
            const blanks = extractPlaceholders(item.payload?.template);
            return (
                <div className="flex flex-col gap-2">
                    <div className="text-white/90">
                        {renderTemplateWithInputs(
                            item.payload?.template,
                            blanks,
                            answer,
                            setAnswer,
                        )}
                    </div>
                </div>
            );
        }
        case 'sequence': {
            // payload.choices: array of tokens or small chips; user taps to build order
            const choices: any[] = item.payload?.choices ?? [];
            const picked: number[] = Array.isArray(answer) ? answer : [];
            const remaining = choices
                .map((_, i) => i)
                .filter((i) => !picked.includes(i));

            return (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                        {remaining.map((i) => (
                            <Button
                                key={i}
                                variant="secondary"
                                onClick={() =>
                                    setAnswer([...(picked || []), i])
                                }
                            >
                                {choices[i]?.t ?? String(choices[i])}
                            </Button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {picked.map((i, idx) => (
                            <Button
                                key={idx}
                                onClick={() => {
                                    const next = picked.slice();
                                    next.splice(idx, 1);
                                    setAnswer(next);
                                }}
                            >
                                {choices[i]?.t ?? String(choices[i])}
                            </Button>
                        ))}
                    </div>
                </div>
            );
        }

        case 'rearrange': {
            // payload.tokens: array of strings; tap to build sentence
            const tokens: string[] = item.payload?.tokens ?? [];
            const chosen: number[] = Array.isArray(answer) ? answer : [];
            const remaining = tokens
                .map((_, i) => i)
                .filter((i) => !chosen.includes(i));

            return (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                        {remaining.map((i) => (
                            <Button
                                key={i}
                                variant="secondary"
                                onClick={() =>
                                    setAnswer([...(chosen || []), i])
                                }
                            >
                                {tokens[i]}
                            </Button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {chosen.map((i, idx) => (
                            <Button
                                key={idx}
                                onClick={() => {
                                    const next = chosen.slice();
                                    next.splice(idx, 1);
                                    setAnswer(next);
                                }}
                            >
                                {tokens[i]}
                            </Button>
                        ))}
                    </div>
                </div>
            );
        }
        case 'spot_error':
            // payload.line + maybe payload.options (fixes) as mcq-style; fallback: type the fix
            if (item.payload?.options?.length) {
                return (
                    <div className="grid grid-cols-1 gap-2">
                        {item.payload.options.map((o: any, idx: number) => (
                            <Button
                                key={idx}
                                variant={
                                    answer === idx ? 'default' : 'secondary'
                                }
                                onClick={() => setAnswer(idx)}
                            >
                                {o.t ?? String(o)}
                            </Button>
                        ))}
                    </div>
                );
            }
            return (
                <div className="flex flex-col gap-2">
                    <code className="rounded bg-white/10 px-2 py-1 text-sm text-white/80">
                        {item.payload?.line}
                    </code>
                    <Input
                        autoFocus
                        placeholder="Type the fix/error token"
                        value={answer ?? ''}
                        onChange={(e) => setAnswer(e.target.value)}
                    />
                </div>
            );

        default:
            return null;
    }
}

/* ----- helpers for fill_blanks ----- */
function extractPlaceholders(tpl?: string): number[] {
    if (!tpl) return [];
    const matches = tpl.match(/\{(\d+)\}/g) ?? [];
    const set = new Set<number>();
    matches.forEach((m) => set.add(parseInt(m.replace(/\{|\}/g, ''), 10)));
    return Array.from(set).sort((a, b) => a - b);
}

function renderTemplateWithInputs(
    tpl?: string,
    blanks: number[] = [],
    answer: any,
    setAnswer: (a: any) => void,
) {
    if (!tpl) return null;
    const parts: (string | JSX.Element)[] = [];
    let cursor = 0;
    const re = /\{(\d+)\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(tpl))) {
        const idx = parseInt(m[1], 10);
        const before = tpl.slice(cursor, m.index);
        if (before) parts.push(before);
        parts.push(
            <input
                key={m.index}
                className="mx-1 inline-block w-24 rounded bg-white/90 px-2 py-1 text-sm text-black"
                value={(Array.isArray(answer) ? answer[idx] : '') ?? ''}
                onChange={(e) => {
                    const arr = Array.isArray(answer) ? answer.slice() : [];
                    arr[idx] = e.target.value;
                    setAnswer(arr);
                }}
            />,
        );
        cursor = m.index + m[0].length;
    }
    const tail = tpl.slice(cursor);
    if (tail) parts.push(tail);
    return <div className="text-lg">{parts}</div>;
}

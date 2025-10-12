// resources/js/components/shorts/TypeEditors.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type EditorState = {
    type: string;
    prompt: string;
    payload: any;
    validate: any;
};

export default function TypeEditors({
    state,
    setState,
}: {
    state: EditorState;
    setState: (p: Partial<EditorState>) => void;
}) {
    switch (state.type) {
        case 'mcq':
            return <McqEditor state={state} setState={setState} />;
        case 'true_false':
            return <TrueFalseEditor state={state} setState={setState} />;
        case 'one_word':
            return <OneWordEditor state={state} setState={setState} />;
        case 'one_number':
            return <OneNumberEditor state={state} setState={setState} />;
        case 'fill_blanks':
            return <FillBlanksEditor state={state} setState={setState} />;
        case 'sequence':
            return <SequenceEditor state={state} setState={setState} />;
        case 'rearrange':
            return <RearrangeEditor state={state} setState={setState} />;
        case 'spot_error':
            return <SpotErrorEditor state={state} setState={setState} />;
        case 'code_output':
            return (
                <OneWordEditor
                    state={state}
                    setState={setState}
                    label="Expected output(s)"
                />
            );
        default:
            return null;
    }
}

/* ---- Editors ---- */
function McqEditor({ state, setState }: any) {
    const choices = state.payload?.choices ?? [{ t: '' }, { t: '' }];
    const correctIndex = state.validate?.correctIndex ?? 0;
    return (
        <div className="space-y-3">
            <div className="space-y-2">
                {choices.map((c: any, i: number) => (
                    <div key={i} className="flex gap-2">
                        <Input
                            placeholder={`Choice ${i + 1}`}
                            value={c.t}
                            onChange={(e) => {
                                const next = choices.slice();
                                next[i] = { ...c, t: e.target.value };
                                update(next);
                            }}
                        />
                        <Input
                            placeholder="img URL (optional)"
                            value={c.img ?? ''}
                            onChange={(e) => {
                                const next = choices.slice();
                                next[i] = { ...c, img: e.target.value };
                                update(next);
                            }}
                        />
                        <Button
                            variant={
                                correctIndex === i ? 'default' : 'secondary'
                            }
                            onClick={() =>
                                setState({
                                    validate: { mode: 'mcq', correctIndex: i },
                                })
                            }
                        >
                            Correct
                        </Button>
                        <Button variant="destructive" onClick={() => remove(i)}>
                            X
                        </Button>
                    </div>
                ))}
                <Button
                    variant="secondary"
                    onClick={() => update([...choices, { t: '' }])}
                >
                    Add Choice
                </Button>
            </div>
        </div>
    );
    function update(next: any[]) {
        setState({ payload: { choices: next } });
    }
    function remove(i: number) {
        const next = choices.slice();
        next.splice(i, 1);
        update(next);
    }
}

function TrueFalseEditor({ state, setState }: any) {
    const ans = state.validate?.answer ?? true;
    return (
        <div className="flex gap-2">
            <Button
                variant={ans === true ? 'default' : 'secondary'}
                onClick={() =>
                    setState({ validate: { mode: 'boolean', answer: true } })
                }
            >
                True
            </Button>
            <Button
                variant={ans === false ? 'default' : 'secondary'}
                onClick={() =>
                    setState({ validate: { mode: 'boolean', answer: false } })
                }
            >
                False
            </Button>
        </div>
    );
}

function OneWordEditor({ state, setState, label = 'Accepted answer(s)' }: any) {
    const answers: string[] = state.validate?.answers ?? [''];
    return (
        <div className="space-y-2">
            <Label className="text-sm">{label}</Label>
            {answers.map((a, i) => (
                <div key={i} className="flex gap-2">
                    <Input
                        value={a}
                        onChange={(e) => update(i, e.target.value)}
                    />
                    <Button variant="destructive" onClick={() => remove(i)}>
                        X
                    </Button>
                </div>
            ))}
            <div className="flex items-center gap-2">
                <Button
                    variant="secondary"
                    onClick={() =>
                        setState({
                            validate: {
                                ...(state.validate || {}),
                                mode: 'text',
                                answers: [...answers, ''],
                                caseInsensitive: true,
                                trim: true,
                                collapseSpaces: true,
                            },
                        })
                    }
                >
                    Add Answer
                </Button>
            </div>
        </div>
    );
    function update(i: number, v: string) {
        const next = [...answers];
        next[i] = v;
        setState({
            validate: {
                ...(state.validate || {}),
                mode: 'text',
                answers: next,
                caseInsensitive: true,
                trim: true,
                collapseSpaces: true,
            },
        });
    }
    function remove(i: number) {
        const next = [...answers];
        next.splice(i, 1);
        setState({
            validate: {
                ...(state.validate || {}),
                mode: 'text',
                answers: next,
                caseInsensitive: true,
                trim: true,
                collapseSpaces: true,
            },
        });
    }
}

function OneNumberEditor({ state, setState }: any) {
    const exact = state.validate?.exact ?? 0;
    const tolerance = state.validate?.tolerance ?? 0;
    return (
        <div className="grid grid-cols-2 gap-2">
            <div>
                <Label className="text-sm">Exact</Label>
                <Input
                    type="number"
                    value={exact}
                    onChange={(e) =>
                        setState({
                            validate: {
                                mode: 'numeric',
                                exact: parseFloat(e.target.value || '0'),
                                tolerance,
                            },
                        })
                    }
                />
            </div>
            <div>
                <Label className="text-sm">Tolerance</Label>
                <Input
                    type="number"
                    value={tolerance}
                    onChange={(e) =>
                        setState({
                            validate: {
                                mode: 'numeric',
                                exact,
                                tolerance: parseFloat(e.target.value || '0'),
                            },
                        })
                    }
                />
            </div>
        </div>
    );
}

function FillBlanksEditor({ state, setState }: any) {
    const template = state.payload?.template ?? 'E = {0} * {1} * c^2';
    const answers: string[][] = state.validate?.answers ?? [['m'], ['c']];
    return (
        <div className="space-y-2">
            <Label className="text-sm">Template</Label>
            <Input
                value={template}
                onChange={(e) =>
                    setState({ payload: { template: e.target.value } })
                }
            />
            <Label className="text-sm">
                Answers per blank (comma for synonyms)
            </Label>
            {answers.map((group, i) => (
                <div key={i} className="flex gap-2">
                    <Input
                        value={group.join(', ')}
                        onChange={(e) => update(i, e.target.value)}
                    />
                    <Button variant="destructive" onClick={() => remove(i)}>
                        X
                    </Button>
                </div>
            ))}
            <Button
                variant="secondary"
                onClick={() =>
                    setState({
                        validate: {
                            mode: 'blanks',
                            answers: [...answers, ['']],
                        },
                    })
                }
            >
                Add Blank
            </Button>
        </div>
    );
    function update(i: number, v: string) {
        const next = [...answers];
        next[i] = v.split(',').map((s) => s.trim());
        setState({ validate: { mode: 'blanks', answers: next } });
    }
    function remove(i: number) {
        const next = [...answers];
        next.splice(i, 1);
        setState({ validate: { mode: 'blanks', answers: next } });
    }
}

function SequenceEditor({ state, setState }: any) {
    const choices = state.payload?.choices ?? [
        { t: 'Step A' },
        { t: 'Step B' },
        { t: 'Step C' },
    ];
    const correct = state.validate?.correct ?? [0, 1, 2];
    return (
        <div className="space-y-2">
            {choices.map((c: any, i: number) => (
                <div key={i} className="flex gap-2">
                    <Input
                        value={c.t}
                        onChange={(e) =>
                            updateChoice(i, { ...c, t: e.target.value })
                        }
                    />
                    <Button variant="destructive" onClick={() => remove(i)}>
                        X
                    </Button>
                </div>
            ))}
            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    onClick={() => updateChoices([...choices, { t: '' }])}
                >
                    Add Item
                </Button>
                <Button
                    variant="secondary"
                    onClick={() =>
                        setState({ validate: { mode: 'sequence', correct } })
                    }
                >
                    Keep Order
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">
                Correct order is by index 0..N (edit later in DB or add a drag
                handle if needed).
            </p>
        </div>
    );
    function updateChoice(i: number, v: any) {
        const next = [...choices];
        next[i] = v;
        updateChoices(next);
    }
    function updateChoices(next: any[]) {
        setState({ payload: { choices: next } });
    }
    function remove(i: number) {
        const next = [...choices];
        next.splice(i, 1);
        updateChoices(next);
    }
}

function RearrangeEditor({ state, setState }: any) {
    const tokens: string[] = state.payload?.tokens ?? [
        'the',
        'quick',
        'brown',
        'fox',
    ];
    const correct: string[] = state.validate?.correct ?? tokens;
    return (
        <div className="space-y-2">
            {tokens.map((t: string, i: number) => (
                <div key={i} className="flex gap-2">
                    <Input
                        value={t}
                        onChange={(e) => updateToken(i, e.target.value)}
                    />
                    <Button variant="destructive" onClick={() => remove(i)}>
                        X
                    </Button>
                </div>
            ))}
            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    onClick={() =>
                        setState({ payload: { tokens: [...tokens, ''] } })
                    }
                >
                    Add Token
                </Button>
                <Button
                    variant="secondary"
                    onClick={() =>
                        setState({
                            validate: { mode: 'rearrange', correct: tokens },
                        })
                    }
                >
                    Set Current As Correct
                </Button>
            </div>
        </div>
    );
    function updateToken(i: number, v: string) {
        const next = [...tokens];
        next[i] = v;
        setState({ payload: { tokens: next } });
    }
    function remove(i: number) {
        const next = [...tokens];
        next.splice(i, 1);
        setState({ payload: { tokens: next } });
    }
}

function SpotErrorEditor({ state, setState }: any) {
    const line =
        state.payload?.line ?? 'for (let i = 0; i < arr.length; i++) {}';
    const options = state.payload?.options ?? [];
    const answers = state.validate?.answers ?? ['i <= arr.length-1'];
    return (
        <div className="space-y-2">
            <Label className="text-sm">Line</Label>
            <Input
                value={line}
                onChange={(e) =>
                    setState({
                        payload: { ...state.payload, line: e.target.value },
                    })
                }
            />
            <Label className="text-sm">Options (optional, MCQ-style)</Label>
            {options.map((o: any, i: number) => (
                <div key={i} className="flex gap-2">
                    <Input
                        value={o.t ?? ''}
                        onChange={(e) => updateOption(i, { t: e.target.value })}
                    />
                    <Button variant="destructive" onClick={() => remove(i)}>
                        X
                    </Button>
                </div>
            ))}
            <Button
                variant="secondary"
                onClick={() =>
                    setState({
                        payload: {
                            ...state.payload,
                            options: [...options, { t: '' }],
                        },
                    })
                }
            >
                Add Option
            </Button>
            <Label className="text-sm">Accepted Fix/Token(s)</Label>
            {answers.map((a: string, i: number) => (
                <div key={i} className="flex gap-2">
                    <Input
                        value={a}
                        onChange={(e) => updateAns(i, e.target.value)}
                    />
                    <Button variant="destructive" onClick={() => removeAns(i)}>
                        X
                    </Button>
                </div>
            ))}
            <Button
                variant="secondary"
                onClick={() =>
                    setState({
                        validate: {
                            mode: 'text',
                            answers: [...answers, ''],
                            caseInsensitive: true,
                            trim: true,
                            collapseSpaces: true,
                        },
                    })
                }
            >
                Add Accepted
            </Button>
        </div>
    );
    function updateOption(i: number, v: any) {
        const next = [...(options || [])];
        next[i] = v;
        setState({ payload: { ...state.payload, options: next } });
    }
    function remove(i: number) {
        const next = [...(options || [])];
        next.splice(i, 1);
        setState({ payload: { ...state.payload, options: next } });
    }
    function updateAns(i: number, v: string) {
        const next = [...(answers || [])];
        next[i] = v;
        setState({
            validate: {
                mode: 'text',
                answers: next,
                caseInsensitive: true,
                trim: true,
                collapseSpaces: true,
            },
        });
    }
    function removeAns(i: number) {
        const next = [...(answers || [])];
        next.splice(i, 1);
        setState({
            validate: {
                mode: 'text',
                answers: next,
                caseInsensitive: true,
                trim: true,
                collapseSpaces: true,
            },
        });
    }
}

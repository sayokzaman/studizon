// resources/js/pages/shorts/Create.tsx
import BackgroundPicker from '@/components/shorts/background-picker';
import ShortCard from '@/components/shorts/short-card-ai';
import TypeEditors, { EditorState } from '@/components/shorts/type-editors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const TYPES = [
    'mcq',
    'true_false',
    'one_word',
    'one_number',
    'fill_blanks',
    'sequence',
    'rearrange',
    'spot_error',
    'code_output',
] as const;

type T = (typeof TYPES)[number];

export default function Create() {
    const [state, setState] = useState<EditorState>({
        type: 'mcq',
        prompt: '',
        payload: { choices: [{ t: '' }, { t: '' }] },
        validate: { mode: 'mcq', correctIndex: 0 },
    });
    const [background, setBackground] = useState<string>(
        'grad:linear:#0ea5e9,#22d3ee',
    );
    const [timeLimit, setTimeLimit] = useState<number>(15);
    const [maxPoints, setMaxPoints] = useState<number>(1);
    const [visibility, setVisibility] = useState<'public' | 'program_only'>(
        'public',
    );

    const previewItem = useMemo(
        () => ({
            id: 0,
            type: state.type as any,
            prompt: state.prompt || 'Preview your prompt here',
            payload: state.payload,
            validate: state.validate,
            time_limit: timeLimit,
            max_points: maxPoints,
            background,
        }),
        [state, background, timeLimit, maxPoints],
    );

    const submit = () => {
        router.post('/shorts', {
            type: state.type,
            prompt: state.prompt,
            payload: state.payload,
            validate: state.validate,
            background,
            time_limit: timeLimit,
            max_points: maxPoints,
            visibility,
        });
    };

    return (
        <AppLayout>
            <Head title="Create Short" />

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 p-4 lg:grid-cols-2">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                            value={state.type}
                            onValueChange={(v: T) =>
                                setState({ ...state, type: v })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pick a type" />
                            </SelectTrigger>
                            <SelectContent>
                                {TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {t.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Prompt</Label>
                        <Input
                            value={state.prompt}
                            onChange={(e) =>
                                setState({ ...state, prompt: e.target.value })
                            }
                            placeholder="Ask a quick question…"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Background</Label>
                        <BackgroundPicker
                            value={background}
                            onChange={setBackground}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>Time (s)</Label>
                            <Input
                                type="number"
                                value={timeLimit}
                                onChange={(e) =>
                                    setTimeLimit(
                                        parseInt(e.target.value || '15', 10),
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label>Max Points</Label>
                            <Input
                                type="number"
                                value={maxPoints}
                                onChange={(e) =>
                                    setMaxPoints(
                                        parseInt(e.target.value || '1', 10),
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label>Visibility</Label>
                            <Select
                                value={visibility}
                                onValueChange={(v: any) => setVisibility(v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">
                                        Public
                                    </SelectItem>
                                    <SelectItem value="program_only">
                                        Program Only
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Type-specific settings</Label>
                        <TypeEditors
                            state={state}
                            setState={(p) => setState({ ...state, ...p })}
                        />
                    </div>

                    <div className="pt-2">
                        <Button onClick={submit}>Create Short</Button>
                    </div>
                </div>

                {/* Live preview */}
                <div className="sticky top-4">
                    <ShortCard item={previewItem as any} onNext={() => {}} />
                </div>
            </div>
        </AppLayout>
    );
}

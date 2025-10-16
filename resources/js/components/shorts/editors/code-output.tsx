import { EditorProps } from '@/components/shorts/type-editors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CodeOutputPayload, ValidateText } from '@/types/short';

export default function CodeOutputEditor({ data, setData }: EditorProps) {
    const code =
        (data.payload as CodeOutputPayload).code ?? 'console.log(2**3);';
    const language = (data.payload as CodeOutputPayload).language ?? 'js';
    const answers: string[] = (data.payload as ValidateText).answers ?? ['8'];

    const setAnswers = (next: string[]) =>
        setData({
            ...data,
            validate: {
                mode: 'text',
                answers: next,
                caseInsensitive: true,
                trim: true,
            },
        });

    return (
        <div className="space-y-2">
            <Label>Code</Label>
            <textarea
                className="min-h-[110px] w-full rounded bg-white px-3 py-2 text-sm text-black"
                value={code}
                onChange={(e) =>
                    setData({
                        ...data,
                        payload: { code: e.target.value, language },
                    })
                }
            />
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {answers.map((a, i) => (
                    <div key={i} className="flex gap-2">
                        <Input
                            value={a}
                            onChange={(e) => {
                                const next = [...answers];
                                next[i] = e.target.value;
                                setAnswers(next);
                            }}
                            placeholder="Expected output variant"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                const next = [...answers];
                                next.splice(i, 1);
                                setAnswers(next);
                            }}
                        >
                            X
                        </Button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <Input
                    value={language}
                    onChange={(e) =>
                        setData({
                            ...data,
                            payload: { code, language: e.target.value },
                        })
                    }
                    placeholder="Language (js, py…)"
                />
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setAnswers([...answers, ''])}
                >
                    Add Output
                </Button>
            </div>
        </div>
    );
}

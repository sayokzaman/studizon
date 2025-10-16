import InputError from '@/components/input-error';
import { EditorProps } from '@/components/shorts/type-editors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OneWordPayload, ValidateText } from '@/types/short';
import { PlusCircleIcon } from 'lucide-react';

export default function OneWordEditor({ data, setData, errors }: EditorProps) {
    const placeholder =
        (data.payload as OneWordPayload).placeholder ?? 'Enter word';

    const answers: string[] = (data.validate as ValidateText).answers ?? [''];
    const setAnswers = (next: string[]) =>
        setData({
            ...data,
            payload: { placeholder },
            validate: {
                mode: 'text',
                answers: next,
                caseInsensitive: false,
                trim: true,
                collapseSpaces: true,
            },
        });

    return (
        <div className="space-y-2">
            <Label>Accepted answers (synonyms)</Label>
            {answers.map((a, i) => (
                <div key={i}>
                    <div className="flex gap-2">
                        <Input
                            value={a}
                            onChange={(e) => {
                                const next = [...answers];
                                next[i] = e.target.value;
                                setAnswers(next);
                            }}
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
                    <InputError
                        message={errors[`validate.answers.${i}`]}
                        className="text-xs"
                    />
                </div>
            ))}
            <InputError
                message={errors['validate.answers']}
                className="text-xs"
            />
            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setAnswers([...answers, ''])}
                >
                    <PlusCircleIcon className="h-4 w-4" />
                    Add
                </Button>
            </div>
            <Input
                value={placeholder}
                onChange={(e) =>
                    setData({
                        ...data,
                        payload: { placeholder: e.target.value },
                    })
                }
                placeholder="Placeholder"
            />
        </div>
    );
}

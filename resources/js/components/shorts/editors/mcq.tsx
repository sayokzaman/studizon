import InputError from '@/components/input-error';
import { EditorProps } from '@/components/shorts/type-editors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MCQPayload, ValidateMCQ } from '@/types/short';

export default function McqEditor({ data, setData, errors }: EditorProps) {
    const choices = (data.payload as MCQPayload).choices;
    const correctIndex = (data.validate as ValidateMCQ).correctIndex;

    const addNewChoice = () => {
        setData({
            ...data,
            payload: {
                choices: [...choices, { text: '' }],
            },
        });
    };

    const deleteChoice = (index: number) => {
        setData({
            ...data,
            payload: {
                choices: [
                    ...choices.slice(0, index),
                    ...choices.slice(index + 1),
                ],
            },
        });
    };

    return (
        <div className="space-y-2">
            <Label>Choices</Label>
            {choices.map((c, i) => (
                <div key={i}>
                    <div className="flex gap-2">
                        <div className="w-full">
                            <Input
                                value={c.text ?? ''}
                                onChange={(e) => {
                                    setData({
                                        ...data,
                                        payload: {
                                            choices: [
                                                ...choices.slice(0, i),
                                                {
                                                    ...c,
                                                    text: e.target.value,
                                                },
                                                ...choices.slice(i + 1),
                                            ],
                                        },
                                    });
                                }}
                                placeholder={`Choice ${i + 1}`}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <Button
                                type="button"
                                variant={
                                    i === correctIndex ? 'default' : 'secondary'
                                }
                                onClick={() =>
                                    setData({
                                        ...data,
                                        validate: {
                                            mode: 'mcq',
                                            correctIndex: i,
                                        },
                                    })
                                }
                                className="w-full"
                            >
                                Correct
                            </Button>
                        </div>
                        <div className="md:col-span-2">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => deleteChoice(i)}
                                className="w-full"
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                    <InputError
                        message={errors[`payload.choices.${i}.text`]}
                        className="text-xs"
                    />
                </div>
            ))}
            <InputError
                message={errors['payload.choices']}
                className="text-xs"
            />
            <InputError
                message={errors['payload.choices.text']}
                className="text-xs"
            />
            <InputError message={errors?.payload} className="text-xs" />
            <InputError
                message={errors[`validate.correctIndex`]}
                className="text-xs"
            />

            <Button type="button" variant="secondary" onClick={addNewChoice}>
                Add Choice
            </Button>
        </div>
    );
}

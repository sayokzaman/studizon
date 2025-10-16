import InputError from '@/components/input-error';
import { EditorProps } from '@/components/shorts/type-editors';
import { Button } from '@/components/ui/button';
import { ValidateTF } from '@/types/short';

export function TrueFalseEditor({ data, setData, errors }: EditorProps) {
    const answer = (data.validate as ValidateTF).answer;

    return (
        <>
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant={answer === true ? 'default' : 'secondary'}
                    onClick={() =>
                        setData({
                            ...data,
                            validate: { mode: 'boolean', answer: true },
                        })
                    }
                >
                    True
                </Button>
                <Button
                    type="button"
                    variant={!answer === true ? 'default' : 'secondary'}
                    onClick={() =>
                        setData({
                            ...data,
                            validate: { mode: 'boolean', answer: false },
                        })
                    }
                >
                    False
                </Button>
            </div>
            <InputError message={errors?.payload} className="text-xs" />
            <InputError message={errors?.validate} className="text-xs" />
        </>
    );
}

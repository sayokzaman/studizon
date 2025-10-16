// TypeEditors + EditorState for: mcq, true_false, one_word, one_number, code_output
import CodeOutputEditor from '@/components/shorts/editors/code-output';
import McqEditor from '@/components/shorts/editors/mcq';
import OneNumberEditor from '@/components/shorts/editors/one-number';
import OneWordEditor from '@/components/shorts/editors/one-word';
import { TrueFalseEditor } from '@/components/shorts/editors/true-false';
import { Short } from '@/types/short';
import { SetDataAction } from '@inertiajs/react';

type ShortForm = Omit<Short, 'id' | 'created_at' | 'updated_at'>;

type FormDataErrors<T> = {
    [K in keyof T]?: string;
};

export type EditorProps = {
    data: ShortForm;
    setData: SetDataAction<ShortForm>;
    errors: FormDataErrors<ShortForm>;
};

export default function TypeEditors({ data, setData, errors }: EditorProps) {
    switch (data.type) {
        case 'mcq':
            return <McqEditor data={data} setData={setData} errors={errors} />;
        case 'true_false':
            return (
                <TrueFalseEditor
                    data={data}
                    setData={setData}
                    errors={errors}
                />
            );
        case 'one_word':
            return (
                <OneWordEditor data={data} setData={setData} errors={errors} />
            );
        case 'one_number':
            return (
                <OneNumberEditor
                    data={data}
                    setData={setData}
                    errors={errors}
                />
            );
        case 'code_output':
            return (
                <CodeOutputEditor
                    data={data}
                    setData={setData}
                    errors={errors}
                />
            );
        default:
            return (
                <div className="text-sm text-white/60">
                    Editor coming soon for “{data.type}”.
                </div>
            );
    }
}

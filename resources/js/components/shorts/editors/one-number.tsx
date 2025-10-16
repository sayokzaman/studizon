import { EditorProps } from '@/components/shorts/type-editors';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OneNumberPayload, ValidateNumeric } from '@/types/short';

export default function OneNumberEditor({ data, setData }: EditorProps) {
    const unit = (data.payload as OneNumberPayload).unit ?? '';
    const placeholder =
        (data.payload as OneNumberPayload).placeholder ?? 'Enter number';
    const exact = (data.validate as ValidateNumeric).exact ?? 0;
    const tolerance = (data.validate as ValidateNumeric).tolerance ?? 0;

    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div>
                <Label>Exact</Label>
                <Input
                    type="number"
                    value={exact}
                    onChange={(e) =>
                        setData({
                            ...data,
                            validate: {
                                ...(data.validate as ValidateNumeric),
                                exact: parseFloat(e.target.value || '0'),
                            },
                        })
                    }
                />
            </div>
            <div>
                <Label>Tolerance</Label>
                <Input
                    type="number"
                    value={tolerance}
                    onChange={(e) =>
                        setData({
                            ...data,
                            validate: {
                                ...(data.validate as ValidateNumeric),
                                tolerance: parseFloat(e.target.value || '0'),
                            },
                        })
                    }
                />
            </div>
            <div>
                <Label>Unit / Placeholder</Label>
                <div className="flex gap-2">
                    <Input
                        value={unit}
                        onChange={(e) =>
                            setData({
                                ...data,
                                payload: {
                                    unit: e.target.value,
                                },
                            })
                        }
                        placeholder="unit (optional)"
                    />
                    <Input
                        value={placeholder}
                        onChange={(e) =>
                            setData({
                                ...data,
                                payload: { unit, placeholder: e.target.value },
                            })
                        }
                        placeholder="Placeholder"
                    />
                </div>
            </div>
        </div>
    );
}

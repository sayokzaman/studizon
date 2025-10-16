// resources/js/components/shorts/BackgroundPicker.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SHORT_BACKGROUNDS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type Props = {
    value?: string | null;
    onChange: (v: string) => void;
};

export default function BackgroundPicker({ value, onChange }: Props) {
    const [selected, setSelected] = useState<string | null>(value ?? null);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {SHORT_BACKGROUNDS.map((bg) => (
                    <Preset
                        key={bg}
                        val={bg}
                        selected={selected === bg}
                        onPick={(v) => {
                            setSelected(v);
                            onChange(v);
                        }}
                    />
                ))}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                    <Label className="text-sm">Custom Linear Gradient</Label>
                    <Input
                        placeholder="grad:linear:#0ea5e9,#22d3ee"
                        value={value ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
                <div>
                    <Label className="text-sm">Image / Video URL</Label>
                    <Input
                        placeholder="img:/storage/bg.webp or vid:/storage/bg.mp4"
                        onBlur={(e) => onChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}

type PresetProps = {
    val: string;
    selected: boolean;
    onPick: (v: string) => void;
};

function Preset({ val, onPick, selected }: PresetProps) {
    return (
        <Button
            className={cn(
                'size-7 rounded-full p-0',
                val,
                selected && 'ring-2 ring-offset-2',
            )}
            type="button"
            onClick={() => onPick(val)}
        />
    );
}

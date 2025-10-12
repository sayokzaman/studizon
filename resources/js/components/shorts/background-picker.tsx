// resources/js/components/shorts/BackgroundPicker.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BackgroundPicker({
    value,
    onChange,
}: {
    value?: string | null;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <Preset
                    label="Solid Slate"
                    val="solid:#0f172a"
                    onPick={onChange}
                />
                <Preset
                    label="Solid Emerald"
                    val="solid:#065f46"
                    onPick={onChange}
                />
                <Preset
                    label="Linear Cyan→Sky"
                    val="grad:linear:#06b6d4,#22d3ee"
                    onPick={onChange}
                />
                <Preset
                    label="Radial Indigo→Violet"
                    val="grad:radial:#4338ca,#a78bfa"
                    onPick={onChange}
                />
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

function Preset({
    label,
    val,
    onPick,
}: {
    label: string;
    val: string;
    onPick: (v: string) => void;
}) {
    return (
        <Button type="button" variant="secondary" onClick={() => onPick(val)}>
            {label}
        </Button>
    );
}

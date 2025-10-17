'use client';

import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

type Props = {
    value?: Date | undefined;
    onChange?: (date: Date | undefined) => void;
    timeValue?: string;
    onTimeChange?: (time: string) => void;
    showTime?: boolean;
};

export function DateTimePicker({ value, onChange, timeValue, onTimeChange, showTime = true }: Props) {
    const [open, setOpen] = React.useState(false);
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(
        value,
    );

    const date = value ?? internalDate;

    return (
        <div className="grid grid-cols-2 gap-4">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date-picker"
                        className="w-full justify-between font-normal"
                    >
                        {date ? date.toLocaleDateString() : 'Select date'}
                        <ChevronDownIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                >
                    <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(d) => {
                            setInternalDate(d);
                            onChange?.(d);
                            setOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>
            {showTime && (
                <Input
                    type="time"
                    id="time-picker"
                    step="1"
                    value={timeValue ?? ''}
                    onChange={(e) => onTimeChange?.(e.target.value)}
                    className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
            )}
        </div>
    );
}

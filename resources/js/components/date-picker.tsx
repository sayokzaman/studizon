'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

type Props = {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
};

export function DatePicker({ value, onChange }: Props) {
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(value);
    const date = value ?? internalDate;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    data-empty={!date}
                    className="w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                >
                    <CalendarIcon />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                        setInternalDate(d);
                        onChange?.(d);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}

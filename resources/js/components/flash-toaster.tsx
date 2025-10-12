import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function FlashToaster() {
    const { props } = usePage();
    const flash = props.flash as { message?: string; success?: boolean };

    useEffect(() => {
        if (flash?.message) {
            toast(flash.success ? 'Success' : 'Error', {
                description: flash.message,
                duration: 5000,
            });
        }
    }, [flash?.message, flash?.success]);

    return null;
}

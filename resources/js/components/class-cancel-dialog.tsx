import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ClassRoom } from '@/types/classroom';
import { useForm } from '@inertiajs/react';
import { LogOutIcon } from 'lucide-react';
import { route } from 'ziggy-js';

const ClassCancelDialog = ({ classroom }: { classroom: ClassRoom }) => {
    const { post } = useForm();

    const handleCancel = () => {
        post(route('classroom.cancel', classroom.id), {
            onSuccess: () => {
                // Optionally, you can refresh the page or update the state to reflect the changes
                // window.location.reload();
            },
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <LogOutIcon className="h-4 w-4" />
                    Cancel Class
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure you want cancel this class?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        cancel the classroom and deduct credits where applied.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={handleCancel} variant={'destructive'}>
                        Confirm
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ClassCancelDialog;

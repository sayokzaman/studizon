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

const ClassLeaveDialog = ({ classroom }: { classroom: ClassRoom }) => {
    const { post } = useForm();
    const handleLeave = () => {
        post(route('classroom.leave', classroom.id), {
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
                    Leave Class
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure you want leave this class?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        remove all your data from the classroom.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={handleLeave} variant={'destructive'}>
                        Leave
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ClassLeaveDialog;

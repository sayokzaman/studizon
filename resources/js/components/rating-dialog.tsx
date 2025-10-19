import StarRating from '@/components/star-rating';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ClassRoom } from '@/types/classroom';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

type Props = {
    classroom: ClassRoom;
    openRatingModal: boolean;
    setOpenRatingModal: (open: boolean) => void;
};

export const RatingDialog = ({
    classroom,
    openRatingModal,
    setOpenRatingModal,
}: Props) => {
    const [open, setOpen] = useState(openRatingModal);

    useEffect(() => {
        setOpen(openRatingModal);
    }, [openRatingModal]);

    const { data, setData, post } = useForm({
        rating: 0,
        user_id: classroom.teacher_id,
        classroom_id: classroom.id,
    });

    const handleRating = () => {
        post(route('user.rating'), {
            onSuccess: () => {
                setOpen(false);
            },
            onError: () => {
                setOpen(false);
            },
            preserveScroll: true,
        });
    };

    return (
        <AlertDialog
            open={open}
            onOpenChange={(open) => {
                setOpen(open);
                setOpenRatingModal(open);
            }}
        >
            <AlertDialogContent className="flex w-xs flex-col">
                <AlertDialogHeader>
                    <AlertDialogTitle>Rate this classroom</AlertDialogTitle>
                    <AlertDialogDescription>
                        How would you rate this classroom?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex w-full gap-4 sm:flex-col sm:items-center sm:justify-center">
                    <div className="w-8/12">
                        <StarRating
                            rating={data.rating}
                            onRatingChange={(rating) =>
                                setData('rating', rating)
                            }
                            readonly={false}
                        />
                    </div>
                    <div className="grid w-full grid-cols-2 gap-2">
                        <AlertDialogCancel>Not Now</AlertDialogCancel>
                        <Button onClick={handleRating}>Submit</Button>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

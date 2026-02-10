import NotificationCard from '@/components/notification-card';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Notification } from '@/types/notification';
import { Bell } from 'lucide-react';

type Props = {
    notifications: Notification[];
};

const NotificationPopup = ({ notifications }: Props) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {notifications.length}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <PopoverHeader>
                    <PopoverTitle>Notifications</PopoverTitle>
                    <PopoverDescription>
                        You have {notifications.length} new{' '}
                        {notifications.length === 1 ? 'notification' : 'notifications'}.
                    </PopoverDescription>
                </PopoverHeader>
                <div className="flex max-h-80 flex-col gap-2 overflow-y-auto mt-4">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                            />
                        ))
                    ) : (
                        <p className="text-center">No notifications</p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationPopup;

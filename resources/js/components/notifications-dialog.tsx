import NotificationCard from '@/components/notification-card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Notification } from '@/types/notification';
import { BellIcon } from 'lucide-react';

type Props = {
    notifications: Notification[];
};

const NotificationDialog = ({ notifications }: Props) => {
    console.log(notifications && notifications.length);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <SidebarMenuButton
                    className="group flex items-center justify-between text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                    data-test="sidebar-menu-button"
                >
                    <div className="flex items-center gap-2">
                        <BellIcon className="size-4" />
                        <span>Notifications</span>
                    </div>
                    <Badge className="h-4 px-1" variant={'destructive'}>
                        {notifications && notifications.length}
                    </Badge>
                </SidebarMenuButton>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Notifications</DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <NotificationCard notification={notification} />
                        ))
                    ) : (
                        <p className="text-center">No notifications</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default NotificationDialog;

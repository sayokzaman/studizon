import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Notification } from '@/types/notification';

const NotificationCard = ({ notification }: { notification: Notification }) => {
    if (notification.type === 'follow')
        return (
            <Card>
                <CardHeader className="flex-row">
                    <img
                        src={notification.follower.image}
                        className="mr-2 h-10 w-10 rounded-full"
                    />
                    <div className="grid gap-1">
                        <CardTitle>
                            {notification.follower.name} followed you
                        </CardTitle>
                        <p className="text-sm">{notification.follower.email}</p>
                    </div>
                </CardHeader>
                <CardContent className="flex gap-2">
                    <Button>Follow Back</Button>
                    <Button variant="destructive">Remove Follower</Button>
                </CardContent>
            </Card>
        );

    if (notification.type === 'classroom_cancelled')
        return (
            <Card>
                <CardHeader className="flex-row">
                    {/* <img
                        src={notification.follower.image}
                        className="mr-2 h-10 w-10 rounded-full"
                    /> */}
                    <div className="grid gap-1">
                        <CardTitle className="capitalized">
                            {notification.classroom?.topic} classroom cancelled.
                        </CardTitle>
                        {/* <p className="text-sm">{notification.follower.email}</p> */}
                    </div>
                </CardHeader>
            </Card>
        );
};

export default NotificationCard;

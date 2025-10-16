// resources/js/Pages/Classrooms/Live.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ClassRoom } from '@/types/classroom';
import { router } from '@inertiajs/react';
import {
    RemoteTrack,
    RemoteTrackPublication,
    Room,
    RoomEvent,
    createLocalAudioTrack,
    createLocalVideoTrack,
} from 'livekit-client';
import { AirplayIcon, LogOutIcon, MicIcon, VideoIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';

type Props = { classroom: ClassRoom };

export default function Live({ classroom }: Props) {
    const [room, setRoom] = useState<Room | null>(null);
    const [joined, setJoined] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let lkRoom: Room;

        const join = async () => {
            // get token
            const res = await fetch(route('classrooms.token', classroom.id), {
                headers: { Accept: 'application/json' },
                credentials: 'include',
            });
            if (!res.ok) {
                // not authorized → go back to classroom show (or show toast)
                router.visit(route('classroom.show', classroom.id));
                return;
            }
            const { url, token } = await res.json();

            lkRoom = new Room({ adaptiveStream: true, dynacast: true });
            setRoom(lkRoom);

            lkRoom.on(
                RoomEvent.TrackSubscribed,
                (
                    track: RemoteTrack,
                    pub: RemoteTrackPublication,
                    participant,
                ) => {
                    if (!containerRef.current) return;
                    const el = document.createElement(
                        track.kind === 'video' ? 'video' : 'audio',
                    ) as HTMLVideoElement | HTMLAudioElement;
                    if (pub.trackSid) el.dataset.trackSid = pub.trackSid;
                    el.dataset.participant = participant.identity;
                    containerRef.current.appendChild(el);
                    track.attach(el);
                    el.autoplay = true;
                    if (el instanceof HTMLVideoElement) el.playsInline = true;
                },
            );

            lkRoom.on(
                RoomEvent.TrackUnsubscribed,
                (track: RemoteTrack, pub: RemoteTrackPublication) => {
                    track.detach();
                    if (!containerRef.current || !pub.trackSid) return;
                    containerRef.current
                        .querySelectorAll(`[data-track-sid="${pub.trackSid}"]`)
                        .forEach((n) => n.remove());
                },
            );

            await lkRoom.connect(url, token);

            // publish available tracks
            try {
                const mic = await createLocalAudioTrack();
                await lkRoom.localParticipant.publishTrack(mic);
            } catch {}

            try {
                const cam = await createLocalVideoTrack();
                await lkRoom.localParticipant.publishTrack(cam);
            } catch {}

            setJoined(true);
        };

        join();

        return () => {
            lkRoom?.disconnect();
        };
    }, [classroom.id]);

    const leave = async () => {
        await room?.disconnect();
        setJoined(false);
        setRoom(null);
        router.visit(route('classroom.show', classroom.id));
    };

    /** ———————————————— UI (unchanged) ———————————————— */
    return (
        <div className="h-screen w-screen">
            {joined ? (
                <div className="flex h-full w-full flex-col justify-between gap-4 p-4">
                    <div className="flex h-full gap-4">
                        {/* Main video area */}
                        <div className="h-full w-9/12 rounded-lg border p-4">
                            <div className="flex flex-col gap-1 border-b pb-2.5">
                                <p className="text-lg font-bold">
                                    {classroom.topic}
                                </p>
                                <div className="text-md flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                    <p>{classroom.scheduled_date}</p>
                                    <span className="text-[4px]">⬤</span>
                                    {classroom.start_time
                                        .split(':')
                                        .slice(0, 2)
                                        .join(':')}{' '}
                                    -{' '}
                                    {classroom.end_time
                                        .split(':')
                                        .slice(0, 2)
                                        .join(':')}
                                </div>
                            </div>

                            <div className="mt-3">
                                {/* Remote media tiles appended here */}
                                <div
                                    ref={containerRef}
                                    className="grid grid-cols-2 gap-2"
                                />

                                {/* Autoplay CTA */}
                                {/* {!audioOK && (
                                    <div className="mt-3 flex justify-center">
                                        <Button
                                            onClick={enableAudio}
                                            className="h-10"
                                        >
                                            Click to enable sound
                                        </Button>
                                    </div>
                                )} */}
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="flex h-full w-3/12 flex-col gap-4">
                            <div className="h-8/12 rounded-lg border p-4">
                                <div className="text-md flex items-center gap-1 border-b pb-2.5 font-bold">
                                    Participants{' '}
                                    <span className="h-4 w-4 rounded-full bg-amber-600 text-center text-xs text-secondary">
                                        {classroom.students?.length ?? 0}
                                    </span>
                                </div>

                                <div className="mt-3 flex flex-col gap-2">
                                    {classroom.students &&
                                    classroom.students.length > 0 ? (
                                        classroom.students.map((s) => (
                                            <div
                                                key={s.id}
                                                className="flex items-center justify-between rounded-lg bg-muted p-4 text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Avatar>
                                                        <AvatarImage
                                                            src={
                                                                s.avatar ||
                                                                'https://avatar.iran.liara.run/public'
                                                            }
                                                            alt={s.name}
                                                        />
                                                        <AvatarFallback>
                                                            {s.name}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p>{s.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MicIcon className="size-5" />
                                                    <VideoIcon className="size-5" />
                                                    <AirplayIcon className="size-5" />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div>
                                            <p className="text-sm">
                                                No participants
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex h-4/12 flex-col rounded-lg border p-4">
                                <div className="text-md flex items-center gap-1 border-b pb-2.5 font-bold">
                                    Messages
                                </div>
                                <div className="h-full" />
                                <div>
                                    <Input
                                        className="items-end"
                                        placeholder="Type a message… (coming soon)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom controls */}
                    <div className="flex items-end justify-center gap-2">
                        <Button
                            // onClick={toggleMic}
                            className="size-10"
                            // variant={isMicOn ? 'default' : 'secondary'}
                        >
                            <MicIcon className="size-5" />
                        </Button>

                        <Button
                            // onClick={toggleCam}
                            className="size-10"
                            // variant={isCamOn ? 'default' : 'secondary'}
                        >
                            <VideoIcon className="size-5" />
                        </Button>

                        <Button
                            onClick={leave}
                            className="size-10"
                            title="Disconnect"
                        >
                            <AirplayIcon className="size-5" />
                        </Button>

                        <Button
                            onClick={leave}
                            variant="destructive"
                            className="h-10"
                        >
                            <LogOutIcon className="mr-2 size-5" /> Leave
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <Spinner className="mr-2 size-10" /> Joining Classroom...
                </div>
            )}
        </div>
    );
}

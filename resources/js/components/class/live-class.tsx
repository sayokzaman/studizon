// resources/js/Pages/Classrooms/Live.tsx
import { router } from '@inertiajs/react';
import {
    RemoteTrack,
    RemoteTrackPublication,
    Room,
    RoomEvent,
    createLocalAudioTrack,
    createLocalVideoTrack,
} from 'livekit-client';
import { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';

export default function Live({
    classroom,
}: {
    classroom: {
        id: number;
        topic: string;
        is_live: boolean;
        is_teacher: boolean;
    };
}) {
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

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                {joined ? (
                    <button onClick={leave}>Leave</button>
                ) : (
                    <span>Connecting…</span>
                )}
            </div>

            <div ref={containerRef} className="grid grid-cols-2 gap-2" />
        </div>
    );
}

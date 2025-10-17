// resources/js/Pages/Classrooms/Live.tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ClassRoom } from '@/types/classroom';
import { router } from '@inertiajs/react';
import {
    LocalTrackPublication,
    Participant,
    RemoteTrack,
    RemoteTrackPublication,
    Room,
    RoomEvent,
    Track,
} from 'livekit-client';
import {
    AirplayIcon,
    LogOutIcon,
    MicIcon,
    MicOffIcon,
    SendIcon,
    VideoIcon,
    VideoOffIcon,
} from 'lucide-react';
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';

type Props = { classroom: ClassRoom };

type ChatMessage = {
    id: string;
    identity: string;
    name: string;
    content: string;
    timestamp: number;
    isLocal: boolean;
};

type ParticipantInfo = {
    sid: string;
    identity: string;
    name: string;
    email?: string;
    isLocal: boolean;
    isMicEnabled: boolean;
    isCamEnabled: boolean;
    isScreenSharing: boolean;
};

export default function Live({ classroom }: Props) {
    const [room, setRoom] = useState<Room | null>(null);
    const [joined, setJoined] = useState(false);
    const [isMicEnabled, setIsMicEnabled] = useState(false);
    const [isCamEnabled, setIsCamEnabled] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const resolveParticipantContact = (
        participant: Participant,
        currentClassroom: ClassRoom,
    ) => {
        const identity = participant.identity;
        let metadataName: string | undefined;
        let metadataEmail: string | undefined;
        if (participant.metadata) {
            try {
                const parsed = JSON.parse(participant.metadata);
                if (parsed && typeof parsed === 'object') {
                    metadataName =
                        typeof parsed.name === 'string'
                            ? parsed.name.trim()
                            : undefined;
                    metadataEmail =
                        typeof parsed.email === 'string'
                            ? parsed.email.trim()
                            : undefined;
                }
            } catch {
                /* ignore malformed metadata */
            }
        }
        const candidates = [
            currentClassroom.teacher,
            ...(currentClassroom.students ?? []),
        ].filter(Boolean) as Array<
            | NonNullable<ClassRoom['teacher']>
            | NonNullable<ClassRoom['students']>[number]
        >;

        const match = candidates.find((user) => {
            if (!user) return false;
            if (String(user.id) === identity) return true;
            if (
                user.email &&
                user.email.toLowerCase() === identity.toLowerCase()
            ) {
                return true;
            }
            return false;
        });

        return {
            name:
                match?.name?.trim() ||
                metadataName ||
                participant.name?.trim() ||
                identity,
            email: match?.email ?? metadataEmail ?? undefined,
        };
    };

    const buildParticipantList = useCallback((targetRoom: Room): ParticipantInfo[] => {
        const list: ParticipantInfo[] = [];

        const getPublication = (
            participant: Participant,
            source: Track.Source,
        ) => {
            const participantWithGetter = participant as Participant & {
                getTrackPublication?: (
                    src: Track.Source,
                ) => LocalTrackPublication | RemoteTrackPublication | undefined;
                tracks?: Map<
                    string,
                    LocalTrackPublication | RemoteTrackPublication
                >;
            };

            if (
                typeof participantWithGetter.getTrackPublication === 'function'
            ) {
                return participantWithGetter.getTrackPublication(source);
            }

            const tracksMap = participantWithGetter.tracks;
            if (tracksMap instanceof Map) {
                for (const publication of tracksMap.values()) {
                    if (publication.source === source) return publication;
                }
            }
            return undefined;
        };

        const isPublicationActive = (
            publication:
                | LocalTrackPublication
                | RemoteTrackPublication
                | undefined,
        ) => {
            if (!publication) return false;
            if ('isMuted' in publication && publication.isMuted) return false;
            if ('isSubscribed' in publication && !publication.isSubscribed) {
                return false;
            }
            const track = publication.track;
            if (!track) return false;
            if ('isMuted' in track && track.isMuted) return false;
            return true;
        };

        const coerceParticipantFlag = (
            participant: Participant,
            key:
                | 'isMicrophoneEnabled'
                | 'isCameraEnabled'
                | 'isScreenShareEnabled',
        ) => {
            const value = (
                participant as unknown as Record<
                    typeof key,
                    boolean | (() => boolean)
                >
            )[key];
            if (typeof value === 'function') {
                try {
                    return value.call(participant);
                } catch {
                    return false;
                }
            }
            return Boolean(value);
        };

        const toInfo = (participant: Participant, isLocal: boolean) => {
            const contact = resolveParticipantContact(participant, classroom);
            const micPublication = getPublication(
                participant,
                Track.Source.Microphone,
            );
            const camPublication = getPublication(
                participant,
                Track.Source.Camera,
            );
            const screenPublication = getPublication(
                participant,
                Track.Source.ScreenShare,
            );

            const isMicActive =
                isPublicationActive(micPublication) ||
                Boolean(
                    coerceParticipantFlag(participant, 'isMicrophoneEnabled'),
                );
            const isCamActive =
                isPublicationActive(camPublication) ||
                Boolean(coerceParticipantFlag(participant, 'isCameraEnabled'));
            const isScreenActive =
                isPublicationActive(screenPublication) ||
                Boolean(
                    coerceParticipantFlag(participant, 'isScreenShareEnabled'),
                );

            return {
                sid: participant.sid ?? participant.identity,
                identity: participant.identity,
                name: contact.name,
                email: contact.email,
                isLocal,
                isMicEnabled: isMicActive,
                isCamEnabled: isCamActive,
                isScreenSharing: isScreenActive,
            };
        };

        const localParticipant = targetRoom.localParticipant;
        if (localParticipant) {
            list.push(toInfo(localParticipant, true));
        }

        const seen = new Set<string>();
        const appendRemote = (participant: Participant | undefined) => {
            if (!participant) return;
            const key = participant.sid || participant.identity;
            if (seen.has(key)) return;
            seen.add(key);
            list.push(toInfo(participant, false));
        };

        const remoteMaps: Array<
            | Map<string, Participant>
            | Participant[]
            | {
                  forEach?: (cb: (participant: Participant) => void) => void;
              }
            | undefined
        > = [
            (
                targetRoom as Partial<Room> & {
                    participants?: Map<string, Participant>;
                }
            ).participants,
            (
                targetRoom as Partial<Room> & {
                    remoteParticipants?: Map<string, Participant>;
                }
            ).remoteParticipants,
        ];

        remoteMaps.forEach((collection) => {
            if (!collection) return;
            if (collection instanceof Map) {
                collection.forEach((participant) => appendRemote(participant));
                return;
            }
            if (Array.isArray(collection)) {
                collection.forEach((participant) => appendRemote(participant));
                return;
            }
            if (typeof collection.forEach === 'function') {
                collection.forEach((participant: Participant) =>
                    appendRemote(participant),
                );
            }
        });

        return list;
    }, [classroom]);

    useEffect(() => {
        setMessages([]);
        setIsMicEnabled(false);
        setIsCamEnabled(false);
        setIsScreenSharing(false);
        setParticipants([]);
        let lkRoom: Room;
        const audioEvents = ['click', 'keydown', 'touchstart'] as const;
        let resumeAudio: ((event: Event) => void | Promise<void>) | null = null;
        let awaitingUserUnlock = false;

        const updateParticipants = () => {
            if (!lkRoom) return;
            setParticipants(buildParticipantList(lkRoom));
        };

        const cleanupAudioListeners = () => {
            if (typeof window === 'undefined') return;
            if (!resumeAudio) return;
            audioEvents.forEach((event) =>
                window.removeEventListener(event, resumeAudio as EventListener),
            );
            resumeAudio = null;
            awaitingUserUnlock = false;
        };

        const handleTrackSubscribed = (
            track: RemoteTrack,
            pub: RemoteTrackPublication,
            participant: Participant,
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
            updateParticipants();
        };

        const handleTrackUnsubscribed = (
            track: RemoteTrack,
            pub: RemoteTrackPublication,
        ) => {
            track.detach();
            if (!containerRef.current || !pub.trackSid) return;
            containerRef.current
                .querySelectorAll(`[data-track-sid="${pub.trackSid}"]`)
                .forEach((n) => n.remove());
            updateParticipants();
        };

        const handleLocalTrackPublished = (
            publication: LocalTrackPublication,
        ) => {
            if (publication.source === Track.Source.ScreenShare) {
                setIsScreenSharing(true);
            }
            updateParticipants();
        };

        const handleLocalTrackUnpublished = (
            publication: LocalTrackPublication,
        ) => {
            if (publication.source === Track.Source.ScreenShare) {
                setIsScreenSharing(false);
            }
            updateParticipants();
        };

        const handleParticipantConnected = () => updateParticipants();
        const handleParticipantDisconnected = () => updateParticipants();
        const handleTrackMuted = () => updateParticipants();
        const handleTrackUnmuted = () => updateParticipants();
        const handleTrackPublished = () => updateParticipants();
        const handleTrackUnpublished = () => updateParticipants();

        const handleDataReceived = (
            payload: Uint8Array,
            participantOrUndefined?: Participant,
        ) => {
            if (!lkRoom) return;
            try {
                const text = new TextDecoder().decode(payload);
                const parsed = JSON.parse(text);
                if (parsed?.type !== 'chat') return;
                const content = String(parsed.message ?? '').trim();
                if (!content) return;
                const messageId =
                    typeof parsed.id === 'string' && parsed.id.length
                        ? parsed.id
                        : typeof crypto !== 'undefined' &&
                            'randomUUID' in crypto
                          ? crypto.randomUUID()
                          : `${Date.now()}-${Math.random()}`;
                const name =
                    parsed.name ??
                    participantOrUndefined?.name ??
                    participantOrUndefined?.identity ??
                    'Participant';
                const identity =
                    parsed.identity ??
                    participantOrUndefined?.identity ??
                    'unknown';
                const timestamp = parsed.timestamp ?? Date.now();
                setMessages((prev) => {
                    if (prev.some((msg) => msg.id === messageId)) {
                        return prev;
                    }
                    return [
                        ...prev,
                        {
                            id: messageId,
                            identity,
                            name,
                            content,
                            timestamp,
                            isLocal:
                                lkRoom.localParticipant.identity === identity,
                        },
                    ];
                });
            } catch (error) {
                console.warn('Unable to parse incoming message', error);
            }
        };

        const join = async () => {
            // get token
            const res = await fetch(route('classroom.token', classroom.id), {
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

            lkRoom.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
            lkRoom.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
            lkRoom.on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);
            lkRoom.on(
                RoomEvent.LocalTrackUnpublished,
                handleLocalTrackUnpublished,
            );
            lkRoom.on(RoomEvent.DataReceived, handleDataReceived);
            lkRoom.on(
                RoomEvent.ParticipantConnected,
                handleParticipantConnected,
            );
            lkRoom.on(
                RoomEvent.ParticipantDisconnected,
                handleParticipantDisconnected,
            );
            lkRoom.on(RoomEvent.TrackMuted, handleTrackMuted);
            lkRoom.on(RoomEvent.TrackUnmuted, handleTrackUnmuted);
            lkRoom.on(RoomEvent.TrackPublished, handleTrackPublished);
            lkRoom.on(RoomEvent.TrackUnpublished, handleTrackUnpublished);

            await lkRoom.connect(url, token);
            updateParticipants();

            // keep local devices disabled until the user chooses to enable them

            const enableAudioPlayback = async () => {
                try {
                    await lkRoom.startAudio();

                    return true;
                } catch (error) {
                    console.warn(
                        'LiveKit audio playback could not start immediately.',
                        error,
                    );
                }
                return false;
            };

            const requestAudioUnlock = () => {
                if (awaitingUserUnlock) return;
                awaitingUserUnlock = true;
                if (typeof window === 'undefined') return;
                if (!resumeAudio) {
                    resumeAudio = async () => {
                        const started = await enableAudioPlayback();
                        if (!started) return;
                        cleanupAudioListeners();
                    };
                }
                audioEvents.forEach((event) =>
                    window.addEventListener(
                        event,
                        resumeAudio as EventListener,
                        { once: false },
                    ),
                );
            };

            let audioStarted = false;
            const hasUserActivation =
                typeof navigator !== 'undefined' &&
                'userActivation' in navigator &&
                Boolean(navigator.userActivation?.isActive);

            if (hasUserActivation) {
                audioStarted = await enableAudioPlayback();
            }

            if (!audioStarted) {
                requestAudioUnlock();
            }

            setJoined(true);
        };

        join();

        return () => {
            cleanupAudioListeners();
            if (lkRoom) {
                lkRoom.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
                lkRoom.off(
                    RoomEvent.TrackUnsubscribed,
                    handleTrackUnsubscribed,
                );
                lkRoom.off(
                    RoomEvent.LocalTrackPublished,
                    handleLocalTrackPublished,
                );
                lkRoom.off(
                    RoomEvent.LocalTrackUnpublished,
                    handleLocalTrackUnpublished,
                );
                lkRoom.off(RoomEvent.DataReceived, handleDataReceived);
                lkRoom.off(
                    RoomEvent.ParticipantConnected,
                    handleParticipantConnected,
                );
                lkRoom.off(
                    RoomEvent.ParticipantDisconnected,
                    handleParticipantDisconnected,
                );
                lkRoom.off(RoomEvent.TrackMuted, handleTrackMuted);
                lkRoom.off(RoomEvent.TrackUnmuted, handleTrackUnmuted);
                lkRoom.off(RoomEvent.TrackPublished, handleTrackPublished);
                lkRoom.off(RoomEvent.TrackUnpublished, handleTrackUnpublished);
                lkRoom.disconnect();
            }
            setParticipants([]);
        };
    }, [classroom.id, buildParticipantList]);

    useEffect(() => {
        if (!chatContainerRef.current) return;
        chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
        });
    }, [messages]);

    const toggleMic = async () => {
        if (!room) return;
        const next = !isMicEnabled;
        try {
            await room.localParticipant.setMicrophoneEnabled(next);
            setIsMicEnabled(next);
            setParticipants(buildParticipantList(room));
        } catch (error) {
            console.error('Unable to toggle microphone', error);
        }
    };

    const toggleCam = async () => {
        if (!room) return;
        const next = !isCamEnabled;
        try {
            await room.localParticipant.setCameraEnabled(next);
            setIsCamEnabled(next);
            setParticipants(buildParticipantList(room));
        } catch (error) {
            console.error('Unable to toggle camera', error);
        }
    };

    const toggleScreenShare = async () => {
        if (!room) return;
        const next = !isScreenSharing;
        try {
            await room.localParticipant.setScreenShareEnabled(next, {
                audio: false,
            });
            if (!next) {
                setIsScreenSharing(false);
                setParticipants(buildParticipantList(room));
                return;
            }
            setIsScreenSharing(true);
            setParticipants(buildParticipantList(room));
        } catch (error) {
            console.error('Unable to toggle screen share', error);
        }
    };

    const handleChatInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setChatInput(event.target.value);
    };

    const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!room) return;
        const trimmed = chatInput.trim();
        if (!trimmed) return;

        const messageId =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`;
        const payload = {
            type: 'chat' as const,
            id: messageId,
            message: trimmed,
            identity: room.localParticipant.identity,
            name:
                room.localParticipant.name ??
                room.localParticipant.identity ??
                'You',
            timestamp: Date.now(),
        };

        try {
            const encoded = new TextEncoder().encode(JSON.stringify(payload));
            await room.localParticipant.publishData(encoded, {
                reliable: true,
            });
            setMessages((prev) => {
                if (prev.some((msg) => msg.id === payload.id)) {
                    return prev;
                }
                return [
                    ...prev,
                    {
                        id: payload.id,
                        identity: payload.identity ?? 'local',
                        name: payload.name,
                        content: payload.message,
                        timestamp: payload.timestamp,
                        isLocal: true,
                    },
                ];
            });
            setChatInput('');
        } catch (error) {
            console.error('Unable to send message', error);
        }
    };

    const leave = async () => {
        await room?.disconnect();
        setJoined(false);
        setRoom(null);
        setIsMicEnabled(false);
        setIsCamEnabled(false);
        setIsScreenSharing(false);
        setMessages([]);
        setParticipants([]);
        router.visit(route('classroom.show', classroom.id));
    };

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
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="flex h-full w-3/12 flex-col gap-4">
                            <div className="h-8/12 rounded-lg border p-4">
                                <div className="text-md flex items-center gap-1 border-b pb-2.5 font-bold">
                                    Participants{' '}
                                    <span className="h-4 w-4 rounded-full bg-amber-600 text-center text-xs text-secondary">
                                        {participants.length}
                                    </span>
                                </div>

                                <div className="mt-3 flex flex-col gap-2">
                                    {participants.length ? (
                                        participants.map((participant) => {
                                            const displayName =
                                                participant.name ||
                                                participant.identity;
                                            const secondaryText =
                                                participant.email ??
                                                (participant.isLocal
                                                    ? 'You'
                                                    : participant.identity);
                                            const fallback =
                                                displayName
                                                    ?.trim()
                                                    .split(/\s+/)
                                                    .map((word) => word[0])
                                                    .join('')
                                                    .slice(0, 2)
                                                    .toUpperCase() || '?';

                                            return (
                                                <div
                                                    key={participant.sid}
                                                    className="flex items-center justify-between rounded-lg bg-muted p-4 text-sm"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Avatar>
                                                            <AvatarFallback>
                                                                {fallback}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">
                                                                {displayName}
                                                                {participant.isLocal
                                                                    ? ' (You)'
                                                                    : ''}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {secondaryText}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        {participant.isMicEnabled ? (
                                                            <MicIcon className="size-5 text-emerald-600" />
                                                        ) : (
                                                            <MicOffIcon className="size-5" />
                                                        )}
                                                        {participant.isCamEnabled ? (
                                                            <VideoIcon className="size-5 text-emerald-600" />
                                                        ) : (
                                                            <VideoOffIcon className="size-5" />
                                                        )}
                                                        {participant.isScreenSharing ? (
                                                            <AirplayIcon className="size-5 text-emerald-600" />
                                                        ) : (
                                                            <AirplayIcon className="size-5 opacity-30" />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div>
                                            <p className="text-sm">
                                                No one is connected.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex h-4/12 flex-col rounded-lg border p-4">
                                <div className="text-md flex items-center gap-1 border-b pb-2.5 font-bold">
                                    Messages
                                </div>
                                <div
                                    ref={chatContainerRef}
                                    className="mt-2 flex-1 overflow-y-auto pr-1"
                                >
                                    {messages.length ? (
                                        messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className="mb-2 rounded-md bg-muted p-2 text-xs last:mb-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold">
                                                        {message.isLocal
                                                            ? 'You'
                                                            : message.name}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(
                                                            message.timestamp,
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm">
                                                    {message.content}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            No messages yet.
                                        </p>
                                    )}
                                </div>
                                <form
                                    onSubmit={handleSendMessage}
                                    className="mt-3 flex gap-2"
                                >
                                    <Input
                                        value={chatInput}
                                        onChange={handleChatInputChange}
                                        placeholder="Type a message..."
                                        autoComplete="off"
                                    />
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        className="flex items-center justify-center"
                                        disabled={!chatInput.trim()}
                                    >
                                        <SendIcon className="size-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Bottom controls */}
                    <div className="flex items-end justify-center gap-2">
                        <Button
                            onClick={toggleMic}
                            className="size-10"
                            variant={isMicEnabled ? 'default' : 'secondary'}
                            title={
                                isMicEnabled
                                    ? 'Mute microphone'
                                    : 'Unmute microphone'
                            }
                            disabled={!room}
                            aria-pressed={isMicEnabled}
                        >
                            {isMicEnabled ? (
                                <MicIcon className="size-5" />
                            ) : (
                                <MicOffIcon className="size-5" />
                            )}
                        </Button>

                        <Button
                            onClick={toggleCam}
                            className="size-10"
                            variant={isCamEnabled ? 'default' : 'secondary'}
                            title={
                                isCamEnabled
                                    ? 'Turn camera off'
                                    : 'Turn camera on'
                            }
                            disabled={!room}
                            aria-pressed={isCamEnabled}
                        >
                            {isCamEnabled ? (
                                <VideoIcon className="size-5" />
                            ) : (
                                <VideoOffIcon className="size-5" />
                            )}
                        </Button>

                        <Button
                            onClick={toggleScreenShare}
                            className="size-10"
                            variant={isScreenSharing ? 'default' : 'secondary'}
                            title={
                                isScreenSharing
                                    ? 'Stop sharing screen'
                                    : 'Share screen'
                            }
                            disabled={!room}
                            aria-pressed={isScreenSharing}
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

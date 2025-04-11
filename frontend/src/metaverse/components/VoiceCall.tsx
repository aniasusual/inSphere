// VoiceCall.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from 'socket'; // Adjust path to your useSocket hook

// Type definitions
interface IceServer {
    urls: string;
}

interface RTCConfiguration {
    iceServers: IceServer[];
}

interface SignalMessage {
    type: 'offer' | 'answer' | 'candidate';
    data: RTCSessionDescriptionInit | RTCIceCandidateInit;
    userId: string; // Target user ID
}

interface JamUser {
    jamId: string;
    userId: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w: number };
    name: string;
    avatarUrl: string;
    lastUpdate: number;
}

interface VoiceCallProps {
    currentUserId: string; // From authenticated user
    jamId: string; // Current jam the user is in
    currentPosition: { x: number; y: number; z: number }; // Current user's position
}

const configuration: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

const VOICE_CHAT_RANGE = 2; // Distance threshold for "nearby" users (adjust as needed)

const VoiceCall: React.FC<VoiceCallProps> = ({ currentUserId, jamId, currentPosition }) => {
    const [isCallActive, setIsCallActive] = useState<boolean>(false);
    const [peerConnections, setPeerConnections] = useState<Map<string, RTCPeerConnection>>(new Map());

    const { socket, isConnected } = useSocket();

    const localAudioRef = useRef<HTMLAudioElement>(null);
    const remoteAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
    const localStreamRef = useRef<MediaStream | null>(null);

    // Setup signaling listeners
    useEffect(() => {
        if (!socket) return;

        const handleSignal = (message: SignalMessage) => {
            handleSignalingMessage(message);
        };

        socket.on('signal', handleSignal);

        return () => {
            socket.off('signal', handleSignal);
        };
    }, [socket, peerConnections]);

    // Calculate nearby users based on position
    const getNearbyUsers = (): JamUser[] => {
        if (!socket || !isConnected) return [];

        // Request current jam users from the server or use a local state if synced
        // For simplicity, we'll emit a request and expect 'currentUsers' in response
        socket.emit('getJamUsers', { jamId });

        // This is a placeholder; you'll need to sync this with server data
        // Ideally, maintain a local state updated by 'currentUsers' event
        return [];
    };

    // Handle incoming signaling messages
    const handleSignalingMessage = async (message: SignalMessage) => {
        const { userId, type, data } = message;
        const pc = peerConnections.get(userId);

        if (!pc) return;

        try {
            switch (type) {
                case 'offer':
                    await pc.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    sendSignal({ type: 'answer', data: answer, userId });
                    break;

                case 'answer':
                    await pc.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit));
                    break;

                case 'candidate':
                    await pc.addIceCandidate(new RTCIceCandidate(data as RTCIceCandidateInit));
                    break;
            }
        } catch (error) {
            console.error(`Error handling signal from ${userId}:`, error);
        }
    };

    // Send signaling message to a specific user
    const sendSignal = (message: SignalMessage) => {
        if (socket && isConnected) {
            socket.emit('signal', message);
        }
    };

    // Start voice call with nearby users
    const handleStartCall = async () => {
        if (!socket || !isConnected) {
            console.error('Cannot start call: No socket connection');
            return;
        }

        if (isCallActive) {
            console.log('Call already active');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });

            localStreamRef.current = stream;
            if (localAudioRef.current) {
                localAudioRef.current.srcObject = stream;
            }

            // Request current users in the jam
            socket.emit('getJamUsers', { jamId });

            // Listen for the response (this should be moved to a proper state management)
            socket.once('currentUsers', async (jamUsers: JamUser[]) => {
                const nearbyUsers = jamUsers.filter(user => {
                    if (user.userId === currentUserId) return false;

                    const distance = Math.sqrt(
                        Math.pow(user.position.x - currentPosition.x, 2) +
                        Math.pow(user.position.y - currentPosition.y, 2) +
                        Math.pow(user.position.z - currentPosition.z, 2)
                    );

                    return distance <= VOICE_CHAT_RANGE;
                });

                if (nearbyUsers.length === 0) {
                    console.log('No nearby users to call');
                    return;
                }

                const newPeerConnections = new Map<string, RTCPeerConnection>();

                for (const user of nearbyUsers) {
                    const pc = new RTCPeerConnection(configuration);

                    stream.getTracks().forEach(track => {
                        pc.addTrack(track, stream);
                    });

                    pc.onicecandidate = (event) => {
                        if (event.candidate) {
                            sendSignal({
                                type: 'candidate',
                                data: event.candidate,
                                userId: user.userId
                            });
                        }
                    };

                    pc.ontrack = (event) => {
                        const audioElement = document.createElement('audio');
                        audioElement.autoplay = true;
                        audioElement.playsInline = true;
                        audioElement.srcObject = event.streams[0];
                        remoteAudioRefs.current.set(user.userId, audioElement);
                        document.body.appendChild(audioElement);
                    };

                    pc.onconnectionstatechange = () => {
                        console.log(`Connection state with ${user.userId}:`, pc.connectionState);
                        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                            cleanupPeerConnection(user.userId);
                        }
                    };

                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    sendSignal({ type: 'offer', data: offer, userId: user.userId });

                    newPeerConnections.set(user.userId, pc);
                }

                setPeerConnections(newPeerConnections);
                setIsCallActive(true);
            });

        } catch (error) {
            console.error('Error starting call:', error);
        }
    };

    // Cleanup specific peer connection
    const cleanupPeerConnection = (userId: string) => {
        const pc = peerConnections.get(userId);
        if (pc) {
            pc.close();
            const audio = remoteAudioRefs.current.get(userId);
            if (audio) {
                audio.remove();
                remoteAudioRefs.current.delete(userId);
            }
            setPeerConnections(prev => {
                const newMap = new Map(prev);
                newMap.delete(userId);
                return newMap;
            });
        }
    };

    // Disconnect all calls
    const handleDisconnectCall = () => {
        if (!isCallActive) {
            console.log('No active call to disconnect');
            return;
        }

        peerConnections.forEach((_, userId) => cleanupPeerConnection(userId));

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        setPeerConnections(new Map());
        setIsCallActive(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            handleDisconnectCall();
        };
    }, []);

    return (
        <div>
            <button
                onClick={handleStartCall}
                disabled={isCallActive || !isConnected}
            >
                Start Voice Chat
            </button>
            <button
                onClick={handleDisconnectCall}
                disabled={!isCallActive}
            >
                Disconnect Voice Chat
            </button>

            <audio
                ref={localAudioRef}
                autoPlay
                muted
                playsInline
            />
        </div>
    );
};

export default VoiceCall;
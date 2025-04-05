// VoiceChatService.ts

import { useEffect, useState, useRef } from 'react';
import "../MetaverseStyles.css"
interface VoiceChatOptions {
    roomId: string;
    userId: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onUserJoined?: (userId: string) => void;
    onUserLeft?: (userId: string) => void;
    onError?: (error: Error) => void;
}

interface VoiceChatState {
    isConnected: boolean;
    isActive: boolean;
    isMuted: boolean;
    users: string[];
    volume: number;
    error: Error | null;
}

// This is a simplified implementation that would need to be connected
// to a real WebRTC service like Agora, Twilio, or your own implementation
export const useVoiceChat = ({
    roomId,
    userId,
    onConnect,
    onDisconnect,
    onUserJoined,
    onUserLeft,
    onError
}: VoiceChatOptions) => {
    const [state, setState] = useState<VoiceChatState>({
        isConnected: false,
        isActive: false,
        isMuted: false,
        users: [],
        volume: 0.8,
        error: null
    });

    const mediaStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionsRef = useRef<{ [key: string]: RTCPeerConnection }>({});

    // Connect to voice chat
    const connect = async () => {
        try {
            // In a real implementation, you would set up WebRTC here
            // For this example, we'll simulate the connection

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // Simulate connection setup
            setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    isConnected: true,
                    isActive: true,
                    error: null
                }));
                onConnect?.();
            }, 1000);

            // Simulate other users in the room
            setTimeout(() => {
                const simulatedUsers = ['user-1', 'user-2'];
                setState(prev => ({
                    ...prev,
                    users: simulatedUsers
                }));
                simulatedUsers.forEach(user => onUserJoined?.(user));
            }, 2000);

        } catch (error) {
            console.error("Voice chat connection error:", error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error : new Error(String(error))
            }));
            onError?.(error instanceof Error ? error : new Error(String(error)));
        }
    };

    // Disconnect from voice chat
    const disconnect = () => {
        try {
            // Clean up resources
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }

            // Close peer connections
            Object.values(peerConnectionsRef.current).forEach(connection => {
                connection.close();
            });
            peerConnectionsRef.current = {};

            setState(prev => ({
                ...prev,
                isConnected: false,
                isActive: false,
                users: []
            }));

            onDisconnect?.();
        } catch (error) {
            console.error("Voice chat disconnection error:", error);
        }
    };

    // Toggle mute status
    const toggleMute = () => {
        if (mediaStreamRef.current) {
            const audioTracks = mediaStreamRef.current.getAudioTracks();
            const shouldMute = !state.isMuted;

            audioTracks.forEach(track => {
                track.enabled = !shouldMute;
            });

            setState(prev => ({
                ...prev,
                isMuted: shouldMute
            }));
        }
    };

    // Set volume
    const setVolume = (volume: number) => {
        setState(prev => ({
            ...prev,
            volume: Math.max(0, Math.min(1, volume))
        }));

        // In a real implementation, you would adjust the volume of incoming audio streams
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, []);

    return {
        state,
        connect,
        disconnect,
        toggleMute,
        setVolume
    };
};
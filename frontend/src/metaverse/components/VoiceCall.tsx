import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "socket";

interface User {
  id: string;
}

interface VoiceCallProps {
  nearbyUsers: User[];
  currentUserId: string;
}

interface VoiceOffer {
  offer: RTCSessionDescriptionInit;
  fromUserId: string;
}

interface VoiceAnswer {
  answer: RTCSessionDescriptionInit;
  fromUserId: string;
}

interface VoiceCandidate {
  candidate: RTCIceCandidateInit;
  fromUserId: string;
}

const VoiceCall: React.FC<VoiceCallProps> = ({
  nearbyUsers,
  currentUserId,
}) => {
  const [peerConnections, setPeerConnections] = useState<
    Map<string, RTCPeerConnection>
  >(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const { socket } = useSocket();

  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const iceCandidatesQueue = useRef<
    { candidate: RTCIceCandidateInit; fromUserId: string }[]
  >([]);

  const pc_config = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
      // Adding TURN server for better NAT traversal
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
  };

  const setupLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current = stream;
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Error accessing microphone:", err);
      return null;
    }
  };

  const createPeerConnection = async (targetUserId: string) => {
    try {
      const newPC = new RTCPeerConnection(pc_config);

      // Add local stream if mic is enabled
      if (localStreamRef.current && isAudioEnabled) {
        localStreamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => {
            newPC.addTrack(track, localStreamRef.current!);
          });
      }

      // Handle ICE candidates
      newPC.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("voiceCandidate", {
            candidate: e.candidate,
            targetUserId,
          });
        }
      };

      // Handle connection state changes
      newPC.onconnectionstatechange = () => {
        if (newPC.connectionState === "connected") {
          setConnectedUsers((prev) => new Set([...prev, targetUserId]));
        } else if (
          ["disconnected", "failed", "closed"].includes(newPC.connectionState)
        ) {
          handleDisconnect(targetUserId);
        }
      };

      // Handle incoming streams
      newPC.ontrack = (ev) => {
        const remoteAudio = remoteAudioRefs.current.get(targetUserId);
        if (remoteAudio) {
          remoteAudio.srcObject = ev.streams[0];
        }
      };

      return newPC;
    } catch (err) {
      console.error("Error creating peer connection:", err);
      return null;
    }
  };

  const handleDisconnect = (userId: string) => {
    const pc = peerConnections.get(userId);
    if (pc) {
      pc.close();
      peerConnections.delete(userId);
      setPeerConnections(new Map(peerConnections));
      setConnectedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const toggleMicrophone = async () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.enabled = newState;
      });
    } else if (newState) {
      // Setup stream if it doesn't exist
      await setupLocalStream();
    }
  };

  // Handle nearby users changes
  useEffect(() => {
    nearbyUsers.forEach(async (user: User) => {
      if (!peerConnections.has(user.id)) {
        const pc = await createPeerConnection(user.id);
        if (pc) {
          peerConnections.set(user.id, pc);
          setPeerConnections(new Map(peerConnections));

          // Create offer for new nearby user
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("voiceOffer", {
            offer,
            targetUserId: user.id,
          });
        }
      }
    });

    // Cleanup connections for users no longer nearby
    peerConnections.forEach((_, userId) => {
      if (!nearbyUsers.find((u: User) => u.id === userId)) {
        handleDisconnect(userId);
      }
    });
  }, [nearbyUsers]);

  useEffect(() => {
    if (!socket) return;

    const handleVoiceOffer = async ({ offer, fromUserId }: VoiceOffer) => {
      try {
        console.log("Received voice offer from:", fromUserId);
        setConnectedUsers((prev) => new Set([...prev, fromUserId]));

        const newPC = await createPeerConnection(fromUserId);
        if (!newPC) return;

        await newPC.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await newPC.createAnswer();
        await newPC.setLocalDescription(answer);

        console.log("Sending voice answer to:", fromUserId);
        socket.emit("voiceAnswer", {
          answer,
          targetUserId: fromUserId,
        });
      } catch (err) {
        console.error("Error handling offer:", err);
        setConnectedUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fromUserId);
          return newSet;
        });
      }
    };

    const handleVoiceAnswer = async ({ answer, fromUserId }: VoiceAnswer) => {
      try {
        console.log("Received voice answer");
        if (
          peerConnections.has(fromUserId) &&
          peerConnections.get(fromUserId)?.signalingState !== "stable"
        ) {
          await peerConnections
            .get(fromUserId)
            ?.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    };

    const handleVoiceCandidate = async ({
      candidate,
      fromUserId,
    }: VoiceCandidate) => {
      try {
        console.log("Received ICE candidate");
        if (
          peerConnections.has(fromUserId) &&
          peerConnections.get(fromUserId)?.remoteDescription
        ) {
          await peerConnections
            .get(fromUserId)
            ?.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Queue this candidate for later
          iceCandidatesQueue.current.push({ candidate, fromUserId });
        }
      } catch (err) {
        console.error("Error handling ICE candidate:", err);
      }
    };

    socket.on("voiceOffer", handleVoiceOffer);
    socket.on("voiceAnswer", handleVoiceAnswer);
    socket.on("voiceCandidate", handleVoiceCandidate);

    return () => {
      socket.off("voiceOffer", handleVoiceOffer);
      socket.off("voiceAnswer", handleVoiceAnswer);
      socket.off("voiceCandidate", handleVoiceCandidate);
      // Clean up all peer connections
      peerConnections.forEach((pc, userId) => {
        handleDisconnect(userId);
      });
    };
  }, [socket, peerConnections]);

  return (
    <div className="voice-chat-container relative">
      {connectedUsers.size > 0 && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap z-10">
          Connected to {connectedUsers.size} nearby user(s)
        </div>
      )}

      <button
        onClick={toggleMicrophone}
        className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 focus:outline-none
          ${
            isAudioEnabled
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          }`}
        title={isAudioEnabled ? "Disable Microphone" : "Enable Microphone"}
      >
        <span className="material-icons">
          {isAudioEnabled ? "mic" : "mic_off"}
        </span>
      </button>

      <audio ref={localAudioRef} autoPlay muted />
      {/* Create audio elements for each peer */}
      {Array.from(peerConnections.keys()).map((userId) => (
        <audio
          key={userId}
          ref={(el) => {
            if (el) remoteAudioRefs.current.set(userId, el);
          }}
          autoPlay
        />
      ))}
    </div>
  );
};

export default VoiceCall;

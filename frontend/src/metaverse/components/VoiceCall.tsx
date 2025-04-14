import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "socket";

const VoiceCall = ({ nearbyUsers, currentUserId }) => {
  const [pc, setPc] = useState<RTCPeerConnection>();
  const { socket, isConnected } = useSocket();

  let localVideoRef = useRef<HTMLVideoElement>(null);
  let remoteVideoRef = useRef<HTMLVideoElement>(null);

  const pc_config = {
    iceServers: [
      // {
      //   urls: 'stun:[STUN_IP]:[PORT]',
      //   'credentials': '[YOR CREDENTIALS]',
      //   'username': '[USERNAME]'
      // },
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  };

  useEffect(() => {
    let newPC = new RTCPeerConnection(pc_config);
    setPc(newPC);

    const setVideoTracks = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        if (!(newPC && socket)) return;
        stream.getTracks().forEach((track) => {
          if (!newPC) return;
          newPC.addTrack(track, stream);
        });
        newPC.onicecandidate = (e) => {
          if (e.candidate) {
            if (!socket) return;
            console.log("onicecandidate");
            socket.emit("candidate", e.candidate);
          }
        };
        newPC.oniceconnectionstatechange = (e) => {
          console.log(e);
        };
        newPC.ontrack = (ev) => {
          console.log("add remotetrack success");
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = ev.streams[0];
          }
        };
        socket.emit("join_room", {
          room: "1234",
        });
      } catch (e) {
        console.error(e);
      }
    };

    const createOffer = () => {
      console.log("create offer");
      newPC
        .createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then((sdp) => {
          newPC.setLocalDescription(new RTCSessionDescription(sdp));
          socket.emit("offer", sdp);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    const createAnswer = (sdp: RTCSessionDescription) => {
      newPC.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
        console.log("answer set remote description success");
        newPC
          .createAnswer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true,
          })
          .then((sdp1) => {
            console.log("create answer");
            newPC.setLocalDescription(new RTCSessionDescription(sdp1));
            socket.emit("answer", sdp1);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    };

    socket.on("all_users", (allUsers: Array<{ id: string; email: string }>) => {
      let len = allUsers.length;
      if (len > 0) {
        createOffer();
      }
    });

    socket.on("getOffer", (sdp: RTCSessionDescription) => {
      //console.log(sdp);
      console.log("get offer");
      createAnswer(sdp);
    });

    socket.on("getAnswer", (sdp: RTCSessionDescription) => {
      console.log("get answer");
      newPC.setRemoteDescription(new RTCSessionDescription(sdp));
      //console.log(sdp);
    });

    socket.on("getCandidate", (candidate: RTCIceCandidateInit) => {
      newPC.addIceCandidate(new RTCIceCandidate(candidate)).then(() => {
        console.log("candidate add success");
      });
    });

    setVideoTracks();
  }, []);

  return (
    <div>
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: "black",
        }}
        muted
        ref={localVideoRef}
        autoPlay
      ></video>
      <video
        id="remotevideo"
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: "black",
        }}
        ref={remoteVideoRef}
        autoPlay
      ></video>
    </div>
  );
};

export default VoiceCall;

// import { useEffect, useState } from "react";
// import { CustomAvatar } from "./avatars/CustomAvatar";
// import { useSelector } from "react-redux";
// import { RootState } from "store";
// import { useSocket } from "socket";
// import { useParams } from "react-router-dom";
// import { toaster } from "@components/ui/toaster";
// import * as THREE from "three";

// const CharacterController = ({
//   currentUserPosition,
// }: {
//   currentUserPosition: number[];
// }) => {
//   const [otherJamUsers, setOtherJamUsers] = useState<any[]>([]);
//   // const [userPosition, setUserPosition] = useState<number[]>([]);

//   const { socket, isConnected } = useSocket();
//   const { jamId } = useParams();

//   const { user } = useSelector((state: RootState) => state.user);

//   const setUpSocketListeners = (socket: any) => {
//     socket.on("userJoined", ({ name, jamUsers }: any) => {
//       toaster.create({
//         title: `${name} joined the metaverse`,
//         description: `Say hi to ${name}`,
//         type: "info",
//       });
//       setOtherJamUsers([...jamUsers]);
//     });

//     socket.on("currentUsers", (jamUsers: any[]) => {
//       setOtherJamUsers([...jamUsers]);
//     });

//     socket.on("userLeftJam", ({ name, jamUsers }: any) => {
//       toaster.create({
//         title: `${name} left the metaverse`,
//         // description: `Say hi to ${name}`,
//         type: "warning",
//       });

//       jamUsers.filter((user: any) => user.userId != user._id);

//       setOtherJamUsers([...jamUsers]);
//     });

//     socket.on("userMoved", (movedUser: any) => {
//       console.log("movedUser:", movedUser.position);
//       setOtherJamUsers((prevUsers) =>
//         prevUsers.map((user) =>
//           user.userId === movedUser.userId ? movedUser : user
//         )
//       );
//     });
//   };

//   useEffect(() => {
//     if (isConnected) {
//       socket.emit("joinJam", {
//         jamId,
//         userId: user._id,
//         url: user.avatar3D,
//         userName: user.username,
//         position: currentUserPosition,
//       });

//       setUpSocketListeners(socket);
//     }
//     // Return cleanup function to remove listeners
//     return () => {
//       socket.emit("leaveJam", { jamId });
//       socket.off("userJoined"); // Remove userJoined listener
//       socket.off("currentUsers"); // Remove currentUsers listener
//       socket.off("userLeftJam");
//       socket.off("userMoved");
//     };
//   }, [socket, isConnected, jamId, user]);

//   return (
//     <>
//       {/* Rendering my own user in jam metaverse */}
//       <CustomAvatar
//         position={
//           new THREE.Vector3(
//             currentUserPosition[0],
//             currentUserPosition[1],
//             currentUserPosition[2]
//           )
//         }
//         url={user?.avatar3D && user.avatar3D}
//       />

//       {/* Rendering the rest of the users in jam Metaverse for me */}
//       {otherJamUsers.length > 0 &&
//         otherJamUsers.map((user) => {
//           return (
//             <CustomAvatar
//               url={user.url}
//               position={
//                 new THREE.Vector3(
//                   user.position[0],
//                   user.position[1],
//                   user.position[2]
//                 )
//               }
//               key={user.userId}
//               otherUser={true}
//             />
//           );
//         })}
//     </>
//   );
// };

// export default CharacterController;

import { useEffect, useState } from "react";
import { CustomAvatar } from "./avatars/CustomAvatar";
import { useSelector } from "react-redux";
import { RootState } from "store";
import { useSocket } from "socket";
import { useParams } from "react-router-dom";
import { toaster } from "@components/ui/toaster";
import * as THREE from "three";

const CharacterController = ({
  currentUserPosition,
}: {
  currentUserPosition: number[];
}) => {
  const [otherJamUsers, setOtherJamUsers] = useState<any[]>([]);

  const { socket, isConnected } = useSocket();
  const { jamId } = useParams();

  const { user } = useSelector((state: RootState) => state.user);

  const setUpSocketListeners = (socket: any) => {
    socket.on("userJoined", ({ name, jamUsers }: any) => {
      toaster.create({
        title: `${name} joined the metaverse`,
        description: `Say hi to ${name}`,
        type: "info",
      });
      // Filter out our own user from the list
      const filteredUsers = jamUsers.filter(
        (jamUser: any) => jamUser.userId !== user._id
      );
      setOtherJamUsers([...filteredUsers]);
    });

    socket.on("currentUsers", (jamUsers: any[]) => {
      // Filter out our own user from the list
      const filteredUsers = jamUsers.filter(
        (jamUser: any) => jamUser.userId !== user._id
      );
      setOtherJamUsers([...filteredUsers]);
    });

    socket.on("userLeftJam", ({ name, jamUsers }: any) => {
      toaster.create({
        title: `${name} left the metaverse`,
        type: "warning",
      });

      // This was the problem - the filter wasn't being applied to the state update
      // The filter was also using incorrect logic
      const filteredUsers = jamUsers.filter(
        (jamUser: any) => jamUser.userId !== user._id
      );

      console.log("User left - remaining users:", filteredUsers);
      setOtherJamUsers([...filteredUsers]);
    });

    socket.on("userMoved", (movedUser: any) => {
      console.log("movedUser:", movedUser.position);
      // Only update other users, not ourselves
      if (movedUser.userId !== user._id) {
        setOtherJamUsers((prevUsers) =>
          prevUsers.map((prevUser) =>
            prevUser.userId === movedUser.userId ? movedUser : prevUser
          )
        );
      }
    });
  };

  useEffect(() => {
    if (isConnected) {
      socket.emit("joinJam", {
        jamId,
        userId: user._id,
        url: user.avatar3D,
        userName: user.username,
        position: currentUserPosition,
      });

      setUpSocketListeners(socket);
    }
    // Return cleanup function to remove listeners
    return () => {
      socket.emit("leaveJam", { jamId });
      socket.off("userJoined");
      socket.off("currentUsers");
      socket.off("userLeftJam");
      socket.off("userMoved");
    };
  }, [socket, isConnected, jamId, user]);

  useEffect(() => {
    // Update our position when currentUserPosition changes
    if (isConnected && socket) {
      socket.emit("move", currentUserPosition);
    }
  }, [currentUserPosition, isConnected, socket]);

  return (
    <>
      {/* Rendering my own user in jam metaverse */}
      <CustomAvatar
        position={
          new THREE.Vector3(
            currentUserPosition[0],
            currentUserPosition[1],
            currentUserPosition[2]
          )
        }
        url={user?.avatar3D && user.avatar3D}
      />

      {/* Rendering the rest of the users in jam Metaverse for me */}
      {otherJamUsers.length > 0 &&
        otherJamUsers.map((otherUser) => {
          return (
            <CustomAvatar
              url={otherUser.url}
              position={
                new THREE.Vector3(
                  otherUser.position[0],
                  otherUser.position[1],
                  otherUser.position[2]
                )
              }
              key={otherUser.userId}
              otherUser={true}
            />
          );
        })}
    </>
  );
};

export default CharacterController;

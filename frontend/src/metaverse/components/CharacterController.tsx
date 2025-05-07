import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, Euler, Group, MathUtils } from "three";
import { CustomAvatar } from "./avatars/CustomAvatar";
import { useSelector } from "react-redux";
import { RootState } from "store";
import { useSocket } from "socket";
import { useParams } from "react-router-dom";
import { toaster } from "@components/ui/toaster";
import * as THREE from "three";

const SPEED = {
  walk: 2.5,
  run: 5,
};

const CAMERA_OFFSET = new Vector3(0, 5, 4); // Camera height and distance
const CAMERA_LERP = 0.15; // Camera smoothness
const CHARACTER_LERP = 0.15; // Character rotation smoothness

const CharacterController = () => {
  const { camera, gl } = useThree();
  const [animation, setAnimation] = useState("CharacterArmature|Idle");
  const characterRef = useRef<Group>(null);

  const [otherJamUsers, setOtherJamUsers] = useState<any[]>([]);
  const [userPosition, setUserPosition] = useState<number[]>([]);

  const { socket, isConnected } = useSocket();
  const { jamId } = useParams();

  const { user } = useSelector((state: RootState) => state.user);

  // Movement state
  const velocity = useRef(new Vector3());
  const direction = useRef(new Vector3());
  const targetRotation = useRef(0); // Target rotation for character
  const currentRotation = useRef(0); // Current rotation for smooth turning

  // Camera state
  const cameraRotation = useRef(new Euler(0, 0, 0));
  const pointerLocked = useRef(false);
  const mouseSensitivity = 0.002;

  // Key states
  interface KeyState {
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
    ArrowUp: boolean;
    ArrowDown: boolean;
    ArrowLeft: boolean;
    ArrowRight: boolean;
    Shift: boolean;
  }

  const keys = useRef<KeyState>({
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Shift: false,
  });

  // Lock pointer on click
  // useEffect(() => {
  //   const onClick = () => {
  //     if (!pointerLocked.current) {
  //       gl.domElement.requestPointerLock();
  //     }
  //   };

  //   const onPointerLockChange = () => {
  //     pointerLocked.current = document.pointerLockElement === gl.domElement;
  //   };

  //   gl.domElement.addEventListener("click", onClick);
  //   document.addEventListener("pointerlockchange", onPointerLockChange);

  //   return () => {
  //     gl.domElement.removeEventListener("click", onClick);
  //     document.removeEventListener("pointerlockchange", onPointerLockChange);
  //   };
  // }, [gl.domElement]);

  // Mouse rotation - GTA style only rotates camera, not character directly
  // Mouse rotation - TPP style with 360-degree yaw orbiting around character
  // useEffect(() => {
  //   const onMouseMove = (e: MouseEvent) => {
  //     if (pointerLocked.current) {
  //       const { movementX, movementY } = e;

  //       // Sensitivity for yaw and pitch
  //       const horizontalSensitivity = 0.002;
  //       const verticalSensitivity = 0.002;

  //       // Update yaw (y-axis rotation) for unrestricted 360-degree camera orbiting
  //       cameraRotation.current.y -= movementX * horizontalSensitivity;

  //       // Update pitch (x-axis rotation) with clamping for TPP feel
  //       cameraRotation.current.x -= movementY * verticalSensitivity;
  //       cameraRotation.current.x = MathUtils.clamp(
  //         cameraRotation.current.x,
  //         -Math.PI / 4, // Limit upward tilt (45 degrees up)
  //         Math.PI / 4 // Limit downward tilt (45 degrees down)
  //       );
  //     }
  //   };

  //   window.addEventListener("mousemove", onMouseMove);
  //   return () => window.removeEventListener("mousemove", onMouseMove);
  // }, []);

  // Keyboard controls
  // useEffect(() => {
  //   const down = (e: KeyboardEvent) => {
  //     if (
  //       [
  //         "w",
  //         "a",
  //         "s",
  //         "d",
  //         "ArrowUp",
  //         "ArrowDown",
  //         "ArrowLeft",
  //         "ArrowRight",
  //         "Shift",
  //       ].includes(e.key)
  //     ) {
  //       keys.current[e.key as keyof KeyState] = true;
  //     }
  //   };

  //   const up = (e: KeyboardEvent) => {
  //     if (
  //       [
  //         "w",
  //         "a",
  //         "s",
  //         "d",
  //         "ArrowUp",
  //         "ArrowDown",
  //         "ArrowLeft",
  //         "ArrowRight",
  //         "Shift",
  //       ].includes(e.key)
  //     ) {
  //       keys.current[e.key as keyof KeyState] = false;
  //     }
  //   };

  //   window.addEventListener("keydown", down);
  //   window.addEventListener("keyup", up);

  //   return () => {
  //     window.removeEventListener("keydown", down);
  //     window.removeEventListener("keyup", up);
  //   };
  // }, []);

  const setUpSocketListeners = (socket: any) => {
    socket.on("userJoined", ({ name, jamUsers }: any) => {
      toaster.create({
        title: `${name} joined the metaverse`,
        description: `Say hi to ${name}`,
        type: "info",
      });
      setOtherJamUsers([...jamUsers]);
    });

    socket.on("currentUsers", (jamUsers: any[]) => {
      console.log("jamUsers: ", jamUsers);
      setOtherJamUsers([...jamUsers]);
    });

    socket.on("userLeftJam", ({ name, jamUsers }: any) => {
      toaster.create({
        title: `${name} left the metaverse`,
        // description: `Say hi to ${name}`,
        type: "error",
      });

      setOtherJamUsers([...jamUsers]);
    });
  };

  useEffect(() => {
    if (isConnected) {
      const range = 5;
      const randomX = Math.random() * range * 2 - range;
      const randomZ = Math.random() * range * 2 - range;
      setUserPosition([randomX, 0, randomZ]);

      socket.emit("joinJam", {
        jamId,
        userId: user._id,
        url: user.avatar3D,
        userName: user.username,
        position: [randomX, 0, randomZ],
      });

      setUpSocketListeners(socket);
    }
    // Return cleanup function to remove listeners
    return () => {
      socket.emit("leaveJam", { jamId });
      socket.off("userJoined"); // Remove userJoined listener
      socket.off("currentUsers"); // Remove currentUsers listener
      socket.off("userLeftJam");
    };
  }, [socket, isConnected, jamId, user]);

  // Frame update
  useFrame((_, delta) => {
    if (!characterRef.current) return;

    const dir = direction.current.set(0, 0, 0);
    const vel = velocity.current;
    const char = characterRef.current;

    // Handle movement input (WASD or arrow keys)
    // REVERSED controls as requested:
    // S and Down Arrow = move in camera's forward direction (+Z in camera space)
    // W and Up Arrow = move in camera's backward direction (-Z in camera space)
    const forward = keys.current.s || keys.current.ArrowDown ? 1 : 0;
    const backward = keys.current.w || keys.current.ArrowUp ? -1 : 0;
    const forwardValue = forward + backward; // Combined forward/backward value

    const right = keys.current.d || keys.current.ArrowRight ? 1 : 0;
    const left = keys.current.a || keys.current.ArrowLeft ? -1 : 0;
    const strafeValue = right + left; // Combined left/right value

    const isMoving = forwardValue !== 0 || strafeValue !== 0;
    const running = keys.current.Shift;
    const speed = running ? SPEED.run : SPEED.walk;

    // Only update animation state if needed
    const newAnimation = isMoving
      ? running
        ? "CharacterArmature|Run"
        : "CharacterArmature|Walk"
      : "CharacterArmature|Idle";

    if (newAnimation !== animation) {
      setAnimation(newAnimation);
    }

    // Calculate movement direction relative to camera orientation
    if (isMoving) {
      // Create movement vector from input
      // This is the key for GTA-style controls:
      // Movement is relative to camera direction
      dir
        .set(strafeValue, 0, forwardValue)
        .normalize()
        .applyEuler(new Euler(0, cameraRotation.current.y, 0))
        .multiplyScalar(speed * delta);

      // Calculate the target angle character should face based on movement direction
      targetRotation.current = Math.atan2(dir.x, dir.z);

      // Apply velocity to position
      vel.copy(dir);
      char.position.add(vel);

      // Smoothly rotate character to face movement direction (GTA-style)
      currentRotation.current = MathUtils.lerp(
        currentRotation.current,
        targetRotation.current,
        CHARACTER_LERP
      );

      // Apply the rotation to the character
      char.rotation.y = currentRotation.current;

      // Log position and rotation for debugging
      console.log(
        "Position:",
        char.position.x.toFixed(2),
        char.position.y.toFixed(2),
        char.position.z.toFixed(2)
      );
      console.log(
        "Character Rotation:",
        ((currentRotation.current * 180) / Math.PI).toFixed(2),
        "degrees"
      );
      console.log(
        "Camera Rotation:",
        ((cameraRotation.current.y * 180) / Math.PI).toFixed(2),
        "degrees Y",
        ((cameraRotation.current.x * 180) / Math.PI).toFixed(2),
        "degrees X"
      );
    }

    // Position camera behind character (GTA style)
    const cameraOffset = CAMERA_OFFSET.clone().applyEuler(
      new Euler(cameraRotation.current.x, cameraRotation.current.y, 0)
    );

    const targetCameraPos = char.position.clone().add(cameraOffset);
    camera.position.lerp(targetCameraPos, CAMERA_LERP);

    // Make camera look at the character (slightly above feet)
    const lookTarget = char.position.clone().add(new Vector3(0, 1, 0));
    camera.lookAt(lookTarget);
  });

  return (
    // <HoodieCharacter
    //   ref={characterRef}
    //   hairColor="blue"
    //   topColor="yellow"
    //   animation={animation}
    // />
    <>
      {/* Rendering my own user in jam metaverse */}
      <CustomAvatar
        // ref={characterRef}
        position={
          new THREE.Vector3(userPosition[0], userPosition[1], userPosition[2])
        }
        url={user?.avatar3D && user.avatar3D}
        animation={animation}
      />

      {/* Rendering the rest of the users in jam Metaverse for me */}
      {otherJamUsers.length > 0 &&
        otherJamUsers.map((user) => {
          return (
            <CustomAvatar
              url={user.url}
              position={
                new THREE.Vector3(
                  user.position[0],
                  user.position[1],
                  user.position[2]
                )
              }
              key={user.userId}
              otherUser={true}
            />
          );
        })}
    </>
  );
};

export default CharacterController;

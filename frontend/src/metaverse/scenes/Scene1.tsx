import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { useSocket } from "socket";
import nipplejs from "nipplejs";
import { Toast } from "@metaverse/components/Toast";
import logo from "@assets/hyperlocalNobg.png";

import "./Scene1.css";
import VoiceCall from "@metaverse/components/VoiceCall";

const NEARBY_DISTANCE = 5;

interface User {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  name: string;
  avatar: THREE.Object3D | null;
  lastUpdate: number;
}

interface JoystickState {
  isActive: boolean;
  startPos: { x: number; y: number };
  currentPos: { x: number; y: number };
  angle: number;
  force: number;
}

interface ChatMessage {
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: "self" | "nearby" | "system";
}

interface SystemMessage {
  type: "userJoined" | "userLeft";
  userName: string;
  timestamp: number;
}

interface Message {
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  type?: "system" | "self" | "nearby" | "global";
}

interface Toast {
  id: number;
  message: string;
  type: "join" | "leave";
}

interface UserMovement {
  userId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

const Scene1 = ({ jamId, userId, userName, avatarUrl }) => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userPosition, setUserPosition] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNearbyUsersCollapsed, setIsNearbyUsersCollapsed] = useState(false);
  const [isOnlineUsersCollapsed, setIsOnlineUsersCollapsed] = useState(false);
  const [isGlobalChat, setIsGlobalChat] = useState<boolean>(false);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<boolean>(false);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState<boolean>(false);

  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  const [joystickState] = useState<JoystickState>({
    isActive: false,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    angle: 0,
    force: 0,
  });

  const mountRef = useRef<HTMLDivElement>(null);

  // Scene refs
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const avatarRef = useRef<THREE.Object3D | null>(null);
  const thirdPersonMode = useRef<boolean>(true);
  const cameraOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 3));
  const keyStateRef = useRef<{ [key: string]: boolean | number }>({});
  const joystickRef = useRef<any>(null);
  const toastIdRef = useRef(0);

  const cameraAnglesRef = useRef({ yaw: 0, pitch: 0 });
  const cameraDistanceRef = useRef(3);
  const targetDistanceRef = useRef(3);
  const minDistance = 1.5;
  const maxDistance = 6;
  const minPitch = -Math.PI / 6;
  const maxPitch = Math.PI / 2.5;

  const lastPositionSent = useRef<THREE.Vector3>(new THREE.Vector3());
  const lastRotationSent = useRef<THREE.Euler>(new THREE.Euler());

  // Reusable vectors for camera calculations
  const targetPosition = new THREE.Vector3();
  const offset = new THREE.Vector3();
  const avatarHeadPosition = new THREE.Vector3();

  const clock = new THREE.Clock();

  const { socket, isConnected } = useSocket();

  const addToast = (message: string, type: "join" | "leave") => {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000); // Remove toast after 3 seconds
  };

  const handleMovement = (deltaTime: number) => {
    if (!avatarRef.current || !isConnected) return;

    const moveSpeed = 0.1;
    let direction = new THREE.Vector3(0, 0, 0);

    if (keyStateRef.current["ArrowUp"] || keyStateRef.current["KeyW"])
      direction.z -= 1;
    if (keyStateRef.current["ArrowDown"] || keyStateRef.current["KeyS"])
      direction.z += 1;
    if (keyStateRef.current["ArrowLeft"] || keyStateRef.current["KeyA"])
      direction.x -= 1;
    if (keyStateRef.current["ArrowRight"] || keyStateRef.current["KeyD"])
      direction.x += 1;

    if (keyStateRef.current["joystickActive"]) {
      direction = new THREE.Vector3();
      direction.x = keyStateRef.current["joystickX"] as number;
      direction.z = -(keyStateRef.current["joystickY"] as number);
      // const force = Math.min(Math.max(keyStateRef.current["joystickForce"] || 0, 0), 1);
      const force = keyStateRef.current["joystickForce"] as number;
      direction.multiplyScalar(force);
    }

    if (direction.length() > 0) {
      direction.normalize();
      const moveVector = new THREE.Vector3(
        direction.x * moveSpeed,
        0,
        direction.z * moveSpeed
      );

      // Align movement with camera's yaw (like GTA)
      const cameraYaw = cameraAnglesRef.current.yaw;
      moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);

      const newPosition = new THREE.Vector3()
        .copy(avatarRef.current.position)
        .add(moveVector);
      const floorSize = 50;

      if (
        newPosition.x >= -floorSize &&
        newPosition.x <= floorSize &&
        newPosition.z >= -floorSize &&
        newPosition.z <= floorSize
      ) {
        avatarRef.current.position.copy(newPosition);

        // Rotate avatar to face movement direction (smoothly)
        if (direction.length() > 0) {
          const targetRotation = Math.atan2(moveVector.x, moveVector.z);
          avatarRef.current.rotation.y = THREE.MathUtils.lerp(
            avatarRef.current.rotation.y,
            targetRotation,
            1 - Math.pow(0.02, deltaTime)
          );
        }

        // Send movement update
        const posChanged = !newPosition.equals(lastPositionSent.current);
        const rotChanged = !avatarRef.current.rotation.equals(
          lastRotationSent.current
        );
        if (posChanged || rotChanged) {
          const position = {
            x: newPosition.x,
            y: newPosition.y,
            z: newPosition.z,
          };
          const rotation = {
            x: avatarRef.current.rotation.x,
            y: avatarRef.current.rotation.y,
            z: avatarRef.current.rotation.z,
          };
          setUserPosition(position);
          socket.emit("updateMovement", { userId, position, rotation });
          lastPositionSent.current.copy(newPosition);
          lastRotationSent.current.copy(avatarRef.current.rotation);
        }
      }
    }
  };

  const updateCameraPosition = (deltaTime: number) => {
    if (!avatarRef.current || !cameraRef.current) return;

    if (thirdPersonMode.current) {
      const { yaw, pitch } = cameraAnglesRef.current;
      const currentDistance = cameraDistanceRef.current;

      const sinPitch = Math.sin(pitch);
      const cosPitch = Math.cos(pitch);
      const sinYaw = Math.sin(yaw);
      const cosYaw = Math.cos(yaw);

      offset.set(
        currentDistance * cosPitch * sinYaw,
        currentDistance * sinPitch,
        currentDistance * cosPitch * cosYaw
      );

      targetPosition.copy(avatarRef.current.position).add(offset);

      const lerpFactor = 1 - Math.pow(0.02, deltaTime);
      cameraRef.current.position.lerp(targetPosition, lerpFactor);

      avatarHeadPosition.copy(avatarRef.current.position);
      avatarHeadPosition.y += 1;
      cameraRef.current.lookAt(avatarHeadPosition);

      cameraDistanceRef.current = THREE.MathUtils.lerp(
        cameraDistanceRef.current,
        targetDistanceRef.current,
        lerpFactor
      );
    }
  };

  const setupKeyboardControls = () => {
    const onKeyDown = (event: KeyboardEvent) => {
      keyStateRef.current[event.code] = true;
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keyStateRef.current[event.code] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  };

  const setupMouseLookControls = () => {
    let isPointerLocked = false;

    const onPointerLockChange = () => {
      isPointerLocked = document.pointerLockElement === mountRef.current;
    };

    document.addEventListener("pointerlockchange", onPointerLockChange);

    mountRef.current?.addEventListener("click", () => {
      if (!isPointerLocked && !isChatOpen) {
        mountRef.current?.requestPointerLock();
      }
    });

    const onMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked || !avatarRef.current || !cameraRef.current) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      cameraAnglesRef.current.yaw -= movementX * 0.002;
      cameraAnglesRef.current.pitch -= movementY * 0.002;

      cameraAnglesRef.current.pitch = THREE.MathUtils.clamp(
        cameraAnglesRef.current.pitch,
        minPitch,
        maxPitch
      );
      cameraAnglesRef.current.yaw = cameraAnglesRef.current.yaw % (2 * Math.PI);
    };

    document.addEventListener("mousemove", onMouseMove);

    const onMouseWheel = (event: WheelEvent) => {
      if (!avatarRef.current || !cameraRef.current) return;

      targetDistanceRef.current += event.deltaY * 0.002;
      targetDistanceRef.current = THREE.MathUtils.clamp(
        targetDistanceRef.current,
        minDistance,
        maxDistance
      );
    };

    mountRef.current?.addEventListener("wheel", onMouseWheel);

    return () => {
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("mousemove", onMouseMove);
      mountRef.current?.removeEventListener("wheel", onMouseWheel);
    };
  };

  const setupMobileControls = () => {
    const joystickContainer = document.createElement("div");
    joystickContainer.style.position = "absolute";
    joystickContainer.style.left = "30px";
    joystickContainer.style.bottom = "30px";
    joystickContainer.style.width = "120px";
    joystickContainer.style.height = "120px";
    joystickContainer.style.zIndex = "1000";
    mountRef.current?.appendChild(joystickContainer);

    const options = {
      zone: joystickContainer,
      color: "white",
      size: 120,
      multitouch: true,
      maxNumberOfNipples: 1,
      mode: "static" as const,
      position: { left: "60px", bottom: "60px" },
    };

    const manager = nipplejs.create(options);
    joystickRef.current = manager;

    manager.on("move", (_event: any, data: any) => {
      const forceX = data.vector.x;
      const forceY = data.vector.y;
      const force = Math.min(data.force / 2, 1);

      keyStateRef.current["joystickActive"] = true;
      keyStateRef.current["joystickX"] = forceX;
      keyStateRef.current["joystickY"] = forceY;
      keyStateRef.current["joystickForce"] = force;
    });

    manager.on("end", () => {
      keyStateRef.current["joystickActive"] = false;
      keyStateRef.current["joystickX"] = 0;
      keyStateRef.current["joystickY"] = 0;
      keyStateRef.current["joystickForce"] = 0;
    });

    const cleanupTouch = setupTouchRotation();

    return () => {
      manager.destroy();
      joystickContainer.remove();
      cleanupTouch();
    };
  };

  const setupTouchRotation = () => {
    let isRotating = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let initialPinchDistance = 0;
    let isPinching = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }

      const screenWidth = window.innerWidth;
      const touch = e.touches[0];

      if (e.touches.length === 1 && touch.clientX > screenWidth / 2) {
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isRotating = true;
      }

      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialPinchDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        isPinching = true;
        isRotating = false;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!avatarRef.current || !cameraRef.current) return;

      if (e.touches.length > 1) {
        e.preventDefault();
      }

      const screenWidth = window.innerWidth;

      if (
        isRotating &&
        e.touches.length === 1 &&
        e.touches[0].clientX > screenWidth / 2
      ) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        cameraAnglesRef.current.yaw -= deltaX * 0.005;
        cameraAnglesRef.current.pitch -= deltaY * 0.005;

        cameraAnglesRef.current.pitch = THREE.MathUtils.clamp(
          cameraAnglesRef.current.pitch,
          minPitch,
          maxPitch
        );
        cameraAnglesRef.current.yaw =
          cameraAnglesRef.current.yaw % (2 * Math.PI);

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }

      if (isPinching && e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentPinchDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );

        const pinchDelta = (currentPinchDistance - initialPinchDistance) * 0.01;
        targetDistanceRef.current -= pinchDelta;
        targetDistanceRef.current = THREE.MathUtils.clamp(
          targetDistanceRef.current,
          minDistance,
          maxDistance
        );

        initialPinchDistance = currentPinchDistance;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        isPinching = false;
      }
      if (e.touches.length === 0) {
        isRotating = false;
      }
    };

    mountRef.current?.addEventListener("touchstart", onTouchStart, {
      passive: false,
    });
    mountRef.current?.addEventListener("touchmove", onTouchMove, {
      passive: false,
    });
    mountRef.current?.addEventListener("touchend", onTouchEnd, {
      passive: true,
    });

    return () => {
      mountRef.current?.removeEventListener("touchstart", onTouchStart);
      mountRef.current?.removeEventListener("touchmove", onTouchMove);
      mountRef.current?.removeEventListener("touchend", onTouchEnd);
    };
  };

  const loadAvatar = (url: string) => {
    if (!url) {
      console.error("No avatar URL provided");
      return;
    }

    try {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      const absoluteUrl = url.startsWith("http")
        ? url
        : `${window.location.origin}${url}`;

      loader.load(
        absoluteUrl,
        (gltf) => {
          const avatar = gltf.scene;
          avatar.scale.set(1, 1, 1);
          const range = 5;
          const randomX = Math.random() * range * 2 - range;
          const randomZ = Math.random() * range * 2 - range;
          avatar.position.set(randomX, 0, randomZ);

          socket.emit("joinJam", {
            jamId,
            userId,
            userName,
            position: avatar.position,
            rotation: { x: 0, y: 0, z: 0 },
            avatarUrl,
          });

          setUserPosition(avatar.position);

          avatar.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          avatarRef.current = avatar;
          sceneRef.current.add(avatar);
          addNameTag(avatar, userName || "Anonymous");

          // Add initial user
          setUsers((prev) => {
            const newUsers = new Map(prev);
            newUsers.set(userId || "anonymous", {
              id: userId || "anonymous",
              position: avatar.position,
              rotation: new THREE.Euler(0, 0, 0),
              name: userName || "Anonymous",
              avatar: avatar,
              lastUpdate: Date.now(),
            });
            return newUsers;
          });

          setIsLoading(false);

          const box = new THREE.Box3().setFromObject(avatar);
          console.log("Avatar bounding box:", {
            min: box.min.toArray(),
            max: box.max.toArray(),
          });
        },
        undefined,
        (error) => {
          console.error("Error loading avatar:", error);
        }
      );
    } catch (error) {
      console.error("Error in loadAvatar:", error);
      setIsLoading(false);
    }
  };

  const addNameTag = (avatar: THREE.Object3D, name: string) => {
    const box = new THREE.Box3().setFromObject(avatar);
    const height = box.max.y - box.min.y;

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const context = canvas.getContext("2d");

    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#ffffff";
      context.font = "24px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(name, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.y = height + 0.1;
      sprite.scale.set(1, 0.25, 1);
      sprite.userData = { isNameTag: true };
      avatar.add(sprite);
    }
  };

  const animate = () => {
    animationFrameId.current = requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    handleMovement(deltaTime);
    updateCameraPosition(deltaTime);
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const setupSocketListeners = () => {
    socket.on("userJoined", (userData: any) => {
      addUserToScene(userData);
    });
    socket.on("currentUsers", (jamUsers: any[]) => {
      jamUsers.forEach((userData) => addUserToScene(userData));
    });

    socket.on(
      "userMoved",
      ({ userId: movedUserId, position, rotation }: UserMovement) => {
        setUsers((prev) => {
          const newUsers = new Map(prev);
          const user = newUsers.get(movedUserId);
          if (user && user.avatar) {
            user.position.set(position.x, position.y, position.z);
            user.rotation.set(rotation.x, rotation.y, rotation.z);
            user.avatar.position.lerp(
              new THREE.Vector3(position.x, position.y, position.z),
              0.1
            );
            user.avatar.rotation.set(rotation.x, rotation.y, rotation.z);
            user.lastUpdate = Date.now();
          }
          return newUsers;
        });
      }
    );

    socket.on(
      "systemMessage",
      ({ type, userName, timestamp }: SystemMessage) => {
        let messageText = "";
        if (type === "userJoined") {
          messageText = `${userName} joined the metaverse`;
          addToast(messageText, "join");
        } else if (type === "userLeft") {
          messageText = `${userName} left the metaverse`;
          addToast(messageText, "leave");
        }

        const newMessage: Message = {
          userId: "system",
          userName: "System",
          text: messageText,
          timestamp,
          type: "system",
        };

        setMessages((prev) => [...prev, newMessage]);
      }
    );
  };

  const addUserToScene = (userData: any) => {
    const { userId: id, position, rotation, name, avatarUrl } = userData;
    if (id === userId) return; // Skip self

    // Use the same avatar loading logic as the main user
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // Ensure URL is absolute
    const absoluteUrl = avatarUrl.startsWith("http")
      ? avatarUrl
      : `${window.location.origin}${avatarUrl}`;

    loader.load(
      absoluteUrl,
      (gltf) => {
        const avatar = gltf.scene;
        avatar.scale.set(1, 1, 1);
        avatar.position.set(position.x, position.y, position.z);
        // avatar.rotation.set(rotation.x, rotation.y, rotation.z);

        avatar.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        addNameTag(avatar, name || "Anonymous");
        sceneRef.current.add(avatar);

        setUsers((prev) => {
          const newUsers = new Map(prev);
          newUsers.set(id, {
            id,
            position: new THREE.Vector3(position.x, position.y, position.z),
            rotation: new THREE.Euler(rotation.x, rotation.y, rotation.z),
            name,
            avatar: avatar,
            lastUpdate: Date.now(),
          });
          return newUsers;
        });
      },
      (progress) => {
        // console.log(
        //   `Loading avatar for ${name}:`,
        //   (progress.loaded / progress.total) * 100
        // );
      },
      (error) => {
        console.error(`Error loading avatar for ${name}:`, error);
        // Create a simple capsule character as fallback
        const group = new THREE.Group();

        // Body
        const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x0088ff });
        const body = new THREE.Mesh(geometry, material);
        body.position.y = 1;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
          color: 0xffdbac,
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2;
        head.castShadow = true;
        head.receiveShadow = true;
        group.add(head);

        group.position.set(position.x, position.y, position.z);
        group.rotation.set(rotation.x, rotation.y, rotation.z);

        addNameTag(group, name || "Anonymous");
        sceneRef.current.add(group);

        setUsers((prev) => {
          const newUsers = new Map(prev);
          newUsers.set(id, {
            id,
            position: new THREE.Vector3(position.x, position.y, position.z),
            rotation: new THREE.Euler(rotation.x, rotation.y, rotation.z),
            name,
            avatar: group,
            lastUpdate: Date.now(),
          });
          return newUsers;
        });
      }
    );
  };

  const findNearbyUsers = () => {
    const nearbyUsers = Array.from(users.values()).filter((user) => {
      const distance = user.position.distanceTo(userPosition);
      return distance <= NEARBY_DISTANCE && user.id !== userId;
    });
    setNearbyUsers(nearbyUsers);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket) return;

    const timestamp = Date.now(); // Use numeric timestamp instead of ISO string
    const messageData = {
      jamId,
      userId,
      userName,
      message: messageInput.trim(),
      timestamp,
      nearbyUsers: nearbyUsers.map((user) => ({
        id: user.id,
        name: user.name,
      })), // Only send necessary data
      isGlobal: isGlobalChat,
    };

    socket.emit("chatMessage", messageData);

    // Add message to local state immediately for better UX
    // setMessages((prev) => [
    //   ...prev,
    //   {
    //     userId,
    //     userName,
    //     text: messageInput.trim(),
    //     timestamp,
    //     type: "self",
    //   },
    // ]);

    setMessageInput("");
  };

  const toggleVoiceChat = () => {
    setIsVoiceChatActive(true);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    keyStateRef.current[event.code] = false;
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    // Toggle camera mode with C key
    if (event.key.toLowerCase() === "c") {
      thirdPersonMode.current = !thirdPersonMode.current;
    }

    // Toggle chat with T key
    if (event.key.toLowerCase() === "t" && !isChatOpen) {
      setIsChatOpen(true);
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    }
  };
  const handleResize = () => {
    if (cameraRef.current && rendererRef.current) {
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = sceneRef.current;
    scene.background = new THREE.Color(0x87ceeb);

    const floorSize = 10;
    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize, 1, 1);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a7c59,
      roughness: 0.8,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    scene.add(floor);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    const cleanupKeyboardControls = setupKeyboardControls();
    const cleanupMouseControls = setupMouseLookControls();
    let cleanupMobileControls: (() => void) | undefined;

    if (window.innerWidth <= 768) {
      cleanupMobileControls = setupMobileControls();
    }

    if (isConnected) {
      loadAvatar(avatarUrl);
      setupSocketListeners();
    }

    animate();

    window.addEventListener("resize", handleResize);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
      cleanupKeyboardControls();
      cleanupMouseControls();
      cleanupMobileControls?.();
      sceneRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
      sceneRef.current.clear();
    };
  }, [avatarUrl, userId, userName, isConnected, socket]);

  useEffect(() => {
    findNearbyUsers();
  }, [userPosition, users]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (messageData: ChatMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          userId: messageData.userId,
          userName: messageData.userName,
          text: messageData.message,
          timestamp: Date.now(),
          type: messageData.type,
        },
      ]);
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [socket]);

  return (
    <div
      className="scene-container"
      style={{ width: "100vw", height: "100vh" }}
    >
      <div ref={mountRef} className="w-full h-full" />

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="spinner" />
            <p className="text-xl text-white">Loading Metaverse...</p>
          </div>
        </div>
      )}

      <div className={`controls-help ${isHelpOpen ? "active" : ""}`}>
        <div>WASD / Arrow Keys: Move</div>
        <div>Mouse: Look around</div>
        <div>C: Toggle camera mode</div>
        <div>T: Open chat</div>
        <div>V: Voice chat</div>
      </div>

      {/* Online Users */}
      <div
        className={`user-box online-users ${
          isOnlineUsersCollapsed ? "collapsed" : ""
        }`}
      >
        <div
          className={`user-box-header ${
            isOnlineUsersCollapsed ? "collapsed" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setIsOnlineUsersCollapsed(!isOnlineUsersCollapsed);
          }}
        >
          <div className="font-bold">Online Users ({users.size})</div>
          <span className="material-icons">
            {isOnlineUsersCollapsed ? "expand_more" : "expand_less"}
          </span>
        </div>
        <div className="user-box-content">
          {Array.from(users.values()).map((user) => (
            <div key={user.id} className="flex items-center mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <a
                href={`/user/${user.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {user.name}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Users */}
      <div
        className={`user-box nearby-users ${
          isNearbyUsersCollapsed ? "collapsed" : ""
        }`}
      >
        <div
          className={`user-box-header ${
            isNearbyUsersCollapsed ? "collapsed" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setIsNearbyUsersCollapsed(!isNearbyUsersCollapsed);
          }}
        >
          <div className="font-bold">Nearby Users ({nearbyUsers.length})</div>
          <span className="material-icons">
            {isNearbyUsersCollapsed ? "expand_more" : "expand_less"}
          </span>
        </div>
        <div className="user-box-content">
          {nearbyUsers.map((user) => (
            <div key={user.id} className="flex items-center mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <a
                href={`/user/${user.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {user.name}
              </a>
            </div>
          ))}
        </div>
      </div>

      {isChatOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3
              className={`text-xl font-bold ${
                isGlobalChat ? "global-active" : ""
              }`}
            >
              Chat
            </h3>
            <button className="icon-btn" onClick={() => setIsChatOpen(false)}>
              <span className="material-icons">close</span>
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={`${msg.timestamp}-${index}`}
                className={`chat-message ${
                  msg.type === "system" ? "system-message" : msg.type
                }`}
              >
                {msg.type === "system" ? (
                  <span>
                    <span className="font-bold">{msg.userName}:</span>{" "}
                    {msg.text}
                  </span>
                ) : (
                  <>
                    <span className="font-bold">{msg.userName}:</span>{" "}
                    {msg.text}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="chat-input-container">
            <div className="chat-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={isGlobalChat}
                  onChange={(e) => setIsGlobalChat(e.target.checked)}
                />
                <span className="toggle-text">Global Chat</span>
              </label>
            </div>
            <form className="chat-input" onSubmit={handleSendMessage}>
              <input
                ref={messageInputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsChatOpen(false);
                }}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}

      <div className="action-buttons-container m-2">
        <a
          href="/"
          className="logo-link block cursor-pointer py-1.5 text-base text-slate-800 font-semibold"
        >
          <img src={logo} alt="hyperlocal" className="max-w-14" />
        </a>

        {/* Collapsible menu (appears above) */}
        {isActionMenuOpen && (
          <div className="collapsible-menu">
            <button
              className="action-btn"
              onClick={() => {
                if (socket) {
                  socket.emit("leaveJam", { jamId });
                  window.location.href = "/";
                }
              }}
            >
              <span className="material-icons">exit_to_app</span>
            </button>

            <button
              className="action-btn"
              onClick={() => {
                /* Invite friends logic */
              }}
            >
              <span className="material-icons">person_add</span>
            </button>

            <button
              className="action-btn"
              onClick={() =>
                (thirdPersonMode.current = !thirdPersonMode.current)
              }
            >
              <span className="material-icons">videogame_asset</span>
            </button>

            <button className="action-btn" onClick={() => setIsChatOpen(true)}>
              <span className="material-icons">chat</span>
            </button>

            <button
              className={`action-btn ${isVoiceChatActive ? "active" : ""}`}
              onClick={toggleVoiceChat}
              aria-label="Toggle voice chat"
            >
              {isVoiceChatActive ? (
                <VoiceCall nearbyUsers={nearbyUsers} currentUserId={userId} />
              ) : (
                <span className="material-icons">mic_off</span>
              )}
            </button>

            {/* Help Button (Mobile Only) */}
            {/* {window.innerWidth <= 768 && (
              <button
                className="action-btn"
                onClick={() => setIsHelpOpen(!isHelpOpen)}
              >
                <span className="material-icons">help_outline</span>
              </button>
            )} */}
          </div>
        )}

        {/* Main collapsible button */}
        <button
          className="action-btn main-action-btn"
          onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
        >
          <span className="material-icons">
            {isActionMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </div>
  );
};

export default Scene1;

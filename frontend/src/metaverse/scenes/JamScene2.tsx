import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import nipplejs from "nipplejs";
import "../MetaverseStyles.css";
import logo from "@assets/hyperlocalNobg.png";
import { useSocket } from "socket";

interface User {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  name: string;
  avatar: THREE.Object3D | null;
  lastUpdate: number;
}

interface Message {
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  type?: "system" | "user";
}

interface JamSceneProps {
  jamId: string;
  userId?: string;
  userName?: string;
  avatarUrl?: string;
  onUserInteraction?: (targetUserId: string) => void;
}

interface JoystickState {
  isActive: boolean;
  startPos: { x: number; y: number };
  currentPos: { x: number; y: number };
  angle: number;
  force: number;
}

interface Toast {
  id: number;
  message: string;
  type: "join" | "leave";
}

interface ChatMessage {
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: "self" | "nearby" | "system";
}

const Toast: React.FC<{ message: string; type: "join" | "leave" }> = ({
  message,
  type,
}) => {
  return (
    <div className={`toast ${type}`}>
      <span className="material-icons">
        {type === "join" ? "person_add" : "person_remove"}
      </span>
      {message}
    </div>
  );
};

const JamScene: React.FC<JamSceneProps> = ({
  jamId,
  userId,
  userName,
  avatarUrl = "/avatars/mech_drone.glb",
  onUserInteraction,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  // const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [joystickState, setJoystickState] = useState<JoystickState>({
    isActive: false,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    angle: 0,
    force: 0,
  });
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [isVoiceChatActive, setIsVoiceChatActive] = useState<boolean>(false);
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const [isNearbyUsersCollapsed, setIsNearbyUsersCollapsed] = useState(false);
  const [isOnlineUsersCollapsed, setIsOnlineUsersCollapsed] = useState(false);
  const [isGlobalChat, setIsGlobalChat] = useState<boolean>(false);

  // Scene refs
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const avatarRef = useRef<THREE.Object3D | null>(null);
  const keyStateRef = useRef<{ [key: string]: boolean | number }>({});
  const animationFrameId = useRef<number | null>(null);
  const joystickRef = useRef<any>(null);
  const cameraOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2, 5));
  const thirdPersonMode = useRef<boolean>(true);
  const chatRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const lastPositionSent = useRef<THREE.Vector3>(new THREE.Vector3());
  const lastRotationSent = useRef<THREE.Euler>(new THREE.Euler());

  const { socket, isConnected } = useSocket();

  const addToast = (message: string, type: "join" | "leave") => {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000); // Remove toast after 3 seconds
  };

  // Update setupMouseLookControls to handle rotation separately from movement
  const setupMouseLookControls = () => {
    let isPointerLocked = false;

    const onPointerLockChange = () => {
      isPointerLocked = document.pointerLockElement === mountRef.current;
    };

    document.addEventListener("pointerlockchange", onPointerLockChange);

    // Request pointer lock on click
    mountRef.current?.addEventListener("click", () => {
      if (!isPointerLocked && !isChatOpen) {
        mountRef.current?.requestPointerLock();
      }
    });

    // Handle mouse movement - only rotates the avatar, not the camera directly
    const onMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked || !avatarRef.current || !cameraRef.current) return;

      const movementX = event.movementX || 0;

      // Rotate avatar horizontally
      avatarRef.current.rotation.y -= movementX * 0.002;

      // The camera will follow this rotation in updateCameraPosition()
      // This separation ensures camera doesn't move during WASD movement
    };

    document.addEventListener("mousemove", onMouseMove);
  };

  // Initialize scene
  useEffect(() => {
    console.log("socket: ", socket, isConnected);
    if (!mountRef.current || !socket) return;

    // Initialize scene
    const scene = sceneRef.current;
    scene.background = new THREE.Color(0x87ceeb); // Sky blue background
    scene.fog = new THREE.Fog(0x87ceeb, 100, 1000); // Add fog for depth

    // Create floor with texture
    const floorSize = 100;
    const floorGeometry = new THREE.PlaneGeometry(
      floorSize,
      floorSize,
      100,
      100
    );
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a7c59, // Rich green color
      roughness: 0.8,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Add subtle grid to floor
    const gridHelper = new THREE.GridHelper(floorSize, 100, 0x000000, 0x000000);
    gridHelper.position.y = 0.01; // Slightly above floor
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 3); // Start behind avatar (TPP mode)
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light with better shadow quality
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    // Mobile controls setup
    if (window.innerWidth <= 768) {
      setupMobileControls();
    }

    // Socket listeners
    const setupSocketListeners = () => {
      socket.emit("joinJam", {
        jamId,
        userId,
        userName,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        avatarUrl,
      });

      socket.on("currentUsers", (jamUsers: any[]) => {
        jamUsers.forEach((userData) => addUserToScene(userData));
      });

      socket.on("userJoined", (userData: any) => {
        addUserToScene(userData);
      });

      socket.on("systemMessage", ({ type, userName, timestamp }) => {
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
      });

      socket.on("userMoved", ({ userId: movedUserId, position, rotation }) => {
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
      });

      socket.on("userLeft", ({ userId: leftUserId }) => {
        setUsers((prev) => {
          const newUsers = new Map(prev);
          const user = newUsers.get(leftUserId);
          if (user && user.avatar) {
            sceneRef.current.remove(user.avatar);
          }
          newUsers.delete(leftUserId);
          return newUsers;
        });
      });

      // Add handler for leaveJam event
      socket.on("userLeftJam", ({ userId: leftUserId }) => {
        setUsers((prev) => {
          const newUsers = new Map(prev);
          const user = newUsers.get(leftUserId);
          if (user && user.avatar) {
            sceneRef.current.remove(user.avatar);
          }
          newUsers.delete(leftUserId);
          return newUsers;
        });
      });
    };

    // Load avatar

    // Add event listeners
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keypress", handleKeyPress);

    // Mouse look controls
    setupMouseLookControls();

    // Setup simulated users (for testing)
    // setupSimulatedUsers();

    // Start animation loop
    animate();

    if (isConnected) {
      loadAvatar(avatarUrl);
      setupSocketListeners();
    }

    return () => {
      socket.off("currentUsers");
      socket.off("userJoined");
      socket.off("userMoved");
      socket.off("userLeft");
      socket.off("userLeftJam");
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keypress", handleKeyPress);
      if (joystickRef.current) {
        joystickRef.current.destroy();
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      // document.removeEventListener("pointerlockchange", onPointerLockChange);
      // document.removeEventListener("mousemove", onMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [jamId, userId, userName, avatarUrl, socket, isConnected]);

  const addUserToScene = (userData: any) => {
    console.log("userData: ", userData);

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
        avatar.rotation.set(rotation.x, rotation.y, rotation.z);

        avatar.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        addNameTag(avatar, name);
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

        addNameTag(group, name);
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

  const setupMobileControls = () => {
    // Create movement joystick container (left side)
    const joystickContainer = document.createElement("div");
    joystickContainer.style.position = "absolute";
    joystickContainer.style.left = "30px";
    joystickContainer.style.bottom = "30px";
    joystickContainer.style.width = "120px";
    joystickContainer.style.height = "120px";
    joystickContainer.style.zIndex = "1000"; // Ensure joystick is above canvas
    mountRef.current?.appendChild(joystickContainer);

    // Create movement joystick
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

    // Add movement joystick event listeners with fixed direction mapping
    manager.on("move", (_event: any, data: any) => {
      // Store the raw x and y vectors from the joystick
      // These correctly represent the direction in screen space
      const forceX = data.vector.x;
      const forceY = data.vector.y;
      const force = Math.min(data.force / 50, 1); // Normalize force

      // Store vectors directly instead of angles for more reliable direction control
      keyStateRef.current["joystickActive"] = true;
      keyStateRef.current["joystickX"] = forceX;
      keyStateRef.current["joystickY"] = forceY;
      keyStateRef.current["joystickForce"] = force;
    });

    manager.on("end", () => {
      // Clear joystick state in keyStateRef
      keyStateRef.current["joystickActive"] = false;
      keyStateRef.current["joystickX"] = 0;
      keyStateRef.current["joystickY"] = 0;
      keyStateRef.current["joystickForce"] = 0;
    });

    // Remove the right joystick and replace with screen touch rotation
    setupTouchRotation();
  };

  const setupTouchRotation = () => {
    // Add touch handler for rotation on right side of screen
    const touchStartX = { current: 0 };
    let isRotating = false;

    // Add event listeners for touch rotation
    mountRef.current?.addEventListener(
      "touchstart",
      (e) => {
        const touch = e.touches[0];
        const screenWidth = window.innerWidth;

        // Only handle touches on the right half of the screen
        if (touch.clientX > screenWidth / 2) {
          touchStartX.current = touch.clientX;
          isRotating = true;
        }
      },
      { passive: true }
    );

    mountRef.current?.addEventListener(
      "touchmove",
      (e) => {
        if (!avatarRef.current || !isRotating) return;

        const touch = e.touches[0];
        const screenWidth = window.innerWidth;

        // Only handle touches on the right half of the screen
        if (touch.clientX > screenWidth / 2) {
          const deltaX = touch.clientX - touchStartX.current;

          // Rotate avatar based on swipe
          avatarRef.current.rotation.y -= deltaX * 0.01;

          // Update starting point for next move
          touchStartX.current = touch.clientX;
        }
      },
      { passive: true }
    );

    mountRef.current?.addEventListener(
      "touchend",
      () => {
        isRotating = false;
      },
      { passive: true }
    );
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

      // Ensure URL is absolute
      const absoluteUrl = url.startsWith("http")
        ? url
        : `${window.location.origin}${url}`;

      loader.load(
        absoluteUrl,
        (gltf) => {
          const avatar = gltf.scene;
          avatar.scale.set(1, 1, 1);
          avatar.position.set(0, 0, 0);
          avatar.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          avatarRef.current = avatar;
          sceneRef.current.add(avatar);

          // Add nametag to avatar
          addNameTag(avatar, userName);

          // Add initial user
          setUsers((prev) => {
            const newUsers = new Map(prev);
            newUsers.set(userId, {
              id: userId,
              position: new THREE.Vector3(0, 0, 0),
              rotation: new THREE.Euler(0, 0, 0),
              name: userName,
              avatar: avatar,
              lastUpdate: Date.now(),
            });
            return newUsers;
          });

          setIsLoading(false);
        },
        (progress) => {
          // Progress callback
          // console.log(
          //   "Loading progress:",
          //   (progress.loaded / progress.total) * 100
          // );
        },
        (error) => {
          console.error("Error loading avatar:", error);
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

          avatarRef.current = group;
          sceneRef.current.add(group);

          // Add nametag
          addNameTag(group, userName);

          // Add user with fallback avatar
          setUsers((prev) => {
            const newUsers = new Map(prev);
            newUsers.set(userId, {
              id: userId,
              position: new THREE.Vector3(0, 0, 0),
              rotation: new THREE.Euler(0, 0, 0),
              name: userName,
              avatar: group,
              lastUpdate: Date.now(),
            });
            return newUsers;
          });

          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Error in loadAvatar:", error);
      setIsLoading(false);
    }
  };

  const addNameTag = (avatar: THREE.Object3D, name: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256; // Width of the canvas
    canvas.height = 64; // Height of the canvas
    const context = canvas.getContext("2d");
    if (context) {
      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Set text properties
      context.fillStyle = "#ffffff"; // White text
      context.font = "Bold 24px Arial";
      context.textAlign = "center"; // Center the text horizontally
      context.textBaseline = "middle"; // Center the text vertically

      // Draw the text in the center of the canvas
      context.fillText(name, canvas.width / 2, canvas.height / 2);

      // Create texture and sprite
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.y = 2.0; // Adjust this value to position just above the avatar's head
      sprite.scale.set(1.2, 0.3, 1); // Slightly smaller scale for better fit
      avatar.add(sprite);
    }
  };

  const handleResize = () => {
    if (cameraRef.current && rendererRef.current) {
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    keyStateRef.current[event.code] = true;

    // Toggle chat with Enter key
    if (event.code === "Enter" && !event.repeat) {
      if (!isChatOpen) {
        setIsChatOpen(true);
        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 100);
      } else if (messageInput.trim()) {
        sendMessage();
      }
    }

    // Toggle voice chat with V key
    if (event.code === "KeyV" && !event.repeat) {
      toggleVoiceChat();
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    keyStateRef.current[event.code] = false;
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    // Interact with nearby users with F key
    if (event.key.toLowerCase() === "f") {
      const nearestUser = findNearestUser();
      if (nearestUser && onUserInteraction) {
        onUserInteraction(nearestUser.id);
      }
    }

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

  const findNearestUser = (): User | null => {
    if (!avatarRef.current) return null;

    let nearestUser = null;
    let minDistance = Infinity;

    users.forEach((user) => {
      if (user.id !== userId && user.avatar) {
        const distance = user.avatar.position.distanceTo(
          avatarRef.current!.position
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestUser = user;
        }
      }
    });

    return minDistance < 5 ? nearestUser : null; // Only return if within 5 units
  };

  const animate = () => {
    animationFrameId.current = requestAnimationFrame(animate);

    // Handle movement
    handleMovement();

    // Update camera position in TPP mode
    updateCameraPosition();

    // Render scene
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const handleMovement = () => {
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
      moveVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        avatarRef.current.rotation.y
      );

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

        // Send movement update if changed
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
          socket.emit("updateMovement", { userId, position, rotation });
          lastPositionSent.current.copy(newPosition);
          lastRotationSent.current.copy(avatarRef.current.rotation);
        }
      }
    }
  };

  // Modify the updateCameraPosition function to prevent sudden camera changes
  const updateCameraPosition = () => {
    if (!avatarRef.current || !cameraRef.current) return;

    if (thirdPersonMode.current) {
      // Calculate camera position behind avatar
      const targetPosition = new THREE.Vector3();
      const offset = new THREE.Vector3();

      // Get position behind avatar
      offset.copy(cameraOffsetRef.current);
      offset.applyQuaternion(avatarRef.current.quaternion);

      // Set camera position and look at avatar
      targetPosition.copy(avatarRef.current.position).add(offset);

      // Smooth camera movement with lerp (linear interpolation)
      // Using a smaller value (0.05) for smoother transitions
      cameraRef.current.position.lerp(targetPosition, 0.05);

      // Point camera at avatar (slightly above)
      const avatarHeadPosition = new THREE.Vector3().copy(
        avatarRef.current.position
      );
      avatarHeadPosition.y += 1.5; // Look at head level
      cameraRef.current.lookAt(avatarHeadPosition);
    }
  };

  const updateNearbyUsers = () => {
    if (!avatarRef.current) return;

    const nearby: User[] = [];
    const maxDistance = 10; // Units in the world

    users.forEach((user) => {
      if (user.id !== userId && user.avatar) {
        const distance = user.avatar.position.distanceTo(
          avatarRef.current!.position
        );
        if (distance < maxDistance) {
          nearby.push(user);
        }
      }
    });

    // Only update state if the nearby users have changed
    const currentNearbyIds = new Set(nearbyUsers.map((u) => u.id));
    const newNearbyIds = new Set(nearby.map((u) => u.id));

    if (
      currentNearbyIds.size !== newNearbyIds.size ||
      ![...currentNearbyIds].every((id) => newNearbyIds.has(id))
    ) {
      setNearbyUsers(nearby);
    }
  };

  // Add useEffect to monitor user positions
  useEffect(() => {
    if (!avatarRef.current) return;

    const checkNearbyUsers = () => {
      const nearby: User[] = [];
      const maxDistance = 2;

      users.forEach((user) => {
        if (user.id !== userId && user.avatar) {
          const distance = user.avatar.position.distanceTo(
            avatarRef.current!.position
          );
          if (distance < maxDistance) {
            nearby.push(user);
          }
        }
      });

      setNearbyUsers(nearby);
    };

    // Check immediately
    checkNearbyUsers();

    // Set up an interval to check periodically
    const intervalId = setInterval(checkNearbyUsers, 1000); // Check every second

    return () => clearInterval(intervalId);
  }, [users, userId, avatarRef.current?.position]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      userId: userId,
      userName: userName,
      text: messageInput,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");

    // In a real app, you would send this message to your server
    console.log("Message sent:", newMessage);
  };

  const toggleVoiceChat = () => {
    setIsVoiceChatActive(!isVoiceChatActive);

    // In a real app, you would implement WebRTC or similar for voice chat
    console.log(`Voice chat ${isVoiceChatActive ? "disabled" : "enabled"}`);
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket) return;

    const timestamp = new Date().toISOString();
    const messageData = {
      jamId: jamId,
      userId: userId,
      userName: userName,
      message: messageInput.trim(),
      timestamp: timestamp,
      isGlobal: isGlobalChat,
    };

    socket.emit("chatMessage", messageData);
    setMessageInput("");
  };

  // Update the message listener
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
          type: messageData.type, // Use the type directly from the server
        },
      ]);
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [socket]);

  return (
    <div className="scene-container">
      <div ref={mountRef} className="w-full h-full" />

      {/* UI Overlay */}
      <div className="ui-overlay">
        {/* Controls Help */}
        <div className={`controls-help ${isHelpOpen ? "active" : ""}`}>
          <div>WASD / Arrow Keys: Move</div>
          <div>Mouse: Look around</div>
          <div>C: Toggle camera mode</div>
          <div>T: Open chat</div>
          <div>F: Interact</div>
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

        {/* Voice Chat Indicator */}
        {isVoiceChatActive && (
          <div className="voice-chat-indicator">
            <div className="w-3 h-3 rounded-full bg-white mr-2 animate-pulse" />
            Voice Chat Active
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

              <button
                className="action-btn"
                onClick={() => setIsChatOpen(true)}
              >
                <span className="material-icons">chat</span>
              </button>

              <button
                className={`action-btn ${isVoiceChatActive ? "active" : ""}`}
                onClick={toggleVoiceChat}
              >
                <span className="material-icons">
                  {isVoiceChatActive ? "mic_off" : "mic"}
                </span>
              </button>

              {/* Help Button (Mobile Only) */}
              {window.innerWidth <= 768 && (
                <button
                  className="action-btn"
                  onClick={() => setIsHelpOpen(!isHelpOpen)}
                >
                  <span className="material-icons">help_outline</span>
                </button>
              )}
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
      </div>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3 className="text-xl font-bold">Chat</h3>
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
            <div className="chat-input">
              <input
                ref={messageInputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                  if (e.key === "Escape") setIsChatOpen(false);
                }}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="spinner" />
            <p className="text-xl">Loading Metaverse...</p>
          </div>
        </div>
      )}

      {/* Add Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </div>
  );
};

export default JamScene;

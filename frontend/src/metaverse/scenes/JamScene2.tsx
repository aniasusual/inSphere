import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import nipplejs from "nipplejs";
import "../MetaverseStyles.css";

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

const JamScene: React.FC<JamSceneProps> = ({
  jamId,
  userId = `user-${Math.floor(Math.random() * 10000)}`,
  userName = `User ${Math.floor(Math.random() * 1000)}`,
  avatarUrl = "/avatars/mech_drone.glb",
  onUserInteraction,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [isConnected, setIsConnected] = useState<boolean>(false);
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

  // Scene refs
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const avatarRef = useRef<THREE.Object3D | null>(null);
  const keyStateRef = useRef<{ [key: string]: boolean }>({});
  const animationFrameId = useRef<number | null>(null);
  const joystickRef = useRef<any>(null);
  const cameraOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2, 5));
  const thirdPersonMode = useRef<boolean>(true);
  const chatRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Initialize scene
  useEffect(() => {
    if (!mountRef.current) return;

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

    // Load avatar
    loadAvatar(avatarUrl);

    // Add event listeners
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keypress", handleKeyPress);

    // Mouse look controls
    setupMouseLookControls();

    // Setup simulated users (for testing)
    setupSimulatedUsers();

    // Start animation loop
    animate();

    return () => {
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
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("mousemove", onMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

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
      mode: "static",
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

    // Add event listeners for touch rotation
    mountRef.current?.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      const screenWidth = window.innerWidth;

      // Only handle touches on the right half of the screen
      if (touch.clientX > screenWidth / 2) {
        touchStartX.current = touch.clientX;
        e.preventDefault(); // Prevent default to avoid scrolling
      }
    });

    mountRef.current?.addEventListener("touchmove", (e) => {
      if (!avatarRef.current) return;

      const touch = e.touches[0];
      const screenWidth = window.innerWidth;

      // Only handle touches on the right half of the screen
      if (touch.clientX > screenWidth / 2) {
        const deltaX = touch.clientX - touchStartX.current;

        // Rotate avatar based on swipe
        avatarRef.current.rotation.y -= deltaX * 0.01;

        // Update starting point for next move
        touchStartX.current = touch.clientX;

        e.preventDefault(); // Prevent default to avoid scrolling
      }
    });
  };

  // Setup simulated users (for testing)
  const setupSimulatedUsers = () => {
    // Add some simulated users at random positions
    const simulatedUsers = [
      {
        id: "user-1",
        name: "Alice",
        position: new THREE.Vector3(5, 0, 5),
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
      },
      {
        id: "user-2",
        name: "Bob",
        position: new THREE.Vector3(-5, 0, 3),
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
      },
      {
        id: "user-3",
        name: "Charlie",
        position: new THREE.Vector3(0, 0, -8),
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
      },
    ];

    // Create and add simulated users
    simulatedUsers.forEach((userData) => {
      const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
      const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
      });
      const userMesh = new THREE.Group();

      // Body
      const body = new THREE.Mesh(geometry, material);
      body.position.y = 1;
      userMesh.add(body);

      // Head
      const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.y = 2;
      userMesh.add(head);

      // Nametag
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = "#ffffff";
        context.font = "Bold 24px Arial";
        context.fillText(userData.name, 10, 36);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthTest: false,
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.y = 2.5;
        sprite.scale.set(2, 0.5, 1);
        userMesh.add(sprite);
      }

      userMesh.position.copy(userData.position);
      userMesh.rotation.copy(userData.rotation);
      sceneRef.current.add(userMesh);

      // Add to users map
      setUsers((prev) => {
        const newUsers = new Map(prev);
        newUsers.set(userData.id, {
          id: userData.id,
          position: userData.position,
          rotation: userData.rotation,
          name: userData.name,
          avatar: userMesh,
          lastUpdate: Date.now(),
        });
        return newUsers;
      });
    });

    // Add sample messages
    setMessages([
      {
        userId: "user-1",
        userName: "Alice",
        text: "Hey everyone! Welcome to the metaverse!",
        timestamp: Date.now() - 60000,
      },
      {
        userId: "user-2",
        userName: "Bob",
        text: "This is so cool! Love the graphics.",
        timestamp: Date.now() - 30000,
      },
    ]);
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
          console.log(
            "Loading progress:",
            (progress.loaded / progress.total) * 100
          );
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

  // Add nametag to avatar
  const addNameTag = (avatar: THREE.Object3D, name: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = "#ffffff";
      context.font = "Bold 24px Arial";
      context.fillText(name, 10, 36);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.y = 2.5;
      sprite.scale.set(2, 0.5, 1);
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

    // Update nearby users list
    updateNearbyUsers();

    // Render scene
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const handleMovement = () => {
    if (!avatarRef.current) return;

    const moveSpeed = 0.1;
    let direction = new THREE.Vector3(0, 0, 0);

    // Handle keyboard movement (for desktop)
    if (keyStateRef.current["ArrowUp"] || keyStateRef.current["KeyW"]) {
      direction.z -= 1;
    }
    if (keyStateRef.current["ArrowDown"] || keyStateRef.current["KeyS"]) {
      direction.z += 1;
    }
    if (keyStateRef.current["ArrowLeft"] || keyStateRef.current["KeyA"]) {
      direction.x -= 1;
    }
    if (keyStateRef.current["ArrowRight"] || keyStateRef.current["KeyD"]) {
      direction.x += 1;
    }

    // Handle joystick movement for mobile - use direct vector values
    if (keyStateRef.current["joystickActive"]) {
      // Clear keyboard direction when joystick is active
      direction = new THREE.Vector3();

      // Map joystick X to movement X (left/right)
      direction.x = keyStateRef.current["joystickX"];

      // Map joystick Y to movement Z (forward/backward)
      // Invert Y because pushing up should move forward (negative Z)
      direction.z = -keyStateRef.current["joystickY"];

      // Apply force for variable speed
      const force = keyStateRef.current["joystickForce"];
      direction.multiplyScalar(force);
    }

    if (direction.length() > 0) {
      // Normalize for consistent movement speed in all directions
      direction.normalize();

      // Create movement vector in local space
      const moveVector = new THREE.Vector3(
        direction.x * moveSpeed,
        0,
        direction.z * moveSpeed
      );

      // Apply avatar's current rotation to the movement vector
      moveVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        avatarRef.current.rotation.y
      );

      // Apply movement
      avatarRef.current.position.add(moveVector);
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

    setNearbyUsers(nearby);
  };

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

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full overflow-hidden">
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl bg-black bg-opacity-50 p-4 rounded-md">
            Loading...
          </div>
        )}
      </div>

      {/* Game UI */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Controls help */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
          <div>WASD / Arrow Keys: Move</div>
          <div>Mouse: Look around</div>
          <div>C: Toggle camera mode</div>
          <div>T: Open chat</div>
          <div>F: Interact with nearby users</div>
          <div>V: Toggle voice chat</div>
        </div>

        {/* Nearby users */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm max-w-xs">
          <div className="font-bold mb-1">
            Nearby Users ({nearbyUsers.length})
          </div>
          {nearbyUsers.map((user) => (
            <div key={user.id} className="flex items-center mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <div>{user.name}</div>
            </div>
          ))}
        </div>

        {/* Voice chat indicator */}
        {isVoiceChatActive && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full flex items-center">
            <div className="w-3 h-3 rounded-full bg-white mr-2 animate-pulse"></div>
            Voice Chat Active
          </div>
        )}

        {/* Chat button */}
        <button
          className="absolute bottom-4 left-4 bg-blue-600 text-white p-2 rounded-full w-12 h-12 flex items-center justify-center pointer-events-auto"
          onClick={() => setIsChatOpen(true)}
        >
          <span className="material-icons">chat</span>
        </button>

        {/* Voice chat button */}
        <button
          className={`absolute bottom-4 left-20 text-white p-2 rounded-full w-12 h-12 flex items-center justify-center pointer-events-auto ${
            isVoiceChatActive ? "bg-red-600" : "bg-green-600"
          }`}
          onClick={toggleVoiceChat}
        >
          <span className="material-icons">
            {isVoiceChatActive ? "mic_off" : "mic"}
          </span>
        </button>
      </div>

      {/* Chat panel */}
      {isChatOpen && (
        <div
          ref={chatRef}
          className="absolute bottom-4 left-4 right-4 md:left-1/4 md:right-1/4 bg-black bg-opacity-75 text-white rounded-lg p-4 max-h-96 flex flex-col pointer-events-auto"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold">Chat</h3>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setIsChatOpen(false)}
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto mb-2 space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg ${
                  msg.userId === userId
                    ? "bg-blue-800 ml-8"
                    : "bg-gray-800 mr-8"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold">{msg.userName}</span>
                  <span className="text-xs text-gray-400">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Message input */}
          <div className="flex gap-2">
            <input
              ref={messageInputRef}
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
                if (e.key === "Escape") {
                  setIsChatOpen(false);
                }
              }}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Mobile UI elements */}
      {window.innerWidth <= 768 && (
        <div className="absolute bottom-24 right-4 flex flex-col gap-3 pointer-events-auto">
          <button
            className="bg-gray-800 bg-opacity-70 text-white w-12 h-12 rounded-full flex items-center justify-center"
            onClick={() => (thirdPersonMode.current = !thirdPersonMode.current)}
          >
            <span className="material-icons">videogame_asset</span>
          </button>
          <button
            className="bg-gray-800 bg-opacity-70 text-white w-12 h-12 rounded-full flex items-center justify-center"
            onClick={() => setIsChatOpen(true)}
          >
            <span className="material-icons">chat</span>
          </button>
          <button
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isVoiceChatActive ? "bg-red-600" : "bg-green-600"
            }`}
            onClick={toggleVoiceChat}
          >
            <span className="material-icons">
              {isVoiceChatActive ? "mic_off" : "mic"}
            </span>
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
          <div className="bg-gray-900 p-8 rounded-lg text-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-xl">Loading Metaverse...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JamScene;

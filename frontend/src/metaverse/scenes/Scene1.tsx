import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { useSocket } from "socket"
interface User {
    id: string;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    name: string;
    avatar: THREE.Object3D | null;
    lastUpdate: number;
}

const Scene1 = ({ jamId, userId, userName, avatarUrl }) => {

    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);


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

    const lastPositionSent = useRef<THREE.Vector3>(new THREE.Vector3());
    const lastRotationSent = useRef<THREE.Euler>(new THREE.Euler());

    // Reusable vectors for camera calculations
    const targetPosition = new THREE.Vector3();
    const offset = new THREE.Vector3();
    const avatarHeadPosition = new THREE.Vector3();

    const { socket, isConnected } = useSocket();

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

    const updateCameraPosition = () => {
        if (!avatarRef.current || !cameraRef.current) return;

        if (thirdPersonMode.current) {
            offset.copy(cameraOffsetRef.current);
            offset.applyQuaternion(avatarRef.current.quaternion);
            targetPosition.copy(avatarRef.current.position).add(offset);
            cameraRef.current.position.lerp(targetPosition, 0.1); // Faster lerp
            avatarHeadPosition.copy(avatarRef.current.position);
            avatarHeadPosition.y += 1; // Adjusted for typical avatar height
            cameraRef.current.lookAt(avatarHeadPosition);
        }
    };

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

    const animate = () => {
        animationFrameId.current = requestAnimationFrame(animate);
        handleMovement();
        updateCameraPosition();
        if (rendererRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
    };

    const addNameTag = (avatar: THREE.Object3D, name: string) => {
        // Calculate avatar height to position the name tag appropriately
        const box = new THREE.Box3().setFromObject(avatar);
        const height = box.max.y - box.min.y;

        // Create canvas for the name tag
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 64;
        const context = canvas.getContext("2d");

        if (context) {
            // Clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Add simple text with no styling
            context.fillStyle = "#ffffff";
            context.font = "24px Arial";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(name, canvas.width / 2, canvas.height / 2);

            // Create texture and sprite
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthTest: false,
            });

            const sprite = new THREE.Sprite(spriteMaterial);

            // Position just above the avatar's head
            sprite.position.y = height + 0.1;
            sprite.scale.set(1, 0.25, 1);

            // Mark as name tag for camera orientation updates
            sprite.userData = { isNameTag: true };

            avatar.add(sprite);
        }
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
                    // Set random initial position
                    const range = 50; // Within floor bounds (-50 to 50)
                    const randomX = Math.random() * range * 2 - range; // -50 to 50
                    const randomZ = Math.random() * range * 2 - range; // -50 to 50
                    avatar.position.set(randomX, 0, randomZ);
                    avatar.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    avatarRef.current = avatar;
                    sceneRef.current.add(avatar);
                    addNameTag(avatar, userName || "Anonymous");

                    // Log bounding box for debugging
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
        }
    };

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = sceneRef.current;
        scene.background = new THREE.Color(0x87ceeb);

        // Floor
        const floorSize = 100;
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

        // Camera
        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 2, 3);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024; // Reduced resolution
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        scene.add(directionalLight);


        setupMouseLookControls();

        // Load avatar
        if (isConnected) {
            loadAvatar(avatarUrl);

        }

        // Start animation
        animate();

        // Handle window resize
        const handleResize = () => {
            if (cameraRef.current && rendererRef.current) {
                cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [avatarUrl, userId, userName, isConnected, socket]);

    return (
        <div className="scene-container" style={{ width: "100vw", height: "100vh" }}>
            <div ref={mountRef} className="w-full h-full" />
        </div>
    );
};

export default Scene1;
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { useSocket } from "socket";
import nipplejs from "nipplejs";

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

const Scene1 = ({ jamId, userId, userName, avatarUrl }) => {
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
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
            const force = Math.min(Math.max(keyStateRef.current["joystickForce"] || 0, 0), 1);
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
                const rotChanged = !avatarRef.current.rotation.equals(lastRotationSent.current);
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

            if (isRotating && e.touches.length === 1 && e.touches[0].clientX > screenWidth / 2) {
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
                cameraAnglesRef.current.yaw = cameraAnglesRef.current.yaw % (2 * Math.PI);

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

        mountRef.current?.addEventListener("touchstart", onTouchStart, { passive: false });
        mountRef.current?.addEventListener("touchmove", onTouchMove, { passive: false });
        mountRef.current?.addEventListener("touchend", onTouchEnd, { passive: true });

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

            const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

            loader.load(
                absoluteUrl,
                (gltf) => {
                    const avatar = gltf.scene;
                    avatar.scale.set(1, 1, 1);
                    const range = 50;
                    const randomX = Math.random() * range * 2 - range;
                    const randomZ = Math.random() * range * 2 - range;
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

    useEffect(() => {
        if (!mountRef.current) return;

        const scene = sceneRef.current;
        scene.background = new THREE.Color(0x87ceeb);

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
        }

        animate();

        const handleResize = () => {
            if (cameraRef.current && rendererRef.current) {
                cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener("resize", handleResize);

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
    }, [avatarUrl, userId, userName, isConnected]);

    return (
        <div className="scene-container" style={{ width: "100vw", height: "100vh" }}>
            <div ref={mountRef} className="w-full h-full" />
        </div>
    );
};

export default Scene1;
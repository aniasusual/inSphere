import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Water } from 'three/examples/jsm/objects/Water';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

interface User {
    id: string;
    position: THREE.Vector3;
    color: number;
    name: string;
    avatar: THREE.Object3D | null;
    lastUpdate: number;
}

interface MessageBubble {
    id: string;
    userId: string;
    text: string;
    position: THREE.Vector3;
    element: HTMLDivElement;
    createdAt: number;
}

const JamScene: React.FC<{
    jamId: string;
    userId: string;
    userName: string;
    onUserInteraction?: (targetUserId: string) => void;
    onAreaInteraction?: (areaId: string) => void;
}> = ({ jamId, userId, userName, onUserInteraction, onAreaInteraction }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [users, setUsers] = useState<Map<string, User>>(new Map());
    const [messages, setMessages] = useState<Map<string, MessageBubble>>(new Map());
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [currentArea, setCurrentArea] = useState<string>("main");

    // Refs for scene objects
    const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const labelRendererRef = useRef<CSS2DRenderer | null>(null);
    const avatarRef = useRef<THREE.Object3D | null>(null);
    const userAvatarsRef = useRef<Map<string, THREE.Object3D>>(new Map());
    const messageBubblesRef = useRef<Map<string, MessageBubble>>(new Map());
    const clockRef = useRef<THREE.Clock>(new THREE.Clock());
    const controlsRef = useRef<OrbitControls | null>(null);
    const interactiveObjectsRef = useRef<Map<string, THREE.Object3D>>(new Map());
    const keyStateRef = useRef<{ [key: string]: boolean }>({});
    const animationFrameId = useRef<number | null>(null);

    // Scene setup (runs once)
    useEffect(() => {
        if (!mountRef.current) return;

        // Initialize scene
        const scene = sceneRef.current;
        scene.fog = new THREE.FogExp2(0x11111f, 0.002);

        // Camera
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 3, 5);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.8);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // CSS2D Renderer
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.8);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0';
        labelRenderer.domElement.style.pointerEvents = 'none';
        mountRef.current.appendChild(labelRenderer.domElement);
        labelRendererRef.current = labelRenderer;

        // OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI * 0.6;
        controls.minDistance = 2;
        controls.maxDistance = 30;
        controlsRef.current = controls;

        // Water
        const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
        const water = new Water(waterGeometry, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load(
                'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg',
                (texture) => {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }
            ),
            sunDirection: new THREE.Vector3(0, 1, 0),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined,
        });
        water.rotation.x = -Math.PI / 2;
        water.position.y = -1;
        scene.add(water);

        // Sky
        const sky = new Sky();
        sky.scale.setScalar(10000);
        scene.add(sky);

        const skyUniforms = sky.material.uniforms;
        skyUniforms['turbidity'].value = 10;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;

        const sun = new THREE.Vector3();
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        const phi = THREE.MathUtils.degToRad(88);
        const theta = THREE.MathUtils.degToRad(180);
        sun.setFromSphericalCoords(1, phi, theta);
        skyUniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();
        scene.environment = pmremGenerator.fromScene(sky as any).texture;

        // Create environment
        createMainIsland(scene);
        createTeleportAreas(scene);

        // User's avatar
        const userColor = new THREE.Color(Math.random() * 0xffffff);
        const myAvatar = createUserAvatar(userColor);
        myAvatar.position.set(0, 0.5, 0);
        scene.add(myAvatar);
        avatarRef.current = myAvatar;

        const avatarLabel = createUserLabel(userName);
        const avatarLabelObj = new CSS2DObject(avatarLabel);
        avatarLabelObj.position.set(0, 1.5, 0);
        myAvatar.add(avatarLabelObj);

        // Lighting
        setupLighting(scene);

        // Event listeners
        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Animation loop
        const animate = () => {
            const delta = clockRef.current.getDelta();

            // Update water
            if (water.material.uniforms['time']) {
                water.material.uniforms['time'].value += delta * 0.5;
            }

            // Move user avatar
            moveUserAvatar(delta);

            // Follow user with camera
            if (avatarRef.current && cameraRef.current) {
                controls.target.copy(avatarRef.current.position);
            }

            // Update other users and messages
            updateOtherUsers(delta);
            updateMessageBubbles();

            // Check interactions
            checkInteractions();

            // Render
            controls.update();
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);

            animationFrameId.current = requestAnimationFrame(animate);
        };
        animationFrameId.current = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);

            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }

            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            if (mountRef.current && labelRenderer.domElement) {
                mountRef.current.removeChild(labelRenderer.domElement);
            }

            controls.dispose();
            renderer.dispose();
            pmremGenerator.dispose();
        };
    }, []); // Empty dependency array to run only once

    // Handle user updates
    useEffect(() => {
        if (!isConnected) {
            setTimeout(() => {
                setIsConnected(true);
                addMockUsers();
            }, 1000);
        }
    }, [isConnected]);

    // Helper functions (moved outside useEffect)
    const createMainIsland = (scene: THREE.Scene) => {
        const platformGeometry = new THREE.CylinderGeometry(10, 12, 1, 32);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x8bc34a,
            roughness: 0.8,
            metalness: 0.2,
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = -0.5;
        platform.castShadow = true;
        platform.receiveShadow = true;
        scene.add(platform);

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 9;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            if (i % 3 === 0) createTree(scene, x, z, 2 + Math.random() * 1.5);
            else if (i % 3 === 1) createRock(scene, x, z, 0.5 + Math.random() * 0.5);
            else createLightPost(scene, x, z);
        }

        const centerGeometry = new THREE.CylinderGeometry(1.5, 1.5, 5, 16);
        const centerMaterial = new THREE.MeshStandardMaterial({
            color: 0x3f51b5,
            roughness: 0.7,
            metalness: 0.3,
        });
        const centerStructure = new THREE.Mesh(centerGeometry, centerMaterial);
        centerStructure.position.y = 2;
        centerStructure.castShadow = true;
        centerStructure.receiveShadow = true;
        scene.add(centerStructure);

        const orbGeometry = new THREE.SphereGeometry(1, 32, 32);
        const orbMaterial = new THREE.MeshStandardMaterial({
            color: 0x03a9f4,
            emissive: 0x03a9f4,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            metalness: 0.8,
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.y = 5;
        orb.castShadow = true;
        scene.add(orb);

        const orbLight = new THREE.PointLight(0x03a9f4, 1, 20);
        orbLight.position.copy(orb.position);
        scene.add(orbLight);
    };

    const createTeleportAreas = (scene: THREE.Scene) => {
        const areas = [
            { id: 'music', position: new THREE.Vector3(7, 0, 0), color: 0xff5722 },
            { id: 'games', position: new THREE.Vector3(0, 0, 7), color: 0x9c27b0 },
            { id: 'social', position: new THREE.Vector3(-7, 0, 0), color: 0x4caf50 },
            { id: 'art', position: new THREE.Vector3(0, 0, -7), color: 0xffeb3b },
        ];

        areas.forEach((area) => {
            const areaGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 16);
            const areaMaterial = new THREE.MeshStandardMaterial({
                color: area.color,
                emissive: area.color,
                emissiveIntensity: 0.3,
                roughness: 0.7,
                metalness: 0.5,
            });
            const areaMesh = new THREE.Mesh(areaGeometry, areaMaterial);
            areaMesh.position.copy(area.position);
            areaMesh.userData = { type: 'teleport', id: area.id };
            scene.add(areaMesh);
            interactiveObjectsRef.current.set(area.id, areaMesh);

            const areaLabel = document.createElement('div');
            areaLabel.className = 'area-label';
            areaLabel.textContent = area.id.toUpperCase();
            areaLabel.style.color = 'white';
            areaLabel.style.fontSize = '16px';
            areaLabel.style.fontWeight = 'bold';
            areaLabel.style.padding = '5px';
            areaLabel.style.backgroundColor = 'rgba(0,0,0,0.5)';
            areaLabel.style.borderRadius = '4px';
            const areaLabelObj = new CSS2DObject(areaLabel);
            areaLabelObj.position.set(0, 1, 0);
            areaMesh.add(areaLabelObj);

            const indicatorGeometry = new THREE.TorusGeometry(1.2, 0.1, 16, 32);
            const indicatorMaterial = new THREE.MeshBasicMaterial({
                color: area.color,
                transparent: true,
                opacity: 0.7,
            });
            const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
            indicator.rotation.x = Math.PI / 2;
            indicator.position.copy(area.position);
            indicator.position.y = 0.2;
            scene.add(indicator);
            indicator.userData = { baseY: 0.2, area: area.id };
            interactiveObjectsRef.current.set(`${area.id}-indicator`, indicator);
        });
    };

    const createTree = (scene: THREE.Scene, x: number, z: number, height: number) => {
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, height * 0.6, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, height * 0.3, z);
        trunk.castShadow = true;
        scene.add(trunk);

        const leavesGeometry = new THREE.ConeGeometry(height * 0.4, height * 0.8, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.8 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, height * 0.6 + height * 0.4, z);
        leaves.castShadow = true;
        scene.add(leaves);
    };

    const createRock = (scene: THREE.Scene, x: number, z: number, size: number) => {
        const rockGeometry = new THREE.DodecahedronGeometry(size, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x696969, roughness: 0.9, metalness: 0.1 });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, size / 2, z);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
    };

    const createLightPost = (scene: THREE.Scene, x: number, z: number) => {
        const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        const postMaterial = new THREE.MeshStandardMaterial({ color: 0x424242, roughness: 0.7, metalness: 0.8 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(x, 1, z);
        post.castShadow = true;
        scene.add(post);

        const lampGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const lampMaterial = new THREE.MeshStandardMaterial({
            color: 0xffeb3b,
            emissive: 0xffeb3b,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8,
        });
        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        lamp.position.set(x, 2.2, z);
        scene.add(lamp);

        const lampLight = new THREE.PointLight(0xffeb3b, 0.7, 5);
        lampLight.position.copy(lamp.position);
        scene.add(lampLight);
    };

    const createUserAvatar = (color: THREE.ColorRepresentation) => {
        const avatarGroup = new THREE.Group();
        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 0.5, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.3 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75;
        body.castShadow = true;
        avatarGroup.add(body);

        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffe0bd, roughness: 0.8, metalness: 0.1 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.4;
        head.castShadow = true;
        avatarGroup.add(head);

        return avatarGroup;
    };

    const createUserLabel = (name: string) => {
        const label = document.createElement('div');
        label.className = 'user-label';
        label.textContent = name;
        label.style.color = 'white';
        label.style.fontSize = '14px';
        label.style.padding = '2px 5px';
        label.style.backgroundColor = 'rgba(0,0,0,0.5)';
        label.style.borderRadius = '4px';
        return label;
    };

    const setupLighting = (scene: THREE.Scene) => {
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 10;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        scene.add(directionalLight);
    };

    const handleResize = () => {
        if (!cameraRef.current || !rendererRef.current || !labelRendererRef.current) return;
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth * 0.9, window.innerHeight * 0.8);
        labelRendererRef.current.setSize(window.innerWidth * 0.9, window.innerHeight * 0.8);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        keyStateRef.current[event.key.toLowerCase()] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        keyStateRef.current[event.key.toLowerCase()] = false;
    };

    const moveUserAvatar = (delta: number) => {
        if (!avatarRef.current || !cameraRef.current) return;

        const avatar = avatarRef.current;
        const speed = 5;
        const moveDistance = speed * delta;

        const cameraDirection = new THREE.Vector3();
        cameraRef.current.getWorldDirection(cameraDirection);

        const forward = new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
        const right = new THREE.Vector3(forward.z, 0, -forward.x).normalize();

        if (keyStateRef.current['w']) avatar.position.add(forward.clone().multiplyScalar(moveDistance));
        if (keyStateRef.current['s']) avatar.position.add(forward.clone().multiplyScalar(-moveDistance));
        if (keyStateRef.current['a']) avatar.position.add(right.clone().multiplyScalar(-moveDistance));
        if (keyStateRef.current['d']) avatar.position.add(right.clone().multiplyScalar(moveDistance));

        const maxRadius = 12;
        const currentRadius = Math.sqrt(avatar.position.x * avatar.position.x + avatar.position.z * avatar.position.z);
        if (currentRadius > maxRadius) {
            const angle = Math.atan2(avatar.position.z, avatar.position.x);
            avatar.position.x = maxRadius * Math.cos(angle);
            avatar.position.z = maxRadius * Math.sin(angle);
        }

        if (keyStateRef.current['w'] || keyStateRef.current['s'] || keyStateRef.current['a'] || keyStateRef.current['d']) {
            const movement = new THREE.Vector3();
            if (keyStateRef.current['w']) movement.add(forward);
            if (keyStateRef.current['s']) movement.add(forward.clone().negate());
            if (keyStateRef.current['a']) movement.add(right.clone().negate());
            if (keyStateRef.current['d']) movement.add(right);

            if (movement.length() > 0) {
                const targetRotation = Math.atan2(movement.x, movement.z);
                avatar.rotation.y = targetRotation;
            }
        }
    };

    const checkInteractions = () => {
        if (!avatarRef.current) return;

        const avatar = avatarRef.current;
        const interactionDistance = 1.5;

        interactiveObjectsRef.current.forEach((obj, key) => {
            if (obj.userData?.type === 'teleport') {
                const distance = avatar.position.distanceTo(obj.position);
                const material = obj.material as THREE.MeshStandardMaterial;

                if (distance < interactionDistance) {
                    material.emissiveIntensity = 0.8;
                    if (keyStateRef.current['e']) {
                        onAreaInteraction?.(obj.userData.id);
                        setCurrentArea(obj.userData.id);
                        keyStateRef.current['e'] = false;
                    }
                } else {
                    material.emissiveIntensity = 0.3;
                }
            }
        });

        userAvatarsRef.current.forEach((otherAvatar, otherUserId) => {
            if (otherUserId !== userId) {
                const distance = avatar.position.distanceTo(otherAvatar.position);
                const highlightMaterial = otherAvatar.children[0].material as THREE.MeshStandardMaterial;

                if (distance < interactionDistance) {
                    highlightMaterial.emissiveIntensity = 0.3;
                    if (keyStateRef.current['f']) {
                        onUserInteraction?.(otherUserId);
                        createMessageBubble(userId, `Interacting with ${users.get(otherUserId)?.name || 'User'}`);
                        keyStateRef.current['f'] = false;
                    }
                } else {
                    highlightMaterial.emissiveIntensity = 0;
                }
            }
        });
    };

    const addMockUsers = () => {
        const mockUsers = [
            { id: 'user1', name: 'Alice', position: new THREE.Vector3(3, 0, 2), color: 0xff5252 },
            { id: 'user2', name: 'Bob', position: new THREE.Vector3(-2, 0, 4), color: 0x7c4dff },
            { id: 'user3', name: 'Charlie', position: new THREE.Vector3(-4, 0, -3), color: 0x00bcd4 },
            { id: 'user4', name: 'Diana', position: new THREE.Vector3(5, 0, -2), color: 0xffc107 },
        ];

        const newUsers = new Map(users);
        mockUsers.forEach((mockUser) => {
            const userAvatar = createUserAvatar(mockUser.color);
            userAvatar.position.copy(mockUser.position);
            userAvatar.position.y = 0;
            sceneRef.current.add(userAvatar);

            const label = createUserLabel(mockUser.name);
            const labelObj = new CSS2DObject(label);
            labelObj.position.set(0, 1.5, 0);
            userAvatar.add(labelObj);

            userAvatarsRef.current.set(mockUser.id, userAvatar);
            newUsers.set(mockUser.id, {
                id: mockUser.id,
                name: mockUser.name,
                position: mockUser.position,
                color: mockUser.color,
                avatar: userAvatar,
                lastUpdate: Date.now(),
            });
        });
        setUsers(newUsers);

        setTimeout(() => createMessageBubble('user1', 'Hey everyone!'), 3000);
        setTimeout(() => createMessageBubble('user2', 'This jam is awesome!'), 5000);
    };

    const createMessageBubble = (userId: string, text: string) => {
        const user = users.get(userId);
        if (!user || !user.avatar) return;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;
        bubble.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        bubble.style.color = 'black';
        bubble.style.padding = '5px 10px';
        bubble.style.borderRadius = '10px';
        bubble.style.maxWidth = '150px';
        bubble.style.wordWrap = 'break-word';
        bubble.style.fontSize = '12px';
        bubble.style.pointerEvents = 'none';

        const bubbleObj = new CSS2DObject(bubble);
        bubbleObj.position.set(0, 2, 0);
        user.avatar.add(bubbleObj);

        const messageId = `msg-${Date.now()}-${userId}`;
        const message: MessageBubble = {
            id: messageId,
            userId,
            text,
            position: user.position.clone(),
            element: bubble,
            createdAt: Date.now(),
        };

        messageBubblesRef.current.set(messageId, message);
        setMessages((prev) => new Map(prev).set(messageId, message));

        setTimeout(() => {
            messageBubblesRef.current.delete(messageId);
            user.avatar?.remove(bubbleObj);
            setMessages((prev) => {
                const newMessages = new Map(prev);
                newMessages.delete(messageId);
                return newMessages;
            });
        }, 5000);
    };

    const updateOtherUsers = (delta: number) => {
        userAvatarsRef.current.forEach((avatar, userId) => {
            if (userId === userId) return;

            if (Math.random() < 0.01) {
                const randomDirection = new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    0,
                    (Math.random() - 0.5) * 2
                ).normalize();

                const speed = 1;
                const newPosition = avatar.position.clone().add(randomDirection.multiplyScalar(delta * speed));
                const maxRadius = 11;
                const currentRadius = Math.sqrt(newPosition.x * newPosition.x + newPosition.z * newPosition.z);

                if (currentRadius <= maxRadius) {
                    avatar.position.copy(newPosition);
                    const targetRotation = Math.atan2(randomDirection.x, randomDirection.z);
                    avatar.rotation.y = targetRotation;

                    const user = users.get(userId);
                    if (user) {
                        user.position = avatar.position.clone();
                        user.lastUpdate = Date.now();
                    }
                }
            }
        });
    };

    const updateMessageBubbles = () => {
        const currentTime = Date.now();
        messageBubblesRef.current.forEach((bubble, id) => {
            if (currentTime - bubble.createdAt > 5000) {
                const user = users.get(bubble.userId);
                if (user && user.avatar) {
                    messageBubblesRef.current.delete(id);
                }
            }
        });
    };

    const handleSendMessage = (message: string) => {
        if (!message.trim() || !avatarRef.current) return;
        createMessageBubble(userId, message);
        console.log(`Sending message: ${message}`);
    };

    useEffect(() => {
        if (currentArea !== "main" && avatarRef.current) {
            console.log(`Changed area to: ${currentArea}`);
            const areaPositions: { [key: string]: THREE.Vector3 } = {
                music: new THREE.Vector3(7, 0.5, 0),
                games: new THREE.Vector3(0, 0.5, 7),
                social: new THREE.Vector3(-7, 0.5, 0),
                art: new THREE.Vector3(0, 0.5, -7),
            };
            if (areaPositions[currentArea]) {
                avatarRef.current.position.copy(areaPositions[currentArea]);
            }
        }
    }, [currentArea]);

    return (
        <div className="jam-scene-container">
            <div ref={mountRef} className="jam-scene" style={{ width: '100%', height: '80vh', position: 'relative' }} />

            <div className="controls-overlay" style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                padding: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                borderRadius: '5px',
            }}>
                <div>WASD: Move</div>
                <div>E: Interact with areas</div>
                <div>F: Interact with users</div>
                <div>Mouse: Look around</div>
            </div>

            <div className="chat-interface" style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                width: '300px',
            }}>
                <div className="chat-messages" style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '5px',
                    padding: '10px',
                    marginBottom: '10px',
                    color: 'white',
                }}>
                    <div>Welcome to the {currentArea} jam!</div>
                    <div>Users online: {users.size}</div>
                </div>

                <div className="chat-input" style={{ display: 'flex', gap: '5px' }}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        style={{ flex: 1, padding: '8px', borderRadius: '5px', border: 'none' }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                handleSendMessage(target.value);
                                target.value = '';
                            }
                        }}
                    />
                    <button
                        style={{
                            backgroundColor: '#4a90e2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            padding: '8px 15px',
                            cursor: 'pointer',
                        }}
                        onClick={(e) => {
                            const input = e.currentTarget.previousSibling as HTMLInputElement;
                            handleSendMessage(input.value);
                            input.value = '';
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>

            {!isConnected && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center',
                }}>
                    <div>Connecting to jam...</div>
                    <div style={{ marginTop: '10px' }}>Loading virtual space</div>
                </div>
            )}

            <div className="current-area-indicator" style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
            }}>
                Current Area: {currentArea.toUpperCase()}
            </div>
        </div>
    );
};

export default JamScene;
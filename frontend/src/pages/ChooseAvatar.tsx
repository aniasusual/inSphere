import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Sparkles, Plus, X, Check, Loader2, ExternalLink } from "lucide-react";
import logo from "@assets/hyperlocalNobg.png";
import axios from "axios";
import { toaster } from "@components/ui/toaster";

const ChooseAvatar: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isAvatarValid, setIsAvatarValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
  const [activeOption, setActiveOption] = useState<"create" | "own">("create");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // References for Three.js canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize scene with transparent background
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Add lights with balanced intensity
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 3;
    camera.position.y = 1;
    cameraRef.current = camera;

    // Setup renderer with transparent background
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Add platform
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 0.1, 32),
      new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        metalness: 0.5,
        roughness: 0.2,
      })
    );
    platform.position.y = -1.2;
    platform.receiveShadow = true;
    scene.add(platform);

    // Animation loop
    const animate = (): void => {
      requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.003;
      }
      if (rendererRef.current && cameraRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Handle window resize
    const handleResize = (): void => {
      const container = canvasRef.current?.parentElement;
      const width = container?.clientWidth || 400;
      const height = container?.clientHeight || 400;

      if (cameraRef.current) {
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
      if (rendererRef.current) {
        rendererRef.current.setSize(width, height);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle file upload
  const handleFileUpload = (file: File): void => {
    if (!file.name.match(/\.(glb|gltf)$/i)) {
      setIsAvatarValid(false);
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === "string") {
        loadModel(event.target.result);
      }
    };
    reader.onerror = () => {
      setIsAvatarValid(false);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  useEffect(() => {
    const dropArea = dropRef.current;
    if (!dropArea) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.add("border-blue-500", "dark:border-blue-400");
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove("border-blue-500", "dark:border-blue-400");
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove("border-blue-500", "dark:border-blue-400");

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    };

    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("dragleave", handleDragLeave);
    dropArea.addEventListener("drop", handleDrop);

    return () => {
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("dragleave", handleDragLeave);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, []);

  // Function to load 3D model
  const loadModel = (url: string): void => {
    if (!sceneRef.current) return;

    // Remove existing model if any
    if (modelRef.current && sceneRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }

    setIsLoading(true);

    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.set(scale, scale, scale);

        model.position.x = -center.x * scale;
        model.position.y = -center.y * scale;
        model.position.z = -center.z * scale;

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).castShadow = true;
            (child as THREE.Mesh).receiveShadow = true;
          }
        });

        if (sceneRef.current) {
          sceneRef.current.add(model);
          modelRef.current = model;
        }

        setIsAvatarValid(true);
        setIsLoading(false);
      },
      (xhr) => {
        // Progress callback
      },
      (error) => {
        console.error("Error loading model:", error);
        setIsAvatarValid(false);
        setIsLoading(false);
      }
    );
  };

  // Validate and load model when URL changes
  useEffect(() => {
    const isGlbOrGltf =
      avatarUrl && (avatarUrl.endsWith(".glb") || avatarUrl.endsWith(".gltf"));

    if (isGlbOrGltf) {
      const timer = setTimeout(() => {
        loadModel(avatarUrl);
      }, 500);

      return () => clearTimeout(timer);
    } else if (avatarUrl) {
      setIsAvatarValid(false);
    }
  }, [avatarUrl]);

  // Update avatar function
  const updateAvatar = async () => {
    console.log("Updating avatar with URL:", avatarUrl);
    try {
      setIsSubmitLoading(true);
      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/user/update-avatar`,
        { avatarUrl },
        config
      );
      console.log("data: ", data);
      if (data.success) {
        setShowSuccess(true);
        setIsSubmitLoading(false);
        toaster.create({
          title: `Avatar updated successfully`,
          type: "success",
        });
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error: any) {
      console.log("Failed to update avatar: ", error.response.data.message);
      toaster.create({
        title: `Failed`,
        description: error.response.data.message,
        type: "error",
      });
      setIsSubmitLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 sm:p-6 min-h-screen w-full">
      <div className="w-full max-w-[1400px] flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* 3D Preview Area */}
        <div className="w-full lg:w-[70%] flex flex-col items-center justify-center">
          <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[80vh]">
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg">
              <canvas ref={canvasRef} className="w-full h-full" />

              {!isAvatarValid && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-300">
                      No Avatar Selected
                    </p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-sm">
                  <Loader2
                    size={40}
                    className="animate-spin text-blue-500 dark:text-blue-400"
                  />
                </div>
              )}

              {showSuccess && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-100 dark:bg-green-900 bg-opacity-20 dark:bg-opacity-20 backdrop-blur-sm animate-fadeIn">
                  <div className="bg-green-500 rounded-full p-3">
                    <Check size={30} className="text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-4">
            {isAvatarValid
              ? "Drag to rotate • Scroll to zoom"
              : "Avatar preview will appear here"}
          </p>
        </div>

        {/* Controls Area */}
        <div className="w-full lg:w-[30%] flex flex-col justify-center">
          <div className="mb-8 flex items-center">
            <Sparkles className="text-blue-500 dark:text-blue-400 mr-3" />
            <h1 className="text-3xl sm:text-4xl font-bold">Avatar Studio</h1>
            <img src={logo} className="w-8 sm:w-10 ml-4 sm:ml-10" alt="Logo" />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 dark:border-slate-600">
            {/* Option Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 mb-6">
              <button
                onClick={() => setActiveOption("create")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeOption === "create"
                    ? "bg-blue-500 dark:bg-blue-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Create New Avatar
              </button>
              <button
                onClick={() => setActiveOption("own")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeOption === "own"
                    ? "bg-blue-500 dark:bg-blue-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Use Your Own
              </button>
            </div>

            {activeOption === "create" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <a
                    href="/create-avatar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Open Avatar Creator</span>
                    <ExternalLink size={18} />
                  </a>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
                    Creates your Ready Player Me avatar in a new window
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-600 dark:text-slate-300">
                    Paste Avatar URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://models.readyplayer.me/avatar.glb"
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-transparent rounded-xl border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-40 transition-all outline-none"
                    />
                    {avatarUrl && (
                      <button
                        onClick={() => setAvatarUrl("")}
                        className="absolute right-3 top-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Must be a .glb or .gltf file URL
                  </p>
                </div>
              </div>
            )}

            {activeOption === "own" && (
              <div className="py-8 animate-fadeIn">
                <div
                  ref={dropRef}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl py-10 px-6 text-center transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".glb,.gltf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="mb-4 flex justify-center">
                    <div className="bg-slate-200 dark:bg-slate-700 p-3 rounded-full">
                      <Plus
                        className="text-blue-500 dark:text-blue-400"
                        size={24}
                      />
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-3">
                    Click or drag and drop your 3D model here
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Supported formats: .glb, .gltf
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={updateAvatar}
                disabled={!isAvatarValid}
                className={`w-full py-3 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 ${
                  isAvatarValid
                    ? "bg-green-700 text-white shadow-md"
                    : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-50"
                }`}
              >
                {isSubmitLoading ? (
                  <Loader2
                    size={20}
                    className="animate-spin text-blue-500 dark:text-blue-400"
                  />
                ) : (
                  <span>Update Avatar</span>
                )}
                {isAvatarValid && <Check size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
          /* Mobile-first responsive styles */
          @media (max-width: 767px) {
            .flex-col {
              flex-direction: column;
            }
            .w-full {
              width: 100%;
            }
            .h-[50vh] {
              height: 50vh;
            }
          }
          @media (min-width: 768px) and (max-width: 1023px) {
            .h-[60vh] {
              height: 60vh;
            }
          }
          @media (min-width: 1024px) {
            .lg\\:w-[70%] {
              width: 70%;
            }
            .lg\\:w-[30%] {
              width: 30%;
            }
            .lg\\:h-[80vh] {
              height: 80vh;
            }
            .lg\\:flex-row {
              flex-direction: row;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ChooseAvatar;

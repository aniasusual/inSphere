import CharacterController from "@metaverse/components/CharacterController";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  Sky,
  useCursor,
} from "@react-three/drei";
import { useEffect, useState } from "react";
import { useSocket } from "socket";
import Item from "@metaverse/components/Item";

const CustomScene1 = () => {
  const [currentUserPosition, setCurrentUserPosition] = useState<number[]>([
    0, 0, 0,
  ]);

  const [onFloor, setOnFloor] = useState<boolean>(false);
  useCursor(onFloor);

  const { socket, isConnected } = useSocket();

  const handleFloorClick = (e: any) => {
    const newPosition = [e.point.x, 0, e.point.z];
    setCurrentUserPosition(newPosition);
    if (isConnected) {
      socket.emit("move", newPosition);
    }
  };

  useEffect(() => {
    const range = 5;
    const randomX = Math.random() * range * 2 - range;
    const randomZ = Math.random() * range * 2 - range;

    setCurrentUserPosition([randomX, 0, randomZ]);
  }, []);

  return (
    <>
      <Environment preset="sunset" />
      <OrbitControls />
      <ambientLight intensity={0.7} />
      <ContactShadows blur={2} />
      <Item itemUrl={"/models/city/Big Building.glb"} />
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
      />
      <mesh
        rotation-x={-Math.PI / 2}
        position-y={-0.001}
        onClick={(e) => handleFloorClick(e)}
        onPointerEnter={() => setOnFloor(true)}
        onPointerLeave={() => setOnFloor(false)}
      >
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      {/* <HoodieCharacter />
      <HoodieCharacter position-x={1} hairColor="blue" topColor="yellow" /> */}
      <CharacterController currentUserPosition={currentUserPosition} />
    </>
  );
};

export default CustomScene1;

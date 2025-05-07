import CharacterController from "@metaverse/components/CharacterController";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  Sky,
} from "@react-three/drei";

const CustomScene1 = () => {
  return (
    <>
      <Environment preset="apartment" />
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
      />
      <ambientLight intensity={0.7} />
      <ContactShadows blur={2} />
      <OrbitControls />
      {/* <HoodieCharacter />
      <HoodieCharacter position-x={1} hairColor="blue" topColor="yellow" /> */}
      <CharacterController />
    </>
  );
};

export default CustomScene1;

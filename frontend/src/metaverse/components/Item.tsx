import { useGLTF } from "@react-three/drei";

const Item = ({ itemUrl = "" }) => {
  const { scene } = useGLTF(itemUrl);

  return <primitive object={scene} />;
};

export default Item;

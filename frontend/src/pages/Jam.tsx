import React from "react";
import { useParams } from "react-router-dom";
import Scene1 from "@metaverse/scenes/Scene1";
import "@metaverse/MetaverseStyles.css";
import { useSelector } from "react-redux";
import { RootState } from "store";
import CustomScene1 from "@metaverse/scenes/CustomScene1";
import { Canvas } from "@react-three/fiber";
import { MetaverseSceneLayout } from "@components/layouts/MetaverseSceneLayout";

export const JamPage: React.FC = () => {
  const { jamId } = useParams<{ jamId: string }>();
  const { user } = useSelector((state: RootState) => state.user);

  if (!jamId)
    return <div className="text-white text-center p-4">Invalid Jam ID</div>;

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* <Scene1
        jamId={jamId}
        userId={user._id}
        userName={user.username}
        avatarUrl={user.avatarUrl || "/avatars/Hulk.glb"}
      /> */}

      <MetaverseSceneLayout>
        <main className="absolute top-0 left-0 w-full h-full">
          <Canvas shadows camera={{ position: [8, 8, 5], fov: 30 }}>
            <CustomScene1 />
          </Canvas>
        </main>
      </MetaverseSceneLayout>
    </div>
  );
};

export default JamPage;

import React from "react";
import { useParams } from "react-router-dom";
import Scene1 from "@metaverse/scenes/Scene1";
import "@metaverse/MetaverseStyles.css";
import { useSelector } from "react-redux";
import { RootState } from "store";

export const JamPage: React.FC = () => {
  const { jamId } = useParams<{ jamId: string }>();
  const { user } = useSelector((state: RootState) => state.user);

  if (!jamId)
    return <div className="text-white text-center p-4">Invalid Jam ID</div>;

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Main Scene */}
      <Scene1
        jamId={jamId}
        userId={user._id}
        userName={user.username}
        avatarUrl={user.avatarUrl || "/avatars/Hulk.glb"}
      />
    </div>
  );
};

export default JamPage;

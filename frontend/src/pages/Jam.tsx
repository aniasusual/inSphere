import React, { useState } from "react";
import { useParams } from "react-router-dom";
import JamScene from "@metaverse/scenes/JamScene2";
import "@metaverse/MetaverseStyles.css";
import { useSelector } from "react-redux";
import { RootState } from "store";

export const JamPage: React.FC = () => {
  const { jamId } = useParams<{ jamId: string }>();
  const [showHeader, setShowHeader] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.user);

  if (!jamId)
    return <div className="text-white text-center p-4">Invalid Jam ID</div>;

  const handleUserInteraction = (targetUserId: string) => {
    setSelectedUser(targetUserId);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Main Scene */}
      <JamScene jamId={jamId} userId={user._id} userName={user.username} onUserInteraction={handleUserInteraction} />

      {/* User Interaction Modal */}
      {selectedUser && (
        <div className="user-modal">
          <div className="modal-header">
            <h3>User Profile</h3>
            <button className="icon-btn" onClick={() => setSelectedUser(null)}>
              <span className="material-icons">close</span>
            </button>
          </div>
          <p>You're interacting with user: {selectedUser}</p>
          <div className="modal-buttons">
            <button className="modal-btn chat">Chat Privately</button>
            <button className="modal-btn friend">Add Friend</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JamPage;

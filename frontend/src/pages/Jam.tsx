import React, { useState } from "react";
import { useParams } from "react-router-dom";
import JamScene from "@metaverse/scenes/JamScene2";
import "@metaverse/MetaverseStyles.css";

export const JamPage: React.FC = () => {
  const { jamId } = useParams<{ jamId: string }>();
  const [showHeader, setShowHeader] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  if (!jamId) return <div className="text-white text-center p-4">Invalid Jam ID</div>;

  const handleUserInteraction = (targetUserId: string) => {
    setSelectedUser(targetUserId);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Collapsible Header */}
      <div className={`header ${!showHeader ? "hidden" : ""}`}>
        <div>
          <h1>Metaverse: {jamId}</h1>
          <p>Connect and explore with others</p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            className="action-btn"
            onClick={() => {
              /* Invite friends logic */
            }}
          >
            <span className="material-icons">person_add</span>
          </button>
        </div>
      </div>

      {/* Header Toggle Button (Centered Horizontally) */}
      <button
        className={`icon-btn animate absolute top-2 left-1/2 transform -translate-x-1/2 z-10`}
        onClick={() => setShowHeader(!showHeader)}
      >
        <span className="material-icons">{showHeader ? "expand_less" : "expand_more"}</span>
      </button>

      {/* Main Scene */}
      <JamScene jamId={jamId} onUserInteraction={handleUserInteraction} />

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
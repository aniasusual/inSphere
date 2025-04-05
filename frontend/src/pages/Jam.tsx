import React, { useState } from "react";
import { useParams } from "react-router-dom";
import JamScene from "@metaverse/scenes/JamScene2";
import "@metaverse/MetaverseStyles.css";
export const JamPage: React.FC = () => {
  const { jamId } = useParams<{ jamId: string }>();
  const [showHeader, setShowHeader] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  if (!jamId) return <div>Invalid Jam ID</div>;

  const handleUserInteraction = (targetUserId: string) => {
    setSelectedUser(targetUserId);
    // Additional logic to handle user interaction
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* Collapsible header */}
      {showHeader && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4 z-10 flex justify-between items-center">
          <div>
            <h1 className="text-white text-2xl font-bold">
              Metaverse: {jamId}
            </h1>
            <p className="text-gray-300">Connect and explore with others</p>
          </div>
          <div className="flex gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              onClick={() => {
                /* Invite friends logic */
              }}
            >
              Invite Friends
            </button>
            <button
              className="bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-600"
              onClick={() => setShowHeader(false)}
            >
              <span className="material-icons">expand_less</span>
            </button>
          </div>
        </div>
      )}

      {/* Show button to reveal header when hidden */}
      {!showHeader && (
        <button
          className="absolute top-2 right-2 bg-gray-800 bg-opacity-60 text-white p-2 rounded-full z-10"
          onClick={() => setShowHeader(true)}
        >
          <span className="material-icons">expand_more</span>
        </button>
      )}

      {/* Main scene */}
      <JamScene jamId={jamId} onUserInteraction={handleUserInteraction} />

      {/* User interaction modal */}
      {selectedUser && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 p-6 rounded-lg z-20 min-w-72">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white text-xl font-bold">User Profile</h3>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setSelectedUser(null)}
            >
              <span className="material-icons">close</span>
            </button>
          </div>
          <div className="text-white">
            <p>You're interacting with user: {selectedUser}</p>
            <div className="mt-4 flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex-1">
                Chat Privately
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex-1">
                Add Friend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile collapsible help panel */}
      <div className="absolute bottom-4 right-4 md:hidden">
        <button
          className="bg-gray-800 bg-opacity-70 text-white w-12 h-12 rounded-full flex items-center justify-center"
          onClick={() => {
            /* Toggle help panel */
          }}
        >
          <span className="material-icons">help_outline</span>
        </button>
      </div>
    </div>
  );
};

export default JamPage;

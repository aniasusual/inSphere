import { useState } from "react";
import {
  Mic,
  MicOff,
  MessageSquare,
  MessageSquareOff,
  Share2,
  UserPlus,
  LogOut,
  ChevronUp,
  ChevronDown,
  MonitorX,
} from "lucide-react";

const FloatingMenu = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [voiceChat, setVoiceChat] = useState(false);
  const [textChat, setTextChat] = useState(true);
  const [screenShare, setScreenShare] = useState(false);

  // Toggle functions
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const toggleVoiceChat = () => setVoiceChat(!voiceChat);
  const toggleTextChat = () => setTextChat(!textChat);
  const toggleScreenShare = () => setScreenShare(!screenShare);

  const handleInviteUser = () => {
    // Placeholder for invite functionality
    alert("Invite user functionality would open here");
  };

  const handleLeave = () => {
    // Placeholder for leave functionality
    alert("Leave meeting functionality would trigger here");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center items-center pb-4">
      <div
        className={`bg-gray-100 rounded-full shadow-lg transition-all duration-300 ${
          isExpanded ? "px-6 py-3" : "p-2"
        }`}
      >
        {isExpanded ? (
          <div className="flex items-center space-x-4">
            {/* Voice Chat Toggle */}
            <button
              onClick={toggleVoiceChat}
              className={`p-2 rounded-full transition-all duration-200 ${
                voiceChat
                  ? "bg-blue-400 text-white"
                  : "bg-gray-300 text-gray-600"
              } hover:scale-110`}
              title={voiceChat ? "Turn voice chat off" : "Turn voice chat on"}
            >
              {voiceChat ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            {/* Text Chat Toggle */}
            <button
              onClick={toggleTextChat}
              className={`p-2 rounded-full transition-all duration-200 ${
                textChat
                  ? "bg-blue-400 text-white"
                  : "bg-gray-300 text-gray-600"
              } hover:scale-110`}
              title={textChat ? "Turn chat off" : "Turn chat on"}
            >
              {textChat ? (
                <MessageSquare size={20} />
              ) : (
                <MessageSquareOff size={20} />
              )}
            </button>

            {/* Screen Share Toggle */}
            <button
              onClick={toggleScreenShare}
              className={`p-2 rounded-full transition-all duration-200 ${
                screenShare
                  ? "bg-blue-400 text-white"
                  : "bg-gray-300 text-gray-600"
              } hover:scale-110`}
              title={screenShare ? "Stop screen sharing" : "Share your screen"}
            >
              {screenShare ? <Share2 size={20} /> : <MonitorX size={20} />}
            </button>

            {/* Invite Users */}
            <button
              onClick={handleInviteUser}
              className="p-2 rounded-full bg-gray-400 text-white transition-all duration-200 hover:scale-110"
              title="Invite users"
            >
              <UserPlus size={20} />
            </button>

            {/* Leave Button */}
            <button
              onClick={handleLeave}
              className="p-2 rounded-full bg-gray-600 text-white transition-all duration-200 hover:scale-110"
              title="Leave"
            >
              <LogOut size={20} />
            </button>

            {/* Collapse Button */}
            <button
              onClick={toggleExpand}
              className="p-2 rounded-full bg-gray-400 text-white transition-all duration-200 hover:scale-110"
              title="Collapse menu"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        ) : (
          <button
            onClick={toggleExpand}
            className="p-2 rounded-full bg-gray-400 text-white transition-all duration-200 hover:scale-110"
            title="Expand menu"
          >
            <ChevronUp size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FloatingMenu;

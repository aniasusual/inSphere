// import { useEffect } from "react";

export const AvatarCreator = () => {
  return (
    <iframe
      id="rpm-frame"
      title="Ready Player Me"
      src="https://readyplayer.me/avatar?frameApi"
      style={{
        width: "100%",
        height: "97vh",
        border: "none",
        boxSizing: "border-box",
        margin: "0",
        padding: "0",
      }}
      allow="camera *; microphone *"
    />
  );
};

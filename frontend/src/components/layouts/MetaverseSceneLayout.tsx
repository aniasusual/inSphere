import ChatBox from "@metaverse/components/ChatBox";
import FloatingMenu from "@metaverse/components/FloatingMenu";

export const MetaverseSceneLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
      <div className="absolute z-10 top-4 right-4">
        <FloatingMenu />
        {/* <ChatBox
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          userName="Your Name" // Optional
        /> */}
      </div>
      <main>{children}</main>
    </>
  );
};

import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { ensureStreamUser } from "../lib/api";
import { useStreamChat } from "../context/StreamChatContext";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

// Import the enhanced chat theme
import "../styles/chat-theme.css";

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const { chatClient, isConnected } = useStreamChat();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  useEffect(() => {
    const initChat = async () => {
      if (!chatClient || !isConnected || !authUser || !targetUserId) return;

      try {
        console.log("Initializing chat channel...");

        // Ensure the target user exists in Stream before creating channel
        console.log("Ensuring target user exists in Stream...");
        await ensureStreamUser(targetUserId);

        // Create channel ID by sorting user IDs
        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = chatClient.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat channel:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [chatClient, isConnected, authUser?._id, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="chat-container-enhanced h-full w-full" style={{ position: 'relative' }}>
        <Chat client={chatClient}>
          <Channel channel={channel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
            <Thread />
          </Channel>
        </Chat>
        {/* Video call button positioned outside Stream Chat */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 1000
        }}>
          <CallButton handleVideoCall={handleVideoCall} />
        </div>
      </div>
    </div>
  );
};
export default ChatPage;
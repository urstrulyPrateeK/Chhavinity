import { createContext, useContext, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, ensureStreamUser } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import channelWatchService from "../services/ChannelWatchService";

const StreamChatContext = createContext();

// Stream API Key with working demo fallback
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY || "8br4watd788t";

console.log("🔑 Stream API Key:", STREAM_API_KEY ? `✅ Found: ${STREAM_API_KEY}` : "❌ Missing");
console.log("🌍 Environment:", import.meta.env.MODE || "production");

export const StreamChatProvider = ({ children }) => {
  const [chatClient, setChatClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const { authUser } = useAuthUser();

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const initStreamChat = async () => {
      if (!tokenData?.token || !authUser) {
        console.log("Missing token or auth user for Stream Chat initialization");
        return;
      }

      if (chatClient && isConnected) {
        console.log("Stream Chat already connected");
        return;
      }

      try {
        console.log("Initializing global Stream Chat client...");
        
        // Create or get existing client instance
        let client = chatClient;
        if (!client) {
          client = StreamChat.getInstance(STREAM_API_KEY);
          setChatClient(client);
        }

        // Check if user is already connected
        if (client.userID === authUser._id) {
          console.log("User already connected to Stream Chat");
          setIsConnected(true);
          return;
        }

        // Disconnect any existing connection
        if (client.userID && client.userID !== authUser._id) {
          console.log("Disconnecting previous user from Stream Chat");
          await client.disconnectUser();
        }

        // Ensure user exists in Stream
        try {
          await ensureStreamUser(authUser._id);
        } catch (error) {
          console.warn("Could not ensure Stream user, continuing anyway:", error);
        }

        // Connect user
        console.log("Connecting user to Stream Chat:", authUser._id);
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        setIsConnected(true);
        setConnectionAttempts(0);
        
        console.log("✅ Global Stream Chat client connected successfully");

        // Add connection event listeners
        client.on('connection.changed', (event) => {
          console.log('Stream connection status:', event);
          setIsConnected(event.online);
        });

        client.on('connection.recovered', () => {
          console.log('Stream connection recovered');
          setIsConnected(true);
        });

        // Initialize automatic channel watching for all friends
        // This ensures notifications work immediately without opening chats first
        setTimeout(async () => {
          await channelWatchService.initializeChannelWatching(client, authUser);
        }, 1000); // Small delay to ensure connection is stable

      } catch (error) {
        console.error("❌ Error initializing global Stream Chat:", error);
        
        // Specific error handling for API key issues
        if (error.message && error.message.includes("api_key not valid")) {
          console.error("🔑 STREAM API KEY ERROR: The API key is invalid!");
          console.error("📍 Current API Key:", STREAM_API_KEY);
          console.error("📍 Environment Mode:", import.meta.env.MODE);
          console.error("📍 Expected API Key: cmudsbk7ru8y");
        }
        
        setIsConnected(false);
        
        // Retry connection up to 3 times (but not for API key errors)
        const isApiKeyError = error.message && error.message.includes("api_key not valid");
        if (connectionAttempts < 3 && !isApiKeyError) {
          console.log(`Retrying Stream Chat connection (attempt ${connectionAttempts + 1}/3)`);
          setConnectionAttempts(prev => prev + 1);
          setTimeout(() => {
            initStreamChat();
          }, 2000 * (connectionAttempts + 1)); // Exponential backoff
        } else if (isApiKeyError) {
          console.error("🚫 Not retrying due to API key error. Please check your Stream API configuration.");
        }
      }
    };

    initStreamChat();
  }, [tokenData?.token, authUser?._id, connectionAttempts]);

  // Cleanup on unmount or user change
  useEffect(() => {
    return () => {
      if (chatClient && isConnected) {
        console.log("Cleaning up Stream Chat connection...");
        channelWatchService.reset(); // Reset the watch service
        chatClient.disconnectUser().catch(error => {
          console.error("Error disconnecting Stream Chat:", error);
        });
      }
    };
  }, [authUser?._id]);

  const watchNewFriendChannel = async (friendId) => {
    if (chatClient && authUser && isConnected) {
      await channelWatchService.watchNewFriendChannel(chatClient, authUser._id, friendId);
    }
  };

  const value = {
    chatClient,
    isConnected,
    connectionAttempts,
    watchNewFriendChannel,
  };

  return (
    <StreamChatContext.Provider value={value}>
      {children}
    </StreamChatContext.Provider>
  );
};

export const useStreamChat = () => {
  const context = useContext(StreamChatContext);
  if (!context) {
    throw new Error("useStreamChat must be used within a StreamChatProvider");
  }
  return context;
};

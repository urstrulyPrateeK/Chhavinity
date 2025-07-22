import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useNotifications } from "../context/NotificationContext";
import { useStreamChat } from "../context/StreamChatContext";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import WebRTCCall from "../components/WebRTCCall";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY || "9nddtpt77s6p";

console.log("🎥 Video CallPage - Stream API Key:", STREAM_API_KEY);

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isPopupWindow, setIsPopupWindow] = useState(false);
  const [useWebRTC, setUseWebRTC] = useState(false);
  const [otherUserId, setOtherUserId] = useState(null);

  const { authUser, isLoading } = useAuthUser();
  const { endActiveCall, activeCalls } = useNotifications();
  const { chatClient } = useStreamChat();

  // Check if this is a popup window
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isPopup = urlParams.get('popup') === 'true' || !!window.opener;
    setIsPopupWindow(isPopup);
    
    // Extract other user ID from URL params if available
    const otherUser = urlParams.get('with');
    if (otherUser) {
      setOtherUserId(otherUser);
    } else {
      // Try to find other user from active calls
      Object.entries(activeCalls || {}).forEach(([userId, callInfo]) => {
        if (callInfo.callId === callId && userId !== authUser?._id) {
          setOtherUserId(userId);
        }
      });
    }
    
    if (isPopup) {
      console.log("Call page opened as popup window");
    }
  }, []);

  // Function to send call end notification
  const sendCallEndNotification = async (callId) => {
    if (!chatClient || !authUser || !callId) return;
    
    try {
      console.log("Sending call end notification for callId:", callId);
      
      // For 1-on-1 video calls, we need to find the other participant
      // We'll check the active calls state to find who this call is with
      let otherUserId = null;
      Object.entries(activeCalls).forEach(([userId, callInfo]) => {
        if (callInfo.callId === callId && userId !== authUser._id) {
          otherUserId = userId;
        }
      });
      
      if (otherUserId) {
        // Create channel ID (consistent sorting)
        const channelId = [authUser._id, otherUserId].sort().join('-');
        
        const channel = chatClient.channel('messaging', channelId);
        
        // Send call end message
        await channel.sendMessage({
          text: `📞 ${authUser.fullName} ended the video call`,
          user_id: authUser._id,
          custom: {
            type: 'call_ended',
            callId: callId,
            endedBy: authUser._id,
            endedByName: authUser.fullName,
            endedAt: new Date().toISOString()
          }
        });
        
        console.log(`Call end notification sent to user: ${otherUserId}`);
      } else {
        console.warn(`Could not find other participant for call ${callId}`);
        
        // Fallback: Try to extract from call state or send to recent channels
        const filters = { type: 'messaging', members: { $in: [authUser._id] } };
        const sort = [{ last_message_at: -1 }];
        const channelsResponse = await chatClient.queryChannels(filters, sort, { limit: 5 });
        
        // Send to the most recent channel as fallback
        if (channelsResponse.length > 0) {
          const channel = channelsResponse[0];
          await channel.sendMessage({
            text: `📞 ${authUser.fullName} ended the video call`,
            user_id: authUser._id,
            custom: {
              type: 'call_ended',
              callId: callId,
              endedBy: authUser._id,
              endedByName: authUser.fullName,
              endedAt: new Date().toISOString()
            }
          });
          console.log(`Call end notification sent to fallback channel: ${channel.id}`);
        }
      }
      
    } catch (error) {
      console.error("Error sending call end notification:", error);
    }
  };

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId) return;

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        // Try different call types in order of preference
        const callTypes = ["default", "video", "livestream", "audio_room"];
        let callInstance = null;
        let successfulCallType = null;

        for (const callType of callTypes) {
          try {
            console.log(`Trying call type: ${callType} with ID: ${callId}`);
            callInstance = videoClient.call(callType, callId);
            
            console.log(`Attempting to join call with type: ${callType}...`);
            await callInstance.join({ create: true });
            
            successfulCallType = callType;
            console.log(`Successfully joined call with type: ${callType}`);
            break;
            
          } catch (error) {
            console.error(`Failed with call type ${callType}:`, error);
            callInstance = null;
            
            // If this is the last call type, throw the error
            if (callType === callTypes[callTypes.length - 1]) {
              throw new Error(`All call types failed. Last error: ${error.message}`);
            }
          }
        }

        if (!callInstance) {
          throw new Error("Could not create call with any supported call type");
        }

        setClient(videoClient);
        setCall(callInstance);
        
        toast.success(`Connected to video call! (Type: ${successfulCallType})`);

      } catch (error) {
        console.error("Error joining call:", error);
        
        // Check if this is a Video API not enabled error
        if (error.message.includes("NOT_FOUND") || error.message.includes("404")) {
          console.log("Stream Video API not available, falling back to WebRTC");
          toast.info("Using WebRTC video calling (Stream Video not available)");
          setUseWebRTC(true);
        } else {
          toast.error("Could not join the call. Please try again.");
        }
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    // Cleanup function
    return () => {
      if (call) {
        console.log("Cleaning up call...");
        
        // Send call end notification before leaving
        sendCallEndNotification(callId);
        
        call.leave().catch(error => {
          console.error("Error leaving call:", error);
        });
      }
      if (client) {
        console.log("Cleaning up video client...");
        client.disconnectUser().catch(error => {
          console.error("Error disconnecting video client:", error);
        });
      }
      
      // End active call tracking for all users with this call ID
      if (callId && endActiveCall) {
        // Try to find which user this call was with and end tracking
        const activeCallUsers = Object.keys(localStorage).filter(key => 
          key.startsWith('activeCall_') && 
          localStorage.getItem(key) && 
          JSON.parse(localStorage.getItem(key)).callId === callId
        );
        
        activeCallUsers.forEach(key => {
          const userId = key.replace('activeCall_', '');
          endActiveCall(userId);
        });
      }
    };
  }, [tokenData, authUser, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  // Use WebRTC fallback if Stream Video failed
  if (useWebRTC) {
    return (
      <WebRTCCall 
        callId={callId}
        otherUserId={otherUserId}
        onEnd={() => {
          if (isPopupWindow || window.opener) {
            window.close();
          } else {
            window.location.href = '/';
          }
        }}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent 
                isPopupWindow={isPopupWindow} 
                callId={callId}
                sendCallEndNotification={sendCallEndNotification}
              />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-lg">Could not initialize Stream video call</p>
            <p className="text-sm opacity-70">Stream Video API might not be enabled</p>
            <button 
              onClick={() => setUseWebRTC(true)}
              className="btn btn-primary"
            >
              Try WebRTC Video Call
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              Refresh Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = ({ isPopupWindow, callId, sendCallEndNotification }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallStateHooks().useCallCallingState();

  const navigate = useNavigate();

  // Handle call end
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      toast.success("Call ended");
      
      // Send call end notification
      if (sendCallEndNotification && callId) {
        sendCallEndNotification(callId);
      }
      
      // Check if this is a popup window
      if (isPopupWindow || window.opener) {
        // This is a popup window, close it
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        // This is a regular window, navigate back to home
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    }
  }, [callingState, navigate, isPopupWindow, callId, sendCallEndNotification]);

  // Handle browser tab/window close
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Try to leave the call when user closes the tab
      try {
        // This will be handled by the call cleanup
      } catch (error) {
        console.error("Error leaving call on page unload:", error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <StreamTheme>
      <SpeakerLayout />
      <div className="relative">
        <CallControls 
          onLeave={() => {
            // Custom leave handler
            toast.success("Leaving call...");
            if (sendCallEndNotification && callId) {
              sendCallEndNotification(callId);
            }
          }}
        />
        
        {/* Custom close button for popup windows */}
        {(isPopupWindow || window.opener) && (
          <div className="absolute top-4 right-4 z-50">
            <button 
              onClick={() => {
                toast.success("Closing call window...");
                if (sendCallEndNotification && callId) {
                  sendCallEndNotification(callId);
                }
                setTimeout(() => {
                  window.close();
                }, 500);
              }}
              className="btn btn-error btn-sm gap-2"
              title="Close Call Window"
            >
              ✕ Close Window
            </button>
          </div>
        )}
      </div>
    </StreamTheme>
  );
};

export default CallPage;
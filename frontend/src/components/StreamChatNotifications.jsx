import { useEffect } from 'react';
import { useStreamChat } from '../context/StreamChatContext';
import { useNotifications } from '../context/NotificationContext';
import { showVideoCallToast, showMessageToast } from '../components/CustomToasts';
import useAuthUser from '../hooks/useAuthUser';

const StreamChatNotifications = () => {
  const { chatClient, isConnected } = useStreamChat();
  const { authUser } = useAuthUser();
  const { 
    addMessage, 
    playSound, 
    showBrowserNotification,
    startActiveCall,
    endActiveCall
  } = useNotifications();

  useEffect(() => {
    if (!chatClient || !authUser || !isConnected) return;

    console.log("Setting up Stream Chat notification listeners...");

    // Listen for new messages
    const handleNewMessage = (event) => {
      const message = event.message;
      const isCurrentUser = message.user.id === authUser._id;
      
      // Don't notify for own messages
      if (isCurrentUser) return;

      console.log("New message received:", message);

      // Handle different message types
      if ((message.custom && message.custom.type === 'video_call') || 
          (message.text && message.text.includes('📹')) ||
          (message.attachments && message.attachments.some(att => att.type === 'video_call'))) {
        // Special handling for video call messages
        console.log("Video call message detected:", message);
        
        playSound('notification');
        
        showBrowserNotification(
          `📹 Video Call from ${message.user.name}`,
          'Tap to join the video call',
          message.user.image || '/icons/icon-96x96.png'
        );

        // Extract call URL from message or custom data
        const callUrl = message.custom?.callUrl || 
                       message.call_url || 
                       (message.text && message.text.match(/https?:\/\/[^\s]+/)?.[0]) || 
                       `${window.location.origin}/call/${message.custom?.callId || 'unknown'}`;
        
        // Extract call ID
        const callId = message.custom?.callId || message.call_id || callUrl.match(/\/call\/([^\/\s]+)/)?.[1];

        // Start tracking this active call
        if (callId) {
          startActiveCall(message.user.id, callId, callUrl);
          console.log(`Started tracking video call for user ${message.user.id}, callId: ${callId}`);
        }

        // Show special video call toast
        showVideoCallToast(
          message.user.name,
          callUrl,
          message.user.image,
          () => {
            // Join the video call
            window.open(callUrl, '_blank');
          }
        );

        // Add to notification context as video call
        addMessage(message.user.id, {
          text: `📹 Video Call: ${message.user.name} is calling you`,
          timestamp: message.created_at,
          senderName: message.user.name,
          sender: {
            name: message.user.name,
            profilePic: message.user.image
          }
        }, false);
      } else if (message.custom && message.custom.type === 'call_ended') {
        // Handle call end messages
        console.log("Call end message detected:", message);
        
        const callId = message.custom.callId;
        const endedBy = message.custom.endedByName || message.user.name;
        
        // End active call tracking for both the user who ended the call AND the current user
        endActiveCall(message.user.id); // The user who ended the call
        console.log(`Cleared active call state for user who ended call: ${message.user.id}`);
        
        if (authUser && authUser._id !== message.user.id) {
          endActiveCall(authUser._id); // The current user receiving the notification
          console.log(`Cleared active call state for current user: ${authUser._id}`);
        }
        
        // Show call end notification
        showBrowserNotification(
          `📞 Call Ended`,
          `${endedBy} ended the video call`,
          message.user.image || '/icons/icon-96x96.png'
        );
        
        // Add to notification context
        addMessage(message.user.id, {
          text: `📞 ${endedBy} ended the video call`,
          timestamp: message.created_at,
          senderName: message.user.name,
          sender: {
            name: message.user.name,
            profilePic: message.user.image
          }
        }, false);
        
        console.log(`Call ended for user ${message.user.id}, callId: ${callId}`);
      } else {
        // Regular message notification
        playSound('notification');
        
        showBrowserNotification(
          `New message from ${message.user.name}`,
          message.text,
          message.user.image || '/icons/icon-96x96.png'
        );

        // Show message toast
        showMessageToast(
          message.user.name,
          message.text,
          message.user.image,
          () => {
            // Navigate to chat
            window.location.href = `/chat/${message.user.id}`;
          }
        );

        // Add to notification context
        addMessage(message.user.id, {
          text: message.text,
          timestamp: message.created_at,
          senderName: message.user.name,
          sender: {
            name: message.user.name,
            profilePic: message.user.image
          }
        }, false);
      }
    };

    // Listen for typing indicators
    const handleTypingStart = (event) => {
      if (event.user.id !== authUser._id) {
        // Handle typing start
        console.log(`${event.user.name} started typing`);
      }
    };

    const handleTypingStop = (event) => {
      if (event.user.id !== authUser._id) {
        // Handle typing stop
        console.log(`${event.user.name} stopped typing`);
      }
    };

    // Listen for call end messages or user left events
    const handleCallEnd = (event) => {
      // This could be triggered by a custom message type or user leaving
      if (event.type === 'call.ended' || (event.message && event.message.text && event.message.text.includes('left the call'))) {
        const userId = event.user?.id || event.message?.user?.id;
        if (userId && userId !== authUser._id) {
          endActiveCall(userId);
          console.log(`Call ended for user ${userId}`);
        }
      }
    };

    // Add event listeners
    chatClient.on('message.new', handleNewMessage);
    chatClient.on('typing.start', handleTypingStart);
    chatClient.on('typing.stop', handleTypingStop);
    chatClient.on('user.left', handleCallEnd);
    chatClient.on('call.ended', handleCallEnd);

    console.log("Stream Chat notification listeners added successfully");

    // Cleanup
    return () => {
      chatClient.off('message.new', handleNewMessage);
      chatClient.off('typing.start', handleTypingStart);
      chatClient.off('typing.stop', handleTypingStop);
      chatClient.off('user.left', handleCallEnd);
      chatClient.off('call.ended', handleCallEnd);
      console.log("Stream Chat notification listeners removed");
    };
  }, [chatClient, authUser, isConnected, addMessage, playSound, showBrowserNotification, startActiveCall, endActiveCall]);

  return null; // This component doesn't render anything
};

export default StreamChatNotifications;

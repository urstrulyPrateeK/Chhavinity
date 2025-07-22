import { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { showMessageToast, showFriendRequestToast } from '../components/CustomToasts';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadCounts, setUnreadCounts] = useState({}); // { userId: count }
  const [lastMessages, setLastMessages] = useState({}); // { userId: lastMessage }
  const [isTyping, setIsTyping] = useState({}); // { userId: boolean }
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [activeCalls, setActiveCalls] = useState({}); // { userId: { callId, callUrl, startedAt } }
  
  // Audio refs for different notification sounds
  const audioContext = useRef(null);
  const isAudioInitialized = useRef(false);

  // Request notification permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Initialize Web Audio API for cross-platform sound support
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Create AudioContext for better browser compatibility
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext && !audioContext.current) {
          audioContext.current = new AudioContext();
        }
        isAudioInitialized.current = true;
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    // Initialize on user interaction (required by browsers)
    const handleFirstInteraction = () => {
      if (!isAudioInitialized.current) {
        initializeAudio();
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      }
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Request permission after a short delay for better UX
      setTimeout(() => {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            // Show welcome notification
            showBrowserNotification(
              'Chhavinity Notifications Enabled! 🎉',
              'You\'ll now receive real-time message notifications',
              '/icons/icon-96x96.png',
              'welcome'
            );
          }
        });
      }, 2000);
    }
  }, []);

  const createBeep = (frequency, duration, type = 'sine', volume = 0.3) => {
    if (!audioContext.current) return;

    try {
      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.current.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);
      
      oscillator.start(audioContext.current.currentTime);
      oscillator.stop(audioContext.current.currentTime + duration);
    } catch (error) {
      console.error('Error creating beep:', error);
    }
  };

  const playSound = (type = 'message') => {
    if (!isAudioInitialized.current || !audioContext.current) return;

    try {
      // Resume audio context if suspended (Safari requirement)
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
      }

      switch (type) {
        case 'message':
          // WhatsApp-like message sound (two tone beep)
          createBeep(800, 0.15, 'sine', 0.4);
          setTimeout(() => createBeep(600, 0.15, 'sine', 0.3), 100);
          break;
        
        case 'typing':
          // Subtle typing sound
          createBeep(400, 0.08, 'square', 0.2);
          break;
        
        case 'notification':
          // Three tone notification (C-E-G chord)
          createBeep(523, 0.2, 'sine', 0.3); // C
          setTimeout(() => createBeep(659, 0.2, 'sine', 0.3), 100); // E
          setTimeout(() => createBeep(784, 0.3, 'sine', 0.3), 200); // G
          break;
        
        case 'error':
          // Error sound (descending tone)
          createBeep(400, 0.3, 'sawtooth', 0.4);
          break;
        
        case 'success':
          // Success sound (ascending tone)
          createBeep(523, 0.15, 'sine', 0.3);
          setTimeout(() => createBeep(659, 0.15, 'sine', 0.3), 75);
          setTimeout(() => createBeep(784, 0.2, 'sine', 0.3), 150);
          break;
        
        default:
          createBeep(440, 0.2, 'sine', 0.3);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const showBrowserNotification = (title, body, icon = '/icons/icon-96x96.png', tag = 'message') => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        // Truncate message for mobile notification style
        const truncatedBody = body.length > 40 ? body.substring(0, 37) + '...' : body;
        
        const notification = new Notification(title, {
          body: truncatedBody,
          icon,
          tag,
          badge: '/icons/icon-72x72.png',
          vibrate: [200, 100, 200],
          requireInteraction: false,
          silent: false, // Ensure sound plays
          actions: [
            {
              action: 'reply',
              title: 'Reply'
            },
            {
              action: 'mark-read',
              title: 'Mark as Read'
            }
          ]
        });

        // Auto close after 4 seconds (like WhatsApp)
        setTimeout(() => notification.close(), 4000);

        notification.onclick = () => {
          window.focus();
          notification.close();
          // Navigate to chat page
          window.location.href = '/';
        };

        // Handle notification actions
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.addEventListener('notificationclick', (event) => {
              event.notification.close();
              
              if (event.action === 'reply') {
                // Open chat interface
                window.focus();
                window.location.href = '/';
              } else if (event.action === 'mark-read') {
                // Mark as read
                event.notification.close();
              }
            });
          });
        }

        return notification;
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  };

  const addMessage = (userId, message, isCurrentUser = false) => {
    // Update last message
    setLastMessages(prev => ({
      ...prev,
      [userId]: {
        text: message.text || message.content,
        timestamp: message.timestamp || new Date(),
        senderName: message.senderName || message.sender?.name,
        isCurrentUser
      }
    }));

    // Only increment unread count for other users' messages
    if (!isCurrentUser) {
      setUnreadCounts(prev => ({
        ...prev,
        [userId]: (prev[userId] || 0) + 1
      }));

      // Play sound and show notification
      playSound('message');
      
      const senderName = message.senderName || message.sender?.name || 'Someone';
      const messageText = message.text || message.content || 'New message';
      
      // Mobile-style notification (shorter, more concise)
      const notificationTitle = senderName;
      const notificationBody = messageText.length > 35 ? 
        messageText.substring(0, 32) + '...' : 
        messageText;
      
      showBrowserNotification(
        notificationTitle,
        notificationBody,
        message.sender?.profilePic || '/icons/icon-96x96.png',
        `message-${userId}`
      );

      // Show toast notification (desktop style)
      showMessageToast(
        senderName,
        messageText,
        message.sender?.profilePic,
        () => {
          // Navigate to chat on reply
          window.location.href = `/chat/${userId}`;
        }
      );
    }
  };

  const markAsRead = (userId) => {
    setUnreadCounts(prev => ({
      ...prev,
      [userId]: 0
    }));
  };

  const markAllAsRead = () => {
    setUnreadCounts({});
  };

  const setUserTyping = (userId, typing) => {
    setIsTyping(prev => ({
      ...prev,
      [userId]: typing
    }));

    if (typing) {
      playSound('typing');
    }
  };

  const updateOnlineStatus = (userId, isOnline) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (isOnline) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  // Sync online status from backend data (e.g., when friends list is loaded)
  const syncOnlineStatusFromBackend = (friendsArray) => {
    if (!Array.isArray(friendsArray)) return;
    
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      friendsArray.forEach(friend => {
        if (friend.isOnline) {
          newSet.add(friend._id);
        } else {
          newSet.delete(friend._id);
        }
      });
      return newSet;
    });
    
    console.log(`🔄 Synced online status for ${friendsArray.length} friends from backend`);
  };

  const getTotalUnreadCount = () => {
    return Object.values(unreadCounts).reduce((total, count) => total + count, 0);
  };

  const getUnreadCount = (userId) => {
    return unreadCounts[userId] || 0;
  };

  const getLastMessage = (userId) => {
    return lastMessages[userId];
  };

  const isUserTyping = (userId) => {
    return isTyping[userId] || false;
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  // Active call management
  const startActiveCall = (userId, callId, callUrl) => {
    setActiveCalls(prev => ({
      ...prev,
      [userId]: {
        callId,
        callUrl,
        startedAt: new Date().toISOString()
      }
    }));
    console.log(`Started active call tracking for user ${userId} with call ID ${callId}`);
    
    // Auto-cleanup after 30 minutes
    setTimeout(() => {
      endActiveCall(userId);
    }, 30 * 60 * 1000);
  };

  const endActiveCall = (userId) => {
    setActiveCalls(prev => {
      const newCalls = { ...prev };
      delete newCalls[userId];
      return newCalls;
    });
    
    // Also clean up any localStorage entries for this user's active call
    const activeCallKey = `activeCall_${userId}`;
    if (localStorage.getItem(activeCallKey)) {
      localStorage.removeItem(activeCallKey);
      console.log(`Cleaned up localStorage for active call: ${activeCallKey}`);
    }
    
    console.log(`Ended active call tracking for user ${userId}`);
  };

  const getActiveCall = (userId) => {
    return activeCalls[userId] || null;
  };

  const isCallActive = (userId) => {
    return !!activeCalls[userId];
  };

  // Send push notification for friend requests
  const notifyFriendRequest = (senderName, senderPic) => {
    playSound('notification');
    
    showBrowserNotification(
      'Friend Request',
      `${senderName} wants to connect with you`,
      senderPic || '/icons/icon-96x96.png',
      'friend-request'
    );

    showFriendRequestToast(
      senderName,
      senderPic,
      () => {
        // Navigate to friend requests
        window.location.href = '/notifications';
      },
      () => {
        // Handle decline (could add API call here)
        console.log('Friend request declined');
      }
    );
  };

  // Send push notification for friend request accepted
  const notifyFriendAccepted = (friendName, friendPic) => {
    playSound('success');
    
    showBrowserNotification(
      'Friend Request Accepted! 🎉',
      `${friendName} is now your friend`,
      friendPic || '/icons/icon-96x96.png',
      'friend-accepted'
    );

    toast.success(`🎉 ${friendName} is now your friend!`, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: 'white',
      },
    });
  };

  const value = {
    // State
    unreadCounts,
    lastMessages,
    isTyping,
    onlineUsers,
    activeCalls,
    
    // Actions
    addMessage,
    markAsRead,
    markAllAsRead,
    setUserTyping,
    updateOnlineStatus,
    syncOnlineStatusFromBackend,
    notifyFriendRequest,
    notifyFriendAccepted,
    playSound,
    showBrowserNotification,
    startActiveCall,
    endActiveCall,
    
    // Getters
    getTotalUnreadCount,
    getUnreadCount,
    getLastMessage,
    isUserTyping,
    isUserOnline,
    getActiveCall,
    isCallActive,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

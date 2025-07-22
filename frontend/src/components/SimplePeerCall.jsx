import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useStreamChat } from '../context/StreamChatContext';
import useAuthUser from '../hooks/useAuthUser';

const SimplePeerCall = ({ callId, isPopupWindow }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const channelRef = useRef(null);
  
  const { chatClient } = useStreamChat();
  const { authUser } = useAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    initializeCall();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create a chat channel for signaling
      const channelId = `call_${callId}`;
      const channel = chatClient.channel('messaging', channelId, {
        name: `Video Call ${callId}`,
        members: [authUser._id]
      });
      
      await channel.create();
      channelRef.current = channel;

      // Set up peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      };

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream');
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setIsConnected(true);
        toast.success('Connected to video call!');
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          channel.sendMessage({
            text: 'ICE candidate',
            custom: {
              type: 'ice-candidate',
              candidate: event.candidate,
              from: authUser._id
            }
          });
        }
      };

      // Listen for signaling messages
      channel.on('message.new', handleSignalingMessage);

      // Send join message
      await channel.sendMessage({
        text: `${authUser.fullName} joined the video call`,
        custom: {
          type: 'user-joined',
          from: authUser._id,
          callId: callId
        }
      });

      setIsConnecting(false);
      toast.success('Video call ready! Share this link with others to join.');

    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Could not access camera/microphone');
      setIsConnecting(false);
    }
  };

  const handleSignalingMessage = (event) => {
    const { custom } = event.message;
    if (!custom || custom.from === authUser._id) return;

    switch (custom.type) {
      case 'user-joined':
        // Another user joined, initiate offer if we're the first user
        if (custom.from !== authUser._id) {
          createOffer();
        }
        break;
      case 'offer':
        handleOffer(custom.offer);
        break;
      case 'answer':
        handleAnswer(custom.answer);
        break;
      case 'ice-candidate':
        handleIceCandidate(custom.candidate);
        break;
    }
  };

  const createOffer = async () => {
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      channelRef.current.sendMessage({
        text: 'WebRTC offer',
        custom: {
          type: 'offer',
          offer: offer,
          from: authUser._id
        }
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (offer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      channelRef.current.sendMessage({
        text: 'WebRTC answer',
        custom: {
          type: 'answer',
          answer: answer,
          from: authUser._id
        }
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate) => {
    try {
      await peerConnectionRef.current.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    // Send end call message
    if (channelRef.current) {
      channelRef.current.sendMessage({
        text: `${authUser.fullName} ended the video call`,
        custom: {
          type: 'call-ended',
          from: authUser._id
        }
      });
    }
    
    cleanup();
    toast.success('Call ended');
    
    if (isPopupWindow || window.opener) {
      window.close();
    } else {
      navigate('/');
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    if (channelRef.current) {
      channelRef.current.off('message.new', handleSignalingMessage);
    }
  };

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg"></div>
          <p>Setting up video call...</p>
          <p className="text-sm opacity-70">ID: {callId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ display: remoteStream ? 'block' : 'none' }}
        />
        
        {/* Local Video */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white"
        />
        
        {/* Waiting for participant */}
        {!remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <div className="loading loading-spinner loading-lg mb-4"></div>
              <p className="text-xl mb-2">Waiting for other participant...</p>
              <p className="text-sm opacity-70">Call ID: {callId}</p>
              <p className="text-xs opacity-50 mt-2">Share this page URL to invite others</p>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="flex justify-center items-center gap-4 p-6 bg-gray-800">
        <button
          onClick={toggleMute}
          className={`btn btn-circle ${isMuted ? 'btn-error' : 'btn-success'}`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`btn btn-circle ${isVideoOff ? 'btn-error' : 'btn-success'}`}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isVideoOff ? '📹' : '📷'}
        </button>
        
        <button
          onClick={endCall}
          className="btn btn-error btn-circle btn-lg"
          title="End call"
        >
          📞
        </button>
      </div>
    </div>
  );
};

export default SimplePeerCall;

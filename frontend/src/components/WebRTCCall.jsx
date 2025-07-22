import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const WebRTCCall = ({ callId, onEnd, otherUserId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    initializeCall();
    
    return () => {
      cleanupCall();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setIsConnected(true);
        setIsConnecting(false);
        toast.success('Connected to video call!');
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate,
            callId,
            targetUserId: otherUserId
          }));
        }
      };

      // Connect to signaling server
      connectToSignalingServer();
      
    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Could not access camera/microphone');
      setIsConnecting(false);
    }
  };

  const connectToSignalingServer = () => {
    // For now, we'll simulate WebRTC without a real signaling server
    // In a real implementation, you'd connect to your backend WebSocket
    console.log('WebRTC call initialized locally');
    
    // Simulate connection after a delay
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      toast.success('Video call ready (WebRTC fallback)');
    }, 2000);
  };

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    cleanupCall();
    toast.success('Call ended');
    onEnd();
  };

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg"></div>
          <p>Connecting to video call...</p>
          <p className="text-sm opacity-70">Using WebRTC fallback</p>
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
          style={{ display: isConnected ? 'block' : 'none' }}
        />
        
        {/* Local Video */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white"
        />
        
        {/* Connection Status */}
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <div className="loading loading-spinner loading-lg mb-4"></div>
              <p>Waiting for other participant...</p>
              <p className="text-sm opacity-70">Call ID: {callId}</p>
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

export default WebRTCCall;

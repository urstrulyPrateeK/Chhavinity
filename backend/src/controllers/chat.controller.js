import { generateStreamToken, upsertStreamUser, getStreamClient } from "../lib/stream.js";
import User from "../models/User.js";

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function ensureStreamUser(req, res) {
  try {
    const { userId } = req.params;
    
    // Find the user in our database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create or update the user in Stream
    const streamUserData = {
      id: user._id.toString(),
      name: user.fullName,
      image: user.profilePic,
    };
    
    await upsertStreamUser(streamUserData);

    res.status(200).json({ message: "User ensured in Stream", userId: user._id });
  } catch (error) {
    console.log("Error in ensureStreamUser controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createVideoCall(req, res) {
  try {
    const { targetUserId } = req.body;
    const senderId = req.user.id;

    console.log(`Creating video call from ${senderId} to ${targetUserId}`);

    // Get both users
    const [sender, target] = await Promise.all([
      User.findById(senderId),
      User.findById(targetUserId)
    ]);

    if (!sender || !target) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure both users exist in Stream
    await Promise.all([
      upsertStreamUser({
        id: sender._id.toString(),
        name: sender.fullName,
        image: sender.profilePic,
      }),
      upsertStreamUser({
        id: target._id.toString(),
        name: target.fullName,
        image: target.profilePic,
      })
    ]);

    // Get Stream client
    const streamClient = getStreamClient();
    
    // Create a unique call ID
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create channel ID for messaging (consistent sorting)
    const channelId = [senderId, targetUserId].sort().join('-');
    
    console.log(`Creating channel: ${channelId}`);
    
    // Create/get messaging channel
    const channel = streamClient.channel('messaging', channelId, {
      members: [senderId, targetUserId],
      created_by_id: senderId
    });

    // Watch the channel to ensure it exists
    console.log('Watching channel...');
    await channel.watch({ user_id: senderId });
    console.log('Channel watched successfully');

    // Create call URL (using frontend URL for video calling page)
    const callUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/call/${callId}`;

    console.log('Sending video call message...');

    // Send the video call message with comprehensive metadata
    const message = await channel.sendMessage({
      text: `📹 ${sender.fullName} is calling you. Tap to join the video call!`,
      user_id: senderId,
      custom: {
        type: 'video_call',
        callUrl: callUrl,
        callId: callId,
        senderName: sender.fullName,
        senderId: senderId,
        targetId: targetUserId,
        createdAt: new Date().toISOString()
      },
      // Add attachments for better client detection
      attachments: [{
        type: 'video_call',
        title: `Video Call from ${sender.fullName}`,
        title_link: callUrl,
        text: 'Tap to join the video call',
        call_id: callId,
        call_url: callUrl
      }]
    });

    console.log(`Video call message sent successfully: ${message.message.id}`);

    res.status(200).json({ 
      success: true,
      message: "Video call created and invitation sent",
      callId: callId,
      callUrl: callUrl,
      messageId: message.message.id,
      channelId: channel.id
    });

  } catch (error) {
    console.error("Error in createVideoCall controller:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
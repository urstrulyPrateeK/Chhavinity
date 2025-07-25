import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import { StreamChat } from "stream-chat";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, //exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user's friends
        { isOnboarded: true },
      ],
    });
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePic proficientTechStack learningTechStack username bio location lastSeen isOnline createdAt");

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    // prevent sending req to yourself
    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // check if user is already friends
    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    // check if a req already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A friend request already exists between you and this user" });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to the other's friends array
    // $addToSet: adds elements to an array only if they do not already exist.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic proficientTechStack learningTechStack");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic proficientTechStack learningTechStack");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequestByUsername(req, res) {
  try {
    const myId = req.user.id;
    const { username } = req.params;

    // Find the recipient by username
    const recipient = await User.findOne({ username: username.toLowerCase() });
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    const recipientId = recipient._id.toString();

    // Prevent sending request to yourself
    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send friend request to yourself" });
    }

    // Check if they are already friends
    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    // Check if a request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      if (existingRequest.sender.toString() === myId) {
        return res.status(400).json({ message: "Friend request already sent" });
      } else {
        return res.status(400).json({ message: "This user has already sent you a friend request" });
      }
    }

    const newFriendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
      status: "pending",
    });

    res.status(201).json({ 
      success: true, 
      message: `Friend request sent to @${username}`,
      friendRequest: newFriendRequest 
    });
  } catch (error) {
    console.error("Error in sendFriendRequestByUsername controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function removeFriend(req, res) {
  try {
    const myId = req.user.id;
    const { friendId } = req.params;

    // Validate that the friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if they are actually friends
    const currentUser = await User.findById(myId);
    if (!currentUser.friends.includes(friendId)) {
      return res.status(400).json({ message: "You are not friends with this user" });
    }

    // Remove each user from the other's friends list
    await User.findByIdAndUpdate(myId, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: myId }
    });

    // Delete any existing friend requests between them
    await FriendRequest.deleteMany({
      $or: [
        { sender: myId, recipient: friendId },
        { sender: friendId, recipient: myId }
      ]
    });

    // Delete Stream Chat conversation between the users
    try {
      const streamClient = StreamChat.getInstance(
        process.env.STREAM_API_KEY, 
        process.env.STREAM_API_SECRET
      );

      // Create a channel ID for the conversation (consistent way to identify the channel)
      const channelId = [myId, friendId].sort().join('-');
      const channel = streamClient.channel('messaging', channelId);
      
      // Delete the channel which removes all messages
      await channel.delete();
      console.log(`Deleted Stream conversation between ${myId} and ${friendId}`);
    } catch (streamError) {
      console.log("Error deleting Stream conversation:", streamError.message);
      // Don't fail the request if Stream deletion fails
    }

    res.status(200).json({ 
      success: true,
      message: `Removed ${friend.fullName} from your friends list and deleted all conversations`
    });
  } catch (error) {
    console.error("Error in removeFriend controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Update user online status
export async function updateOnlineStatus(req, res) {
  try {
    const userId = req.user.id;
    const { isOnline } = req.body;

    const updateData = { isOnline };
    
    // If going offline, update lastSeen
    if (!isOnline) {
      updateData.lastSeen = new Date();
    }

    await User.findByIdAndUpdate(userId, updateData);
    
    res.status(200).json({ 
      success: true, 
      message: `Status updated to ${isOnline ? 'online' : 'offline'}` 
    });
  } catch (error) {
    console.error("Error in updateOnlineStatus controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Update last seen (called periodically when user is active - just confirms online status)
export async function updateLastSeen(req, res) {
  try {
    const userId = req.user.id;
    
    // Just confirm user is online, don't update lastSeen timestamp
    // lastSeen should only be updated when user goes offline
    await User.findByIdAndUpdate(userId, { 
      isOnline: true 
    });
    
    res.status(200).json({ success: true, message: "Online status confirmed" });
  } catch (error) {
    console.error("Error in updateLastSeen controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
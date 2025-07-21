import { generateStreamToken, upsertStreamUser } from "../lib/stream.js";
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
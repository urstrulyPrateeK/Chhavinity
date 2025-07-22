import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  const { email, password, fullName, username } = req.body;

  try {
    if (!email || !password || !fullName || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Username validation - simplified like Instagram
    if (username.length < 1 || username.length > 30) {
      return res.status(400).json({ message: "Username must be between 1 and 30 characters" });
    }

    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
      return res.status(400).json({ message: "Username can only contain letters, numbers, periods, and underscores" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check for existing email
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(400).json({ message: "Email already exists, please use a different one" });
    }

    // Check for existing username
    const existingUsernameUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUsernameUser) {
      return res.status(400).json({ message: "Username already taken, please choose a different one" });
    }

    const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      email,
      fullName,
      username: username.toLowerCase(),
      password,
      profilePic: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // allow cross-site in production
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the input is an email or username
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername);
    
    let user;
    if (isEmail) {
      user = await User.findOne({ email: emailOrUsername });
    } else {
      user = await User.findOne({ username: emailOrUsername.toLowerCase() });
    }

    if (!user) return res.status(401).json({ message: "Invalid email/username or password" });

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email/username or password" });

    // Set user as online
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // allow cross-site in production
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function logout(req, res) {
  try {
    // Set user as offline if they're authenticated
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        isOnline: false,
        lastSeen: new Date()
      });
    }
  } catch (error) {
    console.log("Error updating offline status during logout:", error.message);
  }
  
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    console.log("Onboarding request for user:", userId);
    console.log("Request body:", req.body);

    const { 
      fullName, 
      bio, 
      proficientTechStack, 
      learningTechStack, 
      location
    } = req.body;

    // Ensure tech stacks are arrays and handle migration from old string format
    let finalProficientTech = [];
    let finalLearningTech = [];

    // Handle proficient tech stack
    if (Array.isArray(proficientTechStack)) {
      finalProficientTech = proficientTechStack.filter(tech => tech && tech.trim());
    } else if (proficientTechStack && typeof proficientTechStack === 'string') {
      finalProficientTech = [proficientTechStack.trim()];
    }

    // Handle learning tech stack  
    if (Array.isArray(learningTechStack)) {
      finalLearningTech = learningTechStack.filter(tech => tech && tech.trim());
    } else if (learningTechStack && typeof learningTechStack === 'string') {
      finalLearningTech = [learningTechStack.trim()];
    }

    console.log("Final tech stacks:", { finalProficientTech, finalLearningTech });

    if (!fullName || !bio || finalProficientTech.length === 0 || finalLearningTech.length === 0 || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          finalProficientTech.length === 0 && "proficientTechStack",
          finalLearningTech.length === 0 && "learningTechStack",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updateData = {
      fullName,
      bio,
      proficientTechStack: finalProficientTech,
      learningTechStack: finalLearningTech,
      location,
      profilePic: req.body.profilePic || "",
      isOnboarded: true,
    };

    console.log("Update data:", updateData);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true,
        runValidators: true,
        useFindAndModify: false
      }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
    } catch (streamError) {
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export async function checkUsernameAvailability(req, res) {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: "Username is required", available: false });
    }

    if (username.length < 1 || username.length > 30) {
      return res.status(400).json({ message: "Username must be between 1 and 30 characters", available: false });
    }

    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
      return res.status(400).json({ message: "Username can only contain letters, numbers, periods, and underscores", available: false });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    
    if (existingUser) {
      return res.status(200).json({ available: false, message: "Username already taken" });
    }

    res.status(200).json({ available: true, message: "Username is available" });
  } catch (error) {
    console.error("Error checking username availability:", error);
    res.status(500).json({ message: "Internal Server Error", available: false });
  }
}

export async function searchUserByUsername(req, res) {
  try {
    const { username } = req.params;
    const currentUserId = req.user._id;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await User.findOne({ 
      username: username.toLowerCase(),
      _id: { $ne: currentUserId } // Exclude current user
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if they are already friends
    const isAlreadyFriend = user.friends.includes(currentUserId);

    res.status(200).json({ 
      success: true, 
      user: {
        ...user.toObject(),
        isAlreadyFriend
      }
    });
  } catch (error) {
    console.error("Error searching user by username:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
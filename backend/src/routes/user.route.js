import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  sendFriendRequestByUsername,
  removeFriend,
  updateOnlineStatus,
  updateLastSeen,
} from "../controllers/user.controller.js";

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.delete("/friends/:friendId", removeFriend);

router.post("/friend-request/:id", sendFriendRequest);
router.post("/friend-request/username/:username", sendFriendRequestByUsername);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

// Online status routes
router.put("/online-status", updateOnlineStatus);
router.put("/last-seen", updateLastSeen);

export default router;

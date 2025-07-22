import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken, ensureStreamUser, createVideoCall } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/ensure-user/:userId", protectRoute, ensureStreamUser);
router.post("/create-video-call", protectRoute, createVideoCall);

export default router;
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken, ensureStreamUser } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/ensure-user/:userId", protectRoute, ensureStreamUser);

export default router;
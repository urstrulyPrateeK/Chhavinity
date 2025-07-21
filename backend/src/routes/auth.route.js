import express from 'express';
import { signup, login, logout, onboard, checkUsernameAvailability, searchUserByUsername } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

router.post("/onboarding", protectRoute, onboard);

// Username availability check
router.get("/check-username/:username", checkUsernameAvailability);

// Search user by username (protected route)
router.get("/search-user/:username", protectRoute, searchUserByUsername);

// check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;

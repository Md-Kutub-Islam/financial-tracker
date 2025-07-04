import { Router } from "express";
import { registerUser, loginUser, logoutUser, getUser, updateUser } from "../controller/userAuthController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

// Public routes (no authentication required)
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Protected routes (authentication required)
router.route("/logout").post(authMiddleware, logoutUser);
router.route("/update").put(authMiddleware, updateUser);
router.route("/user").get(authMiddleware, getUser);

export default router;
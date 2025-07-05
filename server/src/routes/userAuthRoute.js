import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  refreshAccessToken,
} from "../controller/userAuthController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

// Public routes (no authentication required)
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes (authentication required)
router.route("/logout").post(authMiddleware, logoutUser);
router.route("/get-profile").get(authMiddleware, getUser);
router.route("/update-profile").put(authMiddleware, updateUser);


export default router;

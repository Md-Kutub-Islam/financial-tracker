import { verifyToken } from "../utills/jwt.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if authorization header exists and has correct format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  try {
    // Extract token from Bearer format
    const token = authHeader.split(" ")[1];

    // Verify and decode token
    const decoded = verifyToken(token);

    // Add user info to request object
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid or expired token",
    });
  }
};

export default authMiddleware;
